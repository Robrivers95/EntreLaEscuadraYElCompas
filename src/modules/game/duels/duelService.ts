import { db } from '@/core/firebase'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import type { MasonicRite } from '@/modules/questions/types'
import type { RoomLevel } from '@/modules/game/access/riteAccess'

export interface DuelPlayerOption {
  uid: string
  name: string
  degree?: string
}

export interface Duel {
  id: string
  challengerUid: string
  challengerName: string
  opponentUid: string
  opponentName: string
  rite: MasonicRite
  level: RoomLevel
  questionIds: string[]
  challengerScore: number
  opponentScore: number | null
  status: 'pending' | 'finished'
  winnerUid: string | null
  createdAt: number
  completedAt: number | null
}

const duels = collection(db, 'duels')

const asDuel = (id: string, data: Record<string, unknown>) => ({ id, ...data } as Duel)

export const duelService = {
  async listPlayers(currentUid: string): Promise<DuelPlayerOption[]> {
    const snapshot = await getDocs(collection(db, 'users'))
    return snapshot.docs
      .map((item) => ({ uid: item.id, ...(item.data() as { name?: string; degree?: string; active?: boolean }) }))
      .filter((item) => item.uid !== currentUid && item.active !== false && Boolean(item.name))
      .map((item) => ({ uid: item.uid, name: item.name || 'Jugador', degree: item.degree }))
      .sort((a, b) => a.name.localeCompare(b.name))
  },

  async createDuel(input: Omit<Duel, 'id' | 'status' | 'winnerUid' | 'createdAt' | 'completedAt' | 'opponentScore'>): Promise<string> {
    const ref = await addDoc(duels, {
      ...input,
      opponentScore: null,
      status: 'pending',
      winnerUid: null,
      createdAt: Date.now(),
      completedAt: null,
    })
    return ref.id
  },

  async getDuel(id: string): Promise<Duel | null> {
    const snapshot = await getDoc(doc(db, 'duels', id))
    return snapshot.exists() ? asDuel(snapshot.id, snapshot.data()) : null
  },

  async finishDuel(duel: Duel, opponentScore: number): Promise<void> {
    const winnerUid = opponentScore === duel.challengerScore
      ? 'tie'
      : opponentScore > duel.challengerScore ? duel.opponentUid : duel.challengerUid
    await updateDoc(doc(db, 'duels', duel.id), {
      opponentScore,
      status: 'finished',
      winnerUid,
      completedAt: Date.now(),
    })
  },

  subscribeForUser(uid: string, callback: (items: Duel[]) => void) {
    let challenger: Duel[] = []
    let opponent: Duel[] = []
    const emit = () => {
      const merged = new Map<string, Duel>()
      ;[...challenger, ...opponent].forEach((item) => merged.set(item.id, item))
      callback(Array.from(merged.values()).sort((a, b) => b.createdAt - a.createdAt))
    }
    const unsubA = onSnapshot(query(duels, where('challengerUid', '==', uid)), (snapshot) => {
      challenger = snapshot.docs.map((item) => asDuel(item.id, item.data()))
      emit()
    })
    const unsubB = onSnapshot(query(duels, where('opponentUid', '==', uid)), (snapshot) => {
      opponent = snapshot.docs.map((item) => asDuel(item.id, item.data()))
      emit()
    })
    return () => { unsubA(); unsubB() }
  },
}
