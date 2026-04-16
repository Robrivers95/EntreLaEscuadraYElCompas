<template>
  <div class="game-board">
    <div class="board-container">
      <div class="board-grid">
        <BoardCell
          v-for="(cell, index) in boardCells"
          :key="index"
          :category="cell.category"
          :player-index="getPlayerAtPosition(index)"
          :player-color="getPlayerColor(getPlayerAtPosition(index))"
          @click="$emit('cell-click', cell)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BoardCell from './BoardCell.vue'
import type { Player, BoardCell as BoardCellType } from '@/modules/game/types'

interface Props {
  players: Player[]
  boardSize: number
  categories: string[]
}

const props = defineProps<Props>()
defineEmits<{
  (e: 'cell-click', cell: BoardCellType): void
}>()

const boardCells = computed(() => {
  const cells: BoardCellType[] = []
  const cols = Math.ceil(Math.sqrt(props.boardSize))
  let categoryIndex = 0

  for (let i = 0; i < props.boardSize; i++) {
    cells.push({
      id: i,
      x: i % cols,
      y: Math.floor(i / cols),
      category: props.categories[categoryIndex % props.categories.length],
    })
    categoryIndex++
  }

  return cells
})

const getPlayerAtPosition = (position: number): number | undefined => {
  const player = props.players.find((p: Player) => p.position === position)
  return player ? props.players.indexOf(player) : undefined
}

const playerColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']

const getPlayerColor = (playerIndex: number | undefined): string => {
  if (playerIndex === undefined) return ''
  return playerColors[playerIndex % playerColors.length]
}
</script>

<style scoped>
.game-board {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.board-container {
  width: 100%;
  max-width: 600px;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 10px;
  padding: 20px;
  background: rgba(26, 10, 0, 0.5);
  border: 3px solid #c9a84c;
  border-radius: 10px;
}
</style>
