import { realtimeDb, db } from '@/core/firebase'
import { ref, set, get, update, remove, onValue } from 'firebase/database'
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import type { Player, TurnBasedGame, RealtimeGame } from './types'

const gamesCollection = collection(db, 'games')

export const gameService = {
  // Realtime Database methods (for real-time games)
  async createRealtimeGame(gameData: Omit<RealtimeGame, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const gameRef = ref(realtimeDb, `games/${Date.now()}`)
    const gameId = gameRef.key || Date.now().toString()

    await set(gameRef, {
      ...gameData,
      id: gameId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    return gameId
  },

  async getRealtimeGame(gameId: string): Promise<RealtimeGame | null> {
    const gameRef = ref(realtimeDb, `games/${gameId}`)
    const snapshot = await get(gameRef)
    return snapshot.val()
  },

  onRealtimeGameUpdated(gameId: string, callback: (game: RealtimeGame) => void) {
    const gameRef = ref(realtimeDb, `games/${gameId}`)
    return onValue(gameRef, (snapshot) => {
      const game = snapshot.val()
      if (game) {
        callback(game)
      }
    })
  },

  async updateRealtimeGame(gameId: string, updates: Partial<RealtimeGame>): Promise<void> {
    const gameRef = ref(realtimeDb, `games/${gameId}`)
    await update(gameRef, {
      ...updates,
      updatedAt: Date.now(),
    })
  },

  async addPlayerToRealtimeGame(gameId: string, player: Player): Promise<void> {
    const playerRef = ref(realtimeDb, `games/${gameId}/players/${player.id}`)
    await set(playerRef, player)
  },

  async updatePlayerPosition(gameId: string, playerId: string, position: number): Promise<void> {
    const playerRef = ref(realtimeDb, `games/${gameId}/players/${playerId}/position`)
    await set(playerRef, position)
  },

  async deleteRealtimeGame(gameId: string): Promise<void> {
    const gameRef = ref(realtimeDb, `games/${gameId}`)
    await remove(gameRef)
  },

  // Firestore methods (for turn-based games)
  async createTurnsGame(gameData: Omit<TurnBasedGame, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(gamesCollection, {
      ...gameData,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })
    return docRef.id
  },

  async getTurnsGame(gameId: string): Promise<TurnBasedGame | null> {
    const docRef = doc(gamesCollection, gameId)
    const snapshot = await getDoc(docRef)
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as TurnBasedGame
    }
    return null
  },

  async updateTurnsGame(gameId: string, updates: Partial<TurnBasedGame>): Promise<void> {
    const docRef = doc(gamesCollection, gameId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now(),
    })
  },

  async deleteTurnsGame(gameId: string): Promise<void> {
    const docRef = doc(gamesCollection, gameId)
    await deleteDoc(docRef)
  },
}
