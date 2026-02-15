/**
 * Enumeración que define los diferentes roles y niveles de acceso que un usuario puede tener dentro de un proyecto.
 */
export enum RolProyecto {
    /** Control total sobre el proyecto, incluyendo la gestión de miembros y la eliminación del mismo. */
    PROPIETARIO = 'PROPIETARIO',
    /** Capacidad para modificar detalles del proyecto, subir y borrar archivos. */
    EDITOR = 'EDITOR',
    /** Acceso de solo lectura; permite visualizar y descargar archivos, pero no alterarlos ni borrarlos. */
    LECTOR = 'LECTOR'
}

/**
 * Modelo que representa la información principal de un proyecto recuperada del servidor.
 */
export interface Proyecto {
    /** Identificador único del proyecto. */
    id: number;
    /** Nombre descriptivo asignado al proyecto. */
    nombre: string;
    /** Breve descripción del propósito o contenido del proyecto. */
    descripcion: string;
    /** Rol que posee el usuario actualmente autenticado sobre este proyecto específico. */
    miRol: RolProyecto;
    /** Fecha en la que el proyecto fue creado (generalmente devuelta en formato de cadena ISO). */
    fechaCreacion: string;
    /** Número total de usuarios que forman parte o tienen acceso al proyecto. */
    cantidadMiembros: number;
}

/**
 * Objeto de transferencia de datos (DTO) utilizado para crear un nuevo proyecto o actualizar uno existente.
 */
export interface ProyectoRequest {
    /** Nombre que se le asignará al proyecto. */
    nombre: string;
    /** Descripción detallada del proyecto. */
    descripcion: string;
}

/**
 * Objeto de transferencia de datos (DTO) con el payload requerido para invitar a un usuario al proyecto.
 */
export interface InvitarUsuarioRequest {
    /** Nombre de usuario (username) del sistema al que se desea invitar. */
    username: string;
    /** Rol y nivel de acceso que se le asignará al nuevo integrante dentro del proyecto. */
    rol: RolProyecto;
}

/**
 * Modelo que representa los metadatos de un archivo físico subido y asociado a un proyecto.
 */
export interface Archivo {
    /** Identificador único del archivo en la base de datos. */
    id: number;
    /** Nombre original del archivo cuando fue subido, incluyendo su extensión (ej. `documento.pdf`). */
    nombreOriginal: string;
    /** Tipo MIME del archivo (ej. `application/pdf`, `image/png`). */
    tipo: string;
    /** Tamaño del archivo expresado en bytes. */
    tamano: number; 
    /** Nombre del usuario que realizó la carga del archivo al sistema. */
    subidoPor: string;
    /** Fecha y hora exacta en la que el archivo fue subido al servidor. */
    fechaSubida: string;
}