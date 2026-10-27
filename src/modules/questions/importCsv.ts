import type { Question, QuestionGameMode, MasonicRite, QuestionDifficulty } from './types'

/** CSV RFC 4180: supports commas, quotes and embedded newlines. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = [], cell = '', quoted = false
  const input = text.replace(/^\uFEFF/, '')
  for (let i = 0; i < input.length; i++) {
    const ch = input[i]
    if (quoted) {
      if (ch === '"' && input[i + 1] === '"') { cell += '"'; i++ }
      else if (ch === '"') quoted = false
      else cell += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(cell.trim()); cell = '' }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && input[i + 1] === '\n') i++
      row.push(cell.trim()); cell = ''
      if (row.some((value) => value.length > 0)) rows.push(row)
      row = []
    } else cell += ch
  }
  if (quoted) throw new Error('CSV inválido: hay comillas sin cerrar.')
  row.push(cell.trim())
  if (row.some((value) => value.length > 0)) rows.push(row)
  return rows
}

export type ImportedQuestion = { externalId: string; question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'> }
export interface CsvImportResult { valid: ImportedQuestion[]; errors: string[] }
const RITES = new Set<MasonicRite>(['reaa','york','frances','nacional-mexicano','kabala','libre','otro'])
const GRADES = new Set<QuestionDifficulty>(['aprendiz','compañero','maestro','general'])
const MODES = new Set<QuestionGameMode>(['board','duel','study'])
const REQUIRED = ['id','pregunta','opcion_a','opcion_b','opcion_c','opcion_d','correcta','categoria','rito','grado']

export function validateQuestionCsv(text: string): CsvImportResult {
  const rows = parseCsv(text)
  if (!rows.length) return {valid: [],errors:['El CSV está vacío.']}
  const header = rows[0].map((value) => value.toLowerCase().trim())
  const missing = REQUIRED.filter((field) => !header.includes(field))
  if (missing.length) return {valid: [],errors:['Columnas obligatorias faltantes: ' + missing.join(', ')]}
  const result: CsvImportResult = {valid: [],errors: []}
  const seenIds = new Set<string>()
  for (let index = 1; index < rows.length; index++) {
    const record: Record<string,string> = {}
    header.forEach((key, i) => { record[key] = rows[index][i] ?? '' })
    const rowNumber = index + 1
    const externalId = record.id.trim()
    const options = ['opcion_a','opcion_b','opcion_c','opcion_d'].map((key) => record[key].trim())
    const correct = record.correcta.trim().toUpperCase()
    const rite = record.rito.trim().toLowerCase() as MasonicRite
    const degree = record.grado.trim().toLowerCase().replace('companero','compañero') as QuestionDifficulty
    const modes = (record.modalidades || 'board;duel;study').split(';').map((value) => value.trim()) as QuestionGameMode[]
    const issues: string[] = []
    if (!externalId || !/^[a-zA-Z0-9_-]{1,80}$/.test(externalId)) issues.push('id inválido (solo letras, números, guiones y guion bajo)')
    if (seenIds.has(externalId)) issues.push('id repetido en archivo')
    seenIds.add(externalId)
    if (!record.pregunta.trim() || !record.categoria.trim() || options.some((value) => !value)) issues.push('pregunta, categoría u opciones vacías')
    if (!['A','B','C','D'].includes(correct)) issues.push('respuesta correcta inválida')
    if (!RITES.has(rite)) issues.push('rito desconocido')
    if (!GRADES.has(degree)) issues.push('grado desconocido')
    if ((rite === 'libre' || rite === 'kabala') !== (degree === 'general')) issues.push('bancos libres deben usar grado general y bancos masónicos deben indicar grado')
    if (modes.length === 0 || modes.some((mode) => !MODES.has(mode))) issues.push('modalidades inválidas')
    const active = (record.activa || 'true').toLowerCase()
    if (active !== 'true' && active !== 'false') issues.push('activa debe ser true o false')
    if (issues.length) { result.errors.push('Fila ' + rowNumber + ': ' + issues.join('; ')); continue }
    result.valid.push({
      externalId,
      question: {
        text: record.pregunta.trim(),
        options,
        correctAnswer: 'ABCD'.indexOf(correct),
        category: record.categoria.trim(),
        rite,
        difficulty: degree,
        explanation: record.explicacion?.trim() || undefined,
        source: record.fuente?.trim() || undefined,
        gameModes: [...new Set(modes)],
        enabled: active === 'true',
        tags: ['import-id:' + externalId],
      },
    })
  }
  return result
}
