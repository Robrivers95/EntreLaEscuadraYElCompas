<template>
  <main class="turns-game">
    <header v-if="room" class="game-header">
      <button class="back" @click="leave">← Lobby</button>
      <div class="room-title">
        <span>{{ riteLabel }}</span>
        <h1>{{ room.name }}</h1>
        <p>
          {{ room.rite === 'kabala' ? '10 sefirot · ascenso por respuestas correctas' : `${room.boardSize} casillas · ${levelLabel}` }}
          · {{ room.players.length }} jugadores · {{ totalPeople }}/{{ room.maxAttendees }} personas
          <b v-if="room.isPrivate">· PRIVADA</b><b v-if="room.isLocked"> · CERRADA</b>
        </p>
      </div>
      <div class="header-actions">
        <div class="turn-box">
          <small>{{ room.status === 'waiting' ? 'Sala de espera' : room.status === 'finished' ? 'Partida terminada' : 'Responde' }}</small>
          <strong>{{ currentPlayer?.name || '—' }}</strong>
          <em v-if="room.status === 'playing'">Lee: {{ readerPlayer?.name || '—' }}</em>
        </div>
        <button v-if="isActivePlayer && voiceAvailable" class="voice-btn" :class="{ connected: voiceConnected, muted: voiceMuted }" @click="voiceConnected ? toggleVoice() : connectVoice()">
          {{ !voiceConnected ? '🎙 Conectar voz' : voiceMuted ? '🔇 Activar micrófono' : '🎤 Silenciar' }}
        </button>
        <span v-else-if="isGuest" class="guest-voice">👁 Invitado · sólo chat</span>
      </div>
    </header>

    <div v-if="voiceError" class="voice-error">{{ voiceError }}</div>
    <section v-if="!room" class="state-panel"><h2>Cargando sala…</h2></section>

    <section v-else-if="room.status === 'waiting'" class="waiting-panel">
      <div class="seal-line">{{ room.rite === 'kabala' ? '✦ 10 ✦' : '△ □ G ○' }}</div>
      <h2>Esperando jugadores</h2>
      <p v-if="room.rite === 'kabala'">En esta ruta no hay dado. Cada respuesta correcta hace subir una sefirá, desde Malkhut hasta Keter.</p>
      <p v-else>En cada turno una persona responde y la siguiente lee, muestra los incisos cuando sea necesario y califica la respuesta.</p>
      <div class="players-waiting">
        <div v-for="player in room.players" :key="player.uid" class="waiting-player">
          <span class="avatar">{{ initials(player.name) }}</span>
          <div><strong>{{ player.name }}</strong><small>{{ player.degree ? DEGREE_LABELS[player.degree] : 'Acceso libre' }} · jugador</small></div>
          <em v-if="player.uid === room.hostUid">Líder</em>
        </div>
      </div>
      <p v-if="room.guests.length" class="guest-count">👁 {{ room.guests.length }} invitado{{ room.guests.length === 1 ? '' : 's' }} mirando y usando el chat.</p>
      <div class="waiting-actions">
        <button v-if="isHost" class="primary" :disabled="room.players.length < 2" @click="startGame">
          {{ room.players.length < 2 ? 'Falta otro jugador' : 'Iniciar partida' }}
        </button>
        <span v-else-if="isActivePlayer">El líder iniciará la partida.</span>
        <span v-else>Estás observando como invitado.</span>
      </div>
    </section>

    <section v-else-if="room.status === 'finished'" class="finished-panel">
      <div class="trophy">🏆</div>
      <span class="kicker">Ganador</span>
      <h2>{{ winner?.name || 'Partida finalizada' }}</h2>
      <p v-if="room.rite === 'kabala'">Completó el ascenso por las diez sefirot hasta Keter.</p>
      <div class="final-scores">
        <div v-for="player in sortedByScore" :key="player.uid"><strong>{{ player.name }}</strong><span>{{ player.score }} pts</span></div>
      </div>
      <button class="primary" @click="leave">Volver al lobby</button>
    </section>

    <template v-else>
      <div class="role-strip">
        <div class="role-pill respondent" :class="{ mine: isMyTurn }">
          <small>Responde</small><strong>{{ currentPlayer?.name }}</strong>
          <span v-if="isMyTurn">Tu pantalla oculta los incisos</span>
        </div>
        <div class="role-arrow">→</div>
        <div class="role-pill reader" :class="{ mine: isReader }">
          <small>Lee y califica</small><strong>{{ readerPlayer?.name }}</strong>
          <span v-if="isReader">Tú controlas este turno</span>
        </div>
      </div>

      <div v-if="turnMessage" class="turn-message">{{ turnMessage }}</div>

      <section class="game-grid">
        <div class="board-column">
          <GameBoard :players="boardPlayers" :board-size="room.boardSize" :categories="categories" :rite="room.rite" />
          <div class="room-legend">
            <span>{{ room.rite === 'libre' ? '⚠ CULTURA GENERAL · NO MASÓN' : room.rite === 'kabala' ? '✦ KABBALAH · ÁRBOL DE LA VIDA' : riteLabel }}</span>
            <span>{{ room.rite === 'kabala' ? 'Meta: Keter · 10 aciertos de avance' : `Meta: casilla ${room.boardSize}` }}</span>
          </div>
        </div>

        <div class="action-column">
          <template v-if="currentQuestion">
            <div v-if="isMyTurn" class="respondent-question">
              <span class="kicker">Tu turno · responde en voz alta</span>
              <QuestionMedia :question="currentQuestion" />
              <h2>{{ currentQuestion.text }}</h2>
              <div class="hidden-answer-notice">
                <span>🙈</span>
                <div><strong>Incisos ocultos para ti</strong><p>{{ readerPlayer?.name }} tiene los incisos y la respuesta correcta. Contesta primero sin ayuda; si necesitas opciones, pídele que las lea.</p></div>
              </div>
            </div>

            <QuestionCard
              v-else-if="isReader"
              :question="currentQuestion"
              :respondent-name="currentPlayer?.name || 'El jugador en turno'"
              @resolved="handleResolution"
              @skip="handleSkip"
            />

            <div v-else class="spectator-question">
              <span class="kicker">Responde {{ currentPlayer?.name }} · califica {{ readerPlayer?.name }}</span>
              <QuestionMedia :question="currentQuestion" />
              <h2>{{ currentQuestion.text }}</h2>
              <div v-for="(option, optionIndex) in currentQuestion.options" :key="optionIndex" class="readonly-option">
                <b>{{ String.fromCharCode(65 + optionIndex) }}</b><span>{{ option }}</span>
              </div>
              <p v-if="isGuest">Estás como invitado: puedes seguir la pregunta y escribir en el chat, pero no controlar el turno.</p>
              <p v-else>Puedes seguir la pregunta y los incisos, pero sólo {{ readerPlayer?.name }} ve la clave y puede registrar el resultado.</p>
            </div>
          </template>

          <template v-else>
            <div v-if="room.rite === 'kabala'" class="kabbalah-turn-panel">
              <span class="kicker">Ascenso por conocimiento</span>
              <div class="tree-mark">✦</div>
              <h2>{{ currentPlayer?.name }} intenta llegar a {{ kabbalahTargetLabel }}</h2>
              <p v-if="isReader">Eres quien lee y califica. Prepara la pregunta para este nivel del Árbol de la Vida.</p>
              <p v-else>La siguiente pregunta aparecerá cuando {{ readerPlayer?.name }} la prepare.</p>
              <button v-if="isReader" class="primary" @click="prepareKabbalahQuestion">Preparar pregunta</button>
            </div>

            <div v-else class="dice-panel" :class="{ mine: isReader }">
              <span class="kicker">{{ isReader ? `Lanza por ${currentPlayer?.name}` : `Turno de ${currentPlayer?.name}` }}</span>
              <div class="dice" :class="{ rolling: diceRolling }">{{ diceFace }}</div>
              <p v-if="room.currentCategory">Última categoría: <strong>{{ room.currentCategory }}</strong></p>
              <button v-if="isReader" class="primary roll" :disabled="diceRolling" @click="rollDice">🎲 Lanzar dado</button>
              <small v-else-if="isMyTurn">{{ readerPlayer?.name }} lanzará el dado y leerá tu pregunta.</small>
              <small v-else-if="isGuest">Miras la partida como invitado.</small>
              <small v-else>Sólo {{ readerPlayer?.name }} controla este turno.</small>
            </div>
          </template>
        </div>
      </section>

      <section class="score-strip">
        <article v-for="(player, index) in room.players" :key="player.uid" :class="{ active: index === room.currentPlayerIndex, reader: index === readerIndex }">
          <span class="avatar small-avatar">{{ initials(player.name) }}</span>
          <div><strong>{{ player.name }}</strong><small>{{ playerPositionLabel(player.position) }}</small></div>
          <b>{{ player.score }} pts</b>
        </article>
      </section>
    </template>

    <RoomSocialPanel
      v-if="room && isRoomMember && currentUid"
      :room="room"
      :current-uid="currentUid"
      :current-name="currentName"
      :is-host="isHost"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameBoard from '@/modules/game/board/GameBoard.vue'
