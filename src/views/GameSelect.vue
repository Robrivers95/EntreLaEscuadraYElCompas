<template>
  <div class="lobby-view">
    <div class="temple-columns" aria-hidden="true"><span>B</span><span>J</span></div>
    <main class="lobby-shell">
      <header class="lobby-header">
        <MasonicSeal :size="104" />
        <div>
          <span class="kicker">Lobby general</span>
          <h1>Entre la Escuadra y el Compás</h1>
          <p>Entra primero al salón. El rito ya no te separa de los demás: cada mesa muestra sus reglas y tú decides dónde jugar.</p>
        </div>
        <button class="logout" @click="logout">Salir</button>
      </header>

      <section v-if="authStore.profile" class="member-bar">
        <div><small>Hermano</small><strong>{{ authStore.profile.name }}</strong></div>
        <div><small>Grado Registro Logia</small><strong>{{ degreeLabel }}</strong></div>
        <label>
          <small>Mi rito habitual · sólo preferencia</small>
          <select :value="preferredRite" @change="setPreferredRite">
            <option v-for="rite in masonicRites" :key="rite.value" :value="rite.value">{{ rite.shortLabel }}</option>
          </select>
        </label>
        <div class="certifications"><small>Accesos aprobados</small><strong>{{ accessStore.verifiedRites.length || 0 }}</strong></div>
      </section>

      <nav class="mode-grid">
        <button class="mode-card active" @click="activeMode = 'board'">
          <span class="roman">I</span><b>🎲</b><h2>Maratón de tablero</h2><p>Crea o entra a una sala, tira el dado y avanza por casillas temáticas.</p>
        </button>
        <button class="mode-card" @click="router.push('/duels')">
          <span class="roman">II</span><b>⚔</b><h2>Reto de 10</h2><p>Responde 10 preguntas y reta a otro usuario a contestar exactamente las mismas.</p>
        </button>
        <button class="mode-card" @click="router.push('/study')">
          <span class="roman">III</span><b>📖</b><h2>Estudio individual</h2><p>Practica solo, recibe calificación y conserva el banco para uso offline en la app instalada.</p>
        </button>
      </nav>

      <section v-if="activeMode === 'board'" class="board-lobby">
        <div class="section-head">
          <div><span class="kicker">Salas disponibles</span><h2>Mesas abiertas</h2><p>Puedes ver todos los ritos. Si una sala supera tu acceso actual, el juego te ofrece un examen antes de entrar.</p></div>
          <button class="create-toggle" @click="showCreate = !showCreate">{{ showCreate ? 'Cerrar' : '＋ Crear sala' }}</button>
        </div>

        <form v-if="showCreate" class="create-room" @submit.prevent="createRoom">
          <label>Nombre de la sala<input v-model="newRoom.name" maxlength="45" placeholder="Ej. Cámara del Norte" /></label>
          <label>Tipo de mesa<select v-model="newRoom.rite" @change="syncRoomConfig"><option v-for="rite in playableRites" :key="rite.value" :value="rite.value">{{ rite.label }}</option></select></label>
          <label v-if="newRoom.rite !== 'libre'">Nivel de preguntas<select v-model="newRoom.level"><option value="aprendiz">Aprendiz</option><option value="compañero">Compañero</option><option value="maestro">Maestro</option></select></label>
          <label>Jugadores<select v-model.number="newRoom.maxPlayers"><option :value="2">2</option><option :value="3">3</option><option :value="4">4</option><option :value="6">6</option><option :value="8">8</option></select></label>
          <div class="board-rule"><strong>{{ roomConfig.boardSize }} casillas</strong><span>{{ roomConfig.boardNote }}</span></div>
          <button class="primary" :disabled="roomStore.loading">Crear y entrar</button>
        </form>

        <div class="filters">
          <button :class="{ selected: filterRite === '' }" @click="filterRite = ''">Todos</button>
          <button v-for="rite in playableRites" :key="rite.value" :class="{ selected: filterRite === rite.value }" @click="filterRite = rite.value">{{ rite.shortLabel }}</button>
        </div>

        <div v-if="roomStore.error" class="empty error">{{ roomStore.error }}</div>
        <div v-else-if="filteredRooms.length === 0" class="empty">
          <span>△ □ G</span><h3>No hay salas con este filtro</h3><p>Crea una mesa. Los demás usuarios podrán verla desde el mismo lobby.</p>
        </div>
        <div v-else class="rooms-grid">
          <article v-for="room in filteredRooms" :key="room.id" class="room-card" :class="{ free: room.rite === 'libre' }">
            <div class="room-top"><span class="rite-chip">{{ shortRite(room.rite) }}</span><span class="state">{{ room.status === 'waiting' ? '● Esperando' : '▶ En juego' }}</span></div>
            <h3>{{ room.name }}</h3>
            <p class="host">Creada por {{ room.hostName }}</p>
            <div class="room-stats"><span><b>{{ room.boardSize }}</b> casillas</span><span><b>{{ room.level === 'general' ? 'Libre' : levelLabel(room.level) }}</b> nivel</span><span><b>{{ room.players.length }}/{{ room.maxPlayers }}</b> jugadores</span></div>
            <p v-if="room.rite === 'libre'" class="non-masonic">⚠ MODO NO MASÓN · cultura general</p>
            <p v-else-if="needsExam(room)" class="exam-needed">🔐 Requiere examen de acceso para tu perfil actual</p>
            <div class="room-actions">
              <button class="primary" :disabled="room.status !== 'waiting' || room.players.length >= room.maxPlayers" @click="enterRoom(room)">{{ isMember(room) ? 'Volver a la mesa' : needsExam(room) ? 'Hacer reteje y entrar' : 'Entrar a la sala' }}</button>
            </div>
          </article>
        </div>
      </section>

      <footer class="lobby-footer">
        <button v-if="authStore.isAdmin" @click="router.push('/admin')">⚒ Administrar preguntas</button>
        <span>Las pruebas de acceso del juego no sustituyen un reteje oficial.</span>
      </footer>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import MasonicSeal from '@/shared/MasonicSeal.vue'
