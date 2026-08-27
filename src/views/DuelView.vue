<template>
  <main class="duel-view">
    <header class="page-head">
      <button class="back" @click="router.push('/lobby')">← Lobby</button>
      <div><span class="kicker">Modalidad II</span><h1>Reto de 10</h1><p>Dos jugadores, las mismas diez preguntas. Cada uno responde cuando pueda.</p></div>
      <div class="record"><small>Récord</small><strong>{{ wins }} G · {{ losses }} P · {{ ties }} E</strong></div>
    </header>

    <section v-if="sessionQuestions.length" class="quiz-shell">
      <div class="quiz-top"><span>{{ sessionRole === 'challenger' ? 'Creando reto' : `Reto de ${activeDuel?.challengerName}` }}</span><strong>{{ currentIndex + 1 }}/{{ sessionQuestions.length }}</strong></div>
      <div class="progress"><span :style="{ width: `${((currentIndex + 1) / sessionQuestions.length) * 100}%` }"></span></div>
      <article v-if="currentQuestion" class="question-card">
        <div class="badges"><span>{{ shortRite(sessionRite) }}</span><span>{{ currentQuestion.category }}</span></div>
        <h2>{{ currentQuestion.text }}</h2>
        <button v-for="(option, index) in currentQuestion.options" :key="option" class="option" @click="answer(index)"><b>{{ String.fromCharCode(65 + index) }}</b>{{ option }}</button>
      </article>
      <div class="live-score">Aciertos hasta ahora: <strong>{{ liveScore }}</strong></div>
    </section>

    <template v-else>
      <section class="create-panel">
        <div><span class="kicker">Nuevo desafío</span><h2>Elige a quién retar</h2></div>
        <label>Jugador<select v-model="setup.opponentUid"><option value="">Selecciona un usuario</option><option v-for="player in players" :key="player.uid" :value="player.uid">{{ player.name }}{{ player.degree ? ` · ${player.degree}` : '' }}</option></select></label>
        <label>Banco<select v-model="setup.rite" @change="syncLevel"><option v-for="rite in playableRites" :key="rite.value" :value="rite.value">{{ rite.label }}</option></select></label>
        <label v-if="setup.rite !== 'libre'">Nivel<select v-model="setup.level"><option value="aprendiz">Aprendiz</option><option value="compañero">Compañero</option><option value="maestro">Maestro</option></select></label>
        <div class="access-note" :class="{ blocked: setupNeedsExam }">
          <span v-if="setup.rite === 'libre'">⚠ Cultura general · modo no masón.</span>
          <span v-else-if="setupNeedsExam">🔐 Debes aprobar el examen de {{ shortRite(setup.rite) }} / {{ levelLabel(setup.level) }} antes de crear este reto.</span>
          <span v-else>✓ Tu perfil puede usar este banco.</span>
        </div>
        <button class="primary" :disabled="!setup.opponentUid" @click="startChallenge">{{ setupNeedsExam ? 'Hacer reteje' : 'Responder mis 10 preguntas' }}</button>
      </section>

      <section class="duel-columns">
        <div class="duel-list">
          <div class="list-head"><span class="kicker">Pendientes</span><h2>Retos que te enviaron</h2></div>
          <div v-if="incoming.length === 0" class="empty">No tienes retos pendientes.</div>
          <article v-for="duel in incoming" :key="duel.id" class="duel-row">
            <div><strong>{{ duel.challengerName }}</strong><small>{{ shortRite(duel.rite) }} · {{ levelLabel(duel.level) }} · hizo {{ duel.challengerScore }}/10</small></div>
            <button class="primary small" @click="openDuel(duel.id)">Responder</button>
          </article>
        </div>

        <div class="duel-list">
          <div class="list-head"><span class="kicker">Historial</span><h2>Partidas terminadas</h2></div>
          <div v-if="finished.length === 0" class="empty">Todavía no tienes resultados.</div>
          <article v-for="duel in finished" :key="duel.id" class="duel-row history">
            <div><strong>{{ opponentName(duel) }}</strong><small>{{ duel.challengerName }} {{ duel.challengerScore }} – {{ duel.opponentScore }} {{ duel.opponentName }}</small></div>
            <span class="result-chip" :class="resultClass(duel)">{{ resultLabel(duel) }}</span>
          </article>
        </div>
      </section>
    </template>

    <div v-if="message" class="toast">{{ message }}</div>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useAccessStore } from '@/stores/accessStore'
