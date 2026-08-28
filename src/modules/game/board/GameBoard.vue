<template>
  <div class="game-board" :class="`rite-${rite}`">
    <div v-if="rite === 'kabala'" class="kabbalah-shell">
      <div class="kabbalah-title">
        <span>✦ Kabbalah</span>
        <strong>Árbol de la Vida</strong>
        <small>Ascenso de Malkhut a Keter</small>
      </div>

      <div class="tree-canvas">
        <svg class="tree-lines" viewBox="0 0 100 108" preserveAspectRatio="none" aria-hidden="true">
          <line v-for="edge in treeEdges" :key="edge.join('-')" :x1="nodeByName(edge[0]).x" :y1="nodeByName(edge[0]).y" :x2="nodeByName(edge[1]).x" :y2="nodeByName(edge[1]).y" />
        </svg>

        <div
          v-for="node in treeNodes"
          :key="node.name"
          class="sefirah"
          :class="{ occupied: getPlayersAtPosition(node.position).length > 0 }"
          :style="{ left: `${node.x}%`, top: `${node.y}%` }"
        >
          <div class="sefirah-ring"></div>
          <div class="sefirah-core">
            <span>{{ node.position + 1 }}</span>
            <strong>{{ node.name }}</strong>
          </div>
          <div v-if="getPlayersAtPosition(node.position).length" class="tree-players">
            <span
              v-for="player in getPlayersAtPosition(node.position)"
              :key="player.index"
              class="tree-token"
              :title="player.name"
              :style="{ backgroundColor: player.color }"
            >{{ player.index + 1 }}</span>
          </div>
        </div>

        <div class="tree-start">
          <span>Inicio</span>
          <div class="tree-players start-players">
            <span
              v-for="player in getPlayersAtPosition(-1)"
              :key="player.index"
              class="tree-token"
              :title="player.name"
              :style="{ backgroundColor: player.color }"
            >{{ player.index + 1 }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="rite === 'reaa'" class="reaa-board">
      <div class="reaa-frame">
        <div class="perimeter-side side-bottom">
          <BoardCell v-for="cell in reaaBottom" :key="cell.id" :category="cell.category" :players="getPlayersAtPosition(cell.id)" @click="$emit('cell-click', cell)" />
        </div>
        <div class="perimeter-side side-right">
          <BoardCell v-for="cell in reaaRight" :key="cell.id" :category="cell.category" :players="getPlayersAtPosition(cell.id)" @click="$emit('cell-click', cell)" />
        </div>
        <div class="perimeter-side side-top">
          <BoardCell v-for="cell in reaaTop" :key="cell.id" :category="cell.category" :players="getPlayersAtPosition(cell.id)" @click="$emit('cell-click', cell)" />
        </div>
        <div class="perimeter-side side-left">
          <BoardCell v-for="cell in reaaLeft" :key="cell.id" :category="cell.category" :players="getPlayersAtPosition(cell.id)" @click="$emit('cell-click', cell)" />
        </div>

        <div class="reaa-center">
          <div class="reaa-seal">△ <b>G</b> □</div>
          <span>Rito Escocés Antiguo y Aceptado</span>
          <strong>33 casillas</strong>
          <small>Recorrido perimetral</small>
        </div>
      </div>
    </div>

    <div v-else class="board-container">
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
import type { MasonicRite } from '@/modules/questions/types'

interface Props {
  players: Player[]
  boardSize: number
  categories: string[]
  rite?: MasonicRite
}

const props = withDefaults(defineProps<Props>(), {
  rite: 'reaa',
})

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
      category: props.categories[i % Math.max(props.categories.length, 1)] || 'Pregunta',
    })
  }

  return cells
})

const reaaCells = computed(() => boardCells.value.slice(0, 33))
const reaaBottom = computed(() => reaaCells.value.slice(0, 9))
const reaaRight = computed(() => reaaCells.value.slice(9, 17))
const reaaTop = computed(() => [...reaaCells.value.slice(17, 25)].reverse())
const reaaLeft = computed(() => [...reaaCells.value.slice(25, 33)].reverse())

