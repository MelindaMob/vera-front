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
      console.warn('Erreur lors de la vérification du profil. Redirection vers login.', error);
      router.navigate(['/login'], { skipLocationChange: false });
      return of(false);
    })
  );
};