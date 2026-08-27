<template>
  <div class="turns-game">
    <header class="game-header">
      <div class="title-cluster">
        <MasonicSeal :size="82" compact />
        <div>
          <span class="masonic-kicker">Cámara de juego</span>
          <h1>Preguntas y Respuestas</h1>
          <p class="subtitle">Cada casilla abre una materia; Registro Logia determina tu límite de grado.</p>
          <div class="header-symbols" aria-hidden="true"><span>☉</span><span>△</span><strong>G</strong><span>□</span><span>☽</span></div>
        </div>
      </div>

      <div class="game-info">
        <div class="player-info temple-panel">
          <span>Turno</span>
          <h3>{{ players[currentPlayerIndex]?.name || 'Jugador' }}</h3>
          <p>{{ players[currentPlayerIndex]?.score || 0 }} puntos</p>
        </div>
        <div class="verified-profile temple-panel">
          <span>Perfil masónico validado</span>
          <strong>{{ degreeLabel }}</strong>
          <small>Registro Logia · {{ riteLabel }}</small>
        </div>
      </div>
    </header>

    <div class="mosaic-strip top-strip"></div>

    <div v-if="!authStore.canPlay" class="access-warning">
      Este perfil no tiene un grado masónico activo validado en Registro Logia. No se mostrarán preguntas hasta corregir el perfil.
    </div>
    <div v-if="lastTurnMessage" class="turn-message">✦ {{ lastTurnMessage }}</div>

    <div class="game-content">
      <div class="board-section temple-panel">
        <div class="board-caption">
          <span>Tablero de la Logia</span>
          <div class="board-ornaments" aria-hidden="true">B · ✦ · △ · G · □ · ✦ · J</div>
        </div>
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

      <div v-else class="action-section temple-panel">
        <div class="action-emblem"><MasonicSeal :size="112" tone="muted" /></div>
        <div class="rite-chip">{{ riteLabel }}</div>
        <div class="current-category" v-if="currentCellCategory">
          Última casilla: <strong>{{ currentCellCategory }}</strong>
        </div>
        <p>{{ questionsStore.loading ? 'Preparando banco de preguntas…' : 'Lanza el dado para avanzar en el tablero' }}</p>
        <div class="dice-frame">
          <div class="dice" :class="{ rolling: diceRolling }">{{ diceFace }}</div>
        </div>
        <button
          :disabled="questionsStore.loading || diceRolling || !authStore.canPlay"
          @click="rollDice"
          class="btn-roll"
        >Lanzar dado</button>
        <p class="grade-note">
          Acceso máximo: <strong>{{ degreeLabel }}</strong>. Nunca se presentan preguntas de un grado superior al registrado.
        </p>
        <p v-if="questionsStore.usingDefaultQuestions" class="fallback-note">
          ✦ Usando el banco incluido en la aplicación. Puedes sincronizarlo con Firebase desde Administración.
        </p>
      </div>
    </div>

    <section class="scores-section temple-panel">
      <div class="scores-heading">
        <div>
          <span class="masonic-kicker">Cuadro de puntuación</span>
          <h3>Marcador de la mesa</h3>
        </div>
        <span class="score-symbol" aria-hidden="true">⚒</span>
      </div>
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
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import GameBoard from '@/modules/game/board/GameBoard.vue'
import QuestionCard from './QuestionCard.vue'
import MasonicSeal from '@/shared/MasonicSeal.vue'
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
  { id: '1', name: 'Jugador 1', position: 0, score: 0, color: '#D1B15C', avatar: 'P1' },
  { id: '2', name: 'Jugador 2', position: 0, score: 0, color: '#7395B8', avatar: 'P2' },
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
.turns-game { min-height: 100vh; padding: 22px 20px 44px; background: radial-gradient(circle at 50% 0, rgba(213,183,97,.08), transparent 28rem); }
.game-header { max-width: 1280px; margin: 0 auto 16px; display: flex; justify-content: space-between; align-items: center; gap: 24px; }
.title-cluster { display: flex; align-items: center; gap: 16px; }
.game-header h1 { color: #dcc16f; font-size: 30px; margin: 2px 0 0; text-transform: uppercase; letter-spacing: .085em; }
.subtitle { margin: 4px 0 0; color: var(--masonic-muted); }
.header-symbols { display: flex; gap: 13px; align-items: center; margin-top: 7px; color: rgba(213,183,97,.55); font-size: 12px; }
.header-symbols strong { color: #e6d184; font-size: 16px; }
.game-info { min-width: 440px; display: grid; grid-template-columns: 1fr 1.25fr; gap: 10px; }
.player-info, .verified-profile { border-radius: 3px; padding: 12px 14px; }
.player-info span, .verified-profile span { color: rgba(241,231,207,.54); text-transform: uppercase; font-size: 9px; letter-spacing: .14em; }
.player-info h3 { color: #f0e6ca; margin: 2px 0; font-size: 17px; }
.player-info p { color: #d5b761; margin: 0; font-weight: 800; }
.verified-profile { display: flex; flex-direction: column; gap: 4px; }
.verified-profile strong { color: #e2ca79; font-size: 17px; }
.verified-profile small { color: rgba(241,231,207,.5); }
.top-strip { max-width: 1280px; margin: 0 auto 17px; }
.access-warning, .turn-message { max-width: 1280px; margin: 0 auto 14px; padding: 11px 14px; border-radius: 2px; }
.access-warning { border-left: 3px solid #944147; background: rgba(111,32,40,.1); color: #dfa9ad; }
.turn-message { border: 1px solid rgba(213,183,97,.23); border-left: 3px solid #c6a753; background: rgba(213,183,97,.055); color: #e8d9b8; }
.game-content { display: grid; grid-template-columns: 1.18fr .82fr; gap: 24px; max-width: 1280px; margin: 0 auto; align-items: stretch; }
.board-section { min-width: 0; border-radius: 4px; padding: 16px; }
.board-caption { display: flex; justify-content: space-between; gap: 12px; align-items: center; padding: 0 4px 12px; border-bottom: 1px solid rgba(213,183,97,.15); margin-bottom: 12px; color: #d6bd70; text-transform: uppercase; letter-spacing: .13em; font-size: 10px; font-weight: 800; }
.board-ornaments { color: rgba(213,183,97,.48); letter-spacing: .16em; }
.question-section, .action-section { display: flex; flex-direction: column; justify-content: center; }
.action-section { overflow: hidden; border-radius: 4px; padding: 26px; text-align: center; min-height: 460px; align-items: center; }
.action-section::before { top: 12px; left: 12px; }
.action-emblem { margin-bottom: -12px; opacity: .55; }
.action-section p { color: #ede2c9; }
.rite-chip { max-width: 90%; border: 1px solid #785b24; background: rgba(213,183,97,.07); color: #e0c873; padding: 6px 11px; border-radius: 999px; font-size: 10px; text-transform: uppercase; letter-spacing: .08em; }
.current-category { color: rgba(241,231,207,.57); font-size: 12px; margin-top: 12px; }
.current-category strong, .grade-note strong { color: #d5b761; }
.dice-frame { width: 124px; height: 124px; margin: 15px 0; display: grid; place-items: center; border: 1px solid rgba(213,183,97,.35); background: radial-gradient(circle, rgba(213,183,97,.09), transparent 67%); transform: rotate(45deg); }
.dice { font-size: 88px; line-height: 1; color: #e4ca75; filter: drop-shadow(0 10px 12px rgba(0,0,0,.42)); transform: rotate(-45deg); transform-style: preserve-3d; }
.dice.rolling { animation: diceRoll .3s linear infinite; }
@keyframes diceRoll { 0% { transform: rotate(-45deg) rotateY(0) scale(1); } 50% { transform: rotate(-33deg) rotateY(90deg) scale(1.08); } 100% { transform: rotate(-45deg) rotateY(180deg) scale(1); } }
.btn-roll { min-width: 190px; padding: 13px 30px; background: linear-gradient(135deg,#e2ca78,#8b6826); border: 1px solid #f0d98a; border-radius: 3px; color: #080b10; font-weight: 900; font-size: 15px; text-transform: uppercase; letter-spacing: .08em; cursor: pointer; box-shadow: 0 7px 24px rgba(0,0,0,.25); }
.btn-roll:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 11px 30px rgba(213,183,97,.17); }
.btn-roll:disabled { opacity: .4; cursor: not-allowed; }
.grade-note, .fallback-note { color: rgba(241,231,207,.5) !important; font-size: 10px; line-height: 1.45; max-width: 420px; }
.scores-section { max-width: 1280px; margin: 24px auto 0; border-radius: 4px; padding: 17px; }
.scores-heading { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 12px; }
.scores-section h3 { color: #d7bd6d; margin: 2px 0 0; text-transform: uppercase; letter-spacing: .08em; }
.score-symbol { color: rgba(213,183,97,.55); font-size: 26px; }
.scores-list { display: flex; gap: 12px; flex-wrap: wrap; }
.score-item { flex: 1; min-width: 150px; background: rgba(213,183,97,.045); border: 1px solid rgba(213,183,97,.22); border-radius: 2px; padding: 12px; display: flex; justify-content: space-between; }
.score-item.active { transform: translateY(-2px); background: rgba(213,183,97,.11); border-color: #b69743; box-shadow: inset 0 0 18px rgba(213,183,97,.035); }
.player-name { color: #f0e6c8; font-weight: 700; }
.player-score { color: #d5b761; font-weight: 900; }
.scoring-legend { display: flex; justify-content: space-between; gap: 12px; margin-top: 12px; color: rgba(241,231,207,.5); font-size: 10px; }
.scoring-legend strong { color: #d5b761; }
@media (max-width: 980px) { .game-header { flex-direction: column; align-items: flex-start; } .game-info { min-width: 0; width: 100%; } .game-content { grid-template-columns: 1fr; } .action-section { min-height: 390px; } }
@media (max-width: 600px) { .turns-game { padding: 15px 11px 35px; } .title-cluster { align-items: flex-start; } .title-cluster > :first-child { display: none; } .game-header h1 { font-size: 24px; } .game-info { grid-template-columns: 1fr; } .board-caption { align-items: flex-start; flex-direction: column; } .scoring-legend { flex-direction: column; } }
</style>
