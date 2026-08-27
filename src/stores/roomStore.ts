import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { roomService } from '@/modules/game/lobby/roomService'
import type { BoardRoom, CreateBoardRoomInput, RoomPlayer } from '@/modules/game/lobby/types'

export const useRoomStore = defineStore('rooms', () => {
  const rooms = ref<BoardRoom[]>([])
  const currentRoom = ref<BoardRoom | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let unsubscribeRooms: (() => void) | null = null
  let unsubscribeCurrent: (() => void) | null = null

  const openRooms = computed(() => rooms.value.filter((room) => room.status !== 'finished'))

  const watchRooms = () => {
    unsubscribeRooms?.()
    loading.value = true
    unsubscribeRooms = roomService.subscribeRooms((items) => {
      rooms.value = items
      loading.value = false
      error.value = null
    }, (err) => {
      console.error(err)
      error.value = 'No se pudieron cargar las salas.'
      loading.value = false
    })
  }

  const watchRoom = (roomId: string) => {
    unsubscribeCurrent?.()
    unsubscribeCurrent = roomService.subscribeRoom(roomId, (room) => {
      currentRoom.value = room
    })
  }

  const createRoom = async (input: CreateBoardRoomInput) => {
    loading.value = true
    try {
      return await roomService.createRoom(input)
    } finally {
      loading.value = false
    }
  }

  const joinRoom = async (roomId: string, player: RoomPlayer) => roomService.joinRoom(roomId, player)
  const leaveRoom = async (roomId: string, uid: string) => roomService.leaveRoom(roomId, uid)

  const stop = () => {
    unsubscribeRooms?.()
    unsubscribeCurrent?.()
    unsubscribeRooms = null
    unsubscribeCurrent = null
  }

  return { rooms, openRooms, currentRoom, loading, error, watchRooms, watchRoom, createRoom, joinRoom, leaveRoom, stop }
})
