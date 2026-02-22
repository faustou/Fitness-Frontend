import { motion } from 'framer-motion';
import Navbar from '../navbar/navbar';
import './styles-home.css';

function Home() {
  return (
    <div className="home" id="home">
      <Navbar />

      {/* Animated background elements */}
      <div className="home-bg-effects">
        <div className="bg-gradient-1"></div>
        <div className="bg-gradient-2"></div>
        <div className="bg-grid"></div>
      </div>

      <div className="home-container">
        <motion.div
          className="home-text"
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.span
            className="home-badge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Entrenamiento Personalizado
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Bienvenido a tu
            <span className="gradient-text"> Transformación</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Transformá tu cuerpo, mente y vida con mis planes personalizados.
            Alcanzá tus objetivos con el acompañamiento que necesitás.
          </motion.p>

          <motion.div
            className="home-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <a href="#planes" className="btn-primary">
              <span>Ver Planes</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </a>
            <a href="#exitos" className="btn-secondary">
              Ver Resultados
            </a>
          </motion.div>

          <motion.div
            className="home-stats"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Clientes</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">5+</span>
              <span className="stat-label">Años exp.</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">98%</span>
              <span className="stat-label">Satisfacción</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className="home-image"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="model-glow"></div>
          <model-viewer
            src="/assets/img/3d/scene.gltf"
            alt="Un modelo 3D"
            auto-rotate
            camera-controls
            interaction-prompt="none"
            style={{ width: '100%', height: '650px', zIndex: 10, position: 'relative' }}
          />
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="scroll-indicator"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <span>Scroll</span>
        <div className="scroll-line">
          <div className="scroll-dot"></div>
        </div>
      </motion.div>
    </div>
  );
}

export default Home;
