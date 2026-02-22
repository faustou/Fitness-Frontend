import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/timer-descanso.css';

function TimerDescanso({ segundosInicial, onTerminar, visible }) {
  const [segundosRestantes, setSegundosRestantes] = useState(segundosInicial);
  const [pausado, setPausado] = useState(false);

  // Reiniciar cuando cambie el tiempo inicial o cuando se vuelve visible
  useEffect(() => {
    setSegundosRestantes(segundosInicial);
    setPausado(false);
  }, [segundosInicial, visible]);

  // Cuenta regresiva
  useEffect(() => {
    if (!visible || segundosRestantes <= 0 || pausado) return;

    const interval = setInterval(() => {
      setSegundosRestantes(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, segundosRestantes, pausado]);

  // Formatear tiempo
  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const secs = segundos % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const togglePausa = () => setPausado(prev => !prev);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="timer-descanso-bar"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.25 }}
        >
          {/* Botón cerrar (finalizar descanso) */}
          <motion.button
            className="timer-btn timer-btn-cerrar"
            onClick={onTerminar}
            whileTap={{ scale: 0.9 }}
            title="Finalizar descanso"
          >
            ✕
          </motion.button>

          {/* Timer */}
          <div className="timer-bar-centro">
            <span className="timer-bar-label">Descanso</span>
            <span className="timer-bar-tiempo">
              {segundosRestantes === 0 ? '¡Listo!' : formatearTiempo(segundosRestantes)}
            </span>
          </div>

          {/* Botón play/pause */}
          <motion.button
            className={`timer-btn timer-btn-toggle ${pausado ? 'is-paused' : 'is-running'}`}
            onClick={togglePausa}
            whileTap={{ scale: 0.9 }}
            title={pausado ? 'Reanudar' : 'Pausar'}
          >
            {pausado ? (
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4 2 L14 8 L4 14 Z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="1" y="1" width="12" height="12" rx="2" />
              </svg>
            )}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default TimerDescanso;
