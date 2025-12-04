import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VerificationResult {
  id?: number;
  platform: 'tiktok' | 'telegram' | 'instagram' | 'youtube';
  contentType: 'video' | 'image' | 'text';
  contentUrl?: string;
  metadata?: {
    author?: string;
    description?: string;
    likes?: number;
    shares?: number;
    date?: string;
  };
  veraResult?: {
    isVerified: boolean;
    confidence: number;
    verdict: string;
    sources?: string[];
    explanation?: string;
    summary?: string;
    toolsUsed?: string[];
  };
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class VeraApiService {
  private apiUrl = environment.apiUrl; // URL de votre API vera-back

  constructor(private http: HttpClient) {}

  // Récupérer toutes les vérifications
  getAllVerifications(): Observable<VerificationResult[]> {
    return this.http.get<VerificationResult[]>(`${this.apiUrl}/verifications`);
  }

  // Récupérer les dernières vérifications (limite)
  getRecentVerifications(limit: number = 10): Observable<VerificationResult[]> {
    return this.http.get<VerificationResult[]>(`${this.apiUrl}/verifications?limit=${limit}`);
  }

  // Récupérer une vérification par ID
  getVerificationById(id: number): Observable<VerificationResult> {
    return this.http.get<VerificationResult>(`${this.apiUrl}/verifications/${id}`);
  }

  // Soumettre un nouveau contenu à vérifier (pour le bot)
  submitVerification(data: VerificationResult): Observable<VerificationResult> {
    return this.http.post<VerificationResult>(`${this.apiUrl}/verifications`, data);
  }

  // Statistiques
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/verifications/stats`);
  }

  // Vérifier un contenu depuis une URL
  verifyFromUrl(url: string): Observable<VerificationResult> {
    return this.http.post<VerificationResult>(`${this.apiUrl}/verify`, { url });
  }

  // Supprimer une vérification
  deleteVerification(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/verifications/${id}`);
  }
}
