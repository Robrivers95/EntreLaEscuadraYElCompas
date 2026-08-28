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

const commonChecks = [
  ['voice initialization in board room', turns, 'audioService.initialize'],
  ['voice join in board room', turns, 'audioService.join'],
  ['voice publish in board room', turns, 'audioService.publishAudio'],
  ['voice toggle in board room', turns, 'audioService.toggleAudio'],
  ['voice cleanup in board room', turns, 'audioService.leave'],
  ['microphone API', audio, 'getUserMedia'],
]

const agoraChecks = [
  ['Agora dependency', pkgText, 'agora-rtc-sdk-ng'],
  ['Agora RTC client', audio, 'AgoraRTC.createClient'],
  ['Agora remote playback', audio, 'user.audioTrack?.play()'],
  ['Agora microphone', audio, 'AgoraRTC.createMicrophoneAudioTrack()'],
  ['Agora channel join', audio, 'this.client.join'],
]

const webRtcChecks = [
  ['WebRTC peer connection', audio, 'new RTCPeerConnection'],
  ['Firebase signaling', audio, "'voiceRooms'"],
  ['WebRTC remote track', audio, 'peer.ontrack'],
  ['WebRTC remote playback', audio, 'audio.play()'],
  ['WebRTC offer', audio, 'createOffer'],
  ['WebRTC answer', audio, 'createAnswer'],
  ['WebRTC ICE', audio, 'onicecandidate'],
]

const missingCommon = commonChecks.filter(([, text, token]) => !text.includes(token))
const agoraOk = agoraChecks.every(([, text, token]) => text.includes(token))
const webRtcOk = webRtcChecks.every(([, text, token]) => text.includes(token))

if (missingCommon.length || (!agoraOk && !webRtcOk)) {
  console.error('✗ Regresión de voz detectada. Se bloquea el build:')
  for (const [label] of missingCommon) console.error(`  - ${label}`)
  if (!agoraOk && !webRtcOk) console.error('  - No queda ningún motor de voz completo (Agora o WebRTC).')
  process.exit(3)
}

console.log(`✓ Invariante de voz verificada: tablero + micrófono + audio remoto + cleanup. Motores: ${agoraOk ? 'Agora' : ''}${agoraOk && webRtcOk ? ' + ' : ''}${webRtcOk ? 'WebRTC/Firebase' : ''}.`)
