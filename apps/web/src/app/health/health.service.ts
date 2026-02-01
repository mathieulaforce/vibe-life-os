import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs';

import { API_BASE_URL } from '../app.config';

export interface WeightEntry {
  entry_date: string;
  weight_kg: number;
  goal_kg?: number | null;
  source: string;
}

export interface IntegrationStatus {
  provider: string;
  status: string;
  connected_at?: string | null;
  last_sync_at?: string | null;
}

export interface StepEntry {
  entry_date: string;
  steps: number;
  source: string;
}

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = API_BASE_URL;

  listWeights(days = 30) {
    return this.http.get<WeightEntry[]>(`${this.baseUrl}/weights?days=${days}`);
  }

  listSteps(days = 365) {
    return this.http.get<StepEntry[]>(`${this.baseUrl}/steps?days=${days}`);
  }

  saveWeight(payload: { entry_date?: string; weight_kg: number; goal_kg?: number | null }) {
    return this.http.post<WeightEntry & { garmin_sync?: string | null }>(
      `${this.baseUrl}/weights`,
      payload,
    );
  }

  listIntegrations() {
    return this.http.get<IntegrationStatus[]>(`${this.baseUrl}/integrations`);
  }

  connect(provider: 'garmin' | 'strava') {
    return this.http
      .post<{ auth_url: string }>(`${this.baseUrl}/integrations/${provider}/connect`, {})
      .pipe(map((response) => response.auth_url));
  }

  finalizeConnect(provider: 'garmin' | 'strava', code: string) {
    return this.http.get(`${this.baseUrl}/integrations/${provider}/callback?code=${code}`);
  }

  disconnect(provider: 'garmin' | 'strava') {
    return this.http.post(`${this.baseUrl}/integrations/${provider}/disconnect`, {});
  }
}
