<template>
  <div class="turns-game">
    <div class="game-header">
      <div>
        <h1>⚒ Modo Preguntas y Respuestas</h1>
        <p class="subtitle">Cada casilla determina la categoría; Registro Logia determina tu límite de grado.</p>
      </div>

      <div class="game-info">
        <div class="player-info">
          <span>Turno</span>
          <h3>{{ players[currentPlayerIndex]?.name || 'Jugador' }}</h3>
          <p>{{ players[currentPlayerIndex]?.score || 0 }} puntos</p>
        </div>
        <div class="verified-profile">
          <span>Perfil masónico validado</span>
          <strong>{{ degreeLabel }}</strong>
          <small>Registro Logia · {{ riteLabel }}</small>
        </div>
      </div>
    </div>

    <div v-if="!authStore.canPlay" class="access-warning">
      Este perfil no tiene un grado masónico activo validado en Registro Logia. No se mostrarán preguntas hasta corregir el perfil.
    </div>
    <div v-if="lastTurnMessage" class="turn-message">{{ lastTurnMessage }}</div>

    <div class="game-content">
      <div class="board-section">
        <GameBoard
          v-if="players.length > 0"
          :players="players"
          :board-size="boardSize"
          :categories="selectedCategories"
          @cell-click="cellClicked"
        />
      </div>

      <div v-if="currentQuestion" class="question-section">
        <QuestionCard :question="currentQuestion" @resolved="handleResolution" @skip="handleSkip" />
      </div>

      <div v-else class="action-section">
        <div class="rite-chip">{{ riteLabel }}</div>
        <div class="current-category" v-if="currentCellCategory">
          Última casilla: <strong>{{ currentCellCategory }}</strong>
        </div>
        <p>{{ questionsStore.loading ? 'Preparando banco de preguntas…' : 'Lanza el dado para avanzar en el tablero' }}</p>
        <div class="dice" :class="{ rolling: diceRolling }">{{ diceFace }}</div>
        <button
          :disabled="questionsStore.loading || diceRolling || !authStore.canPlay"
          @click="rollDice"
          class="btn-roll"
        >🎲 Lanzar dado</button>
        <p class="grade-note">
          Acceso máximo: <strong>{{ degreeLabel }}</strong>. Nunca se presentan preguntas de un grado superior al registrado.
        </p>
        <p v-if="questionsStore.usingDefaultQuestions" class="fallback-note">
          Usando el banco inicial incluido en la aplicación. Puedes guardarlo en Firebase desde Administración.
        </p>
      </div>
    </div>

    <div class="scores-section">
      <h3>Puntuaciones</h3>
      <div class="scores-list">
        <div v-for="(player, index) in players" :key="player.id" class="score-item" :class="{ active: index === currentPlayerIndex }">
          <span class="player-name">{{ player.name }}</span>
          <span class="player-score">{{ player.score }} pts</span>
        </div>
      </div>
      <div class="scoring-legend">
        <span>Con incisos: Aprendiz 10 · Compañero 20 · Maestro 30</span>
        <span>Sin incisos: <strong>doble puntaje</strong></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import GameBoard from '@/modules/game/board/GameBoard.vue'
import QuestionCard from './QuestionCard.vue'
import { useQuestionsStore } from '@/stores/questionsStore'
import { useAuthStore } from '@/stores/authStore'
import { useGameStore } from '@/stores/gameStore'
import { DEGREE_LABELS, getQuestionPoints, MASONIC_CATEGORIES, RITE_LABELS } from '@/modules/questions/questionRules'
import type { Player, BoardCell } from '@/modules/game/types'
import type { AnswerMode, Question } from '@/modules/questions/types'

const questionsStore = useQuestionsStore()
const authStore = useAuthStore()
const gameStore = useGameStore()

const currentPlayerIndex = ref(0)
const currentQuestion = ref<Question | null>(null)
const selectedCategories = ref<string[]>([...MASONIC_CATEGORIES])
const boardSize = ref(30)
const currentCellCategory = ref('')
const lastTurnMessage = ref('')
const diceResult = ref<number | null>(null)
const diceRolling = ref(false)
const recentQuestionIds = ref<string[]>([])