import QuestionCard from './QuestionCard.vue'
import QuestionMedia from '@/modules/questions/QuestionMedia.vue'
import RoomSocialPanel from '@/modules/social/RoomSocialPanel.vue'
import { useAuthStore } from '@/stores/authStore'
import { useQuestionsStore } from '@/stores/questionsStore'
import { useRoomStore } from '@/stores/roomStore'
import { roomService } from '@/modules/game/lobby/roomService'
import { audioService } from '@/modules/game/modes/realtime/audioService'
import { gameSounds } from '@/modules/game/soundService'
import { DEGREE_LABELS, RITE_LABELS, getCategoriesForRite, getQuestionPoints } from '@/modules/questions/questionRules'
import type { AnswerMode, Question } from '@/modules/questions/types'
import type { Player } from '@/modules/game/types'
import type { RoomPlayer } from '@/modules/game/lobby/types'

const KABBALAH_ASCENT = ['Malkhut', 'Yesod', 'Hod', 'Netzach', 'Tiferet', 'Gevurah', 'Chesed', 'Binah', 'Chokhmah', 'Keter'] as const

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const questionsStore = useQuestionsStore()
const roomStore = useRoomStore()

const roomId = computed(() => route.query.room as string | undefined)
const room = computed(() => roomStore.currentRoom)
const diceRolling = ref(false)
const diceResult = ref<number | null>(null)
const turnMessage = ref('')
const recentQuestionIds = ref<string[]>([])
const voiceConnected = ref(false)
const voiceMuted = ref(false)
const voiceError = ref('')
const voiceAvailable = audioService.isConfigured()
const positionsInitialized = ref(false)
const lastPositions = new Map<string, number>()

