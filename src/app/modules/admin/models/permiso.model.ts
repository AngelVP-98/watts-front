/**
 * Modelo que representa un permiso o privilegio individual dentro del sistema.
 * Los permisos se asignan a los roles para determinar a qué áreas o acciones 
 * tiene acceso un usuario (por ejemplo: crear usuarios, editar productos, etc.).
 */
export interface Permiso {
    /** Identificador único del permiso en la base de datos. */
    id: number;
    /** Nombre o código descriptivo del permiso (ej. `USER_CREATE`, `INVENTARIO_READ`). */
    nombre: string;
}