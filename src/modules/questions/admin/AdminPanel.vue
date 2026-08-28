<template>
  <div class="admin-panel">
    <header class="panel-header">
      <div><span class="eyebrow">Administración</span><h1>Banco central de preguntas</h1><p>Crea una vez y decide si la pregunta aparece en tablero, 1vs1, estudio o en los tres.</p></div>
      <div class="header-actions"><button class="btn-back" @click="$router.push('/lobby')">← Lobby</button><button class="btn-seed" :disabled="seeding" @click="importStarterQuestions">{{ seeding ? 'Importando…' : '＋ Importar bancos iniciales' }}</button></div>
    </header>

    <section class="metrics"><article><small>Preguntas remotas</small><strong>{{ questionsStore.questions.length }}</strong></article><article><small>🎲 Tablero</small><strong>{{ countByMode('board') }}</strong></article><article><small>⚔ 1vs1</small><strong>{{ countByMode('duel') }}</strong></article><article><small>📖 Estudio</small><strong>{{ countByMode('study') }}</strong></article><article class="kabala"><small>✦ Kabbalah</small><strong>{{ countByRite('kabala') }}</strong></article></section>

    <QuestionForm :editing-question="editingQuestion" @submit="handleSubmitQuestion" @cancel="editingQuestion=null" />

    <section class="questions-list">
      <div class="list-controls">
        <input v-model="searchText" class="filter-input search" placeholder="Buscar pregunta, respuesta, fuente o etiqueta…" />
        <select v-model="filterRite" class="filter-select"><option value="">Todos los bancos</option><option v-for="rite in MASONIC_RITES" :key="rite.value" :value="rite.value">{{ rite.shortLabel }}</option></select>
        <select v-model="filterDifficulty" class="filter-select"><option value="">Todos los niveles</option><option value="aprendiz">Aprendiz</option><option value="compañero">Compañero</option><option value="maestro">Maestro</option><option value="general">General</option></select>
        <select v-model="filterMode" class="filter-select"><option value="">Todos los modos</option><option value="board">🎲 Tablero</option><option value="duel">⚔ 1vs1</option><option value="study">📖 Estudio</option></select>
        <select v-model="filterStatus" class="filter-select"><option value="">Activas e inactivas</option><option value="active">Activas</option><option value="inactive">Inactivas</option></select>
        <button class="btn-refresh" :disabled="questionsStore.loading" @click="reloadQuestions">↻</button>
      </div>

      <div class="summary-row"><span><strong>{{ filteredQuestions.length }}</strong> visibles</span><span>REAA {{ countByRite('reaa') }}</span><span>York {{ countByRite('york') }}</span><span>Francés {{ countByRite('frances') }}</span><span>RNM {{ countByRite('nacional-mexicano') }}</span><span>Kabbalah {{ countByRite('kabala') }}</span><span>Libre {{ countByRite('libre') }}</span></div>

      <div v-if="questionsStore.error" class="status-message error">{{ questionsStore.error }}</div>
      <div v-if="questionsStore.loading" class="status-message">Cargando banco…</div>
      <div v-else-if="!filteredQuestions.length" class="no-questions"><h3>No hay preguntas con estos filtros</h3><p>Crea una arriba o importa los bancos iniciales.</p></div>

      <div v-else class="questions-grid">
        <article v-for="question in filteredQuestions" :key="question.id" class="question-card" :class="{inactive:question.enabled===false,kabala:getQuestionRite(question)==='kabala'}">
          <img v-if="question.imageUrl" class="thumb" :src="question.imageUrl" :alt="question.imageAlt || question.text" loading="lazy" />
          <div class="question-header"><span class="rite-badge">{{ RITE_SHORT_LABELS[getQuestionRite(question)] }}</span><span class="difficulty-badge">{{ DIFFICULTY_LABELS[question.difficulty] }}</span><span class="category-badge">{{ question.category }}</span><span v-if="question.enabled===false" class="off-badge">INACTIVA</span></div>
          <p class="question-text">{{ question.text }}</p>
          <div class="mode-row"><span v-for="mode in getQuestionGameModes(question)" :key="mode">{{ modeIcon(mode) }} {{ GAME_MODE_LABELS[mode] }}</span></div>
          <div class="question-options"><div v-for="(option,index) in question.options" :key="index" class="option" :class="{correct:index===question.correctAnswer}"><strong>{{ String.fromCharCode(65+index) }}.</strong> {{ option }}</div></div>
          <p v-if="question.tags?.length" class="tags">#{{ question.tags.join('  #') }}</p><p v-if="question.source" class="source">Fuente: {{ question.source }}</p>
          <div class="question-actions"><button class="btn-edit" @click="startEdit(question)">✏️ Editar</button><button class="btn-duplicate" @click="duplicateQuestion(question)">⧉ Duplicar</button><button class="btn-delete" @click="deleteQuestion(question.id)">🗑️</button></div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed,onMounted,ref } from 'vue'
