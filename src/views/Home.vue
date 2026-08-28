<template>
  <div class="home-view">
    <section class="hero-section">
      <div class="pillar left" aria-hidden="true"><span>B</span></div>
      <div class="pillar right" aria-hidden="true"><span>J</span></div>

      <div class="hero-content slide-in">
        <div class="star-line" aria-hidden="true">✦ · ✧ · ✦ · ✧ · ✦</div>
        <MasonicSeal :size="160" />
        <span class="overline">Juego de conocimiento · fraternidad · estudio</span>
        <h1>Entre la Escuadra<br />y el Compás</h1>
        <p class="hero-copy">Un solo salón para todos. Entra, descubre las mesas abiertas y elige cómo quieres jugar.</p>
        <div class="hero-actions">
          <router-link to="/lobby" class="primary">Entrar al salón</router-link>
          <router-link to="/login" class="secondary">Iniciar sesión</router-link>
        </div>
        <div class="mosaic-strip" aria-hidden="true"></div>
      </div>
    </section>

    <section class="modes-section">
      <div class="section-title"><span>Las tres modalidades</span><h2>Una misma cuenta, tres formas de jugar</h2><p>El rito se elige dentro de cada mesa o sesión; nunca te separa del lobby general.</p></div>
      <div class="mode-grid">
        <article class="mode-card main-mode"><span class="number">I</span><div class="icon">🎲</div><h3>Maratón de tablero</h3><p>Crea o entra a una sala. El dado mueve tu ficha y cada casilla determina la categoría de la pregunta.</p><ul><li>Salas visibles para todos</li><li>Tableros según el rito</li><li>Reteje de acceso cuando corresponde</li><li>Voz integrada dentro de la mesa</li></ul></article>
        <article class="mode-card"><span class="number">II</span><div class="icon">⚔</div><h3>Reto de 10</h3><p>Responde diez preguntas y envía exactamente el mismo reto a otro jugador, incluso si responde después.</p><ul><li>Rival aleatorio o elegido</li><li>10 preguntas idénticas</li><li>Ganadas, perdidas y empates</li><li>Historial contra cada rival</li></ul></article>
        <article class="mode-card"><span class="number">III</span><div class="icon">📖</div><h3>Estudio individual</h3><p>Practica sin competir, revisa tu calificación y utiliza el banco incluido como herramienta de estudio.</p><ul><li>10, 25 o todas las preguntas</li><li>Calificación inmediata</li><li>Historial local</li><li>Preparado para app instalada/offline</li></ul></article>
      </div>
    </section>

    <section class="open-mode">
      <div class="free-emblem">🌐</div><div><span>También para invitados al conocimiento</span><h2>Modo Libre · no masónico</h2><p>Un Maratón de cultura general para quien no tenga acceso a un banco ritual o simplemente quiera jugar sin contenido masónico. Está identificado claramente como <strong>NO MASÓN</strong>.</p></div>
    </section>

    <footer><span>△</span><span>□</span><b>G</b><span>○</span><p>Entre la Escuadra y el Compás</p></footer>
  </div>
</template>

<script setup lang="ts">
import MasonicSeal from '@/shared/MasonicSeal.vue'
</script>

