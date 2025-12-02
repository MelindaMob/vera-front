import { Component, Input } from '@angular/core';
import { CommonModule, KeyValuePipe, DatePipe } from '@angular/common';
import { FormResponse } from '../../modele/form-response.model';

@Component({
  selector: 'app-feedback-card',
  standalone: true,
  imports: [CommonModule, KeyValuePipe, DatePipe],
  templateUrl: './feedback-card.html'
})
export class FeedbackCardComponent {
  /** La réponse complète du formulaire à afficher */
  @Input({ required: true }) response!: FormResponse;
  
  /** La clé de la question sélectionnée pour filtrer l'affichage (optionnel) */
  @Input() highlightKey: string | null = null;
}