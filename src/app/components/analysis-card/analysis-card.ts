import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-analysis-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './analysis-card.html'
})
export class AnalysisCardComponent {
  @Input() title: string = 'Répartition par réponse';
  @Input() questions: string[] = [];
  @Input() selectedQuestion: string = '';
  @Input() stats: { label: string, count: number, percentage: number }[] = [];
  @Input() activeFilter: string | null = null;

  @Output() questionChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<string>();

  onSelect(value: string) {
    this.questionChange.emit(value);
  }

  toggleFilter(label: string) {
    this.filterChange.emit(label);
  }

  // Logique de couleur inspirée de la 2ème image (Dégradé de vert)
  getBarColorClass(index: number, isActive: boolean): string {
    // Si un filtre est actif, on grise les autres barres
    if (this.activeFilter && !isActive) {
      return 'bg-[#153e35] opacity-20';
    }
    
    // Si c'est la barre active ou mode normal
    // 1er : Vert foncé VERA
    if (index === 0) return 'bg-[#153e35]'; 
    // 2ème : Vert clair
    if (index === 1) return 'bg-[#86EFAC]'; 
    // 3ème : Vert très pâle
    if (index === 2) return 'bg-[#D1FAE5]'; 
    
    // Les suivants : Gris/Beige neutre
    return 'bg-[#E5E7EB]';
  }
}