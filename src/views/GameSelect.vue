<template>
  <div class="game-select-view">
    <div class="temple-columns" aria-hidden="true">
      <div class="column column-left"><span>B</span></div>
      <div class="column column-right"><span>J</span></div>
    </div>

    <main class="select-container slide-in">
      <header class="temple-header">
        <div class="header-stars" aria-hidden="true">✦ · ✧ · ✦ · ✧ · ✦</div>
        <MasonicSeal :size="126" />
        <span class="masonic-kicker">Salón de juego</span>
        <h1>Entre la Escuadra<br />y el Compás</h1>
        <p>Conocimiento, simbolismo y tradición en un tablero masónico.</p>
        <div class="symbol-ribbon" aria-hidden="true">
          <span>☉</span><span>△</span><span>□</span><strong>G</strong><span>✦</span><span>☽</span><span>⚒</span>
        </div>
      </header>

      <div class="mosaic-strip"></div>

      <section class="member-card temple-panel" v-if="authStore.profile">
        <div class="member-identity">
          <div class="mini-seal"><MasonicSeal :size="74" compact tone="muted" /></div>
          <div>
            <span class="eyebrow">Perfil validado por Registro Logia</span>
            <h2>{{ authStore.profile.name }}</h2>
            <p>{{ authStore.profile.email }}</p>
          </div>
        </div>
        <div class="member-badges">
          <span class="degree-badge" :class="authStore.masonicDegree || 'none'">
            <span class="badge-symbol">△</span>{{ degreeLabel }}
          </span>
          <span class="status-badge" :class="{ inactive: !authStore.canPlay }">
            {{ authStore.canPlay ? '● Habilitado para jugar' : '● Perfil sin acceso de juego' }}
          </span>
        </div>
      </section>

      <section class="rite-panel temple-panel">
        <div class="rite-copy">
          <span class="eyebrow">Rito de la partida</span>
          <h2>Escoge el cuerpo de conocimiento</h2>
          <p>Las preguntas se separan por rito para evitar mezclar liturgias o enseñanzas de distintas tradiciones.</p>
        </div>

        <div class="rite-selector-wrap">
          <div class="rite-medallion">{{ gameStore.selectedRite === 'reaa' ? '33°' : '✦' }}</div>
          <select :value="gameStore.selectedRite" @change="changeRite" class="rite-select">
            <option v-for="rite in MASONIC_RITES" :key="rite.value" :value="rite.value">
              {{ rite.label }}{{ rite.value === 'reaa' ? ' · banco incluido' : ' · requiere banco propio' }}
            </option>
          </select>
        </div>

        <div class="selected-rite">
          <div>
            <small>Rito seleccionado</small>
            <strong>{{ RITE_LABELS[gameStore.selectedRite] }}</strong>
          </div>
          <small v-if="gameStore.selectedRite === 'reaa'">
            Banco inicial preparado para Aprendiz, Compañero y Maestro.
          </small>
          <small v-else>
            La estructura está lista para cargar el banco correspondiente desde Administración.
          </small>
        </div>
      </section>

      <div v-if="!authStore.canPlay" class="access-warning">
        <span>⚠</span>
        <div>
          <strong>Acceso de juego pendiente</strong>
          <p>Necesitas un perfil activo de Registro Logia con grado masónico asignado.</p>
        </div>
      </div>

      <section class="mode-heading">
        <span class="masonic-kicker">Elige tu mesa</span>
        <h2>¿Cómo quieres jugar?</h2>
      </section>

      <div class="modes-grid">
        <router-link
          to="/game/turns"
          class="mode-card turns-card"
          :class="{ disabled: !authStore.canPlay }"
          @click="guardGameAccess"
        >
          <div class="corner-mark top-left">✦</div>
          <div class="corner-mark bottom-right">✦</div>
          <div class="mode-emblem">
            <span class="large-symbol">⚄</span>
            <span class="small-symbol">△</span>
          </div>
          <span class="mode-number">I</span>
          <h2>Tablero por Turnos</h2>
          <p>Avanza por las casillas del Templo y responde preguntas según categoría, rito y grado.</p>
          <div class="mode-features">
            <span><b>◆</b> Casillas temáticas</span>
            <span><b>◆</b> Grado validado</span>
            <span><b>◆</b> Doble puntaje sin incisos</span>
          </div>
          <span class="enter-table">Entrar a la mesa →</span>
        </router-link>

        <router-link
          to="/game/realtime"
          class="mode-card realtime-card"
          :class="{ disabled: !authStore.canPlay }"
          @click="guardGameAccess"
        >
          <div class="corner-mark top-left">✦</div>
          <div class="corner-mark bottom-right">✦</div>
          <div class="mode-emblem">
            <span class="large-symbol">◉</span>
            <span class="small-symbol">☉</span>
          </div>
          <span class="mode-number">II</span>
          <h2>Salón en Tiempo Real</h2>
          <p>Comparte la partida con otros Hermanos, sincronización en vivo y comunicación de voz.</p>
          <div class="mode-features">
            <span><b>◆</b> Multijugador</span>
            <span><b>◆</b> Audio en vivo</span>
            <span><b>◆</b> Sala compartida</span>
          </div>
          <span class="enter-table">Entrar al salón →</span>
        </router-link>
      </div>

      <div class="mosaic-strip bottom-strip"></div>

      <div class="user-info">
        <button v-if="authStore.isAdmin" @click="router.push('/admin')" class="btn-admin">⚒ Banco de preguntas</button>
        <button @click="logout" class="btn-logout">Cerrar sesión</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useGameStore } from '@/stores/gameStore'
