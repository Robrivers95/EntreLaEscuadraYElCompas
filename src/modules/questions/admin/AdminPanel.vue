<template>
  <div class="admin-panel">
    <div class="panel-header">
      <div>
        <h1>⚒ Banco de preguntas</h1>
        <p>Administra las preguntas que alimentan las categorías del tablero.</p>
      </div>
      <button class="btn-seed" :disabled="seeding" @click="importStarterQuestions">
        {{ seeding ? 'Agregando…' : '＋ Agregar preguntas iniciales' }}
      </button>
    </div>

    <QuestionForm
      :editing-question="editingQuestion"
      @submit="handleSubmitQuestion"
      @cancel="editingQuestion = null"
    />

    <div class="questions-list">
      <div class="list-controls">
        <div class="search-group">
          <input v-model="searchText" class="filter-input" placeholder="Buscar pregunta o respuesta…" />
        </div>
        <select v-model="filterCategory" class="filter-select">
          <option value="">Todas las categorías</option>
          <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
        </select>
        <select v-model="filterDifficulty" class="filter-select">
          <option value="">Todos los grados</option>
          <option value="aprendiz">Aprendiz</option>
          <option value="compañero">Compañero</option>
          <option value="maestro">Maestro</option>
        </select>
        <button class="btn-refresh" :disabled="questionsStore.loading" @click="reloadQuestions">↻ Recargar</button>
      </div>

      <div class="summary-row">
        <span><strong>{{ filteredQuestions.length }}</strong> visibles</span>
        <span>Aprendiz: <strong>{{ countByDegree('aprendiz') }}</strong></span>
        <span>Compañero: <strong>{{ countByDegree('compañero') }}</strong></span>
        <span>Maestro: <strong>{{ countByDegree('maestro') }}</strong></span>
      </div>

      <div v-if="questionsStore.error" class="status-message error">{{ questionsStore.error }}</div>
      <div v-if="questionsStore.loading" class="status-message">Cargando banco de preguntas…</div>

      <div v-else-if="filteredQuestions.length === 0" class="no-questions">
        <h3>No hay preguntas con estos filtros</h3>
        <p>Puedes crear una arriba o cargar el banco inicial preparado para el juego.</p>
      </div>

      <div v-else class="questions-grid">
        <article v-for="question in filteredQuestions" :key="question.id" class="question-card">
          <div class="question-header">
            <span class="difficulty-badge" :class="question.difficulty">{{ difficultyLabel(question.difficulty) }}</span>
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
              <strong>{{ String.fromCharCode(65 + index) }}.</strong> {{ option }}
            </div>
          </div>

          <div class="direct-answer-preview">
            <span>Sin incisos:</span>
            <strong>{{ question.directAnswer || question.options[question.correctAnswer] }}</strong>
          </div>

          <p v-if="question.explanation" class="explanation">{{ question.explanation }}</p>

          <div class="question-actions">
            <button class="btn-edit" @click="startEdit(question)">✏️ Editar</button>
            <button class="btn-duplicate" @click="duplicateQuestion(question)">⧉ Duplicar</button>
            <button class="btn-delete" @click="deleteQuestion(question.id)">🗑️ Eliminar</button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import QuestionForm from './QuestionForm.vue'
import { useQuestionsStore } from '@/stores/questionsStore'
import { questionsService } from '@/modules/questions/questionsService'
import { DEFAULT_QUESTIONS } from '@/modules/questions/defaultQuestions'
import { LEGACY_STARTER_QUESTIONS } from '@/modules/questions/legacyStarterQuestions'
import { DEGREE_LABELS, MASONIC_CATEGORIES, normalizeAnswer } from '@/modules/questions/questionRules'
import type { MasonicDegree, Question } from '@/modules/questions/types'

type QuestionInput = Omit<Question, 'id' | 'createdAt' | 'updatedAt'>

