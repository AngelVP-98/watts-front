import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule, FileUploadHandlerEvent } from 'primeng/fileupload';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ProyectoDetailListComponent } from '../proyecto-detail-list/proyecto-detail-list.component';
import { ProyectoDetailGridComponent } from '../proyecto-detail-grid/proyecto-detail-grid.component';

import { ProyectoService } from '../../services/proyecto.service';
import { Archivo, RolProyecto } from '../../models/proyecto.model';
import { AuthService } from '../../../../core/auth/auth.service';

/**
 * Interfaz para definir la estructura del evento de subida de archivos de PrimeNG y evitar el uso de 'any'.
 */
interface CustomUploadEvent {
    /** Arreglo de archivos seleccionados para subir */
    files: File[];
    /** Evento original del DOM */
    originalEvent: Event;
}

/**
 * Componente encargado de gestionar la vista de detalle de un proyecto.
 * * Permite listar, subir, previsualizar, descargar y eliminar archivos, así como invitar a nuevos usuarios al proyecto.
 */
@Component({
    selector: 'app-proyecto-detail',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [MessageService, ConfirmationService], // Proveedores para toast y confirmación
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ProyectoDetailListComponent, // Widget Lista
        ProyectoDetailGridComponent, // Widget Grid
        TableModule,
        ButtonModule,
        FileUploadModule,
        DialogModule,
        InputTextModule,
        SelectModule,
        ToastModule,
        ConfirmDialogModule,
        ToolbarModule
    ],
    templateUrl: './proyecto-detail.component.html'
})
export class ProyectoDetailComponent implements OnInit {
    // Inyección de dependencias
    private readonly _route = inject(ActivatedRoute);
    private readonly _router = inject(Router);
    private readonly _proyectoService = inject(ProyectoService);
    private readonly _messageService = inject(MessageService);
    private readonly _confirmationService = inject(ConfirmationService);
    private readonly _fb = inject(FormBuilder);

    /** * Servicio de autenticación inyectado públicamente para su uso en la plantilla HTML. 
     */
    public readonly authService = inject(AuthService);

    /** * Identificador único del proyecto actual obtenido de la ruta activa. 
     */
    proyectoId!: number;

    // Signals
    /** * Señal que almacena la lista de archivos asociados al proyecto. 
     */
    archivos = signal<Archivo[]>([]);
    /** * Señal que indica el número total de archivos (utilizado para la paginación). 
     */
    totalRecords = signal(0);
    /** * Señal que indica si hay una operación de carga de datos en curso. 
     */
    loading = signal(true);
    /** * Señal que define la cantidad de elementos a mostrar por página en la tabla. 
     */
    pageSize = signal(10);
    /** * Señal para alternar entre la vista de lista (`list`) y la vista de cuadrícula (`grid`). 
     */
    layout = signal<'list' | 'grid'>('list');
    /** * Señal que controla la visibilidad del cuadro de diálogo para invitar usuarios. 
     */
    dialogInvitarVisible = signal(false);

    /** * Opciones de roles disponibles a seleccionar al invitar a un nuevo usuario. 
     */
    readonly rolesOptions = [
        { label: 'Editor (Subir/Borrar)', value: RolProyecto.EDITOR },
        { label: 'Lector (Solo Ver)', value: RolProyecto.LECTOR }
    ];

    /** * Formulario reactivo para gestionar los datos de la invitación de usuarios. 
     */
    invitarForm = this._fb.group({
        username: ['', [Validators.required]],
        rol: [RolProyecto.LECTOR, [Validators.required]]
    });

    /**
     * Inicializa el componente obteniendo el ID del proyecto desde los parámetros de la ruta.
     */
    ngOnInit() {
        this.proyectoId = Number(this._route.snapshot.paramMap.get('id'));
    }

    /**
     * Carga la lista de archivos del proyecto basándose en los parámetros de paginación proporcionados.
     * * @param event Evento emitido por la tabla de PrimeNG con datos del estado de paginación.
     */
    cargarArchivos(event: TableLazyLoadEvent) {
        this.loading.set(true);
        // Calculamos índice de página basado en filas y desplazamiento
        const page = (event.first ?? 0) / (event.rows ?? 12);
        const size = event.rows ?? 12;

        this.pageSize.set(size);

        this._proyectoService.listarArchivos(this.proyectoId, page, size).subscribe({
            next: (data) => {
                this.archivos.set(data.content); // Actualizamos signal de datos
                this.totalRecords.set(data.totalElements); // Actualizamos total para el paginador
                this.loading.set(false);
            },
            error: () => {
                this.loading.set(false);
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar archivos' });
            }
        });
    }

