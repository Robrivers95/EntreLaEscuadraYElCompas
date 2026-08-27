<template>
  <div class="turns-game">
    <div class="game-header">
      <div>
        <h1>⚒ Modo Preguntas y Respuestas</h1>
        <p class="subtitle">Cada casilla determina la categoría de la pregunta.</p>
      </div>

      <div class="game-info">
        <div class="player-info">
          <span>Turno</span>
          <h3>{{ players[currentPlayerIndex]?.name || 'Jugador' }}</h3>
          <p>{{ players[currentPlayerIndex]?.score || 0 }} puntos</p>
        </div>
        <div class="degree-selector">
          <label for="game-degree">Grado de la partida</label>
          <select id="game-degree" v-model="gameDegree" :disabled="gameStarted">
            <option value="aprendiz">Aprendiz</option>
            <option value="compañero">Compañero</option>
            <option value="maestro">Maestro</option>
          </select>
          <small v-if="gameDegree === 'aprendiz'">Sólo preguntas de Aprendiz.</small>
          <small v-else-if="gameDegree === 'compañero'">Preguntas de Aprendiz y Compañero.</small>
          <small v-else>Preguntas de los tres grados.</small>
        </div>
      </div>
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
        <QuestionCard
          :question="currentQuestion"
          @resolved="handleResolution"
          @skip="handleSkip"
        />
      </div>

      <div v-else class="action-section">
        <div class="current-category" v-if="currentCellCategory">
          Última casilla: <strong>{{ currentCellCategory }}</strong>
        </div>
        <p>{{ questionsStore.loading ? 'Preparando banco de preguntas…' : 'Lanza el dado para avanzar en el tablero' }}</p>
        <div class="dice" :class="{ rolling: diceRolling }">{{ diceFace }}</div>
        <button :disabled="questionsStore.loading || diceRolling" @click="rollDice" class="btn-roll">🎲 Lanzar dado</button>
        <p v-if="questionsStore.usingDefaultQuestions" class="fallback-note">
          Usando el banco inicial incluido en la aplicación. Puedes guardarlo en Firebase desde Administración.
        </p>
      </div>
    </div>

    <div class="scores-section">
      <h3>Puntuaciones</h3>
      <div class="scores-list">
        <div
          v-for="(player, index) in players"
          :key="player.id"
          class="score-item"
          :class="{ active: index === currentPlayerIndex }"
        >
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
import { getQuestionPoints, MASONIC_CATEGORIES } from '@/modules/questions/questionRules'
import type { Player, BoardCell } from '@/modules/game/types'
import type { AnswerMode, MasonicDegree, Question } from '@/modules/questions/types'

const questionsStore = useQuestionsStore()

const currentPlayerIndex = ref(0)
const currentQuestion = ref<Question | null>(null)
const gameDegree = ref<MasonicDegree>('aprendiz')
const selectedCategories = ref<string[]>([...MASONIC_CATEGORIES])
const boardSize = ref(30)
const gameStarted = ref(false)
const currentCellCategory = ref('')
const lastTurnMessage = ref('')
const diceResult = ref<number | null>(null)
const diceRolling = ref(false)
const recentQuestionIds = ref<string[]>([])

const players = ref<Player[]>([
  { id: '1', name: 'Jugador 1', position: 0, score: 0, color: '#FF6B6B', avatar: 'P1' },
  { id: '2', name: 'Jugador 2', position: 0, score: 0, color: '#4ECDC4', avatar: 'P2' },
])

const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
const diceFace = computed(() => diceResult.value ? diceFaces[diceResult.value - 1] : '⚄')

onMounted(async () => {
  await questionsStore.loadQuestions({ fallbackToDefaults: true })
})

