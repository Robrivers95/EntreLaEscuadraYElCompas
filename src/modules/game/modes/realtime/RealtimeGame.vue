<template>
  <div class="realtime-game">
    <div class="game-header">
      <h1>△ Modo Juego en Tiempo Real</h1>
      <div class="audio-controls">
        <button
          :class="{ active: !isMuted }"
          @click="toggleMicrophone"
          class="control-btn"
          :title="isMuted ? 'Activar micrófono' : 'Desactivar micrófono'"
        >
          {{ isMuted ? '🔇' : '🔊' }} Micrófono
        </button>
        <button
          :class="{ active: isConnected }"
          @click="toggleConnection"
          class="control-btn"
          :title="isConnected ? 'Desconectar' : 'Conectar'"
        >
          {{ isConnected ? '✅' : '❌' }} Conexión
        </button>
      </div>
    </div>

    <div class="game-content">
      <div class="board-section">
        <GameBoard
          v-if="players.length > 0"
          :players="players"
          :board-size="boardSize"
          :categories="categories"
        />
      </div>

      <div class="players-section">
        <h3>⚒ Jugadores en Línea</h3>
        <div class="players-list">
          <div
            v-for="player in players"
            :key="player.id"
            class="player-item"
            :class="{ active: player.id === currentPlayerId }"
          >
            <div class="player-avatar">{{ player.name[0] }}</div>
            <div class="player-details">
              <div class="player-name">{{ player.name }}</div>
              <div class="player-status">Posición: {{ player.position }}</div>
            </div>
            <div class="player-score">{{ player.score }}</div>
          </div>
        </div>
      </div>

      <div class="chat-section">
        <h3>△ Chat</h3>
        <div class="chat-messages">
          <div v-for="(msg, index) in messages" :key="index" class="message">
            <span class="message-author">{{ msg.author }}:</span>
            <span class="message-text">{{ msg.text }}</span>
          </div>
        </div>
        <div class="chat-input">
          <input
            v-model="messageInput"
            type="text"
            placeholder="Escribe un mensaje..."
            @keyup.enter="sendMessage"
            class="input"
          />
          <button @click="sendMessage" class="btn-send">Enviar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import GameBoard from '@/modules/game/board/GameBoard.vue'
import type { Player } from '@/modules/game/types'

const isMuted = ref(false)
const isConnected = ref(false)
const currentPlayerId = ref('current-player-id')
const messageInput = ref('')
const messages = ref<Array<{ author: string; text: string }>>([])

const boardSize = ref(32)
const categories = ref(['Historia', 'Filosofía', 'Geometría', 'Ética'])

const players = ref<Player[]>([
  { id: '1', name: 'Hermano 1', position: 0, score: 0, color: '#FF6B6B' },
  { id: '2', name: 'Hermano 2', position: 5, score: 10, color: '#4ECDC4' },
  { id: '3', name: 'Hermano 3', position: 8, score: 5, color: '#45B7D1' },
  { id: '4', name: 'Hermano 4', position: 3, score: 15, color: '#96CEB4' },
])

const toggleMicrophone = () => {
  isMuted.value = !isMuted.value
}

const toggleConnection = () => {
  isConnected.value = !isConnected.value
}

const sendMessage = () => {
  if (messageInput.value.trim()) {
    messages.value.push({
      author: 'Tú',
      text: messageInput.value,
    })
    messageInput.value = ''
  }
}
</script>

<style scoped>
.realtime-game {
  min-height: 100vh;
  padding: 20px;
}

.game-header {
  text-align: center;
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.game-header h1 {
  color: #c9a84c;
  font-size: 28px;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
  flex: 1;
  min-width: 300px;
}

.audio-controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.control-btn {
  padding: 10px 15px;
  background: rgba(139, 105, 20, 0.2);
  border: 2px solid #8b6914;
  border-radius: 5px;
  color: #f0e6c8;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  font-size: 13px;
  letter-spacing: 0.5px;
}

.control-btn:hover {
  border-color: #c9a84c;
  background: rgba(201, 168, 76, 0.2);
}

.control-btn.active {
  background: rgba(76, 175, 80, 0.3);
  border-color: #4cb050;
  color: #4cb050;
}

.game-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.board-section {
  grid-column: 1;
}

.players-section,
.chat-section {
  background: rgba(201, 168, 76, 0.05);
  border: 1px solid #8b6914;
  border-radius: 8px;
  padding: 20px;
}

.players-section h3,
.chat-section h3 {
  color: #c9a84c;
  margin-top: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.players-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 400px;
  overflow-y: auto;
}

.player-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(139, 105, 20, 0.1);
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 1px solid rgba(139, 105, 20, 0.3);
}

.player-item.active {
  background: rgba(201, 168, 76, 0.15);
  border-color: #c9a84c;
}

.player-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #c9a84c 0%, #8b6914 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1a0a00;
  font-weight: bold;
  font-size: 16px;
}

.player-details {
  flex: 1;
}

.player-name {
  color: #f0e6c8;
  font-weight: bold;
  font-size: 14px;
}

.player-status {
  color: #8b6914;
  font-size: 12px;
}

.player-score {
  color: #c9a84c;
  font-weight: bold;
  font-size: 16px;
}

.chat-section {
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 350px;
  overflow-y: auto;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(26, 10, 0, 0.3);
  border-radius: 5px;
}

.message {
  color: #f0e6c8;
  font-size: 12px;
  line-height: 1.4;
}

.message-author {
  color: #c9a84c;
  font-weight: bold;
}

.message-text {
  color: #f0e6c8;
}

.chat-input {
  display: flex;
  gap: 8px;
}

.input {
  flex: 1;
  padding: 8px 12px;
  background: rgba(201, 168, 76, 0.1);
  border: 1px solid #8b6914;
  border-radius: 5px;
  color: #f0e6c8;
  font-size: 13px;
}

.input:focus {
  outline: none;
  border-color: #c9a84c;
  background: rgba(201, 168, 76, 0.15);
}

.input::placeholder {
  color: rgba(240, 230, 200, 0.5);
}

.btn-send {
  padding: 8px 12px;
  background: linear-gradient(135deg, #c9a84c 0%, #8b6914 100%);
  border: none;
  border-radius: 5px;
  color: #1a0a00;
  font-weight: bold;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
}

.btn-send:hover {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(201, 168, 76, 0.3);
}

@media (max-width: 1200px) {
  .game-content {
    grid-template-columns: 1fr;
  }
}
</style>
