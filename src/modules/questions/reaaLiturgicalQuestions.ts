import type { MasonicDegree, Question } from './types'

const PUBLIC_REAA_SOURCE = 'Banco REAA basado en fuentes públicas del Rito Escocés Antiguo y Aceptado; revisar/ajustar contra la liturgia autorizada de la jurisdicción local.'

type SeedQuestion = Omit<Question, 'id' | 'rite' | 'source'> & { id: string }

const q = (question: SeedQuestion): Question => ({
  ...question,
  rite: 'reaa',
  source: PUBLIC_REAA_SOURCE,
})

export const REAA_LITURGICAL_QUESTIONS: Question[] = [
  // ---------------- APRENDIZ ----------------
  q({
    id: 'reaa-a-historia-01', difficulty: 'aprendiz', category: 'Historia',
    text: 'Dentro del REAA, ¿cuáles son los tres grados que forman la Masonería Simbólica?',
    options: ['Aprendiz, Compañero y Maestro', 'Maestro Secreto, Perfecto e Intendente', 'Aprendiz, Rosa Cruz y Kadosh', 'Compañero, Príncipe y Gran Inspector'],
    correctAnswer: 0, directAnswer: 'Aprendiz, Compañero y Maestro',
    acceptedDirectAnswers: ['Aprendiz compañero maestro', 'Los tres grados simbólicos'],
    explanation: 'Los grados 1°, 2° y 3° son Aprendiz, Compañero y Maestro; los grados posteriores pertenecen a cuerpos filosóficos del REAA.',
  }),
  q({
    id: 'reaa-a-filosofia-01', difficulty: 'aprendiz', category: 'Filosofía',
    text: '¿Qué conducta resume mejor el trabajo interior que se propone al Aprendiz?',
    options: ['Reconocer y corregir sus propios defectos', 'Buscar superioridad sobre los demás', 'Memorizar sin comprender', 'Evitar toda crítica sobre sí mismo'],
    correctAnswer: 0, directAnswer: 'Reconocer y corregir sus propios defectos',
    acceptedDirectAnswers: ['Corregir sus defectos', 'Trabajar sobre sí mismo', 'Mejoramiento personal'],
    explanation: 'El trabajo del Aprendiz se representa como un proceso de disciplina, autoconocimiento y perfeccionamiento moral.',
  }),
  q({
    id: 'reaa-a-geometria-01', difficulty: 'aprendiz', category: 'Geometría',
    text: 'Si una escuadra sirve para comprobar un ángulo recto, ¿qué idea moral representa mejor en el simbolismo masónico?',
    options: ['La rectitud de las acciones', 'La rapidez del trabajo', 'La antigüedad de la Logia', 'La jerarquía económica'],
    correctAnswer: 0, directAnswer: 'La rectitud de las acciones',
    acceptedDirectAnswers: ['Rectitud', 'Actuar rectamente', 'Conducta recta'],
  }),
  q({
    id: 'reaa-a-etica-01', difficulty: 'aprendiz', category: 'Ética',
    text: 'Ante una decisión difícil, ¿qué pareja de principios encaja mejor con la instrucción moral del Aprendiz?',
    options: ['Justicia y verdad', 'Orgullo y obediencia ciega', 'Ventaja y prestigio', 'Silencio y ambición'],
    correctAnswer: 0, directAnswer: 'Justicia y verdad',
    acceptedDirectAnswers: ['La justicia y la verdad'],
  }),
  q({
    id: 'reaa-a-tradicion-01', difficulty: 'aprendiz', category: 'Tradición',
    text: 'En muchas instrucciones simbólicas del REAA, ¿qué edad se atribuye al Aprendiz?',
    options: ['Tres años', 'Cinco años', 'Siete años', 'Nueve años'],
    correctAnswer: 0, directAnswer: 'Tres años', acceptedDirectAnswers: ['3 años', 'Tres'],
    explanation: 'La edad simbólica puede aparecer con formulaciones distintas según jurisdicción; este banco puede adaptarse desde Administración.',
  }),
  q({
    id: 'reaa-a-simbolismo-01', difficulty: 'aprendiz', category: 'Simbolismo',
    text: 'En el tablero aparece una piedra bruta. ¿Qué representa principalmente para el Aprendiz?',
    options: ['La persona que todavía debe trabajar sobre sí misma', 'Una deuda pendiente', 'El rango de un oficial', 'La edad física del Templo'],
    correctAnswer: 0, directAnswer: 'La persona que todavía debe trabajar sobre sí misma',
    acceptedDirectAnswers: ['El trabajo sobre uno mismo', 'La persona por perfeccionar', 'Perfeccionamiento personal'],
  }),
  q({
    id: 'reaa-a-herramientas-01', difficulty: 'aprendiz', category: 'Herramientas',
    text: '¿Qué combinación se asocia de forma clásica al trabajo de desbastar la piedra bruta?',
    options: ['Mazo y cincel', 'Compás y palanca', 'Nivel y plomada', 'Regla y transportador'],
    correctAnswer: 0, directAnswer: 'Mazo y cincel', acceptedDirectAnswers: ['El mazo y el cincel'],
  }),
  q({
    id: 'reaa-a-artes-01', difficulty: 'aprendiz', category: 'Artes y Ciencias',
    text: '¿Qué ciencia resulta especialmente cercana al lenguaje simbólico de constructores, medidas y proporciones?',
    options: ['Geometría', 'Botánica', 'Oceanografía', 'Meteorología'],
    correctAnswer: 0, directAnswer: 'Geometría',
  }),
  q({
    id: 'reaa-a-ceremonial-01', difficulty: 'aprendiz', category: 'Ceremonial',
    text: '¿Por qué una ceremonia iniciática sigue un orden y una secuencia definidos?',
    options: ['Para transmitir progresivamente una enseñanza simbólica', 'Para reemplazar todo estudio posterior', 'Para medir la antigüedad de los asistentes', 'Para que todas las jurisdicciones sean idénticas'],
    correctAnswer: 0, directAnswer: 'Para transmitir progresivamente una enseñanza simbólica',
    acceptedDirectAnswers: ['Transmitir una enseñanza simbólica', 'Enseñanza progresiva'],
  }),

  // ---------------- COMPAÑERO ----------------
  q({
    id: 'reaa-c-historia-01', difficulty: 'compañero', category: 'Historia',
    text: 'En la estructura habitual del REAA, ¿quién gobierna los tres grados simbólicos?',
    options: ['Las Grandes Logias', 'Los Supremos Consejos exclusivamente', 'Los capítulos del Arco Real', 'Los consistorios del grado 32'],
    correctAnswer: 0, directAnswer: 'Las Grandes Logias', acceptedDirectAnswers: ['Gran Logia', 'Las grandes logias simbólicas'],
  }),
  q({
    id: 'reaa-c-filosofia-01', difficulty: 'compañero', category: 'Filosofía',
    text: '¿Qué cambio describe mejor el paso simbólico de Aprendiz a Compañero?',
    options: ['De aprender y trabajar sobre sí mismo a ampliar la comprensión y aplicar lo aprendido', 'De estudiar a dejar de cuestionar', 'De la reflexión al prestigio personal', 'De la igualdad a la competencia'],
    correctAnswer: 0, directAnswer: 'Ampliar la comprensión y aplicar lo aprendido',
    acceptedDirectAnswers: ['Comprender y aplicar', 'Pasar de aprender a comprender'],
  }),
  q({
    id: 'reaa-c-geometria-01', difficulty: 'compañero', category: 'Geometría',
    text: '¿Qué instrumento permite trazar circunferencias y comparar distancias, y por ello se presta al simbolismo de medida y límite?',
    options: ['El compás', 'El cincel', 'La plomada', 'El mazo'],
    correctAnswer: 0, directAnswer: 'El compás', acceptedDirectAnswers: ['Compás'],
  }),
  q({
    id: 'reaa-c-etica-01', difficulty: 'compañero', category: 'Ética',
    text: '¿Cuál de estas series corresponde mejor a virtudes que deben orientar al Compañero en su desarrollo?',
    options: ['Inteligencia, rectitud, valor, prudencia y filantropía', 'Riqueza, fama, fuerza, mando y silencio', 'Velocidad, competencia, triunfo, prestigio y obediencia', 'Aislamiento, orgullo, reserva, poder y rango'],
    correctAnswer: 0, directAnswer: 'Inteligencia, rectitud, valor, prudencia y filantropía',
    acceptedDirectAnswers: ['Inteligencia rectitud valor prudencia filantropía'],
  }),
  q({
    id: 'reaa-c-tradicion-01', difficulty: 'compañero', category: 'Tradición',
    text: 'En muchas instrucciones simbólicas del REAA, ¿qué edad se atribuye al Compañero?',
    options: ['Cinco años', 'Tres años', 'Siete años', 'Doce años'],
    correctAnswer: 0, directAnswer: 'Cinco años', acceptedDirectAnswers: ['5 años', 'Cinco'],
  }),
  q({
    id: 'reaa-c-simbolismo-01', difficulty: 'compañero', category: 'Simbolismo',
    text: '¿Qué elemento luminoso adquiere una presencia destacada en el simbolismo tradicional del segundo grado?',
    options: ['La Estrella Flamígera', 'La piedra bruta únicamente', 'Una corona real', 'Un ancla naval'],
    correctAnswer: 0, directAnswer: 'La Estrella Flamígera', acceptedDirectAnswers: ['Estrella flamígera', 'La estrella'],
  }),
  q({
    id: 'reaa-c-herramientas-01', difficulty: 'compañero', category: 'Herramientas',
    text: 'Si necesitas simbolizar una fuerza capaz de vencer resistencia mediante un punto de apoyo, ¿qué herramienta corresponde mejor?',
    options: ['La palanca', 'El cincel', 'La plomada', 'El nivel'],
    correctAnswer: 0, directAnswer: 'La palanca', acceptedDirectAnswers: ['Palanca'],
  }),
  q({
    id: 'reaa-c-artes-01', difficulty: 'compañero', category: 'Artes y Ciencias',
    text: '¿Cuál es la lista tradicional de las siete artes liberales vinculada a la formación del Compañero?',
    options: ['Gramática, Retórica, Lógica, Aritmética, Geometría, Música y Astronomía', 'Historia, Medicina, Derecho, Física, Química, Pintura y Escultura', 'Lectura, Escritura, Canto, Danza, Dibujo, Comercio y Navegación', 'Álgebra, Biología, Economía, Política, Ética, Teatro y Arquitectura'],
    correctAnswer: 0, directAnswer: 'Gramática, Retórica, Lógica, Aritmética, Geometría, Música y Astronomía',
    acceptedDirectAnswers: ['Gramática retórica lógica aritmética geometría música astronomía', 'Las siete artes liberales'],
  }),
  q({
    id: 'reaa-c-ceremonial-01', difficulty: 'compañero', category: 'Ceremonial',
    text: '¿Cuántos viajes simbólicos forman habitualmente la progresión principal de la recepción al segundo grado en el REAA?',
    options: ['Cinco', 'Tres', 'Siete', 'Doce'],
    correctAnswer: 0, directAnswer: 'Cinco', acceptedDirectAnswers: ['5', 'Cinco viajes'],
  }),

  // ---------------- MAESTRO ----------------
  q({
    id: 'reaa-m-historia-01', difficulty: 'maestro', category: 'Historia',
    text: '¿En qué ciudad se constituyó en 1801 el primer Supremo Consejo del REAA?',
    options: ['Charleston', 'Londres', 'París', 'Edimburgo'],
    correctAnswer: 0, directAnswer: 'Charleston', acceptedDirectAnswers: ['Charleston, Carolina del Sur'],
    explanation: 'La estructura moderna del REAA de 33 grados se vincula a la constitución del Supremo Consejo de Charleston en 1801.',
  }),
  q({
    id: 'reaa-m-filosofia-01', difficulty: 'maestro', category: 'Filosofía',
    text: '¿Qué enemigos interiores o sociales combate simbólicamente la enseñanza del Maestro?',
    options: ['Ignorancia, fanatismo y ambición desordenada', 'Curiosidad, estudio y prudencia', 'Ciencia, arte y fraternidad', 'Trabajo, disciplina y memoria'],
    correctAnswer: 0, directAnswer: 'Ignorancia, fanatismo y ambición desordenada',
    acceptedDirectAnswers: ['Ignorancia fanatismo ambición', 'Ignorancia y fanatismo'],
  }),
  q({
    id: 'reaa-m-geometria-01', difficulty: 'maestro', category: 'Geometría',
    text: 'La expresión simbólica “pasar de la escuadra al compás” señala principalmente ¿qué tipo de avance?',
    options: ['Una ampliación de la comprensión y responsabilidad del Maestro', 'Un cambio de oficio profesional', 'Una sustitución de la ética por matemáticas', 'Una reducción del campo de estudio'],
    correctAnswer: 0, directAnswer: 'Una ampliación de la comprensión y responsabilidad del Maestro',
    acceptedDirectAnswers: ['Ampliar comprensión y responsabilidad', 'Mayor comprensión'],
  }),
  q({
    id: 'reaa-m-etica-01', difficulty: 'maestro', category: 'Ética',
    text: '¿Qué tríada expresa mejor un ideal social y moral recurrente en la enseñanza masónica del Maestro?',
    options: ['Libertad, igualdad y fraternidad', 'Poder, riqueza y obediencia', 'Fama, mando y privilegio', 'Secreto, rango y competencia'],
    correctAnswer: 0, directAnswer: 'Libertad, igualdad y fraternidad',
    acceptedDirectAnswers: ['Libertad igualdad fraternidad'],
  }),
  q({
    id: 'reaa-m-tradicion-01', difficulty: 'maestro', category: 'Tradición',
    text: '¿Qué personaje tradicional ocupa el centro de la alegoría del tercer grado?',
    options: ['Hiram Abif', 'Euclides', 'Pitágoras', 'Salomón como único protagonista'],
    correctAnswer: 0, directAnswer: 'Hiram Abif', acceptedDirectAnswers: ['Hiram', 'Hiram Abiff'],
    explanation: 'La leyenda de Hiram funciona como una alegoría de fidelidad, pérdida, búsqueda y renovación; sus formulaciones varían por jurisdicción.',
  }),
  q({
    id: 'reaa-m-simbolismo-01', difficulty: 'maestro', category: 'Simbolismo',
    text: '¿Qué planta aparece tradicionalmente como símbolo de continuidad, memoria y renovación en el tercer grado?',
    options: ['La acacia', 'El olivo', 'El laurel', 'El cedro'],
    correctAnswer: 0, directAnswer: 'La acacia', acceptedDirectAnswers: ['Acacia'],
  }),
  q({
    id: 'reaa-m-herramientas-01', difficulty: 'maestro', category: 'Herramientas',
    text: 'En una lectura simbólica madura, ¿qué relación resume mejor a la escuadra y el compás?',
    options: ['Rectitud de la conducta y capacidad de medir o limitar las propias acciones', 'Velocidad y fuerza física', 'Rango y antigüedad', 'Memoria y silencio'],
    correctAnswer: 0, directAnswer: 'Rectitud de la conducta y capacidad de medir o limitar las propias acciones',
    acceptedDirectAnswers: ['Rectitud y medida', 'Rectitud y límite', 'Conducta recta y medida'],
  }),
  q({
    id: 'reaa-m-artes-01', difficulty: 'maestro', category: 'Artes y Ciencias',
    text: '¿Qué progresión numérica aparece con frecuencia como esquema simbólico de ascenso y aprendizaje en los grados azules?',
    options: ['Tres, cinco y siete', 'Dos, cuatro y ocho', 'Uno, seis y doce', 'Cinco, diez y quince'],
    correctAnswer: 0, directAnswer: 'Tres, cinco y siete', acceptedDirectAnswers: ['3 5 7', 'Tres cinco siete'],
  }),
  q({
    id: 'reaa-m-ceremonial-01', difficulty: 'maestro', category: 'Ceremonial',
    text: 'En el lenguaje simbólico del tercer grado, ¿qué nombre recibe tradicionalmente el espacio o ámbito asociado al trabajo del Maestro?',
    options: ['Cámara del Medio', 'Atrio de los Aprendices', 'Sala de las Artes', 'Cámara de Navegación'],
    correctAnswer: 0, directAnswer: 'Cámara del Medio', acceptedDirectAnswers: ['La Cámara del Medio', 'Camara del Medio'],
  }),
]

export function reaaQuestionsForDegree(degree: MasonicDegree): Question[] {
  return REAA_LITURGICAL_QUESTIONS.filter((question) => question.difficulty === degree)
}
