<template>
  <div class="board-cell" :style="{ backgroundColor: categoryColor }">
    <div class="cell-shine"></div>
    <div class="cell-category">{{ category }}</div>

    <div v-if="players.length" class="characters" :class="`count-${Math.min(players.length, 4)}`">
      <div
        v-for="(player, index) in players.slice(0, 4)"
        :key="player.index"
        class="player-character"
        :title="player.name"
        :style="{ animationDelay: `${index * 70}ms` }"
      >
        <div class="character-shadow"></div>
        <div class="character-head" :style="{ backgroundColor: player.color }">
          <span class="character-face">•‿•</span>
        </div>
        <div class="character-body" :style="{ backgroundColor: player.color }">
          <span>P{{ player.index + 1 }}</span>
        </div>
        <div class="character-legs">
          <span :style="{ backgroundColor: player.color }"></span>
          <span :style="{ backgroundColor: player.color }"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface BoardPlayerToken {
  index: number
  color: string
  name: string
}

interface Props {
  category: string
  players?: BoardPlayerToken[]
}

const props = withDefaults(defineProps<Props>(), {
  players: () => [],
})

const categoryColors: Record<string, string> = {
  Simbolismo: 'rgba(154, 86, 178, 0.30)',
  Herramientas: 'rgba(217, 132, 52, 0.28)',
  Filosofía: 'rgba(48, 110, 184, 0.28)',
  Historia: 'rgba(67, 145, 80, 0.28)',
  'Artes y Ciencias': 'rgba(211, 173, 52, 0.28)',
  Ceremonial: 'rgba(160, 65, 72, 0.28)',
  Geometría: 'rgba(211, 173, 52, 0.28)',
  Ética: 'rgba(190, 70, 130, 0.26)',
  Tradición: 'rgba(130, 73, 160, 0.28)',
}

const categoryColor = computed(() => categoryColors[props.category] || 'rgba(201, 168, 76, 0.18)')
</script>

<style scoped>
.board-cell {
  aspect-ratio: 1;
  border: 1px solid rgba(224, 197, 111, 0.78);
  border-radius: 11px;
  padding: 7px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  position: relative;
  cursor: pointer;
  min-height: 84px;
  overflow: visible;
  transform: perspective(500px) rotateX(5deg);
  transform-style: preserve-3d;
  box-shadow:
    inset 0 1px 0 rgba(255,255,255,.13),
    inset 0 -7px 16px rgba(0,0,0,.22),
    0 6px 12px rgba(0,0,0,.22);
  transition: transform .22s ease, box-shadow .22s ease, border-color .22s ease;
}

.board-cell:hover {
  transform: perspective(500px) rotateX(0) translateY(-4px) scale(1.035);
  border-color: #f0d77f;
  box-shadow: inset 0 1px rgba(255,255,255,.18), 0 12px 24px rgba(0,0,0,.32), 0 0 18px rgba(201,168,76,.2);
  z-index: 5;
}

.cell-shine {
  position: absolute;
  inset: 2px 3px auto;
  height: 26%;
  border-radius: 8px 8px 50% 50%;
  background: linear-gradient(180deg, rgba(255,255,255,.09), transparent);
  pointer-events: none;
}

.cell-category {
  color: #f5ebcf;
  font-weight: 800;
  font-size: 9px;
  line-height: 1.1;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: .35px;
  text-shadow: 0 1px 3px rgba(0,0,0,.8);
  z-index: 2;
}

.characters {
  position: absolute;
  left: 5px;
  right: 5px;
  bottom: 6px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 2px;
  min-height: 51px;
  transform: translateZ(18px);
  pointer-events: none;
}

.player-character {
  position: relative;
  width: 31px;
  height: 49px;
  transform-origin: 50% 100%;
  animation: characterArrive .55s cubic-bezier(.18,.86,.32,1.3) both, characterIdle 2.4s ease-in-out .7s infinite;
  filter: drop-shadow(0 4px 3px rgba(0,0,0,.35));
}

.count-3 .player-character,
.count-4 .player-character { transform: scale(.82); margin: 0 -3px; }

.character-shadow {
  position: absolute;
  width: 26px;
  height: 8px;
  left: 3px;
  bottom: -1px;
  border-radius: 50%;
  background: rgba(0,0,0,.38);
  filter: blur(2px);
  animation: shadowPulse 2.4s ease-in-out .7s infinite;
}

.character-head {
  position: absolute;
  top: 0;
  left: 7px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,.65);
  box-shadow: inset 4px 4px 6px rgba(255,255,255,.25), inset -4px -4px 6px rgba(0,0,0,.24), 0 2px 4px rgba(0,0,0,.25);
  z-index: 3;
}

.character-face {
  position: absolute;
  inset: 2px 0 0;
  display: grid;
  place-items: center;
  color: rgba(20,12,6,.75);
  font-size: 7px;
  font-weight: 900;
}

.character-body {
  position: absolute;
  top: 15px;
  left: 5px;
  width: 22px;
  height: 24px;
  border-radius: 8px 8px 6px 6px;
  border: 1px solid rgba(255,255,255,.45);
  box-shadow: inset 5px 2px 6px rgba(255,255,255,.2), inset -5px -3px 7px rgba(0,0,0,.28);
  display: grid;
  place-items: center;
  z-index: 2;
}

.character-body span { color: rgba(20,12,6,.82); font-size: 8px; font-weight: 900; }
.character-legs { position: absolute; bottom: 5px; left: 8px; display: flex; gap: 4px; z-index: 1; }
.character-legs span { width: 6px; height: 11px; border-radius: 0 0 4px 4px; box-shadow: inset -2px -2px 3px rgba(0,0,0,.25); }

@keyframes characterArrive {
  0% { opacity: 0; transform: translateY(-35px) rotateY(-50deg) scale(.72); }
  58% { opacity: 1; transform: translateY(3px) rotateY(12deg) scale(1.08); }
  78% { transform: translateY(-4px) rotateY(-5deg) scale(.98); }
  100% { opacity: 1; transform: translateY(0) rotateY(0) scale(1); }
}

@keyframes characterIdle {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  45% { transform: translateY(-2px) rotate(-1.5deg); }
  55% { transform: translateY(-2px) rotate(1.5deg); }
}

@keyframes shadowPulse {
  0%, 100% { transform: scaleX(1); opacity: .7; }
  50% { transform: scaleX(.82); opacity: .48; }
}

@media (max-width: 650px) {
  .board-cell { min-height: 72px; padding: 5px; }
  .cell-category { font-size: 7px; }
  .characters { transform: scale(.88) translateZ(14px); transform-origin: bottom center; }
}
</style>
