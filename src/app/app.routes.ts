import { Routes } from '@angular/router';
import { ItemPage } from './pages/item-page/item-page';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LandingPage } from './pages/landing/landing';
import { VerifyPage } from './pages/verify/verify';
import { ChatComponent } from './components/chat/chat.component';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
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
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];