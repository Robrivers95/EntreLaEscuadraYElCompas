<template>
  <div class="auth-login">
    <div class="door-frame" aria-hidden="true">
      <div class="door-pillar left"><span>B</span></div>
      <div class="door-pillar right"><span>J</span></div>
    </div>

    <div class="login-container temple-panel slide-in">
      <div class="login-header">
        <div class="star-line">✦ · ✧ · ✦</div>
        <MasonicSeal :size="122" />
        <span class="masonic-kicker">Acceso al Taller</span>
        <h1>Ingresa al Templo</h1>
        <p>Entre La Escuadra y El Compás</p>
      </div>

      <div class="symbol-band" aria-hidden="true"><span>☉</span><span>△</span><strong>G</strong><span>□</span><span>☽</span></div>

      <div class="registro-note">
        Usa el mismo correo y contraseña de <strong>Registro Logia / Mi Logia</strong>. El juego validará tu perfil y tu grado antes de abrir el banco de preguntas.
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Correo de Registro Logia</label>
          <input id="email" v-model="email" type="email" placeholder="tu@correo.com" required class="form-input" />
        </div>
        <div class="form-group">
          <label for="password">Contraseña</label>
          <input id="password" v-model="password" type="password" placeholder="Contraseña" required class="form-input" />
        </div>
        <button type="submit" :disabled="loading" class="login-button">
          <span v-if="!loading">Entrar con Registro Logia</span>
          <span v-else>Validando perfil…</span>
        </button>
      </form>

      <div v-if="error" class="error-message">{{ error }}</div>
      <div class="login-footer">
        <div class="mosaic-strip"></div>
        <p>Las cuentas, altas y grados se administran desde Registro Logia. El juego no crea perfiles independientes.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import MasonicSeal from '@/shared/MasonicSeal.vue'

const router = useRouter()
const authStore = useAuthStore()
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  try {
    error.value = ''
    loading.value = true
    await authStore.signIn(email.value, password.value)
    router.push('/game-select')
  } catch (err) {
    error.value = authStore.error?.includes('Registro Logia')
      ? 'La cuenta existe, pero no tiene un perfil válido en Registro Logia.'
      : 'No se pudo ingresar. Revisa tu correo y contraseña de Registro Logia.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-login { min-height:100vh; position:relative; display:flex; align-items:center; justify-content:center; padding:32px 20px; overflow:hidden; background:radial-gradient(circle at 50% 10%,rgba(213,183,97,.12),transparent 22rem); }
.login-container { position:relative; z-index:2; max-width:460px; width:100%; border-radius:4px; padding:34px 36px 30px; }
.login-container::before { left:12px; top:12px; }
.login-header { display:flex; flex-direction:column; align-items:center; text-align:center; margin-bottom:16px; }
.star-line { color:rgba(213,183,97,.4); letter-spacing:.6em; font-size:10px; margin-bottom:-5px; }
.login-header h1 { color:#dfc673; font-size:27px; margin:5px 0 2px; text-transform:uppercase; letter-spacing:.09em; }
.login-header p { color:rgba(241,231,207,.48); margin:0; font-size:12px; letter-spacing:.07em; text-transform:uppercase; }
.symbol-band { display:flex; justify-content:center; align-items:center; gap:15px; color:rgba(213,183,97,.58); padding:11px 0; border-top:1px solid rgba(213,183,97,.13); border-bottom:1px solid rgba(213,183,97,.13); margin-bottom:18px; }
.symbol-band strong { color:#ead484; font-size:19px; }
.registro-note { padding:13px 14px; margin-bottom:20px; border:1px solid rgba(213,183,97,.18); border-left:3px solid #b69642; background:rgba(213,183,97,.045); color:rgba(241,231,207,.72); font-size:12px; line-height:1.5; }
.registro-note strong { color:#e0c875; }
.form-group { margin-bottom:17px; }
.form-group label { display:block; color:#eadfca; margin-bottom:7px; font-size:11px; text-transform:uppercase; letter-spacing:.08em; }
.form-input { box-sizing:border-box; width:100%; padding:12px 13px; border-radius:3px; }
.login-button { width:100%; padding:13px; background:linear-gradient(135deg,#ead483,#8a6621); border:1px solid #f0da8f; border-radius:3px; color:#080b10; font-weight:900; cursor:pointer; text-transform:uppercase; letter-spacing:.08em; font-size:12px; box-shadow:0 8px 24px rgba(0,0,0,.3); }
.login-button:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 28px rgba(213,183,97,.14); }
.login-button:disabled { opacity:.55; cursor:not-allowed; }
.error-message { color:#e9b1b4; background:rgba(111,32,40,.1); border:1px solid rgba(151,64,69,.38); padding:11px; margin-top:15px; text-align:center; font-size:12px; }
.login-footer { text-align:center; padding-top:18px; margin-top:18px; border-top:1px solid rgba(213,183,97,.1); }
.login-footer .mosaic-strip { margin-bottom:14px; height:8px; }
.login-footer p { color:rgba(241,231,207,.42); font-size:11px; line-height:1.5; }
.door-frame { position:absolute; inset:0; z-index:0; display:flex; justify-content:space-between; padding:0 9vw; opacity:.14; pointer-events:none; }
.door-pillar { position:relative; width:74px; height:100%; border-left:1px solid #d5b761; border-right:1px solid #d5b761; background:repeating-linear-gradient(90deg,transparent 0 12px,rgba(213,183,97,.12) 12px 15px); }
.door-pillar::before,.door-pillar::after { content:''; position:absolute; left:-16px; width:104px; height:28px; border:1px solid #d5b761; background:rgba(213,183,97,.08); }
.door-pillar::before { top:12px; } .door-pillar::after { bottom:12px; }
.door-pillar span { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); color:#d5b761; font-size:42px; font-weight:700; }
@media(max-width:620px){ .auth-login{padding:18px 12px}.login-container{padding:28px 22px}.door-frame{display:none} }
</style>
