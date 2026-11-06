import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  HostListener,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

// ─── Public Interfaces ────────────────────────────────────────────────────────

export interface SeriesItem {
  name: string;
  value: number;
  color?: string;
  formattedValue?: string;
  change?: string; // e.g. "+12.4%"
}

export interface ChartOptions {
  type: 'line' | 'column' | 'pie';
  title: string;
  subtitle?: string;
  series: SeriesItem[];
  unit?: string;           // e.g. '$', 'K', 'req/s'
  unitPosition?: 'prefix' | 'suffix';
  height?: number;
  showGrid?: boolean;
  showArea?: boolean;
  showDots?: boolean;
  curveType?: 'smooth' | 'straight';
  targetValue?: number;
  targetLabel?: string;
  theme?: 'dark' | 'light' | 'midnight';
  showControls?: boolean;
}

// ─── Internal Structures ──────────────────────────────────────────────────────

export interface ChartPoint {
  index: number;
  x: number;
  y: number;
  value: number;
  name: string;
  color: string;
  change?: string;
  pctOfTotal?: number;
}

export interface PieSlice {
  index: number;
  name: string;
  value: number;
  color: string;
  percentage: number;
  startAngle: number;
  endAngle: number;
  path: string;
  labelX: number;
  labelY: number;
}

// ─── Component Implementation ─────────────────────────────────────────────────

