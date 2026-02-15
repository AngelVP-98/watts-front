import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Talla, Color } from '../models/catalogo.model';

/**
 * Servicio encargado de gestionar las operaciones de catálogo de la aplicación.
 * Proporciona métodos para interactuar con los endpoints de tallas y colores.
 */
@Injectable({
  providedIn: 'root'
})
export class CatalogoService {
  /** Cliente HTTP para realizar las peticiones al backend. */
  private readonly _http = inject(HttpClient);
  /** URL base de la API obtenida de la configuración del entorno. */
  private readonly _apiUrl = environment.apiUrl;

  /**
   * Obtiene la lista completa de tallas registradas en el sistema.
   * * @returns Un Observable que emite un array de objetos de tipo `Talla`.
   */
  obtenerTallas(): Observable<Talla[]> {
    return this._http.get<Talla[]>(`${this._apiUrl}/tallas`);
  }

  /**
   * Registra una nueva talla en el catálogo.
   * * @param talla - Objeto que contiene el nombre de la nueva talla.
   * @returns Un Observable que emite la `Talla` creada, incluyendo su ID generado.
   */
  crearTalla(talla: { nombre: string }): Observable<Talla> {
    return this._http.post<Talla>(`${this._apiUrl}/tallas`, talla);
  }

  /**
   * Obtiene la lista completa de colores registrados en el sistema.
   * * @returns Un Observable que emite un array de objetos de tipo `Color`.
   */
  obtenerColores(): Observable<Color[]> {
    return this._http.get<Color[]>(`${this._apiUrl}/colores`);
  }

  /**
   * Registra un nuevo color en el catálogo.
   * * @param color - Objeto que contiene el nombre del nuevo color.
   * @returns Un Observable que emite el `Color` creado, incluyendo su ID generado.
   */
  crearColor(color: { nombre: string }): Observable<Color> {
    return this._http.post<Color>(`${this._apiUrl}/colores`, color);
  }
}