import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item } from '../modele/item.model';

// 1. IMPORT IMPORTANT : Le chemin peut varier selon votre structure de dossiers
// Si vous êtes dans src/app/services, il faudra peut-être remonter de deux niveaux (../..)
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  // 2. REMPLACEMENT : On utilise la variable définie dans environment.ts
  // On utilise les backticks (`) pour insérer la variable proprement
  private apiUrl = `${environment.apiUrl}/items`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<Item[]> {
    return this.http.get<Item[]>(this.apiUrl);
  }
}