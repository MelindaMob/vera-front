import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar-dashboard.html'
})
export class SidebarComponent implements OnInit {
  
  // État du menu mobile (ouvert/fermé)
  isMobileMenuOpen = false;

  menuItems = [
    { label: 'Tableau de bord', icon: 'dashboard', route: '/dashboard', active: false },
    { label: 'Tous les formulaires', icon: 'forms', route: '/forms', active: false }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkActiveRoute();

    // Écoute des changements de route pour fermer le menu automatiquement sur mobile après un clic
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkActiveRoute();
        this.isMobileMenuOpen = false; // Ferme le menu lors de la navigation
      }
    });
  }

  // Basculer l'état du menu mobile
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  private checkActiveRoute() {
    const currentUrl = this.router.url;
    this.menuItems.forEach(item => {
      item.active = currentUrl.startsWith(item.route);
    });
  }

  // Déconnexion
  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log('✅ Déconnexion réussie');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la déconnexion:', error);
        // Même en cas d'erreur, rediriger vers la page de connexion
        this.authService.currentUser.set(null);
        this.authService.isAuthenticated.set(false);
        localStorage.removeItem('token');
        this.router.navigate(['/login']);
      }
    });
  }
}