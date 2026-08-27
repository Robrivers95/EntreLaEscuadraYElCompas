import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'

// El juego comparte autenticación y datos con Registro Logia / Mi Logia.
// Estos identificadores del SDK web son configuración pública de Firebase, no secretos.
// Realtime Database puede sobreescribirse con VITE_FIREBASE_DATABASE_URL si la instancia
// real del proyecto usa una URL/región distinta.
const firebaseConfig = {
  apiKey: 'AIzaSyASWup-3BsCi9zvIZYb_6BfM2mvkv5frgg',
  authDomain: 'registrologia.firebaseapp.com',
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    'https://registrologia-default-rtdb.firebaseio.com',
  projectId: 'registrologia',
  storageBucket: 'registrologia.firebasestorage.app',
  messagingSenderId: '635701699225',
  appId: '1:635701699225:web:0edf683ec4a6816a96ce08',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const realtimeDb = getDatabase(app)
export default app
