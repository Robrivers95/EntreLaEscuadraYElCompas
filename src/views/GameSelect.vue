<template>
  <div class="lobby-view">
    <div class="temple-columns" aria-hidden="true"><span>B</span><span>J</span></div>
    <main class="lobby-shell">
      <header class="lobby-header">
        <MasonicSeal :size="88" />
        <div><span class="kicker">Lobby general · juego + comunidad</span><h1>Entre la Escuadra y el Compás</h1><p>Cada mesa puede tener jugadores activos e invitados. La sala admite hasta 20 personas en total.</p></div>
        <button class="logout" @click="logout">Salir</button>
      </header>

      <section v-if="authStore.profile" class="member-bar">
        <div><small>Jugador</small><strong>{{ authStore.profile.name }}</strong></div>
        <div><small>Grado en Registro Logia</small><strong>{{ degreeLabel }}</strong></div>
        <label><small>Rito habitual</small><select :value="preferredRite" @change="setPreferredRite"><option v-for="rite in masonicRites" :key="rite.value" :value="rite.value">{{ rite.shortLabel }}</option></select></label>
        <button class="community-shortcut" @click="router.push('/messages')">💬 Comunidad</button>
      </section>

      <nav class="mode-grid">
        <button class="mode-card active"><span class="roman">I</span><b>🎲</b><h2>Maratón de tablero</h2><p>Jugadores con voz y turnos; invitados observan y participan por chat.</p></button>
        <button class="mode-card" @click="router.push('/duels')"><span class="roman">II</span><b>⚔</b><h2>Reto de 10</h2><p>Reta a otra persona con las mismas diez preguntas.</p></button>
        <button class="mode-card" @click="router.push('/study')"><span class="roman">III</span><b>📖</b><h2>Estudio individual</h2><p>Práctica personal con el mismo banco de preguntas.</p></button>
      </nav>

      <section class="open-paths">
        <article class="kabala-path"><div class="tree-mini"><span v-for="n in 10" :key="n"></span></div><div><span class="kicker">Ruta abierta</span><h3>Kabbalah · Árbol de la Vida</h3><p>Sin dado: se asciende una sefirá por cada respuesta correcta.</p></div></article>
        <article><b>👥</b><div><span class="kicker">Sala social</span><h3>Hasta {{ ROOM_TOTAL_CAPACITY }} personas</h3><p>Los invitados no entran a la llamada; pueden mirar, chatear y luego escribir mensajes privados.</p></div></article>
      </section>

      <section class="private-entry">
        <div><span class="kicker">Sala privada</span><strong>¿Te compartieron un código?</strong></div>
        <input v-model="roomCode" placeholder="Pega el código de sala" />
        <button @click="enterByCode('player')">Entrar como jugador</button>
        <button @click="enterByCode('guest')">Entrar como invitado</button>
      </section>
      <p v-if="joinError" class="join-error">{{ joinError }}</p>

      <section class="board-lobby">
        <div class="section-head"><div><span class="kicker">Mesas abiertas</span><h2>Elige una sala o crea la tuya</h2><p>El líder puede ocultarla, cerrar entradas y sacar a personas de la sala.</p></div><button class="create-toggle" @click="showCreate = !showCreate">{{ showCreate ? 'Cerrar' : '＋ Crear sala' }}</button></div>

        <form v-if="showCreate" class="create-room" @submit.prevent="createRoom">
          <label>Nombre<input v-model="newRoom.name" maxlength="45" placeholder="Ej. Cámara del Norte" /></label>
          <label>Banco / rito<select v-model="newRoom.rite" @change="syncRoomConfig"><option v-for="rite in playableRites" :key="rite.value" :value="rite.value">{{ rite.label }}</option></select></label>
          <label v-if="!isOpenKnowledgeBank(newRoom.rite)">Nivel<select v-model="newRoom.level"><option value="aprendiz">Aprendiz</option><option value="compañero">Compañero</option><option value="maestro">Maestro</option></select></label>
          <label>Jugadores activos<select v-model.number="newRoom.maxPlayers"><option :value="2">2</option><option :value="3">3</option><option :value="4">4</option><option :value="6">6</option><option :value="8">8</option></select></label>
          <label class="private-check"><input v-model="newRoom.isPrivate" type="checkbox" /> Crear oculta del lobby</label>
          <div class="board-rule"><strong>{{ roomConfig.boardSize }} {{ newRoom.rite === 'kabala' ? 'sefirot' : 'casillas' }}</strong><span>{{ roomConfig.boardNote }}</span><span>· hasta {{ ROOM_TOTAL_CAPACITY }} personas contando invitados</span></div>
          <button class="primary" :disabled="roomStore.loading">Crear y entrar</button>
        </form>

        <div class="filters"><button :class="{ selected: filterRite === '' }" @click="filterRite = ''">Todos</button><button v-for="rite in playableRites" :key="rite.value" :class="{ selected: filterRite === rite.value, kabala: rite.value === 'kabala' }" @click="filterRite = rite.value">{{ rite.shortLabel }}</button></div>
        <div v-if="roomStore.error" class="empty error">{{ roomStore.error }}</div>
        <div v-else-if="!filteredRooms.length" class="empty"><span>△ □ G</span><h3>No hay salas visibles con este filtro</h3><p>Crea una o usa el código de una sala privada.</p></div>

        <div v-else class="rooms-grid">
          <article v-for="room in filteredRooms" :key="room.id" class="room-card" :class="{ open: isOpenKnowledgeBank(room.rite), kabala: room.rite === 'kabala', locked: room.isLocked }">
            <div class="room-top"><span class="rite-chip">{{ shortRite(room.rite) }}</span><span class="state">{{ room.isLocked ? '🔒 Cerrada' : room.status === 'waiting' ? '● Esperando' : '▶ En juego' }}</span></div>
            <h3>{{ room.name }}</h3><p class="host">Líder: {{ room.hostName }}</p>
            <div class="room-stats"><span><b>{{ room.players.length }}/{{ room.maxPlayers }}</b> jugadores</span><span><b>{{ totalPeople(room) }}/{{ room.maxAttendees }}</b> personas</span><span><b>{{ room.guests.length }}</b> invitados</span></div>
            <p v-if="room.rite === 'kabala'" class="open-note">✦ Árbol de la Vida · sin dado</p><p v-else-if="room.rite === 'libre'" class="open-note">⚠ MODO NO MASÓN · cultura general</p><p v-else-if="needsExam(room)" class="exam-needed">🔐 Este rito/nivel requiere acceso del juego</p>

            <div v-if="isMember(room)" class="room-actions single"><button class="primary" @click="router.push(`/game/turns?room=${room.id}`)">Volver a la sala</button></div>
            <div v-else class="room-actions">
              <button class="primary" :disabled="!canJoinPlayer(room)" @click="enterRoom(room, 'player')">{{ needsExam(room) ? 'Reteje y jugar' : 'Entrar a jugar' }}</button>
              <button class="guest-button" :disabled="!canJoinGuest(room)" @click="enterRoom(room, 'guest')">👁 Invitado</button>
            </div>
          </article>
        </div>
      </section>

      <footer class="lobby-footer"><button v-if="authStore.isAdmin" @click="router.push('/admin')">⚒ Administrar preguntas e imágenes</button><span>Tu foto/perfil y mensajes están disponibles desde Comunidad.</span></footer>
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
import { roomService } from '@/modules/game/lobby/roomService'
import { DEGREE_LABELS, isOpenKnowledgeBank, MASONIC_RITES, RITE_SHORT_LABELS } from '@/modules/questions/questionRules'
import { RITE_GAME_CONFIG, requiresAccessExam } from '@/modules/game/access/riteAccess'
import { ROOM_TOTAL_CAPACITY } from '@/modules/game/lobby/types'
import type { RoomLevel } from '@/modules/game/access/riteAccess'
import type { BoardRoom } from '@/modules/game/lobby/types'
import type { MasonicRite } from '@/modules/questions/types'

