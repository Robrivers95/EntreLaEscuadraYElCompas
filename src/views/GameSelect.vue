<template>
  <div class="game-select-view">
    <div class="select-container">
      <div class="title-block">
        <h1>⚒ Entre la Escuadra y el Compás</h1>
        <p>Tu grado se valida con Registro Logia. Aquí sólo eliges el rito y el modo de juego.</p>
      </div>

      <section class="member-card" v-if="authStore.profile">
        <div>
          <span class="eyebrow">Perfil validado por Registro Logia</span>
          <h2>{{ authStore.profile.name }}</h2>
          <p>{{ authStore.profile.email }}</p>
        </div>
        <div class="member-badges">
          <span class="degree-badge" :class="authStore.masonicDegree || 'none'">
            {{ degreeLabel }}
          </span>
          <span class="status-badge" :class="{ inactive: !authStore.canPlay }">
            {{ authStore.canPlay ? 'Habilitado para jugar' : 'Perfil sin acceso de juego' }}
          </span>
        </div>
      </section>

      <section class="rite-panel">
        <div>
          <span class="eyebrow">Tipo de Masonería / Rito</span>
          <h2>¿Qué rito quieres jugar?</h2>
          <p>El banco de preguntas se filtra completamente por rito para no mezclar liturgias.</p>
        </div>
        <select :value="gameStore.selectedRite" @change="changeRite" class="rite-select">
          <option v-for="rite in MASONIC_RITES" :key="rite.value" :value="rite.value">
            {{ rite.label }}{{ rite.value === 'reaa' ? ' · banco incluido' : ' · requiere banco propio' }}
          </option>
        </select>
        <div class="selected-rite">
          <strong>{{ RITE_LABELS[gameStore.selectedRite] }}</strong>
          <small v-if="gameStore.selectedRite === 'reaa'">
            Incluye un banco inicial específico de Aprendiz, Compañero y Maestro.
          </small>
          <small v-else>
            La estructura ya está preparada; las preguntas de este rito pueden cargarse desde Administración.
          </small>
        </div>
      </section>

      <div v-if="!authStore.canPlay" class="access-warning">
        Para jugar necesitas un perfil activo de Registro Logia con grado masónico asignado. Un administrador puede corregirlo desde Mi Logia.
      </div>

      <div class="modes-grid">
        <router-link
          to="/game/turns"
          class="mode-card"
          :class="{ disabled: !authStore.canPlay }"
          @click="guardGameAccess"
        >
          <div class="mode-icon">△</div>
          <h2>Modo Turnos</h2>
          <p>Avanza por categorías y responde preguntas compatibles con tu rito y tu grado validado.</p>
          <div class="mode-features">
            <span>🎲 Tablero por categorías</span>
            <span>🎓 Grado desde Registro Logia</span>
            <span>⚡ Doble puntaje sin incisos</span>
          </div>
        </router-link>

        <router-link
          to="/game/realtime"
          class="mode-card"
          :class="{ disabled: !authStore.canPlay }"
          @click="guardGameAccess"
        >
          <div class="mode-icon">🎙️</div>
          <h2>Modo Tiempo Real</h2>
          <p>Juega con otros Hermanos manteniendo la comunicación de voz integrada del proyecto.</p>
          <div class="mode-features">
            <span>👥 Multijugador</span>
            <span>🎤 Audio en vivo</span>
            <span>🌍 Sincronización en tiempo real</span>
          </div>
        </router-link>
      </div>

      <div class="user-info">
        <button v-if="authStore.isAdmin" @click="router.push('/admin')" class="btn-admin">Administrar preguntas</button>
        <button @click="logout" class="btn-logout">Cerrar sesión</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useGameStore } from '@/stores/gameStore'
import { DEGREE_LABELS, MASONIC_RITES, RITE_LABELS } from '@/modules/questions/questionRules'
import type { MasonicRite } from '@/modules/questions/types'

const authStore = useAuthStore()
const gameStore = useGameStore()
const router = useRouter()

const degreeLabel = computed(() => authStore.masonicDegree
  ? DEGREE_LABELS[authStore.masonicDegree]
  : 'Grado no asignado')

onMounted(async () => {
  if (authStore.currentUser && !authStore.profile) await authStore.refreshProfile()
})

