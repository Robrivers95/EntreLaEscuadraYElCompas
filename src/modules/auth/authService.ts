import { auth } from '@/core/firebase'
import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User } from 'firebase/auth'

export const authService = {
  async signIn(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password)
    return result.user
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(auth)
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback)
  },

  getCurrentUser(): User | null {
    return auth.currentUser
  },
}
