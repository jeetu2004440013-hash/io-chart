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
} from '@angular/core';
import { CommonModule } from '@angular/common';

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface SeriesItem {
  name: string;
  value: number;
  color: string;
}

export interface ChartOptions {
  type: 'line' | 'column' | 'pie';
  title: string;
  series: SeriesItem[];
}

// Internal computed point for line/column charts
interface ChartPoint {
  x: number;
  y: number;
  value: number;
  name: string;
  color: string;
}

// Internal computed slice for pie charts
interface PieSlice {
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

// ─── Component ───────────────────────────────────────────────────────────────

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

  // ── Computed layout dimensions ────────────────────────────────────────────
  svgWidth = 560;
  svgHeight = 340;
  readonly PADDING = { top: 30, right: 30, bottom: 50, left: 55 };

  get plotWidth(): number {
    return this.svgWidth - this.PADDING.left - this.PADDING.right;
  }
  get plotHeight(): number {
    return this.svgHeight - this.PADDING.top - this.PADDING.bottom;
  }

  // ── Derived chart data ────────────────────────────────────────────────────
  chartPoints: ChartPoint[] = [];
  pieSlices: PieSlice[] = [];
  yTicks: { value: number; y: number; label: string }[] = [];
  xTicks: { x: number; label: string }[] = [];
  linePath = '';
  areaPath = '';

  // ── Hover state ───────────────────────────────────────────────────────────
  hoveredIndex: number | null = null;
  tooltipX = 0;
  tooltipY = 0;
  tooltipVisible = false;
  tooltipName = '';
  tooltipValue = '';
  tooltipColor = '';
  hoveredSliceIndex: number | null = null;

  // ── Lifecycle ─────────────────────────────────────────────────────────────

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

  private measureAndCompute(): void {
    if (this.chartWrapper?.nativeElement) {
      const w = this.chartWrapper.nativeElement.clientWidth;
      if (w > 0) {
        this.svgWidth = w;
        this.svgHeight = Math.max(260, Math.min(420, w * 0.6));
      }
    }
    this.compute();
  }

  // ─── Core Computation ──────────────────────────────────────────────────────

