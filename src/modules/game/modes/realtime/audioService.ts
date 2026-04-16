import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng'

export interface AudioControlState {
  isMuted: boolean
  isAudioEnabled: boolean
  volume: number
}

export class AudioService {
  private client: IAgoraRTCClient | null = null
  private appId = import.meta.env.VITE_AGORA_APP_ID
  private token: string | null = null
  private channelName: string | null = null

  async initialize(channelName: string, token?: string): Promise<void> {
    this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })
    this.channelName = channelName
    this.token = token || null

    this.client.on('user-published', async (user, mediaType) => {
      await this.client!.subscribe(user, mediaType)
      console.log('subscribe success')
    })

    this.client.on('user-unpublished', (user) => {
      console.log(user.uid, 'user unpublished')
    })
  }

  async join(uid: string | number): Promise<void> {
    if (!this.client || !this.channelName) {
      throw new Error('AudioService not initialized')
    }

    await this.client.join(this.appId, this.channelName, this.token, uid)
  }

  async publishAudio(): Promise<void> {
    if (!this.client) {
      throw new Error('AudioService not initialized')
    }

    const audioTrack = await AgoraRTC.createMicrophoneAudioTrack()
    await this.client.publish([audioTrack])
  }

  async toggleAudio(enabled: boolean): Promise<void> {
    if (!this.client) {
      throw new Error('AudioService not initialized')
    }

    const audioTracks = this.client.localTracks.filter((track) => track.trackMediaType === 'audio')
    audioTracks.forEach((track) => {
      track.enabled = enabled
    })
  }

  async leave(): Promise<void> {
    if (!this.client) {
      throw new Error('AudioService not initialized')
    }

    this.client.localTracks.forEach((track) => {
      track.close()
    })

    await this.client.leave()
  }

  getClient(): IAgoraRTCClient | null {
    return this.client
  }
}

export const audioService = new AudioService()
