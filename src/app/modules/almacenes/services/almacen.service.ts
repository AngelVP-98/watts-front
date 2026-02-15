import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../../shared/models/page.model';
import { Almacen, AlmacenRequest } from '../models/almacen.model';

/**
 * Servicio encargado de gestionar las operaciones de red (HTTP) relacionadas 
 * con la entidad Almacén. Proporciona métodos para listar, buscar por ID, crear, 
 * actualizar, eliminar (baja lógica) y reactivar almacenes interactuando con la API REST.
 */
@Injectable({
  providedIn: 'root'
})
export class AlmacenService {
  /** Cliente HTTP inyectado para realizar las peticiones al servidor. */
  private readonly _http = inject(HttpClient);
  /** URL base para los endpoints de almacenes, obtenida de las variables de entorno. */
  private readonly _apiUrl = `${environment.apiUrl}/almacenes`;

  /**
   * Obtiene una lista paginada y filtrada de almacenes desde el servidor.
   * @param page - Número de la página a consultar (por defecto 0).
   * @param size - Cantidad de registros por página (por defecto 10).
   * @param codigo - Valor del filtro para el código identificador del almacén.
   * @param codigoMatchMode - Modo de coincidencia para el filtro de código (ej. 'contains', 'equals').
   * @param descripcion - Valor del filtro para la descripción del almacén.
   * @param descripcionMatchMode - Modo de coincidencia para el filtro de descripción.
   * @param activo - Valor booleano opcional para filtrar por el estado del almacén.
   * @returns Un `Observable` que emite un objeto `Page` con la lista de almacenes y los metadatos de paginación.
   */
  listar(
    page: number = 0,
    size: number = 10,
    codigo?: string,
    codigoMatchMode?: string,
    descripcion?: string,
    descripcionMatchMode?: string,
    activo?: boolean
  ): Observable<Page<Almacen>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (codigo) {
      params = params.set('codigo', codigo);
      // Solo enviamos el modo si hay un valor
      if (codigoMatchMode) {
        params = params.set('codigoMatchMode', codigoMatchMode);
      }
    }
    if (descripcion) {
      params = params.set('descripcion', descripcion);
      // Solo enviamos el modo si hay un valor
      if (descripcionMatchMode) {
        params = params.set('descripcionMatcMode', descripcionMatchMode);
      }
    }

    return this._http.get<Page<Almacen>>(this._apiUrl, { params });
  }

  /**
   * Obtiene los detalles completos de un almacén específico mediante su identificador.
   * @param id - Identificador único del almacén a buscar.
   * @returns Un `Observable` que emite los datos del almacén encontrado.
   */
  obtenerPorId(id: number): Observable<Almacen> {
    return this._http.get<Almacen>(`${this._apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo almacén enviando sus datos al servidor.
   * @param almacen - Objeto con los datos del nuevo almacén a registrar (`AlmacenRequest` parcial).
   * @returns Un `Observable` que emite el almacén recién creado.
   */
  crear(almacen: Partial<AlmacenRequest>): Observable<Almacen> {
    const formData = new FormData();
    // El backend espera una parte llamada "almacen" que sea JSON
    // Blob permite especificar el tipo de contenido JSON explícitamente dentro del FormData
    formData.append('almacen', new Blob([JSON.stringify(almacen)], {
      type: 'application/json'
    }));
    return this._http.post<Almacen>(this._apiUrl, almacen);
  }

  /**
   * Actualiza la información de un almacén existente.
   * Utiliza `FormData` para envolver la petición y especificar el tipo de contenido JSON.
   * @param id - Identificador único del almacén que se desea actualizar.
   * @param almacen - Objeto con los nuevos datos del almacén.
   * @returns Un `Observable` que emite el almacén con su información actualizada.
   */
  actualizar(id: number, almacen: Partial<AlmacenRequest>): Observable<Almacen> {
    const formData = new FormData();
    // El backend espera una parte llamada "almacen" que sea JSON
    // Blob permite especificar el tipo de contenido JSON explícitamente dentro del FormData
    formData.append('almacen', new Blob([JSON.stringify(almacen)], {
      type: 'application/json'
    }));

    return this._http.put<Almacen>(`${this._apiUrl}/${id}`, formData);
  }

  /**
   * Elimina lógicamente un almacén cambiando su estado a inactivo en la base de datos.
   * @param id - Identificador único del almacén a eliminar.
   * @returns Un `Observable` que se completa sin emitir valor si la operación tiene éxito.
   */
  eliminar(id: number): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/${id}`);
  }

  /**
   * Reactiva un almacén previamente inactivo, cambiando su estado nuevamente a activo.
   * @param id - Identificador único del almacén a reactivar.
   * @returns Un `Observable` que se completa sin emitir valor si la operación tiene éxito.
   */
  activar(id: number): Observable<void> {
    return this._http.patch<void>(`${this._apiUrl}/${id}/activar`, {});
  }
}