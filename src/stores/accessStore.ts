import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { db } from '@/core/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { MasonicRite } from '@/modules/questions/types'
import type { RiteCertification, RoomLevel } from '@/modules/game/access/riteAccess'

interface AccessProfile {
  preferredRite: MasonicRite | null
  certifications: Partial<Record<MasonicRite, RiteCertification>>
}

const CACHE_KEY = 'masonic-game-access-profile'

const readCache = (): AccessProfile => {
  if (typeof window === 'undefined') return { preferredRite: null, certifications: {} }
  try {
    const raw = window.localStorage.getItem(CACHE_KEY)
    return raw ? JSON.parse(raw) as AccessProfile : { preferredRite: null, certifications: {} }
  } catch {
    return { preferredRite: null, certifications: {} }
  }
}

export const useAccessStore = defineStore('access', () => {
  const cached = readCache()
  const preferredRite = ref<MasonicRite | null>(cached.preferredRite)
  const certifications = ref<Partial<Record<MasonicRite, RiteCertification>>>(cached.certifications)
  const loading = ref(false)

  const persistCache = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify({ preferredRite: preferredRite.value, certifications: certifications.value }))
    }
  }

  const loadForUser = async (uid: string) => {
    loading.value = true
    try {
      const snapshot = await getDoc(doc(db, 'gameProfiles', uid))
      if (snapshot.exists()) {
        const data = snapshot.data() as AccessProfile
        preferredRite.value = data.preferredRite ?? preferredRite.value
        certifications.value = { ...certifications.value, ...(data.certifications ?? {}) }
        persistCache()
      }
    } catch (error) {
      console.warn('No se pudo sincronizar el perfil de acceso; se usará la copia local.', error)
    } finally {
      loading.value = false
    }
  }

  const sync = async (uid: string) => {
    persistCache()
    try {
      await setDoc(doc(db, 'gameProfiles', uid), {
        preferredRite: preferredRite.value,
        certifications: certifications.value,
        updatedAt: Date.now(),
      }, { merge: true })
    } catch (error) {
      console.warn('No se pudo guardar el perfil de acceso en Firebase.', error)
    }
  }

  const setPreferredRite = async (uid: string, rite: MasonicRite) => {
    preferredRite.value = rite
    await sync(uid)
  }

  const certify = async (uid: string, rite: MasonicRite, level: RoomLevel, score: number) => {
    certifications.value = {
      ...certifications.value,
      [rite]: { rite, level, score, passedAt: Date.now() },
    }
    await sync(uid)
  }

  const certificationFor = (rite: MasonicRite) => certifications.value[rite]
  const verifiedRites = computed(() => Object.keys(certifications.value) as MasonicRite[])

  return { preferredRite, certifications, verifiedRites, loading, loadForUser, setPreferredRite, certify, certificationFor }
})
