import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChartComponent, ChartOptions, SeriesItem } from './chart/chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, ChartComponent],
  template: `
    <div class="app-shell" [attr.data-theme]="currentTheme" [class.presentation-mode]="isPresentationMode">
      <!-- Ambient Background Glows -->
      <div class="bg-glow bg-glow-1"></div>
      <div class="bg-glow bg-glow-2"></div>

      <!-- Top Executive Navigation Bar -->
      <header class="app-header">
        <div class="header-container">
          <div class="brand-area">
            <div class="brand-badge">
              <span class="brand-logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M4 19h16v2H2V3h2v16z" fill="#6366f1"/>
                  <path d="M7 14l4-5 4 4 6-8" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="21" cy="5" r="2.5" fill="#f59e0b"/>
                </svg>
              </span>
              <div class="brand-meta">
                <span class="brand-name">io-chart</span>
                <span class="brand-tag">Pure SVG Engine • Angular 17</span>
              </div>
            </div>

            <!-- Live Streaming Indicator Badge -->
            <button
              type="button"
              class="live-status-pill"
              [class.streaming]="isLiveStreaming"
              (click)="toggleLiveStream()"
              title="Click to toggle real-time telemetry stream"
            >
              <span class="pulse-dot"></span>
              <span>{{ isLiveStreaming ? 'LIVE TELEMETRY ON' : 'SIMULATE REALTIME' }}</span>
            </button>
          </div>

          <!-- Navigation Tab Switcher -->
          <nav class="nav-tabs">
            <button
              type="button"
              class="nav-tab-btn"
              [class.active]="activeTab === 'dashboard'"
              (click)="activeTab = 'dashboard'"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <span>Executive Dashboard</span>
            </button>
            <button
              type="button"
              class="nav-tab-btn"
              [class.active]="activeTab === 'studio'"
              (click)="activeTab = 'studio'"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              <span>Interactive Studio</span>
            </button>
            <button
              type="button"
              class="nav-tab-btn"
              [class.active]="activeTab === 'pitch'"
              (click)="activeTab = 'pitch'"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <span>Presenter Deck</span>
            </button>
          </nav>

          <!-- Top Action Controls -->
          <div class="header-actions">
            <!-- Randomize Data Button -->
            <button
              type="button"
              class="action-icon-btn"
              (click)="randomizeAllData()"
              title="Randomize data sets to test dynamic recalculation"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
              <span>Randomize</span>
            </button>

            <!-- Theme Switcher -->
            <button
              type="button"
              class="action-icon-btn"
              (click)="toggleTheme()"
              [title]="'Switch to ' + (currentTheme === 'dark' ? 'Light' : 'Dark') + ' Mode'"
            >
              <ng-container *ngIf="currentTheme === 'dark'">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                <span>Light</span>
              </ng-container>
              <ng-container *ngIf="currentTheme === 'light'">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                <span>Dark</span>
              </ng-container>
            </button>

            <!-- Presentation Fullscreen Mode -->
            <button
              type="button"
              class="action-icon-btn highlight"
              (click)="isPresentationMode = !isPresentationMode"
              title="Presentation Mode: Cleans screen for high-stakes presentations"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
              <span>{{ isPresentationMode ? 'Exit Deck' : 'Present' }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Content Container -->
      <main class="app-main">
        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <!-- TAB 1: EXECUTIVE DASHBOARD                                             -->
        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <section *ngIf="activeTab === 'dashboard'" class="dashboard-section animate-fade">
          <!-- KPI Summary Cards Bar -->
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-top">
                <span class="kpi-title">Gross Revenue</span>
                <span class="kpi-badge positive">+24.8% YoY</span>
              </div>
              <div class="kpi-value">$412,850</div>
              <div class="kpi-footer">
                <div class="kpi-sparkline-track">
                  <div class="kpi-sparkline-bar" style="width: 84%"></div>
                </div>
                <span class="kpi-subtext">Target: $400K achieved</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-top">
                <span class="kpi-title">Channel Conversion</span>
                <span class="kpi-badge positive">+4.2%</span>
              </div>
              <div class="kpi-value">5.84%</div>
              <div class="kpi-footer">
                <div class="kpi-sparkline-track">
                  <div class="kpi-sparkline-bar emerald" style="width: 72%"></div>
                </div>
                <span class="kpi-subtext">Direct & Organic leading</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-top">
                <span class="kpi-title">System IO Throughput</span>
                <span class="kpi-badge neutral">99.98% SLA</span>
              </div>
              <div class="kpi-value">94.6K <small>ops/s</small></div>
              <div class="kpi-footer">
                <div class="kpi-sparkline-track">
                  <div class="kpi-sparkline-bar violet" style="width: 92%"></div>
                </div>
                <span class="kpi-subtext">Peak 104K during rush</span>
              </div>
            </div>

            <div class="kpi-card">
              <div class="kpi-top">
                <span class="kpi-title">Active Data Slices</span>
                <span class="kpi-badge info">Zero Library Overhead</span>
              </div>
              <div class="kpi-value">100% Native SVG</div>
              <div class="kpi-footer">
                <div class="kpi-sparkline-track">
                  <div class="kpi-sparkline-bar amber" style="width: 100%"></div>
                </div>
                <span class="kpi-subtext">~57KB bundle vs 500KB+</span>
              </div>
            </div>
          </div>

          <!-- Hero Main Chart: Revenue & Targets -->
          <div class="hero-chart-card">
            <io-chart [chartOptions]="revenueOptions"></io-chart>
          </div>

          <!-- Secondary Dual Grid: Channel Bar Chart & Segment Donut Chart -->
          <div class="charts-dual-grid">
            <div class="grid-chart-card">
              <io-chart [chartOptions]="channelOptions"></io-chart>
            </div>
            <div class="grid-chart-card">
              <io-chart [chartOptions]="trafficOptions"></io-chart>
            </div>
          </div>

          <!-- Tertiary Performance Monitor Chart -->
          <div class="hero-chart-card">
            <io-chart [chartOptions]="latencyOptions"></io-chart>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <!-- TAB 2: INTERACTIVE STUDIO & PLAYGROUND                                 -->
        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <section *ngIf="activeTab === 'studio'" class="studio-section animate-fade">
          <div class="studio-layout">
            <!-- Studio Configurator Sidebar -->
            <div class="studio-sidebar">
              <div class="sidebar-header">
                <h3>Component Configurator</h3>
                <p>Customize chart parameters reactively</p>
              </div>

              <!-- Chart Type Select -->
              <div class="config-group">
                <label class="config-label">Chart Type</label>
                <div class="btn-group-row">
                  <button
                    type="button"
                    class="seg-btn"
                    [class.active]="studioOptions.type === 'line'"
                    (click)="setStudioType('line')"
                  >Line</button>
                  <button
                    type="button"
                    class="seg-btn"
                    [class.active]="studioOptions.type === 'column'"
                    (click)="setStudioType('column')"
                  >Column</button>
                  <button
                    type="button"
                    class="seg-btn"
                    [class.active]="studioOptions.type === 'pie'"
                    (click)="setStudioType('pie')"
                  >Donut</button>
                </div>
              </div>

              <!-- Title & Subtitle -->
              <div class="config-group">
                <label class="config-label">Chart Title</label>
                <input
                  type="text"
                  class="studio-input"
                  [(ngModel)]="studioOptions.title"
                  (ngModelChange)="onStudioChange()"
                />
              </div>

              <div class="config-group">
                <label class="config-label">Target Goal Line</label>
                <div class="input-with-toggle">
                  <input
                    type="number"
                    class="studio-input"
                    [(ngModel)]="studioOptions.targetValue"
                    (ngModelChange)="onStudioChange()"
                    placeholder="e.g. 50000"
                  />
                  <button
                    type="button"
                    class="mini-btn"
                    (click)="studioOptions.targetValue = studioOptions.targetValue ? undefined : 60000; onStudioChange()"
                  >
                    {{ studioOptions.targetValue ? 'Clear' : 'Add 60K' }}
                  </button>
                </div>
              </div>

              <!-- Options Toggles -->
              <div class="config-group">
                <label class="config-label">Visual Attributes</label>
                <div class="toggle-list">
                  <label class="toggle-item">
                    <input
                      type="checkbox"
                      [(ngModel)]="studioOptions.showGrid"
                      (ngModelChange)="onStudioChange()"
                    />
                    <span>Show Grid Lines</span>
                  </label>
                  <label class="toggle-item" *ngIf="studioOptions.type === 'line'">
                    <input
                      type="checkbox"
                      [(ngModel)]="studioOptions.showArea"
                      (ngModelChange)="onStudioChange()"
                    />
                    <span>Area Gradient Glow</span>
                  </label>
                  <label class="toggle-item" *ngIf="studioOptions.type === 'line'">
                    <input
                      type="checkbox"
                      [checked]="studioOptions.curveType === 'smooth'"
                      (change)="studioOptions.curveType = studioOptions.curveType === 'smooth' ? 'straight' : 'smooth'; onStudioChange()"
                    />
                    <span>Smooth Bézier Curves</span>
                  </label>
                </div>
              </div>

              <!-- Series Data Editor -->
              <div class="config-group">
                <div class="series-header">
                  <label class="config-label">Data Points ({{ studioOptions.series.length }})</label>
                  <button type="button" class="mini-btn add" (click)="addStudioDataPoint()">+ Add Point</button>
                </div>
                <div class="series-editor-list">
                  <div *ngFor="let s of studioOptions.series; let i = index" class="series-row">
                    <input
                      type="text"
                      class="studio-input sm"
                      [(ngModel)]="s.name"
                      (ngModelChange)="onStudioChange()"
                    />
                    <input
                      type="number"
                      class="studio-input sm val"
                      [(ngModel)]="s.value"
                      (ngModelChange)="onStudioChange()"
                    />
                    <input
                      type="color"
                      class="studio-color-picker"
                      [(ngModel)]="s.color"
                      (ngModelChange)="onStudioChange()"
                    />
                    <button
                      type="button"
                      class="del-btn"
                      (click)="removeStudioDataPoint(i)"
                      [disabled]="studioOptions.series.length <= 2"
                    >×</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Studio Preview Canvas -->
            <div class="studio-preview">
              <div class="preview-chart-wrapper">
                <io-chart [chartOptions]="studioOptions"></io-chart>
              </div>

              <!-- Generated Angular Integration Snippet -->
              <div class="code-snippet-box">
                <div class="snippet-header">
                  <span class="snippet-title">Angular Usage Template & Options</span>
                  <button type="button" class="copy-btn" (click)="copySnippet()">
                    {{ copySuccess ? '✓ Copied' : 'Copy Code' }}
                  </button>
                </div>
                <pre class="snippet-content"><code>{{ generatedSnippet }}</code></pre>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <!-- TAB 3: PRESENTER DECK / ARCHITECTURE TALKING POINTS                   -->
        <!-- ═══════════════════════════════════════════════════════════════════════ -->
        <section *ngIf="activeTab === 'pitch'" class="pitch-section animate-fade">
          <div class="pitch-hero">
            <span class="pitch-tag">Technical Architecture Showcase</span>
            <h2>Why Build a Custom SVG Engine in Angular?</h2>
            <p>Highlights and key architectural differentiators ready for executive evaluation.</p>
          </div>

          <div class="pitch-cards-grid">
            <div class="pitch-card">
              <div class="pitch-card-icon indigo">01</div>
              <h3>Zero External Dependencies</h3>
              <p>
                Eliminates bloated third-party chart libraries (D3, Chart.js, Highcharts) saving <strong>~500KB+</strong> in bundle payload. Pure SVG rendered through Angular native bindings.
              </p>
              <ul class="pitch-bullets">
                <li>No security CVE vulnerabilities from transitive packages</li>
                <li>Zero bundle bloat — lightning fast initial paint</li>
                <li>Full styling control via standard SCSS design tokens</li>
              </ul>
            </div>

            <div class="pitch-card">
              <div class="pitch-card-icon emerald">02</div>
              <h3>Bézier & Arc Trigonometry</h3>
              <p>
                Precise mathematical geometry computed directly in TypeScript for optimal rendering smoothness without jagged artifacts.
              </p>
              <ul class="pitch-bullets">
                <li>Smooth Cubic Bézier curves (<code>C cpx0,y0 cpx1,y1 x,y</code>)</li>
                <li>SVG donut slice trigonometry with dynamic radius pop-out</li>
                <li>"Nice" step tick rounding algorithm for pristine scale markers</li>
              </ul>
            </div>

            <div class="pitch-card">
              <div class="pitch-card-icon amber">03</div>
              <h3>Engineered for Performance</h3>
              <p>
                Built using Angular 17+ standalone components with <code>OnPush</code> change detection and SVG hardware acceleration.
              </p>
              <ul class="pitch-bullets">
                <li>Sub-millisecond render recalculations during live data streams</li>
                <li>Hardware-accelerated CSS keyframe animations</li>
                <li>Fluid crosshair cursor tracking without DOM reflow bottlenecks</li>
              </ul>
            </div>

            <div class="pitch-card">
              <div class="pitch-card-icon rose">04</div>
              <h3>Universal Enterprise Reusability</h3>
              <p>
                A single clean <code>&lt;io-chart [chartOptions]="..."&gt;</code> component powers line, bar, donut, targets, and responsive layouts out of the box.
              </p>
              <ul class="pitch-bullets">
                <li>Instant 1-click SVG vector export for reports</li>
                <li>Dark / Light / High-contrast enterprise theming</li>
                <li>Full responsive fluid scaling via dynamic <code>viewBox</code></li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <!-- Executive Footer -->
      <footer class="app-footer">
        <div class="footer-inner">
          <span>io-chart • Enterprise Angular Presentation Engine</span>
          <span class="footer-dots">Built with Pure SVG & TypeScript</span>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      --font-mono: 'JetBrains Mono', monospace;
      --font-sans: 'Plus Jakarta Sans', sans-serif;
    }

    .app-shell {
      min-height: 100vh;
      position: relative;
      background: #090c14;
      color: #f1f5f9;
      font-family: var(--font-sans);
      transition: background 0.3s ease, color 0.3s ease;
      overflow-x: hidden;

      &[data-theme='light'] {
        background: #f8fafc;
        color: #0f172a;

        .app-header {
          background: rgba(255, 255, 255, 0.85);
          border-bottom-color: #e2e8f0;
        }
        .brand-name {
          color: #0f172a;
        }
        .nav-tabs {
          background: #edf2f7;
        }
        .nav-tab-btn {
          color: #64748b;
          &.active {
            background: #ffffff;
            color: #0f172a;
            box-shadow: 0 2px 6px rgba(0,0,0,0.06);
          }
        }
        .action-icon-btn {
          background: #edf2f7;
          border-color: #cbd5e1;
          color: #475569;
        }
        .kpi-card {
          background: #ffffff;
          border-color: #e2e8f0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .kpi-title, .kpi-subtext {
          color: #64748b;
        }
        .kpi-value {
          color: #0f172a;
        }
        .studio-sidebar {
          background: #ffffff;
          border-color: #e2e8f0;
        }
        .studio-input {
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .pitch-card {
          background: #ffffff;
          border-color: #e2e8f0;
          color: #0f172a;
          p, li { color: #475569; }
        }
        .app-footer {
          border-top-color: #e2e8f0;
          color: #64748b;
        }
      }
    }

    // Presentation mode hides extra clutter for maximum impact
    .presentation-mode {
      .app-header {
        padding: 8px 0;
      }
      .brand-tag, .kpi-grid {
        display: none;
      }
    }

    // ─── Ambient Glow Effects ─────────────────────────────────────────────────
    .bg-glow {
      position: fixed;
      border-radius: 50%;
      filter: blur(120px);
      pointer-events: none;
      z-index: 0;
      opacity: 0.15;
    }
    .bg-glow-1 {
      width: 500px;
      height: 500px;
      background: #6366f1;
      top: -100px;
      left: 10%;
    }
    .bg-glow-2 {
      width: 450px;
      height: 450px;
      background: #10b981;
      bottom: 50px;
      right: 5%;
    }

    // ─── Header ───────────────────────────────────────────────────────────────
    .app-header {
      position: sticky;
      top: 0;
      z-index: 50;
      background: rgba(9, 12, 20, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 12px 0;
      transition: all 0.2s ease;
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      flex-wrap: wrap;
    }

    .brand-area {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-badge {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(99, 102, 241, 0.15);
      border: 1px solid rgba(99, 102, 241, 0.3);
    }

    .brand-meta {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-size: 1.15rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      font-family: var(--font-mono);
      color: #ffffff;
    }

    .brand-tag {
      font-size: 0.72rem;
      color: #94a3b8;
      font-weight: 500;
    }

    // Live Streaming Status Pill
    .live-status-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      font-size: 0.72rem;
      font-weight: 700;
      font-family: var(--font-mono);
      cursor: pointer;
      transition: all 0.2s ease;

      .pulse-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #64748b;
      }

      &.streaming {
        background: rgba(16, 185, 129, 0.15);
        border-color: rgba(16, 185, 129, 0.4);
        color: #10b981;

        .pulse-dot {
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
          animation: blink 1.2s infinite ease-in-out;
        }
      }
    }

    @keyframes blink {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }

    // Nav Tabs
    .nav-tabs {
      display: flex;
      align-items: center;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 3px;
      gap: 2px;
    }

    .nav-tab-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 6px 14px;
      border-radius: 7px;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover {
        color: #f1f5f9;
      }

      &.active {
        background: #6366f1;
        color: #ffffff;
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.4);
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .action-icon-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #ffffff;
      }

      &.highlight {
        background: rgba(99, 102, 241, 0.18);
        border-color: rgba(99, 102, 241, 0.4);
        color: #a5b4fc;
        &:hover {
          background: #6366f1;
          color: #ffffff;
        }
      }
    }

    // ─── Main Content ─────────────────────────────────────────────────────────
    .app-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 28px 24px 60px;
      position: relative;
      z-index: 1;
    }

    .animate-fade {
      animation: fadeIn 0.3s ease-out both;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    // ─── KPI Grid ─────────────────────────────────────────────────────────────
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }

    .kpi-card {
      background: rgba(22, 27, 38, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 16px 20px;
      backdrop-filter: blur(12px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
      display: flex;
      flex-direction: column;
      gap: 8px;
      transition: transform 0.2s ease, border-color 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        border-color: rgba(99, 102, 241, 0.3);
      }
    }

    .kpi-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .kpi-title {
      font-size: 0.78rem;
      color: #94a3b8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .kpi-badge {
      font-size: 0.7rem;
      font-weight: 700;
      font-family: var(--font-mono);
      padding: 2px 7px;
      border-radius: 4px;

      &.positive {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
      }
      &.neutral {
        background: rgba(99, 102, 241, 0.15);
        color: #818cf8;
      }
      &.info {
        background: rgba(245, 158, 11, 0.15);
        color: #f59e0b;
      }
    }

    .kpi-value {
      font-size: 1.6rem;
      font-weight: 800;
      font-family: var(--font-mono);
      letter-spacing: -0.02em;

      small {
        font-size: 0.85rem;
        color: #94a3b8;
      }
    }

    .kpi-footer {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .kpi-sparkline-track {
      height: 4px;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 2px;
      overflow: hidden;
    }

    .kpi-sparkline-bar {
      height: 100%;
      background: #6366f1;
      border-radius: 2px;
      transition: width 0.4s ease;

      &.emerald { background: #10b981; }
      &.violet { background: #8b5cf6; }
      &.amber { background: #f59e0b; }
    }

    .kpi-subtext {
      font-size: 0.74rem;
      color: #64748b;
    }

    // ─── Dashboard Charts Layout ──────────────────────────────────────────────
    .hero-chart-card {
      margin-bottom: 24px;
    }

    .charts-dual-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
      gap: 24px;
      margin-bottom: 24px;
    }

    @media (max-width: 980px) {
      .charts-dual-grid {
        grid-template-columns: 1fr;
      }
    }

    // ─── Studio / Playground ──────────────────────────────────────────────────
    .studio-layout {
      display: grid;
      grid-template-columns: 360px 1fr;
      gap: 28px;
      align-items: start;
    }

    @media (max-width: 900px) {
      .studio-layout {
        grid-template-columns: 1fr;
      }
    }

    .studio-sidebar {
      background: rgba(22, 27, 38, 0.85);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 22px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    }

    .sidebar-header {
      margin-bottom: 20px;
      h3 {
        margin: 0 0 4px;
        font-size: 1.1rem;
        font-weight: 700;
      }
      p {
        margin: 0;
        font-size: 0.8rem;
        color: #94a3b8;
      }
    }

    .config-group {
      margin-bottom: 18px;
    }

    .config-label {
      display: block;
      font-size: 0.76rem;
      font-weight: 600;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 6px;
    }

    .btn-group-row {
      display: flex;
      gap: 4px;
      background: rgba(255, 255, 255, 0.04);
      padding: 3px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }

    .seg-btn {
      flex: 1;
      padding: 6px 0;
      border: none;
      background: transparent;
      color: #94a3b8;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;

      &.active {
        background: #6366f1;
        color: #ffffff;
      }
    }

    .studio-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 7px;
      padding: 8px 12px;
      color: #ffffff;
      font-size: 0.85rem;
      outline: none;
      font-family: var(--font-sans);

      &:focus {
        border-color: #6366f1;
      }

      &.sm {
        padding: 5px 8px;
        font-size: 0.78rem;
      }
      &.val {
        font-family: var(--font-mono);
      }
    }

    .input-with-toggle {
      display: flex;
      gap: 6px;
    }

    .mini-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 6px;
      padding: 0 10px;
      cursor: pointer;
      white-space: nowrap;

      &:hover {
        background: #6366f1;
        color: #ffffff;
      }

      &.add {
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
        border-color: rgba(16, 185, 129, 0.3);
      }
    }

    .toggle-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .toggle-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: #cbd5e1;
      cursor: pointer;
    }

    .series-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .series-editor-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      max-height: 220px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .series-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .studio-color-picker {
      width: 26px;
      height: 26px;
      border: none;
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
    }

    .del-btn {
      background: transparent;
      border: none;
      color: #ef4444;
      font-size: 1.1rem;
      cursor: pointer;
      padding: 0 4px;
      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }

    // Studio Preview Area
    .studio-preview {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .code-snippet-box {
      background: rgba(15, 20, 32, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      overflow: hidden;
    }

    .snippet-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      background: rgba(255, 255, 255, 0.03);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .snippet-title {
      font-size: 0.78rem;
      font-weight: 600;
      color: #94a3b8;
      font-family: var(--font-mono);
    }

    .copy-btn {
      background: #6366f1;
      color: #ffffff;
      border: none;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.74rem;
      font-weight: 600;
      cursor: pointer;
    }

    .snippet-content {
      margin: 0;
      padding: 16px;
      font-family: var(--font-mono);
      font-size: 0.76rem;
      line-height: 1.5;
      color: #a5b4fc;
      overflow-x: auto;
    }

    // ─── Presenter Deck ───────────────────────────────────────────────────────
    .pitch-hero {
      text-align: center;
      max-width: 680px;
      margin: 20px auto 40px;

      .pitch-tag {
        font-size: 0.78rem;
        font-weight: 700;
        color: #6366f1;
        text-transform: uppercase;
        letter-spacing: 0.08em;
      }

      h2 {
        font-size: 2rem;
        font-weight: 800;
        margin: 10px 0;
        letter-spacing: -0.02em;
      }

      p {
        color: #94a3b8;
        font-size: 1rem;
        margin: 0;
      }
    }

    .pitch-cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 20px;
    }

    .pitch-card {
      background: rgba(22, 27, 38, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      position: relative;
      transition: transform 0.2s ease;

      &:hover {
        transform: translateY(-4px);
        border-color: rgba(99, 102, 241, 0.35);
      }

      h3 {
        margin: 12px 0 8px;
        font-size: 1.15rem;
        font-weight: 700;
      }

      p {
        font-size: 0.88rem;
        color: #94a3b8;
        line-height: 1.5;
        margin: 0 0 14px;
      }
    }

    .pitch-card-icon {
      font-size: 0.85rem;
      font-weight: 800;
      font-family: var(--font-mono);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 38px;
      height: 38px;
      border-radius: 10px;

      &.indigo { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
      &.emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; }
      &.amber { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
      &.rose { background: rgba(244, 63, 94, 0.2); color: #fb7185; }
    }

    .pitch-bullets {
      margin: 0;
      padding-left: 18px;
      font-size: 0.82rem;
      color: #cbd5e1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    // ─── Footer ───────────────────────────────────────────────────────────────
    .app-footer {
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding: 24px 0;
      margin-top: 40px;
    }

    .footer-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.8rem;
      color: #64748b;
      font-family: var(--font-mono);
      flex-wrap: wrap;
      gap: 12px;
    }
  `],
})
export class AppComponent implements OnInit, OnDestroy {
  activeTab: 'dashboard' | 'studio' | 'pitch' = 'dashboard';
  currentTheme: 'dark' | 'light' = 'dark';
  isPresentationMode = false;
  isLiveStreaming = false;
  copySuccess = false;
  private streamIntervalId: any = null;

