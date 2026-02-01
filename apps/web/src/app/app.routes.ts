import { Routes } from '@angular/router';

import { HomeComponent } from './home.component';
import { StepsPageComponent } from './health/steps-page.component';
import { IntegrationsPageComponent } from './settings/integrations-page.component';
import { WeightPageComponent } from './health/weight-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'health/weight',
    component: WeightPageComponent,
  },
  {
    path: 'health/steps',
    component: StepsPageComponent,
  },
  {
    path: 'settings/integrations',
    component: IntegrationsPageComponent,
  },
];
