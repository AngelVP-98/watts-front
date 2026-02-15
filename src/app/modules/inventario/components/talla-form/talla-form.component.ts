import { Component, ChangeDetectionStrategy, inject, signal, input, output, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';

/**
 * Componente de formulario para la creación de nuevas tallas.
 * Este componente se visualiza generalmente dentro de un diálogo o modal
 * y permite al usuario registrar una talla proporcionando un identificador o nombre.
 */
@Component({
    selector: 'app-talla-form',
    imports: [
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule,
        DialogModule
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './talla-form.component.html'
})
export class TallaFormComponent {
    /** Constructor de formularios reactivos inyectado para crear el grupo de controles. */
    private readonly _fb = inject(FormBuilder);

    /** Input requerido que controla la visibilidad del diálogo del formulario. */
    visible = input.required<boolean>();
    /** Output que emite un objeto con el nombre de la talla cuando el formulario se envía exitosamente. */
    save = output<{ nombre: string }>();
    /** Output que emite un evento vacío cuando el usuario cancela o cierra el formulario. */
    cancel = output<void>();
    /** Señal reactiva que indica si se está ejecutando el proceso de guardado para deshabilitar interacciones. */
    saving = signal(false);

    /** * Instancia del formulario reactivo.
     * Contiene un único control `nombre` que es requerido y debe tener al menos 1 carácter. 
     */
    form = this._fb.nonNullable.group({
        nombre: ['', [Validators.required, Validators.minLength(1)]]
    });

    /**
     * Constructor del componente.
     * Inicializa un efecto reactivo que observa los cambios en el input `visible`.
     * Cada vez que el modal se hace visible, el formulario se resetea a su estado inicial.
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
     * activa el estado de guardado, obtiene los valores procesados,
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
     * Resetea los valores del formulario y emite el evento `cancel`
     * para notificar al componente padre que debe cerrar el diálogo.
     */
    onCancel() {
        this.form.reset();
        this.cancel.emit();
    }
}