    /**
     * Maneja el evento de selección de archivos para subir. 
     * Verifica si el archivo ya existe en la lista y solicita confirmación si es necesario reemplazarlo.
     * * @param event Evento emitido por el componente `p-fileUpload` de PrimeNG.
     */
    onUpload(event: FileUploadHandlerEvent) {
        const file = event.files[0];
        if (!file) return;

        // Comprobamos si el archivo ya existe en la lista actual
        const existe = this.archivos().some(a => a.nombreOriginal === file.name);

        if (existe) {
            // Si existe, pedimos confirmación
            this._confirmationService.confirm({
                message: `El archivo "${file.name}" ya existe. ¿Deseas reemplazarlo?`,
                header: 'Archivo Duplicado',
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: 'Reemplazar',
                rejectLabel: 'Cancelar',
                acceptButtonStyleClass: 'p-button-danger p-button-text',
                rejectButtonStyleClass: 'p-button-text',
                accept: () => {
                    this.ejecutarSubida(file, true); // True = Reemplazar
                },
                reject: () => {
                    this._messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'No se subió el archivo' });
                }
            });
        } else {
            // Si no existe, subida normal
            this.ejecutarSubida(file, false);
        }
    }

    /**
     * Llama al servicio correspondiente para subir el archivo físico al servidor.
     * * @param file Archivo físico a subir.
     * @param reemplazar Booleano que indica si se debe sobrescribir un archivo existente con el mismo nombre.
     */
    private ejecutarSubida(file: File, reemplazar: boolean) {
        this.loading.set(true); // Opcional: mostrar loading
        this._proyectoService.subirArchivo(this.proyectoId, file, reemplazar).subscribe({
            next: () => {
                const detalle = reemplazar ? 'Archivo actualizado' : 'Archivo subido correctamente';
                this._messageService.add({ severity: 'success', summary: 'Éxito', detail: detalle });
                this.recargarTabla();
                // Importante: Limpiar el input del fileUpload si es necesario, 
                // aunque en modo 'basic' y 'auto' suele limpiarse solo.
            },
            error: (err) => {
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Fallo al subir archivo' });
                this.loading.set(false);
            }
        });
    }

    /**
     * Descarga un archivo desde el servidor y fuerza su descarga en el navegador del usuario.
     * * @param archivo Objeto que representa el archivo a descargar.
     */
    descargarArchivo(archivo: Archivo) {
        this._proyectoService.descargarArchivo(archivo.id).subscribe({
            next: (blob: Blob) => {
                // Creamos una URL para el blob
                const url = window.URL.createObjectURL(blob);

                // Creamos un elemento <a> invisible para trigger el download
                const a = document.createElement('a');
                a.href = url;
                a.download = archivo.nombreOriginal;
                a.click();

                // Limpiamos
                window.URL.revokeObjectURL(url);
            },
            error: () => {
                this._messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo descargar el archivo'
                });
            }
        });
    }

    /**
     * Solicita confirmación al usuario y, si es aceptada, elimina el archivo seleccionado del proyecto.
     * * @param archivo Objeto que representa el archivo a eliminar.
     */
    eliminarArchivo(archivo: Archivo) {
        this._confirmationService.confirm({
            message: `¿Eliminar "${archivo.nombreOriginal}"?`,
            header: 'Confirmar borrado',
            icon: 'pi pi-trash',
            accept: () => {
                this._proyectoService.eliminarArchivo(archivo.id).subscribe({
                    next: () => {
                        this._messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Archivo borrado' });
                        this.recargarTabla();
                    },
                    error: () => {
                        this._messageService.add({ severity: 'error', summary: 'Error', detail: 'No tienes permisos o falló el borrado' });
                    }
                });
            }
        });
    }

    /**
     * Resetea el formulario de invitación estableciendo el rol por defecto en LECTOR y muestra el modal.
     */
    abrirDialogoInvitar() {
        this.invitarForm.reset({ rol: RolProyecto.LECTOR });
        this.dialogInvitarVisible.set(true);
    }

    /**
     * Envía los datos del formulario al servicio para añadir a un usuario existente al proyecto actual.
     */
    enviarInvitacion() {
        if (this.invitarForm.invalid) return;

        const { username, rol } = this.invitarForm.value;

        // Comprobación null
        if (!username || !rol) return;

        const request = { username, rol };

        this._proyectoService.invitarUsuario(this.proyectoId, request).subscribe({
            next: () => {
                this._messageService.add({ severity: 'success', summary: 'Enviado', detail: 'Usuario invitado al proyecto' });
                this.dialogInvitarVisible.set(false);
            },
            error: (err) => {
                const msg = err.error?.message || 'Error al invitar usuario';
                this._messageService.add({ severity: 'error', summary: 'Error', detail: msg });
            }
        });
    }

    /**
     * Descarga el archivo como Blob, le asigna su tipo MIME correcto y lo abre en una nueva pestaña para su visualización.
     * * @param archivo Objeto que representa el archivo a previsualizar.
     */
    previsualizarArchivo(archivo: Archivo) {
        this.loading.set(true);
        this._proyectoService.descargarArchivo(archivo.id).subscribe({
            next: (blob: Blob) => {
                this.loading.set(false);
                
                // 1. Forzamos el tipo MIME correcto
                const mimeType = this.getMimeType(archivo.nombreOriginal);
                
                // 2. Re-empaquetamos el Blob con el tipo correcto para evitar descarga automática
                const fileBlob = new Blob([blob], { type: mimeType });
                
                // 3. Abrimos la URL
                const url = window.URL.createObjectURL(fileBlob);
                window.open(url, '_blank');
            },
            error: () => {
                this.loading.set(false);
                this._messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo previsualizar' });
            }
        });
    }

    /**
     * Determina el tipo MIME de un archivo basándose en su extensión para garantizar una previsualización adecuada en el navegador.
     * * @param fileName Nombre completo del archivo incluyendo su extensión.
     * @returns El tipo MIME correspondiente (ej. `application/pdf`, `image/jpeg`) o `application/octet-stream` por defecto.
     */
    private getMimeType(fileName: string): string {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return 'application/pdf';
            case 'jpg': case 'jpeg': return 'image/jpeg';
            case 'png': return 'image/png';
            case 'gif': return 'image/gif';
            case 'webp': return 'image/webp';
            default: return 'application/octet-stream';
        }
    }

    /**
     * Redirige al usuario de vuelta a la vista principal del listado de proyectos.
     */
    volver() {
        this._router.navigate(['/proyectos']);
    }

    /**
     * Método auxiliar para forzar la recarga de los datos en la tabla, volviendo a la primera página.
     */
    private recargarTabla() {
        // Se llama a cargarArchivos reiniciando a la primera página o manteniendo el estado actual según necesidad
        this.cargarArchivos({ first: 0, rows: this.pageSize() });
    }
}