const changeRite = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value as MasonicRite
  gameStore.setSelectedRite(value)
}

const guardGameAccess = (event: MouseEvent) => {
  if (authStore.canPlay) return
  event.preventDefault()
  alert('Tu grado y estado deben estar validados en Registro Logia antes de jugar.')
}

const logout = async () => {
  await authStore.logOut()
  router.push('/')
}
</script>

<style scoped>
.game-select-view { min-height: 100vh; padding: 35px 20px; background: radial-gradient(circle at top,#352009 0,#1a0a00 45%,#100600 100%); }
.select-container { max-width: 1050px; margin: 0 auto; }
.title-block { text-align: center; margin-bottom: 24px; }
.title-block h1 { font-size: 34px; color: #c9a84c; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 2px; }
.title-block p, .rite-panel p, .member-card p { color: rgba(240,230,200,.65); margin: 5px 0; }
.member-card, .rite-panel { border: 1px solid #8b6914; border-radius: 14px; background: rgba(201,168,76,.055); padding: 18px 20px; margin-bottom: 18px; }
.member-card { display: flex; justify-content: space-between; align-items: center; gap: 18px; }
.member-card h2, .rite-panel h2 { color: #f0e6c8; margin: 4px 0; }
.eyebrow { color: #c9a84c; font-size: 10px; text-transform: uppercase; letter-spacing: 1.2px; font-weight: 800; }
.member-badges { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
.degree-badge, .status-badge { border-radius: 999px; padding: 7px 11px; font-size: 12px; font-weight: 800; }
.degree-badge { background: rgba(201,168,76,.18); color: #ecd47e; border: 1px solid #8b6914; }
.status-badge { background: rgba(76,175,80,.13); color: #9de0a5; border: 1px solid rgba(76,175,80,.45); }
.status-badge.inactive { background: rgba(244,67,54,.1); color: #ff9994; border-color: rgba(244,67,54,.4); }
.rite-panel { display: grid; grid-template-columns: 1.25fr 1fr; gap: 12px 22px; align-items: center; }
.rite-select { width: 100%; padding: 12px; border: 1px solid #c9a84c; border-radius: 8px; background: #241307; color: #f0e6c8; }
.selected-rite { grid-column: 1 / -1; display: flex; gap: 8px 18px; flex-wrap: wrap; align-items: center; padding-top: 10px; border-top: 1px solid rgba(201,168,76,.15); color: #c9a84c; }
.selected-rite small { color: rgba(240,230,200,.6); }
.access-warning { padding: 12px 14px; margin-bottom: 18px; border-left: 3px solid #d96861; background: rgba(217,104,97,.08); color: #f2b6b2; }
.modes-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 22px; margin: 22px 0; }
.mode-card { background: rgba(201,168,76,.05); border: 1px solid #8b6914; border-radius: 14px; padding: 26px; text-decoration: none; transition: .25s ease; display: flex; flex-direction: column; }
.mode-card:hover { border-color: #c9a84c; transform: translateY(-4px); box-shadow: 0 14px 35px rgba(0,0,0,.3); }
.mode-card.disabled { opacity: .45; filter: grayscale(.5); }
.mode-icon { font-size: 48px; text-align: center; }
.mode-card h2 { color: #c9a84c; text-align: center; margin: 12px 0; }
.mode-card p { color: #f0e6c8; line-height: 1.5; flex: 1; }
.mode-features { border-top: 1px solid rgba(201,168,76,.2); padding-top: 14px; display: grid; gap: 6px; color: #b89642; font-size: 13px; }
.user-info { display: flex; justify-content: center; gap: 10px; }
.btn-logout, .btn-admin { padding: 10px 20px; border-radius: 7px; font-weight: 800; cursor: pointer; }
.btn-logout { background: rgba(244,67,54,.15); color: #ff8b8b; border: 1px solid #b55252; }
.btn-admin { background: rgba(201,168,76,.14); color: #e4cb78; border: 1px solid #8b6914; }
@media (max-width: 760px) { .member-card { align-items: flex-start; flex-direction: column; } .member-badges { justify-content: flex-start; } .rite-panel, .modes-grid { grid-template-columns: 1fr; } .selected-rite { grid-column: auto; } .title-block h1 { font-size: 27px; } }
</style>
