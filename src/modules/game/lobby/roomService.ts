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
import type { BoardRoom, CreateBoardRoomInput, RoomGuest, RoomPlayer } from './types'
import { ROOM_TOTAL_CAPACITY } from './types'

const roomsCollection = collection(db, 'gameRooms')

const asRoom = (id: string, data: Record<string, unknown>): BoardRoom => {
  const players = Array.isArray(data.players) ? data.players as RoomPlayer[] : []
  const guests = Array.isArray(data.guests) ? data.guests as RoomGuest[] : []
  return {
    ...(data as Omit<BoardRoom, 'id'>),
    id,
    players,
    playerIds: Array.isArray(data.playerIds) ? data.playerIds as string[] : players.map((player) => player.uid),
    guests,
    guestIds: Array.isArray(data.guestIds) ? data.guestIds as string[] : guests.map((guest) => guest.uid),
    bannedIds: Array.isArray(data.bannedIds) ? data.bannedIds as string[] : [],
    maxAttendees: typeof data.maxAttendees === 'number' ? data.maxAttendees : ROOM_TOTAL_CAPACITY,
    isPrivate: data.isPrivate === true,
    isLocked: data.isLocked === true,
  }
}

const totalPeople = (room: BoardRoom) => room.players.length + room.guests.length

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
      maxAttendees: ROOM_TOTAL_CAPACITY,
      players: [host],
      playerIds: [input.hostUid],
      guests: [],
      guestIds: [],
      bannedIds: [],
      isPrivate: input.isPrivate === true,
      isLocked: false,
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
      if (room.bannedIds.includes(player.uid)) throw new Error('El anfitrión bloqueó tu acceso a esta sala.')
      if (room.isLocked) throw new Error('El anfitrión cerró las entradas a esta sala.')
      if (room.status !== 'waiting') throw new Error('La partida ya comenzó. Puedes entrar como invitado.')
      if (room.playerIds.includes(player.uid)) return
      if (room.players.length >= room.maxPlayers) throw new Error('Los lugares de jugador están ocupados. Puedes entrar como invitado.')
      if (totalPeople(room) >= room.maxAttendees) throw new Error('La sala alcanzó el límite de 20 personas.')

      const guests = room.guests.filter((guest) => guest.uid !== player.uid)
      const guestIds = room.guestIds.filter((uid) => uid !== player.uid)
      transaction.update(roomRef, {
        players: [...room.players, player],
        playerIds: [...room.playerIds, player.uid],
        guests,
        guestIds,
        updatedAt: Date.now(),
      })
    })
  },

  async joinGuest(roomId: string, guest: RoomGuest): Promise<void> {
    const roomRef = doc(db, 'gameRooms', roomId)
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(roomRef)
      if (!snapshot.exists()) throw new Error('La sala ya no existe.')
      const room = asRoom(snapshot.id, snapshot.data())
      if (room.bannedIds.includes(guest.uid)) throw new Error('El anfitrión bloqueó tu acceso a esta sala.')
      if (room.isLocked) throw new Error('El anfitrión cerró las entradas a esta sala.')
      if (room.playerIds.includes(guest.uid) || room.guestIds.includes(guest.uid)) return
      if (totalPeople(room) >= room.maxAttendees) throw new Error('La sala alcanzó el límite de 20 personas.')
      transaction.update(roomRef, {
        guests: [...room.guests, guest],
        guestIds: [...room.guestIds, guest.uid],
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
      const wasPlayer = room.playerIds.includes(uid)
      const players = room.players.filter((player) => player.uid !== uid)
      const playerIds = room.playerIds.filter((id) => id !== uid)
      const guests = room.guests.filter((guest) => guest.uid !== uid)
      const guestIds = room.guestIds.filter((id) => id !== uid)

      if (wasPlayer && players.length === 0) {
        transaction.delete(roomRef)
        return
      }

      const nextHost = room.hostUid === uid ? players[0] : null
      transaction.update(roomRef, {
        players,
        playerIds,
        guests,
        guestIds,
        ...(nextHost ? { hostUid: nextHost.uid, hostName: nextHost.name } : {}),
        currentPlayerIndex: Math.min(room.currentPlayerIndex, Math.max(players.length - 1, 0)),
        updatedAt: Date.now(),
      })
    })
  },

  async kickMember(roomId: string, hostUid: string, targetUid: string): Promise<void> {
    if (hostUid === targetUid) throw new Error('El anfitrión no puede expulsarse a sí mismo.')
    const roomRef = doc(db, 'gameRooms', roomId)
    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(roomRef)
      if (!snapshot.exists()) throw new Error('La sala ya no existe.')
      const room = asRoom(snapshot.id, snapshot.data())
      if (room.hostUid !== hostUid) throw new Error('Sólo el anfitrión puede expulsar personas.')
      const players = room.players.filter((player) => player.uid !== targetUid)
      const playerIds = room.playerIds.filter((uid) => uid !== targetUid)
      const guests = room.guests.filter((guest) => guest.uid !== targetUid)
      const guestIds = room.guestIds.filter((uid) => uid !== targetUid)
      const bannedIds = room.bannedIds.includes(targetUid) ? room.bannedIds : [...room.bannedIds, targetUid]
      transaction.update(roomRef, {
        players,
        playerIds,
        guests,
        guestIds,
        bannedIds,
        currentPlayerIndex: Math.min(room.currentPlayerIndex, Math.max(players.length - 1, 0)),
        updatedAt: Date.now(),
      })
    })
  },

  async setRoomAccess(roomId: string, settings: { isPrivate?: boolean; isLocked?: boolean }): Promise<void> {
    await updateDoc(doc(db, 'gameRooms', roomId), { ...settings, updatedAt: Date.now() })
  },

  async patchRoom(roomId: string, patch: Partial<BoardRoom>): Promise<void> {
    const safePatch: Partial<BoardRoom> = { ...patch }
    delete safePatch.id
    await updateDoc(doc(db, 'gameRooms', roomId), { ...safePatch, updatedAt: Date.now() })
  },

  async deleteRoom(roomId: string): Promise<void> {
    await deleteDoc(doc(db, 'gameRooms', roomId))
  },
}
