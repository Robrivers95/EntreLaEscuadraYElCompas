<template>
  <div class="question-form">
    <h2>{{ isEditing ? 'Editar Pregunta' : 'Nueva Pregunta' }}</h2>

    <form @submit.prevent="submitForm" class="form">
      <div class="form-group">
        <label for="text">Texto de la Pregunta</label>
        <textarea
          id="text"
          v-model="formData.text"
          placeholder="Ingresa la pregunta..."
          required
          class="form-input textarea"
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="category">Categoría</label>
          <input
            id="category"
            v-model="formData.category"
            type="text"
            placeholder="Ej: Historia, Filosofía"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="difficulty">Dificultad</label>
          <select v-model="formData.difficulty" id="difficulty" required class="form-input">
            <option value="aprendiz">Aprendiz (Fácil)</option>
            <option value="compañero">Compañero (Medio)</option>
            <option value="maestro">Maestro (Difícil)</option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label>Opciones de Respuesta</label>
        <div v-for="(_option, index) in formData.options" :key="index" class="option-input">
          <input
            v-model="formData.options[index]"
            type="text"
            :placeholder="`Opción ${index + 1}`"
            required
            class="form-input"
          />
          <label class="correct-answer-label">
            <input
              type="radio"
              :name="'correct-answer'"
              :value="index"
              v-model.number="formData.correctAnswer"
            />
            Respuesta Correcta
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-submit">
          {{ isEditing ? 'Actualizar' : 'Guardar' }} Pregunta
        </button>
        <button type="button" @click="$emit('cancel')" class="btn-cancel">Cancelar</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Question } from '@/modules/questions/types'

interface Props {
  editingQuestion?: Question | null
}

interface Emits {
  (e: 'submit', question: Omit<Question, 'id' | 'createdAt'>): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const isEditing = ref(!!props.editingQuestion)

const formData = ref({
  text: '',
  category: '',
  difficulty: 'aprendiz' as 'aprendiz' | 'compañero' | 'maestro',
  options: ['', '', '', ''],
  correctAnswer: 0,
})

watch(() => props.editingQuestion, (newQuestion) => {
  if (newQuestion) {
    formData.value = { ...newQuestion }
    isEditing.value = true
  } else {
    resetForm()
    isEditing.value = false
  }
})

const resetForm = () => {
  formData.value = {
    text: '',
    category: '',
    difficulty: 'aprendiz',
    options: ['', '', '', ''],
    correctAnswer: 0,
  }
}

const submitForm = () => {
  if (formData.value.options.some((opt) => !opt)) {
    alert('Todas las opciones deben estar completas')
    return
  }

  emit('submit', {
    text: formData.value.text,
    category: formData.value.category,
    difficulty: formData.value.difficulty,
    options: formData.value.options,
    correctAnswer: formData.value.correctAnswer,
  })

  resetForm()
}
</script>

<style scoped>
.question-form {
  background: rgba(201, 168, 76, 0.05);
  border: 1px solid #c9a84c;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.question-form h2 {
  color: #c9a84c;
  margin-top: 0;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  color: #f0e6c8;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  padding: 10px 12px;
  background: rgba(201, 168, 76, 0.1);
  border: 1px solid #8b6914;
  border-radius: 5px;
  color: #f0e6c8;
  font-size: 14px;
  transition: all 0.3s ease;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  background: rgba(201, 168, 76, 0.2);
  border-color: #c9a84c;
  box-shadow: 0 0 5px rgba(201, 168, 76, 0.3);
}

.textarea {
  resize: vertical;
  min-height: 100px;
}

.option-input {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
}

.option-input .form-input {
  flex: 1;
}

.correct-answer-label {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #f0e6c8;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}

.correct-answer-label input[type='radio'] {
  cursor: pointer;
  width: 16px;
  height: 16px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn-submit,
.btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 1px;
}

.btn-submit {
  background: linear-gradient(135deg, #c9a84c 0%, #8b6914 100%);
  color: #1a0a00;
  flex: 1;
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(201, 168, 76, 0.3);
}

.btn-cancel {
  background: rgba(201, 168, 76, 0.2);
  color: #f0e6c8;
  border: 1px solid #8b6914;
}

.btn-cancel:hover {
  background: rgba(201, 168, 76, 0.3);
}
</style>
