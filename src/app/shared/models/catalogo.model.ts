/**
 * Interfaz que representa una **Talla** en el catálogo del sistema.
 * Se utiliza para definir las dimensiones o tamaños disponibles para las variantes de productos.
 */
export interface Talla {
  /** Identificador único de la talla en la base de datos. */
  id: number;
  /** Nombre o etiqueta visible de la talla (ej: 'S', 'M', 'XL', '42'). */
  nombre: string;
}

/**
 * Interfaz que representa un **Color** en el catálogo del sistema.
 * Se utiliza para especificar las opciones cromáticas disponibles para las variantes de productos.
 */
export interface Color {
  /** Identificador único del color en la base de datos. */
  id: number;
  /** Nombre descriptivo del color (ej: 'Rojo', 'Azul Marino', 'Negro Mate'). */
  nombre: string;
}