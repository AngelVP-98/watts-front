import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe personalizado (`customDate`) para el formateo de cadenas de fecha y hora.
 * * Diseñado específicamente para manejar el formato de string que devuelve el backend
 * (ej: "21-01-2026 21:56:12") sin necesidad de instanciar objetos Date de JavaScript,
 * lo cual es más eficiente para solo visualización.
 * * @example
 * // Uso en plantilla:
 * {{ '21-01-2026 21:56:12' | customDate }} 
 * // Resultado: "21/01/2026 21:56"
 */
@Pipe({
  name: 'customDate',
  standalone: true
})
export class CustomDatePipe implements PipeTransform {
  /**
   * Transforma el string de fecha recibido del backend a un formato legible para el usuario.
   * * @param value - La cadena de fecha original (ej: "21-01-2026 21:56:12") o `null`/`undefined`.
   * @param format - El formato de salida deseado. Por defecto es 'dd/MM/yyyy HH:mm'.
   * Actualmente la lógica soporta principalmente este formato para limpiar segundos y normalizar separadores.
   * @returns La fecha formateada (ej: "21/01/2026 21:56") o una cadena vacía si el valor de entrada no existe.
   */
  transform(value: string | null | undefined, format: string = 'dd/MM/yyyy HH:mm'): string {
    if (!value) return '';
    
    // El backend devuelve: "21-01-2026 21:56:12" (formato dd-MM-yyyy HH:mm:ss)
    // Lo mostramos directamente sin conversión
    
    // Si queremos solo fecha y hora sin segundos
    if (format === 'dd/MM/yyyy HH:mm') {
      // Eliminar los segundos si existen
      return value.substring(0, 16).replace('-', '/').replace('-', '/');
    }
    
    return value;
  }
}
