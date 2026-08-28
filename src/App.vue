<template>
  <div class="app" :class="{ 'with-dock': showDock }">
    <AppDock v-if="showDock" />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import '@/shared/premium-game-ui.css'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppDock from '@/shared/AppDock.vue'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()
const immersiveRoutes = new Set(['/', '/login', '/reteje', '/game/turns', '/game/realtime'])
const showDock = computed(() => authStore.isAuthenticated && !immersiveRoutes.has(route.path))

onMounted(() => {
  authStore.initializeAuth()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  color: var(--masonic-text);
  transition: padding .2s ease;
}
.app.with-dock { padding-left: 88px; }
@media (max-width: 800px) {
  .app.with-dock { padding-left: 0; padding-bottom: 78px; }
}
</style>
