<template>
  <div class="admin-view">
    <AdminPanel />
  </div>
</template>

<script setup lang="ts">
import AdminPanel from '@/modules/questions/admin/AdminPanel.vue'
</script>

<style scoped>
.admin-view {
  min-height: 100vh;
  padding: 20px;
}
</style>
