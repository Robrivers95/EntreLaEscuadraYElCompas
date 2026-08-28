<template>
  <main class="turns-game">
    <header class="game-header" v-if="room">
      <button class="back" @click="leave">← Lobby</button>
      <div class="room-title"><span>{{ riteLabel }}</span><h1>{{ room.name }}</h1><p>{{ room.boardSize }} casillas · {{ levelLabel }} · {{ room.players.length }}/{{ room.maxPlayers }} jugadores</p></div>
      <div class="header-actions">
        <div class="turn-box"><small>{{ room.status === 'waiting' ? 'Sala de espera' : room.status === 'finished' ? 'Partida terminada' : 'Turno actual' }}</small><strong>{{ currentPlayer?.name || '—' }}</strong></div>
        <button v-if="voiceAvailable" class="voice-btn" :class="{ connected: voiceConnected, muted: voiceMuted }" @click="voiceConnected ? toggleVoice() : connectVoice()">{{ !voiceConnected ? '🎙 Conectar voz' : voiceMuted ? '🔇 Activar micrófono' : '🎤 Silenciar' }}</button>
        <span v-else class="voice-unavailable">Voz disponible al configurar Agora</span>
      </div>
    </header>

    <div v-if="voiceError" class="voice-error">{{ voiceError }}</div>
    <section v-if="!room" class="state-panel"><h2>Cargando sala…</h2></section>

    <section v-else-if="room.status === 'waiting'" class="waiting-panel">
      <div class="seal-line">△ □ <b>G</b> ○</div>
      <h2>Esperando jugadores</h2>
      <p>La sala es visible en el lobby general. El rito de la mesa define sus preguntas, pero no separa a los usuarios en el acceso general.</p>
      <div class="players-waiting"><div v-for="player in room.players" :key="player.uid" class="waiting-player"><span class="avatar">{{ initials(player.name) }}</span><div><strong>{{ player.name }}</strong><small>{{ player.degree ? DEGREE_LABELS[player.degree] : 'Acceso libre' }}</small></div><em v-if="player.uid === room.hostUid">Anfitrión</em></div></div>
      <div class="waiting-actions"><button v-if="isHost" class="primary" :disabled="room.players.length < 2" @click="startGame">{{ room.players.length < 2 ? 'Falta otro jugador' : 'Iniciar partida' }}</button><span v-else>El anfitrión iniciará la partida.</span></div>
    </section>

    <section v-else-if="room.status === 'finished'" class="finished-panel">
      <div class="trophy">🏆</div><span class="kicker">Ganador</span><h2>{{ winner?.name || 'Partida finalizada' }}</h2>
      <div class="final-scores"><div v-for="player in sortedByScore" :key="player.uid"><strong>{{ player.name }}</strong><span>{{ player.score }} pts</span></div></div>
      <button class="primary" @click="leave">Volver al lobby</button>
    </section>

    <template v-else>
      <div v-if="turnMessage" class="turn-message">{{ turnMessage }}</div>
      <section class="game-grid">
        <div class="board-column">
          <GameBoard :players="boardPlayers" :board-size="room.boardSize" :categories="categories" />
          <div class="room-legend"><span>{{ room.rite === 'libre' ? '⚠ CULTURA GENERAL · NO MASÓN' : room.rite === 'kabala' ? '✦ KABBALAH · RUTA LIBRE' : riteLabel }}</span><span>Meta: casilla {{ room.boardSize }}</span></div>
        </div>
        <div class="action-column">
          <QuestionCard v-if="currentQuestion && isMyTurn" :question="currentQuestion" @resolved="handleResolution" @skip="handleSkip" />
          <div v-else-if="currentQuestion" class="spectator-question">
            <span class="kicker">Responde {{ currentPlayer?.name }}</span><QuestionMedia :question="currentQuestion" /><h2>{{ currentQuestion.text }}</h2>
            <div v-for="(option, optionIndex) in currentQuestion.options" :key="option" class="readonly-option"><b>{{ String.fromCharCode(65 + optionIndex) }}</b>{{ option }}</div>
            <p>Todos en la llamada ven la misma pregunta; sólo el jugador en turno registra la respuesta.</p>
          </div>
          <div v-else class="dice-panel" :class="{ mine: isMyTurn }">
            <span class="kicker">{{ isMyTurn ? 'Tu turno' : `Turno de ${currentPlayer?.name}` }}</span><div class="dice" :class="{ rolling: diceRolling }">{{ diceFace }}</div>
            <p v-if="room.currentCategory">Última categoría: <strong>{{ room.currentCategory }}</strong></p><button class="primary roll" :disabled="!isMyTurn || diceRolling" @click="rollDice">🎲 Lanzar dado</button><small v-if="!isMyTurn">El tablero se actualizará automáticamente.</small>
          </div>
        </div>
      </section>
      <section class="score-strip"><article v-for="(player, index) in room.players" :key="player.uid" :class="{ active: index === room.currentPlayerIndex }"><span class="avatar small-avatar">{{ initials(player.name) }}</span><div><strong>{{ player.name }}</strong><small>Casilla {{ player.position + 1 }}</small></div><b>{{ player.score }} pts</b></article></section>
    </template>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import GameBoard from '@/modules/game/board/GameBoard.vue'
