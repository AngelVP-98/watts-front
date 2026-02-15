import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario } from '../models/usuario.model';
import { Page } from '../../../shared/models/page.model';

/**
 * Servicio encargado de gestionar las operaciones CRUD de los usuarios del sistema.
 * Proporciona los métodos necesarios para que el administrador pueda listar, crear, 
 * actualizar (mediante cambios parciales) y eliminar cuentas de usuario.
 */
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  /** Cliente HTTP inyectado para realizar las peticiones a la API. */
  private readonly _http = inject(HttpClient);
  /** URL base para los endpoints de administración de usuarios, definida en las variables de entorno. */
  private readonly _apiUrl = `${environment.apiUrl}/admin/usuarios`;

  /**
   * Obtiene una lista paginada de todos los usuarios registrados en la plataforma.
   * * @param page Índice de la página que se desea recuperar (por defecto 0).
   * @param size Cantidad de registros por página (por defecto 10).
   * @returns Un `Observable` con un objeto `Page` que contiene la colección de usuarios y metadatos de paginación.
   */
  listar(page: number = 0, size: number = 10): Observable<Page<Usuario>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this._http.get<Page<Usuario>>(this._apiUrl, { params });
  }

  /**
   * Registra un nuevo usuario en el sistema.
   * * @param usuario Objeto con la información completa del nuevo usuario (username, email, password, rol, etc.).
   * @returns Un `Observable` con el objeto `Usuario` creado y su identificador asignado por el servidor.
   */
  crear(usuario: Usuario): Observable<Usuario> {
    return this._http.post<Usuario>(this._apiUrl, usuario);
  }

  /**
   * Actualiza la información de un usuario existente de forma parcial.
   * Utiliza el método HTTP PATCH para modificar únicamente los campos enviados en el cuerpo de la petición.
   * * @param id Identificador único del usuario a actualizar.
   * @param usuario Objeto parcial con los campos que se desean modificar (ej. email, rol o estado activo).
   * @returns Un `Observable` con el objeto `Usuario` tras aplicar los cambios.
   */
  actualizar(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this._http.patch<Usuario>(`${this._apiUrl}/${id}`, usuario);
  }

  /**
   * Elimina de forma permanente la cuenta de un usuario del sistema.
   * * @param id Identificador único del usuario que se va a eliminar.
   * @returns Un `Observable` que se completa cuando la operación de borrado ha sido exitosa.
   */
  eliminar(id: number): Observable<void> {
    return this._http.delete<void>(`${this._apiUrl}/${id}`);
  }
}