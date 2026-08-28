import type { MasonicDegree, MasonicRite } from '@/modules/questions/types'

export type RoomLevel = MasonicDegree | 'general'

export interface RiteGameConfig {
  rite: MasonicRite
  boardSize: number
  masonic: boolean
  description: string
  boardNote: string
}

export interface RiteExamQuestion {
  id: string
  rite: MasonicRite
  text: string
  options: string[]
  correctAnswer: number
  explanation?: string
}

export interface RiteCertification {
  rite: MasonicRite
  level: RoomLevel
  score: number
  passedAt: number
}

export const RITE_GAME_CONFIG: Record<MasonicRite, RiteGameConfig> = {
  reaa: { rite:'reaa', boardSize:33, masonic:true, description:'Tablero masónico del Rito Escocés Antiguo y Aceptado.', boardNote:'33 casillas como identidad visual del sistema de 33 grados del REAA.' },
  york: { rite:'york', boardSize:12, masonic:true, description:'Tablero inspirado en la progresión habitual del Rito de York.', boardNote:'12 etapas como configuración inicial. La estructura puede variar por jurisdicción.' },
  frances: { rite:'frances', boardSize:7, masonic:true, description:'Tablero inspirado en los tres grados simbólicos y cuatro Órdenes de Sabiduría del Rito Francés.', boardNote:'7 etapas como convención de juego.' },
  'nacional-mexicano': { rite:'nacional-mexicano', boardSize:9, masonic:true, description:'Tablero del Rito Nacional Mexicano.', boardNote:'9 casillas en referencia a sus nueve grados históricos.' },
  kabala: { rite:'kabala', boardSize:10, masonic:false, description:'Ruta libre de Kabbalah y Árbol de la Vida.', boardNote:'10 casillas, una por cada sefirah: Keter, Chokhmah, Binah, Chesed, Gevurah, Tiferet, Netzach, Hod, Yesod y Malkhut. Abierta a todos y sin reteje.' },
  libre: { rite:'libre', boardSize:30, masonic:false, description:'Maratón de cultura general abierto a cualquier jugador.', boardNote:'Este modo NO ES MASÓN. Usa preguntas de historia, ciencia, geografía, cultura y conocimiento general.' },
  otro: { rite:'otro', boardSize:30, masonic:true, description:'Sala para un banco masónico personalizado.', boardNote:'La cantidad de casillas puede personalizarse cuando administración defina el rito y su estructura.' },
}

const q = (rite:MasonicRite,id:string,text:string,options:string[],correctAnswer:number,explanation?:string):RiteExamQuestion => ({ rite,id,text,options,correctAnswer,explanation })

