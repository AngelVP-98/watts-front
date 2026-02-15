import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe utilitario (`fileType`) para transformar tipos MIME técnicos en descripciones legibles.
 *
 * Su función principal es convertir cadenas complejas como 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
 * o 'application/pdf' en etiquetas simples y amigables para la interfaz de usuario (ej: 'Word', 'PDF').
 *
 * @example
 * // En plantilla:
 * {{ 'application/pdf' | fileType }}
 * // Resultado: "PDF"
 */
@Pipe({
    name: 'fileType',
    standalone: true
})
export class FileTypePipe implements PipeTransform {

    /**
     * Transforma un tipo MIME en una etiqueta legible por humanos.
     *
     * Detecta patrones en el string MIME para identificar familias de archivos comunes:
     * - Documentos de Office (Word, Excel, PowerPoint).
     * - Archivos PDF.
     * - Imágenes (PNG, JPG y genéricas).
     * - Archivos de texto plano.
     * - Archivos comprimidos (ZIP, RAR, TAR).
     *
     * @param mimeType - El string del tipo MIME a procesar (ej: 'image/png').
     * @returns Una cadena con el nombre corto del tipo de archivo (ej: 'Imagen PNG').
     * Si el MIME es nulo o no se reconoce, devuelve el valor genérico 'Archivo'.
     */
    transform(mimeType: string): string {
        if (!mimeType) return 'Archivo';

        const type = mimeType.toLowerCase();

        // Word
        if (type.includes('wordprocessingml') || type.includes('msword')) {
            return 'Word';
        }
        // Excel
        if (type.includes('spreadsheetml') || type.includes('excel') || type.includes('sheet')) {
            return 'Excel';
        }
        // PowerPoint
        if (type.includes('presentationml') || type.includes('powerpoint')) {
            return 'PowerPoint';
        }
        // PDF
        if (type === 'application/pdf') {
            return 'PDF';
        }
        // Imágenes
        if (type === 'image/png') {
            return 'Imagen PNG';
        }
        if (type === 'image/jpeg' || type === 'image/jpg') {
            return 'Imagen JPG';
        }
        if (type.startsWith('image/')) {
            return 'Imagen ' + type.split('/')[1].toUpperCase();
        }
        // Texto
        if (type === 'text/plain') {
            return 'Texto Plano';
        }
        // Comprimidos
        if (type.includes('zip') || type.includes('compressed') || type.includes('tar')) {
            return 'Comprimido (ZIP/RAR)';
        }

        // Fallback: Devuelve "Archivo"
        return 'Archivo';
    }
}