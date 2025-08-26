import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { LoggerService } from '@core/services/loggerService/logger.service';
import { catchError, finalize, Observable, throwError } from 'rxjs';

export const httpInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const logger = inject(LoggerService);
  const router = inject(Router);

  // Start loading

  // Add JWT token
  const token = localStorage.getItem('token');
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        logger.error('Unauthorized access - redirecting to login');
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        logger.warn('Forbidden access');
      } else {
        logger.error('HTTP Error', error);
      }
      return throwError(() => error);
    }),
    finalize(() => {
      // Stop loading
    })
  );
};