import { useQuestionsStore } from '@/stores/questionsStore'
import { duelService } from '@/modules/game/duels/duelService'
import type { Duel, DuelPlayerOption } from '@/modules/game/duels/duelService'
import { requiresAccessExam } from '@/modules/game/access/riteAccess'
import type { RoomLevel } from '@/modules/game/access/riteAccess'
import { DEGREE_LABELS, MASONIC_RITES, RITE_SHORT_LABELS } from '@/modules/questions/questionRules'
import type { MasonicRite, Question } from '@/modules/questions/types'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const accessStore = useAccessStore()
const questionsStore = useQuestionsStore()
const players = ref<DuelPlayerOption[]>([])
const duels = ref<Duel[]>([])
const message = ref('')
const sessionQuestions = ref<Question[]>([])
const currentIndex = ref(0)
const liveScore = ref(0)
const sessionRole = ref<'challenger' | 'opponent'>('challenger')
const activeDuel = ref<Duel | null>(null)
const sessionRite = ref<MasonicRite>('reaa')
let unsubscribe: (() => void) | null = null

const playableRites = MASONIC_RITES.filter((rite) => rite.value !== 'otro')
const setup = reactive<{ opponentUid: string; rite: MasonicRite; level: RoomLevel }>({ opponentUid: '', rite: 'reaa', level: authStore.masonicDegree ?? 'aprendiz' })
const preferredRite = computed(() => accessStore.preferredRite ?? 'reaa')
const currentQuestion = computed(() => sessionQuestions.value[currentIndex.value] ?? null)
const incoming = computed(() => duels.value.filter((duel) => duel.status === 'pending' && duel.opponentUid === authStore.currentUser?.uid))
const finished = computed(() => duels.value.filter((duel) => duel.status === 'finished'))
const wins = computed(() => finished.value.filter((duel) => duel.winnerUid === authStore.currentUser?.uid).length)
const losses = computed(() => finished.value.filter((duel) => duel.winnerUid && duel.winnerUid !== 'tie' && duel.winnerUid !== authStore.currentUser?.uid).length)
const ties = computed(() => finished.value.filter((duel) => duel.winnerUid === 'tie').length)
const setupNeedsExam = computed(() => requiresAccessExam(preferredRite.value, authStore.masonicDegree, setup.rite, setup.level, accessStore.certificationFor(setup.rite)))

onMounted(async () => {
  if (!authStore.currentUser) return
  await Promise.all([questionsStore.loadQuestions({ fallbackToDefaults: true }), accessStore.loadForUser(authStore.currentUser.uid)])
  players.value = await duelService.listPlayers(authStore.currentUser.uid)
  unsubscribe = duelService.subscribeForUser(authStore.currentUser.uid, (items) => { duels.value = items })
  const duelId = route.query.duel as string | undefined
  if (duelId) await openDuel(duelId)
})
onBeforeUnmount(() => unsubscribe?.())

const shortRite = (rite: MasonicRite) => RITE_SHORT_LABELS[rite]
const levelLabel = (level: RoomLevel) => level === 'general' ? 'General' : DEGREE_LABELS[level]
const syncLevel = () => { setup.level = setup.rite === 'libre' ? 'general' : (authStore.masonicDegree ?? 'aprendiz') }

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5)

