import AgoraRTC from 'agora-rtc-sdk-ng'
import type { IAgoraRTCClient, IMicrophoneAudioTrack } from 'agora-rtc-sdk-ng'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/core/firebase'

export interface AudioControlState {
  isMuted: boolean
  isAudioEnabled: boolean
  volume: number
}

type VoiceEngine = 'agora' | 'webrtc' | null
type SignalType = 'offer' | 'answer' | 'candidate'

type VoiceSignal = {
  from: string
  type: SignalType
  data: string
}

const RTC_CONFIGURATION: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
}

export class AudioService {
  private client: IAgoraRTCClient | null = null
  private localAudioTrack: IMicrophoneAudioTrack | null = null
  private appId = import.meta.env.VITE_AGORA_APP_ID
  private token: string | null = null
  private channelName: string | null = null
  private engine: VoiceEngine = null

  private localUid: string | null = null
  private localStream: MediaStream | null = null
  private peers = new Map<string, RTCPeerConnection>()
  private pendingCandidates = new Map<string, RTCIceCandidateInit[]>()
  private remoteAudio = new Map<string, HTMLAudioElement>()
  private participantsUnsubscribe: Unsubscribe | null = null
  private signalsUnsubscribe: Unsubscribe | null = null
  private participantRef: ReturnType<typeof doc> | null = null

  isConfigured(): boolean {
    if (this.appId) return true
    return typeof RTCPeerConnection !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      Boolean(navigator.mediaDevices?.getUserMedia)
  }

  getEngine(): VoiceEngine {
    return this.engine
  }

  async initialize(channelName: string, token?: string): Promise<void> {
    if (this.client || this.localStream || this.engine) await this.leave()

    this.channelName = channelName
    this.token = token || null

    if (this.appId) {
      this.engine = 'agora'
      this.client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' })

      this.client.on('user-published', async (user, mediaType) => {
        if (!this.client) return
        await this.client.subscribe(user, mediaType)
        if (mediaType === 'audio') user.audioTrack?.play()
      })

      this.client.on('user-unpublished', (user) => {
        console.log(user.uid, 'user unpublished')
      })
      return
    }

    if (!this.isConfigured()) {
      throw new Error('Este dispositivo o navegador no soporta la llamada de voz.')
    }

    this.engine = 'webrtc'
  }

  async join(uid: string | number): Promise<void> {
    if (!this.channelName || !this.engine) throw new Error('AudioService not initialized')

    if (this.engine === 'agora') {
      if (!this.client || !this.appId) throw new Error('AudioService not initialized')
      await this.client.join(this.appId, this.channelName, this.token, uid)
      return
    }

    this.localUid = String(uid)
  }

