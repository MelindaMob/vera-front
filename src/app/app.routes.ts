import { Routes } from '@angular/router';
import { ItemPage } from './pages/item-page/item-page';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page';
import { FormsPageComponent } from './pages/forms-data-page/forms-data-page'; // Import du nouveau composant

export const routes: Routes = [
  // Redirection par défaut vers le dashboard plutôt que '' (qui cause une boucle infinie)
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  
  { path: 'items', component: ItemPage },
  { path: 'dashboard', component: DashboardPageComponent },
  
  // Nouvelle route pour la page des formulaires
  { path: 'forms', component: FormsPageComponent }
];