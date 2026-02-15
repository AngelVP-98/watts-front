import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { Producto, ProductoRequest } from '../../models/producto.model';
import { AsyncPipe } from '@angular/common';
import { SecureImagePipe } from '../../../../shared/pipes/secure-image.pipe';

/**
 * Componente de formulario para la creación y edición de productos base.
 * Se visualiza como un diálogo y permite introducir la información principal de un producto
 * (código base, nombre, características) así como cargar o actualizar su imagen representativa.
 */
@Component({
  selector: 'app-producto-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    FileUploadModule,
    ToastModule,
    SecureImagePipe
  ],
  templateUrl: './producto-form.component.html'
})
export class ProductoFormComponent {
  /** Constructor de formularios reactivos inyectado para crear el grupo de controles. */
  private readonly _fb = inject(FormBuilder);

  /** Input requerido que controla la visibilidad del diálogo del formulario. */
  visible = input.required<boolean>();
  /** * Input que recibe los datos del producto si el formulario se abre en modo edición. 
   * Si su valor es `null`, el componente opera en modo creación.
   */
  productoEditar = input<Producto | null>(null);

  /** * Output que emite los datos del formulario procesados (`request`) y el archivo de imagen 
   * (`archivo`) listo para ser subido al servidor cuando se guarda exitosamente.
   */
  save = output<{ request: ProductoRequest, archivo: File | null }>();
  /** Output que emite un evento vacío cuando el usuario cancela o cierra el formulario. */
  cancel = output<void>();

  /** Señal reactiva que almacena el archivo de imagen temporalmente seleccionado por el usuario. */
  archivoSeleccionado = signal<File | null>(null);
  /** Señal reactiva que contiene la URL temporal (base64) o la URL remota para mostrar la vista previa de la imagen. */
  imagenPreview = signal<string | null>(null);

  /** * Instancia del formulario reactivo. Contiene los campos:
   * - `codigoBase`: Código único identificador del producto (requerido).
   * - `nombre`: Nombre del producto (requerido).
   * - `caracteristicasTecnicas`: Descripción técnica del producto (requerida).
   */
  form = this._fb.nonNullable.group({
    codigoBase: ['', Validators.required],
    nombre: ['', Validators.required],
    caracteristicasTecnicas: ['', Validators.required]
  });

  /**
   * Maneja el evento de selección de archivos desde el componente FileUpload.
   * Extrae el primer archivo seleccionado, lo guarda en el estado y genera
   * una URL en base64 mediante `FileReader` para actualizar la vista previa de la imagen.
   * * @param event - Evento emitido por el componente de PrimeNG o input nativo que contiene los archivos.
   */
  onFileSelect(event: any) {
    const file = event.files[0];
    if (file) {
      this.archivoSeleccionado.set(file);

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagenPreview.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Constructor del componente.
   * Inicializa un efecto reactivo que observa los cambios en el input `productoEditar`.
   * Si recibe un producto (modo edición), rellena el formulario con sus datos y carga su imagen en la vista previa.
   * Si recibe `null` (modo creación), resetea el formulario y limpia las selecciones de archivos.
   */
  constructor() {
    // Effect: Reacciona reactivamente cuando cambia el input 'productoEditar'.
    // Se ejecuta cada vez que el padre envía un producto diferente o null.
    effect(() => {
      const producto = this.productoEditar();
      if (producto) {
        // MODO EDICIÓN: Rellenamos el formulario y bloqueamos el código base
        this.form.patchValue({
          codigoBase: producto.codigoBase,
          nombre: producto.nombre,
          caracteristicasTecnicas: producto.caracteristicasTecnicas
        });
        if (producto.imagenUrl) {
          this.imagenPreview.set(producto.imagenUrl || null);
        } else {
          this.imagenPreview.set(null);
        }
      } else {
        // MODO CREACIÓN: Limpiamos y habilitamos todo
        this.form.reset();
        this.archivoSeleccionado.set(null);
        this.imagenPreview.set(null);
      }
    });
  }

  /**
   * Maneja el evento de envío del formulario.
   * Comprueba la validez de los campos. Si es válido, recopila todos los valores
   * (incluidos los campos deshabilitados) y el archivo seleccionado, y los emite a través del evento `save`.
   */
  onSubmit() {
    if (this.form.valid) {
      const request = this.form.getRawValue();
      const archivo = this.archivoSeleccionado();

      // Emitimos ambos datos (incluyendo campos deshabilitados)
      this.save.emit({ request, archivo });
    }
  }

  /**
   * Maneja la cancelación o cierre del formulario.
   * Resetea el formulario a sus valores por defecto, rehabilita el control de `codigoBase`,
   * limpia los estados de selección de imagen y emite el evento `cancel` hacia el componente padre.
   */
  onCancel() {
    this.form.reset();
    this.form.controls.codigoBase.enable();
    this.archivoSeleccionado.set(null);
    this.imagenPreview.set(null);
    this.cancel.emit();
  }
}