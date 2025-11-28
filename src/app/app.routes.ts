import { Routes } from '@angular/router';
import { ItemPage } from './pages/item-page/item-page';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

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
    redirectTo: '/login',
    pathMatch: 'full'
  }
];