import { Component, ChangeDetectionStrategy, inject, signal, input, output, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect'; // Importar MultiSelect
import { Rol } from '../../models/rol.model';
import { Permiso } from '../../models/permiso.model';
import { PermisoService } from '../../services/permiso.service';

/**
 * Componente encargado de renderizar el formulario (modal) para la creación y edición de roles de usuario.
 * Permite asignar un nombre descriptivo al rol y seleccionar los permisos asociados al mismo 
 * mediante un componente de selección múltiple.
 */
@Component({
    selector: 'app-rol-form',
    imports: [
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        DialogModule,
        MultiSelectModule // Añadir a imports
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './rol-form.component.html'
})
export class RolFormComponent {
    private readonly _fb = inject(FormBuilder);
    private readonly _permisoService = inject(PermisoService);

    /**
     * Señal de entrada que determina si el modal (diálogo) del formulario es visible o está oculto.
     */
    visible = input.required<boolean>();
    /**
     * Señal de entrada que recibe el objeto `Rol` a modificar si estamos en modo edición. 
     * Recibe `null` por defecto si la intención es crear un nuevo rol desde cero.
     */
    rolEditar = input<Rol | null>(null);
    
    /**
     * Evento emitido al componente padre cuando el usuario guarda el formulario correctamente.
     * Envía un objeto con los datos del rol (nuevo o editado).
     */
    save = output<Partial<Rol>>();
    /**
     * Evento emitido cuando el usuario cancela la acción o cierra el cuadro de diálogo.
     */
    cancel = output<void>();

    /**
     * Señal reactiva que indica si se está ejecutando el proceso de guardado (útil para deshabilitar botones).
     */
    saving = signal(false);
    /**
     * Señal que almacena la lista completa de permisos disponibles en el sistema.
     * Estos datos se utilizan para poblar las opciones del menú desplegable `MultiSelect`.
     */
    permisosDisponibles = signal<Permiso[]>([]);

    /**
     * Formulario reactivo tipado estrictamente (nonNullable) que maneja las validaciones 
     * y el estado de los campos del rol (id, nombre y arreglo de permisos).
     */
    form = this._fb.nonNullable.group({
        id: [0],
        nombre: ['', [Validators.required, Validators.minLength(3)]],
        permisos: [[] as Permiso[]] // Campo para los permisos
    });

    /**
     * Inicializa el componente solicitando al backend la lista de permisos del sistema.
     * Además, configura un `effect` reactivo que escucha los cambios en el input `rolEditar` 
     * para poblar el formulario automáticamente con los datos del rol a modificar, 
     * o resetearlo si se abre en modo de creación.
     */
    constructor() {
        // Cargamos los permisos del sistema
        this._permisoService.listarTodos().subscribe({
            next: (data) => this.permisosDisponibles.set(data),
            error: (err) => console.error('Error cargando permisos', err)
        });

        effect(() => {
            const rol = this.rolEditar();
            if (rol) {
                this.form.patchValue({
                    id: rol.id,
                    nombre: rol.nombre,
                    permisos: rol.permisos || [] // Cargar permisos existentes
                });
            } else {
                this.form.reset({ id: 0, nombre: '', permisos: [] });
            }
        });
    }

    /**
     * Evalúa el formulario y, si es válido, extrae sus valores y los emite 
     * a través del evento `save` para que el componente padre realice la petición de guardado.
     */
    onSubmit() {
        if (this.form.invalid) return;
        this.saving.set(true);

        const formValue = this.form.getRawValue();
        this.save.emit(formValue as Rol);
        this.saving.set(false);
    }

    /**
     * Resetea el formulario eliminando los datos previos introducidos por el usuario 
     * y emite el evento `cancel` para indicar que el modal debe cerrarse.
     */
    onCancel() {
        this.form.reset();
        this.cancel.emit();
    }
}