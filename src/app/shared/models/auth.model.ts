/**
 * Interfaz que define la estructura de datos enviada al servidor para iniciar sesión.
 * Contiene las credenciales necesarias del usuario.
 */
export interface LoginRequest {
  /** El nombre de usuario o identificador único. */
  username: string;
  /** La contraseña del usuario. */
  password: string;
}

/**
 * Interfaz que define la estructura de la respuesta del servidor tras un inicio de sesión exitoso.
 */
export interface LoginResponse {
  /** * El token de autenticación generado por el backend.
   * Este token debe ser almacenado y enviado en las cabeceras de las peticiones.
   */
  token: string;
}