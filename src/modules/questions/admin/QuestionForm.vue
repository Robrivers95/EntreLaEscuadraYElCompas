<template>
  <div class="question-form">
    <div class="form-title-row">
      <div>
        <h2>{{ isEditing ? 'Editar pregunta' : 'Nueva pregunta' }}</h2>
        <p class="form-help">Cada pregunta pertenece a un rito, un grado y una categoría del tablero.</p>
      </div>
      <span v-if="isEditing" class="editing-badge">Editando</span>
    </div>

    <form @submit.prevent="submitForm" class="form">
      <div class="form-group">
        <label for="text">Pregunta</label>
        <textarea id="text" v-model="formData.text" placeholder="Escribe una pregunta clara y jugable…" required class="form-input textarea"></textarea>
      </div>

      <div class="form-row three">
        <div class="form-group">
          <label for="rite">Rito</label>
          <select id="rite" v-model="formData.rite" required class="form-input">
            <option v-for="rite in rites" :key="rite.value" :value="rite.value">{{ rite.label }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="category">Categoría de la casilla</label>
          <select id="category" v-model="formData.category" required class="form-input">
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="difficulty">Grado de la pregunta</label>
          <select id="difficulty" v-model="formData.difficulty" required class="form-input">
            <option value="aprendiz">Aprendiz</option>
            <option value="compañero">Compañero</option>
            <option value="maestro">Maestro</option>
          </select>
        </div>
      </div>

      <div class="direct-answer-box">
        <div class="form-group">
          <label for="direct-answer">Respuesta corta para “sin incisos”</label>
          <input id="direct-answer" v-model="formData.directAnswer" type="text" placeholder="Si se deja vacía, se usa la opción correcta" class="form-input" />
        </div>
        <div class="form-group">
          <label for="aliases">Otras respuestas aceptadas</label>
          <input id="aliases" v-model="formData.acceptedDirectAnswersText" type="text" placeholder="Separadas por coma" class="form-input" />
          <small>Permite aceptar diferentes formas correctas cuando el jugador responde antes de escuchar A–D.</small>
        </div>
      </div>

      <div class="form-group">
        <div class="options-title"><label>Incisos A–D</label><span>Marca uno como correcto</span></div>
        <div v-for="(_option, index) in formData.options" :key="index" class="option-input">
          <span class="option-letter">{{ String.fromCharCode(65 + index) }}</span>
          <input v-model="formData.options[index]" type="text" :placeholder="`Opción ${String.fromCharCode(65 + index)}`" required class="form-input" />
          <label class="correct-answer-label" :class="{ selected: formData.correctAnswer === index }">
            <input type="radio" name="correct-answer" :value="index" v-model.number="formData.correctAnswer" /> Correcta
          </label>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="explanation">Explicación opcional</label>
          <textarea id="explanation" v-model="formData.explanation" placeholder="Se muestra después de responder" class="form-input explanation"></textarea>
        </div>
        <div class="form-group">
          <label for="source">Fuente / nota de procedencia</label>
          <textarea id="source" v-model="formData.source" placeholder="Ej. Liturgia REAA de la jurisdicción, página o referencia" class="form-input explanation"></textarea>
        </div>
      </div>

      <div class="points-preview">
        <span>Con incisos: <strong>{{ normalPoints }} pts</strong></span>
        <span>Sin incisos: <strong>{{ directPoints }} pts</strong></span>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-submit">{{ isEditing ? 'Guardar cambios' : 'Agregar pregunta' }}</button>
        <button v-if="isEditing" type="button" @click="cancelEdit" class="btn-cancel">Cancelar edición</button>
        <button v-else type="button" @click="resetForm" class="btn-cancel">Limpiar</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getBasePoints, MASONIC_CATEGORIES, MASONIC_RITES } from '@/modules/questions/questionRules'
import type { MasonicDegree, MasonicRite, Question } from '@/modules/questions/types'

type QuestionInput = Omit<Question, 'id' | 'createdAt' | 'updatedAt'>
interface Props { editingQuestion?: Question | null }
interface Emits { (e: 'submit', question: QuestionInput): void; (e: 'cancel'): void }

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const categories = MASONIC_CATEGORIES
const rites = MASONIC_RITES

interface FormData {
  text: string
  rite: MasonicRite
  category: string
  difficulty: MasonicDegree
  options: string[]
  correctAnswer: number
  directAnswer: string
  acceptedDirectAnswersText: string
  explanation: string
  source: string
}

const createEmptyForm = (): FormData => ({
  text: '', rite: 'reaa', category: MASONIC_CATEGORIES[0], difficulty: 'aprendiz',
  options: ['', '', '', ''], correctAnswer: 0, directAnswer: '', acceptedDirectAnswersText: '', explanation: '', source: '',
})

