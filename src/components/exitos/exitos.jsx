import { motion } from 'framer-motion';
import './styles-antes-despues.css';
import Normal from '../../assets/img/normal.png';
import Muscle from '../../assets/img/muscle.png';

function AntesDespuesSection() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const transformations = [1, 2, 3, 4, 5, 6];

  return (
    <section className="antes-despues-section" id="exitos">
      {/* Background decoration */}
      <div className="exitos-bg-decoration">
        <div className="decoration-circle"></div>
      </div>

      <motion.div
        className="section-header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <span className="section-badge">Resultados Reales</span>
        <h2 className="antes-despues-title">
          CAMBIOS DE <span>MIS CLIENTES</span>
        </h2>
        <p className="section-subtitle">
          Transformaciones reales de personas que confiaron en el proceso
        </p>
      </motion.div>

      <motion.div
        className="antes-despues-grid"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {transformations.map((i) => (
          <motion.div
            className="antes-despues-card"
            key={i}
            variants={cardVariants}
            whileHover={{ y: -8, transition: { duration: 0.3 } }}
          >
            <div className="card-glow"></div>
            <div className="imagen-container">
              <div className="imagen-item">
                <img src={Normal} alt="Antes" />
                <span className="label-badge antes">Antes</span>
              </div>
              <div className="separador">
                <div className="separador-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </div>
              <div className="imagen-item">
                <img src={Muscle} alt="Después" />
                <span className="label-badge despues">Después</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="antes-despues-cta"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <a href="#planes" className="btn-cambio">
          <span>Empezá tu cambio hoy</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </motion.div>
    </section>
  );
}

export default AntesDespuesSection;
