/**
 * Representa la entidad principal de un Producto Base dentro del sistema.
 * Contiene toda la información de identificación, características, estado 
 * y los datos de auditoría (creación y modificación).
 */
export interface Producto {
  /** Identificador único del producto en la base de datos. */
  id: number;
  
  /** Nombre comercial o descriptivo del producto. */
  nombre: string;
  
  /** Código base único que identifica al modelo del producto (ej. WTT-001). */
  codigoBase: string;
  
  /** Descripción detallada de las características técnicas del producto. */
  caracteristicasTecnicas: string;
  
  /** URL de la imagen representativa del producto. Es opcional ya que puede no tener una asignada. */
  imagenUrl?: string;
  
  /** Indica si el producto se encuentra activo (`true`) o ha sido dado de baja lógica (`false`). */
  activo: boolean;
  
  /** Fecha y hora en la que el registro del producto fue creado (formato ISO). */
  fechaCreacion: string;
  
  /** Fecha y hora de la última modificación realizada al registro del producto (formato ISO). */
  fechaModificacion: string;
  
  /** Nombre o identificador del usuario que creó el registro originalmente. */
  creadoPor: string;
  
  /** Nombre o identificador del usuario que realizó la última modificación. */
  modificadoPor: string;
}

/**
 * Representa el objeto de transferencia de datos (DTO) utilizado para 
 * las peticiones de creación o actualización de un Producto.
 * Contiene únicamente los campos que pueden ser ingresados o modificados por el usuario.
 */
export interface ProductoRequest {
  /** Nombre comercial o descriptivo del producto a crear o actualizar. */
  nombre: string;
  
  /** Descripción detallada de las características técnicas del producto. */
  caracteristicasTecnicas: string;
}