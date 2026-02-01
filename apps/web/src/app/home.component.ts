import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <main>
      <h1>LifeOS</h1>
      <p>
        A domain-driven platform for personal operating systems. This is a placeholder shell
        waiting for product requirements.
      </p>
      <section class="home-actions">
        <a class="action-card" href="/health/weight">
          <h2>Weight Tracking</h2>
          <p>View weight history, goal progress, and sync status with Garmin Connect.</p>
        </a>
        <a class="action-card" href="/health/steps">
          <h2>Steps Analysis</h2>
          <p>Track daily, weekly, monthly, and yearly steps from Garmin Connect.</p>
        </a>
        <a class="action-card" href="/settings/integrations">
          <h2>Integrations</h2>
          <p>Connect Garmin Connect and Strava to sync data into LifeOS.</p>
        </a>
      </section>
    </main>
  `,
})
export class HomeComponent {}
