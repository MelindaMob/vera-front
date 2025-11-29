import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormResponse } from '../../modele/form-response.model';
import { WebSocketService } from '../../services/web-socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  // On garde quelques fausses données pour l'exemple, ou on commence vide []
  responses: FormResponse[] = [
    {
      id: 1,
      date: new Date(),
      nom: 'Test Initial',
      email: 'test@example.com',
      message: 'Donnée présente au chargement'
    }
  ];

  private socketSubscription!: Subscription;

  // AJOUT : Injection de ChangeDetectorRef
  constructor(
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    // On s'abonne au flux de données temps réel
    this.socketSubscription = this.webSocketService.getNewResponses().subscribe(
      (newResponse: FormResponse) => {
        console.log('Nouvelle donnée reçue !', newResponse);
        
        // Optionnel : Convertir la date (qui arrive souvent en string JSON) en vrai objet Date
        // pour éviter des bugs d'affichage avec le DatePipe
        if (typeof newResponse.date === 'string') {
            newResponse.date = new Date(newResponse.date);
        }

        // Ajout au tableau
        this.responses.unshift(newResponse);

        // ESSENTIEL : On force la détection des changements
        // Cela dit à Angular de mettre à jour la vue immédiatement
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy() {
    // Bonnes pratiques : on se désabonne quand on quitte la page
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }
}