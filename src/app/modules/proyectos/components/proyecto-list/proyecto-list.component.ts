import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select'; 
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ProyectoService } from '../../services/proyecto.service';
import { Proyecto, ProyectoRequest } from '../../models/proyecto.model';
import { AuthService } from '../../../../core/auth/auth.service';

/**
 * Componente principal encargado de mostrar y gestionar la lista de proyectos del usuario.
 * Proporciona un listado con paginación y filtrado (Lazy Load), además de permitir 
 * crear, editar, eliminar y acceder a los detalles de cada proyecto.
 */
@Component({
    selector: 'app-proyecto-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule, 
        ReactiveFormsModule,
        TableModule, 
        ButtonModule, 
        DialogModule, 
        InputTextModule, 
        TextareaModule, 
        ToastModule, 
        ConfirmDialogModule,
        ToolbarModule,
        SelectModule,
        FormsModule
    ],
    providers: [MessageService, ConfirmationService],
    templateUrl: './proyecto-list.component.html'
})
export class ProyectoListComponent {
    // Inyección de dependencias
    private readonly _proyectoService = inject(ProyectoService);
    private readonly _messageService = inject(MessageService);
    private readonly _confirmationService = inject(ConfirmationService);
    private readonly _router = inject(Router);
    private readonly _fb = inject(FormBuilder);
    /** * Servicio de autenticación inyectado públicamente para verificar permisos en la plantilla HTML. 
     */
    public readonly authService = inject(AuthService);

    // Signals
    /** Señal que almacena el listado actual de proyectos a mostrar en la tabla. */
    proyectos = signal<Proyecto[]>([]);
    /** Señal que indica el total de proyectos disponibles en el servidor (usado para paginación). */
    totalRecords = signal(0);
    /** Señal de estado que muestra un indicador de carga en la tabla. Inicia en true para esperar el evento Lazy de PrimeNG. */
    loading = signal(true);
    /** Señal que define la cantidad de proyectos que se muestran por página. */
    pageSize = signal(10);
    /** Señal que controla la visibilidad del cuadro de diálogo (modal) para crear/editar proyectos. */
    dialogVisible = signal(false);
    /** Señal booleana que indica si el formulario modal se está utilizando para editar (true) o para crear (false). */
    isEditMode = signal(false);
    /** Señal que guarda el ID del proyecto que se está editando en este momento. Es null si se está creando. */
    currentId = signal<number | null>(null);

    /** * Formulario reactivo utilizado para capturar y validar los datos al crear o editar un proyecto. 
     */
    proyectoForm = this._fb.group({
        nombre: ['', [Validators.required]],
        descripcion: ['', [Validators.maxLength(500)]]
    });

    /**
     * Carga la lista de proyectos desde el backend. Se ejecuta automáticamente por PrimeNG al cambiar
     * de página, ordenar o aplicar filtros en la tabla (Lazy Load).
     * * @param event Evento emitido por la tabla de PrimeNG con el estado actual de paginación y filtros.
     */
    cargarProyectos(event: TableLazyLoadEvent) {
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

        const nombre = extract('nombre');
        const descripcion = extract('descripcion');

        this._proyectoService.listarMisProyectos(
            page, 
            size,
            nombre.value,
            nombre.matchMode,
            descripcion.value,
            descripcion.matchMode
        ).subscribe({
            next: (data) => {
                this.proyectos.set(data.content); // Actualizamos signal de datos
                this.totalRecords.set(data.totalElements); // Actualizamos total para el paginador
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los proyectos' });
            }
        });
    }

    /**
     * Prepara el formulario y abre el cuadro de diálogo en modo de creación para un nuevo proyecto.
     */
    abrirDialogoCrear() {
        this.isEditMode.set(false);
        this.currentId.set(null);
        this.proyectoForm.reset();
        this.dialogVisible.set(true);
    }

    /**
     * Rellena el formulario con los datos del proyecto seleccionado y abre el cuadro de diálogo en modo edición.
     * * @param proyecto Objeto con los datos del proyecto que se desea editar.
     */
    abrirDialogoEditar(proyecto: Proyecto) {
        this.isEditMode.set(true);
        this.currentId.set(proyecto.id);
        this.proyectoForm.patchValue({
            nombre: proyecto.nombre,
            descripcion: proyecto.descripcion
        });
        this.dialogVisible.set(true);
    }

    /**
     * Evalúa los datos del formulario y llama al servicio correspondiente para crear o actualizar 
     * el proyecto en el servidor, dependiendo del modo (creación o edición).
     */
    guardarProyecto() {
        if (this.proyectoForm.invalid) return;

        // Casteo seguro de los valores del formulario al modelo request
        const formValue = this.proyectoForm.value;
        const request: ProyectoRequest = {
            nombre: formValue.nombre!,
            descripcion: formValue.descripcion || ''
        };

        if (this.isEditMode() && this.currentId()) {
            this._proyectoService.actualizarProyecto(this.currentId()!, request).subscribe({
                next: () => {
                    this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proyecto actualizado' });
                    this.dialogVisible.set(false);
                    this.recargarTabla();
                },
                error: () => this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Fallo al actualizar' })
            });
        } else {
            this._proyectoService.crearProyecto(request).subscribe({
                next: () => {
                    this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Proyecto creado' });
                    this.dialogVisible.set(false);
                    this.recargarTabla();
                },
                error: () => this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Fallo al crear' })
            });
        }
    }

    /**
     * Solicita confirmación al usuario mediante un modal y, en caso afirmativo, envía la petición 
     * al servidor para eliminar permanentemente el proyecto y sus archivos asociados.
     * * @param proyecto El proyecto que se desea eliminar.
     */
    eliminarProyecto(proyecto: Proyecto) {
        this._confirmationService.confirm({
            message: `¿Seguro que deseas eliminar "${proyecto.nombre}"? Se borrarán todos los archivos.`,
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this._proyectoService.eliminarProyecto(proyecto.id).subscribe({
                    next: () => {
                        this._messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Proyecto eliminado' });
                        this.recargarTabla();
                    },
                    error: () => this._messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
                });
            }
        });
    }

    /**
     * Navega a la vista de detalles del proyecto especificado usando el router de Angular.
     * * @param id Identificador único del proyecto al que se quiere acceder.
     */
    verDetalle(id: number) {
        this._router.navigate(['/proyectos', id]);
    }

    /**
     * Método auxiliar privado que fuerza la recarga de la tabla al estado base 
     * (primera página) utilizando la cantidad de filas actuales.
     */
    private recargarTabla() {
        // Se llama a cargarArchivos reiniciando a la primera página o manteniendo el estado actual según necesidad
        this.cargarProyectos({ first: 0, rows: this.pageSize() });
    }
}