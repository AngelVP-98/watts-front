import { ChangeDetectionStrategy, Component, inject, input, output, signal, OnInit, effect } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { Variante, VarianteRequest } from '../../models/variante.model';
import { ProductoService } from '../../services/producto.service';
import { Producto } from '../../models/producto.model';
import { Talla, Color } from '../../../../shared/models/catalogo.model';
import { CatalogoService } from '../../../../shared/services/catalogo.service';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { ViewChild } from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { AsyncPipe } from '@angular/common';
import { SecureImagePipe } from '../../../../shared/pipes/secure-image.pipe';

/**
 * Componente de formulario para la creación y edición de variantes de productos.
 * Permite gestionar atributos específicos de un producto base como la talla, el color,
 * los precios (compra y venta) y la imagen representativa de la variante.
 */
@Component({
  selector: 'app-variante-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    SelectModule,
    FileUploadModule,
    ToastModule,
    SecureImagePipe
  ],
  templateUrl: './variante-form.component.html'
})
export class VarianteFormComponent implements OnInit {
  /** Referencia al componente de subida de archivos de PrimeNG. */
  @ViewChild(FileUpload) fileUpload!: FileUpload;

  // Inyección de dependencias
  /** Constructor inyectado para generar el grupo de controles del formulario reactivo. */
  private readonly _fb = inject(FormBuilder);
  /** Servicio inyectado para recuperar la lista de productos disponibles. */
  private readonly _productoService = inject(ProductoService);
  /** Servicio inyectado para recuperar datos del catálogo como tallas y colores. */
  private readonly _catalogoService = inject(CatalogoService);

  // Inputs
  /** Controla la visibilidad del diálogo modal. Es requerido. */
  visible = input.required<boolean>();
  /** * Identificador de un producto previamente seleccionado. 
   * Útil cuando se abre el formulario desde el detalle de un producto específico,
   * bloqueando la selección de producto.
   */
  productoPreseleccionado = input<number | undefined>(undefined);
  /** * Datos de la variante a editar. Si es `null`, el componente opera en modo de creación. 
   */
  varianteEditar = input<Variante | null>(null);
  
  // Outputs
  /** * Evento emitido cuando el formulario se envía exitosamente.
   * Transmite la petición de datos procesada (`request`) y el archivo de imagen opcional (`archivo`).
   */
  save = output<{ request: VarianteRequest, archivo: File | null }>();
  /** Evento emitido cuando el usuario cancela la acción o cierra el modal. */
  cancel = output<void>();

  // Signals para el archivo seleccionado y la preview
  /** Señal reactiva que almacena el archivo de imagen temporalmente seleccionado. */
  archivoSeleccionado = signal<File | null>(null);
  /** Señal reactiva que contiene la URL en base64 o remota para la vista previa de la imagen. */
  imagenPreview = signal<string | null>(null);

  // Signals para rellenar los selects
  /** Señal reactiva que almacena la lista de productos para el desplegable. */
  productos = signal<Producto[]>([]);
  /** Señal reactiva que almacena la lista de tallas para el desplegable. */
  tallas = signal<Talla[]>([]);
  /** Señal reactiva que almacena la lista de colores para el desplegable. */
  colores = signal<Color[]>([]);

  /** Señal reactiva que indica si se están cargando los productos desde el servidor. */
  loadingProductos = signal(false);

  /**
   * Instancia del formulario reactivo. Contiene los campos:
   * - `productoId`: Producto base asociado (requerido).
   * - `tallaId`: Talla asociada (requerida).
   * - `colorId`: Color asociado (requerido).
   * - `precioVenta`: Precio al que se vende (requerido, min 0).
   * - `precioCompra`: Coste de compra (requerido, min 0).
   */
  form = this._fb.group({
    productoId: [null as number | null, [Validators.required, Validators.min(1)]],
    tallaId: [null as number | null, [Validators.required, Validators.min(1)]],
    colorId: [null as number | null, [Validators.required, Validators.min(1)]],
    precioVenta: [0, [Validators.required, Validators.min(0)]],
    precioCompra: [0, [Validators.required, Validators.min(0)]]
  });

