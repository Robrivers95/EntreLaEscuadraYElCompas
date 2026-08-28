<template>
  <div class="question-form">
    <div class="form-title-row">
      <div><span class="eyebrow">Editor universal</span><h2>{{ isEditing ? 'Editar pregunta' : 'Agregar pregunta' }}</h2><p class="form-help">Una sola pregunta puede alimentar el tablero, el 1vs1 y el modo estudio.</p></div>
      <span v-if="isEditing" class="editing-badge">Editando</span>
    </div>

    <form @submit.prevent="submitForm" class="form">
      <div class="form-group"><label>Pregunta</label><textarea v-model="formData.text" required class="form-input textarea" placeholder="Escribe una pregunta clara…"></textarea></div>

      <div class="form-row three">
        <div class="form-group"><label>Banco / rito</label><select v-model="formData.rite" required class="form-input"><option v-for="rite in rites" :key="rite.value" :value="rite.value">{{ rite.label }}</option></select></div>
        <div class="form-group"><label>Categoría / casilla</label><select v-model="formData.category" required class="form-input"><option v-for="category in categories" :key="category" :value="category">{{ category }}</option></select></div>
        <div class="form-group"><label>Nivel</label><select v-model="formData.difficulty" required class="form-input" :disabled="openBank"><option v-if="openBank" value="general">General · libre</option><template v-else><option value="aprendiz">Aprendiz</option><option value="compañero">Compañero</option><option value="maestro">Maestro</option></template></select></div>
      </div>

      <section class="usage-box">
        <div><span class="eyebrow">Dónde aparece</span><h3>Usar esta pregunta en</h3><p>Déjala marcada en los tres para administrar un solo banco central.</p></div>
        <div class="mode-toggles"><label v-for="mode in ALL_GAME_MODES" :key="mode" class="mode-toggle" :class="{selected:formData.gameModes.includes(mode)}"><input v-model="formData.gameModes" type="checkbox" :value="mode" /><span>{{ modeIcon(mode) }}</span><b>{{ GAME_MODE_LABELS[mode] }}</b></label></div>
        <label class="enabled-toggle"><input v-model="formData.enabled" type="checkbox" /> Pregunta activa</label>
      </section>

      <section class="media-editor">
        <div class="media-copy"><span class="eyebrow">Imagen opcional</span><h3>Haz la pregunta más visual</h3><p>JPG, PNG, WebP, GIF o SVG; máximo 8 MB. La misma imagen aparece en todos los modos seleccionados.</p></div>
        <div class="media-controls">
          <label class="upload-button">🖼 Seleccionar imagen<input type="file" accept="image/*" @change="selectImage" /></label>
          <input v-model="formData.imageUrl" class="form-input" placeholder="O pega una URL de imagen" />
          <input v-model="formData.imageAlt" class="form-input" placeholder="Descripción accesible, ej. Árbol de la Vida" />
          <button v-if="imagePreview" class="remove-image" type="button" @click="removeImage">Quitar imagen</button>
        </div>
        <div v-if="imagePreview" class="image-preview"><img :src="imagePreview" :alt="formData.imageAlt || 'Vista previa de la pregunta'" /><span v-if="imageFile">Se subirá al guardar · {{ prettyBytes(imageFile.size) }}</span><span v-else>Imagen actual</span></div>
      </section>

      <div class="form-group">
        <div class="options-title"><label>Incisos A–D</label><span>Marca la respuesta correcta</span></div>
        <div v-for="(_option,index) in formData.options" :key="index" class="option-input"><span class="option-letter">{{ String.fromCharCode(65+index) }}</span><input v-model="formData.options[index]" required class="form-input" :placeholder="`Opción ${String.fromCharCode(65+index)}`" /><label class="correct-answer-label" :class="{selected:formData.correctAnswer===index}"><input v-model.number="formData.correctAnswer" type="radio" name="correct" :value="index" /> Correcta</label></div>
      </div>

      <div class="direct-answer-box"><div class="form-group"><label>Respuesta corta “sin incisos”</label><input v-model="formData.directAnswer" class="form-input" placeholder="Opcional; si queda vacía se usa la opción correcta" /></div><div class="form-group"><label>Variantes aceptadas</label><input v-model="formData.acceptedDirectAnswersText" class="form-input" placeholder="Separadas por coma" /></div></div>
      <div class="form-row"><div class="form-group"><label>Explicación</label><textarea v-model="formData.explanation" class="form-input explanation" placeholder="Se muestra después de responder"></textarea></div><div class="form-group"><label>Fuente / referencia</label><textarea v-model="formData.source" class="form-input explanation" placeholder="Liturgia, libro, fuente pública, etc."></textarea></div></div>
      <div class="form-group"><label>Etiquetas</label><input v-model="formData.tagsText" class="form-input" placeholder="Ej. sefirot, simbolismo, historia (separadas por coma)" /></div>

      <div class="points-preview"><span>Incisos: <strong>{{ normalPoints }} pts</strong></span><span>Sin incisos: <strong>{{ directPoints }} pts</strong></span><span>Modos: <strong>{{ formData.gameModes.length }}/3</strong></span><span v-if="imagePreview">Imagen: <strong>sí</strong></span></div>
      <div v-if="uploadError" class="upload-error">{{ uploadError }}</div>
      <div class="form-actions"><button class="btn-submit" type="submit" :disabled="uploading">{{ uploading ? 'Subiendo imagen…' : isEditing ? 'Guardar cambios' : '＋ Agregar al banco' }}</button><button class="btn-cancel" type="button" :disabled="uploading" @click="isEditing ? cancelEdit() : resetForm()">{{ isEditing ? 'Cancelar' : 'Limpiar' }}</button></div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ALL_GAME_MODES, GAME_MODE_LABELS, GENERAL_CATEGORIES, KABBALAH_CATEGORIES, getBasePoints, getQuestionGameModes, MASONIC_CATEGORIES, MASONIC_RITES } from '@/modules/questions/questionRules'
