import type { MasonicDegree, MasonicRite } from '@/modules/questions/types'

export interface Player {
  id: string
  name: string
  position: number
  score: number
  color: string
  avatar?: string
  /** Degree validated from Registro Logia; never user-entered inside the game. */
  degree?: MasonicDegree
  groupId?: string
}

export interface GameMode {
  type: 'turns' | 'realtime'
  maxPlayers: number
}

export interface GameState {
  id: string
  mode: 'realtime' | 'turns'
  players: Player[]
  currentPlayerIndex: number
  boardSize: number
  selectedCategories: string[]
  selectedRite?: MasonicRite
  /** Maximum degree material this room may expose; in mixed rooms this should be the lowest member degree. */
  degreeCeiling?: MasonicDegree
  status: 'waiting' | 'playing' | 'finished'
  winner?: string
  createdAt: number
  updatedAt: number
}

export interface BoardCell {
  id: number
  category: string
  x: number
  y: number
}

export interface TurnBasedGame extends GameState {
  mode: 'turns'
  currentQuestionId?: string
  currentAnswer?: number
}

export interface RealtimeGame extends GameState {
  mode: 'realtime'
}
