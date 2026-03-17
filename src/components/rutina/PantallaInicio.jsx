import { motion } from 'framer-motion';
import './styles/pantalla-inicio.css';

function PantallaInicio({ rutina, onComenzar, onVerCalentamiento, onVolver, esDescarga, semanaActual }) {
  const totalSeries = rutina.ejercicios.reduce((acc, ej) => acc + ej.series.length, 0);
  const totalEjercicios = rutina.ejercicios.length;

  return (
    <motion.div
      className={`pantalla-inicio ${esDescarga ? 'es-descarga' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Botón volver */}
      <motion.button
        className="btn-volver-inicio"
        onClick={onVolver}
        whileTap={{ scale: 0.95 }}
      >
        ← Volver
      </motion.button>

      {/* Banner de descarga */}
      {esDescarga && (
        <motion.div
          className="inicio-descarga-banner"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <span className="descarga-leaf">🌿</span>
          <div className="descarga-info">
            <strong>Semana de Descarga</strong>
            <span>Cargas reducidas para recuperar</span>
          </div>
        </motion.div>
      )}

      {/* Indicador de semana del ciclo */}
      {semanaActual && (
        <div className="inicio-semana-ciclo">
          <span>Semana {semanaActual}/4</span>
        </div>
      )}

      <div className="inicio-header">
        <h1 className="inicio-titulo">{rutina.nombreRutina}</h1>
        <p className="inicio-fecha">{new Date(rutina.fecha).toLocaleDateString('es-ES', {
          weekday: 'long',
          day: 'numeric',
          month: 'long'
        })}</p>
      </div>

      <div className="inicio-stats">
        <div className="stat">
          <span className="stat-numero">{totalEjercicios}</span>
          <span className="stat-label">Ejercicios</span>
        </div>
        <div className="stat">
          <span className="stat-numero">{totalSeries}</span>
          <span className="stat-label">Series</span>
        </div>
      </div>

      <div className="inicio-ejercicios-lista">
        <h3>Ejercicios de hoy</h3>
        <div className="ejercicios-preview">
          {rutina.ejercicios.map((ej, index) => (
            <motion.div
              key={ej.id}
              className="ejercicio-preview-item"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className="ejercicio-preview-numero">{index + 1}</div>
              <img src={ej.gif} alt={ej.nombre} className="ejercicio-preview-gif" />
              <div className="ejercicio-preview-info">
                <span className="ejercicio-preview-nombre">{ej.nombre}</span>
                <span className="ejercicio-preview-series">{ej.series.length} series</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {rutina.calentamiento?.tipo ? (
        <div className="inicio-calentamiento-bloque">
          <div className="inicio-calentamiento-info">
            <span className="calentamiento-fire">🔥</span>
            <span>Esta rutina incluye entrada en calor</span>
          </div>
          <div className="inicio-calentamiento-botones">
            <motion.button
              className="btn-ver-calentamiento"
              onClick={onVerCalentamiento}
              whileTap={{ scale: 0.97 }}
            >
              Ver calentamiento
            </motion.button>
            <motion.button
              className="btn-omitir-calentamiento"
              onClick={onComenzar}
              whileTap={{ scale: 0.97 }}
            >
              Omitir y comenzar
            </motion.button>
          </div>
        </div>
      ) : (
        <motion.button
          className="btn-comenzar"
          onClick={onComenzar}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Comenzar Workout
        </motion.button>
      )}
    </motion.div>
  );
}

export default PantallaInicio;
