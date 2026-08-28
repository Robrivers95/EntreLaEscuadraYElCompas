<template>
  <main class="messages-view">
    <section class="messenger-shell">
      <aside class="sidebar">
        <header><span class="kicker">Comunidad</span><h1>Mensajes</h1><button @click="router.push('/profile')">Mi perfil</button></header>
        <input v-model="search" class="search" placeholder="Buscar personas…" />

        <div class="section-title">Conversaciones</div>
        <button v-for="conversation in conversations" :key="conversation.id" class="conversation" :class="{ active: conversation.id === conversationId }" @click="openConversationItem(conversation)">
          <span class="avatar">{{ initials(otherName(conversation)) }}</span>
          <div><strong>{{ otherName(conversation) }}</strong><small>{{ conversation.lastMessage || 'Conversación nueva' }}</small></div>
        </button>

        <div class="section-title">Personas</div>
        <button v-for="profile in filteredProfiles" :key="profile.uid" class="person" @click="openPerson(profile)">
          <span class="avatar"><img v-if="profile.avatarUrl" :src="profile.avatarUrl" alt="" /><template v-else>{{ initials(profile.displayName) }}</template></span>
          <div><strong>{{ profile.displayName }}</strong><small>{{ profile.city || profile.bio || 'Miembro de la comunidad' }}</small></div>
        </button>
      </aside>

      <section class="chat-area">
        <template v-if="selectedProfile">
          <header class="chat-header">
            <div class="avatar large"><img v-if="selectedProfile.avatarUrl" :src="selectedProfile.avatarUrl" alt="" /><template v-else>{{ initials(selectedProfile.displayName) }}</template></div>
            <div><strong>{{ selectedProfile.displayName }}</strong><small>{{ selectedProfile.city || 'Comunidad del juego' }}</small></div>
            <button @click="showProfile = !showProfile">ⓘ Perfil</button>
          </header>

          <div v-if="showProfile" class="profile-card">
            <p>{{ selectedProfile.bio || 'Sin descripción todavía.' }}</p>
            <strong v-if="selectedProfile.contact">Contacto compartido</strong><span v-if="selectedProfile.contact">{{ selectedProfile.contact }}</span>
          </div>

          <div ref="messageBox" class="message-list">
            <article v-for="message in messages" :key="message.id" :class="{ mine: message.senderUid === currentUid }">
              <small>{{ message.senderName }}</small>
              <p>{{ message.text }}</p>
            </article>
            <div v-if="!messages.length" class="empty">Escribe el primer mensaje. Esta conversación sólo es visible para ustedes dos.</div>
          </div>

          <form class="compose" @submit.prevent="send">
            <textarea v-model="draft" rows="1" maxlength="1000" placeholder="Escribe un mensaje…" @keydown.enter.exact.prevent="send"></textarea>
            <button :disabled="!draft.trim()">Enviar</button>
          </form>
        </template>
        <div v-else class="empty-state"><div>💬</div><h2>Mensajería privada</h2><p>Elige una conversación o una persona de la comunidad para escribirle.</p></div>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { socialService } from '@/modules/social/socialService'
import type { DirectConversation, DirectMessage, GameSocialProfile } from '@/modules/social/socialService'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const profiles = ref<GameSocialProfile[]>([])
const conversations = ref<DirectConversation[]>([])
const selectedProfile = ref<GameSocialProfile | null>(null)
const conversationId = ref('')
const messages = ref<DirectMessage[]>([])
const draft = ref('')
const search = ref('')
const showProfile = ref(false)
const messageBox = ref<HTMLElement | null>(null)
let stopProfiles: (() => void) | null = null
let stopConversations: (() => void) | null = null
let stopMessages: (() => void) | null = null

