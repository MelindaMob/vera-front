import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Les cookies sont envoyés automatiquement par le navigateur avec withCredentials: true
  // Plus besoin d'ajouter le token dans les headers
  return next(req);
};


