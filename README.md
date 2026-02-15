# WATTS - Frontend

Interfaz web desarrollada con **Angular 21** y **PrimeNG 21** para el sistema de gestión *Watts*.

## 🚀 Tecnologías

* **Angular 21** (Standalone Components, Signals)
* **TypeScript 5**
* **PrimeNG 21** (Biblioteca de componentes UI)
* **PrimeIcons**
* **SCSS** (Estilos)
* **Chart.js** (Gráficas del dashboard)

## 📋 Requisitos Previos

* Node.js (v18 o superior).
* npm (v10 o superior).
* Angular CLI (`npm install -g @angular/cli`).

## ⚙️ Instalación y Desarrollo

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/AngelVP-98/watts-front.git](https://github.com/AngelVP-98/watts-front.git)
    cd watts-front
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecutar en modo desarrollo:**
    ```bash
    ng serve
    ```
    Abre tu navegador en `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias algún archivo.

## 🔧 Configuración

La URL de la API Backend se configura en los archivos de entorno:

* **Desarrollo:** `src/environments/environment.ts`
    ```typescript
    export const environment = {
      production: false,
      apiUrl: 'http://localhost:8080/api'
    };
    ```
* **Producción:** `src/environments/environment.prod.ts`
    ```typescript
    export const environment = {
      production: true,
      apiUrl: '[https://api.wattscycling.es/api](https://api.wattscycling.es/api)'
    };
    ```

## 📦 Construcción para Producción

Para generar los archivos estáticos listos para subir al hosting (Sered, Apache, Nginx):

```bash
ng build --configuration production
```
## 📚 Documentación (Compodoc)

El proyecto cuenta con documentación técnica detallada generada con Compodoc. Para generarla y visualizarla localmente:

Ejecutar el comando de generación y servidor:
```bash
npm run compodoc:serve
```
Acceder al navegador:
Por defecto, la documentación estará disponible en `http://localhost:8080/` (o el puerto que indique la terminal).

## 👥 Autores

* **Angel Verdeguer Parreño**
* **Sergio Lois Arcas**