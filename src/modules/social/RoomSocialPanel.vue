<template>
  <section class="room-social">
    <header class="social-head">
      <div>
        <span>Comunidad de la sala</span>
        <strong>{{ totalPeople }}/{{ room.maxAttendees || ROOM_TOTAL_CAPACITY }} conectados</strong>
      </div>
      <nav>
        <button :class="{ active: tab === 'chat' }" @click="tab = 'chat'">💬 Chat</button>
        <button :class="{ active: tab === 'people' }" @click="tab = 'people'">👥 Personas</button>
      </nav>
    </header>

    <div v-if="isGuest" class="guest-notice">👁 Estás como invitado: puedes mirar y escribir, pero tu micrófono no entra a la llamada.</div>

    <div v-if="tab === 'chat'" class="chat-pane">
      <div ref="messagesBox" class="messages">
        <article v-for="message in messages" :key="message.id" :class="{ mine: message.senderUid === currentUid }">
          <div class="bubble-avatar">{{ initials(message.senderName) }}</div>
          <div><strong>{{ message.senderName }}</strong><p>{{ message.text }}</p></div>
        </article>
        <div v-if="!messages.length" class="empty-chat">Todavía no hay mensajes. Los invitados también pueden participar aquí.</div>
      </div>
      <form class="chat-compose" @submit.prevent="sendMessage">
        <input v-model="draft" maxlength="500" placeholder="Escribe al grupo…" />
        <button :disabled="!draft.trim()">Enviar</button>
      </form>
    </div>

    <div v-else class="people-pane">
      <div v-if="isHost" class="host-controls">
        <label><input type="checkbox" :checked="room.isPrivate" @change="togglePrivate" /> Ocultar del lobby</label>
        <label><input type="checkbox" :checked="room.isLocked" @change="toggleLocked" /> Cerrar nuevas entradas</label>
        <button class="copy" @click="copyRoomCode">Copiar código de sala</button>
      </div>

      <div class="people-list">
        <article v-for="player in room.players" :key="player.uid">
          <span class="person-avatar player">{{ initials(player.name) }}</span>
          <div><strong>{{ player.name }}</strong><small>Jugador · voz habilitada</small></div>
          <em v-if="player.uid === room.hostUid">Líder</em>
          <button v-if="player.uid !== currentUid" class="message-person" @click="messagePerson(player.uid, player.name)">💬</button>
          <button v-if="isHost && player.uid !== room.hostUid" class="kick" @click="kick(player.uid, player.name)">Sacar</button>
        </article>

        <article v-for="guest in room.guests" :key="guest.uid">
          <span class="person-avatar guest">{{ initials(guest.name) }}</span>
          <div><strong>{{ guest.name }}</strong><small>Invitado · sólo chat</small></div>
          <button v-if="guest.uid !== currentUid" class="message-person" @click="messagePerson(guest.uid, guest.name)">💬</button>
          <button v-if="isHost" class="kick" @click="kick(guest.uid, guest.name)">Sacar</button>
        </article>
      </div>

      <p class="moderation-note">Al sacar a una persona queda bloqueada para esta sala y no puede volver a entrar.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { roomService } from '@/modules/game/lobby/roomService'
import { ROOM_TOTAL_CAPACITY } from '@/modules/game/lobby/types'
import type { BoardRoom } from '@/modules/game/lobby/types'
import { socialService } from './socialService'
import type { RoomChatMessage } from './socialService'

const props = defineProps<{
  room: BoardRoom
  currentUid: string
  currentName: string
  isHost: boolean
}>()

const router = useRouter()
const tab = ref<'chat' | 'people'>('chat')
const draft = ref('')
const messages = ref<RoomChatMessage[]>([])
const messagesBox = ref<HTMLElement | null>(null)
let unsubscribe: (() => void) | null = null

const totalPeople = computed(() => props.room.players.length + props.room.guests.length)
const isGuest = computed(() => props.room.guestIds.includes(props.currentUid) && !props.room.playerIds.includes(props.currentUid))
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'J'

const scrollBottom = async () => {
  await nextTick()
  if (messagesBox.value) messagesBox.value.scrollTop = messagesBox.value.scrollHeight
}

onMounted(() => {
  unsubscribe = socialService.subscribeRoomChat(props.room.id, (items) => {
    messages.value = items
    void scrollBottom()
  })
})

onBeforeUnmount(() => unsubscribe?.())

const sendMessage = async () => {
  if (!draft.value.trim()) return
  const text = draft.value
  draft.value = ''
  await socialService.sendRoomMessage(props.room.id, props.currentUid, props.currentName, text)
}

const togglePrivate = async (event: Event) => {
  if (!props.isHost) return
  await roomService.setRoomAccess(props.room.id, { isPrivate: (event.target as HTMLInputElement).checked })
}

const toggleLocked = async (event: Event) => {
  if (!props.isHost) return
  await roomService.setRoomAccess(props.room.id, { isLocked: (event.target as HTMLInputElement).checked })
}

