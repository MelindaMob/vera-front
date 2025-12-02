import { Routes } from '@angular/router';
import { ItemPage } from './pages/item-page/item-page';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page';
import { FormsPageComponent } from './pages/forms-data-page/forms-data-page'; 

export const routes: Routes = [
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
    path: '',
    redirectTo: '',
    pathMatch: 'full'
  },
  { path: 'dashboard', 
    component: DashboardPageComponent },
  
  // Nouvelle route pour la page des formulaires
  { path: 'forms', component: FormsPageComponent }]
