import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface ConversationMessage {
  id?: number;
  conversationId?: number;
  sender: 'user' | 'vera';
  content: string;
  mediaUrls?: string[];
  createdAt?: Date;
}

export interface Conversation {
  id: number;
  userId: number;
  title: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  messages?: ConversationMessage[];
}

export interface HistoryResponse {
  success: boolean;
  conversations?: Conversation[];
  conversation?: Conversation;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistoryService {
  private apiUrl = `${environment.apiUrl}/api/history`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Récupérer l'historique des conversations
   */
  getHistory(limit: number = 20): Observable<HistoryResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<HistoryResponse>(`${this.apiUrl}?limit=${limit}`, { headers });
  }

  /**
   * Récupérer une conversation spécifique
   */
  getConversation(conversationId: number): Observable<HistoryResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<HistoryResponse>(`${this.apiUrl}/conversations/${conversationId}`, { headers });
  }

  /**
   * Créer une nouvelle conversation
   */
  createConversation(title: string, firstMessage?: string): Observable<HistoryResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<HistoryResponse>(`${this.apiUrl}/conversations`, {
      title,
      firstMessage
    }, { headers });
  }

  /**
   * Sauvegarder une conversation complète (migration localStorage)
   */
  saveConversation(title: string, messages: ConversationMessage[]): Observable<HistoryResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<HistoryResponse>(`${this.apiUrl}/conversations/save`, {
      title,
      messages
    }, { headers });
  }

  /**
   * Ajouter un message à une conversation
   */
  addMessage(
    conversationId: number,
    sender: 'user' | 'vera',
    content: string,
    mediaUrls?: string[]
  ): Observable<HistoryResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<HistoryResponse>(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      { sender, content, mediaUrls },
      { headers }
    );
  }

  /**
   * Supprimer une conversation
   */
  deleteConversation(conversationId: number): Observable<HistoryResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<HistoryResponse>(
      `${this.apiUrl}/conversations/${conversationId}`,
      { headers }
    );
  }

  /**
   * Effacer tout l'historique
   */
  clearHistory(): Observable<HistoryResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.delete<HistoryResponse>(`${this.apiUrl}/clear`, { headers });
  }

  /**
   * Migrer l'historique du localStorage vers la BDD
   */
  migrateFromLocalStorage(): Observable<any> {
    const localHistory = localStorage.getItem('conversationHistory');
    
    if (!localHistory) {
      return new Observable(observer => {
        observer.next({ success: true, message: 'Aucun historique local à migrer' });
        observer.complete();
      });
    }

    try {
      const conversations = JSON.parse(localHistory);
      const migrationPromises = conversations.map((conv: any) => 
        this.saveConversation(
          conv.query || 'Conversation',
          conv.messages || []
        ).toPromise()
      );

      return new Observable(observer => {
        Promise.all(migrationPromises)
          .then(() => {
            // Supprimer le localStorage après migration réussie
            localStorage.removeItem('conversationHistory');
            observer.next({ success: true, message: 'Migration réussie' });
            observer.complete();
          })
          .catch(error => {
            observer.error(error);
          });
      });
    } catch (error) {
      return new Observable(observer => {
        observer.error(error);
      });
    }
  }
}
