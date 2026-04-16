<template>
  <div class="signup-view">
    <div class="signup-container">
      <div class="signup-header">
        <div class="masonic-symbol">△</div>
        <h1>Crear Cuenta</h1>
        <p>Entre La Escuadra y El Compás</p>
      </div>

      <form @submit.prevent="handleSignUp" class="signup-form">
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
            placeholder="Mínimo 6 caracteres"
            required
            minlength="6"
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label for="confirm-password">Confirmar Contraseña</label>
          <input
            id="confirm-password"
            v-model="confirmPassword"
            type="password"
            placeholder="Repite tu contraseña"
            required
            class="form-input"
          />
        </div>

        <button type="submit" :disabled="loading" class="signup-button">
          <span v-if="!loading">⧖ Ingresar al Taller</span>
          <span v-else>Registrando...</span>
        </button>
      </form>

      <div v-if="error" class="error-message">{{ error }}</div>

      <div class="signup-footer">
        <p>¿Ya tienes cuenta? <router-link to="/login">Ingresar</router-link></p>
      </div>

      <div class="masonic-decoration">
        <div class="symbol">⧖</div>
        <div class="symbol">☽</div>
        <div class="symbol">⧖</div>
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
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const handleSignUp = async () => {
  if (password.value !== confirmPassword.value) {
    error.value = 'Las contraseñas no coinciden'
    return
  }

  try {
    error.value = ''
    loading.value = true
    await authStore.signUp(email.value, password.value)
    router.push('/game-select')
  } catch (err) {
    error.value = 'Error al crear la cuenta. Intenta con otro correo.'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.signup-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a0a00 0%, #2d1500 100%);
  padding: 20px;
}

.signup-container {
  background: rgba(26, 10, 0, 0.9);
  border: 2px solid #c9a84c;
  border-radius: 10px;
  padding: 40px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 0 30px rgba(201, 168, 76, 0.3);
}

.signup-header {
  text-align: center;
  margin-bottom: 30px;
}

.masonic-symbol {
  font-size: 48px;
  color: #c9a84c;
  margin-bottom: 15px;
}

.signup-header h1 {
  color: #c9a84c;
  font-size: 24px;
  margin: 10px 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.signup-header p {
  color: #8b6914;
  font-size: 14px;
  margin: 0;
}

.signup-form {
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
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  background: rgba(201, 168, 76, 0.2);
  box-shadow: 0 0 10px rgba(201, 168, 76, 0.5);
}

.form-input::placeholder {
  color: rgba(240, 230, 200, 0.5);
}

.signup-button {
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

.signup-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(201, 168, 76, 0.4);
}

.signup-button:disabled {
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

.signup-footer {
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(201, 168, 76, 0.2);
}

.signup-footer p {
  color: #f0e6c8;
  font-size: 14px;
}

.signup-footer a {
  color: #c9a84c;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s ease;
}

.signup-footer a:hover {
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
