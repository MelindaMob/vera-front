import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormResponse } from '../../modele/form-response.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './dashboard.html'
})
export class DashboardComponent {
  // Fausses données pour tester le visuel
  responses: FormResponse[] = [
    {
      id: 1,
      date: new Date(),
      nom: 'Jean Dupont',
      email: 'jean.dupont@example.com',
      message: 'Intéressé par vos services.'
    },
    {
      id: 2,
      date: new Date(new Date().getTime() - 1000 * 60 * 60), // Il y a 1h
      nom: 'Marie Curry',
      email: 'marie@science.com',
      message: 'Demande de devis urgent.'
    }
  ];
}