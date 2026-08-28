import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const ENV_PATH = path.join(ROOT, '.env.local')
const HOME = process.env.HOME || '/home/codespace'
const LIVE_URL = process.env.VOICE_SOURCE_URL || 'https://juegodemesamasonico.web.app/'
const REQUIRE_VOICE = process.argv.includes('--require')
const APP_ID_RE = /\b[a-f0-9]{32}\b/gi
const JS_REF_RE = /["'`]((?:\/assets\/|\.\/|\.\.\/)[^"'`?#]+\.js(?:\?[^"'`]*)?)["'`]/g
const ANCHORS = [
  'AudioService not initialized',
  'createMicrophoneAudioTrack',
  'user-published',
  'user-unpublished',
  'AgoraRTC',
  'agora-rtc-sdk-ng',
  'subscribe success',
]
const SKIP_DIRS = new Set(['node_modules', '.git', '.cache', '.vite'])
const LOCAL_EXTENSIONS = new Set(['.js', '.mjs', '.cjs', '.html', '.map'])
const HISTORY_ROOTS = [
  path.join(HOME, '.bash_history'),
  path.join(HOME, '.zsh_history'),
  path.join(HOME, '.profile'),
  path.join(HOME, '.bashrc'),
  path.join(HOME, '.config'),
  path.join(HOME, '.vscode-remote', 'data', 'User', 'History'),
]

const isRealAppId = (value = '') => /^[a-f0-9]{32}$/i.test(value) && value !== '00000000000000000000000000000000'

async function readEnv() {
  try { return await fs.readFile(ENV_PATH, 'utf8') } catch { return '' }
}

function getEnvValue(text, key) {
  const match = text.match(new RegExp(`^${key}=(.+)$`, 'm'))
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, '') || ''
}

async function saveAppId(envText, appId) {
  const lines = envText.split(/\r?\n/).filter((line) => !line.startsWith('VITE_AGORA_APP_ID='))
  while (lines.length && lines.at(-1) === '') lines.pop()
  lines.push(`VITE_AGORA_APP_ID=${appId}`, '')
  await fs.writeFile(ENV_PATH, lines.join('\n'), { mode: 0o600 })
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'EntreLaEscuadraYElCompas-voice-preserver/1.2' },
    redirect: 'follow',
  })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.text()
}

function assetUrls(text, base) {
  const urls = new Set()
  for (const match of text.matchAll(JS_REF_RE)) {
    try { urls.add(new URL(match[1], base).href) } catch { /* ignore malformed asset */ }
  }
  return urls
}

function scoreCandidates(text) {
  const scores = new Map()
  let hasAgoraAnchor = false

  for (const anchor of ANCHORS) {
    let from = 0
    while (true) {
      const index = text.indexOf(anchor, from)
      if (index < 0) break
      hasAgoraAnchor = true
      const start = Math.max(0, index - 24000)
      const end = Math.min(text.length, index + 24000)
      const window = text.slice(start, end)
      const ids = window.match(APP_ID_RE) || []
      for (const id of ids) {
        if (!isRealAppId(id)) continue
        const localIndex = window.indexOf(id)
        const distance = Math.abs((start + localIndex) - index)
        const proximity = Math.max(2, 30 - Math.floor(distance / 1000))
        scores.set(id, (scores.get(id) || 0) + proximity)
      }
      from = index + anchor.length
    }
  }

  // Vite/minification can place the env literal far from the Agora methods.
  // If this chunk clearly contains Agora, consider every 32-hex candidate in it.
  if (hasAgoraAnchor) {
    for (const id of text.match(APP_ID_RE) || []) {
      if (isRealAppId(id)) scores.set(id, (scores.get(id) || 0) + 5)
    }
  }

  return scores
}

function chooseCandidate(aggregate) {
  const ranked = [...aggregate.entries()].sort((a, b) => b[1] - a[1])
  if (!ranked.length) return null
  if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) return null
  return ranked[0][0]
}

function recoverFromProcessEnv() {
  for (const [key, value] of Object.entries(process.env)) {
    if (!/AGORA/i.test(key) || typeof value !== 'string') continue
    const candidate = (value.match(APP_ID_RE) || []).find(isRealAppId)
    if (candidate) {
      console.log('✓ Se recuperó la configuración de voz desde variables del Codespace.')
      return candidate
    }
  }
  return null
}