import { useAuthStore } from '@/stores/authStore'
import { useAccessStore } from '@/stores/accessStore'
import { useRoomStore } from '@/stores/roomStore'
import { DEGREE_LABELS, MASONIC_RITES, RITE_SHORT_LABELS } from '@/modules/questions/questionRules'
import { RITE_GAME_CONFIG, requiresAccessExam } from '@/modules/game/access/riteAccess'
import type { RoomLevel } from '@/modules/game/access/riteAccess'
import type { BoardRoom } from '@/modules/game/lobby/types'
import type { MasonicRite } from '@/modules/questions/types'

const router = useRouter()
const authStore = useAuthStore()
const accessStore = useAccessStore()
const roomStore = useRoomStore()
const activeMode = ref<'board'>('board')
const showCreate = ref(false)
const filterRite = ref<MasonicRite | ''>('')
const masonicRites = MASONIC_RITES.filter((rite) => rite.masonic && rite.value !== 'otro')
const playableRites = MASONIC_RITES.filter((rite) => rite.value !== 'otro')
const preferredRite = computed(() => accessStore.preferredRite ?? 'reaa')
const degreeLabel = computed(() => authStore.masonicDegree ? DEGREE_LABELS[authStore.masonicDegree] : 'Sin grado')

const newRoom = reactive<{ name: string; rite: MasonicRite; level: RoomLevel; maxPlayers: number }>({ name: '', rite: 'reaa', level: authStore.masonicDegree ?? 'aprendiz', maxPlayers: 4 })
const roomConfig = computed(() => RITE_GAME_CONFIG[newRoom.rite])
const filteredRooms = computed(() => roomStore.openRooms.filter((room) => !filterRite.value || room.rite === filterRite.value))

onMounted(async () => {
  if (authStore.currentUser) await accessStore.loadForUser(authStore.currentUser.uid)
  roomStore.watchRooms()
})
onBeforeUnmount(() => roomStore.stop())