const colors = ['#c94f4f', '#4f8cc9', '#55a56b', '#bd8f37', '#8e66c2', '#4ea5a5', '#c56a9c', '#8c9a4c']
const currentUid = computed(() => authStore.currentUser?.uid || '')
const currentName = computed(() => authStore.profile?.name || 'Jugador')
const categories = computed<string[]>(() => room.value ? getCategoriesForRite(room.value.rite) : [])
const riteLabel = computed(() => room.value ? RITE_LABELS[room.value.rite] : '')
const levelLabel = computed(() => room.value?.level === 'general' ? 'General' : room.value?.level ? DEGREE_LABELS[room.value.level] : '')
const totalPeople = computed(() => (room.value?.players.length || 0) + (room.value?.guests.length || 0))
const isActivePlayer = computed(() => Boolean(room.value && currentUid.value && room.value.playerIds.includes(currentUid.value)))
const isGuest = computed(() => Boolean(room.value && currentUid.value && room.value.guestIds.includes(currentUid.value) && !room.value.playerIds.includes(currentUid.value)))
const isRoomMember = computed(() => isActivePlayer.value || isGuest.value)
const currentPlayer = computed(() => room.value?.players[room.value.currentPlayerIndex] ?? null)
const readerIndex = computed(() => room.value?.players.length ? (room.value.currentPlayerIndex + 1) % room.value.players.length : 0)
const readerPlayer = computed(() => room.value?.players[readerIndex.value] ?? null)
const isMyTurn = computed(() => isActivePlayer.value && currentPlayer.value?.uid === currentUid.value)
const isReader = computed(() => isActivePlayer.value && readerPlayer.value?.uid === currentUid.value)
const isHost = computed(() => room.value?.hostUid === currentUid.value)
const winner = computed(() => room.value?.players.find((player) => player.uid === room.value?.winnerUid))
const sortedByScore = computed(() => [...(room.value?.players ?? [])].sort((a, b) => b.score - a.score))
const currentQuestion = computed<Question | null>(() => {
  const id = room.value?.currentQuestionId
  return id ? questionsStore.questions.find((question) => question.id === id) ?? null : null
})
const boardPlayers = computed<Player[]>(() => (room.value?.players ?? []).map((player, index) => ({
  id: player.uid,
  name: player.name,
  position: player.position,
  score: player.score,
  color: colors[index % colors.length],
  avatar: initials(player.name),
  degree: player.degree ?? undefined,
})))
const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const diceFace = computed(() => diceResult.value ? diceFaces[diceResult.value - 1] : room.value?.lastDice ? diceFaces[room.value.lastDice - 1] : '⚄')
const kabbalahTargetLabel = computed(() => {
  if (!currentPlayer.value) return 'Malkhut'
  return KABBALAH_ASCENT[Math.min(currentPlayer.value.position + 1, KABBALAH_ASCENT.length - 1)]
})

