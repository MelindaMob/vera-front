import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

// Imports internes
import { FormResponse } from '../../modele/form-response.model';
import { environment } from '../../../environments/environment';
import { WebSocketService } from '../../services/web-socket.service';

// Imports UI
import { SidebarComponent } from '../../components/sidebar-dashboard/sidebar-dashboard';
import { FullFeedbackCardComponent } from '../../components/full-feedback-card/full-feedback-card';
import { PaginationComponent } from '../../components/pagination/pagination';

@Component({
  selector: 'app-forms-page',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    FullFeedbackCardComponent,
    PaginationComponent
  ],
  templateUrl: './forms-data-page.html'
})
export class FormsPageComponent implements OnInit, OnDestroy {
  
  // --- ÉTAT ---
  responses: FormResponse[] = [];
  
  // --- PAGINATION ---
  currentPage: number = 1;
  itemsPerPage: number = 2; // MODIFICATION : Passage à 2 items par page

  private socketSubscription!: Subscription;

  constructor(
    private http: HttpClient,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadData();

    // Abonnement au WebSocket pour le temps réel
    this.socketSubscription = this.webSocketService.getNewResponses().subscribe(
      (newResponse: FormResponse) => {
        console.log('Nouvelle réponse WebSocket (Forms Page):', newResponse);
        
        // Traitement de la date
        this.processResponseDate(newResponse);
        
        // Ajout en haut de liste
        this.responses.unshift(newResponse);
        
        // Force la mise à jour de la vue
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy() {
    if (this.socketSubscription) this.socketSubscription.unsubscribe();
  }

  loadData() {
    const url = `${environment.apiUrl}/surveys`;
    this.http.get<FormResponse[]>(url).subscribe({
      next: (data) => {
        this.responses = data;
        
        // 1. Normalisation des dates pour chaque réponse
        this.responses.forEach(r => this.processResponseDate(r));

        // 2. Tri par date décroissante (le plus récent en premier)
        this.responses.sort((a, b) => {
            const dateA = a.date ? a.date.getTime() : 0;
            const dateB = b.date ? b.date.getTime() : 0;
            return dateB - dateA;
        });
        
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement formulaires', err)
    });
  }

  // Méthode utilitaire pour extraire la date correctement (identique au Dashboard)
  private processResponseDate(response: FormResponse) {
    // 1. Priorité à la colonne "Horodateur" du contenu JSON
    if (response.content && response.content['Horodateur']) {
        response.date = new Date(response.content['Horodateur']);
    } 
    // 2. Sinon, on utilise la date standard si c'est une chaine
    else if (typeof response.date === 'string') {
        response.date = new Date(response.date);
    }
  }

  // --- LOGIQUE PAGINATION ---
  get paginatedResponses(): FormResponse[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.responses.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}