const formData = ref<FormData>(createEmptyForm())
const isEditing = computed(() => Boolean(props.editingQuestion))
const normalPoints = computed(() => getBasePoints(formData.value.difficulty))
const directPoints = computed(() => normalPoints.value * 2)

watch(() => props.editingQuestion, (question) => {
  if (!question) { formData.value = createEmptyForm(); return }
  formData.value = {
    text: question.text,
    rite: question.rite ?? 'reaa',
    category: question.category,
    difficulty: question.difficulty,
    options: [...question.options],
    correctAnswer: question.correctAnswer,
    directAnswer: question.directAnswer ?? '',
    acceptedDirectAnswersText: (question.acceptedDirectAnswers ?? []).join(', '),
    explanation: question.explanation ?? '',
    source: question.source ?? '',
  }
}, { immediate: true })

const resetForm = () => { formData.value = createEmptyForm() }
const cancelEdit = () => { resetForm(); emit('cancel') }

const submitForm = () => {
  const options = formData.value.options.map((option) => option.trim())
  if (options.some((option) => !option)) { alert('Completa los cuatro incisos antes de guardar.'); return }
  const acceptedDirectAnswers = formData.value.acceptedDirectAnswersText.split(',').map((answer) => answer.trim()).filter(Boolean)

  emit('submit', {
    text: formData.value.text.trim(),
    rite: formData.value.rite,
    category: formData.value.category,
    difficulty: formData.value.difficulty,
    options,
    correctAnswer: formData.value.correctAnswer,
    directAnswer: formData.value.directAnswer.trim() || options[formData.value.correctAnswer],
    acceptedDirectAnswers,
    explanation: formData.value.explanation.trim() || undefined,
    source: formData.value.source.trim() || undefined,
  })
  if (!isEditing.value) resetForm()
}
</script>

<style scoped>
.question-form { background: linear-gradient(145deg,rgba(201,168,76,.08),rgba(26,10,0,.9)); border:1px solid #c9a84c; border-radius:14px; padding:24px; margin-bottom:24px; box-shadow:0 16px 45px rgba(0,0,0,.25); }
.form-title-row,.options-title,.points-preview { display:flex; align-items:center; justify-content:space-between; gap:12px; }
.question-form h2 { color:#c9a84c; margin:0; text-transform:uppercase; letter-spacing:1px; }
.form-help,.options-title span,.form-group small { color:rgba(240,230,200,.65); font-size:12px; }
.editing-badge { background:#c9a84c; color:#1a0a00; padding:6px 10px; border-radius:999px; font-size:12px; font-weight:800; }
.form { display:flex; flex-direction:column; gap:18px; margin-top:22px; }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:15px; }
.form-row.three { grid-template-columns:1.25fr 1fr 1fr; }
.form-group { display:flex; flex-direction:column; gap:7px; }
.form-group label { color:#f0e6c8; font-weight:600; font-size:14px; }
.form-input { padding:11px 12px; background:rgba(201,168,76,.08); border:1px solid #8b6914; border-radius:7px; color:#f0e6c8; font:inherit; }
.form-input:focus { outline:none; border-color:#c9a84c; box-shadow:0 0 0 3px rgba(201,168,76,.12); }
.textarea { min-height:95px; resize:vertical; } .explanation { min-height:70px; resize:vertical; }
.direct-answer-box { display:grid; gap:14px; padding:16px; border:1px dashed rgba(201,168,76,.6); border-radius:10px; background:rgba(201,168,76,.04); }
.option-input { display:grid; grid-template-columns:34px 1fr auto; align-items:center; gap:10px; margin-top:9px; }
.option-letter { width:32px; height:32px; border-radius:50%; display:grid; place-items:center; background:rgba(201,168,76,.16); color:#c9a84c; font-weight:800; }
.correct-answer-label { display:flex; align-items:center; gap:6px; border:1px solid #8b6914; border-radius:7px; padding:9px 10px; cursor:pointer; white-space:nowrap; }
.correct-answer-label.selected { border-color:#5fbb72; background:rgba(95,187,114,.12); color:#8be19b; }
.points-preview { padding:12px 16px; border-radius:10px; background:rgba(0,0,0,.22); color:#f0e6c8; } .points-preview strong { color:#c9a84c; }
.form-actions { display:flex; gap:10px; } .btn-submit,.btn-cancel { padding:12px 18px; border-radius:7px; font-weight:800; cursor:pointer; text-transform:uppercase; letter-spacing:.5px; }
.btn-submit { flex:1; border:none; background:linear-gradient(135deg,#d6b75f,#8b6914); color:#1a0a00; } .btn-cancel { border:1px solid #8b6914; background:transparent; color:#f0e6c8; }
@media (max-width:800px) { .form-row,.form-row.three { grid-template-columns:1fr; } .option-input { grid-template-columns:30px 1fr; } .correct-answer-label { grid-column:2; } .form-actions { flex-direction:column; } .points-preview { align-items:flex-start; flex-direction:column; } }
</style>
