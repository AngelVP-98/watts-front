import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
// Importamos SharedModule para asegurar que pTemplate funcione
import { SharedModule } from 'primeng/api';
import { DataViewModule } from 'primeng/dataview';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { FileTypePipe } from '../../../../shared/pipes/file-type.pipe';

/**
 * Componente encargado de renderizar la vista de cuadrícula (grid) para los archivos de un proyecto.
 * Permite visualizar los archivos mediante tarjetas, mostrando un icono representativo, y emitir eventos 
 * para acciones como descargar, previsualizar o eliminar un documento.
 */
@Component({
    selector: 'app-proyecto-detail-grid',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        DataViewModule,
        SharedModule, // CRÍTICO: Necesario para pTemplate en algunos contextos standalone
        ButtonModule,
        TooltipModule,
        FileTypePipe
    ],
    templateUrl: './proyecto-detail-grid.component.html'
})
export class ProyectoDetailGridComponent {
    /**
     * Lista de archivos a renderizar en la cuadrícula.
     * Se utiliza `any[]` temporalmente para evitar conflictos de tipado relacionados a propiedades específicas.
     */
    archivos = input.required<any[]>();
    /**
     * Número total de registros disponibles en el servidor, utilizado por PrimeNG DataView para la paginación.
     */
    totalRecords = input.required<number>();
    /**
     * Señal que indica si hay una operación de carga de datos en curso (para mostrar el spinner de PrimeNG).
     */
    loading = input.required<boolean>();
    /**
     * Cantidad de elementos que se mostrarán por cada página dentro de la cuadrícula.
     */
    rows = input.required<number>();
    /**
     * Indica si el usuario actual posee los permisos necesarios para eliminar archivos.
     * Por defecto es `false`.
     */
    canDelete = input<boolean>(false);
    /**
     * Evento emitido cuando se requiere cargar una nueva página de datos (Lazy Load de PrimeNG).
     */
    onLazyLoad = output<any>();
    /**
     * Evento emitido al accionar el botón de descarga sobre un archivo específico.
     */
    onDownload = output<any>();
    /**
     * Evento emitido al solicitar la eliminación de un archivo de la lista.
     */
    onDelete = output<any>();
    /**
     * Evento emitido al hacer clic en un documento soportado para su previsualización en el navegador.
     */
    onPreview = output<any>();

    /**
     * Determina si un archivo tiene un formato soportado para poder ser previsualizado directamente en el navegador.
     * Soporta extensiones comunes de imágenes y archivos PDF.
     * * @param fileName Nombre original del archivo, incluyendo su extensión.
     * @returns `true` si la extensión del archivo permite su previsualización, `false` en caso contrario.
     */
    isPreviewable(fileName: string): boolean {
        if (!fileName) return false;
        const ext = fileName.split('.').pop()?.toLowerCase();
        return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
    }

    /**
     * Método puente que evalúa si un archivo es previsualizable antes de emitir el evento correspondiente.
     * Evita que se intente abrir una nueva pestaña con archivos no soportados.
     * * @param archivo Objeto que contiene los datos del archivo sobre el cual se hizo la acción.
     */
    tryPreview(archivo: any) {
        if (this.isPreviewable(archivo.nombreOriginal)) {
            this.onPreview.emit(archivo);
        }
    }

    /**
     * Asigna una clase de icono (PrimeIcons) y un color de texto (TailwindCSS) adecuados 
     * basándose en la extensión del archivo proporcionado.
     * * @param fileName Nombre completo del archivo para extraer y evaluar su extensión.
     * @returns Una cadena de texto con las clases CSS a aplicar al icono (por ejemplo, `pi-file-pdf text-red-500`).
     */
    getIconClass(fileName: string): string {
        if (!fileName) return 'pi-file text-gray-500';
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return 'pi-file-pdf text-red-500';
            case 'doc': case 'docx': return 'pi-file-word text-blue-500';
            case 'xls': case 'xlsx': return 'pi-file-excel text-green-500';
            case 'jpg': case 'jpeg': case 'png': case 'gif': return 'pi-image text-purple-500';
            case 'zip': case 'rar': return 'pi-box text-orange-500';
            default: return 'pi-file text-gray-500';
        }
    }
}