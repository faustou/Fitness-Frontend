import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useRutinaState } from '../../hooks/useRutinaState';
import { getMisRutinas } from '../../services/api';
import { getEjercicioById } from '../../data/ejerciciosDB';
import { useAuth } from '../../context/AuthContext';

import PantallaInicio from './PantallaInicio';
import TimerWorkout from './TimerWorkout';
import BarraProgreso from './BarraProgreso';
import EjercicioActual from './EjercicioActual';
import TimerDescanso from './TimerDescanso';
import ResumenRutina from './ResumenRutina';

import './styles/rutina-dia.css';

// Helper para crear estructura de series
// repsObjetivo puede ser un número (mismo para todas) o un array (por serie)
const crearSeries = (cantidad, repsObjetivo, pesoObjetivo, rirObjetivo) => {
  const esArray = Array.isArray(repsObjetivo);
  return Array.from({ length: cantidad }, (_, i) => ({
    numero: i + 1,
    repsObjetivo: esArray ? (repsObjetivo[i] ?? repsObjetivo[0] ?? 12) : (repsObjetivo || 12),
    pesoObjetivo,
    rirObjetivo: rirObjetivo ?? null,
    repsReal: null,
    pesoReal: null,
    rir: null,
    completada: false,
  }));
};

// Adaptar rutina de API al formato esperado por useRutinaState
const adaptarRutinaAPI = (rutinaAPI, diaSemana) => {
  if (!rutinaAPI || !rutinaAPI.ejercicios) return null;

  return {
    id: rutinaAPI.id,
    fecha: new Date().toISOString().split('T')[0],
    nombreRutina: rutinaAPI.nombre,
    diaSemana: diaSemana,
    ejercicios: rutinaAPI.ejercicios.map((ej, index) => {
      // Obtener info del ejercicio desde ejerciciosDB local (para gifs)
      const ejercicioLocal = getEjercicioById(ej.ejercicioId);

      return {
        id: index + 1,
        ejercicioId: ej.ejercicioId,
        nombre: ej.nombre || ejercicioLocal?.nombre || ej.ejercicioId,
        gif: ejercicioLocal?.gif || null,
        muscle: ejercicioLocal?.muscle || null,
        descripcion: ej.descripcion || ejercicioLocal?.descripcion || '',
        dificultad: ej.dificultad || ejercicioLocal?.dificultad || 'Intermedio',
        descanso: ej.descanso || 90,
        series: crearSeries(ej.series || 3, ej.reps || 12, ej.peso || 0, ej.rir),
        completado: false,
        orden: index + 1,
      };
    }),
  };
};

