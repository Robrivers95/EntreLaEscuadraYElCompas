export type MasonicDegree = 'aprendiz' | 'compañero' | 'maestro'
export type QuestionDifficulty = MasonicDegree | 'general'
export type MasonicRite = 'reaa' | 'york' | 'frances' | 'nacional-mexicano' | 'kabala' | 'libre' | 'otro'
export type AnswerMode = 'direct' | 'multiple-choice'
export type QuestionGameMode = 'board' | 'duel' | 'study'

export interface Question {
  id: string
  text: string
  category: string
  difficulty: QuestionDifficulty
  /** Banco o rito. Valores legacy sin rite se interpretan como REAA. */
  rite?: MasonicRite
  options: string[]
  correctAnswer: number
  directAnswer?: string
  acceptedDirectAnswers?: string[]
  explanation?: string
  /** Nota de procedencia legible por administración. */
  source?: string
  basePoints?: number
  /** Modos donde la pregunta puede aparecer. Si falta, se habilita para los tres por compatibilidad. */
  gameModes?: QuestionGameMode[]
  /** Permite sacar temporalmente una pregunta de circulación sin borrarla. */
  enabled?: boolean
  /** Etiquetas libres para búsqueda y organización administrativa. */
  tags?: string[]
  createdAt?: number
  updatedAt?: number
}
