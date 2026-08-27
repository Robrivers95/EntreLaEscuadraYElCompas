<template>
  <div class="home-view">
    <section class="hero-section">
      <div class="pillar left" aria-hidden="true"><span>B</span></div>
      <div class="pillar right" aria-hidden="true"><span>J</span></div>

      <div class="hero-content slide-in">
        <div class="star-line" aria-hidden="true">✦ · ✧ · ✦ · ✧ · ✦</div>
        <MasonicSeal :size="184" />
        <span class="masonic-kicker">Juego masónico de conocimiento</span>
        <h1>Entre La Escuadra<br />Y El Compás</h1>
        <p class="hero-subtitle">Una mesa simbólica para aprender, recordar y compartir.</p>

        <div class="hero-description temple-panel">
          <p>
            Recorre un tablero inspirado en la Logia y responde preguntas de historia,
            simbolismo, filosofía, herramientas, artes y ceremonial según tu rito y grado.
          </p>
        </div>

        <div class="symbol-row" aria-hidden="true">
          <span>☉</span><span>△</span><span>□</span><strong>G</strong><span>✦</span><span>☽</span><span>⚒</span>
        </div>

        <div class="hero-actions">
          <router-link to="/game-select" class="btn-primary">Entrar al Templo</router-link>
          <router-link to="/login" class="btn-secondary">Ingresar con Registro Logia</router-link>
        </div>
      </div>
    </section>

    <div class="mosaic-strip"></div>

    <section class="features-section">
      <div class="container">
        <div class="section-heading">
          <span class="masonic-kicker">La experiencia</span>
          <h2>Cuatro elementos de la partida</h2>
        </div>
        <div class="features-grid">
          <article class="feature-card temple-panel">
            <div class="feature-medallion">⚄</div>
            <h3>Tablero por Turnos</h3>
            <p>Avanza por casillas temáticas y responde preguntas filtradas por grado y rito.</p>
          </article>

          <article class="feature-card temple-panel">
            <div class="feature-medallion">◉</div>
            <h3>Salón en Tiempo Real</h3>
            <p>Comparte la mesa con otros Hermanos y conserva la comunicación de voz del proyecto.</p>
          </article>

          <article class="feature-card temple-panel">
            <div class="feature-medallion">G</div>
            <h3>Banco Masónico</h3>
            <p>Preguntas organizadas por rito, grado y materia, con banco REAA incluido.</p>
          </article>

          <article class="feature-card temple-panel">
            <div class="feature-medallion">✦</div>
            <h3>Puntuación</h3>
            <p>Responder antes de mostrar los incisos otorga doble puntaje y premia el conocimiento directo.</p>
          </article>
        </div>
      </div>
    </section>

    <footer class="footer-section">
      <div class="footer-symbols" aria-hidden="true">B · △ · G · □ · J</div>
      <p>Entre La Escuadra Y El Compás</p>
      <small>Desarrollado para la comunidad masónica.</small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import MasonicSeal from '@/shared/MasonicSeal.vue'
</script>

