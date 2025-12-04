import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si l'utilisateur est déjà vérifié et est admin, autoriser l'accès immédiatement
  if (authService.isLoggedIn() && authService.isAdmin()) {
    return true;
  }

  // Vérifier si on a un token en localStorage (fallback)
  const token = authService.getToken();
  if (token) {
    // Si on a un token, considérer comme authentifié temporairement
    // et vérifier le profil en arrière-plan
    authService.isAuthenticated.set(true);
  }

  // Sinon, vérifier le profil via une requête HTTP pour être sûr
  // Cette requête mettra à jour les signaux d'authentification
  return authService.getProfile().pipe(
    tap(response => {
      // Mettre à jour les signaux si la requête réussit
      if (response.success && response.user) {
        // Les signaux sont déjà mis à jour dans getProfile()
      }
    }),
    map(response => {
      if (response.success && response.user?.is_admin) {
    return true; // ✅ Accès autorisé
  } else {
    console.warn('Tentative d\'accès à une page admin sans droits.');
        router.navigate(['/login'], { skipLocationChange: false });
    return false; // 🚫 Accès bloqué
  }
    }),
    catchError((error) => {
      // Si erreur 401/403, vraiment pas authentifié
      if (error.status === 401 || error.status === 403) {
        console.warn('Session expirée. Redirection vers login.', error);
        authService.isAuthenticated.set(false);
        authService.currentUser.set(null);
        localStorage.removeItem('token');
        router.navigate(['/login'], { skipLocationChange: false });
        return of(false);
      } else {
        // Erreur réseau, permettre l'accès si on a un token (fallback)
        const token = authService.getToken();
        if (token && authService.isAdmin()) {
          return of(true); // Autoriser avec le token en cache
        }
        router.navigate(['/login'], { skipLocationChange: false });
        return of(false);
      }
    })
  );
};