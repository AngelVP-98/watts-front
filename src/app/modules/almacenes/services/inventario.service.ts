import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../../shared/models/page.model';
import { InventarioStock } from '../models/inventario.model';

/**
 * Servicio encargado de gestionar las consultas relacionadas con el inventario
 * y el stock de productos/variantes. Interactúa con la API REST para proporcionar
 * información detallada sobre las existencias físicas en los almacenes.
 */
@Injectable({
    providedIn: 'root'
})
export class InventarioService {
    /** Cliente HTTP inyectado para realizar las peticiones al servidor. */
    private readonly _http = inject(HttpClient);
    /** URL base para los endpoints de inventario, obtenida de las variables de entorno. */
    private readonly _apiUrl = `${environment.apiUrl}/inventario`;

    /**
     * Obtiene una lista paginada del stock disponible en un almacén específico,
     * permitiendo aplicar filtros detallados por producto, SKU, talla o color.
     * * @param almacenId - Identificador único del almacén del cual se desea consultar el stock.
     * @param page - Número de la página a consultar (por defecto 0).
     * @param size - Cantidad de registros por página (por defecto 10).
     * @param producto - Filtro por nombre del producto base.
     * @param productoMatchMode - Modo de coincidencia para el filtro de producto (ej. 'contains').
     * @param sku - Filtro por código SKU de la variante.
     * @param skuMatchMode - Modo de coincidencia para el filtro de SKU.
     * @param talla - Filtro por el nombre o identificador de la talla.
     * @param tallaMatchMode - Modo de coincidencia para el filtro de talla.
     * @param color - Filtro por el nombre o identificador del color.
     * @param colorMatchMode - Modo de coincidencia para el filtro de color.
     * @returns Un `Observable` que emite un objeto `Page` con la lista de `InventarioStock` y metadatos de paginación.
     */
    listarStockPorAlmacen(
        almacenId: number,
        page: number = 0,
        size: number = 10,
        producto?: string,
        productoMatchMode?: string,
        sku?: string,
        skuMatchMode?: string,
        talla?: string,
        tallaMatchMode?: string,
        color?: string,
        colorMatchMode?: string
    ): Observable<Page<InventarioStock>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (producto) {
            params = params.set('producto', producto);
            if (productoMatchMode) params = params.set('productoMatchMode', productoMatchMode);
        }

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

        return this._http.get<Page<InventarioStock>>(`${this._apiUrl}/stock/${almacenId}`, { params });
    }

    // Aquí se agregarán futuros métodos como:
    // - stockTotal(varianteId)
}