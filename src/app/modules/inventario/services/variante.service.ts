import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../../shared/models/page.model';
import { Variante, VarianteRequest } from '../models/variante.model';
import { map } from 'rxjs';

/**
 * Servicio encargado de gestionar las operaciones de red (HTTP) relacionadas 
 * con la entidad Variante. Proporciona métodos para listar, crear, actualizar, 
 * exportar, eliminar (baja lógica) y reactivar variantes interactuando con la API REST.
 */
@Injectable({
  providedIn: 'root'
})
export class VarianteService {
  /** Cliente HTTP inyectado para realizar las peticiones al servidor. */
  private readonly _http = inject(HttpClient);
  /** URL base para los endpoints de variantes, obtenida de las variables de entorno. */
  private readonly _apiUrl = `${environment.apiUrl}/variantes`;

  /**
   * Obtiene una lista paginada y filtrada de variantes desde el servidor.
   * @param page - Número de la página a consultar (por defecto 0).
   * @param size - Cantidad de registros por página (por defecto 10).
   * @param productoId - Identificador del producto para filtrar solo sus variantes asociadas.
   * @param sku - Valor del filtro para el código SKU de la variante.
   * @param skuMatchMode - Modo de coincidencia para el filtro de SKU (ej. 'contains', 'equals').
   * @param talla - Valor del filtro para el nombre de la talla.
   * @param tallaMatchMode - Modo de coincidencia para el filtro de talla.
   * @param color - Valor del filtro para el nombre del color.
   * @param colorMatchMode - Modo de coincidencia para el filtro de color.
   * @returns Un `Observable` que emite un objeto `Page` con la lista de variantes y los metadatos de paginación.
   */
  listar(
    page: number = 0,
    size: number = 10,
    productoId?: number,
    sku?: string,
    skuMatchMode?: string,
    talla?: string,
    tallaMatchMode?: string,
    color?: string,
    colorMatchMode?: string
  ): Observable<Page<Variante>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (productoId) {
      params = params.set('productoId', productoId.toString());
    }
    // SKU
    if (sku) {
      params = params.set('sku', sku);
      if (skuMatchMode) params = params.set('skuMatchMode', skuMatchMode);
    }

    // Talla
    if (talla) {
      params = params.set('talla', talla);
      if (tallaMatchMode) params = params.set('tallaMatchMode', tallaMatchMode);
    }

    // Color
    if (color) {
      params = params.set('color', color);
      if (colorMatchMode) params = params.set('colorMatchMode', colorMatchMode);
    }

    return this._http.get<Page<Variante>>(this._apiUrl, { params });
  }

  /**
   * Crea una nueva variante enviando sus datos y, opcionalmente, un archivo de imagen.
   * Utiliza `FormData` para soportar peticiones multiparte (Multipart/form-data).
   * @param variante - Objeto con los datos de la nueva variante a registrar (`VarianteRequest` parcial).
   * @param archivo - Archivo de imagen seleccionado por el usuario, o `null` si no hay imagen.
   * @returns Un `Observable` que emite la variante recién creada por el servidor.
   */
  crear(variante: Partial<VarianteRequest>, archivo: File | null): Observable<Variante> {
    const formData = new FormData();

    // El backend espera una parte llamada "variante" que sea JSON
    // Blob permite especificar el tipo de contenido JSON explícitamente dentro del FormData
    formData.append('variante', new Blob([JSON.stringify(variante)], {
      type: 'application/json'
    }));
    // El backend espera una parte llamada "imagen"
    if (archivo) {
      formData.append('imagen', archivo);
    }
    return this._http.post<Variante>(this._apiUrl, formData);
  }

  /**
   * Actualiza la información de una variante existente y, opcionalmente, su imagen representativa.
   * Utiliza `FormData` para soportar peticiones multiparte.
   * @param id - Identificador único de la variante que se desea actualizar.
   * @param variante - Objeto con los nuevos datos de la variante.
   * @param archivo - Nuevo archivo de imagen seleccionado, o `null` si no se desea modificar la imagen.
   * @returns Un `Observable` que emite la variante con su información actualizada.
   */
  actualizar(id: number, variante: Partial<VarianteRequest>, archivo: File | null): Observable<Variante> {
    const formData = new FormData();
    // El backend espera una parte llamada "variante" que sea JSON
    // Blob permite especificar el tipo de contenido JSON explícitamente dentro del FormData
    formData.append('producto', new Blob([JSON.stringify(variante)], {
      type: 'application/json'
    }));
    // El backend espera una parte llamada "imagen"
    if (archivo) {
      formData.append('imagen', archivo);
    }
    return this._http.put<Variante>(`${this._apiUrl}/${id}`, variante);
  }

  /**
   * Solicita al servidor un archivo con los registros de variantes exportadas, 
   * aplicando los mismos filtros disponibles en la función de listar.
   * @param formato - Formato del archivo a exportar (puede ser 'pdf' o 'csv').
   * @param productoId - Filtro por identificador de producto base.
   * @param sku - Filtro por código SKU de la variante.
   * @param skuMatchMode - Modo de coincidencia para el SKU.
   * @param talla - Filtro por nombre de talla.
   * @param tallaMatchMode - Modo de coincidencia para la talla.
   * @param color - Filtro por nombre de color.
   * @param colorMatchMode - Modo de coincidencia para el color.
   * @returns Un `Observable` que emite el archivo exportado en formato `Blob` (datos binarios).
   */
  exportar(
    formato: 'pdf' | 'csv',
    productoId?: number,
    sku?: string,
    skuMatchMode?: string,
    talla?: string,
    tallaMatchMode?: string,
    color?: string,
    colorMatchMode?: string
  ): Observable<Blob> {
    let params = new HttpParams().set('formato', formato);

    if (productoId) params = params.set('productoId', productoId);
    if (sku) {
      params = params.set('sku', sku);
      if (skuMatchMode) params = params.set('skuMatchMode', skuMatchMode);
    }
    if (talla) {
      params = params.set('talla', talla);
      if (tallaMatchMode) params = params.set('tallaMatchMode', tallaMatchMode);
    }
    if (color) {
      params = params.set('color', color);
      if (colorMatchMode) params = params.set('colorMatchMode', colorMatchMode);
    }

    return this._http.get(`${this._apiUrl}/exportar`, {
      params,
      responseType: 'blob' as 'json'
    }).pipe(
      map(response => response as Blob)
    );
  }

  /**
   * Elimina lógicamente una variante cambiando su estado en la base de datos.
   * @param id - Identificador único de la variante a eliminar.
   * @returns Un `Observable` que se completa sin emitir valor si la operación tiene éxito.
   */
  eliminar(id: number): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/${id}`);
  }

  /**
   * Reactiva una variante inactiva.
   * @param id - Identificador único de la variante a reactivar.
   * @returns Un `Observable` que se completa sin emitir valor si la operación tiene éxito.
   */
  activar(id: number): Observable<void> {
    return this._http.patch<void>(`${this._apiUrl}/${id}/activar`, {});
  }
}