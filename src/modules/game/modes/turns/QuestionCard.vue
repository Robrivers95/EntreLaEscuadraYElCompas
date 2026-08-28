<template>
  <div class="question-card judge-card">
    <div class="question-header">
      <div class="rite-badge">{{ riteLabel }}</div>
      <div class="difficulty-badge" :class="question.difficulty">{{ difficultyLabel }}</div>
      <div class="category-badge">{{ question.category }}</div>
    </div>

    <div class="role-banner">
      <span>📖 Tú lees y calificas</span>
      <strong>{{ respondentName }} responde en voz alta</strong>
      <small>No le muestres tu pantalla al respondedor.</small>
    </div>

    <QuestionMedia :question="question" />

    <div class="question-content">
      <h3>{{ question.text }}</h3>

      <div class="options-container">
        <div
          v-for="(option,index) in question.options"
          :key="index"
          class="readonly-option"
          :class="{ correct: index === question.correctAnswer }"
        >
          <span class="option-letter">{{ String.fromCharCode(65+index) }}</span>
          <span>{{ option }}</span>
          <em v-if="index === question.correctAnswer">Correcta</em>
        </div>
      </div>

      <div class="answer-key">
        <span>Respuesta correcta</span>
        <strong>{{ correctLetter }} · {{ correctOption }}</strong>
        <small v-if="question.directAnswer && question.directAnswer !== correctOption">Respuesta directa aceptada: {{ question.directAnswer }}</small>
        <p v-if="question.explanation">{{ question.explanation }}</p>
      </div>

      <div class="judge-actions">
        <button class="judge-btn direct" @click="resolve(true,'direct')">
          <span>✓</span>
          <div><strong>Correcta sin incisos</strong><small>{{ directPoints }} pts</small></div>
        </button>
        <button class="judge-btn options" @click="resolve(true,'multiple-choice')">
          <span>✓</span>
          <div><strong>Correcta con incisos</strong><small>{{ normalPoints }} pts</small></div>
        </button>
        <button class="judge-btn incorrect" @click="resolve(false,'multiple-choice')">
          <span>×</span>
          <div><strong>Respuesta incorrecta</strong><small>0 pts</small></div>
        </button>
      </div>
    </div>

    <button class="btn-skip" @click="$emit('skip')">Anular / saltar esta pregunta</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import QuestionMedia from '@/modules/questions/QuestionMedia.vue'
import { DIFFICULTY_LABELS, getQuestionPoints, getQuestionRite, RITE_SHORT_LABELS } from '@/modules/questions/questionRules'
import type { AnswerMode, Question } from '@/modules/questions/types'

interface Props {
  question: Question
  respondentName?: string
}
interface Resolution { correct: boolean; mode: AnswerMode }
interface Emits {
  (e: 'resolved', resolution: Resolution): void
  (e: 'skip'): void
}

const props = withDefaults(defineProps<Props>(), { respondentName: 'El jugador en turno' })
const emit = defineEmits<Emits>()

const difficultyLabel = computed(() => DIFFICULTY_LABELS[props.question.difficulty])
const riteLabel = computed(() => RITE_SHORT_LABELS[getQuestionRite(props.question)])
const normalPoints = computed(() => getQuestionPoints(props.question, 'multiple-choice'))
const directPoints = computed(() => getQuestionPoints(props.question, 'direct'))
const correctOption = computed(() => props.question.options[props.question.correctAnswer] ?? '—')
const correctLetter = computed(() => String.fromCharCode(65 + props.question.correctAnswer))

const resolve = (correct: boolean, mode: AnswerMode) => emit('resolved', { correct, mode })
</script>

