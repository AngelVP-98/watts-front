/**
 * Tipo que define los posibles valores para clasificar un movimiento de inventario.
 * Representa la naturaleza de la transacción (entrada o salida de stock).
 */
export type TipoMovimiento = 
  | 'COMPRA'
  | 'VENTA'
  | 'ENTRADA_FABRICACION'
  | 'SALIDA_DEFECTO'
  | 'SALIDA_REGALO'
  | 'ENTRADA_DEVOLUCION';

/**
 * Objeto de transferencia de datos (DTO) utilizado como payload para registrar 
 * un nuevo movimiento de inventario en el sistema.
 */
export interface MovimientoRequest {
  /** Código SKU único de la variante del producto que se va a mover. */
  varianteSku: string;
  /** Identificador único del almacén donde se registrará el movimiento. */
  almacenId: number;
  /** Cantidad de unidades involucradas en el movimiento (debe ser un valor positivo). */
  cantidad: number;
  /** * Tipo o clasificación del movimiento a realizar. 
   * Se inicializa como `null` en el estado inicial del formulario antes de que el usuario seleccione una opción.
   */
  tipo: TipoMovimiento | null; 
  /** Notas o detalles adicionales opcionales sobre el motivo de la transacción. */
  observaciones: string;
}

/**
 * Modelo que representa la información completa de una transacción o movimiento de inventario 
 * recuperada desde el servidor. Incluye datos aplanados para facilitar su visualización en tablas.
 */
export interface MovimientoResponse {
  /** Identificador único del registro de movimiento. */
  id: number;
  /** Fecha y hora exacta en la que se registró el movimiento en el sistema. */
  fechaCreacion: string;
  /** Nombre del usuario que autorizó o registró la transacción. */
  creadoPor: string;
  /** Naturaleza de la transacción (ej. `COMPRA`, `VENTA`). */
  tipo: TipoMovimiento;
  /** Cantidad de unidades que entraron o salieron del inventario. */
  cantidad: number;
  /** Cantidad total de stock que quedó en el almacén para esa variante después de aplicar el movimiento. */
  stockResultante: number;
  /** Notas o detalles adicionales proporcionados al registrar el movimiento. */
  observaciones: string;
  
  // --- Datos aplanados del DTO para facilitar la visualización en la tabla ---
  /** Código SKU de la variante afectada. */
  sku: string;
  /** Nombre genérico del producto al que pertenece la variante. */
  productoNombre: string;
  /** Descripción de las características técnicas del producto. */
  productoCaracteristicasTecnicas: string;
  /** Talla de la variante (si aplica). */
  talla: string;
  /** Color de la variante (si aplica). */
  color: string;
  /** Nombre o descripción del almacén donde ocurrió el movimiento. */
  almacenDescripcion: string;
}