const players = ref<Player[]>([
  { id: '1', name: 'Jugador 1', position: 0, score: 0, color: '#FF6B6B', avatar: 'P1' },
  { id: '2', name: 'Jugador 2', position: 0, score: 0, color: '#4ECDC4', avatar: 'P2' },
])

const degreeLabel = computed(() => authStore.masonicDegree ? DEGREE_LABELS[authStore.masonicDegree] : 'Sin grado')
const riteLabel = computed(() => RITE_LABELS[gameStore.selectedRite])
const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const diceFace = computed(() => diceResult.value ? diceFaces[diceResult.value - 1] : '⚄')

onMounted(async () => {
  if (authStore.currentUser && !authStore.profile) await authStore.refreshProfile()
  if (authStore.profile?.name) players.value[0].name = authStore.profile.name
  await questionsStore.loadQuestions({ fallbackToDefaults: true })
})

const rollDice = () => {
  if (!authStore.canPlay || !authStore.masonicDegree) return
  lastTurnMessage.value = ''
  diceRolling.value = true

  let ticks = 0
  const timer = window.setInterval(() => {
    diceResult.value = Math.floor(Math.random() * 6) + 1
    ticks += 1
    if (ticks >= 7) {
      window.clearInterval(timer)
      diceRolling.value = false
      movePlayer(diceResult.value || 1)
    }
  }, 75)
}

const movePlayer = (steps: number) => {
  const player = players.value[currentPlayerIndex.value]
  player.position = (player.position + steps) % boardSize.value
  loadQuestionForCell(player.position)
}

const getCategoryForPosition = (position: number): string =>
  selectedCategories.value[position % selectedCategories.value.length]

const loadQuestionForCell = (position: number) => {
  const degree = authStore.masonicDegree
  if (!degree) {
    lastTurnMessage.value = 'Registro Logia no tiene un grado válido para este usuario.'
    return
  }

  const category = getCategoryForPosition(position)
  currentCellCategory.value = category
  const eligible = questionsStore.getEligibleQuestions(category, degree, gameStore.selectedRite)

  if (eligible.length === 0) {
    lastTurnMessage.value = `No hay preguntas de ${category} para ${riteLabel.value} compatibles con tu grado.`
    window.setTimeout(nextTurn, 700)
    return
  }

  const notRecentlyUsed = eligible.filter((question) => !recentQuestionIds.value.includes(question.id))
  const pool = notRecentlyUsed.length ? notRecentlyUsed : eligible
  const question = pool[Math.floor(Math.random() * pool.length)]
  currentQuestion.value = question
  recentQuestionIds.value.push(question.id)
  if (recentQuestionIds.value.length > 12) recentQuestionIds.value.shift()
}

const cellClicked = (cell: BoardCell) => { currentCellCategory.value = cell.category }

const handleResolution = (resolution: { correct: boolean; mode: AnswerMode }) => {
  if (!currentQuestion.value) return
  if (resolution.correct) {
    const points = getQuestionPoints(currentQuestion.value, resolution.mode)
    players.value[currentPlayerIndex.value].score += points
    lastTurnMessage.value = resolution.mode === 'direct'
      ? `¡Respuesta sin incisos! +${points} puntos.`
      : `Respuesta correcta. +${points} puntos.`
  } else {
    lastTurnMessage.value = 'Respuesta incorrecta. No suma puntos.'
  }
  nextTurn()
}

const handleSkip = () => { lastTurnMessage.value = 'Pregunta saltada.'; nextTurn() }
const nextTurn = () => {
  currentQuestion.value = null
  currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length
}
</script>

