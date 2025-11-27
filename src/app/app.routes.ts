import { Routes } from '@angular/router';
import { ItemPage } from './pages/item-page/item-page';

export const routes: Routes = [
  // 1. Route par défaut : si l'URL est vide, on redirige vers '/items'
  { path: '', redirectTo: '', pathMatch: 'full' },

  // 2. La route spécifique pour ta liste
  { path: 'items', component: ItemPage },
  
  // (Optionnel) Plus tard, tu pourras ajouter une page détail :
  // { path: 'items/:id', component: ItemDetailComponent }
];