import QuestionCard from './QuestionCard.vue'
import QuestionMedia from '@/modules/questions/QuestionMedia.vue'
import { useAuthStore } from '@/stores/authStore'
import { useQuestionsStore } from '@/stores/questionsStore'
import { useRoomStore } from '@/stores/roomStore'
import { roomService } from '@/modules/game/lobby/roomService'
import { audioService } from '@/modules/game/modes/realtime/audioService'
import { DEGREE_LABELS, RITE_LABELS, getCategoriesForRite, getQuestionPoints } from '@/modules/questions/questionRules'
import type { AnswerMode, Question } from '@/modules/questions/types'
import type { Player } from '@/modules/game/types'
import type { RoomPlayer } from '@/modules/game/lobby/types'

const route=useRoute();const router=useRouter();const authStore=useAuthStore();const questionsStore=useQuestionsStore();const roomStore=useRoomStore();const roomId=computed(()=>route.query.room as string|undefined);const room=computed(()=>roomStore.currentRoom);const diceRolling=ref(false);const diceResult=ref<number|null>(null);const turnMessage=ref('');const recentQuestionIds=ref<string[]>([]);const voiceConnected=ref(false);const voiceMuted=ref(false);const voiceError=ref('');const voiceAvailable=audioService.isConfigured()
const colors=['#c94f4f','#4f8cc9','#55a56b','#bd8f37','#8e66c2','#4ea5a5','#c56a9c','#8c9a4c'];const categories=computed<string[]>(()=>room.value?getCategoriesForRite(room.value.rite):[]);const riteLabel=computed(()=>room.value?RITE_LABELS[room.value.rite]:'');const levelLabel=computed(()=>room.value?.level==='general'?'General':room.value?.level?DEGREE_LABELS[room.value.level]:'');const currentPlayer=computed(()=>room.value?.players[room.value.currentPlayerIndex]??null);const isMyTurn=computed(()=>currentPlayer.value?.uid===authStore.currentUser?.uid);const isHost=computed(()=>room.value?.hostUid===authStore.currentUser?.uid);const winner=computed(()=>room.value?.players.find(player=>player.uid===room.value?.winnerUid));const sortedByScore=computed(()=>[...(room.value?.players??[])].sort((a,b)=>b.score-a.score));const currentQuestion=computed<Question|null>(()=>{const id=room.value?.currentQuestionId;return id?questionsStore.questions.find(question=>question.id===id)??null:null});const boardPlayers=computed<Player[]>(()=>(room.value?.players??[]).map((player,index)=>({id:player.uid,name:player.name,position:player.position,score:player.score,color:colors[index%colors.length],avatar:initials(player.name),degree:player.degree??undefined})));const diceFaces=['⚀','⚁','⚂','⚃','⚄','⚅'];const diceFace=computed(()=>diceResult.value?diceFaces[diceResult.value-1]:room.value?.lastDice?diceFaces[room.value.lastDice-1]:'⚄')