import { questionImageService } from '@/modules/questions/questionImageService'
import type { MasonicRite, Question, QuestionDifficulty, QuestionGameMode } from '@/modules/questions/types'

type QuestionInput=Omit<Question,'id'|'createdAt'|'updatedAt'>
interface Props{editingQuestion?:Question|null} interface Emits{(e:'submit',question:QuestionInput):void;(e:'cancel'):void}
const props=defineProps<Props>();const emit=defineEmits<Emits>();const rites=MASONIC_RITES
interface FormData{text:string;rite:MasonicRite;category:string;difficulty:QuestionDifficulty;options:string[];correctAnswer:number;directAnswer:string;acceptedDirectAnswersText:string;explanation:string;source:string;gameModes:QuestionGameMode[];enabled:boolean;tagsText:string;imageUrl:string;imageAlt:string;imageStoragePath:string}
const createEmptyForm=():FormData=>({text:'',rite:'reaa',category:MASONIC_CATEGORIES[0],difficulty:'aprendiz',options:['','','',''],correctAnswer:0,directAnswer:'',acceptedDirectAnswersText:'',explanation:'',source:'',gameModes:[...ALL_GAME_MODES],enabled:true,tagsText:'',imageUrl:'',imageAlt:'',imageStoragePath:''})
const formData=ref<FormData>(createEmptyForm());const imageFile=ref<File|null>(null);const localPreview=ref('');const uploading=ref(false);const uploadError=ref('')
const isEditing=computed(()=>Boolean(props.editingQuestion));const openBank=computed(()=>formData.value.rite==='libre'||formData.value.rite==='kabala');const categories=computed(()=>formData.value.rite==='libre'?[...GENERAL_CATEGORIES]:formData.value.rite==='kabala'?[...KABBALAH_CATEGORIES]:[...MASONIC_CATEGORIES]);const normalPoints=computed(()=>getBasePoints(formData.value.difficulty));const directPoints=computed(()=>normalPoints.value*2);const imagePreview=computed(()=>localPreview.value||formData.value.imageUrl)
const modeIcon=(mode:QuestionGameMode)=>mode==='board'?'🎲':mode==='duel'?'⚔':'📖';const prettyBytes=(bytes:number)=>bytes<1024*1024?`${Math.round(bytes/1024)} KB`:`${(bytes/1024/1024).toFixed(1)} MB`