onMounted(async () => {
  if (!roomId.value) { router.replace('/lobby'); return }
  await questionsStore.loadQuestions({ fallbackToDefaults: true })
  roomStore.watchRoom(roomId.value)
})

onBeforeUnmount(() => {
  roomStore.stop()
  if (voiceConnected.value) void audioService.leave()
})

watch(() => room.value?.players.map((player) => `${player.uid}:${player.position}`).join('|'), () => {
  if (!room.value) return
  if (!positionsInitialized.value) {
    room.value.players.forEach((player) => lastPositions.set(player.uid, player.position))
    positionsInitialized.value = true
    return
  }
  let advanced = false
  room.value.players.forEach((player) => {
    const previous = lastPositions.get(player.uid)
    if (typeof previous === 'number' && player.position > previous) advanced = true
    lastPositions.set(player.uid, player.position)
  })
  if (advanced) gameSounds.advance()
})

watch(() => room.value?.lastDice, (value, oldValue) => {
  if (value && value !== oldValue) gameSounds.diceLand()
})

watch(room, (next, previous) => {
  if (!next || !previous || !currentUid.value) return
  const wasMember = previous.playerIds.includes(currentUid.value) || previous.guestIds.includes(currentUid.value)
  const stillMember = next.playerIds.includes(currentUid.value) || next.guestIds.includes(currentUid.value)
  if (wasMember && !stillMember) {
    if (voiceConnected.value) void audioService.leave()
    router.replace('/lobby')
  }
})

const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'J'

const playerPositionLabel = (position: number) => {
  if (room.value?.rite === 'kabala') return position < 0 ? 'Antes de Malkhut' : KABBALAH_ASCENT[Math.min(position, 9)]
  return `Casilla ${position + 1}`
}

