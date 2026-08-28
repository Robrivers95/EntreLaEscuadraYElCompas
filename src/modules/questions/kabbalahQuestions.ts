import type { Question } from './types'

const SOURCE = 'Banco introductorio de Kabbalah basado en fuentes públicas sobre las diez sefirot, Ein Sof y el Zohar. Contenido de estudio general; no es un rito masónico.'
const MODES = ['board', 'duel', 'study'] as const

type Seed = Omit<Question, 'id' | 'rite' | 'difficulty' | 'source' | 'gameModes' | 'enabled'> & { id: string }
const q = (seed: Seed): Question => ({
  ...seed,
  id: `kabala-${seed.id}`,
  rite: 'kabala',
  difficulty: 'general',
  source: SOURCE,
  gameModes: [...MODES],
  enabled: true,
  tags: ['kabbalah', 'sefirot', ...(seed.tags ?? [])],
})

export const KABBALAH_QUESTIONS: Question[] = [
  q({ id:'keter-01', category:'Keter', text:'¿Qué significa Keter dentro del Árbol de la Vida?', options:['Corona','Fundamento','Gloria','Reino'], correctAnswer:0, directAnswer:'Corona', explanation:'Keter se traduce habitualmente como Corona y ocupa la parte superior del esquema de las sefirot.' }),
  q({ id:'keter-02', category:'Keter', text:'¿Qué concepto designa en la Kabbalah la infinitud divina más allá de las sefirot?', options:['Ein Sof','Yesod','Tiferet','Hod'], correctAnswer:0, directAnswer:'Ein Sof', explanation:'Ein Sof, “sin fin”, es una denominación de la infinitud divina que trasciende las sefirot.' }),
  q({ id:'keter-03', category:'Keter', text:'En el esquema tradicional, ¿qué sefirah aparece en la cúspide del Árbol de la Vida?', options:['Keter','Malkhut','Yesod','Netzach'], correctAnswer:0, directAnswer:'Keter' }),

  q({ id:'chokhmah-01', category:'Chokhmah', text:'¿Qué significa Chokhmah?', options:['Sabiduría','Entendimiento','Belleza','Juicio'], correctAnswer:0, directAnswer:'Sabiduría' }),
  q({ id:'chokhmah-02', category:'Chokhmah', text:'¿Con qué sefirah forma Chokhmah una pareja conceptual de sabiduría y entendimiento?', options:['Binah','Malkhut','Hod','Yesod'], correctAnswer:0, directAnswer:'Binah' }),
  q({ id:'chokhmah-03', category:'Chokhmah', text:'¿Cuál de estas asociaciones corresponde mejor a Chokhmah?', options:['Intuición o sabiduría primordial','Juicio severo','Reino manifestado','Fundamento'], correctAnswer:0, directAnswer:'Sabiduría primordial', acceptedDirectAnswers:['Intuición','Sabiduría'] }),

  q({ id:'binah-01', category:'Binah', text:'¿Qué significa Binah?', options:['Entendimiento','Victoria','Misericordia','Corona'], correctAnswer:0, directAnswer:'Entendimiento' }),
  q({ id:'binah-02', category:'Binah', text:'¿Qué expresión tradicional se vincula con Binah?', options:['Cincuenta Puertas del Entendimiento','Treinta y tres grados','Doce tribus como sefirot','Siete sellos'], correctAnswer:0, directAnswer:'Cincuenta Puertas del Entendimiento', explanation:'Diversas fuentes cabalísticas asocian Binah con las “cincuenta puertas del entendimiento”.' }),
  q({ id:'binah-03', category:'Binah', text:'En una formulación común, Binah desarrolla y da forma a la intuición asociada con…', options:['Chokhmah','Netzach','Malkhut','Yesod'], correctAnswer:0, directAnswer:'Chokhmah' }),

  q({ id:'chesed-01', category:'Chesed', text:'¿Qué cualidad representa principalmente Chesed?', options:['Misericordia o bondad amorosa','Juicio severo','Gloria','Fundamento'], correctAnswer:0, directAnswer:'Misericordia', acceptedDirectAnswers:['Bondad','Bondad amorosa'] }),
  q({ id:'chesed-02', category:'Chesed', text:'En el Árbol de la Vida, Chesed suele relacionarse con el polo de…', options:['Expansión y benevolencia','Restricción y juicio','Reino material exclusivamente','Lenguaje'], correctAnswer:0, directAnswer:'Expansión y benevolencia' }),
  q({ id:'chesed-03', category:'Chesed', text:'¿Qué sefirah se contrapone y equilibra habitualmente con Chesed?', options:['Gevurah','Hod','Yesod','Keter'], correctAnswer:0, directAnswer:'Gevurah' }),

  q({ id:'gevurah-01', category:'Gevurah', text:'¿Qué significa Gevurah en este contexto?', options:['Poder, fuerza o juicio','Belleza','Sabiduría','Reino'], correctAnswer:0, directAnswer:'Poder', acceptedDirectAnswers:['Fuerza','Juicio','Poder y juicio'] }),
  q({ id:'gevurah-02', category:'Gevurah', text:'¿Qué otro nombre aparece con frecuencia para la cualidad de Gevurah?', options:['Din','Ein Sof','Zohar','Bahir'], correctAnswer:0, directAnswer:'Din', explanation:'Din significa juicio y aparece como denominación relacionada con el aspecto restrictivo o judicial.' }),
  q({ id:'gevurah-03', category:'Gevurah', text:'¿Qué idea describe mejor el equilibrio entre Gevurah y Chesed?', options:['Justicia y misericordia deben moderarse mutuamente','Una debe eliminar por completo a la otra','Ambas significan exactamente lo mismo','No existe relación entre ellas'], correctAnswer:0, directAnswer:'Justicia y misericordia deben moderarse mutuamente', acceptedDirectAnswers:['Equilibrio entre justicia y misericordia'] }),

  q({ id:'tiferet-01', category:'Tiferet', text:'¿Qué significa Tiferet?', options:['Belleza','Victoria','Fundamento','Corona'], correctAnswer:0, directAnswer:'Belleza' }),
  q({ id:'tiferet-02', category:'Tiferet', text:'¿Qué función simbólica se atribuye comúnmente a Tiferet?', options:['Armonizar misericordia y juicio','Representar sólo el mundo material','Sustituir a todas las demás sefirot','Representar exclusivamente el lenguaje'], correctAnswer:0, directAnswer:'Armonizar misericordia y juicio', acceptedDirectAnswers:['Equilibrar Chesed y Gevurah'] }),
  q({ id:'tiferet-03', category:'Tiferet', text:'¿Entre qué dos polos aparece Tiferet como punto de equilibrio en muchas representaciones?', options:['Chesed y Gevurah','Keter y Malkhut únicamente','Netzach y Hod únicamente','Chokhmah y Yesod'], correctAnswer:0, directAnswer:'Chesed y Gevurah' }),

  q({ id:'netzach-01', category:'Netzach', text:'¿Qué traducción se asocia comúnmente con Netzach?', options:['Victoria o eternidad','Entendimiento','Juicio','Reino'], correctAnswer:0, directAnswer:'Victoria', acceptedDirectAnswers:['Eternidad','Victoria o eternidad'] }),
  q({ id:'netzach-02', category:'Netzach', text:'¿Con qué sefirah forma Netzach una pareja en la parte inferior del Árbol?', options:['Hod','Keter','Binah','Malkhut'], correctAnswer:0, directAnswer:'Hod' }),
  q({ id:'netzach-03', category:'Netzach', text:'¿Cuál de estas opciones NO es una de las diez sefirot?', options:['Pardes','Netzach','Hod','Yesod'], correctAnswer:0, directAnswer:'Pardes', explanation:'Pardes es un término relacionado con niveles de interpretación, pero no es una sefirah.' }),

  q({ id:'hod-01', category:'Hod', text:'¿Qué significa Hod?', options:['Gloria o esplendor','Corona','Sabiduría','Misericordia'], correctAnswer:0, directAnswer:'Gloria', acceptedDirectAnswers:['Esplendor','Gloria o esplendor'] }),
  q({ id:'hod-02', category:'Hod', text:'¿Qué sefirah se empareja tradicionalmente con Hod?', options:['Netzach','Keter','Chesed','Malkhut'], correctAnswer:0, directAnswer:'Netzach' }),
  q({ id:'hod-03', category:'Hod', text:'El título hebreo del Zohar significa aproximadamente…', options:['Esplendor o radiancia','Corona','Fundamento','Juicio'], correctAnswer:0, directAnswer:'Esplendor', acceptedDirectAnswers:['Radiancia','Esplendor o radiancia'], explanation:'Zohar significa esplendor o radiancia y es una obra central de la literatura cabalística.' }),

  q({ id:'yesod-01', category:'Yesod', text:'¿Qué significa Yesod?', options:['Fundamento','Reino','Belleza','Juicio'], correctAnswer:0, directAnswer:'Fundamento' }),
  q({ id:'yesod-02', category:'Yesod', text:'En el esquema del Árbol, ¿qué sefirah aparece inmediatamente por encima de Malkhut en muchas representaciones?', options:['Yesod','Keter','Chesed','Binah'], correctAnswer:0, directAnswer:'Yesod' }),
  q({ id:'yesod-03', category:'Yesod', text:'¿Qué idea expresa mejor el papel simbólico de Yesod?', options:['Canalizar o vincular hacia la manifestación','Ser la infinitud divina más allá de toda sefirah','Representar exclusivamente el juicio','Ser otro nombre del Zohar'], correctAnswer:0, directAnswer:'Canalizar o vincular hacia la manifestación', acceptedDirectAnswers:['Vínculo','Fundamento y vínculo'] }),

  q({ id:'malkhut-01', category:'Malkhut', text:'¿Qué significa Malkhut?', options:['Reino o realeza','Sabiduría','Entendimiento','Victoria'], correctAnswer:0, directAnswer:'Reino', acceptedDirectAnswers:['Realeza','Reino o realeza'] }),
  q({ id:'malkhut-02', category:'Malkhut', text:'¿Qué término se relaciona estrechamente con la presencia divina en el mundo y con Malkhut en numerosas fuentes cabalísticas?', options:['Shekhinah','Ein Sof','Din','Pardes'], correctAnswer:0, directAnswer:'Shekhinah' }),
  q({ id:'malkhut-03', category:'Malkhut', text:'¿Cuántas sefirot integran el esquema clásico del Árbol de la Vida?', options:['10','7','12','33'], correctAnswer:0, directAnswer:'10', acceptedDirectAnswers:['Diez'], explanation:'El esquema cabalístico clásico habla de diez sefirot entre la infinitud divina y el mundo creado.' }),
]
