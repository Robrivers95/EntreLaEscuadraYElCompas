<template>
  <div class="masonic-seal" :class="[`seal-${tone}`, { compact }]" :style="sealStyle" aria-hidden="true">
    <div class="seal-rays"></div>
    <div class="seal-ring outer"></div>
    <div class="seal-ring inner"></div>
    <div class="compass">
      <span class="compass-leg left"></span>
      <span class="compass-leg right"></span>
      <span class="compass-cap"></span>
    </div>
    <div class="square-mark">
      <span class="square-leg horizontal"></span>
      <span class="square-leg diagonal"></span>
    </div>
    <span class="seal-g">G</span>
    <span class="seal-star top">✦</span>
    <span class="seal-star bottom">✦</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: number
  tone?: 'gold' | 'ivory' | 'muted'
  compact?: boolean
}>(), {
  size: 150,
  tone: 'gold',
  compact: false,
})

const sealStyle = computed(() => ({ '--seal-size': `${props.size}px` }))
</script>

<style scoped>
.masonic-seal {
  --seal-size: 150px;
  --seal-color: #d5b761;
  --seal-soft: rgba(213, 183, 97, .2);
  position: relative;
  width: var(--seal-size);
  height: var(--seal-size);
  flex: 0 0 var(--seal-size);
  filter: drop-shadow(0 10px 24px rgba(0, 0, 0, .42));
}
.seal-ivory { --seal-color: #efe5ca; --seal-soft: rgba(239, 229, 202, .18); }
.seal-muted { --seal-color: #8d7a4b; --seal-soft: rgba(141, 122, 75, .13); }
.seal-rays {
  position: absolute;
  inset: 3%;
  border-radius: 50%;
  opacity: .42;
  background: repeating-conic-gradient(from 0deg, transparent 0deg 8deg, var(--seal-soft) 8deg 10deg);
  mask: radial-gradient(circle, transparent 0 48%, #000 49% 100%);
}
.seal-ring {
  position: absolute;
  border-radius: 50%;
  border: 1px solid var(--seal-color);
}
.seal-ring.outer { inset: 11%; box-shadow: inset 0 0 0 5px rgba(213,183,97,.035), 0 0 18px rgba(213,183,97,.1); }
.seal-ring.inner { inset: 20%; border-color: color-mix(in srgb, var(--seal-color) 70%, transparent); }
.compass,
.square-mark { position: absolute; inset: 0; }
.compass-leg {
  position: absolute;
  top: 28%;
  width: 4.2%;
  height: 50%;
  border-radius: 999px;
  background: linear-gradient(180deg, #f3dc8a, var(--seal-color) 48%, #725415);
  transform-origin: 50% 8%;
  box-shadow: 0 0 9px rgba(213,183,97,.18);
}
.compass-leg.left { left: 48%; transform: rotate(27deg); }
.compass-leg.right { right: 48%; transform: rotate(-27deg); }
.compass-cap {
  position: absolute;
  top: 23.5%;
  left: 50%;
  width: 13%;
  height: 13%;
  transform: translateX(-50%);
  border: 2px solid var(--seal-color);
  border-radius: 50%;
  background: #0b1019;
  box-shadow: 0 0 0 4px rgba(213,183,97,.08);
}
.square-leg {
  position: absolute;
  left: 50%;
  bottom: 26%;
  height: 4.5%;
  transform-origin: 0 50%;
  border-radius: 999px;
  background: linear-gradient(90deg, #6d5118, var(--seal-color), #f2d987);
}
.square-leg.horizontal { width: 37%; transform: translateX(-50%); }
.square-leg.diagonal { width: 37%; transform: translateX(-50%) rotate(-62deg); }
.seal-g {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  padding-top: 8%;
  color: var(--seal-color);
  font-family: Georgia, 'Times New Roman', serif;
  font-size: calc(var(--seal-size) * .27);
  font-weight: 700;
  text-shadow: 0 2px 12px rgba(213,183,97,.28);
}
.seal-star {
  position: absolute;
  left: 50%;
  color: var(--seal-color);
  font-size: calc(var(--seal-size) * .07);
  transform: translateX(-50%);
  opacity: .8;
}
.seal-star.top { top: 13%; }
.seal-star.bottom { bottom: 12%; }
.compact .seal-rays { display: none; }
</style>
