import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

/**
 * Punto de entrada principal de la aplicación.
 * Este archivo es el primero en ejecutarse y se encarga de arrancar el entorno de Angular.
 *
 * Inicializa la aplicación utilizando la API `bootstrapApplication` diseñada para
 * arquitecturas "Standalone".
 *
 * @param App - El componente raíz que actuará como contenedor principal.
 * @param appConfig - Objeto de configuración global (rutas, proveedores http, etc.) importado de `app.config.ts`.
 */
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
