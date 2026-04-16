<template>
  <div class="category-selector">
    <h2>⧖ Selecciona las Categorías del Juego</h2>
    <p>Elige qué categorías aparecerán en el tablero</p>

    <div class="categories-grid">
      <div
        v-for="category in availableCategories"
        :key="category"
        class="category-option"
        :class="{ selected: selectedCategories.includes(category) }"
        @click="toggleCategory(category)"
      >
        <input
          type="checkbox"
          :checked="selectedCategories.includes(category)"
          @change="toggleCategory(category)"
        />
        <label>{{ category }}</label>
      </div>
    </div>

    <div class="selector-info">
      <p>{{ selectedCategories.length }} de {{ availableCategories.length }} categorías seleccionadas</p>
    </div>

    <div class="selector-actions">
      <button
        @click="$emit('start')"
        :disabled="selectedCategories.length === 0"
        class="btn-start"
      >
        △ Comenzar Juego
      </button>
      <button @click="$emit('cancel')" class="btn-cancel">Cancelar</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  availableCategories: string[]
}

interface Emits {
  (e: 'start'): void
  (e: 'cancel'): void
  (e: 'update:selectedCategories', categories: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedCategories = ref<string[]>([...props.availableCategories.slice(0, 3)])

const toggleCategory = (category: string) => {
  const index = selectedCategories.value.indexOf(category)
  if (index === -1) {
    selectedCategories.value.push(category)
  } else {
    selectedCategories.value.splice(index, 1)
  }
  emit('update:selectedCategories', selectedCategories.value)
}
</script>

<style scoped>
.category-selector {
  background: rgba(201, 168, 76, 0.05);
  border: 2px solid #c9a84c;
  border-radius: 10px;
  padding: 30px;
  max-width: 600px;
  margin: 0 auto;
}

.category-selector h2 {
  color: #c9a84c;
  margin-top: 0;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.category-selector p {
  color: #f0e6c8;
  text-align: center;
  margin: 0 0 20px 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.category-option {
  background: rgba(139, 105, 20, 0.2);
  border: 2px solid #8b6914;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
}

.category-option:hover {
  border-color: #c9a84c;
  background: rgba(201, 168, 76, 0.15);
}

.category-option.selected {
  background: rgba(201, 168, 76, 0.3);
  border-color: #c9a84c;
}

.category-option input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #c9a84c;
}

.category-option label {
  color: #f0e6c8;
  cursor: pointer;
  flex: 1;
  margin: 0;
  font-weight: 500;
}

.selector-info {
  text-align: center;
  color: #8b6914;
  margin: 20px 0;
  font-size: 14px;
}

.selector-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-start,
.btn-cancel {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-start {
  background: linear-gradient(135deg, #c9a84c 0%, #8b6914 100%);
  color: #1a0a00;
}

.btn-start:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(201, 168, 76, 0.4);
}

.btn-start:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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
