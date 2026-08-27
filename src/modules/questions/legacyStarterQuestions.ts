import type { Question } from './types'

export const LEGACY_STARTER_QUESTIONS: Question[] = [
  {
    id: 'seed-a-geometria-01',
    text: '¿Qué idea representa mejor el uso simbólico de la geometría en un juego masónico de aprendizaje?',
    category: 'Geometría',
    difficulty: 'aprendiz',
    options: ['Orden, medida y proporción', 'Competencia física', 'Riqueza material', 'Improvisación sin reglas'],
    correctAnswer: 0,
    directAnswer: 'Orden, medida y proporción',
    acceptedDirectAnswers: ['Orden medida y proporción', 'Medida y proporción'],
  },
  {
    id: 'seed-a-etica-01',
    text: '¿Cuál de estas conductas se relaciona mejor con la rectitud ética?',
    category: 'Ética',
    difficulty: 'aprendiz',
    options: ['Actuar con honestidad incluso cuando nadie observa', 'Buscar ventaja a cualquier costo', 'Evitar asumir responsabilidades', 'Cambiar principios según la conveniencia'],
    correctAnswer: 0,
    directAnswer: 'Actuar con honestidad incluso cuando nadie observa',
    acceptedDirectAnswers: ['Honestidad', 'Actuar con honestidad', 'Rectitud'],
  },
  {
    id: 'seed-a-tradicion-01',
    text: '¿Qué forma de estudio ayuda mejor a comprender una tradición simbólica?',
    category: 'Tradición',
    difficulty: 'aprendiz',
    options: ['Comparar símbolos, contexto y fuentes confiables', 'Memorizar palabras sin contexto', 'Suponer que todas las jurisdicciones son iguales', 'Ignorar el significado histórico'],
    correctAnswer: 0,
    directAnswer: 'Comparar símbolos, contexto y fuentes confiables',
    acceptedDirectAnswers: ['Comparar símbolos y contexto', 'Usar fuentes confiables'],
  },
]
