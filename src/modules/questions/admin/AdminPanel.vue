<template>
  <div class="admin-panel">
    <div class="panel-header">
      <h1>⚒ Panel de Administración - Preguntas</h1>
    </div>

    <QuestionForm
      :editing-question="editingQuestion"
      @submit="handleSubmitQuestion"
      @cancel="editingQuestion = null"
    />

    <div class="questions-list">
      <div class="list-controls">
        <div class="filter-group">
          <label for="category-filter">Filtrar por Categoría:</label>
          <select v-model="filterCategory" id="category-filter" class="filter-select">
            <option value="">Todas</option>
            <option v-for="cat in categories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="difficulty-filter">Filtrar por Dificultad:</label>
          <select v-model="filterDifficulty" id="difficulty-filter" class="filter-select">
            <option value="">Todas</option>
            <option value="aprendiz">Aprendiz (Fácil)</option>
            <option value="compañero">Compañero (Medio)</option>
            <option value="maestro">Maestro (Difícil)</option>
          </select>
        </div>
      </div>

      <div v-if="filteredQuestions.length === 0" class="no-questions">
        <p>No hay preguntas. ¡Crea una nueva!</p>
      </div>

      <div v-else class="questions-grid">
        <div v-for="question in filteredQuestions" :key="question.id" class="question-card">
          <div class="question-header">
            <span class="difficulty-badge" :class="question.difficulty">
              {{ difficultyLabel(question.difficulty) }}
            </span>
            <span class="category-badge">{{ question.category }}</span>
          </div>

          <p class="question-text">{{ question.text }}</p>

          <div class="question-options">
            <div
              v-for="(option, index) in question.options"
              :key="index"
              class="option"
              :class="{ correct: index === question.correctAnswer }"
            >
              {{ index + 1 }}. {{ option }}
            </div>
          </div>

          <div class="question-actions">
            <button @click="editingQuestion = question" class="btn-edit">✏️ Editar</button>
            <button @click="deleteQuestion(question.id)" class="btn-delete">🗑️ Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import QuestionForm from './QuestionForm.vue'
import { useQuestionsStore } from '@/stores/questionsStore'
import { questionsService } from '@/modules/questions/questionsService'
import type { Question } from '@/modules/questions/types'

const questionsStore = useQuestionsStore()
const editingQuestion = ref<Question | null>(null)
const filterCategory = ref('')
const filterDifficulty = ref('')

const categories = computed(() => questionsStore.categories)

const filteredQuestions = computed(() => {
  return questionsStore.questions.filter((q) => {
    const matchCategory = !filterCategory.value || q.category === filterCategory.value
    const matchDifficulty = !filterDifficulty.value || q.difficulty === filterDifficulty.value
    return matchCategory && matchDifficulty
  })
})

const difficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    aprendiz: 'Aprendiz',
    compañero: 'Compañero',
    maestro: 'Maestro',
  }
  return labels[difficulty] || difficulty
}

const handleSubmitQuestion = async (question: Omit<Question, 'id' | 'createdAt'>) => {
  try {
    if (editingQuestion.value) {
      await questionsService.updateQuestion(editingQuestion.value.id, question)
      questionsStore.updateQuestion(editingQuestion.value.id, question)
    } else {
      const id = await questionsService.addQuestion(question)
      questionsStore.addQuestion({
        ...question,
        id,
      })
    }
    editingQuestion.value = null
  } catch (err) {
    console.error('Error saving question:', err)
    alert('Error al guardar la pregunta')
  }
}

const deleteQuestion = async (id: string) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
    try {
      await questionsService.deleteQuestion(id)
      questionsStore.deleteQuestion(id)
    } catch (err) {
      console.error('Error deleting question:', err)
      alert('Error al eliminar la pregunta')
    }
  }
}
</script>

<style scoped>
.admin-panel {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.panel-header {
  text-align: center;
  margin-bottom: 30px;
}

.panel-header h1 {
  color: #c9a84c;
  font-size: 28px;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.questions-list {
  margin-top: 30px;
}

.list-controls {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-group label {
  color: #f0e6c8;
  font-weight: 500;
}

.filter-select {
  padding: 8px 12px;
  background: rgba(201, 168, 76, 0.1);
  border: 1px solid #8b6914;
  border-radius: 5px;
  color: #f0e6c8;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #c9a84c;
}

.no-questions {
  text-align: center;
  padding: 40px 20px;
  color: #8b6914;
  font-size: 18px;
}

.questions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.question-card {
  background: rgba(201, 168, 76, 0.05);
  border: 2px solid #8b6914;
  border-radius: 8px;
  padding: 15px;
  transition: all 0.3s ease;
}

.question-card:hover {
  border-color: #c9a84c;
  box-shadow: 0 0 15px rgba(201, 168, 76, 0.2);
}

.question-header {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.difficulty-badge,
.category-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-badge {
  background: rgba(139, 105, 20, 0.3);
  color: #f0e6c8;
  border: 1px solid #8b6914;
}

.difficulty-badge {
  color: white;
  border: none;
}

.difficulty-badge.aprendiz {
  background: rgba(76, 175, 80, 0.7);
}

.difficulty-badge.compañero {
  background: rgba(255, 193, 7, 0.7);
}

.difficulty-badge.maestro {
  background: rgba(244, 67, 54, 0.7);
}

.question-text {
  color: #f0e6c8;
  margin: 10px 0;
  font-weight: 500;
}

.question-options {
  background: rgba(26, 10, 0, 0.5);
  border-left: 3px solid #c9a84c;
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
}

.option {
  color: #f0e6c8;
  padding: 5px 0;
  font-size: 13px;
}

.option.correct {
  color: #4cb050;
  font-weight: bold;
}

.question-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-edit,
.btn-delete {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  font-size: 12px;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-edit {
  background: rgba(201, 168, 76, 0.3);
  color: #f0e6c8;
  border: 1px solid #c9a84c;
}

.btn-edit:hover {
  background: #c9a84c;
  color: #1a0a00;
}

.btn-delete {
  background: rgba(244, 67, 54, 0.3);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.btn-delete:hover {
  background: #ff6b6b;
  color: white;
}
</style>
