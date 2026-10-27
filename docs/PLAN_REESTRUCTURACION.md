# Reestructuración del juego masónico

## Principios
- Mi Logia (colección users) es la única autoridad para grado, usuario activo y grupo. Nunca usar certificaciones del juego o caché local para conceder acceso.
- Al crear una sala se elige una Cámara fija: Aprendiz, Compañero o Maestro. Los participantes y espectadores requieren grado igual o superior. Una Cámara solo utiliza preguntas de ese grado, nunca de grados superiores ni inferiores.
- Para cultura general, permitir una modalidad abierta independiente. En partidas mixtas, las preguntas masónicas siguen restringidas a la Cámara.
- El servidor y las reglas de Firestore deben impedir leer contenido de grados superiores, no solo esconderlo en la interfaz. Evitar entregar la respuesta correcta antes de contestar.
- Estudio individual: se pueden seleccionar grados hasta el grado registrado.

## Modalidades
1. Maratón: tablero, dados, turnos, casillas y preguntas.
2. Trivia: preguntas sin tablero.
3. Estudio individual: banco compartido, sin partidas.
4. Debate: tema y Cámara elegidos antes de abrir inscripciones; solo participantes inscritos antes de comenzar tienen turno de voz. Espectadores únicamente chat. Tiempo por turno configurable; ceder turno anticipadamente; silenciar al terminar, moderador y reconexión.
5. Videoconferencia: integración WebRTC con tokens de corta duración generados en backend, roles de audio separados y controles de micrófono/cámara. No almacenar credenciales de proveedor en el frontend.

## Requisitos previos al lanzamiento
- Implementar y desplegar reglas de Firestore/Cloud Functions con autorización basada en users/{uid}; la validación cliente por sí sola NO es seguridad.
- Confirmar el esquema de grados y permisos reales de Mi Logia y probar perfiles de cada grado.
- Implementar salas de debate y videollamada con moderación en servidor.
- Ejecutar build, pruebas de acceso, pruebas multijugador y desplegar solo tras validación.

## Avance de Sala de Debate (rama de desarrollo)
- Implementado: pantalla /debates, creación y listado de salas, inscripción antes del inicio, espectadores después del inicio, reloj visible, cesión de turno, finalización por anfitrión y chat.
- El tiempo transcurrido se muestra en pantalla, pero el avance automático autorizado por servidor y el silenciamiento forzoso del micrófono NO están implementados.
- La conexión de audio/video de la sala y los permisos de publicación multimedia NO están implementados.
- Las comprobaciones de grado de esta versión están en el cliente; faltan reglas de Firebase o Cloud Functions para evitar lecturas, escrituras y suplantación de identidad.
- Antes del despliegue probar con Aprendiz/Compañero/Maestro, espectadores, reconexión, dos navegadores y controles de privacidad.
