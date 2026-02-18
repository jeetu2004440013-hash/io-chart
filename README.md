# io-chart — Custom Angular Chart Component

A fully custom, reusable Angular chart component that renders **Line**, **Column**, and **Pie/Donut** charts from a single configuration object — built with pure SVG, TypeScript, and SCSS. Zero external chart libraries.

---

## Quick Start

```bash
npm install
npm start        # ng serve → http://localhost:4200
npm run build    # production build
```

---

## Usage

```ts
import { ChartComponent, ChartOptions } from './chart/chart.component';

@Component({
  imports: [ChartComponent],
  template: `<io-chart [chartOptions]="options"></io-chart>`
})
export class MyComponent {
  options: ChartOptions = {
    type: 'line',          // 'line' | 'column' | 'pie'
    title: 'Sales Report',
    series: [
      { name: 'Offline', value: 30, color: 'red'  },
      { name: 'Online',  value: 70, color: 'blue' },
    ],
  };
}
```

### ChartOptions Interface

```ts
interface ChartOptions {
  type:   'line' | 'column' | 'pie';
  title:  string;
  series: { name: string; value: number; color: string }[];
}
```

---

## Chart Types

| Type     | Description                                                        |
|----------|--------------------------------------------------------------------|
| `line`   | Smooth cubic-bezier curve with area fill, axes, and grid lines     |
| `column` | Animated vertical bars with gradient fill and value labels         |
| `pie`    | Donut chart with percentage labels, center total, and slice pop    |

---

## Features

- ✅ **Purely SVG-based** — no Canvas, no external libraries
- ✅ **Fully responsive** — resizes with `HostListener('window:resize')`
- ✅ **Animated** — entry animations on all chart types (`@keyframes`)
- ✅ **Interactive hover** — tooltips + highlighted states on every chart
- ✅ **Legend** — synced with hover state
- ✅ **Smart Y-axis ticks** — "nice" step algorithm, auto K/M formatting
- ✅ **Smooth line** — cubic bezier path, not jagged polyline
- ✅ **Donut centre total** — total value displayed in the donut hole
- ✅ **Standalone component** — Angular 17+, no NgModule needed
- ✅ **`OnPush` change detection** — performant by default

---

## Project Structure

```
src/
└── app/
    ├── app.component.ts          # Demo host with three chart examples
    ├── app.config.ts             # ApplicationConfig (standalone)
    └── chart/
        ├── chart.component.ts    # Component logic & SVG computation
        ├── chart.component.html  # SVG template (line / column / pie)
        └── chart.component.scss  # Design tokens + all styles
```

---

## Technical Approach

### SVG Rendering
All charts are rendered as inline SVG, calculated entirely in TypeScript. The component exposes clean computed properties (`chartPoints`, `pieSlices`, `linePath`, `areaPath`, `yTicks`, `xTicks`) that the template binds to with `*ngFor` and `[attr.*]` directives.

### Responsive Layout
A `@ViewChild` ref on the wrapper `<div>` is read in `ngAfterViewInit` and on every `window:resize` event. The SVG `viewBox` is recalculated so charts always fill their container width without distortion.

### Line Smoothing
The line path uses **cubic bezier** segments (SVG `C` commands) with control points at the horizontal midpoint between each pair of data points — producing smooth S-curves without overshoot.

### Y-Axis "Nice" Steps
A `niceStep(rough)` function rounds the raw range / 5 to the nearest 1, 2, 5, or 10 × power-of-ten, producing clean axis values (e.g. `0, 20, 40, 60` instead of `0, 17.6, 35.2…`).

### Hover & Tooltip
Each data point / bar has a larger transparent `hit-area` circle for easy mousing. Tooltip position is computed from `event.clientX/Y` relative to the `.chart-wrapper` bounding rect, keeping it inside the component.

### Pie / Donut
Slices are built as SVG `path` elements using `arc` commands for both the outer and inner radius (donut cutout at 42% of outer radius). Hovered slices translate outward along their midpoint angle for a satisfying "pop" effect.

---

## Evaluation Checklist

| Criterion         | How it's met                                                        |
|-------------------|---------------------------------------------------------------------|
| Angular Usage     | Standalone component, `@Input`, `@ViewChild`, `HostListener`, `OnPush`, `ngFor`, `ngIf` |
| Chart Logic       | Custom SVG paths for all 3 types, axes, ticks, smooth curves        |
| Reusability       | Single `[chartOptions]` input drives all chart types & data         |
| UI / CSS          | Design tokens, dark theme, animations, hover effects, responsive    |
| Code Quality      | Interfaces, typed helpers, no `any` (except one internal cache), clear naming |
| Documentation     | This README + inline JSDoc comments                                 |

---

## Screenshots

> _Run `npm start` and open http://localhost:4200 to see all three charts rendered live._

---

## License

MIT
