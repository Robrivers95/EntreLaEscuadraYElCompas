import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { questionsService } from '@/modules/questions/questionsService'
import { DEFAULT_QUESTIONS } from '@/modules/questions/defaultQuestions'
import { isQuestionAllowedForDegree } from '@/modules/questions/questionRules'
import type { MasonicDegree, Question } from '@/modules/questions/types'

interface LoadQuestionsOptions {
  force?: boolean
  fallbackToDefaults?: boolean
}

export const useQuestionsStore = defineStore('questions', () => {
  const questions = ref<Question[]>([])
  const loading = ref(false)
  const loaded = ref(false)
  const usingDefaultQuestions = ref(false)
  const error = ref<string | null>(null)

  const questionsByCategory = computed(() => {
    const grouped: Record<string, Question[]> = {}
    questions.value.forEach((q) => {
      if (!grouped[q.category]) grouped[q.category] = []
      grouped[q.category].push(q)
    })
    return grouped
  })

  const categories = computed(() => {
    return Array.from(new Set(questions.value.map((q) => q.category))).sort()
  })

  const useDefaults = () => {
    questions.value = DEFAULT_QUESTIONS.map((question) => ({ ...question }))
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

  const getEligibleQuestions = (category: string, degree: MasonicDegree): Question[] => {
    return questions.value.filter(
      (question) =>
        question.category === category &&
        isQuestionAllowedForDegree(question.difficulty, degree),
    )
  }

  const setQuestions = (newQuestions: Question[]) => {
    questions.value = newQuestions
  }

  const addQuestion = (question: Question) => {
    questions.value.push(question)
  }

  const updateQuestion = (id: string, updated: Partial<Question>) => {
    const index = questions.value.findIndex((q) => q.id === id)
    if (index !== -1) questions.value[index] = { ...questions.value[index], ...updated }
  }

  const deleteQuestion = (id: string) => {
    questions.value = questions.value.filter((q) => q.id !== id)
  }

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
    setQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  }
})
