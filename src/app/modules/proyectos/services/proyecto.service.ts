import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Page } from '../../../shared/models/page.model';
import { Archivo, InvitarUsuarioRequest, Proyecto, ProyectoRequest } from '../models/proyecto.model';

/**
 * Servicio encargado de gestionar la comunicación con el backend para todas las operaciones 
 * relacionadas con los proyectos y sus archivos adjuntos.
 */
@Injectable({
    providedIn: 'root'
})
export class ProyectoService {
    /** Cliente HTTP inyectado para realizar las peticiones a la API. */
    private _http = inject(HttpClient);
    /** URL base para los endpoints de proyectos, obtenida de las variables de entorno. */
    private _baseUrl = `${environment.apiUrl}/proyectos`;

    // --- PROYECTOS ---

    /**
     * Obtiene una lista paginada de los proyectos a los que el usuario actual tiene acceso.
     * Permite aplicar filtros opcionales de búsqueda por nombre y descripción.
     * * @param page Índice de la página a consultar (comienza en 0).
     * @param size Cantidad de proyectos a devolver por página.
     * @param nombre Término de búsqueda opcional para filtrar por el nombre del proyecto.
     * @param nombreMatchMode Modo de coincidencia para el filtro de nombre (ej. `contains`, `startsWith`).
     * @param descripcion Término de búsqueda opcional para filtrar por la descripción.
     * @param descripcionMatchMode Modo de coincidencia para el filtro de descripción.
     * @returns Un `Observable` que emite un objeto `Page` conteniendo el arreglo de proyectos y los metadatos de paginación.
     */
    listarMisProyectos(
        page: number = 0,
        size: number = 10,
        nombre?: string,
        nombreMatchMode?: string,
        descripcion?: string,
        descripcionMatchMode?: string
    ): Observable<Page<Proyecto>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
        if (nombre) {
            params = params.set('nombre', nombre);
            if (nombreMatchMode) {
                params = params.set('nombreMatchMode', nombreMatchMode);
            }
        }
        if (descripcion) {
            params = params.set('descripcion', descripcion);
            if (descripcionMatchMode) {
                params = params.set('nombreMatchMode', descripcionMatchMode);
            }
        }
        return this._http.get<Page<Proyecto>>(this._baseUrl, { params });
    }

    /**
     * Envía una petición para crear un nuevo proyecto en el sistema.
     * * @param request Objeto DTO que contiene el nombre y la descripción del nuevo proyecto.
     * @returns Un `Observable` que emite el proyecto recién creado con su ID asignado.
     */
    crearProyecto(request: ProyectoRequest): Observable<Proyecto> {
        return this._http.post<Proyecto>(this._baseUrl, request);
    }

    /**
     * Actualiza la información de un proyecto existente.
     * * @param id Identificador único del proyecto a modificar.
     * @param request Objeto DTO con los nuevos datos (nombre y descripción) del proyecto.
     * @returns Un `Observable` que emite el proyecto actualizado.
     */
    actualizarProyecto(id: number, request: ProyectoRequest): Observable<Proyecto> {
        return this._http.put<Proyecto>(`${this._baseUrl}/${id}`, request);
    }

    /**
     * Elimina un proyecto de forma permanente, incluyendo todos los archivos y miembros asociados.
     * * @param id Identificador único del proyecto a eliminar.
     * @returns Un `Observable` que se completa sin emitir valores (void) si la eliminación es exitosa.
     */
    eliminarProyecto(id: number): Observable<void> {
        return this._http.delete<void>(`${this._baseUrl}/${id}`);
    }

    /**
     * Invita a un usuario existente en la plataforma a colaborar en el proyecto.
     * * @param id Identificador único del proyecto al que se enviará la invitación.
     * @param request Objeto DTO que especifica el nombre de usuario a invitar y el rol que ocupará en el proyecto.
     * @returns Un `Observable` que se completa sin emitir valores (void) al procesarse la invitación.
     */
    invitarUsuario(id: number, request: InvitarUsuarioRequest): Observable<void> {
        return this._http.post<void>(`${this._baseUrl}/${id}/invitar`, request);
    }

    // --- ARCHIVOS ---

    /**
     * Obtiene la lista paginada de todos los archivos asociados a un proyecto específico.
     * * @param proyectoId Identificador único del proyecto del cual se quieren listar los archivos.
     * @param page Índice de la página a consultar (comienza en 0).
     * @param size Cantidad de archivos a mostrar por página.
     * @returns Un `Observable` que emite un objeto `Page` conteniendo el listado de archivos.
     */
    listarArchivos(proyectoId: number, page: number, size: number): Observable<Page<Archivo>> {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())

        return this._http.get<Page<Archivo>>(`${this._baseUrl}/${proyectoId}/archivos`, { params });
    }

    /**
     * Sube un nuevo archivo físico al servidor y lo asocia al proyecto indicado.
     * Permite especificar si se debe reemplazar un archivo existente que tenga el mismo nombre.
     * * @param proyectoId Identificador único del proyecto destino.
     * @param file Archivo físico (`File` proveniente de un input de tipo file) a subir.
     * @param reemplazar Booleano que indica si el archivo debe sobrescribirse en caso de existir uno con igual nombre. (Por defecto `false`).
     * @returns Un `Observable` que emite el registro del archivo creado/actualizado con sus metadatos.
     */
    subirArchivo(proyectoId: number, file: File, reemplazar: boolean = false): Observable<Archivo> {
        const formData = new FormData();
        formData.append('archivo', file);
        const params = new HttpParams().set('reemplazar', reemplazar);
        return this._http.post<Archivo>(`${this._baseUrl}/${proyectoId}/archivos`, formData, { params });
    }

    /**
     * Elimina permanentemente un archivo físico del servidor y su registro en la base de datos.
     * * @param id Identificador único del archivo a eliminar.
     * @returns Un `Observable` que se completa sin emitir valores (void) si el borrado es exitoso.
     */
    eliminarArchivo(id: number): Observable<void> {
        return this._http.delete<void>(`${this._baseUrl}/archivos/${id}`);
    }

    /**
     * Descarga el contenido binario de un archivo desde el servidor para guardarlo o visualizarlo.
     * * @param id Identificador único del archivo a descargar.
     * @returns Un `Observable` que emite el archivo crudo en formato `Blob`.
     */
    descargarArchivo(id: number): Observable<Blob> {
        return this._http.get(`${this._baseUrl}/archivos/${id}/descargar`, {
            responseType: 'blob'
        });
    }
}