import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.html'
})
export class PaginationComponent implements OnChanges {
  @Input() currentPage: number = 1;
  @Input() total: number = 0;
  @Input() limit: number = 10;
  @Output() pageChange = new EventEmitter<number>();

  totalPages: number = 0;
  pages: number[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['total'] || changes['limit'] || changes['currentPage']) {
      this.calculatePages();
    }
  }

  calculatePages() {
    this.totalPages = Math.ceil(this.total / this.limit);
    
    // Logique simple : on affiche un maximum de 5 pages autour de la page courante
    // pour éviter d'avoir une liste énorme si on a 100 pages.
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + 4);

    // Réajustement si on est proche de la fin
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    this.pages = [];
    for (let i = startPage; i <= endPage; i++) {
      this.pages.push(i);
    }
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }
}