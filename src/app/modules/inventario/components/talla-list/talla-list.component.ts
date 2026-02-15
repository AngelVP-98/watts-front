import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { Talla } from '../../../../shared/models/catalogo.model';
import { TallaFormComponent } from '../talla-form/talla-form.component';
import { AuthService } from '../../../../core/auth/auth.service';

/**
 * Componente que gestiona y muestra la lista de tallas disponibles.
 * Permite visualizar las tallas en una tabla y proporciona la funcionalidad
 * para abrir un modal de creación de nuevas tallas.
 */
@Component({
    selector: 'app-talla-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService],
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        ToolbarModule,
        ToastModule,
        TallaFormComponent
    ],
    templateUrl: './talla-list.component.html',
})
export class TallaListComponent implements OnInit {
    /** Servicio inyectado para gestionar las operaciones del catálogo (tallas). */
    private readonly _catalogoService = inject(CatalogoService);
    /** Servicio inyectado para mostrar notificaciones (toasts) al usuario. */
    private readonly _messageService = inject(MessageService);
    /** Servicio de autenticación público inyectado, utilizado generalmente para control de permisos en la vista. */
    public readonly authService = inject(AuthService);

    // Signals
    /** Señal reactiva que almacena la lista de tallas obtenida del servidor. */
    tallas = signal<Talla[]>([]);
    /** Señal reactiva que indica si los datos se están cargando actualmente. */
    loading = signal(true);
    /** Señal reactiva que controla la visibilidad del modal para crear una nueva talla. */
    mostrarModal = signal(false);

    /**
     * Método del ciclo de vida de Angular que se ejecuta al inicializar el componente.
     * Se encarga de disparar la carga inicial de la lista de tallas.
     */
    ngOnInit() {
        this.cargarTallas();
    }

    /**
     * Obtiene la lista de tallas desde el servicio de catálogo.
     * Actualiza el estado de carga y almacena las tallas recuperadas en la señal `tallas`.
     * En caso de error, muestra una notificación al usuario indicando el fallo.
     */
    cargarTallas() {
        this.loading.set(true);
        this._catalogoService.obtenerTallas().subscribe({
            next: (data) => {
                this.tallas.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar tallas' });
            }
        });
    }

    /**
     * Cambia el estado de la señal `mostrarModal` para abrir y hacer visible
     * el formulario de creación de tallas.
     */
    abrirModalCrear() {
        this.mostrarModal.set(true);
    }

    /**
     * Cambia el estado de la señal `mostrarModal` para cerrar y ocultar
     * el formulario de creación de tallas.
     */
    cerrarModal() {
        this.mostrarModal.set(false);
    }

    /**
     * Envía la solicitud para crear una nueva talla utilizando el servicio de catálogo.
     * Si la operación es exitosa, muestra un mensaje de éxito, recarga la lista
     * de tallas y cierra el modal. Si falla, muestra un mensaje de error.
     * * @param talla - Objeto que contiene los datos de la nueva talla a crear.
     * @param talla.nombre - El nombre o identificador de la talla a registrar.
     */
    guardarTalla(talla: { nombre: string }) {
        this._catalogoService.crearTalla(talla).subscribe({
            next: () => {
                this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Talla creada' });
                this.cargarTallas();
                this.cerrarModal();
            },
            error: () => this._messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear la talla' })
        });
    }
}