  // ── Executive Datasets ──────────────────────────────────────────────────────

  revenueOptions: ChartOptions = {
    type: 'line',
    title: 'Monthly Recurring Revenue (ARR)',
    subtitle: 'Fiscal 2026 Performance',
    unit: '$',
    unitPosition: 'prefix',
    targetValue: 80000,
    targetLabel: 'Q2 Benchmark',
    showGrid: true,
    showArea: true,
    showDots: true,
    curveType: 'smooth',
    series: [
      { name: 'Jan', value: 42000, color: '#6366f1' },
      { name: 'Feb', value: 58000, color: '#6366f1' },
      { name: 'Mar', value: 47000, color: '#6366f1' },
      { name: 'Apr', value: 71000, color: '#6366f1' },
      { name: 'May', value: 63000, color: '#6366f1' },
      { name: 'Jun', value: 89000, color: '#6366f1' },
      { name: 'Jul', value: 94000, color: '#6366f1' },
      { name: 'Aug', value: 108000, color: '#6366f1' },
    ],
  };

  channelOptions: ChartOptions = {
    type: 'column',
    title: 'Acquisition Channels & Conversion',
    subtitle: 'Units Sold by Route',
    unit: ' units',
    unitPosition: 'suffix',
    targetValue: 9000,
    targetLabel: 'Channel Goal',
    series: [
      { name: 'Direct Sales', value: 8400, color: '#10b981' },
      { name: 'Organic Search', value: 6200, color: '#f59e0b' },
      { name: 'Paid Ads', value: 7800, color: '#ec4899' },
      { name: 'Partner Referral', value: 4100, color: '#8b5cf6' },
      { name: 'Social Inbound', value: 5600, color: '#06b6d4' },
    ],
  };

