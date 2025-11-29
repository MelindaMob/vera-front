import { Component, OnInit, OnDestroy } from '@angular/core';
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

  constructor(private webSocketService: WebSocketService) {}

  ngOnInit() {
    // On s'abonne au flux de données temps réel
    this.socketSubscription = this.webSocketService.getNewResponses().subscribe(
      (newResponse: FormResponse) => {
        console.log('Nouvelle donnée reçue !', newResponse);
        
        // On ajoute la nouvelle réponse au DÉBUT du tableau (unshift)
        // pour qu'elle apparaisse en haut de la liste
        this.responses.unshift(newResponse);
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