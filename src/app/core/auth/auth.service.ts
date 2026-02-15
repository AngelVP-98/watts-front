import { Injectable, signal, computed } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { LoginRequest, LoginResponse } from "../../shared/models/auth.model";
import { tap } from "rxjs";

/**
 * Servicio central de Autenticación.
 *
 * Se encarga de la comunicación con el backend para login/logout,
 * gestión del Token JWT y verificación de permisos basados en roles.
 *
 * @example
 * constructor(private authService: AuthService) {}
 *
 * this.authService.login(credentials).subscribe(...);
 */
@Injectable({
  providedIn: 'root'
})

export class AuthService {
  /** URL base para los endpoints de autenticación. */
  private apiUrl = `${environment.apiUrl}/auth`;

  /**
   * Signal interna para gestionar el estado actual del rol del usuario.
   * Se inicializa recuperando el rol del token existente (si lo hay).
   */
  private _currentRole = signal<string | null>(this.getRole());

  /**
   * Signal computada pública que determina si el usuario actual tiene rol de administrador.
   * Se actualiza automáticamente cuando cambia `_currentRole`.
   */
  public isAdmin = computed(() => this._currentRole() === 'ADMIN');

  constructor(private http: HttpClient) { }

  // LOGIN Y LOGOUT
  /**
   * Realiza la petición de inicio de sesión al servidor.
   * Si la respuesta es exitosa, guarda el token en LocalStorage y actualiza la señal del rol.
   *
   * @param data - Objeto con las credenciales del usuario (usuario y contraseña).
   * @returns Un Observable con la respuesta del servidor que incluye el token.
   */
  login(data: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(res => {
          localStorage.setItem('token', res.token);
          // Actualizamos la señal al loguearse para que toda la app se entere
          this._currentRole.set(this.getRole());
        })
      );
  }

  /**
   * Cierra la sesión del usuario eliminando el token del almacenamiento local.
   */
  logout() {
    localStorage.removeItem('token');
  }

  // METODOS DE ACCESO AL TOKEN
  /**
   * Recupera el token JWT almacenado en el LocalStorage.
   *
   * @returns El token en formato string o `null` si no existe.
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }
  /**
   * Verifica si el usuario está logueado comprobando la existencia del token.
   *
   * @returns `true` si existe un token, `false` en caso contrario.
   */
  isLogged(): boolean {
    return !!this.getToken();
  }

  // METODOS DE EXTRACCIÓN DE DATOS DEL JWT

  /**
   * Extrae el rol del usuario desde el token JWT.
   * Elimina el prefijo 'ROLE_' si está presente.
   *
   * @returns El nombre del rol (ej: 'ADMIN', 'USER') o `null` si no se puede obtener.
   */
  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const values = this.decodeToken(token);
      const roles: string[] = values.roles; // Asumiendo que el backend envía 'roles'

      if (!roles || roles.length === 0) return null;

      const rol = roles[0];
      return rol.startsWith('ROLE_') ? rol.replace('ROLE_', '') : rol;
    } catch (e) { return null; }
  }

  /**
   * Obtiene el nombre de usuario (subject) desde el payload del token JWT.
   *
   * @returns El nombre de usuario o `null` si falla la decodificación.
   */
  getUsername(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      const values = JSON.parse(decodedPayload);

      // 'sub' es el standard JWT para el "Subject" (el usuario)
      return values.sub;
    } catch (e) {
      return null;
    }
  }

  // METODOS DE PERMISOS
  /**
   * Obtiene la lista de permisos asociados al usuario desde el token.
   *
   * @returns Un array de strings con los permisos, o un array vacío si no hay ninguno o falla el proceso.
   */
  getPermissions(): string[] {
    const token = this.getToken();
    if (!token) return [];

    try {
      const values = this.decodeToken(token);
      // Retorna el array de permisos o un array vacío si no existe
      return values.permissions || [];
    } catch (e) { return []; }
  }

  /**
   * Verifica si el usuario actual posee un permiso específico.
   * Los usuarios con rol 'ADMIN' tienen acceso total (bypass).
   *
   * @param permission - El string del permiso a verificar (ej: 'CREAR_USUARIO').
   * @returns `true` si tiene el permiso o es admin, `false` en caso contrario.
   */
  hasPermission(permission: string): boolean {
    if (!this.isLogged()) return false;

    // Si es ADMIN, tiene permiso para todo (bypass)
    if (this.isAdmin()) return true;

    // Si no es admin, buscamos en su lista de permisos explícitos
    const userPermissions = this.getPermissions();
    return userPermissions.includes(permission);
  }

  // METODO AUXILIAR PRIVADO
  /**
   * Decodifica la parte del payload de un token JWT.
   *
   * @param token - El token JWT completo.
   * @returns Un objeto JSON con los datos del payload.
   */
  private decodeToken(token: string): any {
    const payload = token.split('.')[1];
    const decodedJson = atob(payload);
    return JSON.parse(decodedJson);
  }
}