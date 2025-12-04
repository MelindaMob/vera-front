import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string; // TEMPORAIRE - pour debug/fallback
  user: {
    id: number;
    email: string;
    username?: string;
    is_admin?: boolean;
  };
}

export interface User {
  id: number;
  email: string;
  username?: string;
  is_admin?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  
  // Signal pour l'utilisateur connecté
  currentUser = signal<User | null>(null);
  
  // Signal pour vérifier si l'utilisateur est connecté
  isAuthenticated = signal<boolean>(false);

  isAdmin(): boolean {
    return this.currentUser()?.is_admin === true;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  constructor(private http: HttpClient) {
    // Vérifier l'authentification au démarrage
    this.checkAuthentication();
  }

  /**
   * Connexion de l'utilisateur
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    // withCredentials permet d'envoyer/recevoir les cookies
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/login`, 
      credentials,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        if (response.success) {
          // Le token est maintenant dans un cookie, pas besoin de localStorage
          // TEMPORAIRE: Si le token est dans la réponse, le stocker aussi en localStorage comme fallback
          if (response.token) {
            console.warn('[AUTH] Token reçu dans la réponse - fallback activé');
            localStorage.setItem('token', response.token);
          }
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData, { withCredentials: true });
  }

  /**
   * Déconnexion
   */
  logout(): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/logout`, 
      {},
      { withCredentials: true }
    ).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.isAuthenticated.set(false);
      })
    );
  }

  /**
   * Récupérer le token depuis le cookie (plus besoin, géré automatiquement)
   * TEMPORAIRE: Fallback vers localStorage si le cookie ne fonctionne pas
   */
  getToken(): string | null {
    // TEMPORAIRE: Fallback vers localStorage si le cookie ne fonctionne pas
    return localStorage.getItem('token');
  }

  /**
   * Vérifier l'authentification en appelant le profil
   */
  private checkAuthentication(): void {
    this.getProfile().subscribe({
      next: (response) => {
        if (response.success && response.user) {
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
        }
      },
      error: () => {
        // Non authentifié ou erreur
        this.isAuthenticated.set(false);
        this.currentUser.set(null);
      }
    });
  }

  /**
   * Récupérer le profil de l'utilisateur
   */
  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(
      `${this.apiUrl}/profile`,
      { withCredentials: true } // Important pour envoyer le cookie
    ).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.currentUser.set(response.user);
          this.isAuthenticated.set(true);
        }
      })
    );
  }

  /**
   * Obtenir les headers avec le token d'authentification
   * Plus besoin d'ajouter le token manuellement, le cookie est envoyé automatiquement
   */
  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
      // Le cookie est envoyé automatiquement par le navigateur
    });
  }
}

