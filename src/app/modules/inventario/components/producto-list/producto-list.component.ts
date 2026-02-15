import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService, ConfirmationService, FilterMetadata } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';

import { ProductoService } from '../../services/producto.service';
import { Producto, ProductoRequest } from '../../models/producto.model';
import { ProductoFormComponent } from '../producto-form/producto-form.component';
import { CustomDatePipe } from '../../../../shared/pipes/custom-date.pipe';
import { AuthService } from '../../../../core/auth/auth.service';
import { SecureImagePipe } from '../../../../shared/pipes/secure-image.pipe';
import { FileDownloadService } from '../../../../shared/services/file-download.service';

/**
 * Interfaz para almacenar el estado actual de los filtros aplicados a la lista de productos.
 */
interface ProductoFilters {
  /** Filtro por código base del producto y su modo de coincidencia. */
  codigoBase?: { value: string, matchMode?: string };
  /** Filtro por nombre del producto y su modo de coincidencia. */
  nombre?: { value: string, matchMode?: string };
  /** Filtro por estado del producto (activo/inactivo). */
  activo?: boolean;
}

/**
 * Componente que gestiona y visualiza el catálogo de productos base.
 * Implementa una tabla con carga perezosa (Lazy Load), filtrado, paginación,
 * y opciones para crear, editar, eliminar, activar y exportar (PDF/CSV) productos.
 */
@Component({
  selector: 'app-producto-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService, ConfirmationService], // Proveedores para toast y confirmación
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
    DialogModule,
    TooltipModule,
    ProductoFormComponent,
    CustomDatePipe,
    SecureImagePipe,
    SelectModule,
    FormsModule,
    TagModule
  ],
  templateUrl: './producto-list.component.html'
})
export class ProductoListComponent {
  // Inyección de dependencias
  /** Servicio inyectado para gestionar la lógica de negocio de los productos. */
  private readonly _productoService = inject(ProductoService);
  /** Servicio inyectado para mostrar notificaciones (toasts). */
  private readonly _messageService = inject(MessageService);
  /** Servicio inyectado para mostrar diálogos de confirmación. */
  private readonly _confirmationService = inject(ConfirmationService);
  /** Servicio inyectado para la navegación entre rutas. */
  private readonly _router = inject(Router);
  /** Servicio inyectado para manejar la descarga de archivos exportados. */
  private readonly _fileService = inject(FileDownloadService);
  /** Servicio público de autenticación para control de permisos en la vista. */
  public readonly authService = inject(AuthService);

  /** Almacena los filtros actuales de la tabla para usarlos en exportaciones o recargas. */
  private filtrosActuales: ProductoFilters = {};

  // Signals para gestión de estado reactivo
  /** Señal que contiene la lista de productos actualmente cargados en la tabla. */
  productos = signal<Producto[]>([]);
  /** Señal que indica la cantidad total de productos para la paginación. */
  totalRecords = signal(0);
  /** Señal que indica si los datos están en proceso de carga. */
  loading = signal(true);
  /** Señal que almacena el tamaño actual de página de la tabla. */
  pageSize = signal(10);
  /** Señal que controla la visibilidad del modal de formulario del producto. */
  mostrarModal = signal(false);
  /** Señal que controla la visibilidad de diálogos adicionales (ej. variantes provisionales). */
  mostrarDialogoVariantes = signal(false);
  /** Señal que almacena el producto seleccionado actualmente para edición. */
  productoSeleccionado = signal<Producto | null>(null);

  /** Objeto que rastrea el estado de expansión de las filas de la tabla. */
  expandedRows: { [key: string]: boolean } = {}; // Para la expansión de filas en la tabla

  /** Opciones de estado disponibles para los filtros de la tabla. */
  statuses = [
    { label: 'ACTIVO', value: true },
    { label: 'INACTIVO', value: false }
  ];

  /**
   * Método ejecutado por la tabla de PrimeNG al cambiar página, orden o filtros.
   * Procesa los filtros actuales y realiza una solicitud paginada al backend.
   * @param event - Evento de carga perezosa emitido por PrimeNG Table.
   */
  cargarProductos(event: TableLazyLoadEvent) {
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
    const codigoBase = extract('codigoBase');
    const nombre = extract('nombre');
    const activo = extract('activo');

    // Guardamos estado local (por si necesitamos recargar o exportar)
    this.filtrosActuales = {
      codigoBase: codigoBase.value ? codigoBase : undefined,
      nombre: nombre.value ? nombre : undefined,
      activo: activo.value
    };

    this._productoService.listar(
      page,
      size,
      codigoBase.value,
      codigoBase.matchMode,
      nombre.value,
      nombre.matchMode,
      activo.value
    ).subscribe({
      next: (data) => {
        console.log('Productos recibidos:', data.content);
        this.productos.set(data.content); // Actualizamos signal de datos
        this.totalRecords.set(data.totalElements); // Actualizamos total para el paginador
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar productos' });
      }
    });
  }

