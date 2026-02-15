/**
 * Configuración del entorno para el modo de **Producción**.
 * Este archivo reemplaza a `environment.ts` cuando se ejecuta el build con la configuración de producción
 * (ej: `ng build --configuration production`), habilitando optimizaciones de Angular.
 */
export const environment = {
  /**
   * Indica que la aplicación está en modo producción.
   * Angular utiliza esto para desactivar advertencias de desarrollo y habilitar optimizaciones de rendimiento.
   */
  production: true,
  
  /**
   * URL base del backend API para el entorno productivo real.
   * Apunta al dominio público donde está desplegado el backend.
   */
  apiUrl: 'https://api.wattscycling.es/api'
}