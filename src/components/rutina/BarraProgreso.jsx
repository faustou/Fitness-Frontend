import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import './styles/barra-progreso.css';

function BarraProgreso({ ejercicios, ejercicioActualIndex, progresoPercent, onNavegar }) {
  const containerRef = useRef(null);
  const thumbnailRefs = useRef([]);

  // Auto-scroll al ejercicio actual
  useEffect(() => {
    if (thumbnailRefs.current[ejercicioActualIndex] && containerRef.current) {
      const thumbnail = thumbnailRefs.current[ejercicioActualIndex];
      const container = containerRef.current;

      const thumbnailLeft = thumbnail.offsetLeft;
      const thumbnailWidth = thumbnail.offsetWidth;
      const containerWidth = container.offsetWidth;

      // Centrar el thumbnail en el contenedor
      const scrollPosition = thumbnailLeft - (containerWidth / 2) + (thumbnailWidth / 2);
      container.scrollTo({ left: scrollPosition, behavior: 'smooth' });
    }
  }, [ejercicioActualIndex]);

  // Determinar nivel de progreso para los colores
  const getNivelProgreso = () => {
    if (progresoPercent >= 80) return 'fire';
    if (progresoPercent >= 50) return 'hot';
    if (progresoPercent >= 25) return 'warm';
    return 'cold';
  };

  const nivelProgreso = getNivelProgreso();

  return (
    <div className={`barra-progreso-container nivel-${nivelProgreso}`}>
      {/* Indicador de progreso con porcentaje */}
      <div className="barra-progreso-header">
        <div className="progreso-info">
          <span className="progreso-label">Progreso</span>
          <span className={`progreso-porcentaje nivel-${nivelProgreso}`}>
            {Math.round(progresoPercent)}%
            {progresoPercent >= 80 && <span className="fire-icon">🔥</span>}
          </span>
        </div>
        <span className="ejercicios-count">{ejercicioActualIndex + 1}/{ejercicios.length}</span>
      </div>

      {/* Barra de progreso lineal con efecto de fuego */}
      <div className="barra-fondo">
        <motion.div
          className={`barra-llenado nivel-${nivelProgreso}`}
          initial={{ width: 0 }}
          animate={{ width: `${progresoPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
        {progresoPercent >= 80 && (
          <div className="barra-fire-particles">
            <span className="particle">🔥</span>
            <span className="particle delay-1">🔥</span>
            <span className="particle delay-2">🔥</span>
          </div>
        )}
      </div>

      {/* Thumbnails de ejercicios */}
      <div className="thumbnails-container" ref={containerRef}>
        {ejercicios.map((ej, index) => (
          <motion.div
            key={ej.id}
            ref={(el) => (thumbnailRefs.current[index] = el)}
            className={`thumbnail ${index === ejercicioActualIndex ? 'activo' : ''} ${ej.completado ? 'completado' : ''}`}
            onClick={() => onNavegar(index)}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <img src={ej.gif} alt={ej.nombre} />
            {ej.completado && (
              <motion.div
                className="thumbnail-check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                ✓
              </motion.div>
            )}
            <span className="thumbnail-numero">{index + 1}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default BarraProgreso;
