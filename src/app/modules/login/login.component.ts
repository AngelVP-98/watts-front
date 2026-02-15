import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy, inject, signal } from "@angular/core";
import { ReactiveFormsModule, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthService } from "../../core/auth/auth.service";

import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

/**
 * Componente encargado de gestionar la pantalla de inicio de sesión de la aplicación.
 * Proporciona un formulario reactivo para que los usuarios ingresen sus credenciales,
 * maneja el estado de carga y muestra mensajes de error en caso de fallo en la autenticación.
 */
@Component({
  selector: 'app-login',
  imports: [
    CommonModule,
    ReactiveFormsModule, // Cambiado de FormsModule a ReactiveFormsModule
    InputTextModule,
    PasswordModule,
    ButtonModule,
    CardModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  /** Servicio inyectado para manejar la lógica de autenticación y comunicación con el backend. */
  private readonly authService = inject(AuthService);
  /** Servicio inyectado para gestionar la navegación entre las vistas de la aplicación. */
  private readonly router = inject(Router);
  /** Constructor inyectado para construir de forma segura el formulario reactivo. */
  private readonly fb = inject(FormBuilder);

  // Estado local con Signals
  /** Señal reactiva que almacena y emite mensajes de error ocurridos durante el inicio de sesión. */
  readonly error = signal<string>('');
  /** Señal reactiva que indica si la petición de inicio de sesión está en curso, útil para deshabilitar botones o mostrar indicadores visuales. */
  readonly loading = signal<boolean>(false);

  /**
   * Instancia del formulario reactivo de inicio de sesión.
   * Contiene los controles:
   * - `username`: Nombre de usuario (requerido).
   * - `password`: Contraseña del usuario (requerido).
   * Al ser `nonNullable`, asegura que los valores nunca serán nulos al resetear o extraer datos.
   */
  readonly loginForm = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  /**
   * Procesa el envío del formulario de inicio de sesión.
   * Valida que los campos sean correctos, activa el estado de carga y limpia errores previos.
   * Extrae los valores e invoca al `authService` para autenticar al usuario.
   * - En caso de éxito: redirige al usuario a la vista principal (`/dashboard`).
   * - En caso de error: muestra un mensaje indicando que las credenciales son incorrectas y detiene la carga.
   */
  login(): void {
    if (this.loginForm.invalid) return;

    this.loading.set(true);
    this.error.set('');

    const { username, password } = this.loginForm.getRawValue();

    this.authService.login({ username, password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.error.set('Usuario o contraseña incorrectos');
        this.loading.set(false);
      }
    });
  }
}