const questionsStore = useQuestionsStore()
const editingQuestion = ref<Question | null>(null)
const filterCategory = ref('')
const filterDifficulty = ref('')
const searchText = ref('')
const seeding = ref(false)
const categories = MASONIC_CATEGORIES
const starterQuestions = [...DEFAULT_QUESTIONS, ...LEGACY_STARTER_QUESTIONS]

onMounted(() => reloadQuestions())

const toQuestionInput = (question: Question): QuestionInput => ({
  text: question.text,
  category: question.category,
  difficulty: question.difficulty,
  options: [...question.options],
  correctAnswer: question.correctAnswer,
  directAnswer: question.directAnswer,
  acceptedDirectAnswers: question.acceptedDirectAnswers ? [...question.acceptedDirectAnswers] : undefined,
  explanation: question.explanation,
  basePoints: question.basePoints,
})

const reloadQuestions = async () => {
  await questionsStore.loadQuestions({ force: true, fallbackToDefaults: false })
}

const filteredQuestions = computed(() => {
  const search = normalizeAnswer(searchText.value)
  return questionsStore.questions.filter((question) => {
    const matchCategory = !filterCategory.value || question.category === filterCategory.value
    const matchDifficulty = !filterDifficulty.value || question.difficulty === filterDifficulty.value
    const haystack = normalizeAnswer([
      question.text,
      ...question.options,
      question.directAnswer ?? '',
      ...(question.acceptedDirectAnswers ?? []),
    ].join(' '))
    const matchSearch = !search || haystack.includes(search)
    return matchCategory && matchDifficulty && matchSearch
  })
})

const difficultyLabel = (difficulty: MasonicDegree) => DEGREE_LABELS[difficulty]
const countByDegree = (degree: MasonicDegree) => questionsStore.questions.filter((q) => q.difficulty === degree).length