<style scoped>
.turns-game { min-height: 100vh; padding: 20px; }
.game-header { max-width: 1250px; margin: 0 auto 22px; display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; }
.game-header h1 { color: #c9a84c; font-size: 28px; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
.subtitle { margin: 5px 0 0; color: rgba(240,230,200,.62); }
.game-info { min-width: 440px; display: grid; grid-template-columns: 1fr 1.25fr; gap: 10px; }
.player-info, .verified-profile { background: rgba(201,168,76,.06); border: 1px solid #8b6914; border-radius: 10px; padding: 12px 14px; }
.player-info span, .verified-profile span { color: rgba(240,230,200,.62); text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
.player-info h3 { color: #f0e6c8; margin: 2px 0; font-size: 17px; }
.player-info p { color: #c9a84c; margin: 0; font-weight: 800; }
.verified-profile { display: flex; flex-direction: column; gap: 4px; }
.verified-profile strong { color: #e5ce7b; font-size: 17px; }
.verified-profile small { color: rgba(240,230,200,.55); }
.access-warning, .turn-message { max-width: 1250px; margin: 0 auto 14px; padding: 11px 14px; border-radius: 5px; }
.access-warning { border-left: 3px solid #d96058; background: rgba(217,96,88,.08); color: #f0aaa5; }
.turn-message { border-left: 3px solid #c9a84c; background: rgba(201,168,76,.08); color: #e8d9b8; }
.game-content { display: grid; grid-template-columns: 1.15fr .85fr; gap: 24px; max-width: 1250px; margin: 0 auto; align-items: center; }
.board-section { min-width: 0; }
.question-section, .action-section { display: flex; flex-direction: column; justify-content: center; }
.action-section { background: radial-gradient(circle at top, rgba(201,168,76,.11), rgba(26,10,0,.78)); border: 1px solid #c9a84c; border-radius: 16px; padding: 28px; text-align: center; min-height: 360px; }
.action-section p { color: #f0e6c8; }
.rite-chip { align-self: center; max-width: 90%; border: 1px solid #8b6914; background: rgba(201,168,76,.08); color: #e3ca75; padding: 6px 10px; border-radius: 999px; font-size: 11px; }
.current-category { color: rgba(240,230,200,.65); font-size: 13px; margin-top: 12px; }
.current-category strong, .grade-note strong { color: #c9a84c; }
.dice { font-size: 90px; line-height: 1; color: #e2c86e; filter: drop-shadow(0 10px 12px rgba(0,0,0,.35)); transform-style: preserve-3d; margin: 18px 0; }
.dice.rolling { animation: diceRoll .3s linear infinite; }
@keyframes diceRoll { 0% { transform: rotate(0) rotateY(0) scale(1); } 50% { transform: rotate(12deg) rotateY(90deg) scale(1.08); } 100% { transform: rotate(0) rotateY(180deg) scale(1); } }
.btn-roll { padding: 14px 35px; background: linear-gradient(135deg,#d6b75f,#8b6914); border: none; border-radius: 9px; color: #1a0a00; font-weight: 900; font-size: 17px; cursor: pointer; }
.btn-roll:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(201,168,76,.25); }
.btn-roll:disabled { opacity: .4; cursor: not-allowed; }
.grade-note, .fallback-note { color: rgba(240,230,200,.52) !important; font-size: 11px; line-height: 1.4; }
.scores-section { max-width: 1250px; margin: 25px auto 0; background: rgba(201,168,76,.04); border: 1px solid #8b6914; border-radius: 10px; padding: 16px; }
.scores-section h3 { color: #c9a84c; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px; }
.scores-list { display: flex; gap: 12px; flex-wrap: wrap; }
.score-item { flex: 1; min-width: 150px; background: rgba(139,105,20,.13); border: 1px solid #8b6914; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; }
.score-item.active { transform: translateY(-2px); background: rgba(201,168,76,.15); border-color: #c9a84c; }
.player-name { color: #f0e6c8; font-weight: 700; }
.player-score { color: #c9a84c; font-weight: 900; }
.scoring-legend { display: flex; justify-content: space-between; gap: 12px; margin-top: 12px; color: rgba(240,230,200,.55); font-size: 11px; }
.scoring-legend strong { color: #c9a84c; }
@media (max-width: 950px) { .game-header { flex-direction: column; } .game-info { min-width: 0; width: 100%; } .game-content { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .game-info { grid-template-columns: 1fr; } .scoring-legend { flex-direction: column; } }
</style>