const clearLocalPreview=()=>{if(localPreview.value?.startsWith('blob:'))URL.revokeObjectURL(localPreview.value);localPreview.value=''}
watch(()=>formData.value.rite,(rite)=>{if(rite==='libre'){formData.value.difficulty='general';formData.value.category=GENERAL_CATEGORIES[0]}else if(rite==='kabala'){formData.value.difficulty='general';formData.value.category=KABBALAH_CATEGORIES[0]}else{if(formData.value.difficulty==='general')formData.value.difficulty='aprendiz';if(!MASONIC_CATEGORIES.includes(formData.value.category as typeof MASONIC_CATEGORIES[number]))formData.value.category=MASONIC_CATEGORIES[0]}})
watch(()=>props.editingQuestion,(q)=>{clearLocalPreview();imageFile.value=null;if(!q){formData.value=createEmptyForm();return}formData.value={text:q.text,rite:q.rite??'reaa',category:q.category,difficulty:q.difficulty,options:[...q.options],correctAnswer:q.correctAnswer,directAnswer:q.directAnswer??'',acceptedDirectAnswersText:(q.acceptedDirectAnswers??[]).join(', '),explanation:q.explanation??'',source:q.source??'',gameModes:[...getQuestionGameModes(q)],enabled:q.enabled!==false,tagsText:(q.tags??[]).join(', '),imageUrl:q.imageUrl??'',imageAlt:q.imageAlt??'',imageStoragePath:q.imageStoragePath??''}},{immediate:true})
watch(()=>formData.value.imageUrl,()=>{if(!imageFile.value) localPreview.value=''})

const selectImage=(event:Event)=>{const input=event.target as HTMLInputElement;const file=input.files?.[0];if(!file)return;try{questionImageService.validate(file);clearLocalPreview();imageFile.value=file;localPreview.value=URL.createObjectURL(file);uploadError.value=''}catch(error){input.value='';uploadError.value=error instanceof Error?error.message:'Imagen no válida.'}}
const removeImage=()=>{clearLocalPreview();imageFile.value=null;formData.value.imageUrl='';formData.value.imageAlt='';formData.value.imageStoragePath=''}
const resetForm=()=>{clearLocalPreview();imageFile.value=null;uploadError.value='';formData.value=createEmptyForm()};const cancelEdit=()=>{resetForm();emit('cancel')}

const submitForm=async()=>{const options=formData.value.options.map(v=>v.trim());if(options.some(v=>!v)){alert('Completa los cuatro incisos.');return}if(!formData.value.gameModes.length){alert('Selecciona al menos un modo de juego.');return}uploading.value=true;uploadError.value='';try{let imageUrl=formData.value.imageUrl.trim()||undefined;let imageStoragePath=formData.value.imageStoragePath||undefined;if(imageFile.value){const uploaded=await questionImageService.upload(imageFile.value);imageUrl=uploaded.url;imageStoragePath=uploaded.storagePath}const acceptedDirectAnswers=formData.value.acceptedDirectAnswersText.split(',').map(v=>v.trim()).filter(Boolean);const tags=formData.value.tagsText.split(',').map(v=>v.trim()).filter(Boolean);emit('submit',{text:formData.value.text.trim(),rite:formData.value.rite,category:formData.value.category,difficulty:formData.value.difficulty,options,correctAnswer:formData.value.correctAnswer,directAnswer:formData.value.directAnswer.trim()||options[formData.value.correctAnswer],acceptedDirectAnswers,explanation:formData.value.explanation.trim()||undefined,source:formData.value.source.trim()||undefined,gameModes:[...formData.value.gameModes],enabled:formData.value.enabled,tags,imageUrl,imageAlt:formData.value.imageAlt.trim()||undefined,imageStoragePath});if(!isEditing.value)resetForm()}catch(error){console.error(error);uploadError.value=error instanceof Error?error.message:'No se pudo subir la imagen.'}finally{uploading.value=false}}
</script>