const syncRoomConfig = () => { newRoom.level = newRoom.rite === 'libre' ? 'general' : (authStore.masonicDegree ?? 'aprendiz') }
const shortRite = (rite: MasonicRite) => RITE_SHORT_LABELS[rite]
const levelLabel = (level: RoomLevel) => level === 'general' ? 'General' : DEGREE_LABELS[level]
const isMember = (room: BoardRoom) => Boolean(authStore.currentUser && room.playerIds.includes(authStore.currentUser.uid))
const needsExam = (room: BoardRoom) => requiresAccessExam(preferredRite.value, authStore.masonicDegree, room.rite, room.level, accessStore.certificationFor(room.rite))

const setPreferredRite = async (event: Event) => {
  if (!authStore.currentUser) return
  await accessStore.setPreferredRite(authStore.currentUser.uid, (event.target as HTMLSelectElement).value as MasonicRite)
}

const createRoom = async () => {
  if (!authStore.currentUser || !authStore.profile) return
  const id = await roomStore.createRoom({
    name: newRoom.name,
    hostUid: authStore.currentUser.uid,
    hostName: authStore.profile.name,
    hostDegree: authStore.masonicDegree,
    rite: newRoom.rite,
    level: newRoom.rite === 'libre' ? 'general' : newRoom.level,
    boardSize: roomConfig.value.boardSize,
    maxPlayers: newRoom.maxPlayers,
  })
  router.push(`/game/turns?room=${id}`)
}

const enterRoom = async (room: BoardRoom) => {
  if (!authStore.currentUser || !authStore.profile) return
  if (isMember(room)) { router.push(`/game/turns?room=${room.id}`); return }
  if (needsExam(room)) {
    router.push({ path: '/reteje', query: { rite: room.rite, level: room.level, room: room.id } })
    return
  }
  await roomStore.joinRoom(room.id, { uid: authStore.currentUser.uid, name: authStore.profile.name, degree: authStore.masonicDegree, position: 0, score: 0, joinedAt: Date.now() })
  router.push(`/game/turns?room=${room.id}`)
}

const logout = async () => { await authStore.logOut(); router.push('/') }
</script>

