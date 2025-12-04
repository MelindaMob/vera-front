import { Routes } from '@angular/router';
import { ItemPage } from './pages/item-page/item-page';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page';
import { FormsPageComponent } from './pages/forms-data-page/forms-data-page'; 
import { LandingPage } from './pages/landing/landing';
import { VerifyPage } from './pages/verify/verify';
import { ChatComponent } from './components/chat/chat.component';

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
    path: 'chat',
    component: ChatComponent
  },
  {
    path: 'verify',
    component: VerifyPage
  },
  {
    path: 'items',
    component: ItemPage
  },
  {
    path: 'landing',
    component: LandingPage
  },
  {
    path: 'dashboard', 
    component: DashboardPageComponent },
  { 
    path: 'forms',
    component: FormsPageComponent },
  {
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
  }
];