onMounted(async()=>{if(!roomId.value){router.replace('/lobby');return}await questionsStore.loadQuestions({fallbackToDefaults:true});roomStore.watchRoom(roomId.value)});onBeforeUnmount(()=>{roomStore.stop();if(voiceConnected.value)void audioService.leave()})
const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]?.toUpperCase()).join('')||'J'
const connectVoice=async()=>{if(!roomId.value||!authStore.currentUser)return;voiceError.value='';try{await audioService.initialize(`mesa-${roomId.value}`);await audioService.join(authStore.currentUser.uid);await audioService.publishAudio();voiceConnected.value=true;voiceMuted.value=false}catch(error){console.error(error);voiceError.value=error instanceof Error?error.message:'No se pudo conectar el audio de la sala.';try{await audioService.leave()}catch{}voiceConnected.value=false}}
const toggleVoice=async()=>{if(!voiceConnected.value)return;const enabled=voiceMuted.value;try{await audioService.toggleAudio(enabled);voiceMuted.value=!enabled}catch(error){console.error(error);voiceError.value='No se pudo cambiar el estado del micrófono.'}}
const startGame=async()=>{if(!room.value||!isHost.value)return;const resetPlayers=room.value.players.map(player=>({...player,position:0,score:0}));await roomService.patchRoom(room.value.id,{status:'playing',players:resetPlayers,currentPlayerIndex:0,currentQuestionId:null,currentCategory:null,lastDice:null,winnerUid:null})}
const rollDice=()=>{if(!room.value||!isMyTurn.value||diceRolling.value)return;diceRolling.value=true;let ticks=0;const timer=window.setInterval(()=>{diceResult.value=Math.floor(Math.random()*6)+1;ticks+=1;if(ticks>=8){window.clearInterval(timer);diceRolling.value=false;void moveAndAsk(diceResult.value||1)}},70)}
const moveAndAsk=async(steps:number)=>{if(!room.value||!currentPlayer.value||!categories.value.length)return;const playerIndex=room.value.currentPlayerIndex;const players=room.value.players.map(player=>({...player}));const player=players[playerIndex];player.position=Math.min(player.position+steps,room.value.boardSize-1);const category=categories.value[player.position%categories.value.length];let eligible=questionsStore.getQuestionsForRoom(room.value.rite,room.value.level,category,'board');if(!eligible.length)eligible=questionsStore.getQuestionsForRoom(room.value.rite,room.value.level,undefined,'board');if(!eligible.length){turnMessage.value='Esta sala no tiene preguntas compatibles todavía.';await advanceTurn(players);return}const fresh=eligible.filter(question=>!recentQuestionIds.value.includes(question.id));const pool=fresh.length?fresh:eligible;const question=pool[Math.floor(Math.random()*pool.length)];recentQuestionIds.value.push(question.id);if(recentQuestionIds.value.length>16)recentQuestionIds.value.shift();await roomService.patchRoom(room.value.id,{players,currentQuestionId:question.id,currentCategory:category,lastDice:steps})}
const handleResolution=async(resolution:{correct:boolean;mode:AnswerMode})=>{if(!room.value||!currentQuestion.value||!isMyTurn.value)return;const players=room.value.players.map(player=>({...player}));const player=players[room.value.currentPlayerIndex];const points=resolution.correct?getQuestionPoints(currentQuestion.value,resolution.mode):0;player.score+=points;turnMessage.value=resolution.correct?`${player.name}: +${points} puntos.`:`${player.name}: respuesta incorrecta.`;if(player.position>=room.value.boardSize-1){await roomService.patchRoom(room.value.id,{players,status:'finished',winnerUid:player.uid,currentQuestionId:null});return}await advanceTurn(players)}
const handleSkip=async()=>{if(!room.value||!isMyTurn.value)return;turnMessage.value='Pregunta saltada.';await advanceTurn(room.value.players.map(player=>({...player})))};const advanceTurn=async(players:RoomPlayer[])=>{const activeRoom=room.value;if(!activeRoom||!players.length)return;const nextIndex=(activeRoom.currentPlayerIndex+1)%players.length;await roomService.patchRoom(activeRoom.id,{players,currentPlayerIndex:nextIndex,currentQuestionId:null})}
const leave=async()=>{if(voiceConnected.value){try{await audioService.leave()}catch(error){console.warn(error)}voiceConnected.value=false}if(room.value&&authStore.currentUser){try{await roomStore.leaveRoom(room.value.id,authStore.currentUser.uid)}catch(error){console.warn(error)}}router.push('/lobby')}
</script>