/** Exámenes de acceso del juego con conocimiento público. No incluyen palabras, signos, toques ni datos reservados. */
export const RITE_EXAMS: Record<Exclude<MasonicRite, 'libre' | 'kabala' | 'otro'>, RiteExamQuestion[]> = {
  reaa: [
    q('reaa','reaa-1','¿Cuántos grados comprende la estructura completa del REAA?',['3','9','12','33'],3),
    q('reaa','reaa-2','¿Cuáles son los tres grados simbólicos?',['Aprendiz, Compañero y Maestro','Maestro, Rosa Cruz y Kadosh','Aprendiz, Arco Real y Templario','Electo, Perfecto y Sublime'],0),
    q('reaa','reaa-3','¿Qué herramienta simboliza de forma clásica la rectitud?',['Mazo','Escuadra','Palanca','Nivel'],1),
    q('reaa','reaa-4','¿Qué idea describe mejor el trabajo simbólico de la piedra bruta?',['Perfeccionamiento personal','Jerarquía económica','Antigüedad de la logia','Competencia entre hermanos'],0),
    q('reaa','reaa-5','¿Qué grado ocupa el número 33 en la nomenclatura del REAA?',['Aprendiz','Maestro Masón','Soberano Gran Inspector General','Caballero del Arco Real'],2),
    q('reaa','reaa-6','¿Qué número se asocia tradicionalmente con la edad simbólica del Compañero en muchas jurisdicciones?',['3','5','7','12'],1),
  ],
  york: [
    q('york','york-1','En la organización estadounidense más común del Rito de York, ¿qué cuerpo está asociado al Arco Real?',['Capítulo','Consistorio','Areópago','Supremo Consejo'],0),
    q('york','york-2','¿Cuál de estos nombres pertenece a una Orden de la Comandancia del Rito de York?',['Orden del Temple','Caballero Kadosh','Príncipe del Líbano','Maestro Secreto'],0),
    q('york','york-3','¿Qué grado culmina normalmente el trabajo del Capítulo del Arco Real?',['Royal Arch Mason / Masón del Arco Real','Aprendiz','Gran Inspector General','Caballero Rosa Cruz'],0),
    q('york','york-4','¿Qué tres grados forman la base simbólica común de la masonería regular?',['Aprendiz, Compañero y Maestro','Marca, Arco y Temple','Aprendiz, Maestro de Marca y Templario','Compañero, Rosa Cruz y Kadosh'],0),
    q('york','york-5','En el Rito de York, la Comandancia confiere principalmente…',['Órdenes','Sólo grados simbólicos','Los grados 4 al 32','Los nueve grados del RNM'],0),
    q('york','york-6','¿Cuál de estos cuerpos NO pertenece normalmente al sistema York estadounidense?',['Capítulo','Consejo','Comandancia','Consistorio del grado 32'],3),
  ],
  frances: [
    q('frances','fr-1','¿Cuántos grados simbólicos tiene el Rito Francés?',['3','4','7','33'],0),
    q('frances','fr-2','¿Cuántos Órdenes de Sabiduría iniciáticos siguen tradicionalmente a los tres grados simbólicos?',['2','4','9','30'],1),
    q('frances','fr-3','¿Cuál es el primer grado simbólico del Rito Francés?',['Aprendiz','Elegido Secreto','Caballero de Oriente','Rosa Cruz'],0),
    q('frances','fr-4','¿Cuál de estas denominaciones aparece entre los Órdenes de Sabiduría tradicionales?',['Caballero de Oriente','Caballero Kadosh','Maestro de Marca','Gran Inspector General'],0),
    q('frances','fr-5','La estructura iniciática habitual del Rito Francés puede resumirse como…',['3 grados + 4 órdenes','33 grados','9 grados','12 órdenes obligatorios'],0),
    q('frances','fr-6','El quinto orden histórico del Rito Francés se describe principalmente como…',['Administrativo y conservatorio','El grado de Aprendiz','Una comandancia templaria','El grado 33'],0),
  ],
  'nacional-mexicano': [
    q('nacional-mexicano','rnm-1','¿Cuántos grados componen históricamente el Rito Nacional Mexicano?',['3','7','9','33'],2),
    q('nacional-mexicano','rnm-2','¿En qué siglo se fundó el Rito Nacional Mexicano?',['XVII','XVIII','XIX','XXI'],2),
    q('nacional-mexicano','rnm-3','¿Cuáles son sus tres primeros grados, comunes a la masonería simbólica?',['Aprendiz, Compañero y Maestro','Aprendiz, Elegido y Juez','Compañero, Arco Real y Templario','Maestro, Kadosh y 33'],0),
    q('nacional-mexicano','rnm-4','¿Qué característica histórica buscó afirmar el Rito Nacional Mexicano desde su origen?',['Autonomía e identidad nacional','Dependencia de un Supremo Consejo extranjero','Eliminar los grados simbólicos','Convertirse en una orden militar'],0),
    q('nacional-mexicano','rnm-5','¿En qué año se estableció formalmente el Rito Nacional Mexicano?',['1717','1801','1825','1910'],2),
    q('nacional-mexicano','rnm-6','¿Cuál de estos personajes está históricamente asociado con el Rito Nacional Mexicano?',['Benito Juárez','Isaac Newton exclusivamente','George Washington exclusivamente','Albert Pike como fundador del RNM'],0),
  ],
}

const DEGREE_ORDER:MasonicDegree[] = ['aprendiz','compañero','maestro']
export function levelRank(level:RoomLevel):number { return level === 'general' ? 0 : DEGREE_ORDER.indexOf(level)+1 }
export function certificationCovers(certification:RiteCertification|undefined,target:RoomLevel):boolean { if(!certification)return false; if(target==='general')return true; return certification.rite!=='libre' && certification.rite!=='kabala' && levelRank(certification.level)>=levelRank(target) }
export function requiresAccessExam(preferredRite:MasonicRite|null,profileDegree:MasonicDegree|null,roomRite:MasonicRite,roomLevel:RoomLevel,certification?:RiteCertification):boolean {
  if (roomRite === 'libre' || roomRite === 'kabala') return false
  if (certificationCovers(certification, roomLevel)) return false
  const sameRite = preferredRite === roomRite
  const degreeEnough = Boolean(profileDegree && roomLevel !== 'general' && levelRank(profileDegree) >= levelRank(roomLevel))
  return !(sameRite && degreeEnough)
}
