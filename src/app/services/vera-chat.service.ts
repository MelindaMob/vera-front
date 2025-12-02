import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'vera';
  timestamp: Date;
  isTyping?: boolean;
  result?: VeraResult;
}

export interface VeraResult {
  status: 'verified' | 'unverified' | 'false' | 'mixed' | 'error';
  summary: string;
  sources?: Source[];
  confidence?: number;
}

export interface Source {
  title: string;
  url: string;
  date?: string;
  outlet?: string;
}

@Injectable({
  providedIn: 'root'
})
export class VeraChatService {
  private apiUrl = 'http://localhost:3000/api'; // Backend API
  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadWelcomeMessage();
  }

  private loadWelcomeMessage() {
    const welcomeMessage: Message = {
      id: this.generateId(),
      content: "Bonjour ! Je suis Vera, votre assistante de fact-checking. Posez-moi une question sur une information que vous avez vue en ligne, et je vais vérifier pour vous.",
      sender: 'vera',
      timestamp: new Date()
    };
    this.messagesSubject.next([welcomeMessage]);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  sendMessage(content: string, conversationHistory: any[] = []): Observable<any> {
    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: this.generateId(),
      content,
      sender: 'user',
      timestamp: new Date()
    };

    const currentMessages = this.messagesSubject.value;
    this.messagesSubject.next([...currentMessages, userMessage]);

    // Ajouter un indicateur de typing
    const typingMessage: Message = {
      id: this.generateId(),
      content: 'Vera vérifie votre information...',
      sender: 'vera',
      timestamp: new Date(),
      isTyping: true
    };
    this.messagesSubject.next([...this.messagesSubject.value, typingMessage]);

    // Payload avec historique pour le contexte
    const payload: any = { 
      message: content,
      conversationHistory: conversationHistory // Envoyer l'historique
    };

    // Envoyer au backend
    return new Observable(observer => {
      this.http.post<any>(`${this.apiUrl}/chat`,
        payload, // Le body avec message et conversationHistory
        { 
          headers: { 'Content-Type': 'application/json' },
          // Timeout de 70 secondes (plus que le backend)
          // @ts-ignore - timeout existe mais pas dans les types
          timeout: 70000
        }
      )
        .subscribe({
          next: (response) => {
            // Retirer le typing indicator
            const messagesWithoutTyping = this.messagesSubject.value.filter(m => !m.isTyping);
            
            // Ajouter la réponse de Vera
            const veraMessage: Message = {
              id: this.generateId(),
              content: response.response,
              sender: 'vera',
              timestamp: new Date(),
              result: response.result
            };
            
            this.messagesSubject.next([...messagesWithoutTyping, veraMessage]);
            observer.next(response);
            observer.complete();
          },
          error: (error) => {
            // Retirer le typing indicator
            const messagesWithoutTyping = this.messagesSubject.value.filter(m => !m.isTyping);
            
            // Ajouter un message d'erreur
            const errorMessage: Message = {
              id: this.generateId(),
              content: "Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler votre question ?",
              sender: 'vera',
              timestamp: new Date(),
              result: {
                status: 'error',
                summary: error.message
              }
            };
            
            this.messagesSubject.next([...messagesWithoutTyping, errorMessage]);
            observer.error(error);
          }
        });
    });
  }

  clearMessages() {
    this.loadWelcomeMessage();
  }

  getMessages(): Message[] {
    return this.messagesSubject.value;
  }
}