<style scoped>
.turns-game{min-height:100vh;padding:18px 18px 55px;background:radial-gradient(circle at 50% -10%,rgba(37,75,117,.34),transparent 38%),#050a11;color:#eee0c2}.game-header{max-width:1240px;margin:auto;display:grid;grid-template-columns:auto 1fr auto;gap:16px;align-items:center;padding-bottom:15px;border-bottom:1px solid rgba(214,183,95,.23)}.back{border:1px solid rgba(214,183,95,.3);background:transparent;color:#d9c17a;padding:9px;border-radius:7px}.room-title span,.kicker,small{font-size:10px;text-transform:uppercase;letter-spacing:1.4px;color:#c6a44d}.room-title h1{margin:1px 0;color:#f0d992;font:700 30px Georgia}.room-title p{margin:0;color:rgba(238,224,194,.5)}.header-actions{display:flex;gap:10px;align-items:center}.turn-box{display:flex;flex-direction:column;text-align:right}.turn-box strong{color:#efdba7}.voice-btn{border:1px solid rgba(214,183,95,.35);border-radius:8px;padding:9px 11px;background:rgba(214,183,95,.06);color:#e0cb91;font-weight:800}.voice-btn.connected{border-color:rgba(73,164,103,.55);color:#9ad9ab}.voice-btn.muted{border-color:rgba(190,86,78,.55);color:#e5a19c}.voice-unavailable{max-width:120px;text-align:right;font-size:9px;color:rgba(238,224,194,.32)}.voice-error{max-width:1240px;margin:9px auto;padding:9px 12px;border-left:3px solid #b34f4a;background:rgba(179,79,74,.09);color:#e6aaa6;font-size:11px}.state-panel,.waiting-panel,.finished-panel{max-width:760px;margin:50px auto;text-align:center;padding:35px;border:1px solid rgba(214,183,95,.25);border-radius:14px;background:rgba(8,22,36,.82)}.seal-line{font:700 28px Georgia;color:#c7aa57}.waiting-panel h2,.finished-panel h2{color:#efdb9a;font-family:Georgia,serif}.waiting-panel>p{color:rgba(238,224,194,.57)}.players-waiting{display:grid;gap:8px;margin:20px 0}.waiting-player{display:flex;align-items:center;gap:10px;padding:10px;border:1px solid rgba(214,183,95,.15);border-radius:8px;text-align:left}.waiting-player div{display:flex;flex:1;flex-direction:column}.waiting-player em{font-size:10px;color:#d2b863}.avatar{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#c9a84c,#604817);color:#08111b;font-weight:900}.waiting-actions{display:flex;justify-content:center}.primary{border:0;border-radius:8px;padding:11px 15px;background:linear-gradient(135deg,#e1c36c,#8b6914);color:#07101a;font-weight:900}.primary:disabled{opacity:.35}.trophy{font-size:52px}.final-scores{display:grid;gap:7px;margin:20px}.final-scores div{display:flex;justify-content:space-between;padding:10px;border-bottom:1px solid rgba(214,183,95,.12)}.turn-message{max-width:1240px;margin:13px auto;padding:9px 12px;border-left:3px solid #b88d30;background:rgba(184,141,48,.07);color:#e1cb8c}.game-grid{max-width:1240px;margin:18px auto;display:grid;grid-template-columns:1.12fr .88fr;gap:20px;align-items:center}.board-column{min-width:0}.room-legend{display:flex;justify-content:space-between;margin-top:8px;color:rgba(238,224,194,.42);font-size:10px}.action-column{min-height:400px;display:grid;place-items:center}.dice-panel,.spectator-question{width:100%;max-width:520px;padding:25px;border:1px solid rgba(214,183,95,.27);border-radius:14px;background:rgba(8,22,36,.82);text-align:center}.dice-panel.mine{border-color:#c9a84c}.dice{font-size:92px;color:#e3ca78;margin:15px;filter:drop-shadow(0 10px 14px #000)}.dice.rolling{animation:roll .28s linear infinite}@keyframes roll{50%{transform:rotate(18deg) scale(1.1)}100%{transform:rotate(-15deg)}}.roll{min-width:190px}.dice-panel p{color:rgba(238,224,194,.55)}.dice-panel p strong{color:#e3c976}.dice-panel small{display:block;margin-top:10px;color:rgba(238,224,194,.38);text-transform:none}.spectator-question{text-align:left}.spectator-question h2{color:#f0e1bd;line-height:1.4}.readonly-option{display:grid;grid-template-columns:32px 1fr;gap:8px;padding:9px;margin:6px 0;border:1px solid rgba(214,183,95,.16);border-radius:7px;color:rgba(238,224,194,.74)}.readonly-option b{color:#e0c36d}.spectator-question p{font-size:11px;color:rgba(238,224,194,.42)}.score-strip{max-width:1240px;margin:auto;display:flex;gap:8px;flex-wrap:wrap}.score-strip article{flex:1;min-width:180px;display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;padding:10px;border:1px solid rgba(214,183,95,.16);border-radius:9px;background:rgba(7,18,30,.72)}.score-strip article.active{border-color:#c9a84c;background:rgba(201,168,76,.07)}.score-strip article div{display:flex;flex-direction:column}.score-strip article>b{color:#e2c874}.small-avatar{width:30px;height:30px;font-size:10px}@media(max-width:980px){.header-actions{align-items:flex-end;flex-direction:column}.game-grid{grid-template-columns:1fr}.game-header{grid-template-columns:auto 1fr}.header-actions{grid-column:1/-1;justify-self:stretch;flex-direction:row;justify-content:space-between}.turn-box{text-align:left}}@media(max-width:540px){.game-header{grid-template-columns:1fr}.room-title{text-align:center}.back{justify-self:start}.header-actions{flex-direction:column;align-items:stretch}.voice-btn{width:100%}}
</style>
