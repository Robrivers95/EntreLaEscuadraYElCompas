<template>
  <div class="auth-login">
    <div class="login-container">
      <div class="login-header">
        <div class="masonic-symbol">⧖</div>
        <h1>Ingresa al Taller</h1>
        <p>Entre La Escuadra y El Compás</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="tu@correo.com"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="Contraseña"
            required
            class="form-input"
          />
        </div>

        <button type="submit" :disabled="loading" class="login-button">
          <span v-if="!loading">⚒ Entrar al Taller</span>
          <span v-else>Ingresando...</span>
        </button>
      </form>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="login-footer">
        <p>¿No tienes cuenta? <router-link to="/signup">Regístrate</router-link></p>
      </div>

      <div class="masonic-decoration">
        <div class="symbol">△</div>
        <div class="symbol">☽</div>
        <div class="symbol">△</div>
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
    error.value = 'Correo o contraseña incorrectos'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a0a00 0%, #2d1500 100%);
  padding: 20px;
}

.login-container {
  background: rgba(26, 10, 0, 0.9);
  border: 2px solid #c9a84c;
  border-radius: 10px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 0 30px rgba(201, 168, 76, 0.3);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.masonic-symbol {
  font-size: 48px;
  color: #c9a84c;
  margin-bottom: 15px;
}

.login-header h1 {
  color: #c9a84c;
  font-size: 24px;
  margin: 10px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.login-header p {
  color: #8b6914;
  font-size: 14px;
  margin: 0;
}

.login-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  color: #f0e6c8;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px;
  background: rgba(201, 168, 76, 0.1);
  border: 1px solid #c9a84c;
  border-radius: 5px;
  color: #f0e6c8;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  background: rgba(201, 168, 76, 0.2);
  box-shadow: 0 0 10px rgba(201, 168, 76, 0.5);
}

.form-input::placeholder {
  color: rgba(240, 230, 200, 0.5);
}

.login-button {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #c9a84c 0%, #8b6914 100%);
  border: none;
  border-radius: 5px;
  color: #1a0a00;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(201, 168, 76, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
  font-size: 14px;
}

.login-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(201, 168, 76, 0.2);
}

.login-footer p {
  color: #f0e6c8;
  font-size: 14px;
}

.login-footer a {
  color: #c9a84c;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

.login-footer a:hover {
  color: #f0e6c8;
}

.masonic-decoration {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
  opacity: 0.5;
}

.symbol {
  font-size: 24px;
  color: #c9a84c;
}
</style>
