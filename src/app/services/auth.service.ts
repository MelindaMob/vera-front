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
  token: string;
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
    // Vérifier si un token existe au démarrage
    this.checkStoredToken();
  }

  /**
   * Connexion de l'utilisateur
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.success && response.token) {
          // Stocker le token
          localStorage.setItem('token', response.token);
          // Mettre à jour l'utilisateur courant
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
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem('token');
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  /**
   * Récupérer le token depuis le localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Vérifier si un token est stocké
   */
  private checkStoredToken(): void {
    const token = this.getToken();
    if (token) {
      this.isAuthenticated.set(true);
    }
  }

  /**
   * Récupérer le profil de l'utilisateur
   */
  getProfile(): Observable<{ success: boolean; user: User }> {
    return this.http.get<{ success: boolean; user: User }>(`${this.apiUrl}/profile`).pipe(
      tap(response => {
        if (response.success && response.user) {
          this.currentUser.set(response.user);
        }
      })
    );
  }

  /**
   * Obtenir les headers avec le token d'authentification
   */
  getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }
}

