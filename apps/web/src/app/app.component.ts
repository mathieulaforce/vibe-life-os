import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="app-header">
      <div class="brand">LifeOS</div>
      <nav class="app-nav" aria-label="Primary">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
          Home
        </a>
        <a routerLink="/health/weight" routerLinkActive="active">Weight</a>
        <a routerLink="/settings/integrations" routerLinkActive="active">Integrations</a>
      </nav>
    </header>
    <router-outlet />
  `,
})
export class AppComponent {}
