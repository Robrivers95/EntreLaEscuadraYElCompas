import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { questionsService } from '@/modules/questions/questionsService'
import { DEFAULT_QUESTIONS } from '@/modules/questions/defaultQuestions'
import { LEGACY_STARTER_QUESTIONS } from '@/modules/questions/legacyStarterQuestions'
import { REAA_LITURGICAL_QUESTIONS } from '@/modules/questions/reaaLiturgicalQuestions'
import { REAA_NUEVO_LEON_QUESTIONS } from '@/modules/questions/reaaNuevoLeonQuestions'
import { OTHER_RITE_STARTER_QUESTIONS } from '@/modules/questions/otherRiteQuestions'
import { FREE_GENERAL_QUESTIONS } from '@/modules/questions/freeGeneralQuestions'
import { KABBALAH_QUESTIONS } from '@/modules/questions/kabbalahQuestions'
import { getQuestionRite, isOpenKnowledgeBank, isQuestionAllowedForDegree, normalizeAnswer, questionSupportsMode } from '@/modules/questions/questionRules'
import type { MasonicDegree, MasonicRite, Question, QuestionDifficulty, QuestionGameMode } from '@/modules/questions/types'

interface LoadQuestionsOptions { force?: boolean; fallbackToDefaults?: boolean }

const MASONIC_TOOL_IMAGE_IDS = new Set([
  'reaa-a-geometria-01',
  'reaa-a-herramientas-01',
  'reaa-c-geometria-01',
  'reaa-c-herramientas-01',
  'reaa-m-geometria-01',
])

const decorateStarter = (question: Question): Question => {
  if (question.imageUrl) return { ...question }
  const rite = getQuestionRite(question)
  if (rite === 'kabala' && question.id.endsWith('-01')) {
    return { ...question, imageUrl:'/question-art/tree-of-life.svg', imageAlt:'Diagrama de estudio del Árbol de la Vida con diez sefirot.' }
  }
  if (MASONIC_TOOL_IMAGE_IDS.has(question.id)) {
    return { ...question, imageUrl:'/question-art/masonic-tools.svg', imageAlt:'Lámina de herramientas simbólicas: escuadra, compás, mazo, cincel, regla y nivel.' }
  }
  return { ...question }
}

export const STARTER_QUESTIONS = [
  ...REAA_LITURGICAL_QUESTIONS,
  ...REAA_NUEVO_LEON_QUESTIONS,
  ...OTHER_RITE_STARTER_QUESTIONS,
  ...KABBALAH_QUESTIONS,
  ...FREE_GENERAL_QUESTIONS,
  ...DEFAULT_QUESTIONS,
  ...LEGACY_STARTER_QUESTIONS,
].map(decorateStarter)

const questionKey = (question: Question) => `${getQuestionRite(question)}|${normalizeAnswer(question.text)}`

const mergeWithStarters = (remoteQuestions: Question[]): Question[] => {
  const merged = new Map<string, Question>()
  STARTER_QUESTIONS.forEach((question) => merged.set(questionKey(question), { ...question }))
  remoteQuestions.forEach((question) => {
    const key = questionKey(question)
    const starter = merged.get(key)
    merged.set(key, starter ? {
      ...starter,
      ...question,
      imageUrl: question.imageUrl || starter.imageUrl,
      imageAlt: question.imageAlt || starter.imageAlt,
      gameModes: question.gameModes?.length ? question.gameModes : starter.gameModes,
    } : { ...question })
  })
  return Array.from(merged.values())
}

export const useQuestionsStore = defineStore('questions', () => {
  const questions = ref<Question[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const usingDefaultQuestions = ref(false)
  const error = ref<string | null>(null)

  const questionsByCategory = computed(() => {
    const grouped: Record<string, Question[]> = {}
    questions.value.forEach((question) => { if (!grouped[question.category]) grouped[question.category] = []; grouped[question.category].push(question) })
    return grouped
  })
  const categories = computed(() => Array.from(new Set(questions.value.map((q) => q.category))).sort())

  const useDefaults = () => { questions.value = STARTER_QUESTIONS.map((question) => ({ ...question })); usingDefaultQuestions.value = true }

  const loadQuestions = async (options: LoadQuestionsOptions = {}) => {
    const { force = false, fallbackToDefaults = true } = options
    if (loaded.value && !force) { if (fallbackToDefaults && questions.value.length === 0) useDefaults(); return }
    loading.value = true; error.value = null
    try {
      const remoteQuestions = await questionsService.getQuestions()
      if (fallbackToDefaults) { questions.value = mergeWithStarters(remoteQuestions); usingDefaultQuestions.value = true }
      else { questions.value = remoteQuestions; usingDefaultQuestions.value = false }
      loaded.value = true
    } catch (err) {
      console.error('Error loading questions:', err); error.value = 'No se pudo cargar el banco de preguntas desde Firebase.'
      if (fallbackToDefaults) { useDefaults(); loaded.value = true }
    } finally { loading.value = false }
  }

  const getEligibleQuestions = (category:string, degree:MasonicDegree, rite:MasonicRite='reaa', gameMode:QuestionGameMode='board'):Question[] => questions.value.filter((question) => questionSupportsMode(question,gameMode) && question.category===category && getQuestionRite(question)===rite && isQuestionAllowedForDegree(question.difficulty,degree))

  const getQuestionsForRoom = (rite:MasonicRite, level:QuestionDifficulty, category?:string, gameMode:QuestionGameMode='board'):Question[] => questions.value.filter((question) => {
    if (!questionSupportsMode(question, gameMode)) return false
    if (getQuestionRite(question) !== rite) return false
    if (category && question.category !== category) return false
    if (isOpenKnowledgeBank(rite)) return question.difficulty === 'general'
    if (level === 'general') return false
    return isQuestionAllowedForDegree(question.difficulty, level)
  })

  const countForRite=(rite:MasonicRite)=>questions.value.filter((question)=>getQuestionRite(question)===rite).length
  const countForMode=(mode:QuestionGameMode)=>questions.value.filter((question)=>questionSupportsMode(question,mode)).length
  const setQuestions=(newQuestions:Question[])=>{questions.value=newQuestions}
  const addQuestion=(question:Question)=>{questions.value.push(question)}
  const updateQuestion=(id:string,updated:Partial<Question>)=>{const index=questions.value.findIndex((q)=>q.id===id);if(index!==-1)questions.value[index]={...questions.value[index],...updated}}
  const deleteQuestion=(id:string)=>{questions.value=questions.value.filter((q)=>q.id!==id)}

  return { questions,loading,loaded,usingDefaultQuestions,error,questionsByCategory,categories,loadQuestions,getEligibleQuestions,getQuestionsForRoom,countForRite,countForMode,setQuestions,addQuestion,updateQuestion,deleteQuestion }
})
