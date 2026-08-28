let audioContext: AudioContext | null = null

const context = () => {
  if (typeof window === 'undefined') return null
  audioContext ??= new AudioContext()
  if (audioContext.state === 'suspended') void audioContext.resume()
  return audioContext
}

const tone = (frequency: number, duration: number, volume = 0.045, delay = 0, type: OscillatorType = 'sine') => {
  const ctx = context()
  if (!ctx) return
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  const start = ctx.currentTime + delay
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

export const gameSounds = {
  diceTick() {
    tone(150 + Math.random() * 90, 0.055, 0.025, 0, 'square')
  },
  diceLand() {
    tone(180, 0.09, 0.04, 0, 'triangle')
    tone(120, 0.14, 0.035, 0.06, 'triangle')
  },
  advance() {
    tone(420, 0.12, 0.035, 0, 'sine')
    tone(560, 0.13, 0.038, 0.09, 'sine')
    tone(720, 0.16, 0.04, 0.18, 'sine')
  },
  correct() {
    tone(520, 0.12, 0.035, 0, 'sine')
    tone(780, 0.2, 0.04, 0.1, 'sine')
  },
  incorrect() {
    tone(210, 0.15, 0.03, 0, 'sawtooth')
    tone(150, 0.22, 0.025, 0.11, 'sawtooth')
  },
}
