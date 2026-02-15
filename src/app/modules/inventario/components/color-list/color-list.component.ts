import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { Color } from '../../../../shared/models/catalogo.model';
import { ColorFormComponent } from '../color-form/color-form.component';
import { AuthService } from '../../../../core/auth/auth.service';

/**
 * Componente que gestiona y muestra la lista de colores disponibles.
 * Permite visualizar los colores en una tabla y proporciona la funcionalidad
 * para abrir un modal de creación de nuevos colores.
 */
@Component({
    selector: 'app-color-list',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService],
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        ToolbarModule,
        ToastModule,
        ColorFormComponent
    ],
    templateUrl: './color-list.component.html',
})
export class ColorListComponent implements OnInit {
    /** Servicio inyectado para gestionar las operaciones del catálogo (colores). */
    private readonly _catalogoService = inject(CatalogoService);
    /** Servicio inyectado para mostrar notificaciones (toasts) al usuario. */
    private readonly _messageService = inject(MessageService);
    /** Servicio de autenticación público inyectado, utilizado generalmente para control de permisos en la vista. */
    public readonly authService = inject(AuthService);

    // Signals
    /** Señal reactiva que almacena la lista de colores obtenida del servidor. */
    colores = signal<Color[]>([]);
    /** Señal reactiva que indica si los datos se están cargando actualmente. */
    loading = signal(true);
    /** Señal reactiva que controla la visibilidad del modal para crear un nuevo color. */
    mostrarModal = signal(false);

    /**
     * Método del ciclo de vida de Angular que se ejecuta al inicializar el componente.
     * Se encarga de disparar la carga inicial de la lista de colores.
     */
    ngOnInit() {
        this.cargarColores();
    }

    /**
     * Obtiene la lista de colores desde el servicio de catálogo.
     * Actualiza el estado de carga y almacena los colores recuperados en la señal `colores`.
     * En caso de error, muestra una notificación al usuario.
     */
    cargarColores() {
        this.loading.set(true);
        this._catalogoService.obtenerColores().subscribe({
            next: (data) => {
                this.colores.set(data);
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar colores' });
            }
        });
    }

    /**
     * Cambia el estado de la señal `mostrarModal` para abrir y hacer visible
     * el formulario de creación de colores.
     */
    abrirModalCrear() {
        this.mostrarModal.set(true);
    }

    /**
     * Cambia el estado de la señal `mostrarModal` para cerrar y ocultar
     * el formulario de creación de colores.
     */
    cerrarModal() {
        this.mostrarModal.set(false);
    }

    /**
     * Envía la solicitud para crear un nuevo color utilizando el servicio de catálogo.
     * Si la operación es exitosa, muestra un mensaje de éxito, recarga la lista
     * de colores y cierra el modal. Si falla, muestra un mensaje de error.
     * * @param color - Objeto que contiene los datos del nuevo color a crear.
     * @param color.nombre - El nombre del color a registrar.
     */
    guardarColor(color: { nombre: string }) {
        this._catalogoService.crearColor(color).subscribe({
            next: () => {
                this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Color creado' });
                this.cargarColores();
                this.cerrarModal();
            },
            error: () => this._messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el color' })
        });
    }
}