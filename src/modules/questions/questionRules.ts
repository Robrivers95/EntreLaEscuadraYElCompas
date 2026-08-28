import type { AnswerMode, MasonicDegree, MasonicRite, Question, QuestionDifficulty, QuestionGameMode } from './types'

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

/** Las diez sefirot forman también las diez casillas del tablero libre de Kabbalah. */
export const KABBALAH_CATEGORIES = [
  'Keter',
  'Chokhmah',
  'Binah',
  'Chesed',
  'Gevurah',
  'Tiferet',
  'Netzach',
  'Hod',
  'Yesod',
  'Malkhut',
] as const

export const ALL_GAME_MODES: QuestionGameMode[] = ['board', 'duel', 'study']

export const MASONIC_RITES: Array<{ value: MasonicRite; label: string; shortLabel: string; masonic: boolean; open: boolean }> = [
  { value: 'reaa', label: 'Rito Escocés Antiguo y Aceptado', shortLabel: 'REAA', masonic: true, open: false },
  { value: 'york', label: 'Rito de York', shortLabel: 'York', masonic: true, open: false },
  { value: 'frances', label: 'Rito Francés', shortLabel: 'Francés', masonic: true, open: false },
  { value: 'nacional-mexicano', label: 'Rito Nacional Mexicano', shortLabel: 'RNM', masonic: true, open: false },
  { value: 'kabala', label: 'Kabbalah · Árbol de la Vida (libre)', shortLabel: 'Kabbalah', masonic: false, open: true },
  { value: 'libre', label: 'Modo Libre · Cultura general', shortLabel: 'Libre', masonic: false, open: true },
  { value: 'otro', label: 'Otro rito / banco personalizado', shortLabel: 'Otro', masonic: true, open: false },
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

export const GAME_MODE_LABELS: Record<QuestionGameMode, string> = {
  board: 'Tablero',
  duel: '1vs1',
  study: 'Estudio',
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

export function getQuestionGameModes(question: Question): QuestionGameMode[] {
  return question.gameModes?.length ? question.gameModes : ALL_GAME_MODES
}

export function questionSupportsMode(question: Question, mode: QuestionGameMode): boolean {
  return question.enabled !== false && getQuestionGameModes(question).includes(mode)
}

export function isOpenKnowledgeBank(rite: MasonicRite): boolean {
  return rite === 'libre' || rite === 'kabala'
}

export function getCategoriesForRite(rite: MasonicRite): string[] {
  if (rite === 'libre') return [...GENERAL_CATEGORIES]
  if (rite === 'kabala') return [...KABBALAH_CATEGORIES]
  return [...MASONIC_CATEGORIES]
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
