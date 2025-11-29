import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { FormResponse } from '../modele/form-response.model';
// 1. Import du fichier d'environnement
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;

  constructor() {
    // 2. Connexion au serveur en utilisant l'URL dynamique selon l'environnement
    // En 'dev', ce sera http://localhost:3000
    // En 'prod', ce sera https://vera-back.onrender.com (ou ton lien ngrok plus tard)
    console.log('Tentative de connexion Socket vers :', environment.socketUrl);
    
    this.socket = io(environment.socketUrl);
  }

  // Méthode pour écouter les nouvelles réponses du formulaire
  getNewResponses(): Observable<FormResponse> {
    return new Observable(observer => {
      // On écoute l'événement 'new-form-response' émis par le serveur
      this.socket.on('new-form-response', (data: FormResponse) => {
        observer.next(data);
      });

      // Gestion des erreurs de connexion
      this.socket.on('connect_error', (err) => {
        console.error('Erreur de connexion Socket:', err);
      });
      
      // Confirmation de connexion (utile pour le debug)
      this.socket.on('connect', () => {
          console.log('Connecté au serveur Socket avec l\'ID :', this.socket.id);
      });
    });
  }

  // Méthode pour se déconnecter proprement
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}