import { Component, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Menubar } from 'primeng/menubar';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/auth/auth.service';

/**
 * Componente visual encargado del Encabezado (Header) de la aplicación.
 * Contiene la barra de navegación principal implementada con `Menubar` de PrimeNG.
 *
 * **Características:**
 * - Renderizado dinámico de opciones de menú basado en los permisos del usuario.
 * - Botón de cierre de sesión.
 * - Utiliza estrategia `OnPush` para optimizar el rendimiento.
 */
@Component({
    selector: 'app-header',
    imports: [Menubar, ButtonModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './header.component.html'
})
export class HeaderComponent {
    /**
     * Constructor del componente.
     * @param authService Servicio de autenticación para verificar permisos y gestionar el logout.
     * @param router Servicio de enrutamiento para la navegación tras el logout.
     */
    constructor(
        public authService: AuthService,
        private router: Router
    ) { }

    /**
     * Señal computada que define la estructura del menú de navegación (`MenuItem[]`).
     *
     * Se recalcula automáticamente para construir el árbol de opciones
     * validando los permisos del usuario actual mediante `authService.hasPermission()`.
     *
     * **Secciones del Menú:**
     * 1. **Dashboard**: Accesible para todos los usuarios logueados.
     * 2. **Inventario**: Agrupa Productos, Variantes, Tallas y Colores (según permisos).
     * 3. **Transacciones**: Movimientos de inventario.
     * 4. **Almacenes**: Gestión de ubicaciones.
     * 5. **Proyectos**: Gestión de proyectos.
     * 6. **Admin**: Administración de Usuarios y Roles (solo administradores).
     *
     * @returns Un array de objetos `MenuItem` configurados para PrimeNG.
     */
    items = computed<MenuItem[]>(() => {

        // 1. Dashboard siempre visible
        const menu: MenuItem[] = [
            {
                label: 'Dashboard',
                icon: 'pi pi-home',
                routerLink: '/dashboard'
            }
        ];

        // 2. Sección Inventario (Productos y Variantes)
        // Creamos los sub-items dinámicamente según permisos
        const inventarioItems: MenuItem[] = [];

        if (this.authService.hasPermission('PRODUCTO_LEER')) {
            inventarioItems.push({
                label: 'Productos',
                icon: 'pi pi-list',
                routerLink: '/inventario/productos'
            });
        }

        if (this.authService.hasPermission('VARIANTE_LEER')) {
            inventarioItems.push({
                label: 'Variantes',
                icon: 'pi pi-tags',
                routerLink: '/inventario/variantes'
            });
            inventarioItems.push({
                label: 'Tallas',
                icon: 'pi pi-arrows-h',
                routerLink: '/inventario/tallas'
            });
            inventarioItems.push({
                label: 'Colores',
                icon: 'pi pi-palette',
                routerLink: '/inventario/colores'
            });
        }

        // Solo añadimos la pestaña "Inventario" si tiene al menos un sub-item visible
        if (inventarioItems.length > 0) {
            menu.push({
                label: 'Inventario',
                icon: 'pi pi-box',
                items: inventarioItems
            });
        }

        // 3. Sección Transacciones
        if (this.authService.hasPermission('MOVIMIENTO_LEER')) {
            menu.push({
                label: 'Movimientos',
                icon: 'pi pi-arrow-right-arrow-left',
                routerLink: '/transacciones/movimientos'
            });
        }

        // 4. Sección Almacenes
        if (this.authService.hasPermission('PRODUCTO_LEER')) {
            menu.push({
                label: 'Almacenes',
                icon: 'pi pi-building',
                routerLink: '/almacenes'
            });
        }

        // 5. Sección Proyectos
        if (this.authService.hasPermission('PROYECTO_LEER')) {
            menu.push({
                label: 'Proyectos',
                icon: 'pi pi-folder',
                routerLink: '/proyectos'
            });
        }

        // 6. Sección Admin
        if (this.authService.hasPermission('USUARIO_GLOBAL')) {
            menu.push({
                label: 'Admin',
                icon: 'pi pi-cog',
                items: [
                    {
                        label: 'Usuarios',
                        icon: 'pi pi-users',
                        routerLink: '/admin/usuarios'
                    },
                    {
                        label: 'Roles',
                        icon: 'pi pi-users',
                        routerLink: '/admin/roles'
                    }
                ]
            });
        }

        return menu;
    });

    /**
     * Cierra la sesión del usuario actual.
     */
    logout() {
        this.authService.logout(); // Borra el token
        this.router.navigate(['/login']); // Redirige al login
    }
}