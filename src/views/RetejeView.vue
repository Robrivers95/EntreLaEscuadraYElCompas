<template>
  <main class="reteje-view">
    <section class="exam-shell">
      <header class="exam-header"><MasonicSeal :size="112" /><div><span class="eyebrow">Examen de acceso del juego</span><h1>{{ riteLabel }}</h1><p>Este cuestionario usa conocimiento público. No solicita palabras, signos, toques ni datos reservados de reconocimiento.</p></div></header>
      <div v-if="finished" class="result" :class="{pass:passed,fail:!passed}"><div class="result-score">{{ score }}/{{ exam.length }}</div><h2>{{ passed?'Acceso aprobado':'No aprobaste el reteje del juego' }}</h2><p v-if="passed">Tu acceso a {{ riteLabel }} quedó registrado para el nivel {{ levelLabel }}. Entrarás como {{ requestedRole === 'guest' ? 'invitado' : 'jugador' }}.</p><p v-else>No puedes entrar a esa sala o banco todavía. Puedes volver al lobby o intentar nuevamente.</p><div class="result-actions"><button v-if="!passed" class="btn-primary" @click="restart">Intentar de nuevo</button><button class="btn-secondary" @click="router.push('/lobby')">Volver al lobby</button></div></div>
      <form v-else class="exam-card" @submit.prevent="submitExam"><div class="progress"><span :style="{width:`${answeredPercent}%`}"></span></div><article v-for="(question,index) in exam" :key="question.id" class="exam-question"><div class="question-number">{{ index+1 }}</div><div class="question-body"><h3>{{ question.text }}</h3><label v-for="(option,optionIndex) in question.options" :key="option" class="exam-option"><input v-model="answers[index]" type="radio" :name="question.id" :value="optionIndex" /><span class="letter">{{ String.fromCharCode(65+optionIndex) }}</span><span>{{ option }}</span></label></div></article><button class="btn-primary submit" :disabled="answers.some(answer=>answer===null)">Calificar reteje</button></form>
      <aside class="notice"><strong>Importante:</strong> este examen sólo controla acceso dentro del juego. No sustituye un reteje oficial ni acredita grado, regularidad o pertenencia masónica.</aside>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed,onMounted,ref } from 'vue'
import { useRoute,useRouter } from 'vue-router'
import MasonicSeal from '@/shared/MasonicSeal.vue'
import { useAuthStore } from '@/stores/authStore'
import { useAccessStore } from '@/stores/accessStore'
import { useRoomStore } from '@/stores/roomStore'
import { RITE_EXAMS } from '@/modules/game/access/riteAccess'
import type { RiteExamQuestion,RoomLevel } from '@/modules/game/access/riteAccess'
import { RITE_LABELS } from '@/modules/questions/questionRules'
import type { MasonicRite } from '@/modules/questions/types'

type ExamRite=Exclude<MasonicRite,'libre'|'kabala'|'otro'>
const route=useRoute(),router=useRouter(),authStore=useAuthStore(),accessStore=useAccessStore(),roomStore=useRoomStore()
const rite=computed<MasonicRite>(()=>(route.query.rite as MasonicRite)||'reaa')
const level=computed<RoomLevel>(()=>(route.query.level as RoomLevel)||'aprendiz')
const requestedRole=computed<'player'|'guest'>(()=>route.query.role==='guest'?'guest':'player')
const riteLabel=computed(()=>RITE_LABELS[rite.value]||'Rito')
const levelLabel=computed(()=>level.value==='general'?'General':level.value[0].toUpperCase()+level.value.slice(1))
const exam=ref<RiteExamQuestion[]>([]),answers=ref<Array<number|null>>([]),finished=ref(false),score=ref(0)
const passed=computed(()=>score.value>=Math.ceil(exam.value.length*.8))
const answeredPercent=computed(()=>exam.value.length?answers.value.filter(a=>a!==null).length/exam.value.length*100:0)
const shuffle=<T,>(items:T[])=>[...items].sort(()=>Math.random()-.5)
const loadExam=()=>{if(rite.value==='libre'||rite.value==='kabala'||rite.value==='otro'){router.replace('/lobby');return}const bank=RITE_EXAMS[rite.value as ExamRite];exam.value=shuffle(bank).slice(0,5);answers.value=exam.value.map(()=>null)}
onMounted(loadExam)
const restart=()=>{finished.value=false;score.value=0;loadExam()}
const submitExam=async()=>{
  score.value=exam.value.reduce((total,q,index)=>total+(answers.value[index]===q.correctAnswer?1:0),0)
  finished.value=true
  if(!passed.value||!authStore.currentUser)return
  await accessStore.certify(authStore.currentUser.uid,rite.value,level.value,score.value)
  const roomId=route.query.room as string|undefined
  if(roomId&&authStore.profile){
    try{
      const base={uid:authStore.currentUser.uid,name:authStore.profile.name,degree:authStore.masonicDegree,joinedAt:Date.now()}
      if(requestedRole.value==='guest')await roomStore.joinGuest(roomId,base)
      else await roomStore.joinRoom(roomId,{...base,position:0,score:0})
      window.setTimeout(()=>router.push(`/game/turns?room=${roomId}`),500)
      return
    }catch(error){console.error(error)}
  }
  const returnTo=route.query.returnTo as string|undefined
  if(returnTo?.startsWith('/'))window.setTimeout(()=>router.push(returnTo),500)
}
</script>

