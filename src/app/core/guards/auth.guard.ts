import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Guardia de ruta (Guard) funcional para gestionar la autenticación y autorización.
 * Protege las rutas verificando si el usuario tiene una sesión activa y si cumple con el rol requerido.
 *
 * @param route - La instantánea de la ruta activada.
 * @param state - El estado del router en el momento de la navegación.
 * @returns `true` si se permite el acceso, o un `UrlTree` para redirigir al usuario (al Login o al Dashboard).
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLogged()) {
    const userRole = authService.getRole();
    const expectedRole = route.data['role'];

    if (expectedRole && userRole !== expectedRole) {
      return router.parseUrl('/dashboard'); // Si no tiene el rol, redirige al inicio
    }
    return true;
  }

  // Si no está logueado, redirige al login
  return router.parseUrl('/login');
};