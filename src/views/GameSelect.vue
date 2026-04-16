<template>
  <div class="game-select-view">
    <div class="select-container">
      <h1>⚒ Selecciona el Modo de Juego</h1>
      <p>¿Cómo quieres jugar hoy?</p>

      <div class="modes-grid">
        <router-link to="/game/turns" class="mode-card">
          <div class="mode-icon">△</div>
          <h2>Modo Turnos</h2>
          <p>
            Juega en turnos con otro Hermano. Responde preguntas según la categoría del tablero y
            sube tu puntuación.
          </p>
          <div class="mode-features">
            <span>👥 2 Jugadores</span>
            <span>⏱️ Sin tiempo límite</span>
            <span>📋 Categorías a elegir</span>
          </div>
        </router-link>

        <router-link to="/game/realtime" class="mode-card">
          <div class="mode-icon">🎙️</div>
          <h2>Modo Tiempo Real</h2>
          <p>
            Juega con hasta 8 Hermanos simultáneamente. Incluye comunicación de voz integrada
            para una experiencia de juego más inmersiva.
          </p>
          <div class="mode-features">
            <span>👥 4-8 Jugadores</span>
            <span>🎤 Audio en vivo</span>
            <span>🌍 Sincronización en tiempo real</span>
          </div>
        </router-link>
      </div>

      <div class="user-info">
        <p v-if="authStore.currentUser">
          Conectado como: <strong>{{ authStore.currentUser.email }}</strong>
        </p>
        <button @click="logout" class="btn-logout">Cerrar Sesión</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const logout = async () => {
  await authStore.logOut()
  router.push('/')
}
</script>

<style scoped>
.game-select-view {
  min-height: 100vh;
  padding: 40px 20px;
  background: linear-gradient(135deg, #1a0a00 0%, #2d1500 100%);
}

.select-container {
  max-width: 1000px;
  margin: 0 auto;
}

.select-container h1 {
  text-align: center;
  font-size: 36px;
  color: #c9a84c;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.select-container > p {
  text-align: center;
  color: #8b6914;
  font-size: 16px;
  margin-bottom: 40px;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-bottom: 40px;
}

.mode-card {
  background: rgba(201, 168, 76, 0.05);
  border: 2px solid #8b6914;
  border-radius: 10px;
  padding: 30px;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.mode-card:hover {
  border-color: #c9a84c;
  background: rgba(201, 168, 76, 0.15);
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(201, 168, 76, 0.2);
}

.mode-icon {
  font-size: 60px;
  text-align: center;
  margin-bottom: 20px;
}

.mode-card h2 {
  color: #c9a84c;
  font-size: 24px;
  margin: 15px 0;
  text-align: center;
}

.mode-card p {
  color: #f0e6c8;
  line-height: 1.6;
  margin: 15px 0;
  flex: 1;
}

.mode-features {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(201, 168, 76, 0.2);
}

.mode-features span {
  color: #8b6914;
  font-size: 13px;
  font-weight: 500;
}

.user-info {
  text-align: center;
  padding: 20px;
  background: rgba(201, 168, 76, 0.05);
  border-radius: 8px;
  border: 1px solid #8b6914;
}

.user-info p {
  color: #f0e6c8;
  margin: 0 0 15px 0;
}

.user-info strong {
  color: #c9a84c;
}

.btn-logout {
  padding: 10px 30px;
  background: rgba(244, 67, 54, 0.3);
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.btn-logout:hover {
  background: #ff6b6b;
  color: white;
}

@media (max-width: 768px) {
  .select-container h1 {
    font-size: 28px;
  }

  .modes-grid {
    gap: 20px;
  }
}
</style>
