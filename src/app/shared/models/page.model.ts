/**
 * Interfaz genérica que representa una respuesta paginada del servidor.
 * Sigue la estructura estándar de paginación (comúnmente utilizada por Spring Boot/Spring Data).
 *
 * @template T - El tipo de dato de los elementos contenidos en la página (ej: Usuario, Producto).
 */
export interface Page<T> {
  /**
   * La lista de elementos (datos) correspondientes a la página actual.
   */
  content: T[];
  /**
   * El número total de elementos existentes en la base de datos (en todas las páginas).
   * Útil para mostrar contadores o calcular métricas.
   */
  totalElements: number;
  /**
   * El número total de páginas disponibles basado en el tamaño de página actual.
   */
  totalPages: number;
  /**
   * El tamaño de la página, es decir, la cantidad máxima de elementos por página solicitada.
   */
  size: number;
  /**
   * El índice de la página actual.
   * 0 es la primera página.
   */
  number: number;
  /**
   * Indica si la página actual es la primera.
   */
  first: boolean;
  /**
   * Indica si la página actual es la última.
   */
  last: boolean;
}