function extractAgoraCandidate(text) {
  if (!/agora/i.test(text)) return null
  const explicit = text.match(/(?:VITE_)?AGORA(?:_APP)?_?ID\s*[=:]\s*['"]?([a-f0-9]{32})/i)?.[1]
  if (isRealAppId(explicit)) return explicit
  const ids = [...new Set((text.match(APP_ID_RE) || []).filter(isRealAppId))]
  return ids.length === 1 ? ids[0] : null
}

async function walkHistory(dir, depth = 0, found = []) {
  if (depth > 5 || found.length > 3500) return found
  let entries
  try { entries = await fs.readdir(dir, { withFileTypes: true }) } catch { return found }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) await walkHistory(full, depth + 1, found)
    else if (entry.isFile()) found.push(full)
    if (found.length > 3500) break
  }
  return found
}

async function recoverFromHistory() {
  const files = []
  for (const root of HISTORY_ROOTS) {
    try {
      const stat = await fs.stat(root)
      if (stat.isFile()) files.push(root)
      else if (stat.isDirectory()) await walkHistory(root, 0, files)
    } catch { /* absent is normal */ }
  }

  for (const file of files) {
    try {
      const stat = await fs.stat(file)
      if (stat.size > 6 * 1024 * 1024) continue
      const candidate = extractAgoraCandidate(await fs.readFile(file, 'utf8'))
      if (candidate) {
        console.log('✓ Se recuperó la configuración de voz desde historial/configuración local del Codespace.')
        return candidate
      }
    } catch { /* ignore unreadable/binary history */ }
  }
  return null
}

async function walkFiles(dir, depth = 0, found = []) {
  if (depth > 6) return found
  let entries
  try { entries = await fs.readdir(dir, { withFileTypes: true }) } catch { return found }
  for (const entry of entries) {
    if (entry.name.startsWith('.') && entry.name !== '.firebase') continue
    if (SKIP_DIRS.has(entry.name)) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) await walkFiles(full, depth + 1, found)
    else if (entry.isFile() && LOCAL_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) found.push(full)
    if (found.length >= 3000) break
  }
  return found
}

async function recoverFromLocalBuilds() {
  const roots = new Set([ROOT, path.dirname(ROOT), path.join(ROOT, 'EntreLaEscuadraYElCompas')])
  const aggregate = new Map()
  let inspected = 0
  for (const root of roots) {
    for (const file of await walkFiles(root)) {
      let text
      try {
        const stat = await fs.stat(file)
        if (stat.size > 16 * 1024 * 1024) continue
        text = await fs.readFile(file, 'utf8')
      } catch { continue }
      inspected += 1
      for (const [id, score] of scoreCandidates(text)) aggregate.set(id, (aggregate.get(id) || 0) + score)
    }
  }
  const candidate = chooseCandidate(aggregate)
  if (candidate) console.log(`✓ Se recuperó la configuración de voz desde un build local previo (${inspected} archivos revisados).`)
  return candidate
}

async function recoverFromPublishedBuild() {
  const html = await fetchText(LIVE_URL)
  const queue = [...assetUrls(html, LIVE_URL)]
  const seen = new Set()
  const aggregate = new Map()
  while (queue.length && seen.size < 220) {
    const url = queue.shift()
    if (!url || seen.has(url)) continue
    seen.add(url)
    try {
      const js = await fetchText(url)
      for (const nested of assetUrls(js, url)) if (!seen.has(nested)) queue.push(nested)
      for (const [id, score] of scoreCandidates(js)) aggregate.set(id, (aggregate.get(id) || 0) + score)
    } catch { /* one missing lazy chunk must not stop the scan */ }
  }
  return chooseCandidate(aggregate)
}

function failOrWarn(message) {
  if (REQUIRE_VOICE) {
    console.error(`✗ ${message}`)
    process.exitCode = 2
  } else console.warn(`⚠ ${message}`)
}

async function main() {
  const envText = await readEnv()
  const existing = getEnvValue(envText, 'VITE_AGORA_APP_ID')
  if (isRealAppId(existing)) {
    console.log('✓ Voz protegida: se conserva la configuración Agora existente.')
    return true
  }

  const recovered = recoverFromProcessEnv()
    || await recoverFromHistory()
    || await recoverFromLocalBuilds()

  if (recovered) {
    await saveAppId(envText, recovered)
    console.log('✓ Voz protegida: configuración Agora restaurada en .env.local sin intervención manual.')
    return true
  }

  try {
    const liveRecovered = await recoverFromPublishedBuild()
    if (!liveRecovered) {
      failOrWarn('No se encontró la configuración Agora en variables, historial, builds locales ni sitio publicado. Producción queda protegida y no será reemplazada sin voz.')
      return false
    }
    await saveAppId(envText, liveRecovered)
    console.log('✓ Voz protegida: configuración Agora recuperada de la versión publicada y guardada en .env.local.')
    return true
  } catch (error) {
    failOrWarn(`No se pudo consultar la versión publicada para preservar Agora: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

await main()