const copyRoomCode = async () => {
  try { await navigator.clipboard.writeText(props.room.id) } catch { /* browser can deny clipboard */ }
}

const kick = async (uid: string, name: string) => {
  if (!props.isHost || !window.confirm(`¿Sacar y bloquear a ${name} de esta sala?`)) return
  await roomService.kickMember(props.room.id, props.currentUid, uid)
}

const messagePerson = (uid: string, name: string) => {
  router.push({ path: '/messages', query: { user: uid, name } })
}
</script>

<style scoped>
.room-social{max-width:1320px;margin:16px auto 0;border:1px solid rgba(214,183,95,.18);border-radius:18px;background:rgba(5,15,25,.86);overflow:hidden}.social-head{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 15px;border-bottom:1px solid rgba(214,183,95,.14)}.social-head>div{display:flex;flex-direction:column}.social-head span{font-size:9px;text-transform:uppercase;letter-spacing:.13em;color:#bfa257}.social-head strong{color:#eadba9}.social-head nav{display:flex;gap:6px}.social-head button{border:1px solid rgba(214,183,95,.18);border-radius:9px;padding:8px 11px;background:transparent;color:rgba(238,224,194,.6)}.social-head button.active{background:rgba(214,183,95,.12);color:#f0d992;border-color:rgba(214,183,95,.42)}.guest-notice{padding:9px 14px;background:rgba(69,128,162,.1);border-bottom:1px solid rgba(69,128,162,.18);color:#a9d3e6;font-size:11px}.chat-pane{display:grid;grid-template-rows:minmax(160px,300px) auto}.messages{padding:13px;overflow:auto;display:flex;flex-direction:column;gap:8px}.messages article{display:flex;gap:8px;max-width:78%}.messages article.mine{align-self:flex-end;flex-direction:row-reverse}.bubble-avatar,.person-avatar{width:32px;height:32px;flex:0 0 32px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#d5b657,#715019);color:#07101a;font-size:9px;font-weight:900}.messages article>div:last-child{padding:8px 10px;border-radius:12px;background:rgba(255,255,255,.055)}.messages article.mine>div:last-child{background:rgba(83,137,174,.14)}.messages strong{display:block;font-size:9px;color:#d8bf77}.messages p{margin:2px 0 0;color:#eee1c4;font-size:12px;white-space:pre-wrap;overflow-wrap:anywhere}.empty-chat{text-align:center;margin:auto;color:rgba(238,224,194,.36);font-size:11px}.chat-compose{display:grid;grid-template-columns:1fr auto;gap:8px;padding:10px;border-top:1px solid rgba(214,183,95,.12)}.chat-compose input{min-width:0;padding:11px 12px;border:1px solid rgba(214,183,95,.22);border-radius:10px;background:#07131f;color:#f3e6c8}.chat-compose button{border:0;border-radius:9px;padding:0 16px;background:linear-gradient(135deg,#ddbf68,#886619);font-weight:900;color:#07101a}.chat-compose button:disabled{opacity:.4}.people-pane{padding:12px}.host-controls{display:flex;gap:14px;align-items:center;flex-wrap:wrap;padding:10px 12px;margin-bottom:10px;border:1px solid rgba(214,183,95,.15);border-radius:11px;background:rgba(214,183,95,.04);color:#d8c89b;font-size:11px}.host-controls label{display:flex;gap:6px;align-items:center}.host-controls .copy{margin-left:auto;border:1px solid rgba(214,183,95,.24);border-radius:8px;background:transparent;color:#dcca8d;padding:7px 10px}.people-list{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:7px}.people-list article{display:flex;align-items:center;gap:9px;padding:9px;border:1px solid rgba(214,183,95,.1);border-radius:10px;background:rgba(255,255,255,.025)}.person-avatar.player{box-shadow:0 0 0 2px rgba(72,168,108,.3)}.person-avatar.guest{filter:saturate(.5);opacity:.8}.people-list article>div{display:flex;flex:1;flex-direction:column;min-width:0}.people-list strong{color:#eadbae;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.people-list small{font-size:8px;color:rgba(238,224,194,.42)}.people-list em{font-style:normal;font-size:8px;color:#8fdbad;text-transform:uppercase}.message-person,.kick{border-radius:8px;padding:6px 8px;background:transparent}.message-person{border:1px solid rgba(79,143,185,.3);color:#aad5ec}.kick{border:1px solid rgba(194,77,68,.35);color:#e5a19b}.moderation-note{margin:10px 2px 0;color:rgba(238,224,194,.35);font-size:9px}@media(max-width:620px){.room-social{border-radius:14px}.social-head{align-items:flex-start;flex-direction:column}.social-head nav{width:100%}.social-head nav button{flex:1}.chat-pane{grid-template-rows:minmax(210px,38vh) auto}.messages article{max-width:92%}.host-controls{display:grid;gap:9px}.host-controls .copy{margin:0}.people-list{grid-template-columns:1fr}}
</style>
