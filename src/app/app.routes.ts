import { Routes } from '@angular/router';
import { LoginComponent } from './modules/login/login.component';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

/**
 * Configuración de las rutas principales de la aplicación.
 * Define la navegación, la carga dinámica de componentes y la seguridad.
 *
 * **Estrategia de Seguridad:**
 * - `authGuard`: Asegura que el usuario tenga una sesión activa.
 * - `permissionGuard`: Verifica que el usuario tenga el permiso específico definido en la propiedad `data`.
 *
 * **Optimización:**
 * - Se utiliza `loadComponent` y `loadChildren` para aplicar **Lazy Loading**, cargando el código
 * de los módulos solo cuando el usuario navega a ellos.
 */
export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { 
      path: 'dashboard', 
      canActivate: [authGuard], // Protección contra usuarios no registrados añadida
      loadComponent: () => import('./modules/dashboard/components/dashboard.component')
        .then(m => m.DashboardComponent)
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    
    // Módulo de Inventario
    {
      path: 'inventario/productos',
      canActivate: [authGuard, permissionGuard], // Protección contra usuarios sin permiso añadida
      data: { permission: 'PRODUCTO_LEER' },
      loadComponent: () => import('./modules/inventario/components/producto-list/producto-list.component')
        .then(m => m.ProductoListComponent)
    },
    {
      path: 'inventario/variantes',
      canActivate: [authGuard, permissionGuard],
      data: { permission: 'VARIANTE_LEER' },
      loadComponent: () => import('./modules/inventario/components/variante-list/variante-list.component')
        .then(m => m.VarianteListComponent)
    },
    {
      path: 'inventario/tallas',
      canActivate: [authGuard, permissionGuard],
      data: { permission: 'VARIANTE_LEER' },
      loadComponent: () => import('./modules/inventario/components/talla-list/talla-list.component')
        .then(m => m.TallaListComponent)
    },
    {
      path: 'inventario/colores',
      canActivate: [authGuard, permissionGuard],
      data: { permission: 'VARIANTE_LEER' },
      loadComponent: () => import('./modules/inventario/components/color-list/color-list.component')
        .then(m => m.ColorListComponent)
    },
    {
      path: 'almacenes',
      canActivate: [authGuard, permissionGuard],
      data: { permission: 'ALMACEN_LEER'},
      loadChildren: () => import('./modules/almacenes/almacenes.routes')
        .then(m => m.ALMACENES_ROUTES)
    },

    // Módulo de Transacciones
    {
      path: 'transacciones/movimientos',
      canActivate: [authGuard, permissionGuard],
      data: { permission: 'MOVIMIENTO_LEER' },
      loadComponent: () => import('./modules/transacciones/components/movimiento-list/movimiento-list.component')
        .then(m => m.MovimientoListComponent)
    },

    // Módulo de Proyectos
    {
        path: 'proyectos',
        canActivate: [authGuard, permissionGuard],
        data: { permission: 'PROYECTO_LEER' },
        loadChildren: () => import('./modules/proyectos/proyectos.routes')
          .then(m => m.PROYECTOS_ROUTES)
    },

    // Módulo Admin
    {
      path: 'admin/usuarios',
      canActivate: [authGuard, permissionGuard],
      data: { permission: 'USUARIO_GLOBAL' }, // SOLO ACCESIBLE PARA ADMINS
      loadComponent: () => import('./modules/admin/components/usuario-list/usuario-list.component')
        .then(m => m.UsuarioListComponent)
    },
    {
      path: 'admin/roles',
      canActivate: [authGuard, permissionGuard],
      data: { permission: 'USUARIO_GLOBAL' },
      loadComponent: () => import('./modules/admin/components/rol-list/rol-list.component')
        .then(m => m.RolListComponent)
    }
];
