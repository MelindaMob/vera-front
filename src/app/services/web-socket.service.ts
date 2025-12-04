import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { FormResponse } from '../modele/form-response.model';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: Socket;

  constructor() {
    console.log('Tentative de connexion Socket vers :', environment.socketUrl);
    
    this.socket = io(environment.socketUrl);
  }

  getNewResponses(): Observable<FormResponse> {
    return new Observable(observer => {

      this.socket.on('new-form-response', (data: FormResponse) => {
        observer.next(data);
      });

      this.socket.on('connect_error', (err: any) => {
        console.error('Erreur de connexion Socket:', err);
      });

      this.socket.on('connect', () => {
          console.log('Connecté au serveur Socket avec l\'ID :', this.socket.id);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}