const router = useRouter()
const authStore = useAuthStore()
const accessStore = useAccessStore()
const roomStore = useRoomStore()
const showCreate = ref(false)
const filterRite = ref<MasonicRite | ''>('')
const roomCode = ref('')
const joinError = ref('')
const masonicRites = MASONIC_RITES.filter((rite) => rite.masonic && rite.value !== 'otro')
const playableRites = MASONIC_RITES.filter((rite) => rite.value !== 'otro')
const preferredRite = computed(() => accessStore.preferredRite ?? 'reaa')
const degreeLabel = computed(() => authStore.masonicDegree ? DEGREE_LABELS[authStore.masonicDegree] : 'Sin grado')
const newRoom = reactive<{ name: string; rite: MasonicRite; level: RoomLevel; maxPlayers: number; isPrivate: boolean }>({ name: '', rite: 'reaa', level: authStore.masonicDegree ?? 'aprendiz', maxPlayers: 4, isPrivate: false })
const roomConfig = computed(() => RITE_GAME_CONFIG[newRoom.rite])
const currentUid = computed(() => authStore.currentUser?.uid || '')
const filteredRooms = computed(() => roomStore.openRooms.filter((room) => {
  if (room.isPrivate && !isMember(room)) return false
  return !filterRite.value || room.rite === filterRite.value
}))

