import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import { HealthService, IntegrationStatus } from '../health/health.service';

@Component({
  selector: 'app-integrations-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <main class="integrations-page">
      <section>
        <h1>Integrations</h1>
        <p>Connect Garmin Connect (master source) and Strava to sync health data.</p>
      </section>

      <section class="integration-card" *ngFor="let integration of integrations">
        <h2>{{ integration.provider | titlecase }}</h2>
        <p>Status: {{ integration.status }}</p>
        <p *ngIf="integration.connected_at">Connected at: {{ integration.connected_at }}</p>
        <p *ngIf="integration.last_sync_at">Last sync: {{ integration.last_sync_at }}</p>
        <div class="actions">
          <button *ngIf="integration.status !== 'connected'" (click)="connect(integration.provider)">
            Connect
          </button>
          <button
            *ngIf="integration.status === 'connected'"
            class="secondary"
            (click)="disconnect(integration.provider)"
          >
            Disconnect
          </button>
        </div>
      </section>
    </main>
  `,
})
export class IntegrationsPageComponent implements OnInit {
  integrations: IntegrationStatus[] = [
    { provider: 'garmin', status: 'disconnected' },
    { provider: 'strava', status: 'disconnected' },
  ];

  constructor(private readonly healthService: HealthService) {}

  ngOnInit(): void {
    this.refresh();
  }

  connect(provider: string): void {
    if (provider !== 'garmin' && provider !== 'strava') {
      return;
    }
    this.healthService.connect(provider).subscribe((authUrl) => {
      const code = new URL(authUrl, window.location.origin).searchParams.get('code') ?? 'stub';
      this.healthService.finalizeConnect(provider, code).subscribe(() => this.refresh());
    });
  }

  disconnect(provider: string): void {
    if (provider !== 'garmin' && provider !== 'strava') {
      return;
    }
    this.healthService.disconnect(provider).subscribe(() => this.refresh());
  }

  private refresh(): void {
    this.healthService.listIntegrations().subscribe((integrations) => {
      const map = new Map(integrations.map((item) => [item.provider, item]));
      this.integrations = this.integrations.map((item) => map.get(item.provider) ?? item);
    });
  }
}
