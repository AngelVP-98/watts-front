import { Injectable } from '@angular/core';

/**
 * Servicio utilitario encargado de gestionar la descarga de archivos en el cliente.
 * * Este servicio permite transformar objetos binarios (Blobs) recibidos del servidor
 * en archivos descargables a través del navegador, gestionando la creación de enlaces
 * temporales y la liberación de recursos del sistema.
 */
@Injectable({
    providedIn: 'root'
})
export class FileDownloadService {

    /**
     * Descarga un archivo binario (Blob) al navegador.
     * @param blob El contenido binario del archivo.
     * @param nombreArchivo El nombre completo con extensión (ej: reporte.pdf).
     */
    download(blob: Blob, nombreArchivo: string): void {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombreArchivo;

        // Necesario para compatibilidad con Firefox
        document.body.appendChild(link);
        link.click();

        // Limpieza de memoria y DOM
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    }
}