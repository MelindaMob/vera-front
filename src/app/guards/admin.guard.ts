import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Vérifier si l'utilisateur est connecté
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Vérifier si l'utilisateur est admin
  const currentUser = authService.currentUser();
  const isAdmin = currentUser ? Boolean(currentUser.is_admin) : false;
  
  if (!currentUser || !isAdmin) {
    // Rediriger vers login si l'utilisateur n'est pas admin
    router.navigate(['/login']);
    return false;
  }

  return true;
};

