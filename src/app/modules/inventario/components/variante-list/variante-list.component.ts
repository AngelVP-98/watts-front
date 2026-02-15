import { ChangeDetectionStrategy, Component, inject, input, effect, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';

import { VarianteService } from '../../services/variante.service';
import { Variante, VarianteRequest } from '../../models/variante.model';
import { VarianteFormComponent } from '../variante-form/variante-form.component';
import { CustomDatePipe } from '../../../../shared/pipes/custom-date.pipe';
import { AuthService } from '../../../../core/auth/auth.service';
import { SecureImagePipe } from '../../../../shared/pipes/secure-image.pipe';
import { FileDownloadService } from '../../../../shared/services/file-download.service';

/**
 * Interfaz para almacenar el estado actual de los filtros aplicados a la lista de variantes.
 */
interface VarianteFilters {
  /** Identificador del producto para filtrar sus variantes específicas. */
  productoId?: number;
  /** Filtro por código SKU de la variante y su modo de coincidencia. */
  sku?: { value: string; matchMode?: string };
  /** Filtro por el nombre de la talla y su modo de coincidencia. */
  talla?: { value: string; matchMode?: string };
  /** Filtro por el nombre del color y su modo de coincidencia. */
  color?: { value: string; matchMode?: string };
}

/**
 * Componente que gestiona y visualiza la lista de variantes de productos.
 * Implementa una tabla con carga perezosa (Lazy Load), filtrado avanzado, paginación,
 * y opciones para crear, editar, eliminar (baja lógica), reactivar y exportar (PDF/CSV) variantes.
 * Puede mostrar todas las variantes globales o filtrar por un producto específico mediante Input o parámetros de ruta.
 */
@Component({
  selector: 'app-variante-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService, ConfirmationService],
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
    VarianteFormComponent,
    CurrencyPipe, // Pipe nativo de Angular para formatear dinero
    CustomDatePipe,
    SecureImagePipe,
    SelectModule,
    FormsModule,
    TagModule
  ],
  templateUrl: './variante-list.component.html'
})
export class VarianteListComponent {
  // Inyección de dependencias
  /** Servicio inyectado para gestionar la lógica de negocio de las variantes. */
  private readonly _varianteService = inject(VarianteService);
  /** Servicio inyectado para mostrar notificaciones (toasts). */
  private readonly _messageService = inject(MessageService);
  /** Servicio inyectado para mostrar diálogos de confirmación. */
  private readonly _confirmationService = inject(ConfirmationService);
  /** Servicio inyectado para acceder a los parámetros de la ruta activa. */
  private readonly _route = inject(ActivatedRoute);
  /** Servicio inyectado para manejar la descarga de archivos exportados. */
  private readonly _fileService = inject(FileDownloadService);
  /** Servicio público de autenticación para control de permisos en la vista. */
  public readonly authService = inject(AuthService);

  /** Almacena los filtros actuales de la tabla para usarlos en exportaciones o recargas. */
  private filtrosActuales: VarianteFilters = {};

  // Inputs
  /** * Input opcional para filtrar la lista por un producto específico desde un componente padre. 
   */
  productoId = input<number | undefined>(undefined);

  // Signals para gestión de estado reactivo
  /** Señal que contiene la lista de variantes actualmente cargadas en la tabla. */
  variantes = signal<Variante[]>([]);
  /** Señal que indica la cantidad total de variantes para la paginación. */
  totalRecords = signal(0);
  /** Señal que indica si los datos están en proceso de carga. */
  loading = signal(true);
  /** Señal que almacena el tamaño actual de página de la tabla. */
  pageSize = signal(10);
  /** Señal que controla la visibilidad del modal de formulario de la variante. */
  mostrarModal = signal(false);
  /** Señal que almacena la variante seleccionada actualmente para edición. */
  varianteSeleccionada = signal<Variante | null>(null);
  /** Señal que almacena el ID del producto si se pasa a través de los parámetros de la URL. */
  productoIdFromRoute = signal<number | undefined>(undefined);
  /** Objeto que rastrea el estado de expansión de las filas de la tabla. */
  expandedRows = <{ [key: string]: boolean }>({});

  /**
   * Constructor del componente.
   * Se suscribe a los parámetros de consulta (queryParams) de la ruta para detectar
   * si se proporcionó un `productoId`. Si es así, lo almacena en la señal `productoIdFromRoute`.
   */
  constructor() {
    this._route.queryParams.subscribe(params => {
      if (params['productoId']) {
        this.productoIdFromRoute.set(Number(params['productoId']));
      }
    });
  }

