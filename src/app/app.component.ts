import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent, ChartOptions } from './chart/chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ChartComponent],
  template: `
    <div class="demo-page">
      <header class="demo-header">
        <h1>io-chart</h1>
        <p>Custom Angular Chart Component — No external libraries</p>
      </header>

      <div class="demo-grid">
        <io-chart [chartOptions]="lineOptions"></io-chart>
        <io-chart [chartOptions]="columnOptions"></io-chart>
        <io-chart [chartOptions]="pieOptions"></io-chart>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      background: #0a0d14;
      font-family: 'Sora', 'DM Sans', sans-serif;
    }

    .demo-page {
      max-width: 780px;
      margin: 0 auto;
      padding: 40px 20px 60px;
    }

    .demo-header {
      text-align: center;
      margin-bottom: 40px;

      h1 {
        margin: 0 0 8px;
        font-size: 2.2rem;
        font-weight: 800;
        letter-spacing: -0.02em;
        color: #e8eaf0;
        font-family: 'JetBrains Mono', monospace;
      }

      p {
        margin: 0;
        color: #454d66;
        font-size: 0.9rem;
      }
    }

    .demo-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  `],
})
export class AppComponent {
  lineOptions: ChartOptions = {
    type: 'line',
    title: 'Monthly Revenue',
    series: [
      { name: 'Jan', value: 42000, color: '#6c7cff' },
      { name: 'Feb', value: 58000, color: '#6c7cff' },
      { name: 'Mar', value: 47000, color: '#6c7cff' },
      { name: 'Apr', value: 71000, color: '#6c7cff' },
      { name: 'May', value: 63000, color: '#6c7cff' },
      { name: 'Jun', value: 89000, color: '#6c7cff' },
    ],
  };

  columnOptions: ChartOptions = {
    type: 'column',
    title: 'Sales by Channel',
    series: [
      { name: 'Direct', value: 8400, color: '#34d6a0' },
      { name: 'Organic', value: 5200, color: '#f9a82a' },
      { name: 'Paid', value: 6800, color: '#fc6b8a' },
      { name: 'Referral', value: 3100, color: '#a78bff' },
      { name: 'Social', value: 4600, color: '#38bdf8' },
    ],
  };

  pieOptions: ChartOptions = {
    type: 'pie',
    title: 'Traffic Sources',
    series: [
      { name: 'Offline', value: 30, color: '#6c7cff' },
      { name: 'Online', value: 70, color: '#34d6a0' },
    ],
  };
}