<style scoped>
.lobby-view{min-height:100vh;padding:24px 18px 55px;background:radial-gradient(circle at 50% -5%,rgba(31,76,128,.35),transparent 38%),linear-gradient(180deg,#071321,#03070d 70%);position:relative}.lobby-shell{max-width:1180px;margin:auto;position:relative;z-index:2}.temple-columns{position:fixed;inset:0;display:flex;justify-content:space-between;align-items:center;padding:0 3vw;pointer-events:none;opacity:.08;font:700 92px Georgia;color:#d6b75f}.lobby-header{display:grid;grid-template-columns:auto 1fr auto;gap:20px;align-items:center;padding:9px 0 21px;border-bottom:1px solid rgba(214,183,95,.26)}.kicker,small{font-size:10px;text-transform:uppercase;letter-spacing:1.6px;color:#cfae54}.lobby-header h1{margin:3px 0;color:#f0d98e;font-family:Georgia,serif;font-size:clamp(27px,4vw,42px)}.lobby-header p{margin:0;color:rgba(240,230,200,.62)}button{cursor:pointer}.logout,.lobby-footer button{border:1px solid rgba(214,183,95,.35);background:transparent;color:#dbc988;padding:9px 13px;border-radius:7px}.member-bar{display:grid;grid-template-columns:1.2fr .7fr 1fr .55fr;gap:10px;margin:17px 0;padding:13px;border:1px solid rgba(214,183,95,.24);background:rgba(9,24,40,.72);border-radius:12px}.member-bar>div,.member-bar label{display:flex;flex-direction:column;gap:2px;padding:7px 10px;border-right:1px solid rgba(214,183,95,.12)}.member-bar>*:last-child{border:0}.member-bar strong{color:#f0e2c2}.member-bar select{padding:5px 8px}.mode-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:13px;margin:20px 0}.mode-card{position:relative;text-align:left;padding:18px;border:1px solid rgba(214,183,95,.26);border-radius:13px;background:linear-gradient(145deg,rgba(17,40,65,.78),rgba(4,12,21,.9));color:#f0e2c2;min-height:170px}.mode-card.active{border-color:#c9a84c;box-shadow:0 10px 32px rgba(0,0,0,.3)}.mode-card b{font-size:30px}.mode-card h2{font-size:18px;margin:8px 0;color:#e6cb75}.mode-card p{font-size:12px;color:rgba(240,230,200,.62);margin:0}.roman{position:absolute;right:13px;top:10px;color:rgba(214,183,95,.24);font:700 31px Georgia}.board-lobby{border:1px solid rgba(214,183,95,.24);border-radius:14px;padding:20px;background:rgba(3,10,18,.62)}.section-head{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.section-head h2{margin:3px 0;color:#f0dfb3;font-size:27px}.section-head p{margin:0;color:rgba(240,230,200,.58);max-width:700px}.create-toggle,.primary{border:0;border-radius:8px;padding:11px 15px;font-weight:900;background:linear-gradient(135deg,#e0c269,#8b6914);color:#07101a}.create-room{display:grid;grid-template-columns:1.2fr 1fr 1fr .6fr;gap:10px;margin:17px 0;padding:15px;background:rgba(214,183,95,.06);border:1px solid rgba(214,183,95,.22);border-radius:10px}.create-room label{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#d5bd76}.create-room input,.create-room select{display:block;width:100%;margin-top:5px;padding:10px}.board-rule{grid-column:1/-2;display:flex;gap:12px;align-items:center;color:rgba(240,230,200,.6);font-size:11px}.board-rule strong{color:#e3c86e;white-space:nowrap}.filters{display:flex;gap:7px;flex-wrap:wrap;margin:19px 0 13px}.filters button{border:1px solid rgba(214,183,95,.22);background:transparent;color:#cdbb92;border-radius:999px;padding:7px 11px}.filters button.selected{background:#b58d35;color:#07101a}.rooms-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px}.room-card{padding:16px;border:1px solid rgba(214,183,95,.25);border-radius:11px;background:linear-gradient(150deg,rgba(15,34,55,.86),rgba(3,10,18,.95))}.room-card.free{border-color:rgba(80,160,190,.45)}.room-top{display:flex;justify-content:space-between}.rite-chip,.state{font-size:10px;text-transform:uppercase;font-weight:900;letter-spacing:1px}.rite-chip{color:#e0c46e}.state{color:#82c89a}.room-card h3{margin:10px 0 2px;color:#f1e5cc}.host{margin:0;color:rgba(240,230,200,.48);font-size:11px}.room-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:14px 0}.room-stats span{padding:8px 4px;text-align:center;background:rgba(255,255,255,.035);font-size:9px;color:rgba(240,230,200,.5)}.room-stats b{display:block;color:#e2ca80;font-size:13px}.non-masonic,.exam-needed{font-size:10px;padding:8px;border-left:3px solid;margin:9px 0}.non-masonic{border-color:#55a0b8;color:#8fd0e0;background:rgba(50,130,160,.08)}.exam-needed{border-color:#bc9134;color:#e2c879;background:rgba(188,145,52,.08)}.room-actions .primary{width:100%}.primary:disabled{opacity:.35;cursor:not-allowed}.empty{text-align:center;padding:35px;border:1px dashed rgba(214,183,95,.23);border-radius:10px;color:rgba(240,230,200,.52)}.empty span{font:700 28px Georgia;color:#bda155}.empty h3{color:#e8d7b0}.empty.error{color:#e49f9f}.lobby-footer{display:flex;justify-content:space-between;align-items:center;margin-top:16px;color:rgba(240,230,200,.38);font-size:10px}@media(max-width:850px){.member-bar{grid-template-columns:1fr 1fr}.mode-grid{grid-template-columns:1fr}.create-room{grid-template-columns:1fr 1fr}.board-rule{grid-column:1/-1}.lobby-header{grid-template-columns:auto 1fr}.logout{grid-column:1/-1}.section-head{flex-direction:column}}@media(max-width:540px){.member-bar,.create-room{grid-template-columns:1fr}.lobby-header{grid-template-columns:1fr;text-align:center;justify-items:center}.room-stats{grid-template-columns:1fr 1fr 1fr}.lobby-footer{flex-direction:column;gap:10px}}
</style>
