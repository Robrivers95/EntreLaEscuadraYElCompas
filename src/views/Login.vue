<template>
  <div class="login-view">
    <AuthLogin />
  </div>
</template>

<script setup lang="ts">
import AuthLogin from '@/modules/auth/AuthLogin.vue'
</script>

<style scoped>
.login-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a0a00 0%, #2d1500 100%);
}
</style>
