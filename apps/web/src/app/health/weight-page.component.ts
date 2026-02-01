import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as echarts from 'echarts';

import { HealthService, WeightEntry } from './health.service';

@Component({
  selector: 'app-weight-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="weight-page">
      <section class="weight-header">
        <div>
          <h1>Weight</h1>
          <p>Garmin Connect is treated as the master source. Manual entries sync when Garmin has no entry that day.</p>
        </div>
        <div class="weight-actions">
          <label>
            Date
            <input type="date" [(ngModel)]="entryDate" />
          </label>
          <label>
            Weight (kg)
            <input type="number" step="0.1" [(ngModel)]="weightKg" />
          </label>
          <label>
            Goal (kg)
            <input type="number" step="0.1" [(ngModel)]="goalKg" />
          </label>
          <button (click)="save()">Save Weight</button>
        </div>
      </section>

      <section class="weight-metrics">
        <div class="metric">
          <span class="metric-label">Latest Weight</span>
          <span class="metric-value">{{ latestWeight ?? '—' }} kg</span>
        </div>
        <div class="metric">
          <span class="metric-label">Goal Weight</span>
          <span class="metric-value">{{ goalWeight ?? '—' }} kg</span>
        </div>
        <div class="metric">
          <span class="metric-label">Last Sync</span>
          <span class="metric-value">{{ lastSync ?? 'Not connected' }}</span>
        </div>
      </section>

      <section class="weight-chart">
        <div #chartContainer class="chart"></div>
      </section>
    </main>
  `,
})
export class WeightPageComponent implements OnInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  entries: WeightEntry[] = [];
  latestWeight: number | null = null;
  goalWeight: number | null = null;
  lastSync: string | null = null;

  entryDate = new Date().toISOString().slice(0, 10);
  weightKg: number | null = null;
  goalKg: number | null = null;

  private chart?: echarts.ECharts;

  constructor(private readonly healthService: HealthService) {}

  ngOnInit(): void {
    this.chart = echarts.init(this.chartContainer.nativeElement);
    this.refresh();
  }

  save(): void {
    if (!this.weightKg) {
      return;
    }
    this.healthService
      .saveWeight({
        entry_date: this.entryDate,
        weight_kg: this.weightKg,
        goal_kg: this.goalKg,
      })
      .subscribe(() => this.refresh());
  }

  private refresh(): void {
    this.healthService.listWeights(60).subscribe((entries) => {
      this.entries = entries;
      this.updateMetrics();
      this.renderChart();
    });

    this.healthService.listIntegrations().subscribe((integrations) => {
      const garmin = integrations.find((item) => item.provider === 'garmin');
      this.lastSync = garmin?.last_sync_at ?? garmin?.connected_at ?? null;
    });
  }

  private updateMetrics(): void {
    const latest = this.entries[this.entries.length - 1];
    this.latestWeight = latest?.weight_kg ?? null;
    this.goalWeight = latest?.goal_kg ?? null;
  }

  private renderChart(): void {
    if (!this.chart) {
      return;
    }
    const dates = this.entries.map((entry) => entry.entry_date);
    const weights = this.entries.map((entry) => entry.weight_kg);
    const goals = this.entries.map((entry) => entry.goal_kg ?? null);

    this.chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: dates },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Weight',
          type: 'line',
          data: weights,
          smooth: true,
          lineStyle: { width: 3, color: '#2f2b24' },
        },
        {
          name: 'Goal',
          type: 'line',
          data: goals,
          smooth: true,
          lineStyle: { width: 2, type: 'dashed', color: '#a6855d' },
        },
      ],
      grid: { left: '4%', right: '4%', bottom: '8%', containLabel: true },
    });
  }
}