  trafficOptions: ChartOptions = {
    type: 'pie',
    title: 'Traffic & Platform Segments',
    subtitle: 'Global User Distribution',
    unit: ' visitors',
    unitPosition: 'suffix',
    series: [
      { name: 'Web Desktop', value: 45000, color: '#6366f1' },
      { name: 'Mobile iOS', value: 38000, color: '#10b981' },
      { name: 'Mobile Android', value: 29000, color: '#06b6d4' },
      { name: 'Enterprise API', value: 16000, color: '#f59e0b' },
    ],
  };

  latencyOptions: ChartOptions = {
    type: 'line',
    title: 'API Gateway Latency (P99)',
    subtitle: 'Response Time in Milliseconds',
    unit: 'ms',
    unitPosition: 'suffix',
    targetValue: 120,
    targetLabel: 'SLA Limit (120ms)',
    showGrid: true,
    showArea: true,
    curveType: 'smooth',
    series: [
      { name: '00:00', value: 42, color: '#10b981' },
      { name: '04:00', value: 38, color: '#10b981' },
      { name: '08:00', value: 65, color: '#10b981' },
      { name: '12:00', value: 98, color: '#10b981' },
      { name: '16:00', value: 84, color: '#10b981' },
      { name: '20:00', value: 52, color: '#10b981' },
    ],
  };