import QuestionForm from './QuestionForm.vue'
import { STARTER_QUESTIONS,useQuestionsStore } from '@/stores/questionsStore'
import { questionsService } from '@/modules/questions/questionsService'
import { DIFFICULTY_LABELS,GAME_MODE_LABELS,getQuestionGameModes,getQuestionRite,MASONIC_RITES,normalizeAnswer,questionSupportsMode,RITE_SHORT_LABELS } from '@/modules/questions/questionRules'
import type { MasonicRite,Question,QuestionDifficulty,QuestionGameMode } from '@/modules/questions/types'

type QuestionInput=Omit<Question,'id'|'createdAt'|'updatedAt'>
const questionsStore=useQuestionsStore();const editingQuestion=ref<Question|null>(null);const filterRite=ref<MasonicRite|''>('');const filterDifficulty=ref<QuestionDifficulty|''>('');const filterMode=ref<QuestionGameMode|''>('');const filterStatus=ref<'active'|'inactive'|''>('');const searchText=ref('');const seeding=ref(false)
onMounted(()=>reloadQuestions())
const modeIcon=(mode:QuestionGameMode)=>mode==='board'?'🎲':mode==='duel'?'⚔':'📖'
const toQuestionInput=(q:Question):QuestionInput=>({text:q.text,rite:getQuestionRite(q),category:q.category,difficulty:q.difficulty,options:[...q.options],correctAnswer:q.correctAnswer,directAnswer:q.directAnswer,acceptedDirectAnswers:q.acceptedDirectAnswers?[...q.acceptedDirectAnswers]:undefined,explanation:q.explanation,source:q.source,basePoints:q.basePoints,gameModes:[...getQuestionGameModes(q)],enabled:q.enabled!==false,tags:q.tags?[...q.tags]:undefined,imageUrl:q.imageUrl,imageAlt:q.imageAlt,imageStoragePath:q.imageStoragePath})
const reloadQuestions=async()=>{await questionsStore.loadQuestions({force:true,fallbackToDefaults:false})}
const filteredQuestions=computed(()=>{const search=normalizeAnswer(searchText.value);return questionsStore.questions.filter(q=>{const haystack=normalizeAnswer([q.text,...q.options,q.directAnswer??'',q.source??'',...(q.tags??[])].join(' '));return(!filterRite.value||getQuestionRite(q)===filterRite.value)&&(!filterDifficulty.value||q.difficulty===filterDifficulty.value)&&(!filterMode.value||questionSupportsMode(q,filterMode.value))&&(!filterStatus.value||(filterStatus.value==='active'?q.enabled!==false:q.enabled===false))&&(!search||haystack.includes(search))})})
const countByRite=(rite:MasonicRite)=>questionsStore.questions.filter(q=>getQuestionRite(q)===rite).length;const countByMode=(mode:QuestionGameMode)=>questionsStore.questions.filter(q=>questionSupportsMode(q,mode)).length
const startEdit=(q:Question)=>{editingQuestion.value=q;window.scrollTo({top:0,behavior:'smooth'})}
const handleSubmitQuestion=async(q:QuestionInput)=>{try{if(editingQuestion.value){await questionsService.updateQuestion(editingQuestion.value.id,q);questionsStore.updateQuestion(editingQuestion.value.id,q)}else{const id=await questionsService.addQuestion(q);questionsStore.addQuestion({...q,id})}editingQuestion.value=null}catch(error){console.error(error);alert('No se pudo guardar la pregunta.')}}
const duplicateQuestion=async(q:Question)=>{const copy=toQuestionInput(q);const text=`${copy.text} (copia)`;try{const id=await questionsService.addQuestion({...copy,text});questionsStore.addQuestion({...copy,text,id})}catch(error){console.error(error);alert('No se pudo duplicar.')}}
const importStarterQuestions=async()=>{seeding.value=true;try{const existing=new Set(questionsStore.questions.map(q=>`${getQuestionRite(q)}|${normalizeAnswer(q.text)}`));const missing=STARTER_QUESTIONS.filter(q=>!existing.has(`${getQuestionRite(q)}|${normalizeAnswer(q.text)}`));for(const q of missing)await questionsService.addQuestion(toQuestionInput(q));await reloadQuestions();alert(missing.length?`Se agregaron ${missing.length} preguntas, incluido Kabbalah.`:'Los bancos iniciales ya estaban cargados.')}catch(error){console.error(error);alert('No se pudieron importar los bancos.')}finally{seeding.value=false}}
const deleteQuestion=async(id:string)=>{if(!confirm('¿Eliminar esta pregunta?'))return;try{await questionsService.deleteQuestion(id);questionsStore.deleteQuestion(id);if(editingQuestion.value?.id===id)editingQuestion.value=null}catch(error){console.error(error);alert('No se pudo eliminar.')}}
</script>