<style scoped>
.reteje-view{min-height:100vh;padding:28px 18px 60px;background:radial-gradient(circle at 50% -10%,rgba(32,77,128,.36),transparent 40%),linear-gradient(180deg,#071221,#03070d 65%)}.exam-shell{max-width:920px;margin:0 auto}.exam-header{display:grid;grid-template-columns:auto 1fr;gap:22px;align-items:center;padding:18px 0 28px;border-bottom:1px solid rgba(214,183,95,.28)}.eyebrow{font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#d6b75f;font-weight:900}.exam-header h1{margin:4px 0;color:#f2ddb0;font-family:Georgia,serif;font-size:34px}.exam-header p{margin:0;color:rgba(240,230,200,.66);max-width:680px}.exam-card{margin-top:24px;display:grid;gap:16px}.progress{height:5px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden}.progress span{display:block;height:100%;background:linear-gradient(90deg,#9d7620,#e7ca77);transition:.25s}.exam-question{display:grid;grid-template-columns:44px 1fr;gap:14px;padding:20px;border:1px solid rgba(214,183,95,.3);background:rgba(4,13,24,.86);border-radius:14px}.question-number{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;border:1px solid #b58d35;color:#e7ca77;font-weight:900}.question-body h3{margin:4px 0 14px;color:#f3e5c8;font-size:18px}.exam-option{display:grid;grid-template-columns:auto 32px 1fr;gap:9px;align-items:center;padding:9px;border-radius:8px;color:rgba(243,229,200,.82)}.letter{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:rgba(214,183,95,.1);color:#e7ca77;font-weight:900}.btn-primary,.btn-secondary{padding:13px 18px;border-radius:9px;font-weight:900}.btn-primary{border:none;background:linear-gradient(135deg,#e2c46e,#8b6914);color:#07101c}.btn-primary:disabled{opacity:.4}.btn-secondary{border:1px solid #9e7c31;background:transparent;color:#e9d7ad}.submit{justify-self:end;min-width:220px}.notice{margin-top:22px;padding:14px 16px;border-left:3px solid #b58d35;background:rgba(181,141,53,.07);color:rgba(243,229,200,.62);font-size:12px}.result{margin-top:28px;text-align:center;padding:36px;border-radius:16px;border:1px solid}.result.pass{border-color:rgba(72,179,107,.6);background:rgba(72,179,107,.08)}.result.fail{border-color:rgba(211,89,79,.55);background:rgba(211,89,79,.08)}.result-score{font-size:54px;font-family:Georgia,serif;color:#e7ca77}.result h2{color:#f3e5c8}.result p{color:rgba(243,229,200,.7)}.result-actions{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-top:18px}@media(max-width:600px){.exam-header{grid-template-columns:1fr;text-align:center}.exam-question{grid-template-columns:1fr}.question-number{margin:auto}.submit{justify-self:stretch}}
</style>
