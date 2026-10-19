import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  const token = authService.getToken();
  
  let authReq = req;
  
  // Prepend API URL
  if (req.url.startsWith('/api')) {
    const baseUrl = environment.apiUrl || '';
    authReq = req.clone({
      url: `${baseUrl}${req.url}`
    });
  }

  // Attach token
  if (token && (authReq.url.includes('/api') || (environment.apiUrl && authReq.url.startsWith(environment.apiUrl)))) {
    authReq = authReq.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 (Unauthorized) and 403 (Forbidden) errors on protected endpoints
      const isAuthUrl = req.url.includes('/auth/login') || req.url.includes('/auth/refresh') || req.url.includes('/auth/register');
      if ((error.status === 401 || error.status === 403) && !isAuthUrl) {
        if (!authService.getRefreshToken()) {
          authService.logout(router.url);
          return throwError(() => error);
        }

        return authService.refreshToken().pipe(
          switchMap(response => {
            const newReq = req.clone({
              setHeaders: { Authorization: `Bearer ${response.accessToken}` }
            });
            return next(newReq);
          }),
          catchError(refreshError => {
            authService.logout(router.url);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