  private compute(): void {
    if (!this.chartOptions?.series?.length) return;

    switch (this.chartOptions.type) {
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

  // ── Line Chart ─────────────────────────────────────────────────────────────

  private computeLineChart(): void {
    const series = this.chartOptions.series;
    const values = series.map((s) => s.value);
    const maxVal = Math.max(...values);
    const minVal = Math.min(0, Math.min(...values));

    this.yTicks = this.buildYTicks(minVal, maxVal);
    const yMax = this.yTicks[this.yTicks.length - 1]?.value ?? maxVal;
    const yMin = this.yTicks[0]?.value ?? minVal;

    const n = series.length;
    this.chartPoints = series.map((s, i) => {
      const x =
        this.PADDING.left +
        (n === 1 ? this.plotWidth / 2 : (i / (n - 1)) * this.plotWidth);
      const y =
        this.PADDING.top +
        this.plotHeight -
        ((s.value - yMin) / (yMax - yMin || 1)) * this.plotHeight;
      return { x, y, value: s.value, name: s.name, color: s.color };
    });

    this.xTicks = series.map((s, i) => ({
      x:
        this.PADDING.left +
        (n === 1 ? this.plotWidth / 2 : (i / (n - 1)) * this.plotWidth),
      label: s.name,
    }));

    // Smooth cubic bezier line
    this.linePath = this.buildSmoothPath(this.chartPoints.map((p) => [p.x, p.y]));

    // Area below line
    const firstPt = this.chartPoints[0];
    const lastPt = this.chartPoints[this.chartPoints.length - 1];
    const baseline = this.PADDING.top + this.plotHeight;
    this.areaPath =
      this.linePath +
      ` L${lastPt.x},${baseline} L${firstPt.x},${baseline} Z`;
  }

  // ── Column Chart ───────────────────────────────────────────────────────────

  private computeColumnChart(): void {
    const series = this.chartOptions.series;
    const values = series.map((s) => s.value);
    const maxVal = Math.max(...values);

    this.yTicks = this.buildYTicks(0, maxVal);
    const yMax = this.yTicks[this.yTicks.length - 1]?.value ?? maxVal;

    const n = series.length;
    const barZone = this.plotWidth / n;
    const barWidth = Math.min(barZone * 0.55, 60);

    this.chartPoints = series.map((s, i) => {
      const cx = this.PADDING.left + barZone * i + barZone / 2;
      const barH = (s.value / (yMax || 1)) * this.plotHeight;
      const y = this.PADDING.top + this.plotHeight - barH;
      return { x: cx, y, value: s.value, name: s.name, color: s.color };
    });

    this.xTicks = this.chartPoints.map((p) => ({ x: p.x, label: p.name }));
    (this as any)._barWidth = barWidth;
  }

  get barWidth(): number {
    return (this as any)._barWidth ?? 40;
  }

  get barHeight(): ((p: ChartPoint) => number) {
    return (p: ChartPoint) =>
      this.PADDING.top + this.plotHeight - p.y;
  }

  // ── Pie Chart ──────────────────────────────────────────────────────────────

  private computePieChart(): void {
    const series = this.chartOptions.series;
    const total = series.reduce((s, d) => s + d.value, 0);

    const cx = this.svgWidth / 2;
    const cy = this.svgHeight / 2;
    const r = Math.min(this.svgWidth, this.svgHeight) * 0.33;
    const innerR = r * 0.42; // donut hole

    let angle = -Math.PI / 2;
    this.pieSlices = series.map((s) => {
      const pct = s.value / (total || 1);
      const start = angle;
      const end = angle + pct * 2 * Math.PI;
      const midAngle = (start + end) / 2;
      const labelR = r * 0.72;

      const path = this.buildDonutSlicePath(cx, cy, innerR, r, start, end);

      angle = end;
      return {
        name: s.name,
        value: s.value,
        color: s.color,
        percentage: Math.round(pct * 100),
        startAngle: start,
        endAngle: end,
        path,
        labelX: cx + Math.cos(midAngle) * labelR,
        labelY: cy + Math.sin(midAngle) * labelR,
      };
    });
  }

  // ─── SVG Path Helpers ──────────────────────────────────────────────────────

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

  private buildDonutSlicePath(
    cx: number,
    cy: number,
    innerR: number,
    outerR: number,
    startAngle: number,
    endAngle: number
  ): string {
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

  // ─── Y-Axis Ticks ──────────────────────────────────────────────────────────

  private buildYTicks(
    minVal: number,
    maxVal: number
  ): { value: number; y: number; label: string }[] {
    const range = maxVal - minVal || 1;
    const step = this.niceStep(range / 5);
    const start = Math.floor(minVal / step) * step;
    const ticks: { value: number; y: number; label: string }[] = [];
    const niceMax = Math.ceil(maxVal / step) * step;

    for (let v = start; v <= niceMax + step * 0.01; v = Math.round((v + step) * 1e9) / 1e9) {
      const y =
        this.PADDING.top +
        this.plotHeight -
        ((v - start) / (niceMax - start || 1)) * this.plotHeight;
      ticks.push({ value: v, y, label: this.formatValue(v) });
      if (ticks.length > 8) break;
    }
    return ticks;
  }

  private niceStep(rough: number): number {
    const pow = Math.pow(10, Math.floor(Math.log10(rough)));
    const f = rough / pow;
    if (f <= 1) return pow;
    if (f <= 2) return 2 * pow;
    if (f <= 5) return 5 * pow;
    return 10 * pow;
  }

  formatValue(v: number): string {
    if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
    if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(1) + 'K';
    return v % 1 === 0 ? String(v) : v.toFixed(1);
  }

  // ─── Tooltip ───────────────────────────────────────────────────────────────

  onPointEnter(index: number, event: MouseEvent): void {
    this.hoveredIndex = index;
    const pt = this.chartPoints[index];
    this.tooltipName = pt.name;
    this.tooltipValue = this.formatValue(pt.value);
    this.tooltipColor = pt.color;
    this.updateTooltipPos(event);
    this.tooltipVisible = true;
  }

  onPointLeave(): void {
    this.hoveredIndex = null;
    this.tooltipVisible = false;
  }

  onSliceEnter(index: number, event: MouseEvent): void {
    this.hoveredSliceIndex = index;
    const sl = this.pieSlices[index];
    this.tooltipName = sl.name;
    this.tooltipValue = `${this.formatValue(sl.value)} (${sl.percentage}%)`;
    this.tooltipColor = sl.color;
    this.updateTooltipPos(event);
    this.tooltipVisible = true;
  }

  onSliceLeave(): void {
    this.hoveredSliceIndex = null;
    this.tooltipVisible = false;
  }

  onMouseMove(event: MouseEvent): void {
    if (this.tooltipVisible) this.updateTooltipPos(event);
  }

  private updateTooltipPos(event: MouseEvent): void {
    const rect = (event.currentTarget as SVGElement)
      .closest('.chart-wrapper')
      ?.getBoundingClientRect();
    if (rect) {
      this.tooltipX = event.clientX - rect.left + 12;
      this.tooltipY = event.clientY - rect.top - 36;
    }
  }

  // ─── Helpers for template ──────────────────────────────────────────────────

  trackByIndex(_: number, __: unknown): number {
    return _;
  }

  pieCenterX(): number {
    return this.svgWidth / 2;
  }
  pieCenterY(): number {
    return this.svgHeight / 2;
  }
  pieRadius(): number {
    return Math.min(this.svgWidth, this.svgHeight) * 0.33;
  }
  pieTotal(): number {
    return this.chartOptions?.series?.reduce((s, d) => s + d.value, 0) ?? 0;
  }

  sliceTransform(index: number): string {
    if (this.hoveredSliceIndex !== index) return '';
    const sl = this.pieSlices[index];
    const mid = (sl.startAngle + sl.endAngle) / 2;
    const dx = Math.cos(mid) * 8;
    const dy = Math.sin(mid) * 8;
    return `translate(${dx}, ${dy})`;
  }
}
