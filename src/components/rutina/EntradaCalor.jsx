import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './styles/entrada-calor.css';

function EntradaCalor({ calentamiento, onComenzar, onOmitir }) {
  const ejercicios = calentamiento?.ejercicios || [];
  const [ejIndex, setEjIndex] = useState(0);
  // seriesCompletadas[ejIndex] = número de series marcadas como hechas
  const [seriesCompletadas, setSeriesCompletadas] = useState(
    () => ejercicios.map(() => 0)
  );

  const ejercicioActual = ejercicios[ejIndex] || null;
  const totalEjercicios = ejercicios.length;

  const seriesHechasActual = seriesCompletadas[ejIndex] ?? 0;
  const seriesTotalActual = ejercicioActual?.series ?? 0;
  const ejercicioTerminado = seriesHechasActual >= seriesTotalActual;

  // Progreso global: (ejercicios completos + fracción del actual) / total
  const progresoTotal = totalEjercicios === 0 ? 0 : (() => {
    let hecho = 0;
    ejercicios.forEach((ej, i) => {
      if (seriesCompletadas[i] >= ej.series) {
        hecho += 1;
      } else if (i === ejIndex) {
        hecho += seriesCompletadas[i] / ej.series;
      }
    });
    return Math.round((hecho / totalEjercicios) * 100);
  })();

  const todosCompletados = ejercicios.every((ej, i) => seriesCompletadas[i] >= ej.series);

  const marcarSerie = () => {
    if (seriesHechasActual >= seriesTotalActual) return;
    setSeriesCompletadas(prev => {
      const nuevo = [...prev];
      nuevo[ejIndex] = prev[ejIndex] + 1;
      return nuevo;
    });
  };

  const irSiguiente = () => {
    if (ejIndex < totalEjercicios - 1) setEjIndex(ejIndex + 1);
  };

  const irAnterior = () => {
    if (ejIndex > 0) setEjIndex(ejIndex - 1);
  };

  if (!ejercicioActual) return null;

  return (
    <motion.div
      className="entrada-calor"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Header */}
      <div className="ec-header">
        <h2 className="ec-titulo">
          {calentamiento.tipo === 'superior' ? 'Calentamiento Superior' : 'Calentamiento Inferior'}
        </h2>
        <button className="ec-btn-omitir" onClick={onOmitir}>
          Omitir calentamiento
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="ec-progreso-container">
        <div className="ec-progreso-bar" style={{ width: `${progresoTotal}%` }} />
      </div>
      <p className="ec-progreso-label">{ejIndex + 1} / {totalEjercicios} ejercicios</p>

      {/* Ejercicio actual */}
      <AnimatePresence mode="wait">
        <motion.div
          key={ejIndex}
          className="ec-ejercicio"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          {ejercicioActual.gif_url ? (
            <img
              src={ejercicioActual.gif_url}
              alt={ejercicioActual.nombre}
              className="ec-gif"
            />
          ) : (
            <div className="ec-gif-placeholder">🏃</div>
          )}

          <h3 className="ec-nombre">{ejercicioActual.nombre}</h3>
          <p className="ec-descripcion">{ejercicioActual.descripcion}</p>

          <div className="ec-config-info">
            <span>{ejercicioActual.series} series</span>
            <span>·</span>
            <span>
              {ejercicioActual.reps} {ejercicioActual.unidad === 'seg' ? 'segundos' : 'reps'}
            </span>
          </div>

          {/* Series — una por una */}
          <div className="ec-series">
            {Array.from({ length: seriesTotalActual }, (_, i) => {
              const hecha = i < seriesHechasActual;
              const esActual = i === seriesHechasActual;
              return (
                <motion.button
                  key={i}
                  className={`ec-serie-btn ${hecha ? 'hecha' : ''} ${esActual ? 'actual' : ''}`}
                  onClick={esActual ? marcarSerie : undefined}
                  whileTap={esActual ? { scale: 0.95 } : {}}
                  disabled={!esActual && !hecha}
                >
                  {hecha ? '✓' : `S${i + 1}`}
                </motion.button>
              );
            })}
          </div>

          {ejercicioTerminado && (
            <p className="ec-ej-completado">Ejercicio completado</p>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navegación */}
      <div className="ec-navegacion">
        <button
          className="ec-btn-nav"
          onClick={irAnterior}
          disabled={ejIndex === 0}
        >
          ← Anterior
        </button>
        {ejIndex < totalEjercicios - 1 ? (
          <button
            className="ec-btn-nav ec-btn-siguiente"
            onClick={irSiguiente}
            disabled={!ejercicioTerminado}
          >
            Siguiente →
          </button>
        ) : null}
      </div>

      {/* Botón comenzar rutina — solo cuando todo está completo */}
      {todosCompletados && (
        <motion.button
          className="ec-btn-comenzar"
          onClick={onComenzar}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
        >
          Comenzar Rutina
        </motion.button>
      )}
    </motion.div>
  );
}

export default EntradaCalor;
