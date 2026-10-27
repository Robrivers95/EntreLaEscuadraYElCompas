import AgoraRTC from 'agora-rtc-sdk-ng'
import type { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IAgoraRTCRemoteUser } from 'agora-rtc-sdk-ng'

/**
 * Debate-specific audiovisual session. Firebase Authentication is independent
 * from Agora: server-issued RTC tokens are mandatory before production.
 * Never ship an Agora App Certificate to the browser.
 */
export class DebateCallService {
  private client: IAgoraRTCClient | null = null
  private microphone: IMicrophoneAudioTrack | null = null
  private camera: ICameraVideoTrack | null = null
  private remoteUsers = new Map<string, IAgoraRTCRemoteUser>()
  private onChange: (() => void) | null = null
  private joined = false

  isAvailable() { return Boolean(import.meta.env.VITE_AGORA_APP_ID) }
  setOnChange(callback: (() => void) | null) { this.onChange = callback }
  getRemoteIds() { return [...this.remoteUsers.keys()] }
  getLocalVideoTrack() { return this.camera }
  getRemoteVideoTrack(uid: string) { return this.remoteUsers.get(uid)?.videoTrack ?? null }

  async connect(channel: string, uid: string, token: string | null): Promise<void> {
    if (!this.isAvailable()) throw new Error('La videollamada requiere configurar VITE_AGORA_APP_ID.')
    if (!token) throw new Error('Falta el token seguro de Agora. Se requiere el servicio de autorización antes de habilitar esta videollamada.')
    if (this.client) await this.disconnect()
    const client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    this.client = client
    client.on('user-published', async (user, mediaType) => {
      try {
        await client.subscribe(user, mediaType)
        this.remoteUsers.set(String(user.uid), user)
        if (mediaType === 'audio') user.audioTrack?.play()
        this.onChange?.()
      } catch (error) { console.error('Error al recibir audio o video remoto', error) }
    })
    client.on('user-unpublished', (user, mediaType) => {
      if (mediaType === 'video') user.videoTrack?.stop()
      this.onChange?.()
    })
    client.on('user-left', user => {
      this.remoteUsers.delete(String(user.uid))
      this.onChange?.()
    })
    try {
      await client.join(import.meta.env.VITE_AGORA_APP_ID, channel, token, uid)
      this.joined = true
      this.microphone = await AgoraRTC.createMicrophoneAudioTrack()
      this.camera = await AgoraRTC.createCameraVideoTrack({ encoderConfig: '480p_1' })
      // Publish camera for presence, microphone initially disabled.
      await this.microphone.setEnabled(false)
      await client.publish([this.camera, this.microphone])
      this.onChange?.()
    } catch (error) {
      await this.disconnect()
      throw error
    }
  }

  async setMicrophone(enabled: boolean) {
    if (!this.microphone) throw new Error('No hay micrófono conectado.')
    await this.microphone.setEnabled(enabled)
  }
  async setCamera(enabled: boolean) {
    if (!this.camera) throw new Error('No hay cámara conectada.')
    await this.camera.setEnabled(enabled)
    this.onChange?.()
  }

  async disconnect() {
    const client = this.client
    this.client = null
    this.camera?.stop()
    this.camera?.close()
    this.camera = null
    this.microphone?.stop()
    this.microphone?.close()
    this.microphone = null
    this.remoteUsers.clear()
    this.onChange?.()
    if (client) {
      try { if (this.joined) await client.leave() } finally { client.removeAllListeners() }
    }
    this.joined = false
  }
}
