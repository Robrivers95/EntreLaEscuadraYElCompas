<template>
  <div class="question-card">
    <div class="question-header">
      <div class="difficulty-badge" :class="question.difficulty">
        {{ difficultyLabel(question.difficulty) }}
      </div>
      <div class="category-badge">{{ question.category }}</div>
    </div>

    <div class="question-content">
      <h3>{{ question.text }}</h3>

      <div class="options-container">
        <button
          v-for="(option, index) in question.options"
          :key="index"
          class="option-button"
          :class="{ selected: selectedOption === index }"
          @click="selectOption(index)"
        >
          {{ String.fromCharCode(65 + index) }}. {{ option }}
        </button>
      </div>
    </div>

    <div class="card-actions">
      <button @click="handleSubmit" :disabled="selectedOption === null" class="btn-submit">
        Responder
      </button>
      <button @click="$emit('skip')" class="btn-skip">Saltar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Question } from '@/modules/questions/types'

interface Props {
  question: Question
}

interface Emits {
  (e: 'answer', answerIndex: number): void
  (e: 'skip'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedOption = ref<number | null>(null)

const selectOption = (index: number) => {
  selectedOption.value = index
}

const handleSubmit = () => {
  if (selectedOption.value !== null) {
    emit('answer', selectedOption.value)
  }
}


const difficultyLabel = (difficulty: string): string => {
  const labels: Record<string, string> = {
    aprendiz: 'Aprendiz',
    compañero: 'Compañero',
    maestro: 'Maestro',
  }
  return labels[difficulty] || difficulty
}
</script>

<style scoped>
.question-card {
  background: rgba(201, 168, 76, 0.05);
  border: 2px solid #c9a84c;
  border-radius: 10px;
  padding: 25px;
  max-width: 500px;
  margin: 20px auto;
}

.question-header {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.difficulty-badge,
.category-badge {
  padding: 6px 12px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  border: none;
}

.difficulty-badge {
  flex: 1;
}

.difficulty-badge.aprendiz {
  background: rgba(76, 175, 80, 0.8);
}

.difficulty-badge.compañero {
  background: rgba(255, 193, 7, 0.8);
}

.difficulty-badge.maestro {
  background: rgba(244, 67, 54, 0.8);
}

.category-badge {
  background: rgba(139, 105, 20, 0.5);
  color: #f0e6c8;
  border: 1px solid #8b6914;
}

.question-content {
  margin: 20px 0;
}

.question-content h3 {
  color: #f0e6c8;
  margin: 0 0 20px 0;
  font-size: 18px;
  line-height: 1.4;
}

.options-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-button {
  background: rgba(139, 105, 20, 0.2);
  border: 2px solid #8b6914;
  border-radius: 8px;
  padding: 15px;
  color: #f0e6c8;
  text-align: left;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.option-button:hover {
  border-color: #c9a84c;
  background: rgba(201, 168, 76, 0.15);
}

.option-button.selected {
  background: rgba(201, 168, 76, 0.3);
  border-color: #c9a84c;
  box-shadow: 0 0 10px rgba(201, 168, 76, 0.3);
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-submit,
.btn-skip {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.btn-submit {
  background: linear-gradient(135deg, #c9a84c 0%, #8b6914 100%);
  color: #1a0a00;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(201, 168, 76, 0.3);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-skip {
  background: rgba(201, 168, 76, 0.2);
  color: #f0e6c8;
  border: 1px solid #8b6914;
}

.btn-skip:hover {
  background: rgba(201, 168, 76, 0.3);
}
</style>
