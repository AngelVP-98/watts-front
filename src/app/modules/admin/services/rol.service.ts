import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Rol } from '../models/rol.model';
import { Page } from '../../../shared/models/page.model';

/**
 * Servicio encargado de gestionar las operaciones CRUD de los roles del sistema.
 * Proporciona métodos para listar, crear, actualizar y eliminar perfiles de acceso 
 * en el módulo administrativo.
 */
@Injectable({
    providedIn: 'root'
})
export class RolService {
    /** Cliente HTTP para realizar las comunicaciones con la API. */
    private readonly _http = inject(HttpClient);
    /** URL base para los endpoints de gestión de roles administrativos. */
    private readonly _apiUrl = `${environment.apiUrl}/admin/roles`;

    /**
     * Obtiene una lista paginada de todos los roles definidos en el sistema.
     * * @param page Índice de la página a recuperar (por defecto 0).
     * @param size Cantidad de registros por página (por defecto 10).
     * @returns Un `Observable` con un objeto `Page` que contiene la lista de roles.
     */
    listar(page = 0, size = 10): Observable<Page<Rol>> {
        return this._http.get<Page<Rol>>(this._apiUrl, { params: { page, size } });
    }

    /**
     * Registra un nuevo rol en el sistema junto con sus permisos asociados.
     * * @param rol Objeto que contiene los datos del nuevo rol a crear.
     * @returns Un `Observable` con el rol creado y su ID asignado.
     */
    crear(rol: Rol): Observable<Rol> {
        return this._http.post<Rol>(this._apiUrl, rol);
    }

    /**
     * Actualiza la información de un rol existente (nombre o lista de permisos).
     * * @param id Identificador único del rol a modificar.
     * @param rol Objeto parcial con los datos actualizados.
     * @returns Un `Observable` con el rol modificado.
     */
    actualizar(id: number, rol: Partial<Rol>): Observable<Rol> {
        return this._http.put<Rol>(`${this._apiUrl}/${id}`, rol);
    }

    /**
     * Elimina permanentemente un rol del sistema.
     * * @param id Identificador único del rol a eliminar.
     * @returns Un `Observable` que se completa cuando la operación finaliza con éxito.
     */
    eliminar(id: number): Observable<void> {
        return this._http.delete<void>(`${this._apiUrl}/${id}`);
    }
}