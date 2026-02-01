import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <header class="app-header">
      <div class="brand">LifeOS</div>
      <nav>
        <a routerLink="/">Home</a>
        <a routerLink="/health/weight">Weight</a>
        <a routerLink="/settings/integrations">Integrations</a>
      </nav>
    </header>
    <router-outlet />
  `,
})
export class AppComponent {}
