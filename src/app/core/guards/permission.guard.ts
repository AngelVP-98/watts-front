import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * Guardia de ruta encargado de la autorización basada en permisos específicos.
 * Verifica si el usuario actual posee el permiso necesario para acceder a la ruta solicitada.
 *
 * Este guard asume que la ruta tiene definida la propiedad `data` con una clave `permission`.
 *
 * @param route - La instantánea de la ruta activada. Se utiliza para extraer `data['permission']`.
 * @param state - El estado del router en el momento de la activación.
 * @returns `true` si el usuario tiene el permiso, o un `UrlTree` (redirección) si no lo tiene o si la configuración es errónea.
 */
export const permissionGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // 1. Obtener el permiso requerido desde la ruta (data: { permission: '...' })
    const requiredPermission = route.data['permission'];

    // 2. Si no se especificó permiso, bloqueamos por seguridad
    if (!requiredPermission) {
        return router.parseUrl('/dashboard');
    }

    // 3. Verificar si el usuario tiene ese permiso
    if (authService.hasPermission(requiredPermission)) {
        return true;
    }

    // 4. Si no tiene permiso, redirigir
    alert('No tienes permiso para acceder a esta sección.');
    return router.parseUrl('/dashboard');
};