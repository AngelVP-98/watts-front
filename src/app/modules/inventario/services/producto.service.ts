import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto, ProductoRequest } from '../models/producto.model';
import { Page } from '../../../shared/models/page.model'
import { map } from 'rxjs/operators';

/**
 * Servicio encargado de gestionar las operaciones de red (HTTP) relacionadas 
 * con la entidad Producto. Proporciona métodos para listar, crear, actualizar, 
 * exportar, eliminar (baja lógica) y reactivar productos interactuando con la API REST.
 */
@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  /** Cliente HTTP inyectado para realizar las peticiones al servidor. */
  private readonly _http = inject(HttpClient);
  /** URL base para los endpoints de productos, obtenida de las variables de entorno. */
  private readonly _apiUrl = `${environment.apiUrl}/productos`;

  /**
   * Obtiene una lista paginada y filtrada de productos desde el servidor.
   * * @param page - Número de la página a consultar (por defecto 0).
   * @param size - Cantidad de registros por página (por defecto 10).
   * @param codigoBase - Valor del filtro para el código base del producto.
   * @param codigoMatchMode - Modo de coincidencia para el filtro de código base (ej. 'contains', 'equals').
   * @param nombre - Valor del filtro para el nombre del producto.
   * @param nombreMatchMode - Modo de coincidencia para el filtro de nombre.
   * @param activo - Valor booleano para filtrar por el estado activo o inactivo del producto.
   * @returns Un `Observable` que emite un objeto `Page` que contiene el arreglo de productos y los metadatos de paginación.
   */
  listar(
    page: number = 0,
    size: number = 10,
    codigoBase?: string,
    codigoMatchMode?: string,
    nombre?: string,
    nombreMatchMode?: string,
    activo?: boolean
  ): Observable<Page<Producto>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (codigoBase) {
      params = params.set('codigoBase', codigoBase);
      // Solo enviamos el modo si hay un valor
      if (codigoMatchMode) {
        params = params.set('codigoMatchMode', codigoMatchMode);
      }
    }
    if (nombre) {
      params = params.set('nombre', nombre);
      // Solo enviamos el modo si hay un valor
      if (nombreMatchMode) {
        params = params.set('nombreMatchMode', nombreMatchMode);
      }
    }
    if (activo !== undefined && activo !== null) {
      params = params.set('activo', activo);
    }

    return this._http.get<Page<Producto>>(this._apiUrl, { params });
  }

  /**
   * Crea un nuevo producto enviando sus datos y, opcionalmente, un archivo de imagen.
   * Utiliza `FormData` para soportar peticiones multiparte (Multipart/form-data).
   * * @param producto - Objeto con los datos del nuevo producto a registrar (`ProductoRequest` parcial).
   * @param archivo - Archivo de imagen seleccionado por el usuario, o `null` si no hay imagen.
   * @returns Un `Observable` que emite el producto recién creado por el servidor.
   */
  crear(producto: Partial<ProductoRequest>, archivo: File | null): Observable<Producto> {
    const formData = new FormData();

    // El backend espera una parte llamada "producto" que sea JSON
    // Blob permite especificar el tipo de contenido JSON explícitamente dentro del FormData
    formData.append('producto', new Blob([JSON.stringify(producto)], {
      type: 'application/json'
    }));
    // El backend espera una parte llamada "imagen"
    if (archivo) {
      formData.append('imagen', archivo);
    }
    return this._http.post<Producto>(this._apiUrl, formData);
  }

  /**
   * Actualiza la información de un producto existente y, opcionalmente, su imagen representativa.
   * Utiliza `FormData` para soportar peticiones multiparte.
   * * @param id - Identificador único del producto que se desea actualizar.
   * @param producto - Objeto con los nuevos datos del producto.
   * @param archivo - Nuevo archivo de imagen seleccionado, o `null` si no se desea modificar la imagen.
   * @returns Un `Observable` que emite el producto con su información actualizada.
   */
  actualizar(id: number, producto: Partial<ProductoRequest>, archivo: File | null): Observable<Producto> {
    const formData = new FormData();
    // El backend espera una parte llamada "producto" que sea JSON
    // Blob permite especificar el tipo de contenido JSON explícitamente dentro del FormData
    formData.append('producto', new Blob([JSON.stringify(producto)], {
      type: 'application/json'
    }));
    // El backend espera una parte llamada "imagen"
    if (archivo) {
      formData.append('imagen', archivo);
    }
    return this._http.put<Producto>(`${this._apiUrl}/${id}`, formData);
  }

  /**
   * Solicita al servidor un archivo con los registros de productos exportados, 
   * aplicando los mismos filtros disponibles en la función de listar.
   * * @param formato - Formato del archivo a exportar (puede ser 'pdf' o 'csv').
   * @param codigoBase - Filtro por código base del producto.
   * @param codigoMatchMode - Modo de coincidencia para el código base.
   * @param nombre - Filtro por nombre del producto.
   * @param nombreMatchMode - Modo de coincidencia para el nombre.
   * @param activo - Filtro por estado activo o inactivo del producto.
   * @returns Un `Observable` que emite el archivo exportado en formato `Blob` (datos binarios).
   */
  exportar(
    formato: 'pdf' | 'csv',
    codigoBase?: string,
    codigoMatchMode?: string,
    nombre?: string,
    nombreMatchMode?: string,
    activo?: boolean
  ): Observable<Blob> {
    let params = new HttpParams().set('formato', formato);

    if (codigoBase) {
      params = params.set('codigoBase', codigoBase);
      if (codigoMatchMode) params = params.set('codigoMatchMode', codigoMatchMode);
    }
    if (nombre) {
      params = params.set('nombre', nombre);
      if (nombreMatchMode) params = params.set('nombreMatchMode', nombreMatchMode);
    }
    if (activo !== undefined && activo !== null) {
      params = params.set('activo', activo);
    }

    // IMPORTANTE: responseType: 'blob' as 'json' es un cast necesario en Angular
    // para evitar errores de tipado con HttpClient, aunque realmente devuelve un Blob.
    return this._http.get(`${this._apiUrl}/exportar`, {
      params,
      responseType: 'blob' as 'json'
    }).pipe(
      map(response => response as Blob)
    );
  }

  /**
   * Elimina lógicamente un producto cambiando su estado a inactivo en la base de datos.
   * * @param id - Identificador único del producto a eliminar.
   * @returns Un `Observable` que se completa sin emitir valor si la operación tiene éxito.
   */
  eliminar(id: number): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/${id}`);
  }

  /**
   * Reactiva un producto inactivo, cambiando su estado nuevamente a activo.
   * * @param id - Identificador único del producto a reactivar.
   * @returns Un `Observable` que se completa sin emitir valor si la operación tiene éxito.
   */
  activar(id: number): Observable<void> {
    return this._http.patch<void>(`${this._apiUrl}/${id}/activar`, {});
  }
}