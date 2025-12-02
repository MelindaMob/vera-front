import { Routes } from '@angular/router';
import { ItemPage } from './pages/item-page/item-page';
import { LandingPage } from './pages/landing/landing';
import { VerifyPage } from './pages/verify/verify';
import { ChatComponent } from './components/chat/chat.component';

export const routes: Routes = [
  // 1. Route par défaut : Landing page
  { path: '', component: LandingPage },

  // 2. Chat avec Vera (nouvelle interface principale)
  { path: 'chat', component: ChatComponent },

  // 3. Page de vérification
  { path: 'verify', component: VerifyPage },

  // 4. La route spécifique pour ta liste d'items
  { path: 'items', component: ItemPage },
  
  // (Optionnel) Plus tard, tu pourras ajouter une page détail :
  // { path: 'items/:id', component: ItemDetailComponent }
];