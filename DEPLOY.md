# Build y despliegue seguro

El juego usa Auth/Firestore del proyecto Firebase `registrologia`, pero el frontend puede publicarse en un Hosting separado sin reemplazar `registrologia.web.app`.

## Hosting actual de pruebas

- Firebase data project: `registrologia`
- Hosting target: `juego-masonico`
- Hosting site id: `entre-la-escuadra-y-el-compas`
- URL: `https://entre-la-escuadra-y-el-compas.web.app`

## Hosting original del juego

Para conservar la URL histórica `https://juegodemesamasonico.web.app`, la rama incluye `firebase.juegodemesamasonico.json`.

El frontend sigue compilándose con las variables `VITE_FIREBASE_*` de Registro Logia; el proyecto de Hosting puede ser `juegodemesamasonico` sin cambiar el backend de Auth/Firestore.

Desde Codespaces/Bash:

```bash
cd /workspaces/EntreLaEscuadraYElCompas
git checkout chatgpt/gameplay-question-system-v2
git pull origin chatgpt/gameplay-question-system-v2
npm ci
npm run build
firebase deploy --only hosting --project juegodemesamasonico --config firebase.juegodemesamasonico.json
```

La ruta histórica `/lobby?mode=turns` está soportada y redirige al modo por turnos actual. `/lobby?mode=realtime` redirige al modo en tiempo real.

## Obtener la rama del juego

```bash
git clone -b chatgpt/gameplay-question-system-v2 https://github.com/Robrivers95/EntreLaEscuadraYElCompas.git
cd EntreLaEscuadraYElCompas
```

Si ya tienes el repositorio:

```bash
git fetch origin
git checkout chatgpt/gameplay-question-system-v2
git pull origin chatgpt/gameplay-question-system-v2
```

## Instalar y compilar

```bash
npm ci
npm run build
```

El build debe crear `dist/`.

## Configuración Firebase de datos

El juego debe compilarse con las variables de Registro Logia, por ejemplo en `.env.local`:

```text
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=registrologia.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=registrologia
VITE_FIREBASE_STORAGE_BUCKET=registrologia.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_DATABASE_URL=...
VITE_AGORA_APP_ID=...
```

`VITE_FIREBASE_DATABASE_URL` y `VITE_AGORA_APP_ID` son necesarios para validar completamente tiempo real/voz.

## Desplegar al sitio de pruebas separado

```bash
firebase login
firebase use registrologia
firebase deploy --only hosting:juego-masonico --project registrologia
```

No uses `firebase deploy` sin limitar el target desde este repositorio si no quieres tocar otros recursos.

## Banco de preguntas y Firestore

La regla `/questions` vive en `MiLogiaApp/firestore.rules` y ya está preparada para lectura de usuarios autenticados y escritura de `admin`/`master`.

Para publicar reglas desde una copia actualizada de `MiLogiaApp`:

```bash
git pull origin main
firebase deploy --only firestore --project registrologia
```

El código incluye 54 preguntas REAA específicas (18 Aprendiz, 18 Compañero y 18 Maestro). En Administración, el botón **Importar bancos iniciales** sincroniza las preguntas incluidas con la colección Firestore `questions`. Si todavía no se han importado, el modo de juego puede usar el banco incluido como fallback, pero el listado remoto de Administración no las mostrará hasta sincronizarlas.
