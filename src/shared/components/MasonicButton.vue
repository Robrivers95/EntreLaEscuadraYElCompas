<template>
  <button :class="['masonic-button', `btn-${variant}`, { disabled: disabled }]" :disabled="disabled">
    <slot />
  </button>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  disabled: false,
})
</script>

<style scoped>
.masonic-button {
  padding: 12px 24px;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 14px;
}

.btn-primary {
  background: linear-gradient(135deg, #c9a84c 0%, #8b6914 100%);
  color: #1a0a00;
}

.btn-primary:hover:not(.disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(201, 168, 76, 0.4);
}

.btn-secondary {
  background: rgba(201, 168, 76, 0.2);
  color: #f0e6c8;
  border: 1px solid #8b6914;
}

.btn-secondary:hover:not(.disabled) {
  background: rgba(201, 168, 76, 0.3);
}

.btn-danger {
  background: rgba(244, 67, 54, 0.3);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
}

.btn-danger:hover:not(.disabled) {
  background: #ff6b6b;
  color: white;
}

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
