import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { auth, db } from '@/core/firebase'
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'
import type { AuthError, User as FirebaseUser } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { normalizeMiLogiaDegree } from '@/modules/questions/questionRules'
import type { MasonicDegree } from '@/modules/questions/types'

export interface MiLogiaProfile {
  uid: string
  name: string
  email: string
  role: 'master' | 'admin' | 'member' | 'viewer' | string
  active: boolean
  groupId: string
  degree?: 'aprendiz' | 'companero' | 'compañero' | 'maestro' | string
  numericDegree?: number
  lodgeRole?: string
}

const PROFILE_CACHE = 'masonic-game-milogia-profile'
const readCachedProfile = (): MiLogiaProfile | null => {
  if (typeof window === 'undefined') return null
  try { return JSON.parse(window.localStorage.getItem(PROFILE_CACHE) || 'null') as MiLogiaProfile | null } catch { return null }
}
const cacheProfile = (profile: MiLogiaProfile | null) => {
  if (typeof window === 'undefined') return
  if (profile) window.localStorage.setItem(PROFILE_CACHE, JSON.stringify(profile))
  else window.localStorage.removeItem(PROFILE_CACHE)
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<FirebaseUser | null>(null)
  const profile = ref<MiLogiaProfile | null>(readCachedProfile())
  const loading = ref(true)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => currentUser.value !== null)
  const masonicDegree = computed<MasonicDegree | null>(() => normalizeMiLogiaDegree(profile.value?.degree))
  const isAdmin = computed(() => profile.value?.role === 'admin' || profile.value?.role === 'master')
  const canPlay = computed(() => Boolean(
    currentUser.value &&
    profile.value &&
    profile.value.active !== false &&
    profile.value.groupId &&
    masonicDegree.value,
  ))

  const loadMiLogiaProfile = async (uid: string): Promise<MiLogiaProfile | null> => {
    const snapshot = await getDoc(doc(db, 'users', uid))
    if (!snapshot.exists()) {
      profile.value = null
      return null
    }

    profile.value = { uid, ...snapshot.data() } as MiLogiaProfile
    cacheProfile(profile.value)
    return profile.value
  }

  const initializeAuth = () => {
    loading.value = true
    onAuthStateChanged(auth, async (user) => {
      currentUser.value = user
      error.value = null
      try {
        if (user) await loadMiLogiaProfile(user.uid)
        else { profile.value = null; cacheProfile(null) }
      } catch (err) {
        console.warn('No se pudo consultar Registro Logia; intentando perfil local para modo offline.', err)
        const cached = readCachedProfile()
        profile.value = cached?.uid === user?.uid ? cached : null
        if (!profile.value) error.value = 'No se pudo validar tu perfil de Registro Logia.'
      } finally {
        loading.value = false
      }
    })
  }

  const signIn = async (email: string, password: string) => {
    try {
      error.value = null
      loading.value = true
      const result = await signInWithEmailAndPassword(auth, email, password)
      currentUser.value = result.user
      const memberProfile = await loadMiLogiaProfile(result.user.uid)

      if (!memberProfile) {
        await signOut(auth)
        currentUser.value = null
        throw new Error('Esta cuenta no tiene un perfil en Registro Logia.')
      }

      return result.user
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message || 'No se pudo iniciar sesión.'
      throw err
    } finally {
      loading.value = false
    }
  }

  /** Kept for compatibility with the old standalone signup view. Gameplay still requires a Mi Logia profile. */
  const signUp = async (email: string, password: string) => {
    try {
      error.value = null
      loading.value = true
      const result = await createUserWithEmailAndPassword(auth, email, password)
      currentUser.value = result.user
      await loadMiLogiaProfile(result.user.uid)
      return result.user
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const refreshProfile = async () => {
    if (!currentUser.value) return null
    return loadMiLogiaProfile(currentUser.value.uid)
  }

  const logOut = async () => {
    try {
      error.value = null
      await signOut(auth)
      currentUser.value = null
      profile.value = null
      cacheProfile(null)
    } catch (err) {
      const authError = err as AuthError
      error.value = authError.message
      throw err
    }
  }

  return {
    currentUser,
    profile,
    isAuthenticated,
    masonicDegree,
    isAdmin,
    canPlay,
    loading,
    error,
    initializeAuth,
    loadMiLogiaProfile,
    refreshProfile,
    signIn,
    signUp,
    logOut,
  }
})
