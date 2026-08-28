import fs from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const ENV_PATH = path.join(ROOT, '.env.local')
const LIVE_URL = process.env.VOICE_SOURCE_URL || 'https://juegodemesamasonico.web.app/'
const REQUIRE_VOICE = process.argv.includes('--require')
const APP_ID_RE = /\b[a-f0-9]{32}\b/gi
const ASSET_RE = /["'`](\/assets\/[^"'`?#]+\.js(?:\?[^"'`]*)?)["'`]/g
const ANCHORS = [
  'AudioService not initialized',
  'createMicrophoneAudioTrack',
  'user-published',
  'user-unpublished',
  'subscribe success',
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
    headers: { 'user-agent': 'EntreLaEscuadraYElCompas-voice-preserver/1.0' },
    redirect: 'follow',
  })
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`)
  return response.text()
}

function assetUrls(text, base) {
  const urls = new Set()
  for (const match of text.matchAll(ASSET_RE)) {
    try { urls.add(new URL(match[1], base).href) } catch { /* ignore malformed asset */ }
  }
  return urls
}

function scoreCandidates(text) {
  const scores = new Map()
  for (const anchor of ANCHORS) {
    let from = 0
    while (true) {
      const index = text.indexOf(anchor, from)
      if (index < 0) break
      const start = Math.max(0, index - 14000)
      const end = Math.min(text.length, index + 14000)
      const window = text.slice(start, end)
      const ids = window.match(APP_ID_RE) || []
      for (const id of ids) {
        if (!isRealAppId(id)) continue
        const distance = Math.abs((start + window.indexOf(id)) - index)
        const proximity = Math.max(1, 12 - Math.floor(distance / 1200))
        scores.set(id, (scores.get(id) || 0) + proximity)
      }
      from = index + anchor.length
    }
  }
  return scores
}

async function recoverFromPublishedBuild() {
  const html = await fetchText(LIVE_URL)
  const queue = [...assetUrls(html, LIVE_URL)]
  const seen = new Set()
  const aggregate = new Map()

  while (queue.length && seen.size < 80) {
    const url = queue.shift()
    if (!url || seen.has(url)) continue
    seen.add(url)
    try {
      const js = await fetchText(url)
      for (const nested of assetUrls(js, url)) if (!seen.has(nested)) queue.push(nested)
      for (const [id, score] of scoreCandidates(js)) aggregate.set(id, (aggregate.get(id) || 0) + score)
    } catch {
      // One missing lazy chunk must not prevent checking the rest of the live build.
    }
  }

  const ranked = [...aggregate.entries()].sort((a, b) => b[1] - a[1])
  if (!ranked.length) return null
  if (ranked.length > 1 && ranked[0][1] === ranked[1][1]) return null
  return ranked[0][0]
}

function failOrWarn(message) {
  if (REQUIRE_VOICE) {
    console.error(`✗ ${message}`)
    process.exitCode = 2
  } else {
    console.warn(`⚠ ${message}`)
  }
}

async function main() {
  const envText = await readEnv()
  const existing = getEnvValue(envText, 'VITE_AGORA_APP_ID')
  if (isRealAppId(existing)) {
    console.log('✓ Voz protegida: se conserva la configuración Agora existente.')
    return true
  }

  try {
    const recovered = await recoverFromPublishedBuild()
    if (!recovered) {
      failOrWarn('No se pudo recuperar automáticamente la configuración Agora del sitio publicado. Producción queda protegida y no debe reemplazarse sin voz.')
      return false
    }
    await saveAppId(envText, recovered)
    console.log('✓ Voz protegida: configuración Agora recuperada de la versión publicada y guardada en .env.local.')
    return true
  } catch (error) {
    failOrWarn(`No se pudo consultar la versión publicada para preservar Agora: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

await main()
