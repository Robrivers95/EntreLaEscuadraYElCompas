<template>
  <div class="auth-login">
    <div class="login-container">
      <div class="login-header">
        <div class="masonic-symbol">⧖</div>
        <h1>Ingresa al Taller</h1>
        <p>Entre La Escuadra y El Compás</p>
      </div>

      <div class="registro-note">
        Usa el mismo correo y contraseña de <strong>Registro Logia / Mi Logia</strong>. El juego validará tu perfil y tu grado masónico antes de permitir el acceso a las preguntas.
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
          <span v-if="!loading">⚒ Entrar con Registro Logia</span>
          <span v-else>Validando perfil...</span>
        </button>
      </form>

      <div v-if="error" class="error-message">{{ error }}</div>
      <div class="login-footer">
        <p>Las cuentas, altas y grados se administran desde Registro Logia. No se crean usuarios independientes desde el juego.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

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
.auth-login { min-height:100vh; display:flex; align-items:center; justify-content:center; background:radial-gradient(circle at top,#352009,#1a0a00 55%); padding:20px; }
.login-container { background:rgba(26,10,0,.94); border:1px solid #c9a84c; border-radius:14px; padding:36px; max-width:430px; width:100%; box-shadow:0 20px 60px rgba(0,0,0,.4); }
.login-header { text-align:center; margin-bottom:22px; }.masonic-symbol{font-size:48px;color:#c9a84c}.login-header h1{color:#c9a84c;font-size:24px;margin:8px 0;text-transform:uppercase;letter-spacing:2px}.login-header p{color:#8b6914;margin:0}
.registro-note { padding:12px 14px; margin-bottom:20px; border-left:3px solid #c9a84c; background:rgba(201,168,76,.07); color:rgba(240,230,200,.76); font-size:13px; line-height:1.45; }.registro-note strong{color:#e2ca79}
.form-group{margin-bottom:18px}.form-group label{display:block;color:#f0e6c8;margin-bottom:7px;font-size:13px}.form-input{box-sizing:border-box;width:100%;padding:12px;background:rgba(201,168,76,.08);border:1px solid #8b6914;border-radius:7px;color:#f0e6c8}.form-input:focus{outline:none;border-color:#c9a84c;box-shadow:0 0 0 3px rgba(201,168,76,.1)}
.login-button{width:100%;padding:14px;background:linear-gradient(135deg,#d6b75f,#8b6914);border:none;border-radius:7px;color:#1a0a00;font-weight:900;cursor:pointer;text-transform:uppercase}.login-button:disabled{opacity:.55;cursor:not-allowed}
.error-message{color:#ff9b96;background:rgba(255,107,107,.08);border:1px solid rgba(255,107,107,.3);padding:11px;border-radius:6px;margin-top:15px;text-align:center;font-size:13px}.login-footer{text-align:center;padding-top:18px;margin-top:18px;border-top:1px solid rgba(201,168,76,.15)}.login-footer p{color:rgba(240,230,200,.5);font-size:12px;line-height:1.45}
</style>
