import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  currentUser = this.authService.currentUser;
  isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    // Vérifier si l'utilisateur est connecté
    if (!this.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }

    // Si un token existe mais pas d'utilisateur, récupérer le profil
    if (this.authService.getToken() && !this.currentUser()) {
      this.loadUserProfile();
    }
  }

  loadUserProfile(): void {
    this.authService.getProfile().subscribe({
      next: () => {
        // L'utilisateur est déjà mis à jour par le service
      },
      error: (error) => {
        console.error('Erreur lors du chargement du profil:', error);
        // Si le token est invalide, déconnecter et rediriger
        if (error.status === 401 || error.status === 403) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