<style scoped>
.question-card{background:radial-gradient(circle at 50% 0%,rgba(201,168,76,.13),rgba(13,23,34,.97) 58%);border:1px solid rgba(201,168,76,.62);border-radius:18px;padding:22px;max-width:590px;margin:0 auto;box-shadow:0 22px 55px rgba(0,0,0,.38),inset 0 1px rgba(255,255,255,.04)}.question-header{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:12px}.rite-badge,.difficulty-badge,.category-badge{padding:5px 10px;border-radius:999px;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.04em}.rite-badge{background:#c9a84c;color:#071019}.difficulty-badge{color:white}.difficulty-badge.aprendiz{background:#39784a}.difficulty-badge.compañero{background:#a06d16}.difficulty-badge.maestro{background:#8c3330}.difficulty-badge.general{background:#2f6d82}.category-badge{border:1px solid rgba(201,168,76,.36);color:#e9d99e;background:rgba(201,168,76,.08)}.role-banner{display:flex;flex-direction:column;gap:3px;margin-bottom:14px;padding:12px 14px;border-radius:12px;border:1px solid rgba(86,171,132,.32);background:rgba(42,112,84,.12)}.role-banner span{font-size:10px;color:#86d5ac;text-transform:uppercase;letter-spacing:.12em;font-weight:900}.role-banner strong{color:#eaf4e8}.role-banner small{color:rgba(234,244,232,.5)}.question-content h3{color:#f3e9ca;margin:15px 0 16px;font:700 21px/1.42 Georgia,serif}.options-container{display:grid;gap:8px}.readonly-option{position:relative;display:grid;grid-template-columns:32px 1fr auto;gap:9px;align-items:center;padding:10px 11px;border:1px solid rgba(139,105,20,.55);border-radius:10px;background:rgba(139,105,20,.10);color:#eee0c2}.readonly-option.correct{border-color:rgba(85,179,116,.72);background:rgba(54,142,86,.14)}.option-letter{width:29px;height:29px;border-radius:50%;display:grid;place-items:center;background:rgba(0,0,0,.27);color:#e6c96f;font-weight:900}.readonly-option em{font-style:normal;font-size:9px;color:#8fe0a9;text-transform:uppercase;letter-spacing:.08em}.answer-key{margin-top:15px;padding:13px 14px;border-left:3px solid #5cc084;border-radius:8px;background:rgba(50,130,81,.12)}.answer-key>span{display:block;font-size:9px;color:#78d69d;text-transform:uppercase;letter-spacing:.14em}.answer-key>strong{display:block;margin-top:3px;color:#b7efc8;font-size:16px}.answer-key small{display:block;margin-top:5px;color:rgba(238,224,194,.65)}.answer-key p{margin:8px 0 0;color:#e8dcc1;font-size:12px;line-height:1.4}.judge-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:16px}.judge-btn{display:grid;grid-template-columns:34px 1fr;gap:7px;align-items:center;text-align:left;border-radius:11px;padding:11px;border:1px solid transparent;cursor:pointer;transition:.18s}.judge-btn:hover{transform:translateY(-2px)}.judge-btn>span{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;font-size:20px;font-weight:900}.judge-btn div{display:flex;flex-direction:column}.judge-btn strong{font-size:12px}.judge-btn small{font-size:9px;opacity:.66}.judge-btn.direct{background:linear-gradient(135deg,rgba(53,151,87,.24),rgba(24,74,45,.22));border-color:rgba(95,202,129,.46);color:#baf0ca}.judge-btn.options{background:linear-gradient(135deg,rgba(65,118,169,.25),rgba(24,59,91,.22));border-color:rgba(94,155,211,.46);color:#c2dff7}.judge-btn.incorrect{grid-column:1/-1;background:linear-gradient(135deg,rgba(159,60,55,.23),rgba(82,29,27,.22));border-color:rgba(218,91,83,.46);color:#f1b2ad}.btn-skip{width:100%;margin-top:12px;padding:9px;border:1px solid rgba(201,168,76,.25);border-radius:9px;background:transparent;color:rgba(238,224,194,.5);cursor:pointer}@media(max-width:620px){.question-card{padding:15px}.judge-actions{grid-template-columns:1fr}.judge-btn.incorrect{grid-column:auto}.question-content h3{font-size:18px}}
</style>
