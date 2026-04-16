<template>
  <div class="realtime-game-view">
    <RealtimeGame />
  </div>
</template>

<script setup lang="ts">
import RealtimeGame from '@/modules/game/modes/realtime/RealtimeGame.vue'
</script>

<style scoped>
.realtime-game-view {
  min-height: 100vh;
}
</style>