<style scoped>
.home-view { min-height: 100vh; overflow: hidden; }
.hero-section {
  min-height: 92vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 46px 20px 56px;
  text-align: center;
  position: relative;
  background:
    radial-gradient(circle at 50% 20%, rgba(213,183,97,.14), transparent 24rem),
    radial-gradient(circle at 18% 50%, rgba(19,53,84,.22), transparent 27rem),
    radial-gradient(circle at 82% 50%, rgba(91,31,39,.13), transparent 27rem);
}
.hero-section::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: min(760px, 90vw);
  height: 38%;
  transform: translateX(-50%);
  background: linear-gradient(45deg, rgba(235,227,207,.07) 25%, transparent 25%, transparent 75%, rgba(235,227,207,.07) 75%), linear-gradient(45deg, rgba(235,227,207,.07) 25%, transparent 25%, transparent 75%, rgba(235,227,207,.07) 75%);
  background-size: 52px 52px;
  background-position: 0 0, 26px 26px;
  clip-path: polygon(22% 0, 78% 0, 100% 100%, 0 100%);
  opacity: .65;
  pointer-events: none;
}
.hero-content { position: relative; z-index: 2; max-width: 760px; display: flex; flex-direction: column; align-items: center; }
.star-line { color: rgba(213,183,97,.42); letter-spacing: .75em; font-size: 11px; margin-bottom: -6px; }
.hero-section h1 { font-size: clamp(40px, 6vw, 68px); line-height: .95; color: #dfc673; margin: 10px 0 7px; text-transform: uppercase; letter-spacing: .09em; text-shadow: 0 7px 34px rgba(0,0,0,.65); }
.hero-subtitle { color: var(--masonic-muted); font-size: 17px; margin: 8px 0 18px; letter-spacing: .035em; }
.hero-description { max-width: 660px; padding: 20px 24px; border-radius: 3px; margin: 7px 0 14px; }
.hero-description p { margin: 0; color: rgba(241,231,207,.78); line-height: 1.7; }
.symbol-row { display: flex; gap: 17px; align-items: center; justify-content: center; color: rgba(213,183,97,.62); margin: 10px 0 2px; }
.symbol-row strong { color: #ead484; font-size: 22px; }
.hero-actions { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; margin-top: 22px; }
.btn-primary, .btn-secondary { min-width: 220px; padding: 13px 22px; border-radius: 3px; font-weight: 800; text-transform: uppercase; letter-spacing: .08em; font-size: 12px; }
.btn-primary { background: linear-gradient(135deg, #ead483, #896622); color: #080b10; border: 1px solid #f3df98; box-shadow: 0 10px 30px rgba(0,0,0,.32); }
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 14px 34px rgba(213,183,97,.15); }
.btn-secondary { background: rgba(8,13,21,.52); color: #dec775; border: 1px solid #806127; }
.btn-secondary:hover { background: rgba(213,183,97,.08); transform: translateY(-2px); }
.pillar { position: absolute; top: 6%; bottom: 0; width: 82px; opacity: .18; border-left: 1px solid #d5b761; border-right: 1px solid #d5b761; background: repeating-linear-gradient(90deg, transparent 0 13px, rgba(213,183,97,.12) 13px 16px); }
.pillar::before, .pillar::after { content: ''; position: absolute; left: -18px; width: 116px; height: 32px; border: 1px solid #d5b761; background: rgba(213,183,97,.07); }
.pillar::before { top: 0; } .pillar::after { bottom: 0; }
.pillar.left { left: 5vw; } .pillar.right { right: 5vw; }
.pillar span { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); font-size: 46px; font-weight: 700; color: #d5b761; }
.mosaic-strip { margin: 0; }
.features-section { padding: 70px 20px 78px; background: rgba(5,8,12,.34); }
.section-heading { text-align: center; margin-bottom: 30px; }
.section-heading h2 { color: #eee1be; font-size: 32px; margin-top: 3px; }
.features-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 18px; }
.feature-card { border-radius: 3px; padding: 27px 20px 24px; text-align: center; min-height: 260px; transition: .25s ease; }
.feature-card:hover { transform: translateY(-5px); border-color: rgba(213,183,97,.7); }
.feature-medallion { width: 72px; height: 72px; margin: 0 auto 15px; display: grid; place-items: center; border-radius: 50%; border: 1px solid #806127; box-shadow: inset 0 0 0 5px rgba(213,183,97,.04); color: #dbc16f; font-size: 35px; font-weight: 700; }
.feature-card h3 { font-size: 18px; color: #d9c171; margin-bottom: 10px; }
.feature-card p { color: rgba(241,231,207,.65); line-height: 1.55; font-size: 13px; }
.footer-section { border-top: 1px solid rgba(213,183,97,.25); padding: 34px 20px; text-align: center; background: rgba(4,6,9,.7); }
.footer-symbols { color: rgba(213,183,97,.46); letter-spacing: .4em; margin-bottom: 8px; }
.footer-section p { color: #cdb66d; margin: 0; text-transform: uppercase; letter-spacing: .12em; font-size: 12px; }
.footer-section small { color: rgba(241,231,207,.4); }
@media (max-width: 980px) { .features-grid { grid-template-columns: repeat(2,minmax(0,1fr)); } .pillar { opacity: .1; } }
@media (max-width: 640px) { .hero-section { min-height: 88vh; padding-inline: 14px; } .pillar { display: none; } .hero-section h1 { font-size: 38px; } .hero-actions { width: 100%; } .btn-primary, .btn-secondary { width: 100%; } .features-grid { grid-template-columns: 1fr; } .star-line { letter-spacing: .45em; } }
</style>
