import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MasonicRite } from '@/modules/questions/types'

export interface Player {
  id: string
  name: string
  position: number
  score: number
  color: string
}

export interface GameState {
  id: string
  mode: 'realtime' | 'turns'
  players: Player[]
  currentPlayerIndex: number
  boardSize: number
  selectedCategories: string[]
  selectedRite?: MasonicRite
  status: 'waiting' | 'playing' | 'finished'
  winner?: string
}

const savedRite = typeof window !== 'undefined'
  ? window.localStorage.getItem('masonic-game-rite') as MasonicRite | null
  : null

export const useGameStore = defineStore('game', () => {
  const currentGame = ref<GameState | null>(null)
  const selectedRite = ref<MasonicRite>(savedRite || 'reaa')
  const loading = ref(false)
  const error = ref<string | null>(null)

  const setSelectedRite = (rite: MasonicRite) => {
    selectedRite.value = rite
    if (typeof window !== 'undefined') window.localStorage.setItem('masonic-game-rite', rite)
    if (currentGame.value) currentGame.value.selectedRite = rite
  }

  const setCurrentGame = (game: GameState) => {
    currentGame.value = { ...game, selectedRite: game.selectedRite ?? selectedRite.value }
  }

  const updateGameStatus = (status: GameState['status']) => {
    if (currentGame.value) currentGame.value.status = status
  }

  const addPlayer = (player: Player) => {
    if (currentGame.value) currentGame.value.players.push(player)
  }

  const updatePlayerScore = (playerId: string, newScore: number) => {
    const player = currentGame.value?.players.find((item) => item.id === playerId)
    if (player) player.score = newScore
  }

  const movePlayer = (playerId: string, position: number) => {
    const player = currentGame.value?.players.find((item) => item.id === playerId)
    if (player) player.position = position
  }

  const nextTurn = () => {
    if (currentGame.value) {
      currentGame.value.currentPlayerIndex =
        (currentGame.value.currentPlayerIndex + 1) % currentGame.value.players.length
    }
  }

  const resetGame = () => { currentGame.value = null }

  return {
    currentGame,
    selectedRite,
    loading,
    error,
    setSelectedRite,
    setCurrentGame,
    updateGameStatus,
    addPlayer,
    updatePlayerScore,
    movePlayer,
    nextTurn,
    resetGame,
  }
})
