import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableLazyLoadEvent, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { AlmacenService } from '../../services/almacen.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Almacen, AlmacenRequest } from '../../models/almacen.model';
import { AlmacenFormComponent } from '../almacen-form/almacen-form.component';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


/**
 * Componente que gestiona y visualiza el listado principal de almacenes.
 * Implementa una tabla con carga perezosa (Lazy Load), filtrado avanzado, paginación,
 * y proporciona opciones para crear, editar, eliminar y visualizar el stock de cada almacén.
 */
@Component({
  selector: 'app-almacen-list',
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
    AlmacenFormComponent,
    SelectModule,
    FormsModule,
    TagModule
  ],
  templateUrl: './almacen-list.component.html'
})
export class AlmacenListComponent {
  // Inyección de dependencias
  /** Servicio inyectado para gestionar la lógica de negocio de los almacenes. */
  private readonly _almacenService = inject(AlmacenService);
  /** Servicio inyectado para mostrar notificaciones (toasts). */
  private readonly _messageService = inject(MessageService);
  /** Servicio inyectado para mostrar diálogos de confirmación antes de acciones destructivas. */
  private readonly _confirmationService = inject(ConfirmationService);
  /** Servicio inyectado para la navegación entre rutas. */
  private readonly _router = inject(Router);
  /** Servicio inyectado para limpiar y confiar en URLs dinámicas (ej. Google Maps). */
  private readonly sanitizer = inject(DomSanitizer);
  /** Servicio público de autenticación para el control de permisos en la vista. */
  public readonly authService = inject(AuthService);

  // Signals para gestión de estado reactivo
  /** Señal que contiene la lista de almacenes actualmente cargados en la tabla. */
  almacenes = signal<Almacen[]>([]);
  /** Señal que indica la cantidad total de almacenes para la paginación. */
  totalRecords = signal(0);
  /** Señal que indica si los datos de la tabla están en proceso de carga. */
  loading = signal(true);
  /** Señal que almacena el tamaño actual de página de la tabla. */
  pageSize = signal(10);
  /** Señal que controla la visibilidad del modal para crear o editar almacenes. */
  mostrarModal = signal(false);
  /** Señal que controla la visibilidad de diálogos adicionales (si se requirieran). */
  mostrarDialogoVariantes = signal(false);
  /** Señal que almacena el almacén seleccionado actualmente para edición. */
  almacenSeleccionado = signal<Almacen | null>(null);
  
  /** Objeto que rastrea el estado de expansión de las filas de la tabla. */
  expandedRows: { [key: string]: boolean } = {}; 
  
  /** Opciones de estado disponibles para los filtros de la tabla. */
  statuses = [
    { label: 'ACTIVO', value: true },
    { label: 'INACTIVO', value: false }
  ];


  /**
   * Método ejecutado por la tabla de PrimeNG al cambiar página, orden o filtros.
   * Extrae los parámetros actuales y realiza una solicitud paginada al backend.
   * @param event - Evento de carga perezosa emitido por PrimeNG Table.
   */
  cargarAlmacenes(event: TableLazyLoadEvent) {
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
      // Fallback por si acaso no es array (modo row simple)
      return { value: meta?.value, matchMode: meta?.matchMode };
    };

    const codigo = extract('codigo');
    const descripcion = extract('descripcion');
    const activo = extract('activo');


    this._almacenService.listar(
      page,
      size,
      codigo.value,
      codigo.matchMode,
      descripcion.value,
      descripcion.matchMode,
      activo.value
    ).subscribe({
      next: (data) => {
        this.almacenes.set(data.content); // Actualizamos signal de datos
        this.totalRecords.set(data.totalElements); // Actualizamos total para el paginador
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar almacenes' });
      }
    });


  }


  /**
   * Limpia la selección de almacén y abre el modal en modo de creación.
   */
  abrirModalCrear() {
    this.almacenSeleccionado.set(null);
    this.mostrarModal.set(true);
  }

  /**
   * Establece un almacén como seleccionado y abre el modal en modo de edición.
   * @param almacen - Objeto del almacén que se va a editar.
   */
  abrirModalEditar(almacen: Almacen) {
    this.almacenSeleccionado.set(almacen);
    this.mostrarModal.set(true);
  }

  /**
   * Cierra el modal de formulario de almacén y limpia cualquier selección previa.
   */
  cerrarModal() {
    this.mostrarModal.set(false);
    this.almacenSeleccionado.set(null);
  }

  /**
   * Gestiona la lógica de guardado de un almacén evaluando el contexto actual.
   * Si existe un almacén seleccionado, realiza una petición de actualización. 
   * De lo contrario, crea un almacén nuevo.
   * @param event - Evento emitido por el formulario que incluye los datos del almacén (`request`).
   */
  guardarAlmacen(event: { request: AlmacenRequest }) {
    const almacenActual = this.almacenSeleccionado();
    const { request } = event;

    if (almacenActual) {
      // Actualizar
      this._almacenService.actualizar(almacenActual.id, request).subscribe({
        next: () => {
          this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Almacen actualizado' });
          this.recargarTabla();
          this.cerrarModal();
        }
      });
    } else {
      // Crear
      this._almacenService.crear(request).subscribe({
        next: () => {
          this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Almacen creado' });
          this.recargarTabla();
          this.cerrarModal();
        }
      });
    }
  }

  /**
   * Muestra un cuadro de diálogo de confirmación. Si el usuario acepta, 
   * envía una solicitud para dar de baja lógica o eliminar el almacén.
   * @param almacen - Almacén que se desea eliminar.
   */
  confirmarEliminacion(almacen: Almacen) {
    this._confirmationService.confirm({
      message: `¿Eliminar ${almacen.codigo}?`,
      header: 'Confirmar',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this._almacenService.eliminar(almacen.id).subscribe({
          next: () => {
            this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Almacen eliminado' });
            this.recargarTabla();
          }
        });
      }
    });
  }

  /**
   * Genera y sanea una URL de inserción de Google Maps basada en la dirección proporcionada.
   * @param direccion - Dirección, coordenadas o ubicación en texto para incrustar en el mapa.
   * @returns Una URL segura que puede ser utilizada en un iframe para mostrar la ubicación.
   */
  getGoogleMapsUrl(direccion: string): SafeResourceUrl {
    const encoded = encodeURIComponent(direccion);
    const url = `https://www.google.com/maps?q=${encoded}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /**
   * Método auxiliar para forzar la recarga de los datos en la tabla, manteniendo
   * la configuración actual de paginación a la primera página.
   */
  private recargarTabla() {
    this.cargarAlmacenes({ first: 0, rows: this.pageSize() });
  }

  /**
   * Devuelve la clase de severidad ('success' o 'danger') para aplicar el color
   * correspondiente al componente `p-tag` basado en el estado activo del almacén.
   * @param activo - Valor booleano indicando el estado del almacén.
   * @returns Retorna 'success' si el almacén está activo o 'danger' si no lo está.
   */
  getSeverity(activo: boolean): 'success' | 'danger' {
    return activo ? 'success' : 'danger';
  }

  /**
   * Navega a la vista de detalles del almacén, que típicamente muestra 
   * su inventario y stock específico.
   * @param id - Identificador único del almacén.
   */
  verStock(id: number) {
    this._router.navigate(['/almacenes', id]);
  }
}