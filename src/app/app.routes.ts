import { Routes } from '@angular/router';
import { ItemPage } from './pages/item-page/item-page';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { LandingPage } from './pages/landing/landing';
import { VerifyPage } from './pages/verify/verify';
import { ChatComponent } from './components/chat/chat.component';

export const routes: Routes = [
  // Landing page
  { path: '', component: LandingPage },

  // Authentication
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Chat avec Vera
  { path: 'chat', component: ChatComponent },

  // Page de vérification
  { path: 'verify', component: VerifyPage },

  // Items
  { path: 'items', component: ItemPage }
];