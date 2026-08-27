import AgoraRTC from 'agora-rtc-sdk-ng'
import type { IAgoraRTCClient, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng'

export interface AudioControlState {
  isMuted: boolean
  isAudioEnabled: boolean
  volume: number
}

export class AudioService {
  private client: IAgoraRTCClient | null = null
  private localAudioTrack: IMicrophoneAudioTrack | null = null
  private appId = import.meta.env.VITE_AGORA_APP_ID
  private token: string | null = null
  private channelName: string | null = null

  isConfigured(): boolean {
    return Boolean(this.appId)
  }

  async initialize(channelName: string, token?: string): Promise<void> {
    if (!this.appId) throw new Error('Falta VITE_AGORA_APP_ID para habilitar la voz.')
    if (this.client) await this.leave()

    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    this.channelName = channelName
    this.token = token || null

    this.client.on('user-published', async (user, mediaType) => {
      if (!this.client) return
      await this.client.subscribe(user, mediaType)
      if (mediaType === 'audio') user.audioTrack?.play()
    })

    this.client.on('user-unpublished', (user) => {
      console.log(user.uid, 'user unpublished')
    })
  }

  async join(uid: string | number): Promise<void> {
    if (!this.client || !this.channelName) throw new Error('AudioService not initialized')
    if (!this.appId) throw new Error('Falta VITE_AGORA_APP_ID para habilitar la voz.')
    await this.client.join(this.appId, this.channelName, this.token, uid)
  }

  async publishAudio(): Promise<void> {
    if (!this.client) throw new Error('AudioService not initialized')
    if (this.localAudioTrack) return
    this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
    await this.client.publish([this.localAudioTrack])
  }

  async toggleAudio(enabled: boolean): Promise<void> {
    if (!this.localAudioTrack) throw new Error('Microphone audio is not published')
    await this.localAudioTrack.setEnabled(enabled)
  }

  async leave(): Promise<void> {
    this.localAudioTrack?.close()
    this.localAudioTrack = null

    if (this.client) {
      await this.client.leave()
      this.client.removeAllListeners()
    }

    this.client = null
    this.channelName = null
    this.token = null
  }

  getClient(): IAgoraRTCClient | null {
    return this.client
  }
}

export const audioService = new AudioService()