const connectVoice = async () => {
  if (!roomId.value || !authStore.currentUser || !isActivePlayer.value) return
  voiceError.value = ''
  try {
    await audioService.initialize(`mesa-${roomId.value}`)
    await audioService.join(authStore.currentUser.uid)
    await audioService.publishAudio()
    voiceConnected.value = true
    voiceMuted.value = false
  } catch (error) {
    console.error(error)
    voiceError.value = error instanceof Error ? error.message : 'No se pudo conectar el audio de la sala.'
    try { await audioService.leave() } catch {}
    voiceConnected.value = false
  }
}

const toggleVoice = async () => {
  if (!voiceConnected.value || !isActivePlayer.value) return
  const enabled = voiceMuted.value
  try {
    await audioService.toggleAudio(enabled)
    voiceMuted.value = !enabled
  } catch (error) {
    console.error(error)
    voiceError.value = 'No se pudo cambiar el estado del micrófono.'
  }
}

const rememberQuestion = (question: Question) => {
  recentQuestionIds.value.push(question.id)
  if (recentQuestionIds.value.length > 20) recentQuestionIds.value.shift()
}

const pickQuestion = (category?: string): Question | null => {
  if (!room.value) return null
  let eligible = questionsStore.getQuestionsForRoom(room.value.rite, room.value.level, category, 'board')
  if (!eligible.length) eligible = questionsStore.getQuestionsForRoom(room.value.rite, room.value.level, undefined, 'board')
  if (!eligible.length) return null
  const fresh = eligible.filter((question) => !recentQuestionIds.value.includes(question.id))
  const pool = fresh.length ? fresh : eligible
  const question = pool[Math.floor(Math.random() * pool.length)]
  rememberQuestion(question)
  return question
}

const startGame = async () => {
  if (!room.value || !isHost.value) return
  const isKabbalah = room.value.rite === 'kabala'
  const resetPlayers = room.value.players.map((player) => ({ ...player, position: isKabbalah ? -1 : 0, score: 0 }))
  const firstQuestion = isKabbalah ? pickQuestion('Malkhut') : null
  await roomService.patchRoom(room.value.id, {
    status: 'playing',
    players: resetPlayers,
    currentPlayerIndex: 0,
    currentQuestionId: firstQuestion?.id ?? null,
    currentCategory: isKabbalah ? 'Malkhut' : null,
    lastDice: null,
    winnerUid: null,
  })
}

const rollDice = () => {
  if (!room.value || !isReader.value || diceRolling.value || room.value.rite === 'kabala') return
  diceRolling.value = true
  let ticks = 0
  const timer = window.setInterval(() => {
    diceResult.value = Math.floor(Math.random() * 6) + 1
    gameSounds.diceTick()
    ticks += 1
    if (ticks >= 8) {
      window.clearInterval(timer)
      diceRolling.value = false
      void moveAndAsk(diceResult.value || 1)
    }
  }, 70)
}

const moveAndAsk = async (steps: number) => {
  if (!room.value || !currentPlayer.value || !categories.value.length || !isReader.value) return
  const playerIndex = room.value.currentPlayerIndex
  const players = room.value.players.map((player) => ({ ...player }))
  const player = players[playerIndex]
  player.position = Math.min(player.position + steps, room.value.boardSize - 1)
  const category = categories.value[player.position % categories.value.length]
  const question = pickQuestion(category)
  if (!question) {
    turnMessage.value = 'Esta sala no tiene preguntas compatibles todavía.'
    await advanceTurn(players)
    return
  }
  await roomService.patchRoom(room.value.id, {
    players,
    currentQuestionId: question.id,
    currentCategory: category,
    lastDice: steps,
  })
}

const prepareKabbalahQuestion = async () => {
  if (!room.value || room.value.rite !== 'kabala' || !currentPlayer.value || !isReader.value) return
  const target = KABBALAH_ASCENT[Math.min(currentPlayer.value.position + 1, 9)]
  const question = pickQuestion(target)
  if (!question) {
    turnMessage.value = `No hay preguntas disponibles para ${target}.`
    return
  }
  await roomService.patchRoom(room.value.id, { currentQuestionId: question.id, currentCategory: target, lastDice: null })
}

