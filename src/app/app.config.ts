import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { providePrimeNG } from 'primeng/config';
import Lara from '@primeuix/themes/lara';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';

/**
 * Configuración global de la aplicación.
 *
 * Este objeto define los proveedores de servicios y la configuración base necesaria
 * para arrancar la aplicación en modo Standalone.
 *
 * Configuración incluida:
 * - **Change Detection**: Se utiliza `provideZonelessChangeDetection` para una gestión del estado más eficiente sin depender de Zone.js.
 * - **Router**: Carga las rutas definidas en `app.routes.ts`.
 * - **HTTP**: Configura el cliente HTTP global y registra el `authInterceptor` para la seguridad.
 * - **UI**: Inicializa PrimeNG con el tema 'Lara'.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // Configuración correcta del cliente HTTP con interceptor funcional
    provideHttpClient(
      withInterceptors([authInterceptor]) 
    ),
    providePrimeNG({
      theme: {
          preset: Lara
      }
    })
  ]
};