const treeNodes = [
  { name: 'Keter', position: 9, x: 50, y: 7 },
  { name: 'Binah', position: 7, x: 28, y: 22 },
  { name: 'Chokhmah', position: 8, x: 72, y: 22 },
  { name: 'Gevurah', position: 5, x: 28, y: 42 },
  { name: 'Chesed', position: 6, x: 72, y: 42 },
  { name: 'Tiferet', position: 4, x: 50, y: 55 },
  { name: 'Hod', position: 2, x: 28, y: 70 },
  { name: 'Netzach', position: 3, x: 72, y: 70 },
  { name: 'Yesod', position: 1, x: 50, y: 84 },
  { name: 'Malkhut', position: 0, x: 50, y: 98 },
] as const

const treeEdges: Array<[string, string]> = [
  ['Keter', 'Binah'], ['Keter', 'Chokhmah'], ['Keter', 'Tiferet'],
  ['Binah', 'Chokhmah'], ['Binah', 'Gevurah'], ['Binah', 'Tiferet'],
  ['Chokhmah', 'Chesed'], ['Chokhmah', 'Tiferet'],
  ['Gevurah', 'Chesed'], ['Gevurah', 'Tiferet'], ['Gevurah', 'Hod'],
  ['Chesed', 'Tiferet'], ['Chesed', 'Netzach'],
  ['Tiferet', 'Hod'], ['Tiferet', 'Netzach'], ['Tiferet', 'Yesod'],
  ['Hod', 'Netzach'], ['Hod', 'Yesod'], ['Netzach', 'Yesod'],
  ['Yesod', 'Malkhut'],
]

const nodeByName = (name: string) => treeNodes.find((node) => node.name === name) ?? treeNodes[0]

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
    .map((player) => ({ index: player.index, name: player.name, color: player.color }))
}
</script>

