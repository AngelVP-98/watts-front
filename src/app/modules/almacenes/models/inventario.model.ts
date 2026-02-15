/**
 * Representa la información de stock de una variante de producto específica 
 * dentro de un almacén determinado. Se utiliza principalmente para mostrar 
 * reportes o tablas detalladas de inventario.
 */
export interface InventarioStock {
    /** Identificador único del registro de stock en el inventario. */
    id: number;
    /** Código SKU (Stock Keeping Unit) que identifica de forma única a la variante del producto. */
    sku: string;
    /** Nombre comercial o descriptivo del producto al que pertenece la variante. */
    productoNombre: string;
    /** Nombre o descripción del almacén en el que se encuentra físicamente este stock. */
    almacenNombre: string;
    /** Cantidad actual de unidades físicas disponibles de esta variante en el almacén. */
    stock: number;
    /** Nombre o identificador de la talla de la variante. Es opcional ya que podría no aplicar. */
    talla?: string;
    /** Nombre o identificador del color de la variante. Es opcional ya que podría no aplicar. */
    color?: string;
}