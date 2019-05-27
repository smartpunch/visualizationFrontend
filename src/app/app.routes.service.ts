import { AboutPageComponent } from './views/pages/about/about.component';
import { SettingsPageComponent } from './views/pages/settings/settings.component';
import { RouterModule, Route } from '@angular/router';
import { ModuleWithProviders } from '@angular/core';
import { NotFoundComponent } from './views/errors/not-found/not-found.component';
import { DashboardComponent } from './views/dashboards/dashboard/dashboard.component';

const routes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard', component: DashboardComponent
  },
  {
    path: 'settings', component: SettingsPageComponent
  },
  {
    path: 'about', component: AboutPageComponent
  },
  { path: '**', component: NotFoundComponent }
];

export const AppRoutes: ModuleWithProviders = RouterModule.forRoot(routes);
