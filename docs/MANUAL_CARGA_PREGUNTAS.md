# Manual de carga masiva de preguntas

## Formatos
CSV UTF-8 con encabezados en la primera fila; XLSX con la primera hoja como tabla equivalente. Una fila por pregunta. No usar celdas combinadas. En CSV, si el texto incluye comas, poner el campo entre comillas dobles. Para comillas interiores, duplicarlas.

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
4. Previsualizar antes de confirmar. Actualizar por id cuando exista; nunca duplicar.
5. Verificar el resultado en Estudio y en la Cámara autorizada.

Nota: la interfaz de importación CSV/XLSX aún está pendiente de implementación. Este documento define el contrato previsto y no implica que el botón ya esté disponible.