<style scoped>
.game-board{display:flex;justify-content:center;align-items:center;padding:12px;width:100%;box-sizing:border-box}.board-container{width:100%;max-width:690px}.board-frame{padding:17px;border:2px solid #c9a84c;border-radius:18px;background:radial-gradient(circle at 50% 35%,rgba(201,168,76,.10),transparent 45%),linear-gradient(145deg,rgba(74,35,10,.88),rgba(20,9,4,.97));box-shadow:inset 0 0 0 5px rgba(73,42,18,.7),inset 0 0 40px rgba(0,0,0,.42),0 25px 55px rgba(0,0,0,.42)}.board-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(82px,1fr));gap:9px;padding:8px;border-radius:12px;background-image:linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);background-size:22px 22px}

.reaa-board{width:100%;max-width:760px;aspect-ratio:1}.reaa-frame{position:relative;width:100%;height:100%;border:3px solid #d6b75f;border-radius:22px;background:radial-gradient(circle at center,rgba(21,57,76,.95),rgba(5,13,22,.98) 60%),linear-gradient(145deg,#4c270e,#170b04);box-shadow:inset 0 0 0 7px rgba(79,44,18,.8),inset 0 0 55px rgba(0,0,0,.5),0 26px 65px rgba(0,0,0,.45);overflow:hidden}.perimeter-side{position:absolute;display:grid;gap:5px;z-index:2}.side-bottom{left:1.5%;right:1.5%;bottom:1.5%;grid-template-columns:repeat(9,1fr)}.side-top{left:12.5%;right:12.5%;top:1.5%;grid-template-columns:repeat(8,1fr)}.side-left{left:1.5%;top:12.5%;bottom:12.5%;width:10%;grid-template-rows:repeat(8,1fr)}.side-right{right:1.5%;top:12.5%;bottom:12.5%;width:10%;grid-template-rows:repeat(8,1fr)}.side-left :deep(.board-cell),.side-right :deep(.board-cell){min-height:0;height:100%;aspect-ratio:auto;padding:4px}.side-left :deep(.cell-category),.side-right :deep(.cell-category){font-size:6.5px}.side-top :deep(.board-cell),.side-bottom :deep(.board-cell){min-height:0;aspect-ratio:1}.reaa-center{position:absolute;inset:17%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px solid rgba(214,183,95,.28);border-radius:18px;background:radial-gradient(circle,rgba(214,183,95,.1),transparent 62%)}.reaa-center span{font:700 clamp(13px,2vw,22px) Georgia,serif;letter-spacing:.08em;color:#ead89b;text-transform:uppercase}.reaa-center strong{margin-top:7px;font:900 clamp(24px,4vw,48px) Georgia,serif;color:#d6b75f}.reaa-center small{color:rgba(238,224,194,.55);letter-spacing:.16em;text-transform:uppercase}.reaa-seal{font:900 clamp(30px,6vw,72px) Georgia,serif;color:rgba(214,183,95,.78);margin-bottom:13px}.reaa-seal b{color:#f4df99}

.kabbalah-shell{width:100%;max-width:660px;padding:18px 20px 26px;border:2px solid #c7ab60;border-radius:24px;background:radial-gradient(circle at 50% 35%,rgba(58,123,118,.18),transparent 36%),radial-gradient(circle at 50% 5%,rgba(218,189,101,.13),transparent 28%),linear-gradient(180deg,#07141d,#03080d);box-shadow:inset 0 0 45px rgba(0,0,0,.5),0 26px 62px rgba(0,0,0,.44)}.kabbalah-title{text-align:center;display:flex;flex-direction:column;gap:3px;margin-bottom:8px}.kabbalah-title span{color:#c7ab60;text-transform:uppercase;letter-spacing:.2em;font-size:11px}.kabbalah-title strong{color:#f0dda1;font:800 29px Georgia,serif}.kabbalah-title small{color:rgba(238,224,194,.48);letter-spacing:.08em}.tree-canvas{position:relative;height:min(780px,115vw);min-height:570px;margin:0 auto;max-width:540px}.tree-lines{position:absolute;inset:2% 0 0;width:100%;height:96%;overflow:visible}.tree-lines line{stroke:rgba(202,174,92,.38);stroke-width:.55;filter:drop-shadow(0 0 2px rgba(201,168,76,.2))}.sefirah{position:absolute;width:88px;height:88px;transform:translate(-50%,-50%);display:grid;place-items:center;z-index:2}.sefirah-ring{position:absolute;inset:0;border-radius:50%;border:1px solid rgba(221,195,113,.62);background:radial-gradient(circle,rgba(206,177,87,.18),rgba(17,54,62,.62) 58%,rgba(2,8,12,.96) 72%);box-shadow:0 0 18px rgba(207,176,82,.16),inset 0 0 14px rgba(255,255,255,.04)}.sefirah.occupied .sefirah-ring{border-color:#f1d77d;box-shadow:0 0 28px rgba(224,194,102,.32),inset 0 0 16px rgba(224,194,102,.12)}.sefirah-core{position:relative;z-index:2;text-align:center;display:flex;flex-direction:column}.sefirah-core span{font-size:9px;color:rgba(235,217,159,.55)}.sefirah-core strong{font:700 13px Georgia,serif;color:#f1dda0}.tree-players{position:absolute;z-index:5;display:flex;gap:3px;bottom:-5px;left:50%;transform:translateX(-50%)}.tree-token{width:22px;height:22px;border:2px solid #f4e4b5;border-radius:50%;display:grid;place-items:center;color:#071019;font-size:9px;font-weight:900;box-shadow:0 3px 8px rgba(0,0,0,.4)}.tree-start{position:absolute;left:50%;bottom:-17px;transform:translateX(-50%);min-width:110px;text-align:center;padding:7px 10px;border:1px dashed rgba(201,168,76,.35);border-radius:999px;color:rgba(238,224,194,.55);font-size:9px;letter-spacing:.12em;text-transform:uppercase}.start-players{bottom:-25px}

@media(max-width:720px){.game-board{padding:4px}.board-frame{padding:8px}.board-grid{grid-template-columns:repeat(auto-fit,minmax(68px,1fr));gap:5px;padding:3px}.reaa-frame{border-radius:13px}.perimeter-side{gap:2px}.side-left :deep(.cell-category),.side-right :deep(.cell-category),.side-top :deep(.cell-category),.side-bottom :deep(.cell-category){font-size:5.5px}.side-left :deep(.characters),.side-right :deep(.characters){transform:scale(.62);transform-origin:bottom center}.reaa-center{inset:18%}.kabbalah-shell{padding:14px 8px 24px}.tree-canvas{min-height:520px}.sefirah{width:70px;height:70px}.sefirah-core strong{font-size:11px}.tree-token{width:19px;height:19px}}
</style>
