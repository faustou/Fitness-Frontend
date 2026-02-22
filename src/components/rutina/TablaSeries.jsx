import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FilaSerie from './FilaSerie';
import './styles/tabla-series.css';

function TablaSeries({ series, onUpdateSerie, onCompletarSerie, onEliminarSerie, onAgregarSerie, disabled }) {
  const [mostrarConfirmAgregar, setMostrarConfirmAgregar] = useState(false);
  const [mostrarRirInfo, setMostrarRirInfo] = useState(false);
  const puedeEliminar = series.length > 1;

  const handleAgregarClick = () => {
    setMostrarConfirmAgregar(true);
  };

  const confirmarAgregar = () => {
    setMostrarConfirmAgregar(false);
    onAgregarSerie();
  };

  const cancelarAgregar = () => {
    setMostrarConfirmAgregar(false);
  };

  return (
    <div className="tabla-series-container">
      {/* Header */}
      <div className="tabla-series-header">
        <div className="header-col">#</div>
        <div className="header-col">Reps</div>
        <div className="header-col">Peso</div>
        <div className="header-col header-rir">
          <span>RIR</span>
          <button className="btn-rir-info" onClick={() => setMostrarRirInfo(true)}>?</button>
        </div>
        <div className="header-col"></div>
      </div>

      {/* Filas */}
      <div className="tabla-series-body">
        <AnimatePresence>
          {series.map((serie, index) => (
            <FilaSerie
              key={`serie-${serie.numero}-${index}`}
              serie={serie}
              onUpdate={(datos) => onUpdateSerie(index, datos)}
              onCompletar={() => onCompletarSerie(index)}
              onEliminar={() => onEliminarSerie(index)}
              disabled={disabled}
              puedeEliminar={puedeEliminar}
            />
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        className="btn-agregar-serie"
        onClick={handleAgregarClick}
        disabled={disabled}
        whileTap={{ scale: 0.98 }}
      >
        <span>+ Agregar serie</span>
      </motion.button>

      {/* Modal de confirmación para agregar serie */}
      <AnimatePresence>
        {mostrarConfirmAgregar && (
          <motion.div
            className="modal-serie-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cancelarAgregar}
          >
            <motion.div
              className="modal-serie-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-serie-icono">⚠️</div>
              <h3>¿Agregar serie extra?</h3>
              <p>El profesor asignó {series.length} series para este ejercicio. Agregar más modifica el plan de entrenamiento.</p>
              <div className="modal-serie-buttons">
                <button className="btn-modal-serie btn-cancelar" onClick={cancelarAgregar}>
                  Cancelar
                </button>
                <button className="btn-modal-serie btn-confirmar" onClick={confirmarAgregar}>
                  Agregar igual
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal explicación RIR */}
        {mostrarRirInfo && (
          <motion.div
            className="modal-serie-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMostrarRirInfo(false)}
          >
            <motion.div
              className="modal-serie-content modal-rir-info"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>¿Qué es el RIR?</h3>
              <p className="rir-definicion">
                El RIR es cuántas repeticiones sentís que te faltaron para llegar al fallo muscular (al límite total).
              </p>
              <div className="rir-explicacion">
                <p>El entrenador diseña la rutina y marca el RIR objetivo para cada ejercicio. Por ejemplo: <strong>Press de Banca: 3 series de 10 reps con RIR 2</strong>.</p>
                <ul>
                  <li>Él decide qué tan cerca del fallo debés estar para que la rutina sea efectiva sin que te sobrepases.</li>
                  <li>Si pone un <strong>RIR bajo (0-1)</strong>, quiere mucha intensidad.</li>
                  <li>Si pone un <strong>RIR alto (3-4)</strong>, quizás es una semana de descarga o técnica.</li>
                </ul>
              </div>
              <button className="btn-modal-serie btn-confirmar" onClick={() => setMostrarRirInfo(false)}>
                Entendido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default TablaSeries;
