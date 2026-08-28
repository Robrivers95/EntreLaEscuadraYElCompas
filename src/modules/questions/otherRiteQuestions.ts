import type { MasonicRite, Question } from './types'

type Seed = Omit<Question, 'id' | 'rite' | 'source'> & { id: string }

const make = (rite: MasonicRite, source: string, seeds: Seed[]): Question[] => seeds.map((item) => ({
  ...item,
  id: `${rite}-${item.id}`,
  rite,
  source,
}))

const yorkSource = 'Banco introductorio del Rito de York basado en estructura pública; revisar contra la jurisdicción local antes de uso ritual.'
const frenchSource = 'Banco introductorio del Rito Francés basado en estructura pública de grados y Órdenes de Sabiduría; revisar contra la obediencia local.'
const rnmSource = 'Banco introductorio del Rito Nacional Mexicano basado en historia y estructura pública; revisar contra la liturgia autorizada vigente.'

export const YORK_STARTER_QUESTIONS: Question[] = make('york', yorkSource, [
  { id:'a-01', difficulty:'aprendiz', category:'Historia', text:'¿Qué tres grados forman la base simbólica sobre la que se desarrollan los cuerpos del Rito de York?', options:['Aprendiz, Compañero y Maestro','Marca, Arco y Temple','Rosa Cruz, Kadosh y 33','Electo, Perfecto y Juez'], correctAnswer:0, directAnswer:'Aprendiz, Compañero y Maestro' },
  { id:'a-02', difficulty:'aprendiz', category:'Simbolismo', text:'¿Qué herramienta representa de forma clásica la rectitud de la conducta?', options:['Escuadra','Mazo','Palanca','Compás únicamente'], correctAnswer:0, directAnswer:'Escuadra' },
  { id:'a-03', difficulty:'aprendiz', category:'Ética', text:'¿Qué principio encaja mejor con el trabajo moral del Aprendiz?', options:['Mejoramiento personal','Competencia por rango','Prestigio social','Obediencia sin reflexión'], correctAnswer:0, directAnswer:'Mejoramiento personal' },
  { id:'a-04', difficulty:'aprendiz', category:'Tradición', text:'En la masonería simbólica, ¿qué grado sigue al de Aprendiz?', options:['Compañero','Maestro de Marca','Arco Real','Caballero Templario'], correctAnswer:0, directAnswer:'Compañero' },
  { id:'c-01', difficulty:'compañero', category:'Historia', text:'En la organización estadounidense más común del York Rite, ¿qué cuerpo trabaja los grados del Arco Real?', options:['Capítulo','Consistorio','Supremo Consejo','Areópago'], correctAnswer:0, directAnswer:'Capítulo' },
  { id:'c-02', difficulty:'compañero', category:'Artes y Ciencias', text:'¿Qué ciencia se vincula de forma tradicional al estudio de proporciones y construcción simbólica?', options:['Geometría','Meteorología','Botánica','Oceanografía'], correctAnswer:0, directAnswer:'Geometría' },
  { id:'c-03', difficulty:'compañero', category:'Tradición', text:'¿Cuál de estos grados se asocia al trabajo capitular del York Rite?', options:['Maestro de Marca','Caballero Kadosh','Maestro Secreto','Gran Inspector General'], correctAnswer:0, directAnswer:'Maestro de Marca' },
  { id:'c-04', difficulty:'compañero', category:'Filosofía', text:'¿Qué describe mejor la progresión del Compañero?', options:['Ampliar comprensión y aplicar lo aprendido','Dejar de estudiar','Buscar superioridad','Abandonar el trabajo simbólico'], correctAnswer:0, directAnswer:'Ampliar comprensión y aplicar lo aprendido' },
  { id:'m-01', difficulty:'maestro', category:'Historia', text:'En la estructura estadounidense común del York Rite, ¿qué tres grandes grupos aparecen después de la Logia simbólica?', options:['Capítulo, Consejo y Comandancia','Logia, Valle y Consistorio','Capítulo, Areópago y Supremo Consejo','Consejo, Valle y Senado'], correctAnswer:0, directAnswer:'Capítulo, Consejo y Comandancia' },
  { id:'m-02', difficulty:'maestro', category:'Tradición', text:'La Comandancia del York Rite confiere principalmente…', options:['Órdenes','Los grados 4 al 32','Los nueve grados del RNM','Los Órdenes de Sabiduría franceses'], correctAnswer:0, directAnswer:'Órdenes' },
  { id:'m-03', difficulty:'maestro', category:'Ceremonial', text:'¿Cuál de estas denominaciones corresponde a una Orden de la Comandancia?', options:['Orden del Temple','Caballero Kadosh','Gran Elegido Escocés','Maestro Secreto'], correctAnswer:0, directAnswer:'Orden del Temple' },
  { id:'m-04', difficulty:'maestro', category:'Filosofía', text:'¿Qué idea es común a la progresión iniciática de los distintos cuerpos del York Rite?', options:['Profundizar deber, servicio y conocimiento','Eliminar los grados simbólicos','Sustituir la ética por jerarquía','Competir entre cuerpos'], correctAnswer:0, directAnswer:'Profundizar deber, servicio y conocimiento' },
])

