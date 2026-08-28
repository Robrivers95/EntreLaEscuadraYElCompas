import type { MasonicDegree, MasonicRite } from '@/modules/questions/types'
import type { RoomLevel } from '@/modules/game/access/riteAccess'

export const ROOM_TOTAL_CAPACITY = 20

export interface RoomPlayer {
  uid: string
  name: string
  degree: MasonicDegree | null
  position: number
  score: number
  joinedAt: number
}

export interface RoomGuest {
  uid: string
  name: string
  degree: MasonicDegree | null
  joinedAt: number
}

export interface BoardRoom {
  id: string
  name: string
  hostUid: string
  hostName: string
  rite: MasonicRite
  level: RoomLevel
  boardSize: number
  maxPlayers: number
  maxAttendees: number
  players: RoomPlayer[]
  playerIds: string[]
  guests: RoomGuest[]
  guestIds: string[]
  bannedIds: string[]
  isPrivate: boolean
  isLocked: boolean
  status: 'waiting' | 'playing' | 'finished'
  currentPlayerIndex: number
  currentQuestionId?: string | null
  currentCategory?: string | null
  lastDice?: number | null
  winnerUid?: string | null
  createdAt: number
  updatedAt: number
}

export interface CreateBoardRoomInput {
  name: string
  hostUid: string
  hostName: string
  hostDegree: MasonicDegree | null
  rite: MasonicRite
  level: RoomLevel
  boardSize: number
  maxPlayers: number
  isPrivate?: boolean
}