@Component({
  selector: 'io-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent implements OnChanges, AfterViewInit {
  @Input() chartOptions!: ChartOptions;
  @ViewChild('chartWrapper') chartWrapper!: ElementRef<HTMLDivElement>;

  // Runtime type override (for quick switching via toolbar controls)
  activeTypeOverride: 'line' | 'column' | 'pie' | null = null;

  // Palette default fallback colors
  private readonly defaultColors = [
    '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6',
    '#8b5cf6', '#06b6d4', '#f97316', '#14b8a6', '#e11d48'
  ];

  // ── Layout dimensions ───────────────────────────────────────────────────────
  svgWidth = 560;
  svgHeight = 320;
  readonly PADDING = { top: 32, right: 28, bottom: 44, left: 56 };

  get plotWidth(): number {
    return Math.max(10, this.svgWidth - this.PADDING.left - this.PADDING.right);
  }

  get plotHeight(): number {
    return Math.max(10, this.svgHeight - this.PADDING.top - this.PADDING.bottom);
  }

  // ── Derived chart computed data ─────────────────────────────────────────────
  chartPoints: ChartPoint[] = [];
  pieSlices: PieSlice[] = [];
  yTicks: { value: number; y: number; label: string }[] = [];
  xTicks: { x: number; label: string }[] = [];
  linePath = '';
  areaPath = '';
  barWidth = 36;
  targetY: number | null = null;

  // ── Hover / Interactive state ───────────────────────────────────────────────
  hoveredIndex: number | null = null;
  hoveredSliceIndex: number | null = null;
  crosshairX: number | null = null;
  tooltipX = 0;
  tooltipY = 0;
  tooltipVisible = false;
  tooltipTitle = '';
  tooltipValue = '';
  tooltipColor = '';
  tooltipSubtext = '';

  constructor(private cdr: ChangeDetectorRef) {}

  // ── Lifecycle Hooks ─────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    this.measureAndCompute();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.measureAndCompute();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chartOptions']) {
      this.measureAndCompute();
    }
  }

  // ── Computed Accessors ──────────────────────────────────────────────────────

  get currentType(): 'line' | 'column' | 'pie' {
    return this.activeTypeOverride || this.chartOptions?.type || 'line';
  }

  get showControls(): boolean {
    return this.chartOptions?.showControls ?? true;
  }

  get showGrid(): boolean {
    return this.chartOptions?.showGrid ?? true;
  }

  get showArea(): boolean {
    return this.chartOptions?.showArea ?? true;
  }

  get showDots(): boolean {
    return this.chartOptions?.showDots ?? true;
  }

  get primaryColor(): string {
    return this.chartPoints[0]?.color || this.defaultColors[0];
  }

  get totalValue(): number {
    return (this.chartOptions?.series || []).reduce((acc, curr) => acc + (curr.value || 0), 0);
  }

  get averageValue(): number {
    const s = this.chartOptions?.series || [];
    return s.length > 0 ? this.totalValue / s.length : 0;
  }

  get peakPoint(): ChartPoint | null {
    if (!this.chartPoints.length) return null;
    return this.chartPoints.reduce((max, p) => (p.value > max.value ? p : max), this.chartPoints[0]);
  }

  get activeSlice(): PieSlice | null {
    if (this.hoveredSliceIndex === null) return null;
    return this.pieSlices[this.hoveredSliceIndex] ?? null;
  }

  // ── Sizing and Computation ──────────────────────────────────────────────────

  private measureAndCompute(): void {
    if (this.chartWrapper?.nativeElement) {
      const w = this.chartWrapper.nativeElement.clientWidth;
      if (w > 0) {
        this.svgWidth = w;
        if (this.chartOptions?.height) {
          this.svgHeight = this.chartOptions.height;
        } else {
          this.svgHeight = Math.max(260, Math.min(380, Math.round(w * 0.52)));
        }
      }
    }
    this.compute();
    this.cdr.markForCheck();
  }

  compute(): void {
    if (!this.chartOptions?.series?.length) return;

    switch (this.currentType) {
      case 'line':
        this.computeLineChart();
        break;
      case 'column':
        this.computeColumnChart();
        break;
      case 'pie':
        this.computePieChart();
        break;
    }
  }

  // ── Line Chart Engine ───────────────────────────────────────────────────────

  private computeLineChart(): void {
    const series = this.chartOptions.series;
    const values = series.map((s) => s.value);
    let maxVal = Math.max(...values);
    let minVal = Math.min(...values);

    if (this.chartOptions.targetValue !== undefined) {
      maxVal = Math.max(maxVal, this.chartOptions.targetValue);
      minVal = Math.min(minVal, this.chartOptions.targetValue);
    }

    // Default lower baseline to 0 if minVal is close to 0 or positive
    const zeroBaseline = minVal > 0 ? 0 : minVal;
    this.yTicks = this.buildYTicks(zeroBaseline, maxVal);

    const yMax = this.yTicks[this.yTicks.length - 1]?.value ?? maxVal;
    const yMin = this.yTicks[0]?.value ?? zeroBaseline;
    const range = yMax - yMin || 1;

    const n = series.length;
    const total = this.totalValue;

    this.chartPoints = series.map((s, i) => {
      const x =
        this.PADDING.left +
        (n <= 1 ? this.plotWidth / 2 : (i / (n - 1)) * this.plotWidth);
      const y =
        this.PADDING.top +
        this.plotHeight -
        ((s.value - yMin) / range) * this.plotHeight;
      const color = s.color || this.defaultColors[i % this.defaultColors.length];

      // Delta percentage calculation compared to previous point
      let change: string | undefined = s.change;
      if (!change && i > 0) {
        const prev = series[i - 1].value;
        if (prev !== 0) {
          const delta = ((s.value - prev) / Math.abs(prev)) * 100;
          change = `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
        }
      }

      const pctOfTotal = total > 0 ? (s.value / total) * 100 : 0;

      return {
        index: i,
        x,
        y,
        value: s.value,
        name: s.name,
        color,
        change,
        pctOfTotal,
      };
    });

    this.xTicks = this.chartPoints.map((p) => ({ x: p.x, label: p.name }));

    // Target benchmark line Y
    if (this.chartOptions.targetValue !== undefined) {
      this.targetY =
        this.PADDING.top +
        this.plotHeight -
        ((this.chartOptions.targetValue - yMin) / range) * this.plotHeight;
    } else {
      this.targetY = null;
    }

    // Path calculation
    const pts: [number, number][] = this.chartPoints.map((p) => [p.x, p.y]);
    if (this.chartOptions.curveType === 'straight') {
      this.linePath = this.buildStraightPath(pts);
    } else {
      this.linePath = this.buildSmoothPath(pts);
    }

    // Area fill path
    if (this.chartPoints.length > 0) {
      const firstPt = this.chartPoints[0];
      const lastPt = this.chartPoints[this.chartPoints.length - 1];
      const baseline = this.PADDING.top + this.plotHeight;
      this.areaPath = `${this.linePath} L${lastPt.x},${baseline} L${firstPt.x},${baseline} Z`;
    }
  }

  // ── Column Chart Engine ─────────────────────────────────────────────────────

  private computeColumnChart(): void {
    const series = this.chartOptions.series;
    const values = series.map((s) => s.value);
    let maxVal = Math.max(...values, 0);

    if (this.chartOptions.targetValue !== undefined) {
      maxVal = Math.max(maxVal, this.chartOptions.targetValue);
    }

    this.yTicks = this.buildYTicks(0, maxVal);
    const yMax = this.yTicks[this.yTicks.length - 1]?.value ?? maxVal;
    const range = yMax || 1;

    const n = series.length;
    const barZone = this.plotWidth / n;
    this.barWidth = Math.max(14, Math.min(barZone * 0.56, 52));
    const total = this.totalValue;

    this.chartPoints = series.map((s, i) => {
      const cx = this.PADDING.left + barZone * i + barZone / 2;
      const barH = (s.value / range) * this.plotHeight;
      const y = this.PADDING.top + this.plotHeight - barH;
      const color = s.color || this.defaultColors[i % this.defaultColors.length];
      const pctOfTotal = total > 0 ? (s.value / total) * 100 : 0;

      return {
        index: i,
        x: cx,
        y,
        value: s.value,
        name: s.name,
        color,
        pctOfTotal,
      };
    });

    this.xTicks = this.chartPoints.map((p) => ({ x: p.x, label: p.name }));

    if (this.chartOptions.targetValue !== undefined) {
      this.targetY =
        this.PADDING.top +
        this.plotHeight -
        (this.chartOptions.targetValue / range) * this.plotHeight;
    } else {
      this.targetY = null;
    }
  }

  getBarHeight(p: ChartPoint): number {
    return Math.max(2, this.PADDING.top + this.plotHeight - p.y);
  }

  getBarTrackHeight(): number {
    return this.plotHeight;
  }

  // ── Donut / Pie Chart Engine ────────────────────────────────────────────────

  private computePieChart(): void {
    const series = this.chartOptions.series;
    const total = this.totalValue || 1;

    const cx = this.pieCenterX();
    const cy = this.pieCenterY();
    const r = this.pieRadius();
    const innerR = r * 0.58; // Modern donut hole proportion

    let angle = -Math.PI / 2;

    this.pieSlices = series.map((s, i) => {
      const pct = (s.value || 0) / total;
      const sweepAngle = pct * 2 * Math.PI;
      const start = angle;
      const end = angle + sweepAngle;
      const midAngle = (start + end) / 2;
      const labelR = r * 0.78;
      const color = s.color || this.defaultColors[i % this.defaultColors.length];

      const path = this.buildDonutSlicePath(cx, cy, innerR, r, start, end);
      angle = end;

      return {
        index: i,
        name: s.name,
        value: s.value,
        color,
        percentage: Math.round(pct * 100),
        startAngle: start,
        endAngle: end,
        path,
        labelX: cx + Math.cos(midAngle) * labelR,
        labelY: cy + Math.sin(midAngle) * labelR,
      };
    });
  }

  // ── SVG Path Computation Helpers ────────────────────────────────────────────

  private buildSmoothPath(pts: [number, number][]): string {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;

    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const cpx = (x0 + x1) / 2;
      d += ` C${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
    }
    return d;
  }

  private buildStraightPath(pts: [number, number][]): string {
    if (pts.length === 0) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]},${p[1]}`).join(' ');
  }

  private buildDonutSlicePath(
    cx: number,
    cy: number,
    innerR: number,
    outerR: number,
    startAngle: number,
    endAngle: number
  ): string {
    // If slice spans essentially 360 degrees (single item)
    if (endAngle - startAngle >= 2 * Math.PI - 0.0001) {
      endAngle = startAngle + 2 * Math.PI - 0.0001;
    }

    const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

    const x1 = cx + Math.cos(startAngle) * outerR;
    const y1 = cy + Math.sin(startAngle) * outerR;
    const x2 = cx + Math.cos(endAngle) * outerR;
    const y2 = cy + Math.sin(endAngle) * outerR;
    const x3 = cx + Math.cos(endAngle) * innerR;
    const y3 = cy + Math.sin(endAngle) * innerR;
    const x4 = cx + Math.cos(startAngle) * innerR;
    const y4 = cy + Math.sin(startAngle) * innerR;

    return [
      `M${x1},${y1}`,
      `A${outerR},${outerR} 0 ${largeArc} 1 ${x2},${y2}`,
      `L${x3},${y3}`,
      `A${innerR},${innerR} 0 ${largeArc} 0 ${x4},${y4}`,
      'Z',
    ].join(' ');
  }

  // ── Y-Axis Algorithm ────────────────────────────────────────────────────────

  private buildYTicks(
    minVal: number,
    maxVal: number
  ): { value: number; y: number; label: string }[] {
    const range = Math.max(1, maxVal - minVal);
    const step = this.niceStep(range / 4);
    const start = Math.floor(minVal / step) * step;
    const niceMax = Math.ceil(maxVal / step) * step;
    const ticks: { value: number; y: number; label: string }[] = [];

    const totalSteps = Math.max(1, Math.round((niceMax - start) / step));
    for (let i = 0; i <= totalSteps; i++) {
      const v = start + i * step;
      const y =
        this.PADDING.top +
        this.plotHeight -
        ((v - start) / (niceMax - start || 1)) * this.plotHeight;
      ticks.push({ value: v, y, label: this.formatValue(v) });
      if (ticks.length > 7) break;
    }
    return ticks;
  }

  private niceStep(rough: number): number {
    const pow = Math.pow(10, Math.floor(Math.log10(Math.max(1e-6, rough))));
    const f = rough / pow;
    if (f <= 1) return pow;
    if (f <= 2) return 2 * pow;
    if (f <= 5) return 5 * pow;
    return 10 * pow;
  }

  formatValue(v: number): string {
    const unit = this.chartOptions?.unit || '';
    const pos = this.chartOptions?.unitPosition || 'prefix';
    let formatted = '';

    if (Math.abs(v) >= 1_000_000) {
      formatted = (v / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (Math.abs(v) >= 1_000) {
      formatted = (v / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else {
      formatted = v % 1 === 0 ? String(v) : v.toFixed(1);
    }

    if (unit) {
      return pos === 'prefix' ? `${unit}${formatted}` : `${formatted} ${unit}`;
    }
    return formatted;
  }

  // ── Hover & Mouse Events ────────────────────────────────────────────────────

  onSvgMouseMove(event: MouseEvent): void {
    if (this.currentType === 'pie') return;

    const rect = this.chartWrapper?.nativeElement?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Find closest point by horizontal X distance
    if (this.chartPoints.length > 0) {
      let closestIdx = 0;
      let minDiff = Infinity;

      for (let i = 0; i < this.chartPoints.length; i++) {
        const diff = Math.abs(this.chartPoints[i].x - mouseX);
        if (diff < minDiff) {
          minDiff = diff;
          closestIdx = i;
        }
      }

      this.hoveredIndex = closestIdx;
      const pt = this.chartPoints[closestIdx];
      this.crosshairX = pt.x;

      this.tooltipTitle = pt.name;
      this.tooltipValue = this.formatValue(pt.value);
      this.tooltipColor = pt.color;
      this.tooltipSubtext = pt.change
        ? `${pt.change} vs prior`
        : pt.pctOfTotal ? `${pt.pctOfTotal.toFixed(1)}% of total` : '';

      // Position tooltip safely within container bounds
      this.tooltipX = Math.min(Math.max(10, pt.x - 70), this.svgWidth - 150);
      this.tooltipY = Math.max(10, pt.y - 68);
      this.tooltipVisible = true;
      this.cdr.markForCheck();
    }
  }

  onSvgMouseLeave(): void {
    if (this.currentType !== 'pie') {
      this.hoveredIndex = null;
      this.crosshairX = null;
      this.tooltipVisible = false;
      this.cdr.markForCheck();
    }
  }

  onPointEnter(index: number, event: MouseEvent): void {
    this.hoveredIndex = index;
    const pt = this.chartPoints[index];
    this.crosshairX = pt.x;
    this.tooltipTitle = pt.name;
    this.tooltipValue = this.formatValue(pt.value);
    this.tooltipColor = pt.color;
    this.tooltipSubtext = pt.change ? `${pt.change} vs prior` : '';
    this.updateTooltipPos(event);
    this.tooltipVisible = true;
    this.cdr.markForCheck();
  }

  onSliceEnter(index: number, event: MouseEvent): void {
    this.hoveredSliceIndex = index;
    const sl = this.pieSlices[index];
    this.tooltipTitle = sl.name;
    this.tooltipValue = `${this.formatValue(sl.value)} (${sl.percentage}%)`;
    this.tooltipColor = sl.color;
    this.tooltipSubtext = `Share: ${sl.percentage}%`;
    this.updateTooltipPos(event);
    this.tooltipVisible = true;
    this.cdr.markForCheck();
  }

  onSliceLeave(): void {
    this.hoveredSliceIndex = null;
    this.tooltipVisible = false;
    this.cdr.markForCheck();
  }

  private updateTooltipPos(event: MouseEvent): void {
    const rect = this.chartWrapper?.nativeElement?.getBoundingClientRect();
    if (rect) {
      const x = event.clientX - rect.left + 14;
      const y = event.clientY - rect.top - 48;
      this.tooltipX = Math.min(Math.max(10, x), this.svgWidth - 150);
      this.tooltipY = Math.max(10, y);
    }
  }

  // ── Toolbar Actions ─────────────────────────────────────────────────────────

  setChartType(type: 'line' | 'column' | 'pie'): void {
    this.activeTypeOverride = type;
    this.compute();
    this.cdr.markForCheck();
  }

  exportSvg(): void {
    const svgEl = this.chartWrapper?.nativeElement?.querySelector('svg');
    if (!svgEl) return;

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svgEl);

    // Ensure svg namespace is defined
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
      source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${(this.chartOptions.title || 'chart').toLowerCase().replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);
  }

  // ── Template Computation Helpers ────────────────────────────────────────────

  trackByIndex(index: number): number {
    return index;
  }

  pieCenterX(): number {
    return this.svgWidth / 2;
  }

  pieCenterY(): number {
    return this.svgHeight / 2;
  }

  pieRadius(): number {
    return Math.min(this.svgWidth, this.svgHeight) * 0.35;
  }

  sliceTransform(index: number): string {
    if (this.hoveredSliceIndex !== index) return '';
    const sl = this.pieSlices[index];
    const mid = (sl.startAngle + sl.endAngle) / 2;
    const dx = Math.cos(mid) * 10;
    const dy = Math.sin(mid) * 10;
    return `translate(${dx.toFixed(2)}, ${dy.toFixed(2)})`;
  }
}
