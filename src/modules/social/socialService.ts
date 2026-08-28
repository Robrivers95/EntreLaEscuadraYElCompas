import { db } from '@/core/firebase'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore'

export interface GameSocialProfile {
  uid: string
  displayName: string
  bio: string
  city: string
  contact: string
  avatarUrl: string
  updatedAt: number
}

export interface RoomChatMessage {
  id: string
  senderUid: string
  senderName: string
  text: string
  createdAt: number
}

export interface DirectConversation {
  id: string
  memberIds: string[]
  memberNames: Record<string, string>
  lastMessage: string
  updatedAt: number
}

export interface DirectMessage {
  id: string
  senderUid: string
  senderName: string
  text: string
  createdAt: number
}

const socialProfiles = collection(db, 'gameSocialProfiles')
const cleanText = (value: string, max: number) => value.trim().slice(0, max)
const conversationIdFor = (a: string, b: string) => [a, b].sort().join('__')

export const socialService = {
  async ensureProfile(uid: string, displayName: string): Promise<GameSocialProfile> {
    const ref = doc(db, 'gameSocialProfiles', uid)
    const snapshot = await getDoc(ref)
    if (snapshot.exists()) return { uid, ...snapshot.data() } as GameSocialProfile
    const profile: GameSocialProfile = {
      uid,
      displayName: cleanText(displayName || 'Jugador', 60),
      bio: '',
      city: '',
      contact: '',
      avatarUrl: '',
      updatedAt: Date.now(),
    }
    await setDoc(ref, profile)
    return profile
  },

  async saveProfile(profile: GameSocialProfile): Promise<void> {
    const safe: GameSocialProfile = {
      ...profile,
      displayName: cleanText(profile.displayName, 60),
      bio: cleanText(profile.bio, 280),
      city: cleanText(profile.city, 80),
      contact: cleanText(profile.contact, 180),
      avatarUrl: cleanText(profile.avatarUrl, 500),
      updatedAt: Date.now(),
    }
    await setDoc(doc(db, 'gameSocialProfiles', profile.uid), safe, { merge: true })
  },

  subscribeProfiles(callback: (profiles: GameSocialProfile[]) => void) {
    return onSnapshot(query(socialProfiles, limit(100)), (snapshot) => {
      const profiles = snapshot.docs
        .map((item) => ({ uid: item.id, ...item.data() } as GameSocialProfile))
        .sort((a, b) => a.displayName.localeCompare(b.displayName, 'es'))
      callback(profiles)
    })
  },

  subscribeRoomChat(roomId: string, callback: (messages: RoomChatMessage[]) => void) {
    const messagesQuery = query(
      collection(db, 'gameRooms', roomId, 'chat'),
      orderBy('createdAt', 'asc'),
      limit(120),
    )
    return onSnapshot(messagesQuery, (snapshot) => {
      callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as RoomChatMessage)))
    })
  },

  async sendRoomMessage(roomId: string, senderUid: string, senderName: string, text: string): Promise<void> {
    const safeText = cleanText(text, 500)
    if (!safeText) return
    await addDoc(collection(db, 'gameRooms', roomId, 'chat'), {
      senderUid,
      senderName: cleanText(senderName, 60),
      text: safeText,
      createdAt: Date.now(),
    })
  },

  subscribeConversations(uid: string, callback: (items: DirectConversation[]) => void) {
    const conversationsQuery = query(
      collection(db, 'directConversations'),
      where('memberIds', 'array-contains', uid),
      limit(100),
    )
    return onSnapshot(conversationsQuery, (snapshot) => {
      const items = snapshot.docs
        .map((item) => ({ id: item.id, ...item.data() } as DirectConversation))
        .sort((a, b) => b.updatedAt - a.updatedAt)
      callback(items)
    })
  },

  subscribeDirectMessages(conversationId: string, callback: (messages: DirectMessage[]) => void) {
    const messagesQuery = query(
      collection(db, 'directConversations', conversationId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(150),
    )
    return onSnapshot(messagesQuery, (snapshot) => {
      callback(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as DirectMessage)))
    })
  },

  async openConversation(
    current: { uid: string; name: string },
    other: { uid: string; name: string },
  ): Promise<string> {
    const id = conversationIdFor(current.uid, other.uid)
    const ref = doc(db, 'directConversations', id)
    const existing = await getDoc(ref)
    if (!existing.exists()) {
      await setDoc(ref, {
        memberIds: [current.uid, other.uid].sort(),
        memberNames: { [current.uid]: cleanText(current.name, 60), [other.uid]: cleanText(other.name, 60) },
        lastMessage: '',
        updatedAt: Date.now(),
      })
    }
    return id
  },

  async sendDirectMessage(
    conversationId: string,
    sender: { uid: string; name: string },
    text: string,
  ): Promise<void> {
    const safeText = cleanText(text, 1000)
    if (!safeText) return
    const now = Date.now()
    await addDoc(collection(db, 'directConversations', conversationId, 'messages'), {
      senderUid: sender.uid,
      senderName: cleanText(sender.name, 60),
      text: safeText,
      createdAt: now,
    })
    await setDoc(doc(db, 'directConversations', conversationId), {
      lastMessage: safeText,
      updatedAt: now,
    }, { merge: true })
  },
}
