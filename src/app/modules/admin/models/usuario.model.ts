import { Rol } from './rol.model';

/**
 * Modelo que representa un usuario dentro del sistema.
 * Contiene la información básica de identidad, credenciales y el nivel de acceso 
 * (rol) asignado para operar en la plataforma.
 */
export interface Usuario {
  /** Identificador único del usuario en la base de datos. */
  id: number;
  /** Nombre de usuario utilizado para acceder al sistema (único). */
  username: string;
  /** Correo electrónico de contacto asociado al usuario. */
  email: string;
  /** * Hash de la contraseña del usuario. 
   * Es opcional (`?`) porque por motivos de seguridad no suele enviarse desde el backend al listar usuarios, 
   * pero es necesario al momento de crear o actualizar credenciales.
   */
  passwordHash?: string;
  /** Objeto que representa el rol y los permisos asignados a este usuario. */
  rol: Rol;
  /** Indicador booleano que define si el usuario tiene permitido iniciar sesión y operar en el sistema (`true`) o si su cuenta está deshabilitada (`false`). */
  activo: boolean;
}