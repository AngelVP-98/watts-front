import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Archivo } from '../../models/proyecto.model';
import { FileTypePipe } from '../../../../shared/pipes/file-type.pipe';

/**
 * Componente de presentación encargado de renderizar la vista de lista
 * para los archivos de un proyecto. Muestra los metadatos de los archivos y emite eventos 
 * al componente padre para manejar acciones como la descarga, eliminación y previsualización.
 */
@Component({
    selector: 'app-proyecto-detail-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, TableModule, ButtonModule, TooltipModule, FileTypePipe],
    templateUrl: './proyecto-detail-list.component.html'
})
export class ProyectoDetailListComponent {
    /**
     * Arreglo de archivos que se mostrarán en la tabla de PrimeNG.
     */
    archivos = input.required<Archivo[]>();
    /**
     * Número total de archivos disponibles en el servidor, necesario para la paginación de la tabla.
     */
    totalRecords = input.required<number>();
    /**
     * Indicador de estado que muestra un spinner en la tabla cuando los datos están siendo cargados.
     */
    loading = input.required<boolean>();
    /**
     * Cantidad de filas o elementos a mostrar por página en la tabla.
     */
    rows = input.required<number>();
    /**
     * Determina si se debe mostrar el botón de eliminar archivo en cada fila.
     * Basado en los permisos del usuario activo. Por defecto es `false`.
     */
    canDelete = input<boolean>(false);

    /**
     * Evento emitido cuando la tabla requiere cargar una nueva página de datos o cambia su ordenamiento.
     */
    onLazyLoad = output<TableLazyLoadEvent>();
    /**
     * Evento emitido cuando el usuario hace clic en el botón de descargar un archivo específico.
     */
    onDownload = output<Archivo>();
    /**
     * Evento emitido cuando el usuario hace clic en el botón de eliminar un archivo.
     */
    onDelete = output<Archivo>();
    /**
     * Evento emitido cuando el usuario solicita previsualizar un archivo directamente en el navegador.
     */
    onPreview = output<Archivo>();

    /**
     * Determina si un archivo tiene un formato que el navegador puede previsualizar de forma nativa.
     * Actualmente soporta archivos PDF y formatos de imagen comunes.
     * * @param fileName Nombre original del archivo, incluyendo su extensión.
     * @returns `true` si el archivo puede ser previsualizado, `false` si no tiene una extensión soportada o si el nombre es nulo.
     */
    isPreviewable(fileName: string): boolean {
        if (!fileName) return false;
        const ext = fileName.split('.').pop()?.toLowerCase();
        return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    }
}