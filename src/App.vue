<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import '@/shared/premium-game-ui.css'
import { useAuthStore } from '@/stores/authStore'
import { onMounted } from 'vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initializeAuth()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  color: var(--masonic-text);
}
</style>
