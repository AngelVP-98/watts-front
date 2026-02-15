import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { RolService } from '../../services/rol.service';
import { Rol } from '../../models/rol.model';
import { RolFormComponent } from '../rol-form/rol-form.component';

/**
 * Componente principal encargado de mostrar y gestionar la lista de roles del sistema.
 * Proporciona una tabla con paginación (Lazy Load), permite expandir filas para ver los permisos asignados,
 * y se integra con un modal para la creación, edición y eliminación de roles.
 */
@Component({
    selector: 'app-rol-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService, ConfirmationService],
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        ToolbarModule,
        ToastModule,
        ConfirmDialogModule,
        TooltipModule,
        RolFormComponent
    ],
    templateUrl: './rol-list.component.html',
})
export class RolListComponent {
    private readonly _rolService = inject(RolService);
    private readonly _messageService = inject(MessageService);
    private readonly _confirmationService = inject(ConfirmationService);

    // Signals
    /** Señal que almacena la lista de roles a mostrar en la tabla actual. */
    roles = signal<Rol[]>([]);
    /** Señal que indica el número total de roles disponibles en el servidor (para la paginación). */
    totalRecords = signal(0);
    /** Señal de estado que indica si la tabla está cargando datos desde el servidor. */
    loading = signal(true);
    /** Señal que define la cantidad de filas que se muestran por página en la tabla. */
    pageSize = signal(10);
    /** Señal que controla la visibilidad del modal de creación/edición de roles. */
    mostrarModal = signal(false);
    /** Señal que guarda la referencia al rol que está siendo editado actualmente. Es `null` si se está creando. */
    rolSeleccionado = signal<Rol | null>(null);
    
    /** * Diccionario que rastrea qué filas de la tabla están expandidas (para ver los permisos del rol).
     * La clave es un identificador único de la fila y el valor es un booleano.
     */
    expandedRows: { [key: string]: boolean } = {};

    /**
     * Carga la lista paginada de roles solicitándola al backend.
     * Este método es llamado automáticamente por PrimeNG cuando cambia la página, el ordenamiento o los filtros.
     * * @param event Evento emitido por la tabla de PrimeNG con el estado actual de la paginación.
     */
    cargarRoles(event: TableLazyLoadEvent) {
        this.loading.set(true);
        // Calculamos índice de página basado en filas y desplazamiento
        const page = (event.first ?? 0) / (event.rows ?? 10);
        const size = event.rows ?? 10;
        this.pageSize.set(size);

        this._rolService.listar(page, size).subscribe({
            next: (data) => {
                this.roles.set(data.content);
                this.totalRecords.set(data.totalElements);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar roles' });
            }
        });
    }

    /**
     * Abre el modal del formulario en modo "Creación", asegurándose de limpiar cualquier selección previa.
     */
    abrirModalCrear() {
        this.rolSeleccionado.set(null);
        this.mostrarModal.set(true);
    }

    /**
     * Abre el modal del formulario en modo "Edición", cargando los datos del rol seleccionado.
     * * @param rol Objeto que representa el rol que el usuario desea editar.
     */
    abrirModalEditar(rol: Rol) {
        this.rolSeleccionado.set(rol);
        this.mostrarModal.set(true);
    }

    /**
     * Cierra el modal del formulario y resetea la selección activa.
     */
    cerrarModal() {
        this.mostrarModal.set(false);
        this.rolSeleccionado.set(null);
    }

    /**
     * Evalúa el estado del componente para determinar si debe crear un nuevo rol o actualizar uno existente,
     * y envía la petición correspondiente al backend.
     * * @param rol Objeto con los datos del rol provenientes del formulario.
     */
    guardarRol(rol: Partial<Rol>) {
        const rolEditar = this.rolSeleccionado();

        if (rolEditar) {
            // ACTUALIZAR
            this._rolService.actualizar(rolEditar.id, rol).subscribe({
                next: () => {
                    this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rol actualizado' });
                    this.recargarTabla();
                    this.cerrarModal();
                },
                error: () => this._messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' })
            });
        } else {
            // CREAR
            this._rolService.crear(rol as Rol).subscribe({
                next: () => {
                    this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rol creado' });
                    this.recargarTabla();
                    this.cerrarModal();
                },
                error: () => this._messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' })
            });
        }
    }

    /**
     * Abre un cuadro de diálogo de confirmación para evitar borrados accidentales.
     * Si el usuario acepta, envía la petición al servidor para eliminar el rol permanentemente.
     * * @param rol Objeto que representa el rol que se desea eliminar.
     */
    confirmarEliminacion(rol: Rol) {
        this._confirmationService.confirm({
            message: `¿Estás seguro de eliminar el rol ${rol.nombre}?`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this._rolService.eliminar(rol.id).subscribe({
                    next: () => {
                        this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Rol eliminado' });
                        this.recargarTabla();
                    },
                    error: () => this._messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
                });
            }
        });
    }

    /**
     * Método auxiliar que fuerza la recarga de los datos en la tabla, volviendo al estado de la primera página
     * y manteniendo la cantidad de registros por vista seleccionada.
     */
    private recargarTabla() {
        this.cargarRoles({ first: 0, rows: this.pageSize() });
    }
}