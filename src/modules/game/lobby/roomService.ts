import { db } from '@/core/firebase'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  updateDoc,
} from 'firebase/firestore'
import type { BoardRoom, CreateBoardRoomInput, RoomPlayer } from './types'

const roomsCollection = collection(db, 'gameRooms')

const asRoom = (id: string, data: Record<string, unknown>): BoardRoom => ({ id, ...data } as BoardRoom)

export const roomService = {
  async createRoom(input: CreateBoardRoomInput): Promise<string> {
    const now = Date.now()
    const host: RoomPlayer = {
      uid: input.hostUid,
      name: input.hostName,
      degree: input.hostDegree,
      position: 0,
      score: 0,
      joinedAt: now,
    }

    const ref = await addDoc(roomsCollection, {
      name: input.name.trim() || `Sala de ${input.hostName}`,
      hostUid: input.hostUid,
      hostName: input.hostName,
      rite: input.rite,
      level: input.level,
      boardSize: input.boardSize,
      maxPlayers: input.maxPlayers,
      players: [host],
      playerIds: [input.hostUid],
      status: 'waiting',
      currentPlayerIndex: 0,
      currentQuestionId: null,
      currentCategory: null,
      lastDice: null,
      winnerUid: null,
      createdAt: now,
      updatedAt: now,
    })
    return ref.id
  },

  subscribeRooms(callback: (rooms: BoardRoom[]) => void, onError?: (error: Error) => void) {
    const roomsQuery = query(roomsCollection, orderBy('createdAt', 'desc'), limit(60))
    return onSnapshot(roomsQuery, (snapshot) => {
      callback(snapshot.docs.map((item) => asRoom(item.id, item.data())))
    }, (error) => onError?.(error))
  },

  async getRoom(roomId: string): Promise<BoardRoom | null> {
    const snapshot = await getDoc(doc(db, 'gameRooms', roomId))
    return snapshot.exists() ? asRoom(snapshot.id, snapshot.data()) : null
  },

  subscribeRoom(roomId: string, callback: (room: BoardRoom | null) => void) {
    return onSnapshot(doc(db, 'gameRooms', roomId), (snapshot) => {
      callback(snapshot.exists() ? asRoom(snapshot.id, snapshot.data()) : null)
    })
  },

  async joinRoom(roomId: string, player: RoomPlayer): Promise<void> {
    const roomRef = doc(db, 'gameRooms', roomId)
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(roomRef)
      if (!snapshot.exists()) throw new Error('La sala ya no existe.')
      const room = asRoom(snapshot.id, snapshot.data())
      if (room.status !== 'waiting') throw new Error('La partida ya comenzó.')
      if (room.playerIds.includes(player.uid)) return
      if (room.players.length >= room.maxPlayers) throw new Error('La sala está llena.')
      transaction.update(roomRef, {
        players: [...room.players, player],
        playerIds: [...room.playerIds, player.uid],
        updatedAt: Date.now(),
      })
    })
  },

  async leaveRoom(roomId: string, uid: string): Promise<void> {
    const roomRef = doc(db, 'gameRooms', roomId)
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(roomRef)
      if (!snapshot.exists()) return
      const room = asRoom(snapshot.id, snapshot.data())
      const players = room.players.filter((player) => player.uid !== uid)
      const playerIds = room.playerIds.filter((id) => id !== uid)
      if (players.length === 0) {
        transaction.delete(roomRef)
        return
      }
      const nextHost = room.hostUid === uid ? players[0] : null
      transaction.update(roomRef, {
        players,
        playerIds,
        ...(nextHost ? { hostUid: nextHost.uid, hostName: nextHost.name } : {}),
        currentPlayerIndex: Math.min(room.currentPlayerIndex, players.length - 1),
        updatedAt: Date.now(),
      })
    })
  },

  async patchRoom(roomId: string, patch: Partial<BoardRoom>): Promise<void> {
    const { id: _id, ...safePatch } = patch
    await updateDoc(doc(db, 'gameRooms', roomId), { ...safePatch, updatedAt: Date.now() })
  },

  async deleteRoom(roomId: string): Promise<void> {
    await deleteDoc(doc(db, 'gameRooms', roomId))
  },
}