<style scoped>
.home-view{min-height:100vh;background:linear-gradient(180deg,#06111e 0%,#03070d 72%,#050b12 100%);color:#efe1c4}.hero-section{min-height:92vh;display:grid;place-items:center;position:relative;overflow:hidden;padding:48px 22px;background:radial-gradient(circle at 50% 16%,rgba(35,82,134,.42),transparent 37%),radial-gradient(circle at 50% 55%,rgba(201,168,76,.08),transparent 45%)}.hero-content{width:min(760px,100%);display:flex;flex-direction:column;align-items:center;text-align:center;position:relative;z-index:2}.star-line{color:rgba(229,201,116,.45);letter-spacing:12px;margin-bottom:10px}.overline,.section-title span,.open-mode span{margin-top:16px;color:#c6a34d;font-size:10px;font-weight:900;letter-spacing:2.3px;text-transform:uppercase}.hero-content h1{margin:8px 0 14px;color:#f0d88d;font:700 clamp(42px,8vw,78px)/.95 Georgia,serif;text-transform:uppercase;letter-spacing:2px;text-shadow:0 12px 35px rgba(0,0,0,.55)}.hero-copy{max-width:570px;margin:0;color:rgba(239,225,196,.66);font-size:16px}.hero-actions{display:flex;gap:10px;margin:25px 0 32px}.primary,.secondary{padding:13px 20px;border-radius:8px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:.7px;font-size:12px}.primary{background:linear-gradient(135deg,#e1c36c,#8b6914);color:#07101a}.secondary{border:1px solid rgba(214,183,95,.55);color:#e5cd82;background:rgba(214,183,95,.04)}.mosaic-strip{width:min(620px,90vw);height:25px;border-top:2px solid #9e7a28;border-bottom:2px solid #9e7a28;background:conic-gradient(#eee 25%,#111 0 50%,#eee 0 75%,#111 0) 0 0/24px 24px;transform:perspective(220px) rotateX(35deg);opacity:.65}.pillar{position:absolute;top:8%;bottom:0;width:92px;border-left:1px solid rgba(214,183,95,.18);border-right:1px solid rgba(214,183,95,.18);background:linear-gradient(90deg,transparent,rgba(214,183,95,.055),transparent);display:flex;align-items:center;justify-content:center;opacity:.55}.pillar::before{content:'';position:absolute;top:0;width:122px;height:18px;border:1px solid rgba(214,183,95,.23);border-radius:4px}.pillar span{font:700 58px Georgia;color:rgba(214,183,95,.18)}.pillar.left{left:4vw}.pillar.right{right:4vw}.modes-section{max-width:1160px;margin:auto;padding:78px 20px}.section-title{text-align:center;max-width:700px;margin:0 auto 34px}.section-title h2{margin:7px 0;color:#efd892;font:700 35px Georgia,serif}.section-title p{color:rgba(239,225,196,.55)}.mode-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.mode-card{position:relative;overflow:hidden;padding:24px 22px;border:1px solid rgba(214,183,95,.24);border-radius:14px;background:linear-gradient(145deg,rgba(15,37,60,.8),rgba(3,10,18,.94));box-shadow:0 18px 40px rgba(0,0,0,.2)}.mode-card.main-mode{border-color:rgba(214,183,95,.48)}.number{position:absolute;right:13px;top:7px;font:700 48px Georgia;color:rgba(214,183,95,.1)}.icon{font-size:37px}.mode-card h3{margin:10px 0 6px;color:#e8cd78;font:700 22px Georgia,serif}.mode-card p{min-height:74px;color:rgba(239,225,196,.58);font-size:13px;line-height:1.55}.mode-card ul{list-style:none;padding:13px 0 0;margin:0;border-top:1px solid rgba(214,183,95,.13);display:grid;gap:6px}.mode-card li{font-size:11px;color:rgba(239,225,196,.65)}.mode-card li::before{content:'✦';color:#b89136;margin-right:7px}.open-mode{max-width:1020px;margin:0 auto 75px;padding:25px;display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:center;border:1px solid rgba(75,151,179,.4);border-radius:14px;background:linear-gradient(135deg,rgba(23,77,99,.2),rgba(4,15,25,.8))}.free-emblem{width:74px;height:74px;border:1px solid rgba(90,169,196,.5);border-radius:50%;display:grid;place-items:center;font-size:34px}.open-mode span{margin:0;color:#71b6ca}.open-mode h2{margin:4px 0;color:#a8d9e5;font:700 27px Georgia,serif}.open-mode p{margin:0;color:rgba(222,239,241,.62);font-size:13px}.open-mode strong{color:#a8d9e5}footer{padding:35px;text-align:center;border-top:1px solid rgba(214,183,95,.16);color:rgba(214,183,95,.55);letter-spacing:9px}footer b{color:#ddc36e}footer p{letter-spacing:2px;color:rgba(239,225,196,.35);font-size:10px;text-transform:uppercase}@media(max-width:900px){.pillar{display:none}.mode-grid{grid-template-columns:1fr}.mode-card p{min-height:0}.hero-section{min-height:82vh}}@media(max-width:560px){.hero-actions{flex-direction:column;width:100%}.primary,.secondary{text-align:center}.open-mode{grid-template-columns:1fr;text-align:center}.free-emblem{margin:auto}.modes-section{padding-top:50px}}
</style>
