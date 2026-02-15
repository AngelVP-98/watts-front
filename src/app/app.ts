import { Component, signal, inject, computed } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './shared/components/header/header.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

/**
 * Componente raíz de la aplicación.
 * Actúa como el contenedor principal de la interfaz de usuario.
 *
 * Responsabilidades:
 * 1. Definir la estructura base del layout (Header + Contenido dinámico mediante `RouterOutlet`).
 * 2. Gestionar la visibilidad de elementos globales basándose en la ruta actual
 * de manera totalmente reactiva (Zoneless-ready).
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  /** Título de la aplicación. */
  protected readonly title = signal('Inventario-Watts');
  /** Servicio de Router inyectado para monitorizar la navegación. */
  private readonly _router = inject(Router); // Inyección con inject()

  /**
   * Señal reactiva (Read-only) derivada de los eventos del Router.
   * Utiliza `toSignal` para transformar el Observable de eventos en una señal.
   *
   * Filtra solo los eventos `NavigationEnd` para actualizarse únicamente cuando
   * una navegación ha finalizado exitosamente.
   */
  private readonly _currentUrl = toSignal(
    this._router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ),
    { initialValue: null }
  );

  /**
   * Señal computada que determina dinámicamente si se debe mostrar el componente Header.
   * Se recalcula automáticamente cada vez que cambia la señal `_currentUrl`.
   *
   * Lógica:
   * - Oculta el header si la ruta es '/login'.
   * - Muestra el header en el resto de la aplicación (Dashboard, Inventario, etc.).
   * - Maneja el caso borde de la carga inicial cuando aún no se ha disparado `NavigationEnd`.
   */
  protected readonly showHeader = computed(() => {
    const event = this._currentUrl();
    // Si no hay evento (carga inicial) o la url incluye 'login', ocultamos
    if (!event) return !this._router.url.includes('login');
    return !event.urlAfterRedirects.includes('login');
  });
}
