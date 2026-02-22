import { motion, AnimatePresence } from 'framer-motion';
import TablaSeries from './TablaSeries';
import './styles/ejercicio-actual.css';

function EjercicioActual({
  ejercicio,
  ejercicioIndex,
  onUpdateSerie,
  onCompletarSerie,
  onEliminarSerie,
  onAgregarSerie,
  onSiguiente,
  onAnterior,
  esUltimo,
  esPrimero,
  ejercicioCompletado,
}) {
  if (!ejercicio) return null;

  const seriesCompletadas = ejercicio.series.filter(s => s.completada).length;
  const totalSeries = ejercicio.series.length;
  const todasCompletadas = seriesCompletadas === totalSeries;

  // Manejar click en siguiente
  const handleSiguiente = () => {
    if (todasCompletadas) {
      onSiguiente(false); // No forzar, está completado
    } else {
      // No permite avanzar si no completó todas las series
      // Podríamos mostrar un toast o mensaje aquí
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={ejercicio.id}
        className="ejercicio-actual"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        transition={{ duration: 0.3 }}
      >
        {/* Info del ejercicio */}
        <div className="ejercicio-header">
          <h2 className="ejercicio-nombre">{ejercicio.nombre}</h2>
          <span className="ejercicio-dificultad">{ejercicio.dificultad}</span>
        </div>

        {/* GIF y músculo */}
        <div className="ejercicio-visual">
          <img
            src={ejercicio.gif}
            alt={ejercicio.nombre}
            className="ejercicio-gif"
          />
          <img
            src={ejercicio.muscle}
            alt="Músculo trabajado"
            className="ejercicio-muscle"
          />
        </div>

        {/* Info badges */}
        <div className="ejercicio-badges">
          <div className="badge">
            <span className="badge-icono">💪</span>
            <span>{seriesCompletadas}/{totalSeries} series</span>
          </div>
          <div className="badge">
            <span className="badge-icono">⏱️</span>
            <span>{ejercicio.descanso}s descanso</span>
          </div>
        </div>

        {/* Tabla de series */}
        <TablaSeries
          series={ejercicio.series}
          onUpdateSerie={(serieIdx, datos) => onUpdateSerie(ejercicioIndex, serieIdx, datos)}
          onCompletarSerie={(serieIdx) => onCompletarSerie(ejercicioIndex, serieIdx)}
          onEliminarSerie={(serieIdx) => onEliminarSerie(ejercicioIndex, serieIdx)}
          onAgregarSerie={() => onAgregarSerie(ejercicioIndex)}
        />

        {/* Navegación */}
        <div className="ejercicio-navegacion">
          <motion.button
            className="btn-nav btn-anterior"
            onClick={onAnterior}
            disabled={esPrimero}
            whileTap={{ scale: 0.95 }}
          >
            ← Anterior
          </motion.button>

          <motion.button
            className={`btn-nav btn-siguiente ${todasCompletadas ? 'destacado' : 'bloqueado'}`}
            onClick={handleSiguiente}
            disabled={!todasCompletadas}
            whileTap={todasCompletadas ? { scale: 0.95 } : {}}
          >
            {!todasCompletadas
              ? `Completá ${totalSeries - seriesCompletadas} serie${totalSeries - seriesCompletadas > 1 ? 's' : ''}`
              : esUltimo ? 'Finalizar' : 'Siguiente →'
            }
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default EjercicioActual;
