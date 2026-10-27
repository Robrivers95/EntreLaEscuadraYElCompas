<template>
  <main class="debate">
    <header><button @click="router.push('/lobby')">← Lobby</button><div><small>CONVIVENCIA ENTRE HERMANOS</small><h1>Sala de Debate</h1><p>Diálogo respetuoso sin puntuación ni ganadores. Participantes con turnos y espectadores en el chat.</p></div></header>
    <p v-if="error" class="error">{{ error }}</p>
    <template v-if="!activeId">
      <section class="panel"><h2>Organizar un debate</h2>
        <label>Tema de conversación<input v-model="topic" maxlength="180" placeholder="Ej. ¿Cómo aportamos más conocimiento a nuestra Logia?" /></label>
        <label>Rito<select v-model="rite"><option value="reaa">REAA</option><option value="york">York</option><option value="frances">Francés</option><option value="nacional-mexicano">Nacional Mexicano</option></select></label>
        <label>Cámara<select v-model="level"><option v-for="degree in allowedChambers" :key="degree" :value="degree">{{ degreeLabel(degree) }}</option></select></label>
        <label>Tiempo de palabra<select v-model.number="turnSeconds"><option :value="60">1 minuto</option><option :value="120">2 minutos</option><option :value="180">3 minutos</option><option :value="300">5 minutos</option></select></label>
        <button class="primary" :disabled="busy||!allowedChambers.length" @click="create">Crear sala</button>
      </section>
      <section class="panel"><h2>Debates disponibles</h2><p v-if="!rooms.length">Todavía no hay debates abiertos.</p>
        <article v-for="item in rooms" :key="item.id" class="entry"><div><strong>{{ item.topic }}</strong><p>{{ degreeLabel(item.level) }} · {{ item.status==='waiting'?'Inscripciones abiertas':'En curso' }} · {{ item.participants.length }} participantes</p></div><button :disabled="busy||!canEnter(item)" @click="enter(item)">{{ canEnter(item)?'Entrar':'Cámara restringida' }}</button></article>
      </section>
    </template>
    <template v-else-if="room">
      <section class="panel"><div class="header-row"><div><small>{{ room.status==='waiting'?'INSCRIPCIONES ABIERTAS':room.status==='active'?'DEBATE EN CURSO':'FINALIZADO' }} · {{ degreeLabel(room.level) }}</small><h2>{{ room.topic }}</h2><p>Moderador: {{ room.hostName }} · {{ room.turnSeconds/60 }} minuto(s) por intervención</p></div><button @click="activeId=''">Volver a salas</button></div>
        <div v-if="!myRole&&room.status!=='finished'" class="actions"><button :disabled="busy||room.status!=='waiting'" @click="join('participant')">Participar con voz</button><button :disabled="busy" @click="join('spectator')">Entrar como espectador</button></div>
        <p v-if="myRole">Tu acceso: <strong>{{ myRole==='participant'?'Participante':'Espectador · solamente chat' }}</strong></p>
        <div v-if="myRole==='participant'" class="actions voice-controls">
          <button :disabled="voiceBusy" @click="voiceConnected ? disconnectVoice() : connectVoice()">{{ voiceBusy ? 'Conectando…' : voiceConnected ? '🔌 Salir de videollamada' : '📹 Unirse a videollamada' }}</button>
          <button v-if="voiceConnected" :disabled="voiceBusy" @click="toggleCamera">{{ cameraEnabled ? '📷 Apagar cámara' : '📷 Encender cámara' }}</button>
          <span v-if="voiceConnected">{{ canSpeak ? '🎙 Tienes la palabra' : '🔇 Micrófono silenciado · escucha el debate' }}</span>
          <span v-else>Activa la voz para escuchar a los participantes.</span>
        </div>
        <p v-if="voiceError" class="error">{{ voiceError }}</p>
        <section v-if="voiceConnected" class="video-grid" aria-label="Videollamada de debate">
          <div class="video-tile"><div id="debate-local-video" class="video-frame"></div><span>Tú {{ cameraEnabled ? '· cámara activa' : '· cámara apagada' }}</span></div>
          <div v-for="peer in remoteVideoIds" :key="peer" class="video-tile"><div :id="'debate-remote-'+peer" class="video-frame"></div><span>{{ peer }}</span></div>
        </section>
        <div v-if="room.status==='waiting'"><p>El moderador puede iniciar cuando todos los participantes estén inscritos. Después únicamente se aceptan espectadores.</p><button v-if="isHost" class="primary" :disabled="busy" @click="runAction('start')">Cerrar inscripciones e iniciar</button></div>
        <div v-if="room.status==='active'" class="speaker"><small>TURNO DE PALABRA</small><h3>{{ speaker?.name||'Sin participantes' }}</h3><strong>{{ countdown }} s</strong><p>La palabra pasa al siguiente Hermano al agotarse el turno o cuando este la cede.</p>
          <button v-if="isHost||(myRole==='participant'&&speaker?.uid===uid)" :disabled="busy" @click="runAction('next')">Ceder / siguiente turno</button>
        </div>
        <button v-if="isHost&&room.status!=='finished'" :disabled="busy" @click="runAction('finish')">Finalizar debate</button>
      </section>
      <section class="panel columns"><div><h2>Participantes ({{ room.participants.length }})</h2><p v-for="member in room.participants" :key="member.uid">🎙 {{ member.name }} <small v-if="member.uid===speaker?.uid&&room.status==='active'">· tiene la palabra</small></p></div><div><h2>Espectadores ({{ room.spectators.length }})</h2><p v-for="member in room.spectators" :key="member.uid">👁 {{ member.name }}</p></div></section>
      <section class="panel"><h2>Chat del debate</h2><div class="messages"><p v-for="message in messages" :key="message.id"><strong>{{ message.name }}:</strong> {{ message.text }}</p></div><form v-if="myRole&&room.status!=='finished'" @submit.prevent="sendMessage"><input v-model="draft" maxlength="500" placeholder="Escribe tu comentario…" /><button :disabled="busy||!draft.trim()">Enviar</button></form></section>
      <p class="notice">La videollamada requiere Agora y el servicio seguro getDebateRtcToken. El micrófono se ajusta al turno localmente; falta prohibir la transmisión fuera de turno en el servidor. No publicar sin verificar controles de Cámara, audio y video con varios usuarios.</p>
    </template>
  </main>
