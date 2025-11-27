import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

export interface User {
  id: number;
  email: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/api/auth';
  
  // Signal pour l'utilisateur connecté
  currentUser = signal<User | null>(null);
  
  // Signal pour vérifier si l'utilisateur est connecté
  isAuthenticated = signal<boolean>(false);

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
  register(userData: { email: string; password: string; username?: string }): Observable<any> {
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
      // Optionnel : vérifier la validité du token en appelant /profile
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
}

