import { Component, ChangeDetectionStrategy, inject, signal, input, output, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';

/**
 * Componente de formulario para la creación de nuevos colores.
 * * Este componente se visualiza generalmente dentro de un diálogo dinámico
 * y permite al usuario registrar un color proporcionando un nombre único.
 */
@Component({
    selector: 'app-color-form',
    imports: [
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        DialogModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './color-form.component.html'
})
export class ColorFormComponent {
    /** Constructor de formularios reactivos inyectado para crear el grupo de controles. */
    private readonly _fb = inject(FormBuilder);

    /** Input requerido que controla la visibilidad del diálogo del formulario. */
    visible = input.required<boolean>();
    /** Output que emite un objeto con el nombre del color cuando el formulario se envía exitosamente. */
    save = output<{ nombre: string }>();
    /** Output que emite un evento vacío cuando el usuario cancela o cierra el formulario. */
    cancel = output<void>();
    /** Señal reactiva que indica si se está ejecutando el proceso de guardado para deshabilitar interacciones. */
    saving = signal(false);

    /** * Instancia del formulario reactivo.
     * Contiene un único control `nombre` que es requerido y debe tener al menos 3 caracteres. 
     */
    form = this._fb.nonNullable.group({
        nombre: ['', [Validators.required, Validators.minLength(3)]]
    });

    /**
     * Constructor del componente.
     * Inicializa un efecto reactivo que observa los cambios en el input `visible`.
     * Cada vez que el componente se hace visible, el formulario se resetea a su estado inicial.
     */
    constructor() {
        effect(() => {
            if (this.visible()) {
                this.form.reset();
            }
        });
    }

    /**
     * Maneja el evento de envío del formulario.
     * Verifica la validez del formulario antes de continuar. Si es válido, 
     * activa el estado de guardado, obtiene los valores crudos del formulario,
     * emite el evento `save` con los datos y finalmente desactiva el estado de guardado.
     */
    onSubmit() {
        if (this.form.invalid) return;
        this.saving.set(true);

        const formValue = this.form.getRawValue();
        this.save.emit(formValue);
        this.saving.set(false);
    }

    /**
     * Maneja la cancelación de la operación.
     * Resetea los valores y validaciones del formulario y emite el evento `cancel`
     * para notificar al componente padre que debe cerrar el diálogo.
     */
    onCancel() {
        this.form.reset();
        this.cancel.emit();
    }
}