import { inject } from '@angular/core';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * Interceptor HTTP funcional encargado de adjuntar el token de autenticación a las peticiones
 * y gestionar los errores relacionados con la sesión.
 *
 * @param req - La solicitud HTTP original (`HttpRequest`).
 * @param next - Función que representa el siguiente paso en la cadena de interceptores (`HttpHandlerFn`).
 * @returns Un `Observable` de eventos HTTP (`HttpEvent`), que puede ser la respuesta exitosa o un error relanzado.
 */
export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const token = localStorage.getItem('token');

  let authReq = req;

  // Si hay token, lo inyectamos en los headers
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si el servidor responde 401 (Token expirado/inválido)
      if (error.status === 401) {
        console.error('Token expirado o inválido. Cerrando sesión...');
        authService.logout();
      }
      return throwError(() => error);
    })
  );
}