  // ── Studio / Playground State ───────────────────────────────────────────────

  studioOptions: ChartOptions = {
    type: 'column',
    title: 'Quarterly Cloud Utilization',
    subtitle: 'Live Interactive Model',
    unit: 'TB',
    unitPosition: 'suffix',
    targetValue: 50,
    targetLabel: 'Quota Baseline',
    showGrid: true,
    showArea: true,
    curveType: 'smooth',
    series: [
      { name: 'Storage', value: 42, color: '#6366f1' },
      { name: 'Compute', value: 68, color: '#10b981' },
      { name: 'Network', value: 35, color: '#f59e0b' },
      { name: 'Memory', value: 54, color: '#06b6d4' },
    ],
  };

  ngOnInit(): void {
    // Keep clean initial state
  }

  ngOnDestroy(): void {
    if (this.streamIntervalId) {
      clearInterval(this.streamIntervalId);
    }
  }

  // ── Theme Switcher ──────────────────────────────────────────────────────────

  toggleTheme(): void {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.revenueOptions = { ...this.revenueOptions, theme: this.currentTheme };
    this.channelOptions = { ...this.channelOptions, theme: this.currentTheme };
    this.trafficOptions = { ...this.trafficOptions, theme: this.currentTheme };
    this.latencyOptions = { ...this.latencyOptions, theme: this.currentTheme };
    this.studioOptions = { ...this.studioOptions, theme: this.currentTheme };
  }

