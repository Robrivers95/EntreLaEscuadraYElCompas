<template>
  <div class="game-board">
    <div class="board-container">
      <div class="board-frame">
        <div class="board-grid">
          <BoardCell
            v-for="cell in boardCells"
            :key="cell.id"
            :category="cell.category"
            :players="getPlayersAtPosition(cell.id)"
            @click="$emit('cell-click', cell)"
          />
        </div>
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

  for (let i = 0; i < props.boardSize; i++) {
    cells.push({
      id: i,
      x: i % cols,
      y: Math.floor(i / cols),
      category: props.categories[i % props.categories.length],
    })
  }

  return cells
})

const fallbackColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#C7A75A', '#B37FD6', '#F09A55', '#73B873']

const getPlayersAtPosition = (position: number) => {
  return props.players
    .map((player, index) => ({
      index,
      name: player.name,
      color: player.color || fallbackColors[index % fallbackColors.length],
      playerPosition: player.position,
    }))
    .filter((player) => player.playerPosition === position)
    .map((player) => ({
      index: player.index,
      name: player.name,
      color: player.color,
    }))
}
</script>

<style scoped>
.game-board {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 18px;
  perspective: 1100px;
}

.board-container {
  width: 100%;
  max-width: 690px;
}

.board-frame {
  padding: 17px;
  border: 2px solid #c9a84c;
  border-radius: 18px;
  background:
    radial-gradient(circle at 50% 35%, rgba(201,168,76,.10), transparent 45%),
    linear-gradient(145deg, rgba(74,35,10,.88), rgba(20,9,4,.97));
  box-shadow:
    inset 0 0 0 5px rgba(73,42,18,.7),
    inset 0 0 40px rgba(0,0,0,.42),
    0 25px 55px rgba(0,0,0,.42);
  transform: rotateX(2deg);
  transform-style: preserve-3d;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(82px, 1fr));
  gap: 9px;
  padding: 8px;
  border-radius: 12px;
  background-image:
    linear-gradient(rgba(255,255,255,.018) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.018) 1px, transparent 1px);
  background-size: 22px 22px;
}

@media (max-width: 650px) {
  .game-board { padding: 5px; }
  .board-frame { padding: 8px; border-radius: 12px; }
  .board-grid { grid-template-columns: repeat(auto-fit, minmax(68px, 1fr)); gap: 5px; padding: 3px; }
}
</style>