onMounted(async () => {
  if (authStore.currentUser) await accessStore.loadForUser(authStore.currentUser.uid)
  roomStore.watchRooms()
})
onBeforeUnmount(() => roomStore.stop())

const syncRoomConfig = () => { newRoom.level = isOpenKnowledgeBank(newRoom.rite) ? 'general' : (authStore.masonicDegree ?? 'aprendiz') }
const shortRite = (rite: MasonicRite) => RITE_SHORT_LABELS[rite]
const totalPeople = (room: BoardRoom) => room.players.length + room.guests.length
const isMember = (room: BoardRoom) => Boolean(currentUid.value && (room.playerIds.includes(currentUid.value) || room.guestIds.includes(currentUid.value)))
const needsExam = (room: BoardRoom) => requiresAccessExam(preferredRite.value, authStore.masonicDegree, room.rite, room.level, accessStore.certificationFor(room.rite))
const canJoinPlayer = (room: BoardRoom) => !room.isLocked && room.status === 'waiting' && room.players.length < room.maxPlayers && totalPeople(room) < room.maxAttendees
const canJoinGuest = (room: BoardRoom) => !room.isLocked && room.status !== 'finished' && totalPeople(room) < room.maxAttendees

const setPreferredRite = async (event: Event) => {
  if (authStore.currentUser) await accessStore.setPreferredRite(authStore.currentUser.uid, (event.target as HTMLSelectElement).value as MasonicRite)
}

const createRoom = async () => {
  if (!authStore.currentUser || !authStore.profile) return
  const id = await roomStore.createRoom({
    name: newRoom.name,
    hostUid: authStore.currentUser.uid,
    hostName: authStore.profile.name,
    hostDegree: authStore.masonicDegree,
    rite: newRoom.rite,
    level: isOpenKnowledgeBank(newRoom.rite) ? 'general' : newRoom.level,
    boardSize: roomConfig.value.boardSize,
    maxPlayers: newRoom.maxPlayers,
    isPrivate: newRoom.isPrivate,
  })
  router.push(`/game/turns?room=${id}`)
}

const joinResolved = async (room: BoardRoom, role: 'player' | 'guest') => {
  if (!authStore.currentUser || !authStore.profile) return
  joinError.value = ''
  const base = { uid: authStore.currentUser.uid, name: authStore.profile.name, degree: authStore.masonicDegree, joinedAt: Date.now() }
  try {
    if (role === 'player') await roomStore.joinRoom(room.id, { ...base, position: 0, score: 0 })
    else await roomStore.joinGuest(room.id, base)
    router.push(`/game/turns?room=${room.id}`)
  } catch (error) {
    console.error(error)
    joinError.value = error instanceof Error ? error.message : 'No se pudo entrar a la sala.'
  }
}

const enterRoom = async (room: BoardRoom, role: 'player' | 'guest') => {
  if (!authStore.currentUser || !authStore.profile) return
  if (isMember(room)) { router.push(`/game/turns?room=${room.id}`); return }
  if (needsExam(room)) {
    router.push({ path: '/reteje', query: { rite: room.rite, level: room.level, room: room.id, role } })
    return
  }
  await joinResolved(room, role)
}

const enterByCode = async (role: 'player' | 'guest') => {
  const code = roomCode.value.trim()
  if (!code) return
  joinError.value = ''
  try {
    const room = await roomService.getRoom(code)
    if (!room) throw new Error('No existe una sala con ese código.')
    await enterRoom(room, role)
  } catch (error) {
    console.error(error)
    joinError.value = error instanceof Error ? error.message : 'No se pudo abrir esa sala.'
  }
}

