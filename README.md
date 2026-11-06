# io-chart — Enterprise Custom Angular SVG Chart Engine

A high-performance, presentation-ready custom Angular chart engine that renders **Line & Area**, **Column & Bar**, and **Donut / Pie** charts from a single intuitive configuration object — built with **100% pure SVG, TypeScript, and SCSS**. Zero external chart libraries.

---

## ⚡ Quick Start

```bash
npm install
npm start        # ng serve → http://localhost:4200
npm run build    # production build
```

---

## 🚀 Key Highlights

- 💎 **Zero External Dependencies**: No D3, Chart.js, or Highcharts. Saves **~500KB+** in bundle weight.
- 📐 **Bézier & Arc Trigonometry**: Smooth cubic-bezier S-curves (`C cpx0,y0 cpx1,y1 x,y`) and precise donut trigonometry.
- 🎯 **Target & Benchmark Lines**: Dynamic threshold lines with custom badge labels.
- 📡 **Real-time Telemetry Simulation**: Built-in live data streaming demo with pulsing indicators.
- 🎛️ **Interactive Studio & Playground**: Reactive parameter configurator with live Angular code snippet generation.
- 🎨 **Enterprise Theming**: Native Obsidian Dark Mode and Crisp Executive Light Mode.
- 🔍 **Interactive Crosshairs & Glass Tooltips**: Snapping vertical guide cursor, dot halos, and percentage change indicators.
- 💾 **1-Click SVG Vector Export**: Export production-grade vector charts directly for slides or reports.
- 📊 **Executive KPI Bar**: Summary cards with progress sparklines and peak metrics.
- 🎤 **Presenter Deck View**: Dedicated architecture slide view designed for team presentations and technical interviews.

---

## 💻 Usage

```ts
import { ChartComponent, ChartOptions } from './chart/chart.component';

@Component({
  standalone: true,
  imports: [ChartComponent],
  template: `<io-chart [chartOptions]="options"></io-chart>`
})
export class MyComponent {
  options: ChartOptions = {
    type: 'line',                          // 'line' | 'column' | 'pie'
    title: 'Monthly Recurring Revenue',
    subtitle: 'Fiscal 2026 Performance',
    unit: '$',
    unitPosition: 'prefix',                // 'prefix' | 'suffix'
    targetValue: 80000,                    // Optional benchmark line
    targetLabel: 'Q2 Target',
    showGrid: true,
    showArea: true,
    curveType: 'smooth',                   // 'smooth' | 'straight'
    series: [
      { name: 'Jan', value: 42000, color: '#6366f1' },
      { name: 'Feb', value: 58000, color: '#6366f1' },
      { name: 'Mar', value: 71000, color: '#6366f1' },
    ],
  };
}
```

### ChartOptions Interface

```ts
export interface SeriesItem {
  name: string;
  value: number;
  color?: string;
  formattedValue?: string;
  change?: string;                         // e.g. "+14.2%"
}

export interface ChartOptions {
  type: 'line' | 'column' | 'pie';
  title: string;
  subtitle?: string;
  series: SeriesItem[];
  unit?: string;                           // e.g. '$', 'ms', 'units'
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
```

---

## 📊 Chart Types

| Type | Description |
|---|---|
| `line` | Smooth cubic-bezier curve with neon area gradient, target benchmark line, snapping crosshair guide, and dot pulse halos |
| `column` | Modern rounded bars with background depth tracks, gradient sheen, value labels, and hover glow |
| `pie` | Donut chart with dynamic center stats (shows hovered slice label & % or total when idle), slice vector pop-out, and progress breakdown legend |

---

## 🏗️ Technical Approach

### 1. Pure SVG Math & ViewBox
All charts are rendered as responsive inline SVGs with dynamic `viewBox` calculations, avoiding canvas pixelation and external abstraction layers.

### 2. Line Smoothing Algorithm
The line chart computes cubic-bezier segments using midpoint horizontal control points:
$$cpx = \frac{x_0 + x_1}{2}$$
$$d = \dots \text{ C } cpx,y_0 \quad cpx,y_1 \quad x_1,y_1$$
This delivers smooth S-curves without overshoot or oscillations.

### 3. "Nice" Step Axis Algorithm
Generates human-readable Y-axis intervals (1, 2, 5, 10 × $10^k$) with automatic scale formatting (K, M).

### 4. High-Performance Angular Architecture
Standalone components with `ChangeDetectionStrategy.OnPush`, sub-millisecond recalculation on live streams, and zero memory leaks.

---

## 📝 License

MIT
# io-chart
