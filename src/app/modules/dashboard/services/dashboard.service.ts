import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductoService } from '../../inventario/services/producto.service';
import { VarianteService } from '../../inventario/services/variante.service';
import { MovimientoService } from '../../transacciones/services/movimiento.service';
import { ProyectoService } from '../../proyectos/services/proyecto.service';
import { AlmacenService } from '../../almacenes/services/almacen.service';

/**
 * Servicio encargado de proveer los datos estadísticos e información resumida
 * para el panel de control (Dashboard).
 * Actúa como una capa de agregación que interactúa con los distintos servicios
 * de la aplicación para recolectar las métricas necesarias.
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  /** Cliente HTTP inyectado, disponible para futuras peticiones directas al backend. */
  private readonly _http = inject(HttpClient);
  /** Servicio inyectado para gestionar y consultar productos. */
  private readonly _productoService = inject(ProductoService);
  /** Servicio inyectado para gestionar y consultar variantes de productos. */
  private readonly _varianteService = inject(VarianteService);
  /** Servicio inyectado para gestionar y consultar movimientos de inventario. */
  private readonly _movimientoService = inject(MovimientoService);
  /** Servicio inyectado para gestionar y consultar proyectos. */
  private readonly _proyectoService = inject(ProyectoService);
  /** Servicio inyectado para gestionar y consultar almacenes. */
  private readonly _almacenService = inject(AlmacenService);
  /** URL base de la API, obtenida de las variables de entorno. */
  private readonly _apiUrl = `${environment.apiUrl}/inventario`;

  /**
   * Obtiene la cantidad total de productos registrados en el sistema.
   * Utiliza una petición paginada solicitando 1 solo registro para extraer 
   * eficientemente el metadato `totalElements` devuelto por el servidor.
   * @returns Un `Observable` que emite el número total de productos.
   */
  getTotalProductos(): Observable<number> {
    return this._productoService.listar(0, 1).pipe(map(page => page.totalElements));
  }

  /**
   * Obtiene la cantidad total de variantes registradas en el sistema.
   * Realiza una petición solicitando 1 registro y extrae el valor `totalElements`.
   * @returns Un `Observable` que emite el número total de variantes.
   */
  getTotalVariantes(): Observable<number> {
    return this._varianteService.listar(0, 1).pipe(map(page => page.totalElements));
  }

  /**
   * Obtiene la cantidad total histórica de movimientos de inventario.
   * Realiza una petición solicitando 1 registro y extrae el valor `totalElements`.
   * @returns Un `Observable` que emite el número total de movimientos.
   */
  getTotalMovimientos(): Observable<number> {
    return this._movimientoService.listarMovimientos(0, 1).pipe(map(page => page.totalElements));
  }

  /**
   * Obtiene la cantidad total de proyectos asociados al usuario actual.
   * Realiza una petición solicitando 1 registro y extrae el valor `totalElements`.
   * @returns Un `Observable` que emite el número total de proyectos.
   */
  getTotalProyectos(): Observable<number> {
    return this._proyectoService.listarMisProyectos(0, 1).pipe(map(page => page.totalElements));
  }

  /**
   * Obtiene la cantidad total de almacenes configurados en el sistema.
   * Realiza una petición solicitando 1 registro y extrae el valor `totalElements`.
   * @returns Un `Observable` que emite el número total de almacenes.
   */
  getTotalAlmacenes(): Observable<number> {
    return this._almacenService.listar(0, 1).pipe(map(page => page.totalElements));
  }

}