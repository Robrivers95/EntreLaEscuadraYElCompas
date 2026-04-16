<template>
  <div class="turns-game">
    <div class="game-header">
      <h1>⚒ Modo Preguntas y Respuestas</h1>
      <div class="game-info">
        <div class="player-info">
          <h3>{{ players[currentPlayerIndex]?.name || 'Jugador' }}</h3>
          <p>Puntuación: {{ players[currentPlayerIndex]?.score || 0 }}</p>
        </div>
      </div>
    </div>

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
          @answer="handleAnswer"
          @skip="handleSkip"
        />
      </div>

      <div v-else class="action-section">
        <p>Lanza el dado para avanzar en el tablero</p>
        <button @click="rollDice" class="btn-roll">🎲 Lanzar Dado</button>
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GameBoard from '@/modules/game/board/GameBoard.vue'
import QuestionCard from './QuestionCard.vue'
import { useQuestionsStore } from '@/stores/questionsStore'
import type { Player, BoardCell } from '@/modules/game/types'
import type { Question } from '@/modules/questions/types'

const questionsStore = useQuestionsStore()

const currentPlayerIndex = ref(0)
const currentQuestion = ref<Question | null>(null)
const selectedCategories = ref<string[]>(['Historia', 'Filosofía', 'Geometría'])
const boardSize = ref(24)
const players = ref<Player[]>([
  { id: '1', name: 'Jugador 1', position: 0, score: 0, color: '#FF6B6B', avatar: 'P1' },
  { id: '2', name: 'Jugador 2', position: 0, score: 0, color: '#4ECDC4', avatar: 'P2' },
])

const rollDice = () => {
  const result = Math.floor(Math.random() * 6) + 1
  movePlayer(result)
}

const movePlayer = (steps: number) => {
  const player = players.value[currentPlayerIndex.value]
  const newPosition = (player.position + steps) % boardSize.value
  player.position = newPosition
  loadQuestionForCell(newPosition)
}

const loadQuestionForCell = async (position: number) => {
  const cellCategory = selectedCategories.value[position % selectedCategories.value.length]
  const questions = await questionsStore.questions.filter((q) => q.category === cellCategory)

  if (questions.length > 0) {
    currentQuestion.value = questions[Math.floor(Math.random() * questions.length)]
  }
}

const cellClicked = (cell: BoardCell) => {
  console.log('Cell clicked:', cell)
}

const handleAnswer = (answerIndex: number) => {
  if (!currentQuestion.value) return

  if (answerIndex === currentQuestion.value.correctAnswer) {
    const points = {
      aprendiz: 1,
      compañero: 2,
      maestro: 3,
    }
    players.value[currentPlayerIndex.value].score +=
      points[currentQuestion.value.difficulty as keyof typeof points]
  }

  nextTurn()
}

const handleSkip = () => {
  nextTurn()
}

const nextTurn = () => {
  currentQuestion.value = null
  currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length
}
</script>

<style scoped>
.turns-game {
  min-height: 100vh;
  padding: 20px;
}

.game-header {
  text-align: center;
  margin-bottom: 30px;
}

.game-header h1 {
  color: #c9a84c;
  font-size: 28px;
  margin: 0 0 20px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.game-info {
  background: rgba(201, 168, 76, 0.05);
  border: 1px solid #8b6914;
  border-radius: 8px;
  padding: 15px;
  max-width: 300px;
  margin: 0 auto;
}

.player-info h3 {
  color: #f0e6c8;
  margin: 0 0 10px 0;
  font-size: 18px;
}

.player-info p {
  color: #c9a84c;
  margin: 0;
  font-weight: bold;
}

.game-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.board-section {
  flex: 1;
}

.question-section,
.action-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.action-section {
  background: rgba(201, 168, 76, 0.05);
  border: 2px solid #c9a84c;
  border-radius: 10px;
  padding: 30px;
  text-align: center;
}

.action-section p {
  color: #f0e6c8;
  font-size: 16px;
  margin: 0 0 20px 0;
}

.btn-roll {
  padding: 15px 40px;
  background: linear-gradient(135deg, #c9a84c 0%, #8b6914 100%);
  border: none;
  border-radius: 8px;
  color: #1a0a00;
  font-weight: bold;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-roll:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 20px rgba(201, 168, 76, 0.4);
}

.scores-section {
  max-width: 1200px;
  margin: 30px auto 0;
  background: rgba(201, 168, 76, 0.05);
  border: 1px solid #8b6914;
  border-radius: 8px;
  padding: 20px;
}

.scores-section h3 {
  color: #c9a84c;
  margin-top: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.scores-list {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.score-item {
  flex: 1;
  min-width: 150px;
  background: rgba(139, 105, 20, 0.2);
  border: 2px solid #8b6914;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.score-item.active {
  background: rgba(201, 168, 76, 0.2);
  border-color: #c9a84c;
}

.player-name {
  color: #f0e6c8;
  font-weight: bold;
}

.player-score {
  color: #c9a84c;
  font-weight: bold;
}

@media (max-width: 900px) {
  .game-content {
    grid-template-columns: 1fr;
  }
}
</style>