export const FRENCH_STARTER_QUESTIONS: Question[] = make('frances', frenchSource, [
  { id:'a-01', difficulty:'aprendiz', category:'Historia', text:'¿En qué país se codificó históricamente el Rito Francés?', options:['Francia','Escocia','México','Italia'], correctAnswer:0, directAnswer:'Francia' },
  { id:'a-02', difficulty:'aprendiz', category:'Tradición', text:'¿Cuántos grados simbólicos tiene el Rito Francés?', options:['3','7','9','33'], correctAnswer:0, directAnswer:'3' },
  { id:'a-03', difficulty:'aprendiz', category:'Simbolismo', text:'¿Qué instrumento simboliza tradicionalmente la rectitud?', options:['Escuadra','Palanca','Mazo','Regla de cálculo'], correctAnswer:0, directAnswer:'Escuadra' },
  { id:'a-04', difficulty:'aprendiz', category:'Ética', text:'¿Qué valor se alinea mejor con la tradición ilustrada asociada al Rito Francés?', options:['Razón y perfeccionamiento moral','Privilegio hereditario','Competencia económica','Obediencia ciega'], correctAnswer:0, directAnswer:'Razón y perfeccionamiento moral' },
  { id:'c-01', difficulty:'compañero', category:'Historia', text:'¿Qué institución francesa tuvo un papel central en la codificación del Rito Francés en el siglo XVIII?', options:['Gran Oriente de Francia','Supremo Consejo de Charleston','Gran Logia Unida de Inglaterra exclusivamente','Consejo de York'], correctAnswer:0, directAnswer:'Gran Oriente de Francia' },
  { id:'c-02', difficulty:'compañero', category:'Artes y Ciencias', text:'¿Qué disciplina ocupa un lugar simbólico central en la tradición constructiva?', options:['Geometría','Astronáutica','Genética','Oceanografía'], correctAnswer:0, directAnswer:'Geometría' },
  { id:'c-03', difficulty:'compañero', category:'Tradición', text:'Después de los tres grados simbólicos, el Rito Francés tradicional desarrolla…', options:['Órdenes de Sabiduría','Los grados 4 al 32 del REAA','Sólo una comandancia','Nueve grados nacionales'], correctAnswer:0, directAnswer:'Órdenes de Sabiduría' },
  { id:'c-04', difficulty:'compañero', category:'Filosofía', text:'¿Qué describe mejor el trabajo del Compañero?', options:['Ampliar conocimiento y comprensión','Renunciar al estudio','Buscar rango','Evitar las ciencias'], correctAnswer:0, directAnswer:'Ampliar conocimiento y comprensión' },
  { id:'m-01', difficulty:'maestro', category:'Tradición', text:'¿Cuántos Órdenes de Sabiduría iniciáticos se consideran normalmente en la escala principal del Rito Francés?', options:['4','3','9','30'], correctAnswer:0, directAnswer:'4' },
  { id:'m-02', difficulty:'maestro', category:'Historia', text:'La estructura iniciática principal del Rito Francés suele resumirse como…', options:['3 grados + 4 órdenes','33 grados','12 órdenes','9 grados'], correctAnswer:0, directAnswer:'3 grados + 4 órdenes' },
  { id:'m-03', difficulty:'maestro', category:'Tradición', text:'¿Cuál de estas denominaciones corresponde a un Orden de Sabiduría tradicional?', options:['Caballero de Oriente','Caballero Kadosh','Maestro de Marca','Gran Inspector General'], correctAnswer:0, directAnswer:'Caballero de Oriente' },
  { id:'m-04', difficulty:'maestro', category:'Ceremonial', text:'El quinto orden histórico del Rito Francés se caracteriza principalmente como…', options:['Administrativo y conservatorio','El grado de Aprendiz','Una comandancia','El grado 33'], correctAnswer:0, directAnswer:'Administrativo y conservatorio' },
])