  // ── Realtime Live Telemetry Simulation ──────────────────────────────────────

  toggleLiveStream(): void {
    this.isLiveStreaming = !this.isLiveStreaming;

    if (this.isLiveStreaming) {
      this.streamIntervalId = setInterval(() => {
        this.stepLiveSimulation();
      }, 2000);
    } else {
      if (this.streamIntervalId) {
        clearInterval(this.streamIntervalId);
        this.streamIntervalId = null;
      }
    }
  }

  private stepLiveSimulation(): void {
    // Smoothly jitter the last 3 data points of revenue
    const newRev = this.revenueOptions.series.map((s, idx) => {
      if (idx >= this.revenueOptions.series.length - 2) {
        const delta = (Math.random() - 0.45) * 5000;
        return { ...s, value: Math.max(30000, Math.round(s.value + delta)) };
      }
      return s;
    });
    this.revenueOptions = { ...this.revenueOptions, series: newRev };

    // Jitter latency points
    const newLat = this.latencyOptions.series.map((s) => {
      const delta = (Math.random() - 0.48) * 8;
      return { ...s, value: Math.max(25, Math.min(115, Math.round(s.value + delta))) };
    });
    this.latencyOptions = { ...this.latencyOptions, series: newLat };
  }

  // ── Randomize Action ────────────────────────────────────────────────────────

