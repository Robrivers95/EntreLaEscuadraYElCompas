# Manual de carga masiva de preguntas

## Formatos
La interfaz actual admite CSV UTF-8 con encabezados en la primera fila. Para un archivo Excel XLSX, abre el libro en Excel y utiliza Archivo → Guardar como → CSV UTF-8 antes de importarlo. Una fila por pregunta. No usar celdas combinadas. En CSV, si el texto incluye comas, poner el campo entre comillas dobles. Para comillas interiores, duplicarlas.

## Columnas
- id: identificador único y estable (obligatorio para actualizaciones).
- pregunta: texto de la pregunta (obligatorio).
- opcion_a, opcion_b, opcion_c, opcion_d: cuatro respuestas (obligatorias).
- correcta: A, B, C o D (obligatoria).
- categoria: por ejemplo Simbolismo, Historia, Ciencia (obligatoria).
- rito: reaa, york, frances, nacional-mexicano, otro o libre (obligatorio).
- grado: aprendiz, compañero, maestro o general (obligatorio).
- explicacion: justificación que se muestra tras responder.
- fuente: procedencia verificable.
- modalidades: board,duel,study separados por punto y coma.
- activa: true o false.

## Importación
1. Preparar el archivo con la plantilla CSV del repositorio.
2. Revisar que las preguntas masónicas usen su grado y rito correcto.
3. Validar formato, preguntas duplicadas por id y respuestas correctas.
4. Previsualizar antes de confirmar. No se importa ningún registro si hay errores de validación. Se actualiza el registro que contiene la etiqueta import-id:<id>; los demás se agregan.
5. Verificar el resultado en Estudio y en la Cámara autorizada.

La carga CSV con vista previa está implementada en el panel administrativo de esta rama. XLSX directo todavía no está implementado. El registro debe tener permisos de escritura en Firestore; la seguridad de preguntas por grado debe configurarse y verificarse en el servidor antes del despliegue.
