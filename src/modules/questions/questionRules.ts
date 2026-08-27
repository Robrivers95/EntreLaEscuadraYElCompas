import type { AnswerMode, MasonicDegree, Question } from './types'

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

export const DEGREE_LABELS: Record<MasonicDegree, string> = {
  aprendiz: 'Aprendiz',
  compañero: 'Compañero',
  maestro: 'Maestro',
}

const DEGREE_ORDER: MasonicDegree[] = ['aprendiz', 'compañero', 'maestro']

export function getAllowedDifficulties(degree: MasonicDegree): MasonicDegree[] {
  const maxIndex = DEGREE_ORDER.indexOf(degree)
  return DEGREE_ORDER.slice(0, maxIndex + 1)
}

export function isQuestionAllowedForDegree(
  questionDifficulty: MasonicDegree,
  gameDegree: MasonicDegree,
): boolean {
  return getAllowedDifficulties(gameDegree).includes(questionDifficulty)
}

export function getBasePoints(difficulty: MasonicDegree): number {
  const points: Record<MasonicDegree, number> = {
    aprendiz: 10,
    compañero: 20,
    maestro: 30,
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