const handleResolution = async (resolution: { correct: boolean; mode: AnswerMode }) => {
  if (!room.value || !currentQuestion.value || !isReader.value) return
  const players = room.value.players.map((player) => ({ ...player }))
  const player = players[room.value.currentPlayerIndex]
  const points = resolution.correct ? getQuestionPoints(currentQuestion.value, resolution.mode) : 0
  player.score += points
  resolution.correct ? gameSounds.correct() : gameSounds.incorrect()

  if (room.value.rite === 'kabala') {
    if (resolution.correct) player.position = Math.min(player.position + 1, 9)
    turnMessage.value = resolution.correct
      ? `${player.name} asciende a ${KABBALAH_ASCENT[player.position]} · +${points} puntos.`
      : `${player.name} permanece en ${player.position < 0 ? 'el inicio' : KABBALAH_ASCENT[player.position]}.`

    if (resolution.correct && player.position >= 9) {
      await roomService.patchRoom(room.value.id, { players, status: 'finished', winnerUid: player.uid, currentQuestionId: null, currentCategory: null })
      return
    }
    await advanceTurn(players, true)
    return
  }

  turnMessage.value = resolution.correct ? `${player.name}: +${points} puntos.` : `${player.name}: respuesta incorrecta.`
  if (resolution.correct && player.position >= room.value.boardSize - 1) {
    await roomService.patchRoom(room.value.id, { players, status: 'finished', winnerUid: player.uid, currentQuestionId: null })
    return
  }
  await advanceTurn(players)
}

const handleSkip = async () => {
  if (!room.value || !isReader.value) return
  turnMessage.value = 'Pregunta anulada.'
  await advanceTurn(room.value.players.map((player) => ({ ...player })), room.value.rite === 'kabala')
}

const advanceTurn = async (players: RoomPlayer[], askKabbalah = false) => {
  const activeRoom = room.value
  if (!activeRoom || !players.length) return
  const nextIndex = (activeRoom.currentPlayerIndex + 1) % players.length

  if (askKabbalah && activeRoom.rite === 'kabala') {
    const nextPlayer = players[nextIndex]
    const target = KABBALAH_ASCENT[Math.min(nextPlayer.position + 1, 9)]
    const question = pickQuestion(target)
    await roomService.patchRoom(activeRoom.id, {
      players,
      currentPlayerIndex: nextIndex,
      currentQuestionId: question?.id ?? null,
      currentCategory: target,
      lastDice: null,
    })
    return
  }

  await roomService.patchRoom(activeRoom.id, { players, currentPlayerIndex: nextIndex, currentQuestionId: null, currentCategory: null, lastDice: null })
}

const leave = async () => {
  if (voiceConnected.value) {
    try { await audioService.leave() } catch (error) { console.warn(error) }
    voiceConnected.value = false
  }
  if (room.value && authStore.currentUser && isRoomMember.value) {
    try { await roomStore.leaveRoom(room.value.id, authStore.currentUser.uid) } catch (error) { console.warn(error) }
  }
  router.push('/lobby')
}
</script>

