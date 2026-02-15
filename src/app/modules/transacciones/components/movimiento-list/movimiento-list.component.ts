import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { RippleModule } from 'primeng/ripple';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';

import { MovimientoService } from '../../services/movimiento.service';
import { MovimientoResponse, MovimientoRequest } from '../../models/movimiento.model';
import { MovimientoFormComponent } from '../movimiento-form/movimiento-form.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { FileDownloadService } from '../../../../shared/services/file-download.service';

/**
 * Interfaz interna que representa el estado actual de los filtros aplicados en la tabla.
 * Se utiliza para mantener un registro de las búsquedas activas y aplicarlas al exportar archivos.
 */
interface MovimientoFilters {
    /** Filtro para el nombre o SKU de la variante del producto. */
    varianteNombre?: { value: string; matchMode?: string };
    /** Filtro para el nombre o descripción del almacén. */
    almacenNombre?: { value: string; matchMode?: string };
    /** Filtro por el tipo de movimiento (ej. COMPRA, VENTA). */
    tipo?: { value: string; matchMode?: string };
    /** Filtro por el contenido de las observaciones. */
    observaciones?: { value: string; matchMode?: string };
    /** Fecha de inicio para el rango de búsqueda (formato YYYY-MM-DD). */
    fechaInicio?: string | undefined;
    /** Fecha de fin para el rango de búsqueda (formato YYYY-MM-DD). */
    fechaFin?: string | undefined;
    /** Filtro por el usuario que registró el movimiento. */
    creadoPor?: { value: string; matchMode?: string };
}

/**
 * Componente principal para la gestión de transacciones e historial de movimientos de inventario.
 * Proporciona una tabla interactiva con soporte para filtrado avanzado, paginación (Lazy Load), 
 * exportación de reportes (PDF/CSV) y un modal para registrar nuevos movimientos.
 */
@Component({
    selector: 'app-movimiento-list',
    changeDetection: ChangeDetectionStrategy.Default,
    providers: [MessageService],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ButtonModule,
        ToolbarModule,
        ToastModule,
        DialogModule,
        TagModule,
        RippleModule,
        SelectModule,
        DatePickerModule,
        MovimientoFormComponent
    ],
    templateUrl: './movimiento-list.component.html'
})
export class MovimientoListComponent {
    // Inyección de dependencias
    private readonly _movimientoService = inject(MovimientoService);
    private readonly _messageService = inject(MessageService);
    private readonly _fileService = inject(FileDownloadService);
    /** Servicio de autenticación inyectado públicamente para validación de permisos en la plantilla. */
    public readonly authService = inject(AuthService);

    /** Almacena los filtros activos en la tabla de PrimeNG para usarlos en futuras peticiones o exportaciones. */
    private filtrosActuales: MovimientoFilters = {};

    // Signals para los datos
    /** Señal que contiene la lista de movimientos a mostrar en la tabla. */
    movimientos = signal<MovimientoResponse[]>([]);
    /** Señal con el total de registros disponibles en el servidor para la configuración del paginador. */
    totalRecords = signal(0);
    /** Señal que indica si la tabla está en proceso de carga de datos. */
    loading = signal(true);
    /** Señal que determina la cantidad de filas que se muestran por página. */
    pageSize = signal(10);
    /** Señal que controla la visibilidad del modal para crear un nuevo movimiento. */
    mostrarModal = signal(false);
    /** Objeto que rastrea qué filas de la tabla están expandidas (si se utiliza la función de row expansion). */
    expandedRows: { [key: string]: boolean } = {};

    /** Opciones disponibles para el selector de filtrado por tipo de movimiento en la cabecera de la tabla. */
    tiposMovimiento = [
        { label: 'COMPRA', value: 'COMPRA' },
        { label: 'VENTA', value: 'VENTA' },
        { label: 'ENTRADA_FABRICACION', value: 'ENTRADA_FABRICACION' },
        { label: 'ENTRADA_DEVOLUCION', value: 'ENTRADA_DEVOLUCION' },
        { label: 'SALIDA_DEFECTO', value: 'SALIDA_DEFECTO' },
        { label: 'SALIDA_REGALO', value: 'SALIDA_REGALO' }
    ];

