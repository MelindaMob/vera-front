import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VeraApiService, VerificationResult } from '../../services/vera-api.service';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './verify.html',
  styleUrl: './verify.css'
})
export class VerifyPage {
  url = signal('');
  loading = signal(false);
  result = signal<VerificationResult | null>(null);
  error = signal<string | null>(null);

  constructor(private veraApi: VeraApiService) {}

  verifyContent() {
    if (!this.url()) {
      this.error.set('Veuillez entrer une URL');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.result.set(null);

    this.veraApi.verifyFromUrl(this.url()).subscribe({
      next: (result) => {
        this.result.set(result);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Erreur lors de la vérification:', err);
        this.error.set('Erreur lors de la vérification du contenu. Veuillez réessayer.');
        this.loading.set(false);
      }
    });
  }

  reset() {
    this.url.set('');
    this.result.set(null);
    this.error.set(null);
  }
}
