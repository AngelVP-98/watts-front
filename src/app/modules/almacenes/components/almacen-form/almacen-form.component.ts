import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { Almacen, AlmacenRequest } from '../../models/almacen.model';

/**
 * Componente de formulario para la creación y edición de almacenes.
 * Se visualiza generalmente como un cuadro de diálogo (modal) y permite introducir
 * la información básica de un almacén, como su código identificador, descripción y ubicación.
 */
@Component({
  selector: 'app-almacen-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
  ],
  templateUrl: './almacen-form.component.html'
})
export class AlmacenFormComponent {
  // Inyección de dependencias
  /** Constructor inyectado para generar el grupo de controles del formulario reactivo. */
  private readonly _fb = inject(FormBuilder);

  // Inputs: Recibimos visibilidad y el producto si es modo edición
  /** Input requerido que controla la visibilidad del diálogo del formulario. */
  visible = input.required<boolean>();
  /** * Input que recibe los datos del almacén si el formulario se abre en modo edición. 
   * Si su valor es `null`, el componente opera en modo de creación.
   */
  almacenEditar = input<Almacen | null>(null);

  // Outputs: Eventos para comunicar al padre (guardar o cancelar)
  /** * Output que emite los datos procesados del formulario (`request`) cuando se guarda exitosamente. 
   */
  save = output<{ request: AlmacenRequest }>();
  /** Output que emite un evento vacío cuando el usuario cancela la acción o cierra el formulario. */
  cancel = output<void>();

  /**
   * Instancia del formulario reactivo. Contiene los campos:
   * - `codigo`: Código identificador único del almacén (requerido).
   * - `descripcion`: Nombre o descripción del almacén (requerido).
   * - `ubicacionMaps`: URL o enlace de Google Maps con la ubicación (opcional).
   */
  form = this._fb.nonNullable.group({
    codigo: ['', Validators.required],
    descripcion: ['', Validators.required],
    ubicacionMaps: [''],
  });

  /**
   * Constructor del componente.
   * Inicializa un efecto reactivo que observa los cambios en el input `almacenEditar`.
   * - En modo edición (recibe un almacén): rellena el formulario con sus datos y bloquea
   * el control `codigo` para que no pueda ser modificado.
   * - En modo creación (recibe `null`): resetea el formulario y rehabilita todos los campos.
   */
  constructor() {
    // Effect: Reacciona reactivamente cuando cambia el input 'productoEditar'.
    // Se ejecuta cada vez que el padre envía un producto diferente o null.
    effect(() => {
      const almacen = this.almacenEditar();
      if (almacen) {
        // MODO EDICIÓN: Rellenamos el formulario y bloqueamos el código base
        this.form.patchValue({
          codigo: almacen.codigo,
          descripcion: almacen.descripcion,
        });
        this.form.controls.codigo.disable();
        
      } else {
        // MODO CREACIÓN: Limpiamos y habilitamos todo
        this.form.reset();
        this.form.controls.codigo.enable();
      }
    });
  }

  /**
   * Maneja el evento de envío del formulario.
   * Comprueba la validez de los controles. Si el formulario es válido, recupera todos 
   * los valores crudos (incluyendo el campo `codigo` aunque esté deshabilitado) y emite 
   * el evento `save` hacia el componente padre.
   */
  onSubmit() {
    if (this.form.valid) {
      const request = this.form.getRawValue();

      // Emitimos ambos datos (incluyendo campos deshabilitados)
      this.save.emit({ request});
    }
  }

  /**
   * Maneja la cancelación o cierre del formulario.
   * Restablece el formulario a sus valores por defecto, rehabilita el control `codigo`,
   * y emite el evento `cancel` para notificar al componente padre.
   */
  onCancel() {
    this.form.reset();
    this.form.controls.codigo.enable();
    this.cancel.emit();
  }
}