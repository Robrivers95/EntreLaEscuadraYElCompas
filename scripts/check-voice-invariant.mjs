import fs from 'node:fs/promises'

const files = {
  audio: 'src/modules/game/modes/realtime/audioService.ts',
  turns: 'src/modules/game/modes/turns/TurnsGame.vue',
  pkg: 'package.json',
}

const [audio, turns, pkgText] = await Promise.all([
  fs.readFile(files.audio, 'utf8'),
  fs.readFile(files.turns, 'utf8'),
  fs.readFile(files.pkg, 'utf8'),
])

const checks = [
  ['Agora dependency', pkgText, 'agora-rtc-sdk-ng'],
  ['RTC client creation', audio, 'AgoraRTC.createClient'],
  ['remote audio playback', audio, 'user.audioTrack?.play()'],
  ['microphone creation', audio, 'AgoraRTC.createMicrophoneAudioTrack()'],
  ['channel join', audio, 'this.client.join'],
  ['microphone mute/unmute', audio, 'this.localAudioTrack.setEnabled'],
  ['voice initialization in board room', turns, 'audioService.initialize'],
  ['voice join in board room', turns, 'audioService.join'],
  ['voice publish in board room', turns, 'audioService.publishAudio'],
  ['voice toggle in board room', turns, 'audioService.toggleAudio'],
  ['voice cleanup in board room', turns, 'audioService.leave'],
]

const missing = checks.filter(([, text, token]) => !text.includes(token))
if (missing.length) {
  console.error('✗ Regresión de voz detectada. Se bloquea el build:')
  for (const [label] of missing) console.error(`  - ${label}`)
  process.exit(3)
}

console.log('✓ Invariante de voz verificada: conexión, micrófono, audio remoto, mute y cleanup siguen presentes.')
