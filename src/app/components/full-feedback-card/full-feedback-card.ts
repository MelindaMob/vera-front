import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormResponse } from '../../modele/form-response.model';

@Component({
  selector: 'app-full-feedback-card',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './full-feedback-card.html'
})
export class FullFeedbackCardComponent implements OnChanges {
  /** La réponse complète du formulaire à afficher */
  @Input({ required: true }) response!: FormResponse;

  /** Liste des questions/réponses traitées pour l'affichage */
  items: { question: string, answer: any }[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['response']) {
      this.processContent();
    }
  }

  private processContent(): void {
    if (!this.response || !this.response.content) {
      this.items = [];
      return;
    }

    // Transformation de l'objet en tableau
    this.items = Object.entries(this.response.content)
      .map(([key, value]) => ({
        question: key,
        answer: value
      }))
      // Filtrage : On enlève l'horodateur (affiché ailleurs) et les réponses vides
      .filter(item => item.question !== 'Horodateur' && item.answer !== '');
  }
}