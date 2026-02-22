import { motion } from 'framer-motion';
import './styles/timer-workout.css';

function TimerWorkout({ tiempoFormateado, activo }) {
  return (
    <motion.div
      className={`timer-workout ${activo ? 'activo' : ''}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <span className="timer-icono">⏱️</span>
      <span className="timer-tiempo">{tiempoFormateado}</span>
    </motion.div>
  );
}

export default TimerWorkout;