const rollDice = () => {
  gameStarted.value = true
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

const getCategoryForPosition = (position: number): string => {
  return selectedCategories.value[position % selectedCategories.value.length]
}

const loadQuestionForCell = (position: number) => {
  const category = getCategoryForPosition(position)
  currentCellCategory.value = category
  const eligible = questionsStore.getEligibleQuestions(category, gameDegree.value)

  if (eligible.length === 0) {
    lastTurnMessage.value = `No hay preguntas de ${category} disponibles para este grado.`
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

const cellClicked = (cell: BoardCell) => {
  currentCellCategory.value = cell.category
}

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

const handleSkip = () => {
  lastTurnMessage.value = 'Pregunta saltada.'
  nextTurn()
}

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
.game-info { min-width: 420px; display: grid; grid-template-columns: 1fr 1.25fr; gap: 10px; }
.player-info, .degree-selector { background: rgba(201,168,76,.06); border: 1px solid #8b6914; border-radius: 10px; padding: 12px 14px; }
.player-info span, .degree-selector label { color: rgba(240,230,200,.62); text-transform: uppercase; font-size: 10px; letter-spacing: 1px; }
.player-info h3 { color: #f0e6c8; margin: 2px 0; font-size: 17px; }
.player-info p { color: #c9a84c; margin: 0; font-weight: 800; }
.degree-selector { display: flex; flex-direction: column; gap: 5px; }
.degree-selector select { background: rgba(0,0,0,.22); border: 1px solid #8b6914; color: #f0e6c8; padding: 6px; border-radius: 6px; }
.degree-selector small { color: rgba(240,230,200,.58); font-size: 10px; }
.turn-message { max-width: 1250px; margin: 0 auto 14px; padding: 11px 14px; border-left: 3px solid #c9a84c; background: rgba(201,168,76,.08); color: #e8d9b8; border-radius: 5px; }
.game-content { display: grid; grid-template-columns: 1.15fr .85fr; gap: 24px; max-width: 1250px; margin: 0 auto; align-items: center; }
.board-section { min-width: 0; }
.question-section, .action-section { display: flex; flex-direction: column; justify-content: center; }
.action-section { background: radial-gradient(circle at top, rgba(201,168,76,.11), rgba(26,10,0,.78)); border: 1px solid #c9a84c; border-radius: 16px; padding: 28px; text-align: center; min-height: 360px; }
.action-section p { color: #f0e6c8; }
.current-category { color: rgba(240,230,200,.65); font-size: 13px; }
.current-category strong { color: #c9a84c; }
.dice { font-size: 90px; line-height: 1; color: #e2c86e; filter: drop-shadow(0 10px 12px rgba(0,0,0,.35)); transform-style: preserve-3d; margin: 18px 0; }
.dice.rolling { animation: diceRoll .3s linear infinite; }
@keyframes diceRoll { 0% { transform: rotate(0) rotateY(0) scale(1); } 50% { transform: rotate(12deg) rotateY(90deg) scale(1.08); } 100% { transform: rotate(0) rotateY(180deg) scale(1); } }
.btn-roll { padding: 14px 35px; background: linear-gradient(135deg,#d6b75f,#8b6914); border: none; border-radius: 9px; color: #1a0a00; font-weight: 900; font-size: 17px; cursor: pointer; transition: transform .2s ease, box-shadow .2s ease; }
.btn-roll:hover:not(:disabled) { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(201,168,76,.25); }
.btn-roll:disabled { opacity: .5; cursor: not-allowed; }
.fallback-note { color: rgba(240,230,200,.48) !important; font-size: 11px; line-height: 1.4; }
.scores-section { max-width: 1250px; margin: 25px auto 0; background: rgba(201,168,76,.04); border: 1px solid #8b6914; border-radius: 10px; padding: 16px; }
.scores-section h3 { color: #c9a84c; margin: 0 0 10px; text-transform: uppercase; letter-spacing: 1px; }
.scores-list { display: flex; gap: 12px; flex-wrap: wrap; }
.score-item { flex: 1; min-width: 150px; background: rgba(139,105,20,.13); border: 1px solid #8b6914; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; transition: transform .2s ease, border-color .2s ease; }
.score-item.active { transform: translateY(-2px); background: rgba(201,168,76,.15); border-color: #c9a84c; }
.player-name { color: #f0e6c8; font-weight: 700; }
.player-score { color: #c9a84c; font-weight: 900; }
.scoring-legend { display: flex; justify-content: space-between; gap: 12px; margin-top: 12px; color: rgba(240,230,200,.55); font-size: 11px; }
.scoring-legend strong { color: #c9a84c; }
@media (max-width: 950px) { .game-header { flex-direction: column; } .game-info { min-width: 0; width: 100%; } .game-content { grid-template-columns: 1fr; } }
@media (max-width: 560px) { .game-info { grid-template-columns: 1fr; } .scoring-legend { flex-direction: column; } }
</style>
