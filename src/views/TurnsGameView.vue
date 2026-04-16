<template>
  <div class="turns-game-view">
    <TurnsGame />
  </div>
</template>

<script setup lang="ts">
import TurnsGame from '@/modules/game/modes/turns/TurnsGame.vue'
</script>

<style scoped>
.turns-game-view {
  min-height: 100vh;
}
</style>
