import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TextareaModule } from 'primeng/textarea';
import { Select } from 'primeng/select';
import { AlmacenService } from '../../../almacenes/services/almacen.service';
import { VarianteService } from '../../../inventario/services/variante.service';
import { MovimientoRequest, TipoMovimiento } from '../../models/movimiento.model';

/**
 * Componente encargado de renderizar el formulario modal para registrar un nuevo movimiento de inventario (transacción).
 * Permite seleccionar el almacén, la variante de producto, el tipo de movimiento y definir la cantidad a registrar.
 */
@Component({
    selector: 'app-movimiento-form',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        ReactiveFormsModule,
        DialogModule,
        ButtonModule,
        InputTextModule,
        InputNumberModule,
        TextareaModule,
        Select
    ],
    templateUrl: './movimiento-form.component.html'
})
export class MovimientoFormComponent {
    // Inyección de dependencias
    private readonly _fb = inject(FormBuilder);
    private readonly _almacenService = inject(AlmacenService);
    private readonly _varianteService = inject(VarianteService);

    // Inputs
    /**
     * Señal de entrada que determina si el modal (diálogo) del formulario es visible o no.
     */
    visible = input.required<boolean>();

    // Outputs
    /**
     * Evento emitido al componente padre cuando el usuario guarda correctamente el formulario.
     * Entrega el objeto `MovimientoRequest` con los datos del nuevo movimiento listos para ser enviados al servidor.
     */
    save = output<MovimientoRequest>();
    /**
     * Evento emitido cuando el usuario cancela la operación o cierra el cuadro de diálogo sin guardar.
     */
    cancel = output<void>();

    // --- CARGA DE DATOS PARA SELECTS ---

    /**
     * Señal reactiva que contiene la lista de almacenes disponibles recuperados del servicio.
     * Los datos se formatean automáticamente para agregar una propiedad `displayLabel` útil para mostrar en el componente Select.
     */
    readonly almacenesResource = toSignal(
        this._almacenService.listar(0, 100).pipe(
            map(page => page.content.map(a => ({
                ...a,
                // CREAMOS UNA PROPIEDAD VIRTUAL PARA EL SELECT
                displayLabel: `${a.codigo} - ${a.descripcion}`
            })))
        ),
        { initialValue: [] }
    );

    /**
     * Señal reactiva que contiene la lista de variantes de productos disponibles.
     * Mapea los resultados agregando un `displayName` que concatena el SKU, nombre del producto, talla y color 
     * para facilitar la identificación visual por parte del usuario.
     */
    readonly variantesResource = toSignal(
        this._varianteService.listar(0, 100, undefined).pipe(
            map(page => page.content.map(v => ({
                ...v,
                // Creamos una etiqueta personalizada: "SKU123 - Camiseta (L / Rojo)"
                displayName: `${v.sku} - ${v.producto.nombre} (${v.talla} / ${v.color})`
            })))
        ),
        { initialValue: [] }
    );

    /**
     * Opciones disponibles para el selector de "Tipo de Movimiento", formateadas para el componente Select de PrimeNG.
     */
    readonly tiposMovimiento = [
        { label: 'Compra', value: 'COMPRA' },
        { label: 'Venta', value: 'VENTA' },
        { label: 'Entrada Fabricación', value: 'ENTRADA_FABRICACION' },
        { label: 'Entrada Devolución', value: 'ENTRADA_DEVOLUCION' },
        { label: 'Salida Defecto', value: 'SALIDA_DEFECTO' },
        { label: 'Salida Regalo', value: 'SALIDA_REGALO' }
    ];

    /**
     * Grupo de formulario reactivo que administra los campos, valores y validaciones del registro de movimiento.
     */
    form = this._fb.nonNullable.group({
        varianteSku: ['', Validators.required],
        almacenId: [null as number | null, [Validators.required, Validators.min(1)]],
        cantidad: [1, [Validators.required, Validators.min(1)]],
        tipo: [null as TipoMovimiento | null, Validators.required],
        observaciones: ['']
    });

    /**
     * Evalúa si el formulario es válido y, de ser así, extrae los valores crudos (raw value) 
     * para emitirlos a través del evento `save` hacia el componente contenedor.
     */
    onSubmit() {
        if (this.form.valid) {
            const formValue = this.form.getRawValue();

            // Emitimos al padre
            this.save.emit({
                varianteSku: formValue.varianteSku,
                almacenId: formValue.almacenId!,
                cantidad: formValue.cantidad,
                tipo: formValue.tipo!,
                observaciones: formValue.observaciones
            });
        }
    }

    /**
     * Restablece el formulario a sus valores por defecto (ej: cantidad en 1) y emite el evento `cancel` 
     * para notificar al componente padre que se debe cerrar el modal.
     */
    onCancel() {
        this.form.reset({ cantidad: 1 });
        this.cancel.emit();
    }
}