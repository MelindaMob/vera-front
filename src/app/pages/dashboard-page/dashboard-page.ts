import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, KeyValuePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

// Imports internes
import { FormResponse } from '../../modele/form-response.model';
import { WebSocketService } from '../../services/web-socket.service';
import { environment } from '../../../environments/environment';

// Imports UI
import { StatCardComponent } from '../../components/stat-card/stat-card';
import { AnalysisCardComponent } from '../../components/analysis-card/analysis-card';
import { FeedbackCardComponent } from '../../components/feedback-card/feedback-card';
import { PaginationComponent } from '../../components/pagination/pagination';
// 1. Import du composant Sidebar
import { SidebarComponent } from '../../components/sidebar-dashboard/sidebar-dashboard';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    StatCardComponent,
    AnalysisCardComponent,
    FeedbackCardComponent,
    PaginationComponent,
    // 2. Ajout du composant aux imports pour qu'il soit utilisable dans le HTML
    SidebarComponent
  ],
  templateUrl: './dashboard-page.html',
  styleUrls: [] 
})
export class DashboardPageComponent implements OnInit, OnDestroy {
  
  // --- ÉTAT (STATE) ---
  rawResponses: FormResponse[] = [];
  filteredResponses: FormResponse[] = [];
  
  // Données calculées pour l'affichage
  uniqueQuestions: string[] = [];
  selectedQuestion: string = '';
  currentStats: { label: string, count: number, percentage: number }[] = [];
  activeFilter: string | null = null;

  // --- PAGINATION DASHBOARD ---
  currentPage: number = 1;
  itemsPerPage: number = 10; 

  // --- KPIS ---
  kpiTotal = 0;
  kpiTargetAudiencePercentage = 0;
  kpiTrendLabel: string = 'Chargement...';
  kpiTargetAudienceDescription: string = 'Chargement...'; // Nouvelle variable pour la description dynamique
  
  private socketSubscription!: Subscription;

  constructor(
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  // --- CYCLE DE VIE ---

  ngOnInit() {
    this.loadHistory();

    // Abonnement au WebSocket pour le temps réel
    this.socketSubscription = this.webSocketService.getNewResponses().subscribe(
      (newResponse: FormResponse) => {
        console.log('Nouvelle réponse WebSocket:', newResponse);
        
        // Traitement de la date
        this.processResponseDate(newResponse);
        
        this.rawResponses.unshift(newResponse);
        this.updateDashboard(); 
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy() {
    if (this.socketSubscription) this.socketSubscription.unsubscribe();
  }

  // --- LOGIQUE MÉTIER ---

  loadHistory() {
    const url = `${environment.apiUrl}/surveys`;
    
    this.http.get<FormResponse[]>(url).subscribe({
      next: (data) => {
        this.rawResponses = data;
        
        // Normalisation des dates pour chaque réponse
        this.rawResponses.forEach(r => this.processResponseDate(r));

        this.extractQuestions();
        this.updateDashboard(); 
        
        // Force la mise à jour de la vue
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erreur chargement historique', err)
    });
  }

  // Méthode utilitaire pour extraire la date correctement
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

  updateDashboard() {
    this.calculateKPIs();
    this.analyzeData();
  }

  calculateKPIs() {
    // KPI 1 : Total
    this.kpiTotal = this.rawResponses.length;

    // KPI 1 (Trend) : Calcul des réponses de la semaine
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay(); 
    const diff = day === 0 ? 6 : day - 1; 
    
    startOfWeek.setDate(now.getDate() - diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const weeklyCount = this.rawResponses.filter(r => {
        if (!r.date) return false;
        return r.date >= startOfWeek;
    }).length;

    this.kpiTrendLabel = `+${weeklyCount} cette semaine`;


    // KPI 2 : Cœur de cible (Calcul dynamique du segment majoritaire)
    const ageQuestion = this.uniqueQuestions.find(q => q.toLowerCase().includes('age') || q.toLowerCase().includes('âge'));
    
    // Valeurs par défaut
    this.kpiTargetAudiencePercentage = 0;
    this.kpiTargetAudienceDescription = "Pas assez de données";

    if (ageQuestion && this.kpiTotal > 0) {
      // 1. Compter les occurrences de chaque réponse à la question d'âge
      const counts: {[key: string]: number} = {};
      
      this.rawResponses.forEach(r => {
        const answer = r.content[ageQuestion];
        if (answer) {
             counts[answer] = (counts[answer] || 0) + 1;
        }
      });

      // 2. Trouver la réponse majoritaire
      let topAnswer = '';
      let maxCount = 0;

      for (const [answer, count] of Object.entries(counts)) {
        if (count > maxCount) {
          maxCount = count;
          topAnswer = answer;
        }
      }

      // 3. Mettre à jour les variables
      if (topAnswer) {
          this.kpiTargetAudiencePercentage = Math.round((maxCount / this.kpiTotal) * 100);
          
          // Formatage : on met la première lettre en minuscule pour que la phrase coule bien
          // "Entre 18 et 25 ans" -> "ont entre 18 et 25 ans"
          const formattedAnswer = topAnswer.charAt(0).toLowerCase() + topAnswer.slice(1);
          this.kpiTargetAudienceDescription = `ont ${formattedAnswer}`;
      }
    }
  }

  extractQuestions() {
    const questionsSet = new Set<string>();
    this.rawResponses.forEach(res => {
      Object.keys(res.content).forEach(key => {
        // On exclut spécifiquement "Horodateur" de la liste des questions sélectionnables
        if (key !== 'Horodateur') {
            questionsSet.add(key);
        }
      });
    });
    this.uniqueQuestions = Array.from(questionsSet);
    
    if (this.uniqueQuestions.length > 0 && !this.selectedQuestion) {
      this.selectedQuestion = this.uniqueQuestions[0];
    }
  }

  analyzeData() {
    if (this.selectedQuestion && this.activeFilter) {
      this.filteredResponses = this.rawResponses.filter(res => 
        res.content[this.selectedQuestion] === this.activeFilter
      );
    } else {
      this.filteredResponses = [...this.rawResponses];
    }

    this.currentPage = 1;

    if (!this.selectedQuestion) return;

    const counts: {[key: string]: number} = {};
    let total = 0;

    this.rawResponses.forEach(res => {
      const answer = res.content[this.selectedQuestion];
      if (answer) {
        counts[answer] = (counts[answer] || 0) + 1;
        total++;
      }
    });

    this.currentStats = Object.keys(counts).map(key => ({
      label: key,
      count: counts[key],
      percentage: Math.round((counts[key] / total) * 100)
    })).sort((a, b) => b.count - a.count);
  }

  get paginatedResponses(): FormResponse[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredResponses.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onQuestionChange() {
    this.activeFilter = null;
    this.analyzeData();
  }

  toggleFilter(label: string) {
    if (this.activeFilter === label) {
      this.activeFilter = null;
    } else {
      this.activeFilter = label;
    }
    this.analyzeData();
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }
}