const startEdit = (question: Question) => {
  editingQuestion.value = question
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSubmitQuestion = async (question: QuestionInput) => {
  try {
    if (editingQuestion.value) {
      await questionsService.updateQuestion(editingQuestion.value.id, question)
      questionsStore.updateQuestion(editingQuestion.value.id, question)
    } else {
      const id = await questionsService.addQuestion(question)
      questionsStore.addQuestion({ ...question, id })
    }
    editingQuestion.value = null
  } catch (err) {
    console.error('Error saving question:', err)
    alert('No se pudo guardar la pregunta.')
  }
}

const duplicateQuestion = async (question: Question) => {
  const copy = toQuestionInput(question)
  const duplicatedText = `${copy.text} (copia)`
  try {
    const newId = await questionsService.addQuestion({ ...copy, text: duplicatedText })
    questionsStore.addQuestion({ ...copy, text: duplicatedText, id: newId })
  } catch (err) {
    console.error('Error duplicating question:', err)
    alert('No se pudo duplicar la pregunta.')
  }
}

const importStarterQuestions = async () => {
  seeding.value = true
  try {
    const existing = new Set(questionsStore.questions.map((question) => normalizeAnswer(question.text)))
    const missing = starterQuestions.filter((question) => !existing.has(normalizeAnswer(question.text)))

    for (const question of missing) {
      await questionsService.addQuestion(toQuestionInput(question))
    }

    await reloadQuestions()
    alert(missing.length ? `Se agregaron ${missing.length} preguntas iniciales.` : 'El banco inicial ya estaba cargado.')
  } catch (err) {
    console.error('Error importing starter questions:', err)
    alert('No se pudo cargar el banco inicial en Firebase.')
  } finally {
    seeding.value = false
  }
}

const deleteQuestion = async (id: string) => {
  if (!confirm('¿Eliminar esta pregunta del banco?')) return
  try {
    await questionsService.deleteQuestion(id)
    questionsStore.deleteQuestion(id)
    if (editingQuestion.value?.id === id) editingQuestion.value = null
  } catch (err) {
    console.error('Error deleting question:', err)
    alert('No se pudo eliminar la pregunta.')
  }
}
</script>

<style scoped>
.admin-panel { max-width: 1250px; margin: 0 auto; padding: 20px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 24px; }
.panel-header h1 { color: #c9a84c; font-size: 30px; margin: 0; text-transform: uppercase; letter-spacing: 2px; }
.panel-header p { margin: 6px 0 0; color: rgba(240, 230, 200, 0.7); }
.btn-seed, .btn-refresh { border: 1px solid #c9a84c; background: rgba(201,168,76,.12); color: #f0e6c8; border-radius: 8px; padding: 11px 14px; font-weight: 700; cursor: pointer; }
.btn-seed:hover, .btn-refresh:hover { background: rgba(201,168,76,.22); }
.questions-list { margin-top: 28px; }
.list-controls { display: grid; grid-template-columns: minmax(240px, 1fr) auto auto auto; gap: 10px; margin-bottom: 12px; }
.filter-input, .filter-select { width: 100%; padding: 10px 12px; background: rgba(201,168,76,.08); border: 1px solid #8b6914; border-radius: 7px; color: #f0e6c8; }
.summary-row { display: flex; gap: 16px; flex-wrap: wrap; padding: 10px 0 18px; color: rgba(240,230,200,.72); font-size: 13px; }
.summary-row strong { color: #c9a84c; }
.status-message, .no-questions { text-align: center; padding: 35px 20px; color: #c9a84c; border: 1px dashed #8b6914; border-radius: 10px; }
.status-message.error { color: #ff8b8b; border-color: #8f4343; }
.no-questions h3 { margin: 0 0 8px; }
.questions-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 18px; }
.question-card { background: linear-gradient(145deg, rgba(201,168,76,.07), rgba(26,10,0,.75)); border: 1px solid #8b6914; border-radius: 12px; padding: 16px; transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease; }
.question-card:hover { transform: translateY(-3px); border-color: #c9a84c; box-shadow: 0 12px 30px rgba(0,0,0,.25); }
.question-header { display: flex; gap: 8px; margin-bottom: 12px; }
.difficulty-badge, .category-badge { padding: 5px 9px; border-radius: 999px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
.category-badge { background: rgba(139,105,20,.3); color: #f0e6c8; border: 1px solid #8b6914; }
.difficulty-badge { color: white; }
.difficulty-badge.aprendiz { background: rgba(76,175,80,.72); }
.difficulty-badge.compañero { background: rgba(230,165,20,.8); }
.difficulty-badge.maestro { background: rgba(190,65,58,.82); }
.question-text { color: #f0e6c8; font-weight: 650; line-height: 1.45; }
.question-options { background: rgba(0,0,0,.2); border-left: 3px solid #c9a84c; padding: 9px 11px; border-radius: 5px; }
.option { color: rgba(240,230,200,.82); padding: 4px 0; font-size: 13px; }
.option.correct { color: #8be19b; font-weight: 700; }
.direct-answer-preview { display: flex; gap: 7px; margin-top: 10px; font-size: 12px; color: rgba(240,230,200,.65); }
.direct-answer-preview strong { color: #c9a84c; }
.explanation { color: rgba(240,230,200,.65); font-size: 12px; font-style: italic; }
.question-actions { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 7px; margin-top: 14px; }
.question-actions button { padding: 9px; border-radius: 6px; cursor: pointer; font-weight: 700; font-size: 12px; }
.btn-edit { background: rgba(201,168,76,.22); color: #f0e6c8; border: 1px solid #c9a84c; }
.btn-duplicate { background: rgba(75,123,170,.18); color: #b8d9ff; border: 1px solid #557da4; }
.btn-delete { background: rgba(244,67,54,.15); color: #ff8b8b; border: 1px solid #b55252; }
@media (max-width: 850px) { .panel-header { align-items: stretch; flex-direction: column; } .list-controls { grid-template-columns: 1fr; } }
</style>