</template>
<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getAllowedDifficulties } from '@/modules/questions/questionRules'
import { debateService } from '@/modules/debate/debateService'
import { DebateCallService } from '@/modules/debate/debateCallService'
import app from '@/core/firebase'
import { getFunctions, httpsCallable } from 'firebase/functions'
import type { DebateRoom, DebateMessage } from '@/modules/debate/debateService'
import type { MasonicRite } from '@/modules/questions/types'
import type { RoomLevel } from '@/modules/game/access/riteAccess'

const router=useRouter(), auth=useAuthStore()
const uid=computed(()=>auth.currentUser?.uid??'')
const name=computed(()=>auth.profile?.name??'Hermano')
const allowedChambers=computed(()=>auth.masonicDegree?getAllowedDifficulties(auth.masonicDegree):[])
const topic=ref(''), rite=ref<MasonicRite>('reaa'), level=ref<RoomLevel>('aprendiz'), turnSeconds=ref(120)
const rooms=ref<DebateRoom[]>([]),room=ref<DebateRoom|null>(null),activeId=ref(''),messages=ref<DebateMessage[]>([])
const draft=ref(''),error=ref(''),busy=ref(false),now=ref(Date.now())
const voice=new DebateCallService()
const remoteVideoIds=ref<string[]>([]),cameraEnabled=ref(false)
const rtcToken=getFunctions(app)
const requestRtcToken=httpsCallable<{debateId:string},{token:string}>(rtcToken,'getDebateRtcToken')
const drawVideo=async()=>{
  await nextTick()
  if(!voiceConnected.value)return
  const local=document.getElementById('debate-local-video')
  if(local&&voice.getLocalVideoTrack())voice.getLocalVideoTrack()?.play(local)
  for(const id of remoteVideoIds.value){
    const container=document.getElementById('debate-remote-'+id)
    if(container&&voice.getRemoteVideoTrack(id))voice.getRemoteVideoTrack(id)?.play(container)
  }
}
voice.setOnChange(()=>{remoteVideoIds.value=voice.getRemoteIds();void drawVideo()})
const voiceConnected=ref(false),voiceBusy=ref(false),voiceError=ref('')
let stopRooms:(()=>void)|null=null,stopRoom:(()=>void)|null=null,stopChat:(()=>void)|null=null,ticker:ReturnType<typeof setInterval>|null=null
let expirationInFlight=false
let lastExpiryAttempt=0
const degreeLabel=(degree:RoomLevel)=>({aprendiz:'Aprendiz',compañero:'Compañero',maestro:'Maestro',general:'General'})[degree]
const canEnter=(value:DebateRoom)=>value.level==='general'||allowedChambers.value.includes(value.level)
const isHost=computed(()=>room.value?.hostUid===uid.value)
const myRole=computed<'participant'|'spectator'|null>(()=>room.value?.participants.some(p=>p.uid===uid.value)?'participant':room.value?.spectators.some(p=>p.uid===uid.value)?'spectator':null)
const speaker=computed(()=>room.value?.participants.length?room.value.participants[room.value.speakerIndex%room.value.participants.length]:null)
const canSpeak=computed(()=>myRole.value==='participant'&&room.value?.status==='active'&&speaker.value?.uid===uid.value&&countdown.value>0)
const countdown=computed(()=>!room.value?.speakerStartedAt?room.value?.turnSeconds??0:Math.max(0,Math.ceil((room.value.turnSeconds*1000-(now.value-room.value.speakerStartedAt))/1000)))
const disconnectVoice=async()=>{
  voiceConnected.value=false
  cameraEnabled.value=false
  remoteVideoIds.value=[]
  try{await voice.disconnect()}catch(e){console.warn('Error al salir del audio',e)}
}
const connectVoice=async()=>{
  if(myRole.value!=='participant'||!room.value||!uid.value||voiceBusy.value)return
  voiceBusy.value=true;voiceError.value=''
  try{
    const response=await requestRtcToken({debateId:room.value.id})
    await voice.connect('debate-'+room.value.id,uid.value,response.data.token)
    voiceConnected.value=true
    cameraEnabled.value=true
    await drawVideo()
    await voice.setMicrophone(canSpeak.value)
  }catch(e){
    voiceError.value=e instanceof Error?e.message:'No se pudo conectar la voz.'
    await disconnectVoice()
  }finally{voiceBusy.value=false}
}
const toggleCamera=async()=>{
  if(!voiceConnected.value)return
  try{await voice.setCamera(!cameraEnabled.value);cameraEnabled.value=!cameraEnabled.value;await drawVideo()}
  catch(e){voiceError.value=e instanceof Error?e.message:'No se pudo cambiar la cámara.'}
}
watch(canSpeak,async allowed=>{
  if(!voiceConnected.value)return
  try{await voice.setMicrophone(allowed)}catch(e){voiceError.value=e instanceof Error?e.message:'No se pudo cambiar el micrófono.'}
})
watch(activeId,()=>{if(voiceConnected.value)void disconnectVoice()})
const open=(id:string)=>{activeId.value=id}
watch(activeId,id=>{stopRoom?.();stopChat?.();room.value=null;messages.value=[];if(!id)return;stopRoom=debateService.subscribeRoom(id,v=>room.value=v);stopChat=debateService.subscribeChat(id,v=>messages.value=v)})
const checkExpiredTurn=async()=>{
  const current=room.value
  if(!current||current.status!=='active'||current.speakerStartedAt===null||!activeId.value)return
  if(myRole.value!=='participant'||!uid.value||countdown.value>0||expirationInFlight)return
  if(Date.now()-lastExpiryAttempt<3000)return
  expirationInFlight=true
  lastExpiryAttempt=Date.now()
  try{await debateService.advanceExpiredTurn(current.id,uid.value,current.speakerStartedAt)}
  catch(e){console.warn('No se pudo avanzar el turno automáticamente.',e)}
  finally{expirationInFlight=false}
}
onMounted(()=>{stopRooms=debateService.subscribeRooms(v=>rooms.value=v);ticker=setInterval(()=>{now.value=Date.now();void checkExpiredTurn()},500)})
onBeforeUnmount(()=>{stopRooms?.();stopRoom?.();stopChat?.();if(ticker)clearInterval(ticker);void disconnectVoice()})
const create=async()=>{if(!uid.value)return;busy.value=true;error.value='';try{const id=await debateService.create({uid:uid.value,name:name.value,topic:topic.value,rite:rite.value,level:level.value,turnSeconds:turnSeconds.value});open(id)}catch(e){error.value=e instanceof Error?e.message:'No fue posible crear la sala.'}finally{busy.value=false}}
const enter=(value:DebateRoom)=>{error.value='';open(value.id)}
const join=async(role:'participant'|'spectator')=>{if(!uid.value||!activeId.value)return;busy.value=true;error.value='';try{await debateService.join(activeId.value,uid.value,name.value,role)}catch(e){error.value=e instanceof Error?e.message:'No se pudo ingresar.'}finally{busy.value=false}}
const runAction=async(action:'start'|'next'|'finish')=>{busy.value=true;error.value='';try{if(action==='start')await debateService.start(activeId.value,uid.value);else if(action==='next')await debateService.nextSpeaker(activeId.value,uid.value);else await debateService.finish(activeId.value,uid.value)}catch(e){error.value=e instanceof Error?e.message:'Error al actualizar el debate.'}finally{busy.value=false}}
const sendMessage=async()=>{busy.value=true;error.value='';try{await debateService.sendMessage(activeId.value,uid.value,name.value,draft.value);draft.value=''}catch(e){error.value=e instanceof Error?e.message:'No se pudo enviar.'}finally{busy.value=false}}
</script>
<style scoped>
.debate{min-height:100vh;padding:24px 16px 65px;background:radial-gradient(circle at 50% 0%,#19344a,#050b13 60%);color:#e9dec8}.debate>*{max-width:1060px;margin:0 auto 20px}.debate header{display:flex;align-items:flex-start;gap:20px}.debate h1,.debate h2,.debate h3{font-family:Georgia,serif;color:#dfc57d}.debate h1{font-size:clamp(28px,4vw,42px);margin:4px 0}.debate h2{margin:0 0 14px}.debate p{line-height:1.5;color:#cfc4aa}.debate small{color:#b99b55;letter-spacing:.06em}.panel{padding:20px;border:1px solid #6a5a32;border-radius:15px;background:#0e1c2b}.panel label{display:block;margin:10px 0;color:#e9dec8}.panel label input,.panel label select{display:block;margin-top:5px;width:100%;max-width:560px}.debate input,.debate select{border:1px solid #6b6b67;border-radius:8px;padding:11px;background:#152b3b;color:#f2ead4}.debate button{cursor:pointer;border:1px solid #8e7b4c;border-radius:9px;padding:10px 13px;background:#243a4d;color:#f5e5b6}.debate button:disabled{opacity:.4;cursor:default}.debate button.primary{background:#b99b55;color:#0c1723;font-weight:700}.entry,.header-row,.actions{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}.entry{padding:14px 0;border-bottom:1px solid #53482f}.entry p{margin:3px 0}.speaker{text-align:center;padding:20px;border-radius:12px;background:#172e41;margin:16px 0}.speaker strong{font-size:38px;color:#e6cf88}.speaker h3{font-size:26px}.columns{display:grid;grid-template-columns:1fr 1fr;gap:20px}.messages{max-height:300px;overflow:auto}.messages p{padding:8px;border-bottom:1px solid #374458}.panel form{display:flex;gap:10px}.panel form input{flex:1}.error{color:#ffb7a8!important}.notice{font-size:12px;opacity:.8}@media(max-width:650px){.columns{grid-template-columns:1fr}.panel form{flex-direction:column}}
.video-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:12px;margin:18px 0}.video-tile{overflow:hidden;border:1px solid #7a6c48;border-radius:12px;background:#06111c}.video-frame{width:100%;aspect-ratio:4/3;background:#0b1621}.video-tile span{display:block;padding:8px 12px;font-size:12px;color:#eed6a0}
</style>
