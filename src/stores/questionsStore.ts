import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { questionsService } from '@/modules/questions/questionsService'
import { DEFAULT_QUESTIONS } from '@/modules/questions/defaultQuestions'
import { LEGACY_STARTER_QUESTIONS } from '@/modules/questions/legacyStarterQuestions'
import { REAA_LITURGICAL_QUESTIONS } from '@/modules/questions/reaaLiturgicalQuestions'
import { REAA_NUEVO_LEON_QUESTIONS } from '@/modules/questions/reaaNuevoLeonQuestions'
import { getQuestionRite, isQuestionAllowedForDegree } from '@/modules/questions/questionRules'
import type { MasonicDegree, MasonicRite, Question } from '@/modules/questions/types'

interface LoadQuestionsOptions {
  force?: boolean
  fallbackToDefaults?: boolean
}

export const STARTER_QUESTIONS = [
  ...REAA_LITURGICAL_QUESTIONS,
  ...REAA_NUEVO_LEON_QUESTIONS,
  ...DEFAULT_QUESTIONS,
  ...LEGACY_STARTER_QUESTIONS,
]

export const useQuestionsStore = defineStore('questions', () => {
  const questions = ref<Question[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const usingDefaultQuestions = ref(false)
  const error = ref<string | null>(null)

  const questionsByCategory = computed(() => {
    const grouped: Record<string, Question[]> = {}
    questions.value.forEach((question) => {
      if (!grouped[question.category]) grouped[question.category] = []
      grouped[question.category].push(question)
    })
    return grouped
  })

  const categories = computed(() => Array.from(new Set(questions.value.map((q) => q.category))).sort())

  const useDefaults = () => {
    questions.value = STARTER_QUESTIONS.map((question) => ({ ...question }))
    usingDefaultQuestions.value = true
  }

  const loadQuestions = async (options: LoadQuestionsOptions = {}) => {
    const { force = false, fallbackToDefaults = true } = options

    if (loaded.value && !force) {
      if (fallbackToDefaults && questions.value.length === 0) useDefaults()
      return
    }

    loading.value = true
    error.value = null
    try {
      const remoteQuestions = await questionsService.getQuestions()
      if (remoteQuestions.length > 0) {
        questions.value = remoteQuestions
        usingDefaultQuestions.value = false
      } else if (fallbackToDefaults) {
        useDefaults()
      } else {
        questions.value = []
        usingDefaultQuestions.value = false
      }
      loaded.value = true
    } catch (err) {
      console.error('Error loading questions:', err)
      error.value = 'No se pudo cargar el banco de preguntas desde Firebase.'
      if (fallbackToDefaults) {
        useDefaults()
        loaded.value = true
      }
    } finally {
      loading.value = false
    }
  }

  const getEligibleQuestions = (
    category: string,
    degree: MasonicDegree,
    rite: MasonicRite = 'reaa',
  ): Question[] => questions.value.filter(
    (question) =>
      question.category === category &&
      getQuestionRite(question) === rite &&
      isQuestionAllowedForDegree(question.difficulty, degree),
  )

  const countForRite = (rite: MasonicRite) =>
    questions.value.filter((question) => getQuestionRite(question) === rite).length

  const setQuestions = (newQuestions: Question[]) => { questions.value = newQuestions }
  const addQuestion = (question: Question) => { questions.value.push(question) }
  const updateQuestion = (id: string, updated: Partial<Question>) => {
    const index = questions.value.findIndex((q) => q.id === id)
    if (index !== -1) questions.value[index] = { ...questions.value[index], ...updated }
  }
  const deleteQuestion = (id: string) => { questions.value = questions.value.filter((q) => q.id !== id) }

  return {
    questions,
    loading,
    loaded,
    usingDefaultQuestions,
    error,
    questionsByCategory,
    categories,
    loadQuestions,
    getEligibleQuestions,
    countForRite,
    setQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  }
})
