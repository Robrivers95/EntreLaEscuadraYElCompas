export type MasonicDegree = 'aprendiz' | 'compañero' | 'maestro'
export type AnswerMode = 'direct' | 'multiple-choice'

export interface Question {
  id: string
  text: string
  category: string
  difficulty: MasonicDegree
  options: string[]
  correctAnswer: number
  /** Canonical answer used when the player tries to answer before seeing the options. */
  directAnswer?: string
  /** Alternate phrasings accepted in direct-answer mode. */
  acceptedDirectAnswers?: string[]
  explanation?: string
  /** Optional override. Defaults are defined by degree in questionRules.ts. */
  basePoints?: number
  createdAt?: number
  updatedAt?: number
}
