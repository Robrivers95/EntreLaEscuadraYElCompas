import { db } from '@/core/firebase'
import { collection, addDoc, doc, getDoc, onSnapshot, query, orderBy, limit, runTransaction } from 'firebase/firestore'
import { normalizeMiLogiaDegree, getAllowedDifficulties } from '@/modules/questions/questionRules'
import type { MasonicDegree, MasonicRite } from '@/modules/questions/types'
import type { RoomLevel } from '@/modules/game/access/riteAccess'

export interface DebateMember { uid: string; name: string; degree: MasonicDegree; joinedAt: number }
export interface DebateRoom {
  id: string; topic: string; rite: MasonicRite; level: RoomLevel; hostUid: string; hostName: string
  turnSeconds: number; status: 'waiting' | 'active' | 'finished'
  participants: DebateMember[]; spectators: DebateMember[]
  speakerIndex: number; speakerStartedAt: number | null; createdAt: number
}
export interface DebateMessage { id: string; uid: string; name: string; text: string; createdAt: number }
const rooms = collection(db, 'debateRooms')
const fromDoc = (id:string, data:Record<string,unknown>) => ({ id, ...data }) as DebateRoom
const minSeconds = (seconds:number) => [60,120,180,300].includes(seconds) ? seconds : 120

async function validateMember(uid:string, level:RoomLevel):Promise<MasonicDegree> {
  const snapshot = await getDoc(doc(db,'users',uid))
  const data = snapshot.exists() ? snapshot.data() : null
  const degree = normalizeMiLogiaDegree(typeof data?.degree === 'string' ? data.degree : null)
  if (!data || data.active === false || !degree || (level !== 'general' && !getAllowedDifficulties(degree).includes(level))) {
    throw new Error('Tu perfil o grado de Mi Logia no autoriza entrar a esta Cámara.')
  }
  return degree
}
export const debateService = {
  subscribeRooms(callback:(items:DebateRoom[])=>void) {
    return onSnapshot(query(rooms,orderBy('createdAt','desc'),limit(40)), snapshot => {
      callback(snapshot.docs.map(item=>fromDoc(item.id,item.data())).filter(item=>item.status !== 'finished'))
    })
  },
  subscribeRoom(id:string, callback:(room:DebateRoom|null)=>void) {
    return onSnapshot(doc(db,'debateRooms',id),snapshot=>callback(snapshot.exists()?fromDoc(snapshot.id,snapshot.data()):null))
  },
  async create(input:{uid:string;name:string;topic:string;rite:MasonicRite;level:RoomLevel;turnSeconds:number}):Promise<string> {
    const topic=input.topic.trim().slice(0,180)
    if(topic.length<5)throw new Error('Escribe un tema de debate de al menos cinco caracteres.')
    const degree=await validateMember(input.uid,input.level)
    const member:DebateMember={uid:input.uid,name:input.name,degree,joinedAt:Date.now()}
    const result=await addDoc(rooms,{topic,rite:input.rite,level:input.level,hostUid:input.uid,hostName:input.name,turnSeconds:minSeconds(input.turnSeconds),status:'waiting',participants:[member],spectators:[],speakerIndex:0,speakerStartedAt:null,createdAt:Date.now()})
    return result.id
  },
  async join(id:string,uid:string,name:string,role:'participant'|'spectator'):Promise<void> {
    // Verification here improves UX. Server-side Firebase rules must independently validate membership.
    const ref=doc(db,'debateRooms',id)
    const snapshot=await getDoc(ref)
    if(!snapshot.exists())throw new Error('La sala ya no existe.')
    const degree=await validateMember(uid,(snapshot.data() as DebateRoom).level)
    await runTransaction(db,async tx=>{
      const current=await tx.get(ref)
      if(!current.exists())throw new Error('La sala ya no existe.')
      const room=fromDoc(current.id,current.data())
      if(room.status==='finished')throw new Error('El debate terminó.')
      if(room.participants.some(p=>p.uid===uid)||room.spectators.some(p=>p.uid===uid))return
      if(room.participants.length+room.spectators.length>=20)throw new Error('La sala alcanzó el máximo de 20 personas.')
      const member:DebateMember={uid,name,degree,joinedAt:Date.now()}
      if(role==='participant'&&room.status==='waiting')tx.update(ref,{participants:[...room.participants,member]})
      else tx.update(ref,{spectators:[...room.spectators,member]})
    })
  },
  async start(id:string,hostUid:string) {
    const ref=doc(db,'debateRooms',id)
    await runTransaction(db,async tx=>{
      const snap=await tx.get(ref);if(!snap.exists())throw new Error('La sala no existe.')
      const room=fromDoc(snap.id,snap.data())
      if(room.hostUid!==hostUid||room.status!=='waiting')throw new Error('Solo el anfitrión puede iniciar.')
      tx.update(ref,{status:'active',speakerIndex:0,speakerStartedAt:Date.now()})
    })
  },
  async nextSpeaker(id:string,uid:string) {
    const ref=doc(db,'debateRooms',id)
    await runTransaction(db,async tx=>{
      const snap=await tx.get(ref);if(!snap.exists())throw new Error('La sala no existe.')
      const room=fromDoc(snap.id,snap.data())
      if(room.status!=='active'||!room.participants.length)throw new Error('El debate no está activo.')
      const speaker=room.participants[room.speakerIndex%room.participants.length]
      const elapsed=room.speakerStartedAt===null?0:Date.now()-room.speakerStartedAt
      if(uid!==room.hostUid&&uid!==speaker.uid&&elapsed<room.turnSeconds*1000)throw new Error('Solo quien tiene la palabra puede cederla.')
      tx.update(ref,{speakerIndex:(room.speakerIndex+1)%room.participants.length,speakerStartedAt:Date.now()})
    })
  },
  /** Idempotent timer rollover. Any registered participant may request it once the turn expires. */
  async advanceExpiredTurn(id:string,uid:string,expectedStartedAt:number):Promise<boolean> {
    const ref=doc(db,'debateRooms',id)
    let advanced=false
    await runTransaction(db,async tx=>{
      const snap=await tx.get(ref)
      if(!snap.exists())return
      const room=fromDoc(snap.id,snap.data())
      if(room.status!=='active'||!room.participants.length||room.speakerStartedAt!==expectedStartedAt)return
      if(!room.participants.some(p=>p.uid===uid))return
      const now=Date.now()
      if(now-expectedStartedAt<room.turnSeconds*1000)return
      tx.update(ref,{speakerIndex:(room.speakerIndex+1)%room.participants.length,speakerStartedAt:now})
      advanced=true
    })
    return advanced
  },
  async finish(id:string,uid:string) {
    const ref=doc(db,'debateRooms',id)
    await runTransaction(db,async tx=>{
      const snap=await tx.get(ref);if(!snap.exists())return
      const room=fromDoc(snap.id,snap.data())
      if(room.hostUid!==uid)throw new Error('Solo el anfitrión puede cerrar el debate.')
      tx.update(ref,{status:'finished',speakerStartedAt:null})
    })
  },
  subscribeChat(id:string,callback:(messages:DebateMessage[])=>void) {
    return onSnapshot(query(collection(db,'debateRooms',id,'chat'),orderBy('createdAt','asc'),limit(100)),snapshot=>{
      callback(snapshot.docs.map(item=>({id:item.id,...item.data()}) as DebateMessage))
    })
  },
  async sendMessage(id:string,uid:string,name:string,text:string) {
    const room=await getDoc(doc(db,'debateRooms',id))
    if(!room.exists())throw new Error('La sala no existe.')
    const data=fromDoc(room.id,room.data())
    await validateMember(uid,data.level)
    if(![...data.participants,...data.spectators].some(p=>p.uid===uid))throw new Error('Debes ingresar a la sala antes de escribir.')
    const value=text.trim().slice(0,500);if(!value)return
    await addDoc(collection(db,'debateRooms',id,'chat'),{uid,name,text:value,createdAt:Date.now()})
  },
}
