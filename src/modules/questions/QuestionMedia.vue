<template>
  <figure v-if="question.imageUrl" class="question-media">
    <img :src="question.imageUrl" :alt="question.imageAlt || `Ilustración para: ${question.text}`" loading="lazy" />
  </figure>
</template>

<script setup lang="ts">
import type { Question } from './types'
defineProps<{ question: Question }>()
</script>

<style scoped>
.question-media{margin:0 0 15px;border:1px solid rgba(214,183,95,.28);border-radius:12px;overflow:hidden;background:#050b12;box-shadow:0 12px 28px rgba(0,0,0,.24)}
.question-media img{display:block;width:100%;max-height:330px;object-fit:contain;background:radial-gradient(circle at 50% 25%,rgba(33,78,108,.25),transparent 60%)}
</style>
