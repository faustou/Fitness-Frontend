import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles-faq.css';

const faqData = [
  {
    question: '¿Cuál es la duración de los planes?',
    answer: 'Los planes varían según tu objetivo: 1 mes (Bronce), 3 meses (Plata) y 6 meses (Oro). Cada uno está diseñado para darte resultados progresivos y sostenibles.',
  },
  {
    question: '¿Qué necesito para empezar?',
    answer: 'Solo necesitás motivación, ropa cómoda y conexión a internet. Las rutinas se adaptan a si tenés acceso a un gimnasio o preferís entrenar en casa.',
  },
  {
    question: '¿Puedo hacer los entrenamientos en casa?',
    answer: 'Sí, todos los programas están pensados para adaptarse a tu situación. Podés entrenar en casa con equipamiento mínimo o en el gimnasio con acceso completo.',
  },
  {
    question: '¿Hay seguimiento personalizado?',
    answer: 'Dependiendo del plan que elijas, tenés distintos niveles de seguimiento: desde controles mensuales hasta seguimiento diario con consultas ilimitadas.',
  },
  {
    question: '¿Cómo recibo las rutinas y la dieta?',
    answer: 'Una vez confirmado el pago, te contacto personalmente para conocer tus objetivos, nivel actual y preferencias. Luego recibirás todo el material en formato digital.',
  },
  {
    question: '¿Puedo cambiar de plan después de empezar?',
    answer: 'Sí, podés actualizar tu plan en cualquier momento. El cambio se aplica en el siguiente período de facturación.',
  },
];

function Faqs() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section" id="faq">
      <motion.div
        className="faq-header"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <span className="faq-badge">Dudas Frecuentes</span>
        <h2>
          PREGUNTAS <span>FRECUENTES</span>
        </h2>
        <p className="faq-subtitle">
          Encontrá respuestas a las consultas más comunes
        </p>
      </motion.div>

      <motion.div
        className="faq-list"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {faqData.map((faq, index) => (
          <motion.div
            key={index}
            className={`faq-item ${openIndex === index ? 'open' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
          >
            <button
              className="faq-question"
              onClick={() => toggleFaq(index)}
              aria-expanded={openIndex === index}
            >
              <span>{faq.question}</span>
              <motion.div
                className="faq-icon"
                animate={{ rotate: openIndex === index ? 45 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </motion.div>
            </button>

            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  className="faq-answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p>{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

export default Faqs;