  /**
   * Maneja el evento de selección de archivos desde el componente `FileUpload`.
   * Captura el primer archivo seleccionado, lo guarda en el estado y genera 
   * su vista previa en base64 mediante `FileReader`.
   * * @param event - Evento emitido por el componente de archivo o input nativo.
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
   * Define un efecto reactivo que observa los cambios en los inputs `varianteEditar` y `productoPreseleccionado`.
   * - En modo edición: pre-rellena el formulario asociando los nombres de talla y color a sus respectivos IDs,
   * y bloquea los campos clave (producto, talla, color) que no deben modificarse.
   * - En modo creación: limpia el formulario. Si hay un producto preseleccionado, asigna y bloquea
   * el identificador del producto.
   */
  constructor() {
    // Effect: Maneja la lógica de llenado del formulario reactivamente
    effect(() => {
      const variante = this.varianteEditar();
      const preId = this.productoPreseleccionado();

      if (variante) {
        // MODO EDICIÓN

        // Necesitamos mapear los nombres de Talla/Color que vienen en la variante a sus IDs
        const listaTallas = this.tallas();
        const listaColores = this.colores();
        // Buscamos el ID basándonos en el nombre que trae la variante
        const foundTalla = listaTallas.find(t => t.nombre === variante.talla);
        const foundColor = listaColores.find(c => c.nombre === variante.color);
        
        // Rellenamos datos
        this.form.patchValue({
          productoId: variante.producto.id,
          tallaId: foundTalla ? foundTalla.id : null,
          colorId: foundColor ? foundColor.id : null,
          precioVenta: variante.precioVenta,
          precioCompra: variante.precioCompra
        });
        // Deshabilitamos campos que no se pueden editar
        this.form.controls.productoId.disable();
        this.form.controls.tallaId.disable();
        this.form.controls.colorId.disable();
        if (variante.imagenUrl) {
          this.imagenPreview.set(variante.imagenUrl || null);
        } else {
          this.imagenPreview.set(null);
        }
      } else {
        // MODO CREACIÓN: Limpiamos y habilitamos todo
        this.form.reset();
        this.archivoSeleccionado.set(null);
        this.imagenPreview.set(null);
        // Habilitamos campos para creación
        this.form.controls.tallaId.enable();
        this.form.controls.colorId.enable();
      }

      // Lógica específica si NO estamos editando pero sí hay un producto preseleccionado
      // (Ej: Creando variante desde la tabla de detalles de un producto específico)
      if (!variante) {
        if (preId) {
          this.form.patchValue({ productoId: preId });
          // Bloqueamos selector de producto
          this.form.controls.productoId.disable();
        } else {
          // Si no hay preselección, habilitamos el selector
          this.form.controls.productoId.enable();
        }
      }
    });
  }

  /**
   * Método del ciclo de vida que se ejecuta al iniciar el componente.
   * Llama a `cargarDatos` para obtener las dependencias necesarias de los desplegables.
   */
  ngOnInit() {
    this.cargarDatos();
  }
  /**
   * Realiza las peticiones HTTP concurrentes o secuenciales para llenar
   * las listas de opciones del formulario: Productos, Tallas y Colores.
   */
  cargarDatos() {
    this.loadingProductos.set(true);
    
    // Cargar productos para el select
    this._productoService.listar(0, 100).subscribe({
      next: (page) => {
        this.productos.set(page.content);
        this.loadingProductos.set(false);
      },
      error: () => this.loadingProductos.set(false)
    });

    // Cargar Tallas para el select
    this._catalogoService.obtenerTallas().subscribe({
      next: (data) => this.tallas.set(data)
    });

    // Cargar Colores para el select
    this._catalogoService.obtenerColores().subscribe({
      next: (data) => this.colores.set(data)
    });
  }

  /**
   * Procesa la solicitud de guardado del formulario.
   * Si es válido, recopila y mapea los datos en bruto a un objeto `VarianteRequest`
   * y los emite al componente padre a través de `save` junto al archivo seleccionado.
   * Si es inválido, marca todos los controles como tocados para revelar los errores.
   */
  onSubmit() {
    if (this.form.valid) {
      const rawValue = this.form.getRawValue();
      console.log('Enviando Variante:', rawValue);
      
      // Contruimos el objeto Request
      const request: VarianteRequest = {
        productoId: rawValue.productoId!,
        tallaId: rawValue.tallaId!,
        colorId: rawValue.colorId!,
        precioVenta: rawValue.precioVenta ?? 0,
        precioCompra: rawValue.precioCompra ?? 0
      };
      const archivo = this.archivoSeleccionado();
      this.save.emit({ request, archivo });
    } else {
      // Marcar todos como touched para mostrar errores si el usuario fuerza el submit
      this.form.markAllAsTouched();
    }
  }

  /**
   * Restablece el formulario a sus valores por defecto, limpia la selección 
   * y previsualización de imagen, y emite el evento `cancel` para notificar al padre.
   */
  onCancel() {
    this.form.reset();
    this.imagenPreview.set(null);
    this.archivoSeleccionado.set(null);
    this.imagenPreview.set(null);
    this.cancel.emit();
  }
}