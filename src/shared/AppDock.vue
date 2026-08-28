<template>
  <aside class="app-dock" aria-label="Navegación principal">
    <div class="dock-brand" title="Entre la Escuadra y el Compás">
      <span class="brand-mark">△</span><b>G</b><span class="brand-mark">□</span>
    </div>

    <nav class="dock-nav">
      <RouterLink to="/lobby" class="dock-item" :class="{ active: route.path === '/lobby' }">
        <span class="dock-icon">⌂</span><small>Lobby</small>
      </RouterLink>
      <RouterLink to="/lobby" class="dock-item" :class="{ active: route.path === '/game/turns' }">
        <span class="dock-icon">🎲</span><small>Maratón</small>
      </RouterLink>
      <RouterLink to="/duels" class="dock-item" :class="{ active: route.path === '/duels' }">
        <span class="dock-icon">⚔</span><small>1 vs 1</small>
      </RouterLink>
      <RouterLink to="/study" class="dock-item" :class="{ active: route.path === '/study' }">
        <span class="dock-icon">◈</span><small>Estudio</small>
      </RouterLink>
      <RouterLink to="/messages" class="dock-item" :class="{ active: route.path === '/messages' }">
        <span class="dock-icon">💬</span><small>Mensajes</small>
      </RouterLink>
      <RouterLink v-if="authStore.isAdmin" to="/admin" class="dock-item" :class="{ active: route.path === '/admin' }">
        <span class="dock-icon">⚒</span><small>Admin</small>
      </RouterLink>
    </nav>

    <RouterLink to="/profile" class="dock-user" :class="{ active: route.path === '/profile' }" :title="authStore.profile?.name || 'Perfil'">
      <span>{{ initials }}</span>
    </RouterLink>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()
const initials = computed(() => (authStore.profile?.name || 'J')
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0]?.toUpperCase())
  .join(''))
</script>

<style scoped>
.app-dock{position:fixed;z-index:80;left:14px;top:50%;transform:translateY(-50%);width:68px;padding:10px 7px;display:flex;flex-direction:column;align-items:center;gap:10px;border:1px solid rgba(229,194,100,.24);border-radius:24px;background:linear-gradient(180deg,rgba(12,25,41,.94),rgba(4,9,15,.96));box-shadow:0 24px 70px rgba(0,0,0,.48),inset 0 1px rgba(255,255,255,.04);backdrop-filter:blur(18px)}.dock-brand{height:48px;width:48px;border-radius:15px;display:grid;grid-template-columns:1fr auto 1fr;place-items:center;color:#e7c96f;background:radial-gradient(circle,rgba(229,194,100,.13),rgba(229,194,100,.025));border:1px solid rgba(229,194,100,.18);font-family:Georgia,serif}.dock-brand b{font-size:18px}.brand-mark{font-size:11px;opacity:.78}.dock-nav{width:100%;display:grid;gap:6px}.dock-item{position:relative;min-height:55px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;border-radius:15px;color:rgba(246,237,218,.55);text-decoration:none;border:1px solid transparent;transition:.2s ease}.dock-item:hover{color:#f4df9a;background:rgba(229,194,100,.06);transform:translateY(-1px)}.dock-item.active{color:#f7e5a8;border-color:rgba(229,194,100,.22);background:linear-gradient(145deg,rgba(229,194,100,.13),rgba(229,194,100,.045));box-shadow:inset 3px 0 #d5ad48,0 8px 20px rgba(0,0,0,.2)}.dock-icon{font-size:20px;line-height:1}.dock-item small{font:700 8px/1 ui-sans-serif,system-ui;text-transform:uppercase;letter-spacing:.06em}.dock-user{width:40px;height:40px;display:grid;place-items:center;border-radius:50%;margin-top:2px;background:linear-gradient(135deg,#e2c469,#805c18);color:#07101a;text-decoration:none;font-weight:900;font-size:11px;box-shadow:0 8px 22px rgba(185,137,37,.22)}.dock-user.active{outline:2px solid #f2dc93;outline-offset:2px}
@media(max-width:800px){.app-dock{left:50%;top:auto;bottom:8px;transform:translateX(-50%);width:min(96vw,620px);height:68px;padding:6px 7px;flex-direction:row;justify-content:center;border-radius:22px}.dock-brand{display:none}.dock-nav{display:flex;justify-content:flex-start;gap:2px;flex:1;overflow-x:auto;scrollbar-width:none}.dock-nav::-webkit-scrollbar{display:none}.dock-item{min-height:54px;min-width:50px;padding:3px 5px;flex:1}.dock-item.active{box-shadow:inset 0 -3px #d5ad48,0 8px 20px rgba(0,0,0,.2)}.dock-user{width:38px;height:38px;flex:0 0 38px}.dock-item small{font-size:7px}.dock-icon{font-size:18px}}
</style>
