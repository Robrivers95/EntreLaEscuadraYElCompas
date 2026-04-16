<template>
  <div class="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
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
  background-color: #1a0a00;
  color: #f0e6c8;
}
</style>
