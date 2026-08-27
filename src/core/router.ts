import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'Home', component: () => import('@/views/Home.vue') },
  { path: '/login', name: 'Login', component: () => import('@/views/Login.vue') },
  // Accounts are created and graded in Registro Logia, not in this game.
  { path: '/signup', redirect: '/login' },
  { path: '/game-select', name: 'GameSelect', component: () => import('@/views/GameSelect.vue'), meta: { requiresAuth: true } },
  { path: '/game/realtime', name: 'RealtimeGameView', component: () => import('@/views/RealtimeGameView.vue'), meta: { requiresAuth: true } },
  { path: '/game/turns', name: 'TurnsGameView', component: () => import('@/views/TurnsGameView.vue'), meta: { requiresAuth: true } },
  { path: '/admin', name: 'AdminView', component: () => import('@/views/AdminView.vue'), meta: { requiresAuth: true, requiresAdmin: true } },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) next('/login')
  else if (to.meta.requiresAdmin && !authStore.isAdmin) next('/game-select')
  else next()
})

export default router
