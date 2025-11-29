import { Routes } from '@angular/router';
import { ItemPage } from './pages/item-page/item-page';
import { DashboardComponent } from './components/dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: '', pathMatch: 'full' },
  { path: 'items', component: ItemPage },
  { path: 'dashboard', component: DashboardComponent}
];