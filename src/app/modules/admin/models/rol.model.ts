import { Permiso } from "./permiso.model";

/**
 * Modelo que representa un rol de usuario dentro del sistema.
 * Un rol actúa como una agrupación de permisos que define el nivel de acceso 
 * y las acciones que un usuario puede realizar en la plataforma.
 */
export interface Rol {
    /** Identificador único del rol en la base de datos. */
    id: number;
    /** Nombre descriptivo del rol (ej. `ADMINISTRADOR`, `EMPLEADO`, `LECTOR`). */
    nombre: string;
    /** * Lista de permisos asociados a este rol. 
     * Define detalladamente los privilegios específicos concedidos.
     */
    permisos: Permiso[];
}