/**
 * Configuración del entorno para el modo de **Desarrollo**.
 * Este archivo se utiliza por defecto cuando se ejecuta `ng serve` o `ng build`.
 */
export const environment = {
    /**
     * Indica si la aplicación se está ejecutando en modo producción.
     * En desarrollo se mantiene en `false` para facilitar la depuración.
     */
    production: false,

    /**
     * URL base del backend API para desarrollo.
     * Apunta generalmente al servidor local (localhost).
     */
    apiUrl: 'http://localhost:8080/api'
}