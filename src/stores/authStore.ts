import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { auth } from '@/core/firebase'
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, AuthError } from 'firebase/auth'
import type { User } from 'firebase/auth'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isAdmin = ref(false)
  const loading = ref(true)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => currentUser.value !== null)

  const initializeAuth = () => {
    onAuthStateChanged(auth, (user) => {
      currentUser.value = user
      // In a real app, check admin status from Firestore
      isAdmin.value = user?.email === 'admin@masonica.com'
      loading.value = false
    })
  }

  const signIn = async (email: string, password: string) => {
    try {
      error.value = null
      loading.value = true
      const result = await signInWithEmailAndPassword(auth, email, password)
      currentUser.value = result.user
      return result.user
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      error.value = null
      loading.value = true
      const result = await createUserWithEmailAndPassword(auth, email, password)
      currentUser.value = result.user
      return result.user
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logOut = async () => {
    try {
      error.value = null
      await signOut(auth)
      currentUser.value = null
      isAdmin.value = false
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      throw err
    }
  }

  return {
    currentUser,
    isAuthenticated,
    isAdmin,
    loading,
    error,
    initializeAuth,
    signIn,
    signUp,
    logOut,
  }
})
