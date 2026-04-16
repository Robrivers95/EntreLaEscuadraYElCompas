export interface Question {
  id: string
  text: string
  category: string
  difficulty: 'aprendiz' | 'compañero' | 'maestro'
  options: string[]
  correctAnswer: number
  createdAt?: number
  updatedAt?: number
}
