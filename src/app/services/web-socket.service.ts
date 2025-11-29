import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { FormResponse } from '../modele/form-response.model';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;
  private readonly SERVER_URL = 'http://localhost:3000'; // L'adresse de ton backend

  constructor() {
    // Connexion au serveur
    this.socket = io(this.SERVER_URL);
  }

  // Méthode pour écouter les nouvelles réponses du formulaire
  getNewResponses(): Observable<FormResponse> {
    return new Observable(observer => {
      // On écoute l'événement 'new-form-response' émis par le serveur (voir server.ts)
      this.socket.on('new-form-response', (data: FormResponse) => {
        observer.next(data);
      });

      // Gestion des erreurs de connexion (optionnel mais utile)
      this.socket.on('connect_error', (err) => {
        console.error('Erreur de connexion Socket:', err);
      });
    });
  }

  // Méthode pour se déconnecter proprement (optionnel)
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}