const startChallenge = async () => {
  if (setupNeedsExam.value) {
    router.push({ path: '/reteje', query: { rite: setup.rite, level: setup.level, returnTo: '/duels' } })
    return
  }
  const pool = questionsStore.getQuestionsForRoom(setup.rite, setup.level)
  if (pool.length < 10) { message.value = 'Este banco todavía no tiene 10 preguntas compatibles.'; return }
  sessionQuestions.value = shuffle(pool).slice(0, 10)
  sessionRite.value = setup.rite
  currentIndex.value = 0
  liveScore.value = 0
  sessionRole.value = 'challenger'
}

const openDuel = async (id: string) => {
  const duel = await duelService.getDuel(id)
  if (!duel || duel.opponentUid !== authStore.currentUser?.uid || duel.status !== 'pending') return
  await questionsStore.loadQuestions({ fallbackToDefaults: true })
  const questions = duel.questionIds.map((id) => questionsStore.questions.find((question) => question.id === id)).filter((item): item is Question => Boolean(item))
  if (questions.length !== duel.questionIds.length) { message.value = 'No se pudieron recuperar todas las preguntas de este reto.'; return }
  activeDuel.value = duel
  sessionQuestions.value = questions
  sessionRite.value = duel.rite
  currentIndex.value = 0
  liveScore.value = 0
  sessionRole.value = 'opponent'
}

const answer = async (optionIndex: number) => {
  const question = currentQuestion.value
  if (!question) return
  if (optionIndex === question.correctAnswer) liveScore.value += 1
  if (currentIndex.value < sessionQuestions.value.length - 1) { currentIndex.value += 1; return }

  const finalScore = liveScore.value
  if (optionIndex === question.correctAnswer) {
    // liveScore is updated synchronously, but use explicit score to avoid depending on Vue flush timing.
  }
  const score = finalScore
  if (sessionRole.value === 'challenger') {
    if (!authStore.currentUser || !authStore.profile) return
    const opponent = players.value.find((player) => player.uid === setup.opponentUid)
    if (!opponent) return
    await duelService.createDuel({ challengerUid: authStore.currentUser.uid, challengerName: authStore.profile.name, opponentUid: opponent.uid, opponentName: opponent.name, rite: setup.rite, level: setup.level, questionIds: sessionQuestions.value.map((item) => item.id), challengerScore: score })
    message.value = `Reto enviado a ${opponent.name}. Tu resultado: ${score}/10.`
  } else if (activeDuel.value) {
    await duelService.finishDuel(activeDuel.value, score)
    message.value = score > activeDuel.value.challengerScore ? `Ganaste ${score} a ${activeDuel.value.challengerScore}.` : score < activeDuel.value.challengerScore ? `Resultado: ${score} a ${activeDuel.value.challengerScore}.` : `Empate ${score} a ${score}.`
  }
  sessionQuestions.value = []
  currentIndex.value = 0
  liveScore.value = 0
  activeDuel.value = null
  router.replace('/duels')
}

const opponentName = (duel: Duel) => duel.challengerUid === authStore.currentUser?.uid ? duel.opponentName : duel.challengerName
const resultLabel = (duel: Duel) => duel.winnerUid === 'tie' ? 'Empate' : duel.winnerUid === authStore.currentUser?.uid ? 'Ganaste' : 'Perdiste'
const resultClass = (duel: Duel) => duel.winnerUid === 'tie' ? 'tie' : duel.winnerUid === authStore.currentUser?.uid ? 'win' : 'loss'
</script>

