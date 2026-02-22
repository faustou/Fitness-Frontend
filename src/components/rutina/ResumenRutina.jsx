import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { guardarEntrenamiento } from '../../services/api';
import './styles/resumen-rutina.css';

function ResumenRutina({ rutina, tiempoTotal }) {
  const navigate = useNavigate();
  const { perfil } = useAuth();
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState(null);
  const yaGuardado = useRef(false); // Previene guardados duplicados

  // Calcular estadísticas
  const ejerciciosCompletados = rutina.ejercicios.filter(ej => ej.completado).length;
  const totalEjercicios = rutina.ejercicios.length;

  const totalSeriesCompletadas = rutina.ejercicios.reduce((acc, ej) => {
    return acc + ej.series.filter(s => s.completada).length;
  }, 0);

  const totalSeries = rutina.ejercicios.reduce((acc, ej) => acc + ej.series.length, 0);

  // Volumen total (reps * peso)
  const volumenTotal = rutina.ejercicios.reduce((acc, ej) => {
    return acc + ej.series.reduce((serieAcc, serie) => {
      if (serie.completada) {
        const reps = serie.repsReal ?? serie.repsObjetivo;
        const peso = serie.pesoReal ?? serie.pesoObjetivo;
        return serieAcc + (reps * peso);
      }
      return serieAcc;
    }, 0);
  }, 0);

  // Guardar entrenamiento al montar el componente (solo una vez)
  useEffect(() => {
    const guardar = async () => {
      // Usar ref para prevenir guardados duplicados (incluso en StrictMode)
      if (!perfil?.id || yaGuardado.current) return;
      yaGuardado.current = true;

      setGuardando(true);
      try {
        // Preparar datos detallados de cada ejercicio
        const detallesEjercicios = rutina.ejercicios.map(ej => ({
          ejercicioId: ej.ejercicioId,
          nombre: ej.nombre,
          completado: ej.completado,
          series: ej.series.map(s => ({
            numero: s.numero,
            repsObjetivo: s.repsObjetivo,
            pesoObjetivo: s.pesoObjetivo,
            repsReal: s.repsReal,
            pesoReal: s.pesoReal,
            rir: s.rir,
            completada: s.completada,
          })),
        }));

        await guardarEntrenamiento(perfil.id, {
          rutinaId: rutina.id,
          duracion: tiempoTotal,
          ejerciciosCompletados,
          ejerciciosTotales: totalEjercicios,
          volumenTotal,
          detalles: {
            nombreRutina: rutina.nombreRutina,
            diaSemana: rutina.diaSemana,
            ejercicios: detallesEjercicios,
          },
        });

        setGuardado(true);
      } catch (err) {
        console.error('Error guardando entrenamiento:', err);
        setErrorGuardado('Error al guardar el entrenamiento');
        yaGuardado.current = false; // Permitir reintentar si hay error
      } finally {
        setGuardando(false);
      }
    };

    guardar();
  }, [perfil?.id]); // Solo depende de perfil.id - se ejecuta una vez cuando está disponible

  // Formatear tiempo
  const formatearTiempo = (segundos) => {
    const hrs = Math.floor(segundos / 3600);
    const mins = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;

    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  return (
    <motion.div
      className="resumen-rutina"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="resumen-header">
        <motion.div
          className="resumen-icono"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          🎉
        </motion.div>
        <h1 className="resumen-titulo">¡Workout Completado!</h1>
        <p className="resumen-rutina-nombre">{rutina.nombreRutina}</p>

        {/* Estado de guardado */}
        <div className="resumen-guardado-status">
          {guardando && <span className="guardando">Guardando progreso...</span>}
          {guardado && <span className="guardado-ok">✓ Progreso guardado</span>}
          {errorGuardado && <span className="guardado-error">{errorGuardado}</span>}
        </div>
      </div>

      <div className="resumen-stats">
        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <span className="stat-valor">{formatearTiempo(tiempoTotal)}</span>
          <span className="stat-label">Tiempo total</span>
        </motion.div>

        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <span className="stat-valor">{ejerciciosCompletados}/{totalEjercicios}</span>
          <span className="stat-label">Ejercicios</span>
        </motion.div>

        <motion.div
          className="stat-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span className="stat-valor">{totalSeriesCompletadas}/{totalSeries}</span>
          <span className="stat-label">Series</span>
        </motion.div>

        <motion.div
          className="stat-card destacado"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <span className="stat-valor">{volumenTotal.toLocaleString()} kg</span>
          <span className="stat-label">Volumen total</span>
        </motion.div>
      </div>

      <div className="resumen-ejercicios">
        <h3>Resumen por ejercicio</h3>
        {rutina.ejercicios.map((ej, index) => (
          <motion.div
            key={ej.id}
            className={`ejercicio-resumen-item ${ej.completado ? 'completado' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.05 }}
          >
            <div className="ejercicio-resumen-info">
              <span className="ejercicio-resumen-nombre">{ej.nombre}</span>
              <span className="ejercicio-resumen-series">
                {ej.series.filter(s => s.completada).length}/{ej.series.length} series
              </span>
            </div>
            <span className={`ejercicio-resumen-estado ${ej.completado ? 'ok' : 'pendiente'}`}>
              {ej.completado ? '✓' : '○'}
            </span>
          </motion.div>
        ))}
      </div>

      <motion.button
        className="btn-volver-inicio"
        onClick={() => navigate('/alumno')}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Volver al Hub
      </motion.button>
    </motion.div>
  );
}

export default ResumenRutina;