  randomizeAllData(): void {
    this.revenueOptions = {
      ...this.revenueOptions,
      series: this.revenueOptions.series.map((s) => ({
        ...s,
        value: Math.round(35000 + Math.random() * 85000),
      })),
    };

    this.channelOptions = {
      ...this.channelOptions,
      series: this.channelOptions.series.map((s) => ({
        ...s,
        value: Math.round(3000 + Math.random() * 7000),
      })),
    };

    this.trafficOptions = {
      ...this.trafficOptions,
      series: this.trafficOptions.series.map((s) => ({
        ...s,
        value: Math.round(15000 + Math.random() * 45000),
      })),
    };
  }

  // ── Studio Management ───────────────────────────────────────────────────────

  setStudioType(type: 'line' | 'column' | 'pie'): void {
    this.studioOptions = { ...this.studioOptions, type };
  }

  onStudioChange(): void {
    this.studioOptions = {
      ...this.studioOptions,
      series: [...this.studioOptions.series],
    };
  }

  addStudioDataPoint(): void {
    const palette = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];
    const count = this.studioOptions.series.length + 1;
    const newPoint: SeriesItem = {
      name: `Point ${count}`,
      value: Math.round(20 + Math.random() * 60),
      color: palette[count % palette.length],
    };
    this.studioOptions = {
      ...this.studioOptions,
      series: [...this.studioOptions.series, newPoint],
    };
  }

  removeStudioDataPoint(index: number): void {
    if (this.studioOptions.series.length <= 2) return;
    const updated = this.studioOptions.series.filter((_, i) => i !== index);
    this.studioOptions = { ...this.studioOptions, series: updated };
  }

  get generatedSnippet(): string {
    const jsonSeries = JSON.stringify(this.studioOptions.series, null, 2);
    return `<io-chart [chartOptions]="options"></io-chart>

// In your TypeScript Component:
options: ChartOptions = {
  type: '${this.studioOptions.type}',
  title: '${this.studioOptions.title}',
  ${this.studioOptions.targetValue ? `targetValue: ${this.studioOptions.targetValue},` : ''}
  unit: '${this.studioOptions.unit || ''}',
  series: ${jsonSeries}
};`;
  }

  copySnippet(): void {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(this.generatedSnippet).then(() => {
        this.copySuccess = true;
        setTimeout(() => (this.copySuccess = false), 2000);
      });
    }
  }
}
