import type { AnswerMode, MasonicDegree, MasonicRite, Question, QuestionDifficulty } from './types'

export const MASONIC_CATEGORIES = [
  'Historia',
  'Filosofía',
  'Geometría',
  'Ética',
  'Tradición',
  'Simbolismo',
  'Herramientas',
  'Artes y Ciencias',
  'Ceremonial',
] as const

export const GENERAL_CATEGORIES = [
  'Historia',
  'Geografía',
  'Ciencia',
  'Cultura',
  'Matemáticas',
  'Lengua',
  'Tecnología',
  'Arte',
  'Deportes',
] as const

export const MASONIC_RITES: Array<{ value: MasonicRite; label: string; shortLabel: string; masonic: boolean }> = [
  { value: 'reaa', label: 'Rito Escocés Antiguo y Aceptado', shortLabel: 'REAA', masonic: true },
  { value: 'york', label: 'Rito de York', shortLabel: 'York', masonic: true },
  { value: 'frances', label: 'Rito Francés', shortLabel: 'Francés', masonic: true },
  { value: 'nacional-mexicano', label: 'Rito Nacional Mexicano', shortLabel: 'RNM', masonic: true },
  { value: 'libre', label: 'Modo Libre · Cultura general', shortLabel: 'Libre', masonic: false },
  { value: 'otro', label: 'Otro rito / banco personalizado', shortLabel: 'Otro', masonic: true },
]

export const RITE_LABELS = Object.fromEntries(
  MASONIC_RITES.map((rite) => [rite.value, rite.label]),
) as Record<MasonicRite, string>

export const RITE_SHORT_LABELS = Object.fromEntries(
  MASONIC_RITES.map((rite) => [rite.value, rite.shortLabel]),
) as Record<MasonicRite, string>

export const DEGREE_LABELS: Record<MasonicDegree, string> = {
  aprendiz: 'Aprendiz',
  compañero: 'Compañero',
  maestro: 'Maestro',
}

export const DIFFICULTY_LABELS: Record<QuestionDifficulty, string> = {
  ...DEGREE_LABELS,
  general: 'General',
}

const DEGREE_ORDER: MasonicDegree[] = ['aprendiz', 'compañero', 'maestro']

export function normalizeMiLogiaDegree(value?: string | null): MasonicDegree | null {
  const normalized = value?.trim().toLowerCase()
  if (normalized === 'aprendiz') return 'aprendiz'
  if (normalized === 'companero' || normalized === 'compañero') return 'compañero'
  if (normalized === 'maestro') return 'maestro'
  return null
}

export function getQuestionRite(question: Question): MasonicRite {
  return question.rite ?? 'reaa'
}

export function getAllowedDifficulties(degree: MasonicDegree): MasonicDegree[] {
  const maxIndex = DEGREE_ORDER.indexOf(degree)
  return DEGREE_ORDER.slice(0, maxIndex + 1)
}

export function isQuestionAllowedForDegree(
  questionDifficulty: QuestionDifficulty,
  playerDegree: MasonicDegree,
): boolean {
  if (questionDifficulty === 'general') return true
  return getAllowedDifficulties(playerDegree).includes(questionDifficulty)
}

export function getBasePoints(difficulty: QuestionDifficulty): number {
  const points: Record<QuestionDifficulty, number> = {
    aprendiz: 10,
    compañero: 20,
    maestro: 30,
    general: 10,
  }
  return points[difficulty]
}

export function getQuestionPoints(question: Question, mode: AnswerMode): number {
  const base = question.basePoints ?? getBasePoints(question.difficulty)
  return mode === 'direct' ? base * 2 : base
}

export function normalizeAnswer(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function isDirectAnswerCorrect(question: Question, answer: string): boolean {
  const normalizedAnswer = normalizeAnswer(answer)
  if (!normalizedAnswer) return false

  const correctOption = question.options[question.correctAnswer]
  const accepted = [
    question.directAnswer,
    correctOption,
    ...(question.acceptedDirectAnswers ?? []),
  ].filter((value): value is string => Boolean(value))

  return accepted.some((candidate) => normalizeAnswer(candidate) === normalizedAnswer)
}