  async publishAudio(): Promise<void> {
    if (!this.engine || !this.channelName) throw new Error('AudioService not initialized')

    if (this.engine === 'agora') {
      if (!this.client) throw new Error('AudioService not initialized')
      if (this.localAudioTrack) return
      this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack()
      await this.client.publish([this.localAudioTrack])
      return
    }

    if (!this.localUid) throw new Error('Voice user not joined')
    if (this.localStream) return

    this.localStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    })

    await this.startFirebaseSignaling()
  }

  async toggleAudio(enabled: boolean): Promise<void> {
    if (this.engine === 'agora') {
      if (!this.localAudioTrack) throw new Error('Microphone audio is not published')
      await this.localAudioTrack.setEnabled(enabled)
      return
    }

    if (!this.localStream) throw new Error('Microphone audio is not published')
    this.localStream.getAudioTracks().forEach((track) => {
      track.enabled = enabled
    })
  }

  private async startFirebaseSignaling(): Promise<void> {
    if (!this.channelName || !this.localUid || !this.localStream) return

    this.participantRef = doc(db, 'voiceRooms', this.channelName, 'participants', this.localUid)
    await setDoc(this.participantRef, {
      uid: this.localUid,
      joinedAt: serverTimestamp(),
    })

    const participantsRef = collection(db, 'voiceRooms', this.channelName, 'participants')
    this.participantsUnsubscribe = onSnapshot(participantsRef, (snapshot) => {
      const present = new Set(snapshot.docs.map((item) => item.id))

      for (const participant of snapshot.docs) {
        const peerUid = participant.id
        if (peerUid === this.localUid) continue
        if (this.localUid && this.localUid.localeCompare(peerUid) < 0) {
          void this.ensureOffer(peerUid)
        }
      }

      for (const peerUid of this.peers.keys()) {
        if (!present.has(peerUid)) this.closePeer(peerUid)
      }
    })

    const ownSignalsRef = collection(
      db,
      'voiceRooms',
      this.channelName,
      'participants',
      this.localUid,
      'signals',
    )

    this.signalsUnsubscribe = onSnapshot(ownSignalsRef, (snapshot) => {
      for (const change of snapshot.docChanges()) {
        if (change.type !== 'added') continue
        const signal = change.doc.data() as VoiceSignal
        void this.handleSignal(signal).finally(() => deleteDoc(change.doc.ref).catch(() => undefined))
      }
    })
  }

  private createPeer(peerUid: string): RTCPeerConnection {
    const existing = this.peers.get(peerUid)
    if (existing) return existing

    const peer = new RTCPeerConnection(RTC_CONFIGURATION)
    this.peers.set(peerUid, peer)

    for (const track of this.localStream?.getTracks() ?? []) {
      peer.addTrack(track, this.localStream!)
    }

    peer.onicecandidate = (event) => {
      if (!event.candidate) return
      void this.sendSignal(peerUid, 'candidate', JSON.stringify(event.candidate.toJSON()))
    }

    peer.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track])
      let audio = this.remoteAudio.get(peerUid)
      if (!audio) {
        audio = document.createElement('audio')
        audio.autoplay = true
        audio.setAttribute('data-voice-peer', peerUid)
        audio.style.display = 'none'
        document.body.appendChild(audio)
        this.remoteAudio.set(peerUid, audio)
      }
      audio.srcObject = stream
      void audio.play().catch(() => undefined)
    }

    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'failed' || peer.connectionState === 'closed') {
        this.closePeer(peerUid)
      }
    }

    return peer
  }

  private async ensureOffer(peerUid: string): Promise<void> {
    if (this.peers.has(peerUid)) return
    const peer = this.createPeer(peerUid)
    const offer = await peer.createOffer({ offerToReceiveAudio: true })
    await peer.setLocalDescription(offer)
    await this.sendSignal(peerUid, 'offer', JSON.stringify(offer))
  }

  private async handleSignal(signal: VoiceSignal): Promise<void> {
    if (!signal?.from || !signal?.type || !signal?.data) return
    const peer = this.createPeer(signal.from)

    if (signal.type === 'offer') {
      const offer = JSON.parse(signal.data) as RTCSessionDescriptionInit
      await peer.setRemoteDescription(offer)
      await this.flushPendingCandidates(signal.from, peer)
      const answer = await peer.createAnswer()
      await peer.setLocalDescription(answer)
      await this.sendSignal(signal.from, 'answer', JSON.stringify(answer))
      return
    }

    if (signal.type === 'answer') {
      const answer = JSON.parse(signal.data) as RTCSessionDescriptionInit
      if (!peer.currentRemoteDescription) {
        await peer.setRemoteDescription(answer)
        await this.flushPendingCandidates(signal.from, peer)
      }
      return
    }

    const candidate = JSON.parse(signal.data) as RTCIceCandidateInit
    if (peer.remoteDescription) {
      await peer.addIceCandidate(candidate)
    } else {
      const pending = this.pendingCandidates.get(signal.from) ?? []
      pending.push(candidate)
      this.pendingCandidates.set(signal.from, pending)
    }
  }

  private async flushPendingCandidates(peerUid: string, peer: RTCPeerConnection): Promise<void> {
    const pending = this.pendingCandidates.get(peerUid) ?? []
    this.pendingCandidates.delete(peerUid)
    for (const candidate of pending) await peer.addIceCandidate(candidate)
  }

  private async sendSignal(toUid: string, type: SignalType, data: string): Promise<void> {
    if (!this.channelName || !this.localUid) return
    const signalsRef = collection(db, 'voiceRooms', this.channelName, 'participants', toUid, 'signals')
    await addDoc(signalsRef, {
      from: this.localUid,
      type,
      data,
      createdAt: serverTimestamp(),
    })
  }

  private closePeer(peerUid: string): void {
    const peer = this.peers.get(peerUid)
    if (peer) {
      peer.onicecandidate = null
      peer.ontrack = null
      peer.close()
      this.peers.delete(peerUid)
    }

    this.pendingCandidates.delete(peerUid)
    const audio = this.remoteAudio.get(peerUid)
    if (audio) {
      audio.srcObject = null
      audio.remove()
      this.remoteAudio.delete(peerUid)
    }
  }

  async leave(): Promise<void> {
    this.localAudioTrack?.close()
    this.localAudioTrack = null

    if (this.client) {
      await this.client.leave()
      this.client.removeAllListeners()
    }
    this.client = null

    this.participantsUnsubscribe?.()
    this.signalsUnsubscribe?.()
    this.participantsUnsubscribe = null
    this.signalsUnsubscribe = null

    for (const peerUid of [...this.peers.keys()]) this.closePeer(peerUid)

    this.localStream?.getTracks().forEach((track) => track.stop())
    this.localStream = null

    if (this.participantRef) {
      await deleteDoc(this.participantRef).catch(() => undefined)
    }
    this.participantRef = null

    this.channelName = null
    this.localUid = null
    this.token = null
    this.engine = null
  }

  getClient(): IAgoraRTCClient | null {
    return this.client
  }
}

export const audioService = new AudioService()
