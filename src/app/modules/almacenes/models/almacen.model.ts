/**
 * Representa la entidad principal de un Almacén dentro del sistema.
 * Contiene la información de identificación, descripción, ubicación 
 * y el estado actual (activo/inactivo) del almacén.
 */
export interface Almacen {
  /** Identificador único del almacén en la base de datos. */
  id: number;
  /** Código identificador único asignado al almacén (ej. ALM-01). */
  codigo: string;
  /** Nombre o descripción detallada del almacén. Es opcional. */
  descripcion?: string;
  /** URL o enlace de Google Maps con la ubicación física del almacén. Es opcional. */
  ubicacionMaps?: string;
  /** Indica si el almacén se encuentra activo (`true`) o ha sido dado de baja lógica (`false`). */
  activo: boolean;
}

/**
 * Representa el objeto de transferencia de datos (DTO) utilizado para 
 * las peticiones de creación o actualización de un Almacén.
 * Contiene únicamente los campos que pueden ser ingresados o modificados por el usuario.
 */
export interface AlmacenRequest {
  /** Código identificador único que se asignará al almacén. */
  codigo: string;
  /** Nombre o descripción del almacén a crear o actualizar. */
  descripcion: string;
  /** URL o enlace de Google Maps con la ubicación física del almacén. Es opcional. */
  ubicacionMaps?: string;
}