  /**
   * Método ejecutado por la tabla de PrimeNG al cambiar página, orden o filtros.
   * Extrae los filtros actuales, determina el ID de producto a usar y realiza 
   * una solicitud paginada al backend.
   * @param event - Evento de carga perezosa emitido por PrimeNG Table.
   */
  cargarVariantes(event: TableLazyLoadEvent) {
    this.loading.set(true);
    // Calculamos índice de página basado en filas y desplazamiento
    const page = (event.first ?? 0) / (event.rows ?? 10);
    const size = event.rows ?? 10;

    this.pageSize.set(size);

    // Extraer filtros del evento de PrimeNG
    const filters = event.filters || {};

    // Helper para extraer valor Y modo
    // PrimeNG en modo menú envía un array de reglas. Tomamos la primera (regla principal).
    const extract = (field: string) => {
      const meta = filters[field];
      // Si no existe el filtro, devolvemos undefined
      if (!meta) return { value: undefined, matchMode: undefined };
      // PrimeNG puede devolver array o objeto
      if (Array.isArray(meta)) {
        return { value: meta[0].value, matchMode: meta[0].matchMode };
      }
      return { value: meta.value, matchMode: meta.matchMode };
    };

    const sku = extract('sku');
    const talla = extract('talla');
    const color = extract('color');

    // Determinamos si filtramos por producto o mostramos todas
    const productoIdActual = this.productoId() ?? this.productoIdFromRoute();

    this.filtrosActuales = {
      productoId: productoIdActual,
      sku: { value: sku.value, matchMode: sku.matchMode },
      talla: { value: talla.value, matchMode: talla.matchMode },
      color: { value: color.value, matchMode: color.matchMode }
    };

    this._varianteService.listar(
      page,
      size,
      productoIdActual,
      sku.value,
      sku.matchMode,
      talla.value,
      talla.matchMode,
      color.value,
      color.matchMode
    ).subscribe({
      next: (data) => {
        this.variantes.set(data.content);
        this.totalRecords.set(data.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar variantes' });
      }
    });
  }

  /**
   * Limpia la selección de variante y abre el modal en modo de creación.
   */
  abrirModalCrear() {
    this.varianteSeleccionada.set(null);
    this.mostrarModal.set(true);
  }

  /**
   * Establece una variante como seleccionada y abre el modal en modo de edición.
   * @param variante - Objeto de la variante que se va a editar.
   */
  abrirModalEditar(variante: Variante) {
    this.varianteSeleccionada.set(variante);
    this.mostrarModal.set(true);
  }

  /**
   * Cierra el modal de formulario de variante y limpia cualquier selección previa.
   */
  cerrarModal() {
    this.mostrarModal.set(false);
    this.varianteSeleccionada.set(null);
  }

  /**
   * Gestiona la lógica de guardado de una variante evaluando el contexto actual.
   * Si existe una variante seleccionada, realiza una petición de actualización. 
   * De lo contrario, crea una variante nueva. Incluye manejo de errores específicos por duplicidad.
   * @param event - Evento emitido por el formulario que incluye los datos de la variante (`request`) y la imagen adjunta (`archivo`).
   */
  guardarVariante(event: { request: VarianteRequest, archivo: File | null }) {
    const varianteActual = this.varianteSeleccionada();
    const { request, archivo } = event;

    if (varianteActual) {
      // ACTUALIZAR
      this._varianteService.actualizar(varianteActual.id, request, archivo).subscribe({
        next: () => {
          this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Variante actualizada' });
          this.recargarTabla();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al actualizar variante:', error);
          let detalle = error.error?.message || error.message || 'Error al actualizar';

          // Manejo de error específico de clave única (Producto + Talla + Color duplicado)
          if (detalle.includes('Duplicate entry') || detalle.includes('constraint')) {
            detalle = 'Ya existe una variante con esta combinación de producto, talla y color';
          }

          this._messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
        }
      });
    } else {
      // CREAR
      this._varianteService.crear(request, archivo).subscribe({
        next: () => {
          this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Variante creada' });
          this.recargarTabla();
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al crear variante:', error);
          let detalle = error.error?.message || error.message || 'Error al crear';

          // Manejo de error de duplicados
          if (detalle.includes('Duplicate entry') || detalle.includes('constraint')) {
            detalle = 'Ya existe una variante con esta combinación de producto, talla y color';
          }

          this._messageService.add({ severity: 'error', summary: 'Error', detail: detalle });
        }
      });
    }
  }

  /**
   * Muestra un cuadro de diálogo de confirmación. Si el usuario acepta, 
   * envía una solicitud para dar de baja lógica (eliminar) la variante.
   * @param variante - Variante que se desea eliminar.
   */
  confirmarEliminacion(variante: Variante) {
    this._confirmationService.confirm({
      message: `¿Eliminar la variante ${variante.sku}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this._varianteService.eliminar(variante.id).subscribe({
          next: () => {
            this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Variante eliminada' });
            this.recargarTabla();
          },
          error: () => {
            this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al eliminar' });
          }
        });
      }
    });
  }

  /**
   * Muestra un cuadro de diálogo de confirmación. Si el usuario acepta, 
   * envía una solicitud para reactivar una variante inactiva.
   * @param variante - Variante inactiva que se desea reactivar.
   */
  confirmarActivacion(variante: Variante) {
    this._confirmationService.confirm({
      message: `¿Reactivar la variante ${variante.sku}?`,
      header: 'Confirmar Activación',
      icon: 'pi pi-check-circle',
      accept: () => {
        this._varianteService.activar(variante.id).subscribe({
          next: () => {
            this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Variante reactivada' });
            this.recargarTabla();
          },
          error: () => {
            this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al reactivar' });
          }
        });
      }
    });
  }

  /**
   * Solicita al servidor un archivo con el formato especificado (PDF o CSV) que incluye 
   * los registros actuales basándose en los filtros aplicados en la tabla.
   * @param formato - Tipo de archivo a exportar ('pdf' o 'csv').
   */
  exportarArchivo(formato: 'pdf' | 'csv') {
    this.loading.set(true);
    const timestamp = new Date().toISOString().split('T')[0];
    const nombreArchivo = `variantes_${timestamp}.${formato}`;

    this._varianteService.exportar(
      formato,
      this.filtrosActuales?.productoId,
      this.filtrosActuales?.sku?.value,
      this.filtrosActuales?.sku?.matchMode,
      this.filtrosActuales?.talla?.value,
      this.filtrosActuales?.talla?.matchMode,
      this.filtrosActuales?.color?.value,
      this.filtrosActuales?.color?.matchMode
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
   * la configuración actual de paginación a la primera página.
   */
  private recargarTabla() {
    this.cargarVariantes({ first: 0, rows: this.pageSize() });
  }
}