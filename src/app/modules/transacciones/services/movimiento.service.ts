import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../../shared/models/page.model';
import { MovimientoRequest, MovimientoResponse } from '../models/movimiento.model';
import { map } from 'rxjs';

/**
 * Servicio encargado de gestionar las peticiones HTTP relacionadas con los movimientos
 * o transacciones de inventario (entradas, salidas, compras, ventas, etc.).
 */
@Injectable({
  providedIn: 'root'
})
export class MovimientoService {
  /** Cliente HTTP inyectado para realizar las peticiones a la API. */
  private readonly _http = inject(HttpClient);
  /** URL base para los endpoints de movimientos, construida a partir de las variables de entorno. */
  private readonly _apiUrl = `${environment.apiUrl}/movimientos`;

  /**
   * Obtiene una lista paginada de los movimientos de inventario registrados en el sistema.
   * Permite aplicar múltiples filtros opcionales para realizar búsquedas avanzadas.
   * Los resultados se devuelven ordenados por fecha de creación de manera descendente por defecto.
   * * @param page Índice de la página a consultar (comienza en 0).
   * @param size Cantidad máxima de registros a devolver por página.
   * @param tipo Filtro exacto por el tipo de movimiento (ej. `COMPRA`, `VENTA`).
   * @param observaciones Texto para filtrar por las observaciones del movimiento.
   * @param observacionesMatchMode Modo de coincidencia para las observaciones (ej. `contains`, `startsWith`).
   * @param creadoPor Nombre de usuario para filtrar quién registró el movimiento.
   * @param creadoPorMatchMode Modo de coincidencia para el creador del registro.
   * @param varianteNombre Filtro por el nombre o SKU de la variante del producto afectada.
   * @param varianteMatchMode Modo de coincidencia para la variante.
   * @param almacenNombre Filtro por la descripción o nombre del almacén asociado.
   * @param almacenMatchMode Modo de coincidencia para el almacén.
   * @param fechaInicio Fecha inicial (formato `YYYY-MM-DD`) para filtrar por un rango temporal.
   * @param fechaFin Fecha final (formato `YYYY-MM-DD`) para filtrar por un rango temporal.
   * @returns Un `Observable` que emite un objeto `Page` conteniendo la lista de movimientos y los datos de paginación.
   */
  listarMovimientos(
    page: number = 0,
    size: number = 10,
    tipo?: string,
    observaciones?: string,
    observacionesMatchMode?: string,
    creadoPor?: string,
    creadoPorMatchMode?: string,
    varianteNombre?: string,
    varianteMatchMode?: string,
    almacenNombre?: string,
    almacenMatchMode?: string,
    fechaInicio?: string,
    fechaFin?: string
  ): Observable<Page<MovimientoResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'fechaCreacion,desc');

    if (tipo) {
      params = params.set('tipo', tipo);
    }
    if (observaciones) {
      params = params.set('observaciones', observaciones);
      if (observacionesMatchMode) {
        params = params.set('observacionesMatchMode', observacionesMatchMode);
      }
    }
    if (creadoPor) {
      params = params.set('creadoPor', creadoPor);
      if (creadoPorMatchMode) {
        params = params.set('creadoPorMatchMode', creadoPorMatchMode);
      }
    }
    if (varianteNombre) {
      params = params.set('varianteNombre', varianteNombre);
      if (varianteMatchMode) {
        params = params.set('varianteMatchMode', varianteMatchMode);
      }
    }
    if (almacenNombre) {
      params = params.set('almacenNombre', almacenNombre);
      if (almacenMatchMode) {
        params = params.set('almacenMatchMode', almacenMatchMode);
      }
    }
    if (fechaInicio) {
      params = params.set('fechaInicio', fechaInicio);
    }
    if (fechaFin) {
      params = params.set('fechaFin', fechaFin);
    }

    return this._http.get<Page<MovimientoResponse>>(this._apiUrl, { params });
  }

  /**
   * Envía una petición para registrar un nuevo movimiento de inventario en el sistema.
   * * @param request Objeto DTO que contiene los detalles del movimiento (SKU, almacén, cantidad, tipo, etc.).
   * @returns Un `Observable` que emite la respuesta del servidor tras procesar la creación.
   */
  crearMovimiento(request: MovimientoRequest): Observable<any> {
    return this._http.post(this._apiUrl, request);
  }

  /**
   * Solicita la exportación del historial de movimientos en un archivo descargable (PDF o CSV).
   * Soporta los mismos parámetros de filtrado que el método `listarMovimientos` para asegurar 
   * que el archivo exportado coincida con la vista actual del usuario en la tabla.
   * * @param formato Formato del archivo a generar (`pdf` o `csv`).
   * @param varianteNombre Filtro por nombre o SKU de la variante.
   * @param varianteMatchMode Modo de coincidencia para la variante.
   * @param almacenNombre Filtro por nombre del almacén.
   * @param almacenMatchMode Modo de coincidencia para el almacén.
   * @param tipo Filtro por tipo de movimiento.
   * @param observaciones Filtro por observaciones.
   * @param observacionesMatchMode Modo de coincidencia para observaciones.
   * @param fechaInicio Fecha inicial para el rango de exportación.
   * @param fechaFin Fecha final para el rango de exportación.
   * @param creadoPor Filtro por usuario creador.
   * @param creadoPorMatchMode Modo de coincidencia para el creador.
   * @returns Un `Observable` que emite el archivo generado en formato binario (`Blob`).
   */
  exportar(
    formato: 'pdf' | 'csv',
    varianteNombre?: string,
    varianteMatchMode?: string,
    almacenNombre?: string,
    almacenMatchMode?: string,
    tipo?: string,
    observaciones?: string,
    observacionesMatchMode?: string,
    fechaInicio?: string,
    fechaFin?: string,
    creadoPor?: string,
    creadoPorMatchMode?: string
  ): Observable<Blob> {
    let params = new HttpParams().set('formato', formato);

    if (varianteNombre) {
      params = params.set('varianteNombre', varianteNombre);
      if (varianteMatchMode) params = params.set('varianteMatchMode', varianteMatchMode);
    }
    if (almacenNombre) {
      params = params.set('almacenNombre', almacenNombre);
      if (almacenMatchMode) params = params.set('almacenMatchMode', almacenMatchMode);
    }
    if (tipo) params = params.set('tipo', tipo);
    if (observaciones) {
      params = params.set('observaciones', observaciones);
      if (observacionesMatchMode) params = params.set('observacionesMatchMode', observacionesMatchMode);
    }
    if (fechaInicio) params = params.set('fechaInicio', fechaInicio);
    if (fechaFin) params = params.set('fechaFin', fechaFin);

    if (creadoPor) {
      params = params.set('creadoPor', creadoPor);
      if (creadoPorMatchMode) params = params.set('creadoPorMatchMode', creadoPorMatchMode);
    }

    return this._http.get(`${this._apiUrl}/exportar`, {
      params,
      // Hack necesario en Angular HttpClient para recibir un Blob sin errores de parseo de JSON
      responseType: 'blob' as 'json'
    }).pipe(
      map(response => response as Blob)
    );
  }
}