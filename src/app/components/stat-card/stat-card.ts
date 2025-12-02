import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stat-card.html'
})
export class StatCardComponent {
  /** Label en haut de la carte (ex: TOTAL RÉPONSES) */
  @Input({ required: true }) label!: string;
  
  /** La valeur principale (ex: 48, 65%...) */
  @Input({ required: true }) value!: string | number;
  
  /** Texte du badge optionnel (ex: +12 cette semaine) */
  @Input() trendLabel?: string;
  
  /** Description en bas de carte (ex: ont entre 18 et 25 ans) */
  @Input() description?: string;
  
  /** Type d'icône à afficher */
  @Input() icon?: 'whatsapp' | null = null;
}