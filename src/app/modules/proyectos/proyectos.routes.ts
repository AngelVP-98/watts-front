import { Routes } from '@angular/router';
import { ProyectoListComponent } from './components/proyecto-list/proyecto-list.component';
import { ProyectoDetailComponent } from './components/proyecto-detail/proyecto-detail.component';

/**
 * Definición de las rutas correspondientes al submódulo de Proyectos.
 * Configura la navegación interna, enlazando las rutas URL con sus componentes perspectivos.
 */
export const PROYECTOS_ROUTES: Routes = [
    {
        /** * Ruta base del módulo (`/proyectos`). 
         * Carga el componente principal que muestra el listado de todos los proyectos del usuario. 
         */
        path: '',
        component: ProyectoListComponent
    },
    {
        /** * Ruta parametrizada (`/proyectos/:id`). 
         * Carga el componente de detalle para gestionar los archivos y la configuración de un proyecto específico. 
         */
        path: ':id',
        component: ProyectoDetailComponent
    }
];