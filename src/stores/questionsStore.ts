import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Question {
  id: string
  text: string
  category: string
  difficulty: 'aprendiz' | 'compañero' | 'maestro'
  options: string[]
  correctAnswer: number
  createdAt?: number
}

export const useQuestionsStore = defineStore('questions', () => {
  const questions = ref<Question[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const questionsByCategory = computed(() => {
    const grouped: Record<string, Question[]> = {}
    questions.value.forEach((q) => {
      if (!grouped[q.category]) {
        grouped[q.category] = []
      }
      grouped[q.category].push(q)
    })
    return grouped
  })

  const categories = computed(() => {
    return Array.from(new Set(questions.value.map((q) => q.category)))
  })

  const setQuestions = (newQuestions: Question[]) => {
    questions.value = newQuestions
  }

  const addQuestion = (question: Question) => {
    questions.value.push(question)
  }

  const updateQuestion = (id: string, updated: Partial<Question>) => {
    const index = questions.value.findIndex((q) => q.id === id)
    if (index !== -1) {
      questions.value[index] = { ...questions.value[index], ...updated }
    }
  }

  const deleteQuestion = (id: string) => {
    questions.value = questions.value.filter((q) => q.id !== id)
  }

  return {
    questions,
    loading,
    error,
    questionsByCategory,
    categories,
    setQuestions,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  }
})