export const RNM_STARTER_QUESTIONS: Question[] = make('nacional-mexicano', rnmSource, [
  { id:'a-01', difficulty:'aprendiz', category:'Historia', text:'¿En qué año se estableció formalmente el Rito Nacional Mexicano?', options:['1825','1717','1801','1910'], correctAnswer:0, directAnswer:'1825' },
  { id:'a-02', difficulty:'aprendiz', category:'Tradición', text:'¿Cuáles son los tres primeros grados del Rito Nacional Mexicano?', options:['Aprendiz, Compañero y Maestro','Aprendiz, Elegido y Juez','Marca, Arco y Temple','Maestro, Kadosh y 33'], correctAnswer:0, directAnswer:'Aprendiz, Compañero y Maestro' },
  { id:'a-03', difficulty:'aprendiz', category:'Ética', text:'¿Qué ideal histórico se asocia fuertemente al origen del Rito Nacional Mexicano?', options:['Autonomía e identidad nacional','Dependencia extranjera','Jerarquía hereditaria','Aislamiento social'], correctAnswer:0, directAnswer:'Autonomía e identidad nacional' },
  { id:'a-04', difficulty:'aprendiz', category:'Simbolismo', text:'¿Qué herramienta representa tradicionalmente la rectitud?', options:['Escuadra','Mazo','Palanca','Cincel únicamente'], correctAnswer:0, directAnswer:'Escuadra' },
  { id:'c-01', difficulty:'compañero', category:'Historia', text:'¿En qué siglo nació el Rito Nacional Mexicano?', options:['XIX','XVII','XVIII','XXI'], correctAnswer:0, directAnswer:'XIX' },
  { id:'c-02', difficulty:'compañero', category:'Tradición', text:'¿Cuántos grados componen históricamente el Rito Nacional Mexicano?', options:['9','3','7','33'], correctAnswer:0, directAnswer:'9' },
  { id:'c-03', difficulty:'compañero', category:'Artes y Ciencias', text:'¿Qué ciencia se asocia tradicionalmente con medida, proporción y construcción?', options:['Geometría','Botánica','Meteorología','Zoología'], correctAnswer:0, directAnswer:'Geometría' },
  { id:'c-04', difficulty:'compañero', category:'Filosofía', text:'¿Qué idea resume mejor la orientación cívica histórica atribuida al RNM?', options:['Verdad y progreso social','Privilegio hereditario','Obediencia extranjera','Competencia económica'], correctAnswer:0, directAnswer:'Verdad y progreso social' },
  { id:'m-01', difficulty:'maestro', category:'Historia', text:'¿Qué personaje mexicano se asocia históricamente con el Rito Nacional Mexicano?', options:['Benito Juárez','Isaac Newton','Mozart exclusivamente','Albert Pike como fundador del RNM'], correctAnswer:0, directAnswer:'Benito Juárez' },
  { id:'m-02', difficulty:'maestro', category:'Tradición', text:'El grado máximo histórico del Rito Nacional Mexicano ocupa el número…', options:['9','33','12','7'], correctAnswer:0, directAnswer:'9' },
  { id:'m-03', difficulty:'maestro', category:'Filosofía', text:'¿Qué característica distingue históricamente al RNM frente a ritos administrados desde el extranjero?', options:['Su pretensión de régimen nacional autónomo','Carecer de grados simbólicos','Ser exclusivamente militar','No usar simbolismo constructivo'], correctAnswer:0, directAnswer:'Su pretensión de régimen nacional autónomo' },
  { id:'m-04', difficulty:'maestro', category:'Ética', text:'¿Qué objetivo encaja mejor con una lectura cívica del trabajo masónico?', options:['Mejoramiento individual orientado al bien social','Acumulación de privilegios','Competencia interna','Rechazo del estudio'], correctAnswer:0, directAnswer:'Mejoramiento individual orientado al bien social' },
])

export const OTHER_RITE_STARTER_QUESTIONS = [
  ...YORK_STARTER_QUESTIONS,
  ...FRENCH_STARTER_QUESTIONS,
  ...RNM_STARTER_QUESTIONS,
]
