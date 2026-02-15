import { Component, ChangeDetectionStrategy, inject, signal, input, output, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { PasswordModule } from 'primeng/password';
import { DialogModule } from 'primeng/dialog';
import { Usuario } from '../../models/usuario.model';
import { Rol } from '../../models/rol.model'
import { RolService } from '../../services/rol.service';

/**
 * Componente encargado de renderizar el formulario (modal) para la creación y edición de usuarios del sistema.
 * Gestiona validaciones dinámicas (como la obligatoriedad de la contraseña según el modo) y carga 
 * los roles disponibles para asignárselos al usuario.
 */
@Component({
    selector: 'app-usuario-form',
    imports: [
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        CheckboxModule,
        SelectModule,
        PasswordModule,
        DialogModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './usuario-form.component.html'
})
export class UsuarioFormComponent {
    // Inyección de dependencias
    private readonly _fb = inject(FormBuilder);
    private readonly _rolService = inject(RolService);

    // Inputs
    /**
     * Señal de entrada que controla la visibilidad del cuadro de diálogo (modal) del formulario.
     */
    visible = input.required<boolean>();
    /**
     * Señal de entrada que recibe el objeto `Usuario` a modificar si el formulario se abre en modo edición. 
     * Recibe `null` por defecto si el objetivo es registrar un usuario nuevo.
     */
    usuarioEditar = input<Usuario | null>(null);

    // Outputs
    /**
     * Evento emitido al componente padre cuando el usuario guarda correctamente el formulario.
     * Envía un objeto parcial con los datos del usuario (nuevo o modificado).
     */
    save = output<Partial<Usuario>>();
    /**
     * Evento emitido cuando el usuario cancela la operación o cierra el modal sin guardar cambios.
     */
    cancel = output<void>();

    // Signals para componentes UI
    /** Señal reactiva que indica si se está ejecutando el proceso de guardado (para bloquear la UI). */
    saving = signal(false);
    /** Señal que almacena el catálogo de roles recuperados del servidor para poblar el selector (dropdown). */
    roles = signal<Rol[]>([]);

    /**
     * Formulario reactivo tipado estrictamente (nonNullable) que administra el estado y validaciones 
     * de los campos de datos del usuario.
     */
    form = this._fb.nonNullable.group({
        id: [0],
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        passwordHash: ['', Validators.required],
        rol: [null as Rol | null, Validators.required],
        activo: [true]
    });

    /**
     * Inicializa el componente solicitando al backend la lista de roles paginada.
     * Adicionalmente, configura un `effect` reactivo que se dispara al cambiar la señal `usuarioEditar`, 
     * encargándose de rellenar el formulario en modo edición o limpiarlo en modo creación, 
     * así como de ajustar dinámicamente las validaciones del campo de contraseña.
     */
    constructor() {
        // Cargamos catálogo de roles al iniciar
        this._rolService.listar(0, 100).subscribe({
            next: (page) => this.roles.set(page.content),
            error: (err) => console.error('Error cargando roles', err)
        });

        // Effect: Maneja la lógica de llenado del formulario reactivamente
        effect(() => {
            const usuario = this.usuarioEditar();

            if (usuario) {
                // MODO EDICIÓN

                // Buscamos explícitamente el rol en la lista de opciones para asegurar la referencia
                const foundRol = this.roles().find(r => r.nombre === usuario.rol.nombre);

                this.form.patchValue({
                    id: usuario.id,
                    username: usuario.username,
                    email: usuario.email,
                    // Asignamos el valor encontrado o un fallback seguro
                    rol: usuario.rol, // Al tener id, PrimeNG lo vincula
                    activo: usuario.activo,
                    passwordHash: '' // Limpiamos el campo para que no muestre el hash
                });

                // En edición, la contraseña es opcional
                this.form.controls.passwordHash.removeValidators(Validators.required);
            } else {
                // === MODO CREACIÓN ===
                this.form.reset({ id: 0, rol: null, activo: true });

                // En creación, la contraseña es obligatoria
                this.form.controls.passwordHash.addValidators(Validators.required);
            }

            // Actualizamos el estado de validación del campo password
            this.form.controls.passwordHash.updateValueAndValidity();
        });
    }

    /**
     * Valida el formulario y procesa el payload antes de emitirlo.
     * En modo edición, excluye la contraseña del objeto si el usuario la dejó en blanco.
     * Finalmente, emite el evento `save` con los datos preparados.
     */
    onSubmit() {
        if (this.form.invalid) return;
        this.saving.set(true);

        const formValue = this.form.getRawValue();
        const usuarioOriginal = this.usuarioEditar();

        // Casteamos el rol
        const rolSeleccionado = formValue.rol as Rol;

        if (usuarioOriginal) {
            // MODO EDICIÓN

            // Construimos el payload con solo lo necesario
            const payload: any = {
                email: formValue.email,
                rol: rolSeleccionado,
                activo: formValue.activo
            };

            // Solo añadimos passwordHash si el usuario escribió una nueva
            if (formValue.passwordHash && formValue.passwordHash.trim() !== '') {
                payload.passwordHash = formValue.passwordHash;
            }

            this.save.emit(payload);

        } else {
            // MODO CREACIÓN
            const nuevoUsuario: Usuario = {
                id: 0,
                username: formValue.username,
                email: formValue.email,
                passwordHash: formValue.passwordHash,
                rol: rolSeleccionado,
                activo: formValue.activo
            };
            
            this.save.emit(nuevoUsuario);
        }

        this.saving.set(false);
    }

    /**
     * Limpia los valores actuales del formulario y emite el evento `cancel` para cerrar el modal.
     */
    onCancel() {
        this.form.reset();
        this.cancel.emit();
    }
}