<style scoped>
.turns-game{min-height:100vh;padding:18px 18px 80px;background:radial-gradient(circle at 50% -10%,rgba(37,75,117,.34),transparent 38%),#050a11;color:#eee0c2}.game-header{max-width:1320px;margin:auto;display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center;padding-bottom:15px;border-bottom:1px solid rgba(214,183,95,.23)}.back{border:1px solid rgba(214,183,95,.3);background:transparent;color:#d9c17a;padding:9px 12px;border-radius:9px}.room-title>span,.kicker,small{font-size:10px;text-transform:uppercase;letter-spacing:1.4px;color:#c6a44d}.room-title h1{margin:1px 0;color:#f0d992;font:700 30px Georgia}.room-title p{margin:0;color:rgba(238,224,194,.5)}.room-title p b{font-size:8px;color:#d99d72}.header-actions{display:flex;gap:10px;align-items:center}.turn-box{display:flex;flex-direction:column;text-align:right}.turn-box strong{color:#efdba7}.turn-box em{font-style:normal;font-size:9px;color:#84c9a5}.voice-btn{border:1px solid rgba(214,183,95,.35);border-radius:9px;padding:10px 12px;background:rgba(214,183,95,.06);color:#e0cb91;font-weight:800}.voice-btn.connected{border-color:rgba(73,164,103,.55);color:#9ad9ab}.voice-btn.muted{border-color:rgba(190,86,78,.55);color:#e5a19c}.guest-voice{padding:8px 10px;border:1px solid rgba(86,153,187,.24);border-radius:9px;color:#9ccbe1;font-size:9px}.voice-error{max-width:1320px;margin:9px auto;padding:9px 12px;border-left:3px solid #b34f4a;background:rgba(179,79,74,.09);color:#e6aaa6;font-size:11px}.state-panel,.waiting-panel,.finished-panel{max-width:760px;margin:50px auto;text-align:center;padding:35px;border:1px solid rgba(214,183,95,.25);border-radius:18px;background:rgba(8,22,36,.88)}.seal-line{font:700 28px Georgia;color:#c7aa57}.waiting-panel h2,.finished-panel h2{color:#efdb9a;font-family:Georgia,serif}.waiting-panel>p,.finished-panel>p{color:rgba(238,224,194,.57)}.players-waiting{display:grid;gap:8px;margin:20px 0}.waiting-player{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid rgba(214,183,95,.15);border-radius:10px;text-align:left}.waiting-player div{display:flex;flex:1;flex-direction:column}.waiting-player em{font-size:10px;color:#d2b863}.guest-count{font-size:10px!important;color:#93c9dd!important}.avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#c9a84c,#604817);color:#08111b;font-weight:900}.waiting-actions{display:flex;justify-content:center}.primary{border:0;border-radius:9px;padding:11px 15px;background:linear-gradient(135deg,#e1c36c,#8b6914);color:#07101a;font-weight:900;cursor:pointer}.primary:disabled{opacity:.35}.trophy{font-size:52px}.final-scores{display:grid;gap:7px;margin:20px}.final-scores div{display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid rgba(214,183,95,.12)}.role-strip{max-width:760px;margin:14px auto 4px;display:grid;grid-template-columns:1fr auto 1fr;gap:9px;align-items:center}.role-pill{display:flex;flex-direction:column;padding:9px 13px;border:1px solid rgba(214,183,95,.17);border-radius:12px;background:rgba(8,22,36,.62)}.role-pill small{font-size:8px}.role-pill strong{color:#e8d69a}.role-pill span{font-size:9px;color:rgba(238,224,194,.46)}.role-pill.respondent.mine{border-color:rgba(203,126,86,.55);box-shadow:0 0 18px rgba(203,126,86,.1)}.role-pill.reader.mine{border-color:rgba(86,178,126,.58);box-shadow:0 0 18px rgba(86,178,126,.1)}.role-arrow{color:#806e43}.turn-message{max-width:900px;margin:8px auto;padding:9px 13px;border:1px solid rgba(214,183,95,.18);border-radius:9px;background:rgba(214,183,95,.06);color:#ddc985;text-align:center;font-size:12px}.game-grid{max-width:1320px;margin:12px auto 0;display:grid;grid-template-columns:minmax(0,1.32fr) minmax(350px,.78fr);gap:18px;align-items:start}.board-column,.action-column{min-width:0}.room-legend{display:flex;justify-content:space-between;gap:10px;padding:7px 16px;color:rgba(238,224,194,.45);font-size:9px;text-transform:uppercase;letter-spacing:.08em}.respondent-question,.spectator-question,.dice-panel,.kabbalah-turn-panel{max-width:590px;margin:0 auto;padding:22px;border:1px solid rgba(214,183,95,.28);border-radius:18px;background:radial-gradient(circle at top,rgba(214,183,95,.08),rgba(8,22,36,.9));box-shadow:0 18px 45px rgba(0,0,0,.3)}.respondent-question h2,.spectator-question h2,.kabbalah-turn-panel h2{color:#f2e5bd;font:700 22px/1.42 Georgia,serif}.hidden-answer-notice{display:grid;grid-template-columns:45px 1fr;gap:10px;align-items:start;margin-top:16px;padding:13px;border:1px solid rgba(195,130,80,.34);border-radius:12px;background:rgba(153,87,48,.1)}.hidden-answer-notice>span{font-size:30px}.hidden-answer-notice strong{color:#e9caab}.hidden-answer-notice p{margin:3px 0 0;color:rgba(238,224,194,.58);font-size:12px;line-height:1.45}.readonly-option{display:grid;grid-template-columns:31px 1fr;gap:9px;align-items:center;margin:7px 0;padding:10px;border:1px solid rgba(214,183,95,.18);border-radius:9px;background:rgba(214,183,95,.05)}.readonly-option b{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.25);color:#d8bd68}.spectator-question>p{color:rgba(238,224,194,.47);font-size:11px}.dice-panel{text-align:center}.dice{font-size:82px;line-height:1;margin:16px;color:#e5cd82;text-shadow:0 8px 20px rgba(0,0,0,.4)}.dice.rolling{animation:diceShake .14s linear infinite}.dice-panel small{display:block;margin-top:10px;color:rgba(238,224,194,.45)}.tree-mark{font-size:72px;color:#c9aa55;text-align:center;text-shadow:0 0 25px rgba(201,170,85,.25)}.kabbalah-turn-panel{text-align:center}.kabbalah-turn-panel p{color:rgba(238,224,194,.56);line-height:1.5}.score-strip{max-width:1320px;margin:15px auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px}.score-strip article{display:flex;align-items:center;gap:9px;padding:9px 11px;border:1px solid rgba(214,183,95,.13);border-radius:10px;background:rgba(8,22,36,.58)}.score-strip article.active{border-color:rgba(195,126,83,.52)}.score-strip article.reader{box-shadow:inset 0 0 0 1px rgba(70,155,105,.28)}.score-strip article>div{display:flex;flex:1;flex-direction:column}.score-strip article strong{font-size:11px}.score-strip article small{font-size:8px;color:rgba(238,224,194,.45)}.score-strip article>b{color:#d8bc67;font-size:11px}.small-avatar{width:31px;height:31px;font-size:10px}@keyframes diceShake{0%{transform:rotate(-5deg) scale(.98)}50%{transform:rotate(6deg) scale(1.05)}100%{transform:rotate(-5deg) scale(.98)}}
@media(max-width:980px){.game-grid{grid-template-columns:1fr}.game-header{grid-template-columns:auto 1fr}.header-actions{grid-column:1/-1;justify-content:flex-end}.action-column{order:-1}.respondent-question,.spectator-question,.dice-panel,.kabbalah-turn-panel{max-width:720px}}@media(max-width:620px){.turns-game{padding:10px 6px 82px;overflow-x:hidden}.room-title h1{font-size:21px}.game-header{gap:9px}.header-actions{justify-content:space-between}.role-strip{grid-template-columns:1fr 18px 1fr}.role-pill{padding:8px}.role-pill strong{font-size:11px}.role-pill span{display:none}.respondent-question,.spectator-question,.dice-panel,.kabbalah-turn-panel{padding:15px}.respondent-question h2,.spectator-question h2,.kabbalah-turn-panel h2{font-size:18px}.room-legend{padding:6px 4px;flex-direction:column;gap:3px}.score-strip{display:flex;overflow-x:auto;padding-bottom:5px}.score-strip article{min-width:170px}.board-column{width:100%;overflow:visible}.game-grid{width:100%}}
</style>
