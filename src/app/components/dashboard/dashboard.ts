import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, KeyValuePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormResponse } from '../../modele/form-response.model';
import { WebSocketService } from '../../services/web-socket.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  
  rawResponses: FormResponse[] = [];
  
  filteredResponses: FormResponse[] = [];

  uniqueQuestions: string[] = [];
  selectedQuestion: string = '';
  currentStats: { label: string, count: number, percentage: number }[] = [];
  activeFilter: string | null = null;
  private socketSubscription!: Subscription;

  constructor(
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.loadHistory();

    this.socketSubscription = this.webSocketService.getNewResponses().subscribe(
      (newResponse: FormResponse) => {
        if (typeof newResponse.date === 'string') {
            newResponse.date = new Date(newResponse.date);
        }
        this.rawResponses.unshift(newResponse);
        this.analyzeData(); 
        this.cdr.detectChanges();
      }
    );
  }

  loadHistory() {
    const url = `${environment.apiUrl}/surveys`;
    this.http.get<FormResponse[]>(url).subscribe({
      next: (data) => {
        this.rawResponses = data;
        
        this.rawResponses.forEach(r => {
            if (typeof r.date === 'string') r.date = new Date(r.date);
        });

        this.extractQuestions();
        this.analyzeData();
      },
      error: (err) => console.error('Erreur historique', err)
    });
  }

  extractQuestions() {
    const questionsSet = new Set<string>();
    this.rawResponses.forEach(res => {
      Object.keys(res.content).forEach(key => questionsSet.add(key));
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

  ngOnDestroy() {
    if (this.socketSubscription) this.socketSubscription.unsubscribe();
  }
}