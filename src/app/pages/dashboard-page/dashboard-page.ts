import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// On importe le composant existant (le tableau de bord actuel)
import { DashboardComponent } from '../../components/dashboard/dashboard';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, DashboardComponent],
  template: `
    <app-dashboard></app-dashboard>
  `
})
export class DashboardPageComponent {}