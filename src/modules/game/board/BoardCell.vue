<template>
  <div class="board-cell" :style="{ backgroundColor: categoryColor }">
    <div class="cell-category">{{ category }}</div>
    <div v-if="playerIndex !== undefined" class="player-piece" :style="{ backgroundColor: playerColor }">
      P{{ playerIndex + 1 }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  category: string
  playerIndex?: number
  playerColor?: string
}

const props = withDefaults(defineProps<Props>(), {
  playerIndex: undefined,
  playerColor: '#c9a84c',
})

const categoryColors: Record<string, string> = {
  Historia: 'rgba(76, 175, 80, 0.3)',
  Filosofía: 'rgba(33, 150, 243, 0.3)',
  Geometría: 'rgba(255, 193, 7, 0.3)',
  Ética: 'rgba(233, 30, 99, 0.3)',
  Tradición: 'rgba(156, 39, 176, 0.3)',
  Simbolismo: 'rgba(255, 87, 34, 0.3)',
}

const categoryColor = computed(() => {
  return categoryColors[props.category] || 'rgba(201, 168, 76, 0.2)'
})

const playerColor = computed(() => props.playerColor)
</script>

<style scoped>
.board-cell {
  aspect-ratio: 1;
  border: 2px solid #c9a84c;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 80px;
}

.board-cell:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(201, 168, 76, 0.5);
}

.cell-category {
  color: #f0e6c8;
  font-weight: bold;
  font-size: 12px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.player-piece {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a0a00;
  font-weight: bold;
  font-size: 11px;
  border: 2px solid #f0e6c8;
}
</style>