    /**
     * Se ejecuta automáticamente por PrimeNG cuando cambia la página, el orden o se aplica un filtro.
     * Extrae todos los parámetros del evento, formatea las fechas si es necesario y solicita los datos al servidor.
     * * @param event Evento emitido por la tabla que contiene el estado de la paginación y los filtros aplicados.
     */
    cargarMovimientos(event: TableLazyLoadEvent) {
        this.loading.set(true);
        const page = (event.first ?? 0) / (event.rows ?? 10);
        const size = event.rows ?? 10;

        this.pageSize.set(size);

        // Extraer filtros del evento de PrimeNG
        const filters = event.filters || {};

        // Helper para extraer valor y matchMode
        const extract = (field: string) => {
            const meta = filters[field];
            if (!meta) return { value: undefined, matchMode: undefined };
            if (Array.isArray(meta)) {
                return { value: meta[0].value, matchMode: meta[0].matchMode };
            }
            return { value: meta?.value, matchMode: meta?.matchMode };
        };

        const tipo = extract('tipo');
        const observaciones = extract('observaciones');
        const creadoPor = extract('creadoPor');
        const productoNombre = extract('productoNombre');
        const almacenDescripcion = extract('almacenDescripcion');
        const fechaCreacion = extract('fechaCreacion');

        // Formatear fechas si existen
        let fechaInicio: string | undefined;
        let fechaFin: string | undefined;
        if (fechaCreacion.value) {
            const fechas = fechaCreacion.value;
            if (Array.isArray(fechas)) {
                if (fechas[0]) fechaInicio = this.formatDate(fechas[0]);
                if (fechas[1]) fechaFin = this.formatDate(fechas[1]);
            } else if (fechas instanceof Date) {
                fechaInicio = this.formatDate(fechas);
                fechaFin = this.formatDate(fechas);
            }
        }

        this.filtrosActuales = {
            tipo: tipo.value ? tipo : undefined,
            observaciones: observaciones.value ? observaciones : undefined,
            creadoPor: creadoPor.value ? creadoPor : undefined,
            varianteNombre: productoNombre.value ? productoNombre : undefined,
            almacenNombre: almacenDescripcion.value ? almacenDescripcion : undefined,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin
        };

        this._movimientoService.listarMovimientos(
            page,
            size,
            tipo.value,
            observaciones.value,
            observaciones.matchMode,
            creadoPor.value,
            creadoPor.matchMode,
            productoNombre.value,
            productoNombre.matchMode,
            almacenDescripcion.value,
            almacenDescripcion.matchMode,
            fechaInicio,
            fechaFin
        ).subscribe({
            next: (data) => {
                this.movimientos.set(data.content);
                this.totalRecords.set(data.totalElements);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar' });
            }
        });
    }

    /**
     * Convierte un objeto `Date` de JavaScript a una cadena con formato `YYYY-MM-DD` compatible con la API.
     * * @param date Fecha a formatear.
     * @returns Cadena de texto que representa la fecha.
     */
    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }

    /**
     * Cambia el estado para mostrar el modal del formulario de creación de movimientos.
     */
    abrirModalCrear() {
        this.mostrarModal.set(true);
    }

    /**
     * Cambia el estado para ocultar el modal del formulario de creación.
     */
    cerrarModal() {
        this.mostrarModal.set(false);
    }

    /**
     * Recibe los datos validados del componente formulario y los envía al backend para registrar un nuevo movimiento.
     * Muestra notificaciones de éxito o error, recarga la tabla y cierra el modal al finalizar correctamente.
     * * @param request Objeto DTO con los datos del nuevo movimiento a crear.
     */
    guardarMovimiento(request: MovimientoRequest) {
        this._movimientoService.crearMovimiento(request).subscribe({
            next: () => {
                this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registrado correctamente' });
                this.recargarTabla();
                this.cerrarModal();
            },
            error: () => {
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al registrar' });
            }
        });
    }

    /**
     * Solicita al servidor un reporte de los movimientos actuales (aplicando los filtros activos de la tabla) 
     * y procede a descargarlo en el navegador del usuario.
     * * @param formato El formato deseado para el archivo exportado (`pdf` o `csv`).
     */
    exportarArchivo(formato: 'pdf' | 'csv') {
        // this.loading.set(true);
        const timestamp = new Date().toISOString().split('T')[0];
        const nombreArchivo = `movimientos_${timestamp}.${formato}`;

        this._movimientoService.exportar(
            formato,
            this.filtrosActuales?.varianteNombre?.value,
            this.filtrosActuales?.varianteNombre?.matchMode,
            this.filtrosActuales?.almacenNombre?.value,
            this.filtrosActuales?.almacenNombre?.matchMode,
            this.filtrosActuales?.tipo?.value,
            this.filtrosActuales?.observaciones?.value,
            this.filtrosActuales?.observaciones?.matchMode,
            this.filtrosActuales?.fechaInicio,
            this.filtrosActuales?.fechaFin,
            this.filtrosActuales?.creadoPor?.value,
            this.filtrosActuales?.creadoPor?.matchMode
        ).subscribe({
            next: (blob) => {
                this._fileService.download(blob, nombreArchivo);
                // this.loading.set(false);
                this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Archivo descargado' });
            },
            error: () => {
                // this.loading.set(false);
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al exportar' });
            }
        });
    }

    /**
     * Método auxiliar privado que fuerza la recarga de la tabla devolviéndola a la primera página.
     */
    private recargarTabla() {
        this.cargarMovimientos({ first: 0, rows: this.pageSize() });
    }

    /**
     * Determina la clase CSS de severidad (color) a aplicar en el componente `p-tag` de PrimeNG 
     * dependiendo del tipo de movimiento, para facilitar su identificación visual.
     * * @param tipo El tipo de movimiento (ej. `COMPRA`, `VENTA`, `SALIDA_DEFECTO`).
     * @returns El string correspondiente a la severidad soportada por PrimeNG, o `undefined` por defecto.
     */
    getSeverity(tipo: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | undefined {
        switch (tipo) {
            case 'COMPRA':
            case 'ENTRADA_FABRICACION':
            case 'ENTRADA_DEVOLUCION': return 'success';
            case 'VENTA': return 'info';
            case 'SALIDA_DEFECTO': return 'danger';
            case 'SALIDA_REGALO': return 'warn';
            default: return undefined;
        }
    }
}