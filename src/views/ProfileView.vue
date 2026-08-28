<template>
  <main class="profile-view">
    <section class="profile-shell">
      <header>
        <div class="avatar-preview">
          <img v-if="form.avatarUrl" :src="form.avatarUrl" alt="Avatar del perfil" />
          <span v-else>{{ initials }}</span>
        </div>
        <div><span class="kicker">Perfil social</span><h1>Tu identidad en la comunidad</h1><p>Estos datos pertenecen al juego y no modifican tu información administrativa de MiLogia.</p></div>
      </header>

      <form v-if="loaded" @submit.prevent="save">
        <label>Nombre visible<input v-model="form.displayName" maxlength="60" required /></label>
        <label>Ciudad o zona<input v-model="form.city" maxlength="80" placeholder="Opcional" /></label>
        <label class="wide">Acerca de ti<textarea v-model="form.bio" maxlength="280" rows="4" placeholder="Intereses, temas de estudio, una breve presentación…"></textarea></label>
        <label class="wide">Contacto que quieras compartir<input v-model="form.contact" maxlength="180" placeholder="Opcional: correo, Telegram, Instagram, etc." /><small>Visible para usuarios autenticados. Compártelo sólo si quieres que puedan contactarte fuera del juego.</small></label>
        <label class="wide">URL de foto de perfil<input v-model="form.avatarUrl" maxlength="500" placeholder="Opcional: https://…" /></label>
        <div class="actions"><button type="button" class="secondary" @click="router.push('/messages')">💬 Abrir mensajes</button><button class="primary" :disabled="saving">{{ saving ? 'Guardando…' : 'Guardar perfil' }}</button></div>
      </form>
      <div v-else class="loading">Cargando perfil…</div>
      <p v-if="notice" class="notice">{{ notice }}</p>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { socialService } from '@/modules/social/socialService'
import type { GameSocialProfile } from '@/modules/social/socialService'

const router = useRouter()
const authStore = useAuthStore()
const loaded = ref(false)
const saving = ref(false)
const notice = ref('')
const form = reactive<GameSocialProfile>({ uid: '', displayName: '', bio: '', city: '', contact: '', avatarUrl: '', updatedAt: 0 })
const initials = computed(() => (form.displayName || authStore.profile?.name || 'J').split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join(''))

onMounted(async () => {
  if (!authStore.currentUser) return
  const profile = await socialService.ensureProfile(authStore.currentUser.uid, authStore.profile?.name || 'Jugador')
  Object.assign(form, profile)
  loaded.value = true
})

const save = async () => {
  saving.value = true
  notice.value = ''
  try {
    await socialService.saveProfile({ ...form })
    notice.value = 'Perfil actualizado.'
  } catch (error) {
    console.error(error)
    notice.value = 'No se pudo guardar el perfil.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-view{min-height:100vh;padding:30px 18px 100px;background:radial-gradient(circle at 50% -10%,rgba(38,82,126,.34),transparent 38%),#050a11;color:#eee1c3}.profile-shell{max-width:820px;margin:auto}.profile-shell>header{display:grid;grid-template-columns:auto 1fr;gap:18px;align-items:center;padding:22px;border:1px solid rgba(214,183,95,.2);border-radius:20px;background:rgba(8,22,36,.78)}.avatar-preview{width:86px;height:86px;border-radius:28px;overflow:hidden;display:grid;place-items:center;background:linear-gradient(135deg,#e0c267,#785719);color:#07101a;font:900 22px system-ui}.avatar-preview img{width:100%;height:100%;object-fit:cover}.kicker{font-size:9px;text-transform:uppercase;letter-spacing:.16em;color:#c7a74f}.profile-shell h1{margin:3px 0;color:#f0dc9d;font:700 32px Georgia,serif}.profile-shell header p{margin:0;color:rgba(238,225,195,.52)}form{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px;padding:20px;border:1px solid rgba(214,183,95,.16);border-radius:18px;background:rgba(4,13,22,.78)}label{display:flex;flex-direction:column;gap:6px;color:#d5bf7e;font-size:10px;text-transform:uppercase;letter-spacing:.08em}.wide{grid-column:1/-1}input,textarea{width:100%;box-sizing:border-box;padding:12px;border:1px solid rgba(214,183,95,.2);border-radius:10px;background:#07131f;color:#f0e2c5;font:inherit;text-transform:none;letter-spacing:0}textarea{resize:vertical}label small{color:rgba(238,225,195,.38);text-transform:none;letter-spacing:0}.actions{grid-column:1/-1;display:flex;justify-content:flex-end;gap:8px}.primary,.secondary{border-radius:9px;padding:11px 15px;font-weight:900}.primary{border:0;background:linear-gradient(135deg,#e0c267,#866316);color:#07101a}.secondary{border:1px solid rgba(214,183,95,.3);background:transparent;color:#d9c98d}.notice,.loading{text-align:center;color:#a9d7b7;margin-top:12px}@media(max-width:620px){.profile-shell>header{grid-template-columns:1fr;text-align:center}.avatar-preview{margin:auto}form{grid-template-columns:1fr}.wide{grid-column:auto}.actions{grid-column:auto;display:grid}.profile-shell h1{font-size:25px}}
</style>
