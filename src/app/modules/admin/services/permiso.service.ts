import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Permiso } from '../models/permiso.model';

/**
 * Servicio encargado de gestionar las comunicaciones HTTP con el backend 
 * para todo lo relacionado con los permisos del sistema.
 */
@Injectable({
  providedIn: 'root'
})
export class PermisoService {
  /** Cliente HTTP inyectado para realizar las peticiones a la API. */
  private readonly _http = inject(HttpClient);
  /** URL base para los endpoints de permisos, construida a partir de las variables de entorno. */
  private readonly _apiUrl = `${environment.apiUrl}/admin/permisos`;

  /**
   * Obtiene la lista completa de todos los permisos disponibles en el sistema.
   * A diferencia de otros listados, este no suele estar paginado porque se utiliza 
   * principalmente para rellenar selectores al crear o editar roles.
   * * @returns Un `Observable` que emite un arreglo con todos los objetos `Permiso`.
   */
  listarTodos(): Observable<Permiso[]> {
    return this._http.get<Permiso[]>(this._apiUrl);
  }
}