<style scoped>
.duel-view{min-height:100vh;padding:26px 18px 60px;background:radial-gradient(circle at 50% -10%,rgba(43,74,116,.35),transparent 38%),#050a11;color:#eee0c2}.page-head,.create-panel,.duel-columns,.quiz-shell{max-width:1080px;margin-left:auto;margin-right:auto}.page-head{display:grid;grid-template-columns:auto 1fr auto;gap:18px;align-items:center;padding-bottom:20px;border-bottom:1px solid rgba(214,183,95,.24)}.back{background:transparent;border:1px solid rgba(214,183,95,.3);color:#d9c17a;padding:9px;border-radius:7px}.kicker,small{font-size:10px;text-transform:uppercase;letter-spacing:1.5px;color:#c8a64d}.page-head h1,.create-panel h2,.list-head h2{margin:2px 0;color:#f0d992;font-family:Georgia,serif}.page-head p{margin:0;color:rgba(238,224,194,.58)}.record{display:flex;flex-direction:column;text-align:right}.record strong{color:#e9d7a6}.create-panel{display:grid;grid-template-columns:1fr 1.1fr .9fr .8fr;gap:11px;align-items:end;margin-top:20px;padding:17px;border:1px solid rgba(214,183,95,.25);border-radius:12px;background:rgba(13,27,45,.7)}label{font-size:10px;text-transform:uppercase;color:#c9b475}select{display:block;width:100%;margin-top:5px;padding:10px}.access-note{grid-column:1/-2;font-size:11px;color:#8fd1a2}.access-note.blocked{color:#e2c274}.primary{border:0;border-radius:8px;padding:11px 14px;font-weight:900;background:linear-gradient(135deg,#e0c269,#8b6914);color:#07101a}.duel-columns{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:17px}.duel-list{padding:15px;border:1px solid rgba(214,183,95,.22);border-radius:11px;background:rgba(7,18,30,.76)}.list-head{margin-bottom:10px}.duel-row{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:11px 4px;border-top:1px solid rgba(214,183,95,.12)}.duel-row div{display:flex;flex-direction:column}.duel-row strong{color:#eee0c2}.duel-row small{color:rgba(238,224,194,.46);text-transform:none;letter-spacing:0}.small{padding:7px 10px}.empty{padding:22px;text-align:center;color:rgba(238,224,194,.42)}.result-chip{padding:5px 8px;border-radius:999px;font-size:10px;font-weight:900}.result-chip.win{background:rgba(71,160,97,.15);color:#91d3a1}.result-chip.loss{background:rgba(190,70,64,.15);color:#e99b97}.result-chip.tie{background:rgba(214,183,95,.12);color:#ddc982}.quiz-shell{margin-top:24px}.quiz-top{display:flex;justify-content:space-between}.progress{height:5px;margin:10px 0 16px;background:rgba(255,255,255,.07);border-radius:99px}.progress span{display:block;height:100%;background:#c9a84c}.question-card{padding:22px;border:1px solid rgba(214,183,95,.32);border-radius:14px;background:rgba(8,22,36,.86)}.badges{display:flex;gap:7px}.badges span{font-size:10px;padding:5px 8px;border-radius:99px;background:rgba(214,183,95,.1);color:#ddc57a}.question-card h2{color:#f1e2c1;line-height:1.4}.option{width:100%;display:grid;grid-template-columns:32px 1fr;gap:8px;text-align:left;margin:7px 0;padding:11px;border:1px solid rgba(214,183,95,.22);border-radius:8px;background:rgba(255,255,255,.025);color:#eee0c2}.option:hover{border-color:#c9a84c;background:rgba(214,183,95,.08)}.option b{color:#e1c66f}.live-score{text-align:right;margin-top:9px;color:rgba(238,224,194,.55)}.live-score strong{color:#e6cd80}.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);max-width:90vw;padding:12px 18px;border:1px solid #b38b31;border-radius:9px;background:#0c1a29;color:#edd9aa;box-shadow:0 12px 30px rgba(0,0,0,.45)}@media(max-width:800px){.create-panel{grid-template-columns:1fr 1fr}.access-note{grid-column:1/-1}.duel-columns{grid-template-columns:1fr}.page-head{grid-template-columns:1fr}.record{text-align:left}}@media(max-width:520px){.create-panel{grid-template-columns:1fr}}
</style>
