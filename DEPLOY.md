# Build y despliegue seguro

Este juego usa Auth/Firestore del proyecto Firebase `registrologia`, pero **NO** debe desplegarse sobre el Hosting principal de Registro Logia.

Sitio separado del juego:

- Firebase project: `registrologia`
- Hosting target: `juego-masonico`
- Hosting site id: `entre-la-escuadra-y-el-compas`
- URL prevista: `https://entre-la-escuadra-y-el-compas.web.app`

## 1. Obtener la rama del juego

```powershell
git clone -b chatgpt/gameplay-question-system-v2 https://github.com/Robrivers95/EntreLaEscuadraYElCompas.git
cd EntreLaEscuadraYElCompas
```

Si ya tienes el repositorio:

```powershell
git fetch origin
git checkout chatgpt/gameplay-question-system-v2
git pull origin chatgpt/gameplay-question-system-v2
```

## 2. Instalar y compilar

```powershell
npm ci
npm run build
```

El build debe crear `dist/`.

## 3. Instalar Firebase CLI e iniciar sesión

```powershell
npm install -g firebase-tools
firebase login
firebase use registrologia
```

## 4. Crear el sitio de Hosting separado (sólo la primera vez)

Primero consulta si existe:

```powershell
firebase hosting:sites:get entre-la-escuadra-y-el-compas --project registrologia
```

Si Firebase responde que no existe:

```powershell
firebase hosting:sites:create entre-la-escuadra-y-el-compas --project registrologia
```

La rama ya contiene `.firebaserc` con el target `juego-masonico`, pero puede reafirmarse con:

```powershell
firebase target:apply hosting juego-masonico entre-la-escuadra-y-el-compas --project registrologia
```

## 5. Desplegar exclusivamente el juego

```powershell
firebase deploy --only hosting:juego-masonico --project registrologia
```

No uses `firebase deploy` sin `--only hosting:juego-masonico` desde este repositorio.

## 6. Publicar las reglas de Firestore del banco de preguntas

La regla `/questions` se mantiene en el repositorio `MiLogiaApp`, que es la fuente de verdad para reglas de Registro Logia.

Desde una copia actualizada de `MiLogiaApp`:

```powershell
git pull origin main
firebase deploy --only firestore --project registrologia
```

Esto publica sólo reglas/índices de Firestore; no despliega el Hosting de Registro Logia.

## 7. Agora / voz

El build no requiere `VITE_AGORA_APP_ID`, pero el audio en tiempo real sí lo necesita al ejecutarse. Si ya tienes el App ID de Agora, crea `.env.local` en la raíz:

```text
VITE_AGORA_APP_ID=TU_AGORA_APP_ID
```

Si la Realtime Database de Registro Logia usa una URL distinta a la predeterminada, también puede definirse:

```text
VITE_FIREBASE_DATABASE_URL=https://TU-INSTANCIA.firebaseio.com
```

Después vuelve a ejecutar:

```powershell
npm run build
firebase deploy --only hosting:juego-masonico --project registrologia
```
