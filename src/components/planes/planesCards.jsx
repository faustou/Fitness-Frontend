import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PlanesStyles.css';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import axios from 'axios';

const plansData = [
  {
    id: 'oro',
    name: 'ORO',
    duration: '6 meses',
    icon: '🥇',
    oldPrice: 95000,
    price: 66500,
    discount: '30% OFF',
    features: ['Rutina + Dieta', 'Control semanal', 'Consultas diarias'],
    popular: false,
  },
  {
    id: 'plata',
    name: 'PLATA',
    duration: '3 meses',
    icon: '🥈',
    oldPrice: 55000,
    price: 38500,
    discount: '30% OFF',
    features: ['Rutina + Dieta', 'Control cada 15 días'],
    popular: true,
  },
  {
    id: 'bronce',
    name: 'BRONCE',
    duration: '1 mes',
    icon: '🥉',
    oldPrice: 21000,
    price: 14700,
    discount: '30% OFF',
    features: ['Planificación', 'Rutina personalizada'],
    popular: false,
  },
];

const vipPlan = {
  id: 'vip',
  name: 'VIP',
  title: 'PLAN DE ALTO RENDIMIENTO PARA ATLETAS',
  duration: '1 MES',
  oldPrice: 28000,
  price: 19600,
  discount: '30% OFF',
  featuresLeft: ['Planificación de objetivos', 'Rutina y dieta'],
  featuresRight: ['Controles semanales', 'Seguimiento diario'],
};

function PlanesCards() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPlan, setModalPlan] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);

  initMercadoPago('TEST-9b5a1571-f0d1-4a1a-a736-cbbc620946b9', {
    locale: 'es-AR',
  });

  const handleBuy = async (planInfo) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/create_preference`, {
        title: planInfo.title,
        quantity: 1,
        price: planInfo.price,
      });
      setPreferenceId(response.data.id);
      setModalPlan(planInfo);
      setIsModalOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <section className="planes-section" id="planes">
      {/* Background Effects */}
      <div className="planes-bg-effects">
        <div className="planes-bg-gradient-1"></div>
        <div className="planes-bg-gradient-2"></div>
      </div>

      <motion.div
        className="planes-header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <span className="planes-badge">Planes de Entrenamiento</span>
        <h2>
          CONTRATA <span>MIS SERVICIOS</span>
        </h2>
        <p className="planes-subtitle">
          Elegí el plan que mejor se adapte a tus objetivos
        </p>
      </motion.div>

      <motion.div
        className="planes-cards"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
      >
        {plansData.map((plan, index) => (
          <motion.div
            key={plan.id}
            className={`plan-card-wrapper ${plan.id}-wrapper ${plan.popular ? 'destacada' : ''}`}
            variants={cardVariants}
          >
            <div className="plan-card-bg"></div>
            <div className={`${plan.id}-border-anim`}></div>

            <div className={`plan-card ${plan.id}`}>
              {plan.popular && <div className="popular-badge">Más Popular</div>}
              <h3>{plan.name}</h3>
              <p className="plan-duration">{plan.duration}</p>
              <div className="plan-icon">{plan.icon}</div>

              <div className="plan-price-container">
                <p className="plan-price-old">${plan.oldPrice.toLocaleString()}</p>
                <div className="plan-price-new">
                  <span className="price-final">${plan.price.toLocaleString()}</span>
                  <span className="discount-badge">{plan.discount}</span>
                </div>
              </div>

              <ul>
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className="plan-button"
                onClick={() =>
                  handleBuy({
                    title: `Plan ${plan.name} - German Alvarado`,
                    price: plan.price,
                    oldPrice: plan.oldPrice,
                    name: plan.name,
                    duration: plan.duration,
                  })
                }
              >
                COMENZAR
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* VIP Card */}
      <motion.div
        className="plan-card-wrapper vip-wrapper"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <div className="plan-card vip">
          <div className="vip-header">
            <span className="vip-icon">👑</span>
            <h3>{vipPlan.title}</h3>
          </div>

          <div className="plan-price-container">
            <p className="plan-price-old">${vipPlan.oldPrice.toLocaleString()}</p>
            <div className="plan-price-new">
              <span className="price-final">${vipPlan.price.toLocaleString()}</span>
              <span className="discount-badge">{vipPlan.discount}</span>
            </div>
          </div>

          <div className="vip-benefits">
            <div className="vip-column">
              <ul>
                {vipPlan.featuresLeft.map((feature, i) => (
                  <li key={i}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="vip-button-wrapper">
              <button
                className="plan-button vip-button"
                onClick={() =>
                  handleBuy({
                    title: 'Plan VIP - German Alvarado',
                    price: vipPlan.price,
                    oldPrice: vipPlan.oldPrice,
                    name: 'VIP',
                    duration: vipPlan.duration,
                  })
                }
              >
                COMENZAR
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="vip-column">
              <ul>
                {vipPlan.featuresRight.map((feature, i) => (
                  <li key={i}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="vip-border-anim"></div>
      </motion.div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && modalPlan && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="modal-title">RESUMEN DE COMPRA</h2>

              <div className="modal-box">
                <div className="modal-plan-header">
                  <span className="modal-icon">
                    {modalPlan.name === 'ORO' && '🥇'}
                    {modalPlan.name === 'PLATA' && '🥈'}
                    {modalPlan.name === 'BRONCE' && '🥉'}
                    {modalPlan.name === 'VIP' && '👑'}
                  </span>
                  <div className="modal-plan-text">
                    <p className="modal-plan-title">{`PLAN ${modalPlan.name} – ${modalPlan.duration}`}</p>
                    <div className="modal-price-container">
                      <p className="modal-price-old">${modalPlan.oldPrice.toLocaleString()}</p>
                      <p className="modal-price-final">
                        ${modalPlan.price.toLocaleString()} <span>*30%OFF*</span>
                      </p>
                    </div>
                  </div>
                </div>

                {preferenceId && (
                  <div className="modal-mp">
                    <Wallet initialization={{ preferenceId }} />
                  </div>
                )}

                <p className="modal-warning">
                  Una vez hecho el pago, nos pondremos en contacto contigo.
                </p>
              </div>

              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default PlanesCards;
