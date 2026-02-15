import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FilterMetadata, MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';

import { AlmacenService } from '../../services/almacen.service';
import { InventarioService } from '../../services/inventario.service';
import { Almacen } from '../../models/almacen.model';
import { InventarioStock } from '../../models/inventario.model';

/**
 * Interfaz para almacenar el estado actual de los filtros aplicados a la tabla de inventario.
 */
interface InventarioFilters {
    /** Filtro aplicado por nombre de producto y su modo de coincidencia. */
    producto?: { value: string, matchMode?: string };
    /** Filtro aplicado por código SKU y su modo de coincidencia. */
    sku?: { value: string, matchMode?: string };
}

/**
 * Componente encargado de visualizar los detalles de un almacén específico,
 * incluyendo su información básica y una tabla paginada con el stock de inventario 
 * actualmente disponible en dicha ubicación.
 */
@Component({
    selector: 'app-almacen-detail',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService],
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        ToastModule,
        ToolbarModule
    ],
    templateUrl: './almacen-detail.component.html'
})
export class AlmacenDetailComponent implements OnInit {
    // Inyección de dependencias
    /** Servicio inyectado para acceder a los parámetros de la ruta activa. */
    private readonly _route = inject(ActivatedRoute);
    /** Servicio inyectado para la navegación entre componentes. */
    private readonly _router = inject(Router);
    /** Servicio inyectado para mostrar notificaciones (toasts) al usuario. */
    private readonly _messageService = inject(MessageService);
    /** Servicio inyectado para obtener la información general del almacén. */
    private readonly _almacenService = inject(AlmacenService);
    /** Servicio inyectado para realizar consultas del stock de inventario. */
    private readonly _inventarioService = inject(InventarioService);

    /** Almacena los filtros actuales aplicados en la tabla de stock. */
    private filtrosActuales: InventarioFilters = {};

    /** Identificador del almacén actual, extraído de los parámetros de la URL. */
    almacenId!: number;

    // Signals para gestión de estado reactivo
    /** Señal reactiva que contiene la lista de ítems de stock (inventario) para la página actual. */
    stockItems = signal<InventarioStock[]>([]);
    /** Señal reactiva que almacena los datos básicos del almacén consultado. */
    almacen = signal<Almacen | null>(null);
    /** Señal reactiva que indica la cantidad total de registros de inventario para la paginación. */
    totalRecords = signal(0);
    /** Señal reactiva que indica si la tabla se encuentra cargando datos. */
    loading = signal(true);
    /** Señal reactiva que establece la cantidad de elementos a mostrar por página en la tabla. */
    pageSize = signal(10);

    /**
     * Método del ciclo de vida de Angular que se ejecuta al inicializar el componente.
     * Recupera el identificador del almacén desde los parámetros de la ruta e inicia
     * la carga de la información general del almacén.
     */
    ngOnInit() {
        this.almacenId = Number(this._route.snapshot.paramMap.get('id'));
        if (this.almacenId) {
            this.cargarInfoAlmacen();
        }
    }

    /**
     * Obtiene los datos básicos del almacén especificado mediante `AlmacenService`.
     * Si la petición tiene éxito, actualiza la señal `almacen`; de lo contrario, muestra un mensaje de error.
     */
    cargarInfoAlmacen() {
        this._almacenService.obtenerPorId(this.almacenId).subscribe({
            next: (data) => this.almacen.set(data),
            error: () => this._messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la info del almacén' })
        });
    }

    /**
     * Método ejecutado por la tabla de PrimeNG para cargar el stock de manera perezosa (Lazy Load).
     * Se invoca al cambiar de página, alterar el orden o aplicar filtros en las columnas.
     * Extrae los parámetros del evento y solicita los datos al servicio de inventario.
     * * @param event - Evento emitido por la tabla de PrimeNG con la configuración actual de paginación y filtros.
     */
    cargarStock(event: TableLazyLoadEvent) {
        this.loading.set(true);
        // Calculamos índice de página basado en filas y desplazamiento
        const page = (event.first ?? 0) / (event.rows ?? 10);
        const size = event.rows ?? 10;

        this.pageSize.set(size);

        // Extraer filtros del evento de PrimeNG
        const filters = event.filters || {};

        // Helper para extraer valor Y modo
        // PrimeNG en modo menú envía un array de reglas. Tomamos la primera (regla principal).
        const extract = (field: string): { value: any; matchMode?: string } => {
            const meta = filters[field];
            // Si no existe el filtro, devolvemos undefined
            if (!meta) return { value: undefined, matchMode: undefined };
            // PrimeNG puede devolver array o objeto
            if (Array.isArray(meta)) {
                return { value: meta[0].value, matchMode: meta[0].matchMode };
            }
            const m = meta as FilterMetadata;
            // Fallback por si acaso no es array (modo row simple)
            return { value: m.value, matchMode: m.matchMode };
        };

        // Extraemos usando los nombres de campo definidos en el HTML
        const productoData = extract('productoNombre');
        const skuData = extract('sku');
        const tallaData = extract('talla');
        const colorData = extract('color');

        // Guardamos estado local (por si necesitamos recargar o exportar)
        this.filtrosActuales = {
            producto: productoData.value ? productoData : undefined,
            sku: skuData.value ? skuData : undefined
        };

        this._inventarioService.listarStockPorAlmacen(
            this.almacenId,
            page,
            size,
            productoData.value,
            productoData.matchMode,
            skuData.value,
            skuData.matchMode,
            tallaData.value,
            tallaData.matchMode,
            colorData.value,
            colorData.matchMode
        ).subscribe({
            next: (data) => {
                console.log('Stock recibido:', data.content);
                this.stockItems.set(data.content);  // Actualizamos signal de datos
                this.totalRecords.set(data.totalElements);  // Actualizamos total para el paginador
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar el inventario' });
            }
        });
    }

    /**
     * Navega de regreso a la ruta principal de la lista de almacenes.
     */
    volver() {
        this._router.navigate(['/almacenes']);
    }
}