const currentUid = computed(() => authStore.currentUser?.uid || '')
const currentName = computed(() => authStore.profile?.name || 'Jugador')
const filteredProfiles = computed(() => profiles.value.filter((profile) => profile.uid !== currentUid.value && (!search.value.trim() || `${profile.displayName} ${profile.city} ${profile.bio}`.toLowerCase().includes(search.value.trim().toLowerCase()))))
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'J'
const otherUid = (conversation: DirectConversation) => conversation.memberIds.find((uid) => uid !== currentUid.value) || ''
const otherName = (conversation: DirectConversation) => conversation.memberNames?.[otherUid(conversation)] || profiles.value.find((profile) => profile.uid === otherUid(conversation))?.displayName || 'Contacto'

const scrollBottom = async () => {
  await nextTick()
  if (messageBox.value) messageBox.value.scrollTop = messageBox.value.scrollHeight
}

const bindMessages = (id: string) => {
  stopMessages?.()
  conversationId.value = id
  messages.value = []
  stopMessages = socialService.subscribeDirectMessages(id, (items) => {
    messages.value = items
    void scrollBottom()
  })
}

const openPerson = async (profile: GameSocialProfile) => {
  if (!currentUid.value) return
  selectedProfile.value = profile
  showProfile.value = false
  const id = await socialService.openConversation({ uid: currentUid.value, name: currentName.value }, { uid: profile.uid, name: profile.displayName })
  bindMessages(id)
}

const openConversationItem = async (conversation: DirectConversation) => {
  const uid = otherUid(conversation)
  const profile = profiles.value.find((item) => item.uid === uid) || {
    uid,
    displayName: otherName(conversation),
    bio: '', city: '', contact: '', avatarUrl: '', updatedAt: 0,
  }
  selectedProfile.value = profile
  showProfile.value = false
  bindMessages(conversation.id)
}

onMounted(async () => {
  if (!currentUid.value) return
  await socialService.ensureProfile(currentUid.value, currentName.value)
  stopProfiles = socialService.subscribeProfiles((items) => {
    profiles.value = items
    const requestedUid = route.query.user as string | undefined
    if (requestedUid && !selectedProfile.value) {
      const found = items.find((item) => item.uid === requestedUid)
      const fallbackName = (route.query.name as string | undefined) || 'Contacto'
      void openPerson(found || { uid: requestedUid, displayName: fallbackName, bio: '', city: '', contact: '', avatarUrl: '', updatedAt: 0 })
    }
  })
  stopConversations = socialService.subscribeConversations(currentUid.value, (items) => { conversations.value = items })
})

onBeforeUnmount(() => {
  stopProfiles?.()
  stopConversations?.()
  stopMessages?.()
})

const send = async () => {
  if (!conversationId.value || !draft.value.trim() || !currentUid.value) return
  const text = draft.value
  draft.value = ''
  await socialService.sendDirectMessage(conversationId.value, { uid: currentUid.value, name: currentName.value }, text)
}
</script>