<style scoped>
.admin-panel{max-width:1280px;margin:0 auto;padding:22px;color:#eee0c2}.panel-header{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:18px}.eyebrow{font-size:9px;text-transform:uppercase;letter-spacing:1.7px;color:#c9a84c}.panel-header h1{color:#e7cc73;font:700 32px Georgia;margin:3px 0}.panel-header p{margin:0;color:rgba(240,230,200,.6)}.header-actions{display:flex;gap:8px}.btn-seed,.btn-back,.btn-refresh{border:1px solid rgba(201,168,76,.5);background:rgba(201,168,76,.09);color:#f0e6c8;border-radius:8px;padding:10px 13px;font-weight:800}.metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:9px;margin-bottom:19px}.metrics article{padding:13px;border:1px solid rgba(214,183,95,.2);border-radius:10px;background:rgba(8,22,36,.72);display:flex;flex-direction:column}.metrics small{font-size:9px;color:rgba(240,230,200,.45);text-transform:uppercase}.metrics strong{font:700 25px Georgia;color:#e2c870}.metrics .kabala{border-color:rgba(87,168,196,.4)}.questions-list{margin-top:25px}.list-controls{display:grid;grid-template-columns:minmax(250px,1.4fr) repeat(4,minmax(115px,.6fr)) auto;gap:8px}.filter-input,.filter-select{padding:10px;background:rgba(255,255,255,.035);border:1px solid rgba(214,183,95,.25);border-radius:7px;color:#f0e6c8}.summary-row{display:flex;gap:13px;flex-wrap:wrap;padding:10px 2px 16px;color:rgba(240,230,200,.52);font-size:11px}.summary-row strong{color:#e0c46d}.status-message,.no-questions{text-align:center;padding:34px;border:1px dashed rgba(214,183,95,.3);border-radius:10px}.error{color:#e99b97}.questions-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(340px,1fr));gap:14px}.question-card{overflow:hidden;background:linear-gradient(145deg,rgba(15,34,54,.92),rgba(5,13,22,.94));border:1px solid rgba(214,183,95,.25);border-radius:13px;padding:15px}.question-card.kabala{border-color:rgba(87,168,196,.38)}.question-card.inactive{opacity:.48}.thumb{width:calc(100% + 30px);height:180px;object-fit:contain;margin:-15px -15px 13px;background:#050b12}.question-header,.mode-row{display:flex;gap:6px;flex-wrap:wrap}.question-header span,.mode-row span{padding:4px 7px;border-radius:99px;font-size:9px;font-weight:800}.rite-badge{background:#c9a84c;color:#07101a}.difficulty-badge,.category-badge,.mode-row span{background:rgba(255,255,255,.05);color:#d8cba9;border:1px solid rgba(214,183,95,.15)}.off-badge{background:#7b3434;color:#fff}.question-text{font-weight:750;line-height:1.4}.mode-row{margin:8px 0}.question-options{padding:9px;border-left:3px solid #b99037;background:rgba(0,0,0,.18)}.option{font-size:12px;padding:3px;color:rgba(240,230,200,.68)}.option.correct{color:#8ed39f}.tags,.source{font-size:10px;color:rgba(240,230,200,.42)}.question-actions{display:grid;grid-template-columns:1fr 1fr auto;gap:6px;margin-top:12px}.question-actions button{padding:8px;border-radius:7px;font-weight:800}.btn-edit{border:1px solid #b99037;background:rgba(185,144,55,.12);color:#eedb9a}.btn-duplicate{border:1px solid #4e789b;background:rgba(78,120,155,.1);color:#b8d8ee}.btn-delete{border:1px solid #924b48;background:rgba(146,75,72,.1);color:#e7a09d}@media(max-width:900px){.panel-header{align-items:stretch;flex-direction:column}.metrics{grid-template-columns:repeat(2,1fr)}.list-controls{grid-template-columns:1fr 1fr}.search{grid-column:1/-1}}@media(max-width:520px){.metrics,.list-controls{grid-template-columns:1fr}.search{grid-column:auto}}
</style>