  /**
   * Navega hacia la vista del catálogo de variantes aplicando un filtro específico por producto.
   * @param productoId - El identificador del producto cuyas variantes se desean visualizar.
   */
  navegarAVariantesProducto(productoId: number) {
    this._router.navigate(['/inventario/variantes'], { queryParams: { productoId } });
  }

  /**
   * Limpia la selección de producto y abre el modal en modo de creación.
   */
  abrirModalCrear() {
    this.productoSeleccionado.set(null);
    this.mostrarModal.set(true);
  }

  /**
   * Establece un producto como seleccionado y abre el modal en modo de edición.
   * @param producto - Objeto del producto que se va a editar.
   */
  abrirModalEditar(producto: Producto) {
    this.productoSeleccionado.set(producto);
    this.mostrarModal.set(true);
  }

  /**
   * Cierra el modal de formulario de producto y limpia cualquier selección previa.
   */
  cerrarModal() {
    this.mostrarModal.set(false);
    this.productoSeleccionado.set(null);
  }

  /**
   * Gestiona la lógica de guardado de un producto evaluando el contexto actual.
   * Si existe un producto seleccionado, realiza una petición de actualización. 
   * De lo contrario, crea un producto nuevo.
   * @param event - Evento emitido por el formulario que incluye los datos del producto (`request`) y la imagen adjunta (`archivo`).
   */
  guardarProducto(event: { request: ProductoRequest, archivo: File | null }) {
    const productoActual = this.productoSeleccionado();
    const { request, archivo } = event;

    if (productoActual) {
      // Actualizar
      this._productoService.actualizar(productoActual.id, request, archivo).subscribe({
        next: () => {
          this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto actualizado' });
          this.recargarTabla();
          this.cerrarModal();
        }
      });
    } else {
      // Crear
      this._productoService.crear(request, archivo).subscribe({
        next: () => {
          this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto creado' });
          this.recargarTabla();
          this.cerrarModal();
        }
      });
    }
  }

  /**
   * Muestra un cuadro de diálogo de confirmación. Si el usuario acepta, 
   * envía una solicitud para cambiar el estado del producto a inactivo (eliminación lógica).
   * @param producto - Producto que se desea dar de baja.
   */
  confirmarEliminacion(producto: Producto) {
    this._confirmationService.confirm({
      message: `¿Eliminar ${producto.nombre}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this._productoService.eliminar(producto.id).subscribe({
          next: () => {
            this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto eliminado' });
            this.recargarTabla();
          }
        });
      }
    });
  }

  /**
   * Muestra un cuadro de diálogo de confirmación. Si el usuario acepta, 
   * envía una solicitud para reactivar el producto.
   * @param producto - Producto inactivo que se desea reactivar.
   */
  confirmarActivacion(producto: Producto) {
    this._confirmationService.confirm({
      message: `¿Reactivar el producto ${producto.nombre}?`,
      header: 'Confirmar Activación',
      icon: 'pi pi-check-circle',
      accept: () => {
        this._productoService.activar(producto.id).subscribe({
          next: () => {
            this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Producto reactivado' });
            this.recargarTabla();
          }
        });
      }
    });
  }

  /**
   * Solicita al servidor un archivo con el formato especificado (PDF o CSV) que incluye 
   * los registros actuales basándose en los filtros aplicados en la vista.
   * @param formato - Tipo de archivo a exportar ('pdf' o 'csv').
   */
  exportarArchivo(formato: 'pdf' | 'csv') {
    this.loading.set(true);
    const timestamp = new Date().toISOString().split('T')[0];
    const nombreArchivo = `productos_${timestamp}.${formato}`;

    // Usamos las variables guardadas en filtrosActuales
    this._productoService.exportar(
      formato,
      this.filtrosActuales.codigoBase?.value,
      this.filtrosActuales.codigoBase?.matchMode,
      this.filtrosActuales.nombre?.value,
      this.filtrosActuales.nombre?.matchMode,
      this.filtrosActuales.activo
    ).subscribe({
      next: (blob) => {
        this._fileService.download(blob, nombreArchivo);
        this.loading.set(false);
        this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Archivo descargado' });
      },
      error: () => {
        this.loading.set(false);
        this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al exportar' });
      }
    });
  }

  /**
   * Método auxiliar para forzar la recarga de los datos en la tabla, manteniendo
   * la paginación a la primera página con el tamaño actual.
   */
  private recargarTabla() {
    this.cargarProductos({ first: 0, rows: this.pageSize() });
  }

  /**
   * Devuelve la clase de severidad ('success' o 'danger') para aplicar el color
   * correspondiente al componente `p-tag` basado en el estado activo del producto.
   * @param activo - Valor booleano indicando el estado del producto.
   * @returns Devuelve 'success' si el producto está activo o 'danger' si no lo está.
   */
  getSeverity(activo: boolean): 'success' | 'danger' {
    return activo ? 'success' : 'danger';
  }
}