import { Pipe, PipeTransform, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Observable, map, of, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Pipe personalizado (`secureImage`) diseñado para cargar imágenes de forma segura desde el servidor.
 * * **Propósito:**
 * - Permite realizar peticiones HTTP para obtener imágenes almacenadas en carpetas protegidas del backend.
 * - Al realizar una petición `GET` mediante el `HttpClient`, el `authInterceptor` añade automáticamente el token JWT.
 * - Evita problemas de seguridad mediante el uso de `DomSanitizer`.
 * - Gestiona estados de error devolviendo una imagen de marcador de posición (placeholder).
 */
@Pipe({
    name: 'secureImage',
    standalone: true
})
export class SecureImagePipe implements PipeTransform {
    /** Servicio para realizar peticiones HTTP. */
    private readonly http = inject(HttpClient);
    /** Servicio para sanear URLs y marcar contenido como seguro para Angular. */
    private readonly sanitizer = inject(DomSanitizer);

    /**
     * Transforma una ruta o nombre de archivo de imagen en una URL segura y cargada mediante HTTP.
     * * **Lógica de procesamiento:**
     * 1. Si no se proporciona ruta, devuelve una imagen por defecto.
     * 2. Si es una cadena Base64 (`data:`), la marca como segura y la devuelve directamente.
     * 3. Si es una ruta de servidor, construye la URL completa apuntando al directorio de subidas (`/uploads/`).
     * 4. Realiza la descarga del archivo como un `Blob` (binario) para que el interceptor incluya el token.
     * 5. Convierte el `Blob` en una URL de objeto local.
     * * @param imagePath - El nombre del archivo o la ruta de la imagen (ej: "usuario_123.jpg").
     * @returns Un `Observable` que emite una `SafeUrl` lista para ser vinculada al atributo `src` de una imagen.
     */
    transform(imagePath: string | undefined | null): Observable<SafeUrl> {
        // Si no hay imagen, devolvemos una imagen por defecto o null
        if (!imagePath) {
            return of('./assets/images/placeholder.png'); // Asegúrate de tener esta imagen o usa una URL pública
        }

        // Si la imagen es una previsualización local, la saneamos y devolvemos
        if (imagePath.startsWith('data:')) {
            return of(this.sanitizer.bypassSecurityTrustUrl(imagePath));
        }

        /**
         * Construcción de la URL de acceso al archivo en el servidor.
         * Se ajusta la URL base del entorno para apuntar a la carpeta de recursos estáticos del backend.
         */
        const url = `${environment.apiUrl.replace('/api', '')}/uploads/${imagePath}`;

        /**
         * Ejecución de la petición protegida:
         * - Solicitamos 'blob' para recibir datos binarios.
         * - El interceptor adjuntará el Bearer Token.
         */
        return this.http.get(url, { responseType: 'blob' }).pipe(
            map(blob => {
                const objectUrl = URL.createObjectURL(blob);
                return this.sanitizer.bypassSecurityTrustUrl(objectUrl);
            }),
            catchError(() => {
                // En caso de error (404, 401, etc), devolver placeholder
                return of('./assets/images/placeholder.png');
            })
        );
    }
}