import { DEGREE_LABELS, MASONIC_RITES, RITE_LABELS } from '@/modules/questions/questionRules'
import type { MasonicRite } from '@/modules/questions/types'
import MasonicSeal from '@/shared/MasonicSeal.vue'

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
.game-select-view {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding: 32px 20px 56px;
  background:
    radial-gradient(circle at 50% 7%, rgba(213,183,97,.12), transparent 25rem),
    linear-gradient(180deg, rgba(10,20,32,.35), rgba(3,5,8,.28));
}
.game-select-view::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(213,183,97,.025) 1px, transparent 1px), linear-gradient(rgba(213,183,97,.025) 1px, transparent 1px);
  background-size: 38px 38px;
  mask-image: radial-gradient(circle at 50% 20%, #000 0, transparent 64%);
}
.select-container { position: relative; z-index: 2; max-width: 1080px; margin: 0 auto; }
.temple-header { text-align: center; display: flex; flex-direction: column; align-items: center; padding: 6px 20px 24px; }
.header-stars { color: rgba(213,183,97,.42); letter-spacing: .9em; margin-bottom: -8px; font-size: 11px; }
.temple-header h1 {
  margin: 8px 0 7px;
  color: #e1c978;
  font-size: clamp(34px, 5vw, 56px);
  line-height: .98;
  text-transform: uppercase;
  letter-spacing: .095em;
  text-shadow: 0 4px 28px rgba(0,0,0,.72), 0 0 28px rgba(213,183,97,.08);
}
.temple-header p { margin: 7px 0 0; color: var(--masonic-muted); font-size: 15px; }
.symbol-ribbon { display: flex; align-items: center; justify-content: center; gap: 17px; margin-top: 16px; color: rgba(213,183,97,.72); font-size: 17px; }
.symbol-ribbon strong { font-family: Georgia, serif; font-size: 22px; color: #ecd786; }
.mosaic-strip { margin: 0 0 22px; }
.bottom-strip { margin: 7px 0 20px; }

.temple-columns { pointer-events: none; position: fixed; inset: 0; z-index: 0; display: flex; justify-content: space-between; padding: 0 3vw; opacity: .18; }
.column { position: relative; width: 74px; height: 100vh; border-left: 1px solid #d5b761; border-right: 1px solid #d5b761; background: repeating-linear-gradient(90deg, transparent 0 12px, rgba(213,183,97,.12) 12px 15px); }
.column::before, .column::after { content: ''; position: absolute; left: -16px; width: 104px; height: 28px; border: 1px solid #d5b761; background: rgba(213,183,97,.09); }
.column::before { top: 10px; } .column::after { bottom: 10px; }
.column span { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); color: #d5b761; font-size: 44px; font-weight: 700; }

.member-card, .rite-panel { border-radius: 4px; padding: 20px 22px; margin-bottom: 18px; }
.member-card { display: flex; justify-content: space-between; align-items: center; gap: 18px; }
.member-identity { display: flex; align-items: center; gap: 14px; }
.mini-seal { opacity: .7; }
.member-card h2, .rite-panel h2 { color: #f3e9d1; margin: 3px 0; }
.member-card p, .rite-panel p { color: var(--masonic-muted); margin: 4px 0; }
.eyebrow { color: #cfb25e; font-size: 10px; text-transform: uppercase; letter-spacing: .16em; font-weight: 800; }
.member-badges { display: flex; gap: 9px; flex-wrap: wrap; justify-content: flex-end; }
.degree-badge, .status-badge { border-radius: 3px; padding: 8px 11px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .045em; }
.degree-badge { background: linear-gradient(135deg, rgba(213,183,97,.18), rgba(213,183,97,.06)); color: #ecd786; border: 1px solid #795b22; }
.badge-symbol { margin-right: 6px; }
.status-badge { background: rgba(65,132,86,.12); color: #a9ddb4; border: 1px solid rgba(86,156,106,.4); }
.status-badge.inactive { background: rgba(139,49,52,.12); color: #e3a4a7; border-color: rgba(161,75,78,.45); }

.rite-panel { display: grid; grid-template-columns: 1.2fr .9fr; gap: 14px 24px; align-items: center; }
.rite-copy h2 { font-size: 23px; }
.rite-selector-wrap { display: grid; grid-template-columns: 54px 1fr; align-items: center; gap: 12px; }
.rite-medallion { width: 54px; height: 54px; border-radius: 50%; display: grid; place-items: center; color: #ecd786; font-weight: 900; border: 1px solid #8a6828; box-shadow: inset 0 0 0 5px rgba(213,183,97,.05); background: rgba(213,183,97,.06); }
.rite-select { width: 100%; padding: 13px; border-radius: 3px; }
.selected-rite { grid-column: 1 / -1; display: grid; grid-template-columns: minmax(180px,.65fr) 1.35fr; gap: 16px; align-items: center; padding-top: 14px; border-top: 1px solid rgba(213,183,97,.18); }
.selected-rite > div { display: flex; flex-direction: column; }
.selected-rite small { color: rgba(241,231,207,.52); }
.selected-rite strong { color: #d9be6a; font-size: 14px; }

.access-warning { display: flex; gap: 12px; align-items: center; padding: 13px 15px; margin-bottom: 20px; border: 1px solid rgba(174,81,83,.38); border-left: 4px solid #9a4549; background: rgba(107,28,34,.13); color: #e6b2b5; }
.access-warning span { font-size: 22px; } .access-warning strong { color: #f1ccce; } .access-warning p { color: #d4a5a8; margin: 2px 0 0; font-size: 12px; }
.mode-heading { text-align: center; margin: 29px 0 14px; }
.mode-heading h2 { color: #eee2c3; font-size: 27px; margin-top: 3px; }

.modes-grid { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 22px; margin: 12px 0 24px; }
.mode-card {
  position: relative;
  overflow: hidden;
  min-height: 390px;
  border: 1px solid rgba(213,183,97,.42);
  border-radius: 4px;
  padding: 28px 28px 24px;
  color: inherit;
  background:
    radial-gradient(circle at 50% 7%, rgba(213,183,97,.14), transparent 12rem),
    linear-gradient(145deg, rgba(18,37,58,.94), rgba(7,11,17,.97) 58%, rgba(25,15,9,.95));
  box-shadow: inset 0 0 0 5px rgba(213,183,97,.018), 0 18px 45px rgba(0,0,0,.3);
  transition: .28s ease;
  display: flex;
  flex-direction: column;
}
.mode-card::after { content: ''; position: absolute; inset: 8px; border: 1px solid rgba(213,183,97,.12); pointer-events: none; }
.mode-card:hover { border-color: #d5b761; transform: translateY(-6px) rotateX(1deg); box-shadow: inset 0 0 0 5px rgba(213,183,97,.025), 0 24px 55px rgba(0,0,0,.42), 0 0 30px rgba(213,183,97,.07); }
.mode-card.disabled { opacity: .46; filter: grayscale(.52); }
.corner-mark { position: absolute; color: rgba(213,183,97,.45); font-size: 12px; z-index: 2; }
.corner-mark.top-left { top: 16px; left: 16px; } .corner-mark.bottom-right { right: 16px; bottom: 16px; }
.mode-emblem { width: 96px; height: 96px; margin: 0 auto 8px; position: relative; display: grid; place-items: center; border-radius: 50%; border: 1px solid #8a6828; box-shadow: inset 0 0 0 6px rgba(213,183,97,.04), 0 0 22px rgba(213,183,97,.06); }
.large-symbol { color: #e0c56f; font-size: 50px; line-height: 1; }
.small-symbol { position: absolute; right: 4px; bottom: 3px; width: 30px; height: 30px; display: grid; place-items: center; border-radius: 50%; background: #0d1621; border: 1px solid #8a6828; color: #d5b761; }
.mode-number { text-align: center; color: rgba(213,183,97,.45); letter-spacing: .3em; font-size: 11px; }
.mode-card h2 { color: #e3cc7f; text-align: center; margin: 7px 0 12px; font-size: 24px; }
.mode-card p { color: rgba(241,231,207,.76); line-height: 1.55; text-align: center; flex: 1; }
.mode-features { border-top: 1px solid rgba(213,183,97,.19); padding-top: 14px; display: grid; gap: 7px; color: #bda45f; font-size: 12px; }
.mode-features b { font-size: 7px; margin-right: 6px; }
.enter-table { margin-top: 18px; color: #ead17c; text-align: center; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; }
.user-info { display: flex; justify-content: center; gap: 10px; }
.btn-logout, .btn-admin { padding: 10px 20px; border-radius: 3px; font-weight: 800; cursor: pointer; }
.btn-logout { background: rgba(113,35,40,.12); color: #d9a4a6; border: 1px solid #743b40; }
.btn-admin { background: rgba(213,183,97,.1); color: #e3cd84; border: 1px solid #765a24; }
.btn-admin:hover, .btn-logout:hover { transform: translateY(-2px); }

@media (max-width: 760px) {
  .game-select-view { padding: 22px 14px 40px; }
  .temple-columns { display: none; }
  .header-stars { letter-spacing: .5em; }
  .member-card { align-items: flex-start; flex-direction: column; }
  .member-identity { align-items: flex-start; }
  .mini-seal { display: none; }
  .member-badges { justify-content: flex-start; }
  .rite-panel, .modes-grid { grid-template-columns: 1fr; }
  .selected-rite { grid-column: auto; grid-template-columns: 1fr; }
  .mode-card { min-height: 350px; }
}
</style>
