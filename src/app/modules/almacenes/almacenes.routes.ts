import { Routes } from '@angular/router';
import { AlmacenListComponent } from './components/almacen-list/almacen-list.component';
import { AlmacenDetailComponent } from './components/almacen-detail/almacen-detail.component';

/**
 * Configuración de las rutas secundarias (hijas) para el módulo de Almacenes.
 * Estas rutas se cargan típicamente mediante lazy-loading desde el enrutador principal de la aplicación.
 * * Contiene las siguientes rutas:
 * - `''` (Ruta raíz del módulo): Carga el componente `AlmacenListComponent` para mostrar el listado general de almacenes.
 * - `':id'`: Carga el componente `AlmacenDetailComponent` para mostrar la vista detallada (y el stock) de un almacén específico identificado por su `id`.
 */
export const ALMACENES_ROUTES: Routes = [
    {
        path: '',
        component: AlmacenListComponent
    },
    {
        path: ':id',
        component: AlmacenDetailComponent
    }
];