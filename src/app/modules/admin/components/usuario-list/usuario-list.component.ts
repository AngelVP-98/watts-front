import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para pipes comunes
import { TableModule, TableLazyLoadEvent } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { UsuarioService } from '../../services/usuario.service';
import { Usuario } from '../../models/usuario.model';
import { UsuarioFormComponent } from '../usuario-form/usuario-form.component';

/**
 * Componente principal encargado de visualizar y administrar la lista de usuarios del sistema.
 * Proporciona una tabla interactiva con paginación (Lazy Load) y se integra con un componente 
 * de formulario modal para realizar operaciones de creación, edición y eliminación (CRUD).
 */
@Component({
  selector: 'app-usuario-list',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ToolbarModule,
    ToastModule,
    ConfirmDialogModule,
    TooltipModule,
    UsuarioFormComponent // Importamos el componente para usarlo en el HTML
  ],
  templateUrl: './usuario-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService, ConfirmationService]
})
export class UsuarioListComponent {
  private readonly _usuarioService = inject(UsuarioService);
  private readonly _messageService = inject(MessageService);
  private readonly _confirmationService = inject(ConfirmationService);

  // Estados
  /** Señal que almacena el conjunto de usuarios que se muestran actualmente en la tabla. */
  usuarios = signal<Usuario[]>([]);
  /** Señal que indica la cantidad total de registros de usuarios en la base de datos (usado para paginación). */
  totalRecords = signal(0);
  /** Señal booleana que activa o desactiva el indicador de carga (spinner) de la tabla. */
  loading = signal(true);
  /** Señal que define el número de filas o registros a mostrar por cada página. */
  pageSize = signal(10);

  // Estados para el Modal
  /** Señal que controla la visibilidad del modal para crear o editar usuarios. */
  mostrarModal = signal(false);
  /** Señal que mantiene la referencia al usuario seleccionado para su edición. Es `null` si se está creando uno nuevo. */
  usuarioSeleccionado = signal<Usuario | null>(null);

  /**
   * Carga la lista paginada de usuarios solicitándola al backend. 
   * Se ejecuta automáticamente por la tabla de PrimeNG cada vez que el usuario cambia de página o altera el tamaño de la misma.
   * * @param event Evento emitido por la tabla con la información del estado de la paginación.
   */
  cargarUsuarios(event: TableLazyLoadEvent) {
    this.loading.set(true);
    const page = (event.first ?? 0) / (event.rows ?? 10);
    const size = event.rows ?? 10;
    this.pageSize.set(size);

    this._usuarioService.listar(page, size).subscribe({
      next: (data) => {
        this.usuarios.set(data.content);
        this.totalRecords.set(data.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this._messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar usuarios' });
      }
    });
  }

  /**
   * Abre el modal del formulario preparado para registrar un nuevo usuario en el sistema.
   * Asegura que no haya ningún usuario previamente seleccionado.
   */
  abrirModalCrear() {
    this.usuarioSeleccionado.set(null);
    this.mostrarModal.set(true);
  }

  /**
   * Abre el modal del formulario cargando los datos del usuario seleccionado para su edición.
   * * @param usuario Objeto que contiene los datos del usuario a modificar.
   */
  abrirModalEditar(usuario: Usuario) {
    this.usuarioSeleccionado.set(usuario);
    this.mostrarModal.set(true);
  }

  /**
   * Cierra el modal del formulario y resetea el estado de la selección activa.
   */
  cerrarModal() {
    this.mostrarModal.set(false);
    this.usuarioSeleccionado.set(null);
  }

  /**
   * Procesa el evento de guardado emitido por el componente del formulario. 
   * Determina si debe llamar al servicio de actualización (PATCH) o de creación (POST) en función 
   * de si existe un usuario actualmente seleccionado.
   * * @param usuario Objeto (parcial o completo) emitido por el formulario con los datos a guardar.
   */
  guardarUsuario(usuario: Partial<Usuario>) {
    const usuarioEditar = this.usuarioSeleccionado();

    if (usuarioEditar) {
      // Editar usando PATCH
      this._usuarioService.actualizar(usuarioEditar.id, usuario).subscribe({
        next: () => {
          this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado' });
          this.recargarTabla();
          this.cerrarModal();
        },
        error: () => this._messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' })
      });
    } else {
      // Crear (aquí hacemos un cast seguro porque sabemos que al crear vienen todos los datos obligatorios)
      this._usuarioService.crear(usuario as Usuario).subscribe({
        next: () => {
          this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario creado' });
          this.recargarTabla();
          this.cerrarModal();
        },
        error: () => this._messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear' })
      });
    }
  }

  /**
   * Despliega un cuadro de diálogo de confirmación para validar la intención de eliminar al usuario seleccionado.
   * Si es confirmado, realiza la petición al servidor para borrarlo del sistema de forma permanente.
   * * @param usuario Objeto del usuario que se desea eliminar.
   */
  confirmarEliminacion(usuario: Usuario) {
    this._confirmationService.confirm({
      message: `¿Estás seguro de eliminar a ${usuario.username}?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this._usuarioService.eliminar(usuario.id).subscribe({
          next: () => {
            this._messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario eliminado' });
            this.recargarTabla();
          },
          error: () => this._messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar' })
        });
      }
    });
  }

  /**
   * Método auxiliar privado para forzar una recarga manual de la tabla de datos, 
   * manteniendo el número de filas seleccionado por el usuario pero volviendo a la primera página.
   */
  private recargarTabla() {
    // Forzamos la recarga llamando a cargarUsuarios con el estado actual
    this.cargarUsuarios({ first: 0, rows: this.pageSize() });
  }
}