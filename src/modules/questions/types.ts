export type MasonicDegree = 'aprendiz' | 'compañero' | 'maestro'
export type MasonicRite = 'reaa' | 'york' | 'frances' | 'nacional-mexicano' | 'otro'
export type AnswerMode = 'direct' | 'multiple-choice'

export interface Question {
  id: string
  text: string
  category: string
  difficulty: MasonicDegree
  /** Rite this question belongs to. Missing values from the legacy bank are treated as REAA. */
  rite?: MasonicRite
  options: string[]
  correctAnswer: number
  directAnswer?: string
  acceptedDirectAnswers?: string[]
  explanation?: string
  /** Human-readable provenance note for administrators. */
  source?: string
  basePoints?: number
  createdAt?: number
  updatedAt?: number
}
