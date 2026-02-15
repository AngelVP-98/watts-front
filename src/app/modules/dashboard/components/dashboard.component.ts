import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatsWidgetComponent } from './widgets/estadisticas/estadisticas.widget';

/**
 * Componente principal del panel de control (Dashboard).
 * Actúa como contenedor principal o vista de inicio una vez que el usuario inicia sesión.
 * Se encarga de mostrar widgets (como las estadísticas generales) y accesos directos
 * mediante enlaces de enrutamiento hacia los diferentes módulos del sistema.
 */
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, StatsWidgetComponent], // Standalone por defecto: Importamos RouterLink para la navegación en el HTML
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  // No necesitamos lógica aquí, la navegación se maneja en el template
}