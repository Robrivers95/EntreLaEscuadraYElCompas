<template>
  <div class="home-view">
    <div class="hero-section">
      <div class="hero-content">
        <div class="hero-symbol">⧖</div>
        <h1>Entre La Escuadra Y El Compás</h1>
        <p>Un Juego Masónico de Conocimiento y Tradición</p>

        <div class="hero-description">
          <p>
            Explora los misterios de la masonería a través de preguntas que abordan historia,
            filosofía, geometría sagrada y ética.
          </p>
        </div>

        <div class="hero-actions">
          <router-link to="/game-select" class="btn-primary">△ Comenzar Juego</router-link>
          <router-link to="/login" class="btn-secondary">⚒ Ingresar</router-link>
        </div>
      </div>

      <div class="hero-decoration">
        <div class="symbol">☽</div>
        <div class="symbol">△</div>
        <div class="symbol">☽</div>
      </div>
    </div>

    <div class="features-section">
      <div class="container">
        <h2>Características</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">⚒</div>
            <h3>Modo Turnos</h3>
            <p>Juega en turno con otro hermano, contestando preguntas según la categoría del tablero.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🎙️</div>
            <h3>Modo en Tiempo Real</h3>
            <p>Juega con hasta 8 hermanos simultáneamente con comunicación de voz integrada.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📚</div>
            <h3>Banco de Preguntas</h3>
            <p>Cientos de preguntas sobre la tradición masónica y filosofía occidental.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🏆</div>
            <h3>Puntuaciones</h3>
            <p>Compite y sube en la tabla de clasificación según tu conocimiento.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="footer-section">
      <p>© 2024 Entre La Escuadra Y El Compás. Todos los derechos reservados.</p>
      <p>Desarrollado con ♥ para la comunidad masónica</p>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a0a00 0%, #2d1500 100%);
}

.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  position: relative;
}

.hero-content {
  max-width: 700px;
}

.hero-symbol {
  font-size: 80px;
  color: #c9a84c;
  margin-bottom: 20px;
}

.hero-section h1 {
  font-size: 48px;
  color: #c9a84c;
  margin: 20px 0;
  text-transform: uppercase;
  letter-spacing: 3px;
  font-weight: 800;
}

.hero-section > div:first-child > p {
  font-size: 20px;
  color: #8b6914;
  margin: 15px 0 30px 0;
  letter-spacing: 1px;
}

.hero-description {
  background: rgba(201, 168, 76, 0.1);
  border-left: 4px solid #c9a84c;
  padding: 20px;
  margin: 30px 0;
  border-radius: 5px;
}

.hero-description p {
  color: #f0e6c8;
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
}

.hero-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 40px;
}

.btn-primary,
.btn-secondary {
  padding: 16px 40px;
  border-radius: 8px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 16px;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #c9a84c 0%, #8b6914 100%);
  color: #1a0a00;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(201, 168, 76, 0.5);
}

.btn-secondary {
  background: transparent;
  color: #c9a84c;
  border: 2px solid #c9a84c;
}

.btn-secondary:hover {
  background: rgba(201, 168, 76, 0.1);
}

.hero-decoration {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-around;
  opacity: 0.1;
  font-size: 200px;
  transform: translateY(-50%);
  pointer-events: none;
}

.features-section {
  padding: 80px 20px;
  background: rgba(26, 10, 0, 0.5);
}

.features-section h2 {
  text-align: center;
  font-size: 36px;
  margin-bottom: 50px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.feature-card {
  background: rgba(201, 168, 76, 0.05);
  border: 2px solid #8b6914;
  border-radius: 10px;
  padding: 30px;
  transition: all 0.3s ease;
  text-align: center;
}

.feature-card:hover {
  border-color: #c9a84c;
  background: rgba(201, 168, 76, 0.1);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(201, 168, 76, 0.2);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.feature-card h3 {
  font-size: 20px;
  margin: 15px 0;
  color: #c9a84c;
}

.feature-card p {
  color: #f0e6c8;
  line-height: 1.6;
  margin: 0;
}

.footer-section {
  background: rgba(26, 10, 0, 0.7);
  border-top: 1px solid #8b6914;
  padding: 40px 20px;
  text-align: center;
}

.footer-section p {
  color: #8b6914;
  margin: 10px 0;
  font-size: 14px;
}

@media (max-width: 768px) {
  .hero-section h1 {
    font-size: 32px;
    letter-spacing: 2px;
  }

  .hero-section > div:first-child > p {
    font-size: 16px;
  }

  .hero-symbol {
    font-size: 60px;
  }

  .features-grid {
    gap: 20px;
  }
}
</style>