<style scoped>
.messages-view{min-height:100vh;padding:22px 18px 92px;background:radial-gradient(circle at 50% -10%,rgba(38,82,126,.32),transparent 38%),#050a11;color:#eee1c3}.messenger-shell{max-width:1180px;height:min(78vh,760px);margin:auto;display:grid;grid-template-columns:330px 1fr;border:1px solid rgba(214,183,95,.2);border-radius:20px;overflow:hidden;background:rgba(5,14,24,.91);box-shadow:0 24px 65px rgba(0,0,0,.34)}.sidebar{border-right:1px solid rgba(214,183,95,.14);overflow:auto}.sidebar>header{position:sticky;top:0;z-index:2;padding:15px;background:rgba(6,16,27,.97);display:grid;grid-template-columns:1fr auto;align-items:end}.sidebar>header .kicker{grid-column:1/-1}.sidebar h1{margin:2px 0;color:#f1dc9e;font:700 28px Georgia}.sidebar header button{border:1px solid rgba(214,183,95,.25);border-radius:8px;background:transparent;color:#d7c485;padding:7px}.kicker,.section-title{font-size:8px;text-transform:uppercase;letter-spacing:.15em;color:#bda052}.search{width:calc(100% - 24px);box-sizing:border-box;margin:10px 12px;padding:10px;border:1px solid rgba(214,183,95,.18);border-radius:10px;background:#07131f;color:#f0e3c5}.section-title{padding:10px 14px 5px}.conversation,.person{width:100%;display:flex;gap:9px;align-items:center;padding:9px 12px;border:0;border-left:3px solid transparent;background:transparent;color:inherit;text-align:left}.conversation:hover,.person:hover,.conversation.active{background:rgba(214,183,95,.055)}.conversation.active{border-left-color:#d1ae4c}.conversation>div,.person>div{display:flex;flex:1;min-width:0;flex-direction:column}.conversation strong,.person strong{font-size:11px;color:#eadcaf}.conversation small,.person small{font-size:9px;color:rgba(238,225,195,.42);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.avatar{width:36px;height:36px;flex:0 0 36px;border-radius:50%;overflow:hidden;display:grid;place-items:center;background:linear-gradient(135deg,#d9ba60,#76551c);color:#07101a;font-size:9px;font-weight:900}.avatar img{width:100%;height:100%;object-fit:cover}.avatar.large{width:44px;height:44px;flex-basis:44px}.chat-area{display:grid;grid-template-rows:auto auto 1fr auto;min-width:0}.chat-header{display:flex;gap:10px;align-items:center;padding:12px 15px;border-bottom:1px solid rgba(214,183,95,.13)}.chat-header>div:nth-child(2){display:flex;flex:1;flex-direction:column}.chat-header strong{color:#eadcaf}.chat-header small{color:rgba(238,225,195,.42)}.chat-header button{border:1px solid rgba(214,183,95,.2);border-radius:8px;background:transparent;color:#d9c789;padding:7px 9px}.profile-card{display:grid;padding:10px 15px;background:rgba(214,183,95,.045);border-bottom:1px solid rgba(214,183,95,.1);font-size:11px}.profile-card p{margin:0 0 6px;color:rgba(238,225,195,.62)}.profile-card strong{color:#d4ba70}.profile-card span{color:#b9d9e8}.message-list{padding:18px;overflow:auto;display:flex;flex-direction:column;gap:8px}.message-list article{align-self:flex-start;max-width:72%;padding:9px 11px;border-radius:13px 13px 13px 4px;background:rgba(255,255,255,.06)}.message-list article.mine{align-self:flex-end;border-radius:13px 13px 4px 13px;background:rgba(62,128,168,.18)}.message-list article small{font-size:8px;color:#c3a657}.message-list p{margin:2px 0 0;color:#eee2c5;white-space:pre-wrap;overflow-wrap:anywhere}.compose{display:grid;grid-template-columns:1fr auto;gap:8px;padding:11px;border-top:1px solid rgba(214,183,95,.12)}.compose textarea{resize:none;padding:11px;border:1px solid rgba(214,183,95,.18);border-radius:11px;background:#07131f;color:#f0e2c4;font-family:inherit}.compose button{border:0;border-radius:9px;padding:0 17px;background:linear-gradient(135deg,#dfc069,#856217);font-weight:900;color:#07101a}.compose button:disabled{opacity:.4}.empty,.empty-state{margin:auto;text-align:center;color:rgba(238,225,195,.4)}.empty-state div{font-size:54px}.empty-state h2{color:#e6d5a7}@media(max-width:760px){.messages-view{padding:8px 6px 78px}.messenger-shell{height:calc(100vh - 96px);grid-template-columns:118px 1fr;border-radius:14px}.sidebar>header{grid-template-columns:1fr;padding:10px}.sidebar>header button{display:none}.sidebar h1{font-size:18px}.search{margin:7px;width:calc(100% - 14px);font-size:10px;padding:8px}.section-title{padding-left:9px}.conversation,.person{padding:7px;display:grid;grid-template-columns:32px 1fr}.avatar{width:32px;height:32px;flex-basis:32px}.conversation small,.person small{display:none}.conversation strong,.person strong{font-size:9px}.chat-header{padding:9px}.message-list{padding:10px}.message-list article{max-width:88%}.compose{padding:7px}.compose button{padding:0 10px}.profile-card{font-size:10px}}
</style>
