import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../services/dashboard.service';
import { forkJoin } from 'rxjs';

/**
 * Componente (Widget) independiente utilizado en el panel de control (Dashboard).
 * Se encarga de mostrar estadísticas generales y resumidas del sistema, 
 * como los totales acumulados de diferentes entidades (productos, variantes, movimientos, etc.).
 */
@Component({
    standalone: true,
    selector: 'app-stats-widget',
    imports: [CommonModule],
    templateUrl: './estadisticas.widget.html'
})
export class StatsWidgetComponent implements OnInit {
    /** Servicio inyectado para recuperar las métricas y estadísticas del panel de control. */
    private _dashboardService = inject(DashboardService);

    /** Señal reactiva que almacena la cantidad total de productos registrados en el sistema. */
    totalProductos = signal(0);    
    /** Señal reactiva que almacena la cantidad total de variantes registradas. */
    totalVariantes = signal(0);
    /** Señal reactiva que almacena el conteo histórico de movimientos de inventario realizados. */
    totalMovimientos = signal(0);
    /** Señal reactiva que almacena la cantidad total de proyectos activos o registrados. */
    totalProyectos = signal(0);
    /** Señal reactiva que almacena el total de almacenes físicos o lógicos gestionados. */
    totalAlmacenes = signal(0);

    /**
     * Método del ciclo de vida de Angular que se ejecuta al inicializar el componente.
     * Utiliza `forkJoin` para realizar múltiples peticiones HTTP en paralelo al servicio,
     * obteniendo todos los totales de las entidades al mismo tiempo. Al resolverse,
     * actualiza el estado de todas las señales asociadas.
     */
    ngOnInit() {
        // Carga paralela de los 3 datos
        forkJoin({
            productos: this._dashboardService.getTotalProductos(),
            variantes: this._dashboardService.getTotalVariantes(),
            movimientos: this._dashboardService.getTotalMovimientos(),
            proyectos: this._dashboardService.getTotalProyectos(),
            almacenes: this._dashboardService.getTotalAlmacenes()
        }).subscribe(resultados => {
            this.totalProductos.set(resultados.productos);
            this.totalVariantes.set(resultados.variantes);
            this.totalMovimientos.set(resultados.movimientos);
            this.totalProyectos.set(resultados.proyectos);
            this.totalAlmacenes.set(resultados.almacenes);
        });
    }
}