function RutinaDia() {
  const { dia } = useParams();
  const navigate = useNavigate();
  const { perfil } = useAuth();
  const [mostrarConfirmFinish, setMostrarConfirmFinish] = useState(false);
  const [rutinaData, setRutinaData] = useState(null);
  const [cicloInfo, setCicloInfo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar rutina desde API
  useEffect(() => {
    const cargarRutina = async () => {
      // Esperar a que el perfil esté disponible
      if (!perfil?.id) {
        return; // No hacer nada aún, esperar al perfil
      }

      if (!dia) {
        setError('Día no especificado');
        setCargando(false);
        return;
      }

      try {
        setCargando(true);
        setError(null); // Limpiar error anterior
        const response = await getMisRutinas(perfil.id);
        // getMisRutinas ahora retorna { rutinas, ciclo }
        const rutinas = response.rutinas || response;
        const ciclo = response.ciclo || null;
        setCicloInfo(ciclo);
        const rutinaDia = rutinas[parseInt(dia)];

        if (!rutinaDia) {
          setError('No hay rutina asignada para este día');
          setCargando(false);
          return;
        }

        const rutinaAdaptada = adaptarRutinaAPI(rutinaDia, parseInt(dia));
        setRutinaData(rutinaAdaptada);
      } catch (err) {
        console.error('Error cargando rutina:', err);
        setError('Error al cargar la rutina');
      } finally {
        setCargando(false);
      }
    };

    cargarRutina();
  }, [perfil?.id, dia]);

  const {
    rutina,
    ejercicioActual,
    ejercicioActualIndex,
    workoutIniciado,
    workoutCompletado,
    tiempoTotalFormateado,
    mostrandoDescanso,
    tiempoDescanso,
    totalEjercicios,
    progresoPercent,
    ejercicioActualCompletado,
    iniciarWorkout,
    actualizarSerie,
    completarSerie,
    agregarSerie,
    eliminarSerie,
    navegarEjercicio,
    siguienteEjercicio,
    anteriorEjercicio,
    finalizarDescanso,
    completarWorkout,
    tiempoTotal,
  } = useRutinaState(rutinaData);

  // Manejar click en Finish
  const handleFinish = () => {
    setMostrarConfirmFinish(true);
  };

  const confirmarFinish = () => {
    setMostrarConfirmFinish(false);
    completarWorkout();
  };

  const cancelarFinish = () => {
    setMostrarConfirmFinish(false);
  };

  // Pantalla de carga (mientras carga o mientras el hook sincroniza)
  if (cargando || (rutinaData && !rutina)) {
    return (
      <div className="rutina-dia-container">
        <div className="rutina-loading">
          <div className="loading-spinner"></div>
          <p>Cargando tu rutina...</p>
        </div>
      </div>
    );
  }

  // Pantalla de error (solo si hay error explícito o no hay datos)
  if (error || !rutina) {
    return (
      <div className="rutina-dia-container">
        <div className="rutina-error">
          <p>{error || 'No se pudo cargar la rutina'}</p>
          <button onClick={() => navigate('/alumno')}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  // Pantalla de inicio (antes de comenzar)
  if (!workoutIniciado) {
    return (
      <div className="rutina-dia-container">
        <PantallaInicio
          rutina={rutina}
          onComenzar={iniciarWorkout}
          onVolver={() => navigate('/alumno')}
          esDescarga={cicloInfo?.esDescarga}
          semanaActual={cicloInfo?.semanaActual}
        />
      </div>
    );
  }

  // Pantalla de resumen (workout completado)
  if (workoutCompletado) {
    return (
      <div className="rutina-dia-container">
        <ResumenRutina rutina={rutina} tiempoTotal={tiempoTotal} />
      </div>
    );
  }

  // Pantalla principal del workout
  return (
    <div className="rutina-dia-container">
      {/* Header con timer y botón finalizar */}
      <header className="rutina-header">
        <button className="btn-volver" onClick={() => navigate('/alumno')}>
          ←
        </button>
        <div className="header-centro">
          <TimerWorkout tiempoFormateado={tiempoTotalFormateado} activo={workoutIniciado} />
          <span className="header-porcentaje">{Math.round(progresoPercent)}%</span>
        </div>
        <button className="btn-finalizar" onClick={handleFinish}>
          Finish
        </button>
      </header>

      {/* Barra de progreso con thumbnails */}
      <BarraProgreso
        ejercicios={rutina.ejercicios}
        ejercicioActualIndex={ejercicioActualIndex}
        progresoPercent={progresoPercent}
        onNavegar={navegarEjercicio}
      />

      {/* Contenido del ejercicio actual */}
      <main className="rutina-content">
        <AnimatePresence mode="wait">
          <EjercicioActual
            key={ejercicioActualIndex}
            ejercicio={ejercicioActual}
            ejercicioIndex={ejercicioActualIndex}
            onUpdateSerie={actualizarSerie}
            onCompletarSerie={completarSerie}
            onEliminarSerie={eliminarSerie}
            onAgregarSerie={agregarSerie}
            onSiguiente={siguienteEjercicio}
            onAnterior={anteriorEjercicio}
            esUltimo={ejercicioActualIndex === totalEjercicios - 1}
            esPrimero={ejercicioActualIndex === 0}
            ejercicioCompletado={ejercicioActualCompletado}
          />
        </AnimatePresence>
      </main>

      {/* Timer de descanso (overlay) */}
      <TimerDescanso
        segundosInicial={tiempoDescanso}
        onTerminar={finalizarDescanso}
        visible={mostrandoDescanso}
      />

      {/* Modal de confirmación para Finish */}
      <AnimatePresence>
        {mostrarConfirmFinish && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h3>¿Terminar entrenamiento?</h3>
              <p>Los ejercicios no completados se marcarán como incompletos y el profesor podrá ver tu progreso.</p>
              <div className="modal-buttons">
                <button className="btn-modal btn-cancelar" onClick={cancelarFinish}>
                  Cancelar
                </button>
                <button className="btn-modal btn-confirmar" onClick={confirmarFinish}>
                  Terminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RutinaDia;
