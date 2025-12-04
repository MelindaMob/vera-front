import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Vérifie si l'utilisateur est connecté et est administrateur
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true; // ✅ Accès autorisé
  } else {
    // 2. Si non, affiche un avertissement et redirige vers la page de connexion
    console.warn('Tentative d\'accès à une page admin sans droits.');
    router.navigate(['/login']); // 👈 Redirection demandée
    return false; // 🚫 Accès bloqué
  }
};