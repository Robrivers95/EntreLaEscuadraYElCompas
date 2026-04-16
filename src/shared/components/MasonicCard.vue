<template>
  <div class="masonic-card">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
}

defineProps<Props>()
</script>

<style scoped>
.masonic-card {
  background: rgba(201, 168, 76, 0.05);
  border: 2px solid #c9a84c;
  border-radius: 10px;
  padding: 20px;
  transition: all 0.3s ease;
}

.masonic-card:hover {
  box-shadow: 0 0 20px rgba(201, 168, 76, 0.2);
}
</style>
