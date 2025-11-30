import { Routes } from '@angular/router';
import { ItemPage } from './pages/item-page/item-page';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page';

export const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: 'items', component: ItemPage },
  { path: 'dashboard', component: DashboardPageComponent}
];