const logout = async () => { await authStore.logOut(); router.push('/') }
</script>

<style scoped>
.lobby-view{min-height:100vh;padding:22px 18px 90px;background:radial-gradient(circle at 50% -5%,rgba(31,76,128,.38),transparent 40%),#040a11;color:#efe1c2;position:relative}.lobby-shell{max-width:1180px;margin:auto;position:relative;z-index:2}.temple-columns{position:fixed;inset:0;display:flex;justify-content:space-between;align-items:center;padding:0 3vw;pointer-events:none;opacity:.07;font:700 92px Georgia;color:#d6b75f}.lobby-header{display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center;padding-bottom:18px;border-bottom:1px solid rgba(214,183,95,.24)}.kicker,small{font-size:9px;text-transform:uppercase;letter-spacing:1.5px;color:#cfae54}.lobby-header h1{margin:3px 0;color:#f0d98e;font:700 clamp(27px,4vw,42px) Georgia}.lobby-header p{margin:0;color:rgba(240,230,200,.59)}button{cursor:pointer}.logout,.lobby-footer button{border:1px solid rgba(214,183,95,.35);background:transparent;color:#dbc988;padding:9px 13px;border-radius:7px}.member-bar{display:grid;grid-template-columns:1.2fr .8fr 1fr auto;gap:8px;margin:15px 0;padding:12px;border:1px solid rgba(214,183,95,.2);background:rgba(9,24,40,.72);border-radius:11px}.member-bar>div,.member-bar label{display:flex;flex-direction:column;padding:5px 9px}.member-bar strong{color:#f0e2c2}.member-bar select{padding:5px}.community-shortcut{border:1px solid rgba(84,148,185,.3);border-radius:9px;background:rgba(55,119,158,.09);color:#b9dded;padding:8px 11px}.mode-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin:18px 0}.mode-card{position:relative;text-align:left;padding:17px;border:1px solid rgba(214,183,95,.24);border-radius:13px;background:linear-gradient(145deg,rgba(17,40,65,.82),rgba(4,12,21,.93));color:#f0e2c2;min-height:155px}.mode-card.active{border-color:#c9a84c}.mode-card b{font-size:30px}.mode-card h2{font-size:18px;margin:7px 0;color:#e6cb75}.mode-card p{font-size:11px;color:rgba(240,230,200,.58);margin:0}.roman{position:absolute;right:12px;top:8px;color:rgba(214,183,95,.2);font:700 30px Georgia}.open-paths{display:grid;grid-template-columns:1.2fr .8fr;gap:10px;margin-bottom:14px}.open-paths article{display:flex;align-items:center;gap:14px;padding:14px;border:1px solid rgba(87,168,196,.28);border-radius:12px;background:rgba(20,72,96,.08)}.open-paths article>b{font-size:35px}.open-paths h3{margin:2px 0;color:#d8e7e9}.open-paths p{margin:0;color:rgba(226,238,238,.5);font-size:11px}.tree-mini{width:74px;height:74px;position:relative;flex:0 0 74px}.tree-mini span{position:absolute;width:9px;height:9px;border:2px solid #88cad5;border-radius:50%;box-shadow:0 0 8px #3b8292}.tree-mini span:nth-child(1){left:32px;top:1px}.tree-mini span:nth-child(2){left:13px;top:17px}.tree-mini span:nth-child(3){right:13px;top:17px}.tree-mini span:nth-child(4){left:8px;top:35px}.tree-mini span:nth-child(5){right:8px;top:35px}.tree-mini span:nth-child(6){left:32px;top:37px}.tree-mini span:nth-child(7){left:14px;top:53px}.tree-mini span:nth-child(8){right:14px;top:53px}.tree-mini span:nth-child(9){left:32px;top:57px}.tree-mini span:nth-child(10){left:32px;top:70px}.private-entry{display:grid;grid-template-columns:1fr 1.2fr auto auto;gap:8px;align-items:center;margin:12px 0;padding:12px;border:1px dashed rgba(214,183,95,.24);border-radius:11px;background:rgba(214,183,95,.035)}.private-entry>div{display:flex;flex-direction:column}.private-entry input{padding:10px;border:1px solid rgba(214,183,95,.2);border-radius:8px;background:#07131e;color:#f0e2c2}.private-entry button{border:1px solid rgba(214,183,95,.24);border-radius:8px;padding:9px;background:transparent;color:#dac88b}.join-error{padding:9px;border-left:3px solid #b65049;background:rgba(182,80,73,.08);color:#e8aba6}.board-lobby{border:1px solid rgba(214,183,95,.23);border-radius:14px;padding:19px;background:rgba(3,10,18,.62)}.section-head{display:flex;justify-content:space-between;gap:18px}.section-head h2{margin:3px 0;color:#f0dfb3}.section-head p{margin:0;color:rgba(240,230,200,.54)}.create-toggle,.primary{border:0;border-radius:8px;padding:11px 15px;font-weight:900;background:linear-gradient(135deg,#e0c269,#8b6914);color:#07101a}.create-room{display:grid;grid-template-columns:1.2fr 1fr .9fr .7fr;gap:9px;margin:16px 0;padding:14px;background:rgba(214,183,95,.05);border:1px solid rgba(214,183,95,.2);border-radius:10px}.create-room label{font-size:9px;text-transform:uppercase;color:#d5bd76}.create-room input,.create-room select{display:block;width:100%;box-sizing:border-box;margin-top:5px;padding:10px}.private-check{grid-column:1/-1;display:flex!important;flex-direction:row!important;align-items:center;gap:7px}.private-check input{width:auto!important;margin:0!important}.board-rule{grid-column:1/-2;display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:10px;color:rgba(240,230,200,.55)}.board-rule strong{color:#e3c86e}.filters{display:flex;gap:6px;flex-wrap:wrap;margin:17px 0}.filters button{border:1px solid rgba(214,183,95,.18);border-radius:999px;padding:7px 10px;background:transparent;color:rgba(240,230,200,.6)}.filters button.selected{border-color:#c7a94f;background:rgba(199,169,79,.12);color:#edda99}.rooms-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:10px}.room-card{padding:14px;border:1px solid rgba(214,183,95,.18);border-radius:12px;background:linear-gradient(145deg,rgba(13,31,50,.78),rgba(4,12,20,.9))}.room-card.locked{opacity:.72}.room-top{display:flex;justify-content:space-between}.rite-chip,.state{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#d6bc70}.room-card h3{margin:9px 0 2px;color:#efddaa}.host{margin:0 0 11px;color:rgba(240,230,200,.42);font-size:10px}.room-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}.room-stats span{display:flex;flex-direction:column;padding:7px;border:1px solid rgba(214,183,95,.1);border-radius:7px;font-size:8px;color:rgba(240,230,200,.45)}.room-stats b{color:#dfc67c;font-size:11px}.open-note,.exam-needed{font-size:9px;color:#8fcadd}.exam-needed{color:#d5a97a}.room-actions{display:grid;grid-template-columns:1fr auto;gap:7px;margin-top:11px}.room-actions.single{grid-template-columns:1fr}.room-actions button:disabled{opacity:.35;cursor:not-allowed}.guest-button{border:1px solid rgba(82,151,188,.3);border-radius:8px;padding:9px 11px;background:rgba(66,126,162,.08);color:#acd8ea;font-weight:800}.empty{text-align:center;padding:30px;color:rgba(240,230,200,.42)}.lobby-footer{display:flex;justify-content:space-between;align-items:center;margin-top:14px;color:rgba(240,230,200,.35);font-size:9px}@media(max-width:760px){.lobby-view{padding:12px 8px 85px}.lobby-header{grid-template-columns:1fr auto}.lobby-header>:first-child{display:none}.lobby-header h1{font-size:25px}.member-bar{grid-template-columns:1fr 1fr}.community-shortcut{grid-column:1/-1}.mode-grid{display:flex;overflow-x:auto;padding-bottom:5px}.mode-card{min-width:250px}.open-paths{grid-template-columns:1fr}.private-entry{grid-template-columns:1fr 1fr}.private-entry>div,.private-entry input{grid-column:1/-1}.create-room{grid-template-columns:1fr}.private-check,.board-rule{grid-column:auto}.section-head{align-items:flex-start}.section-head p{display:none}.rooms-grid{grid-template-columns:1fr}.room-stats{grid-template-columns:repeat(3,1fr)}.lobby-footer{flex-direction:column;gap:8px}}
</style>