<style scoped>
.question-form{background:linear-gradient(145deg,rgba(13,35,58,.96),rgba(4,12,21,.96));border:1px solid rgba(213,183,97,.45);border-radius:16px;padding:24px;margin-bottom:24px;box-shadow:0 18px 55px rgba(0,0,0,.35)}.form-title-row,.options-title,.points-preview{display:flex;align-items:center;justify-content:space-between;gap:12px}.eyebrow{font-size:9px;text-transform:uppercase;letter-spacing:1.7px;color:#caa94f}.question-form h2{color:#ead17d;margin:2px 0;font:700 28px Georgia}.form-help,.options-title span{color:rgba(240,230,200,.55);font-size:12px}.editing-badge{background:#c9a84c;color:#06101a;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:900}.form{display:flex;flex-direction:column;gap:17px;margin-top:20px}.form-row{display:grid;grid-template-columns:1fr 1fr;gap:13px}.form-row.three{grid-template-columns:1.25fr 1fr .8fr}.form-group{display:flex;flex-direction:column;gap:6px}.form-group label{color:#eadfc7;font-weight:700;font-size:12px}.form-input{padding:11px 12px;background:rgba(255,255,255,.035);border:1px solid rgba(213,183,97,.28);border-radius:8px;color:#f0e6c8;font:inherit}.form-input:focus{outline:none;border-color:#c9a84c;box-shadow:0 0 0 3px rgba(201,168,76,.09)}.textarea{min-height:90px}.explanation{min-height:72px}.usage-box,.media-editor{display:grid;grid-template-columns:1fr 1.6fr auto;gap:15px;align-items:center;padding:15px;border:1px solid rgba(85,157,197,.28);border-radius:12px;background:rgba(42,104,141,.08)}.usage-box h3,.media-editor h3{margin:2px 0;color:#d8e8ee}.usage-box p,.media-editor p{margin:0;font-size:11px;color:rgba(230,239,240,.5)}.mode-toggles{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.mode-toggle{display:flex;align-items:center;justify-content:center;gap:6px;padding:9px;border:1px solid rgba(213,183,97,.2);border-radius:8px;cursor:pointer;color:#cdbf9d}.mode-toggle input{display:none}.mode-toggle.selected{border-color:#c9a84c;background:rgba(201,168,76,.12);color:#f1da91}.enabled-toggle{font-size:11px;color:#8fd1a2;white-space:nowrap}.media-editor{grid-template-columns:.8fr 1.15fr .75fr}.media-controls{display:grid;gap:7px}.upload-button{display:flex;justify-content:center;padding:10px;border:1px dashed #c9a84c;border-radius:8px;color:#ead17d;cursor:pointer;font-weight:800}.upload-button input{display:none}.remove-image{border:1px solid rgba(190,80,75,.45);background:transparent;color:#e6aaa5;border-radius:7px;padding:7px}.image-preview{position:relative;border:1px solid rgba(213,183,97,.25);border-radius:10px;overflow:hidden;background:#050b12}.image-preview img{display:block;width:100%;height:170px;object-fit:contain}.image-preview span{display:block;padding:6px 8px;font-size:9px;color:rgba(240,230,200,.55)}.option-input{display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:9px;margin-top:8px}.option-letter{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:rgba(201,168,76,.13);color:#d9bd63;font-weight:900}.correct-answer-label{display:flex;align-items:center;gap:5px;border:1px solid rgba(213,183,97,.24);border-radius:7px;padding:9px;white-space:nowrap}.correct-answer-label.selected{border-color:#5fbb72;background:rgba(95,187,114,.1);color:#95d9a3}.direct-answer-box{display:grid;grid-template-columns:1fr 1fr;gap:13px;padding:14px;border:1px dashed rgba(213,183,97,.35);border-radius:10px}.points-preview{padding:11px 15px;background:rgba(0,0,0,.22);border-radius:9px;color:#cbbd9e;font-size:12px}.points-preview strong{color:#e2c873}.upload-error{padding:9px 12px;border-left:3px solid #bd5650;background:rgba(189,86,80,.08);color:#efa7a3;font-size:11px}.form-actions{display:flex;gap:9px}.btn-submit,.btn-cancel{padding:12px 17px;border-radius:8px;font-weight:900}.btn-submit{flex:1;border:0;background:linear-gradient(135deg,#e1c36c,#8b6914);color:#06101a}.btn-submit:disabled{opacity:.5}.btn-cancel{border:1px solid rgba(213,183,97,.3);background:transparent;color:#ddd0ae}@media(max-width:850px){.form-row,.form-row.three,.usage-box,.media-editor,.direct-answer-box{grid-template-columns:1fr}.mode-toggles{grid-template-columns:1fr 1fr 1fr}.option-input{grid-template-columns:30px 1fr}.correct-answer-label{grid-column:2}.points-preview{align-items:flex-start;flex-direction:column}.image-preview img{height:230px}}
</style>
