import { Routes } from '@angular/router';
import { ItemPage } from './pages/item-page/item-page';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page';
import { FormsPageComponent } from './pages/forms-data-page/forms-data-page'; 

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'register',
    component: RegisterComponent
  },
  {
    path: 'items',
    component: ItemPage
  },
  {
    path: 'dashboard', 
    component: DashboardPageComponent },
  { 
    path: 'forms',
    component: FormsPageComponent }]
