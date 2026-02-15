/**
 * Interfaz auxiliar que representa la información básica resumida 
 * del producto al que pertenece una variante. Se utiliza para anidar 
 * estos datos dentro de la respuesta de la variante sin traer todo el objeto del producto.
 */
export interface VarianteProductoInfo {
  /** Identificador único del producto base. */
  id: number;

  /** Nombre comercial o descriptivo del producto base. */
  nombre: string;

  /** Código base o modelo del producto asociado. */
  codigoBase: string;
}

/**
 * Representa la entidad principal de una Variante de producto dentro del sistema.
 * Una variante es una combinación específica de un producto base con un color y una talla.
 */
export interface Variante {
  /** Identificador único de la variante en la base de datos. */
  id: number;

  /** Código SKU (Stock Keeping Unit) único generado para esta variante específica. */
  sku: string;

  /** Información resumida del producto base al que pertenece esta variante. */
  producto: VarianteProductoInfo;

  /** Nombre o descripción de la talla asignada a la variante. */
  talla: string;

  /** Nombre o descripción del color asignado a la variante. */
  color: string;

  /** Precio final de venta al público para esta variante. */
  precioVenta: number;

  /** Costo de adquisición o precio de compra de la variante. */
  precioCompra: number;

  /** URL de la imagen representativa de la variante. Es opcional. */
  imagenUrl?: string;

  /** Fecha y hora en la que el registro de la variante fue creado (formato ISO). */
  fechaCreacion: string;

  /** Fecha y hora de la última modificación realizada al registro de la variante (formato ISO). */
  fechaModificacion: string;

  /** Nombre o identificador del usuario que creó el registro originalmente. */
  creadoPor: string;

  /** Nombre o identificador del usuario que realizó la última modificación. */
  modificadoPor: string;
}

/**
 * Representa el objeto de transferencia de datos (DTO) utilizado para 
 * las peticiones de creación o actualización de una Variante.
 * A diferencia del modelo de lectura, este utiliza identificadores relacionales.
 */
export interface VarianteRequest {
  /** Identificador del producto base al que se asociará la variante. */
  productoId: number;

  /** Identificador de la talla que se asignará a la variante. */
  tallaId: number;

  /** Identificador del color que se asignará a la variante. */
  colorId: number;

  /** Precio final de venta al público. Puede ser opcional dependiendo de las reglas de negocio. */
  precioVenta?: number;

  /** Costo de adquisición o precio de compra. Puede ser opcional. */
  precioCompra?: number;
}