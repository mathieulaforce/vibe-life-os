import { CommonModule } from '@angular/common';
import { Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { HealthService, StepEntry } from './health.service';

type SummaryRow = {
  key: string;
  label: string;
  total: number;
};

@Component({
  selector: 'app-steps-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="steps-page">
      <section class="steps-header">
        <div>
          <h1>Steps</h1>
          <p>
            Daily steps are sourced from Garmin Connect. Weekly totals start on Monday to align with
            Garmin reporting.
          </p>
        </div>
      </section>

      <section class="steps-metrics">
        <div class="metric">
          <span class="metric-label">Latest Day</span>
          <span class="metric-value">{{ latestSteps() ?? '—' }}</span>
          <span class="metric-subtitle">{{ latestDate() ?? 'No data yet' }}</span>
        </div>
        <div class="metric">
          <span class="metric-label">This Week (Mon-Sun)</span>
          <span class="metric-value">{{ currentWeekTotal() ?? '—' }}</span>
          <span class="metric-subtitle">Avg/day {{ currentWeekAverage() ?? '—' }}</span>
        </div>
        <div class="metric">
          <span class="metric-label">This Month</span>
          <span class="metric-value">{{ currentMonthTotal() ?? '—' }}</span>
          <span class="metric-subtitle">{{ currentMonthLabel() ?? '—' }}</span>
        </div>
        <div class="metric">
          <span class="metric-label">This Year</span>
          <span class="metric-value">{{ currentYearTotal() ?? '—' }}</span>
          <span class="metric-subtitle">Last sync {{ lastSync() ?? 'Not connected' }}</span>
        </div>
      </section>

      <section class="steps-grid">
        <div class="steps-card">
          <h2>Daily Steps</h2>
          <p class="steps-card-subtitle">Most recent 14 days from Garmin Connect.</p>
          <div class="steps-table">
            <div class="steps-row steps-row-header">
              <span>Date</span>
              <span>Steps</span>
              <span>Source</span>
            </div>
            <div class="steps-row" *ngFor="let entry of recentDaily()">
              <span>{{ entry.entry_date }}</span>
              <span>{{ entry.steps }}</span>
              <span>{{ entry.source }}</span>
            </div>
            <div class="steps-empty" *ngIf="recentDaily().length === 0">
              Garmin Connect hasn’t synced any steps yet.
            </div>
          </div>
        </div>

        <div class="steps-card">
          <h2>Weekly Totals</h2>
          <p class="steps-card-subtitle">Weeks start on Monday.</p>
          <div class="steps-table">
            <div class="steps-row steps-row-header">
              <span>Week of</span>
              <span>Total Steps</span>
            </div>
            <div class="steps-row" *ngFor="let row of weeklyRows()">
              <span>{{ row.label }}</span>
              <span>{{ row.total }}</span>
            </div>
            <div class="steps-empty" *ngIf="weeklyRows().length === 0">
              No weekly totals yet.
            </div>
          </div>
        </div>

        <div class="steps-card">
          <h2>Monthly Totals</h2>
          <p class="steps-card-subtitle">Calendar months from Garmin data.</p>
          <div class="steps-table">
            <div class="steps-row steps-row-header">
              <span>Month</span>
              <span>Total Steps</span>
            </div>
            <div class="steps-row" *ngFor="let row of monthlyRows()">
              <span>{{ row.label }}</span>
              <span>{{ row.total }}</span>
            </div>
            <div class="steps-empty" *ngIf="monthlyRows().length === 0">
              No monthly totals yet.
            </div>
          </div>
        </div>

        <div class="steps-card">
          <h2>Yearly Totals</h2>
          <p class="steps-card-subtitle">Totals across calendar years.</p>
          <div class="steps-table">
            <div class="steps-row steps-row-header">
              <span>Year</span>
              <span>Total Steps</span>
            </div>
            <div class="steps-row" *ngFor="let row of yearlyRows()">
              <span>{{ row.label }}</span>
              <span>{{ row.total }}</span>
            </div>
            <div class="steps-empty" *ngIf="yearlyRows().length === 0">
              No yearly totals yet.
            </div>
          </div>
        </div>
      </section>
    </main>
  `,
})
export class StepsPageComponent {
  private readonly stepsSignal = toSignal(
    this.healthService.listSteps(400).pipe(
      map((entries) => [...entries].sort((a, b) => a.entry_date.localeCompare(b.entry_date))),
    ),
    { initialValue: [] as StepEntry[] },
  );

  private readonly integrationsSignal = toSignal(this.healthService.listIntegrations(), {
    initialValue: [],
  });

  recentDaily = computed(() => this.stepsSignal().slice(-14).reverse());

  latestSteps = computed(() => {
    const latest = this.stepsSignal().at(-1);
    return latest?.steps ?? null;
  });

  latestDate = computed(() => {
    const latest = this.stepsSignal().at(-1);
    return latest?.entry_date ?? null;
  });

  currentWeekTotal = computed(() => {
    const now = new Date();
    const weekStart = this.startOfWeekMonday(now);
    const entries = this.stepsSignal().filter((entry) => {
      const entryDate = this.parseDate(entry.entry_date);
      return entryDate >= weekStart && entryDate <= now;
    });
    return entries.length ? entries.reduce((sum, entry) => sum + entry.steps, 0) : null;
  });

  currentWeekAverage = computed(() => {
    const now = new Date();
    const weekStart = this.startOfWeekMonday(now);
    const entries = this.stepsSignal().filter((entry) => {
      const entryDate = this.parseDate(entry.entry_date);
      return entryDate >= weekStart && entryDate <= now;
    });
    return entries.length ? Math.round((this.currentWeekTotal() ?? 0) / entries.length) : null;
  });

  currentMonthTotal = computed(() => {
    const now = new Date();
    const monthKey = this.monthKey(now);
    const entries = this.stepsSignal().filter(
      (entry) => this.monthKey(this.parseDate(entry.entry_date)) === monthKey,
    );
    return entries.length ? entries.reduce((sum, entry) => sum + entry.steps, 0) : null;
  });

  currentMonthLabel = computed(() => new Date().toLocaleString(undefined, { month: 'long', year: 'numeric' }));

  currentYearTotal = computed(() => {
    const yearKey = `${new Date().getFullYear()}`;
    const entries = this.stepsSignal().filter(
      (entry) => `${this.parseDate(entry.entry_date).getFullYear()}` === yearKey,
    );
    return entries.length ? entries.reduce((sum, entry) => sum + entry.steps, 0) : null;
  });

  lastSync = computed(() => {
    const garmin = this.integrationsSignal().find((item) => item.provider === 'garmin');
    return garmin?.last_sync_at ?? garmin?.connected_at ?? null;
  });

  weeklyRows = computed(() => {
    const weekly = new Map<string, SummaryRow>();
    this.stepsSignal().forEach((entry) => {
      const date = this.parseDate(entry.entry_date);
      const weekStart = this.startOfWeekMonday(date);
      const weekKey = weekStart.toISOString().slice(0, 10);
      const weekLabel = this.formatDate(weekStart);
      const current = weekly.get(weekKey);
      weekly.set(weekKey, {
        key: weekKey,
        label: weekLabel,
        total: (current?.total ?? 0) + entry.steps,
      });
    });
    return this.toRows(weekly);
  });

  monthlyRows = computed(() => {
    const monthly = new Map<string, SummaryRow>();
    this.stepsSignal().forEach((entry) => {
      const date = this.parseDate(entry.entry_date);
      const monthKey = `${date.getFullYear()}-${this.pad(date.getMonth() + 1)}`;
      const monthLabel = date.toLocaleString(undefined, { month: 'long', year: 'numeric' });
      const current = monthly.get(monthKey);
      monthly.set(monthKey, {
        key: monthKey,
        label: monthLabel,
        total: (current?.total ?? 0) + entry.steps,
      });
    });
    return this.toRows(monthly);
  });

  yearlyRows = computed(() => {
    const yearly = new Map<string, SummaryRow>();
    this.stepsSignal().forEach((entry) => {
      const date = this.parseDate(entry.entry_date);
      const yearKey = `${date.getFullYear()}`;
      const current = yearly.get(yearKey);
      yearly.set(yearKey, {
        key: yearKey,
        label: yearKey,
        total: (current?.total ?? 0) + entry.steps,
      });
    });
    return this.toRows(yearly);
  });

  constructor(private readonly healthService: HealthService) {}

  private toRows(map: Map<string, SummaryRow>): SummaryRow[] {
    return Array.from(map.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .reverse();
  }

  private parseDate(value: string): Date {
    return new Date(`${value}T00:00:00`);
  }

  private startOfWeekMonday(date: Date): Date {
    const day = (date.getDay() + 6) % 7;
    const start = new Date(date);
    start.setDate(date.getDate() - day);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private monthKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}`;
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private pad(value: number): string {
    return `${value}`.padStart(2, '0');
  }
}
