import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getAlumnoById,
  getRutinasAlumno,
  getHistorialAlumno,
  eliminarEntrenamiento,
  diasSemana,
  getMesesDisponibles,
  getMesActual,
  getMesSiguiente,
  getNombreMes,
} from '../../services/api';
import HistorialSemanal from './HistorialSemanal';
import './styles/perfil-alumno.css';

function PerfilAlumno() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tabActiva, setTabActiva] = useState('rutinas');
  const [alumno, setAlumno] = useState(null);
  const [rutinas, setRutinas] = useState({});
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [entrenamientoSeleccionado, setEntrenamientoSeleccionado] = useState(null);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  // Estado para selector de mes
  const [mesSeleccionado, setMesSeleccionado] = useState(getMesActual());
  const [mesesDisponibles, setMesesDisponibles] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [alumnoData, meses, historialData] = await Promise.all([
          getAlumnoById(id),
          getMesesDisponibles(id),
          getHistorialAlumno(id),
        ]);
        setAlumno(alumnoData);
        setMesesDisponibles(meses);
        setHistorial(historialData);

        // Cargar rutinas del mes actual
        const rutinasData = await getRutinasAlumno(id, getMesActual());
        setRutinas(rutinasData);
      } catch (err) {
        setError('Error al cargar datos del alumno');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [id]);

  // Cargar rutinas cuando cambia el mes seleccionado
  useEffect(() => {
    if (!alumno) return;

    const cargarRutinasMes = async () => {
      try {
        const rutinasData = await getRutinasAlumno(id, mesSeleccionado);
        setRutinas(rutinasData);
      } catch (err) {
        console.error('Error cargando rutinas del mes:', err);
      }
    };

    cargarRutinasMes();
  }, [mesSeleccionado, id, alumno]);

  if (cargando) {
    return (
      <div className="perfil-alumno">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !alumno) {
    return (
      <div className="perfil-alumno">
        <div className="error-container">
          <p>{error || 'Alumno no encontrado'}</p>
          <button onClick={() => navigate('/profesor')}>Volver</button>
        </div>
      </div>
    );
  }

  // Obtener iniciales
  const getIniciales = (nombre) => {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Formatear tiempo
  const formatearTiempo = (segundos) => {
    const mins = Math.floor(segundos / 60);
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins % 60}min`;
    }
    return `${mins}min`;
  };

  // Calcular asistencia
  const asistencia = alumno.estadisticas.rutinasTotales > 0
    ? Math.round((alumno.estadisticas.rutinasCompletadas / alumno.estadisticas.rutinasTotales) * 100)
    : 0;

  // Manejar eliminación de entrenamiento
  const handleEliminar = async () => {
    if (!entrenamientoSeleccionado?.id) return;

    setEliminando(true);
    try {
      await eliminarEntrenamiento(entrenamientoSeleccionado.id);
      // Actualizar historial local quitando el eliminado
      setHistorial(prev => prev.filter(h => h.id !== entrenamientoSeleccionado.id));
      // Actualizar estadísticas locales del alumno
      setAlumno(prev => ({
        ...prev,
        estadisticas: {
          ...prev.estadisticas,
          rutinasTotales: Math.max(0, prev.estadisticas.rutinasTotales - 1),
          rutinasCompletadas: Math.max(0, prev.estadisticas.rutinasCompletadas - 1),
          racha: Math.max(0, prev.estadisticas.racha - 1),
        },
      }));
      setEntrenamientoSeleccionado(null);
      setConfirmandoEliminar(false);
    } catch (err) {
      console.error('Error eliminando entrenamiento:', err);
      alert('Error al eliminar el entrenamiento');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="perfil-alumno">
      {/* Header */}
      <header className="perfil-header">
        <motion.button
          className="btn-volver"
          onClick={() => navigate('/profesor')}
          whileTap={{ scale: 0.95 }}
        >
          ← Volver
        </motion.button>
        <h2>Perfil del Alumno</h2>
        <div style={{ width: 60 }}></div>
      </header>

      {/* Banner de alumno pendiente */}
      {alumno.pendiente && (
        <div className="banner-pendiente">
          <p>Este alumno aún no se registró.</p>
          <p className="banner-link">
            Link de registro:
            <span
              className="link-copiable"
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/registro`);
                alert('Link copiado!');
              }}
            >
              {window.location.origin}/registro
            </span>
          </p>
        </div>
      )}

      {/* Info del alumno */}
      <section className="alumno-perfil-info">
        <div className={`perfil-avatar ${alumno.pendiente ? 'pendiente' : ''}`}>
          {alumno.avatar ? (
            <img src={alumno.avatar} alt={alumno.nombre} />
          ) : (
            <span>{getIniciales(alumno.nombre)}</span>
          )}
        </div>
        <div className="perfil-datos">
          <h1 className="perfil-nombre">
            {alumno.nombre}
            {alumno.pendiente && <span className="badge-pendiente">Pendiente</span>}
          </h1>
          <p className="perfil-objetivo">{alumno.objetivo}</p>
          <p className="perfil-email">{alumno.email}</p>
        </div>
      </section>

      {/* Stats rápidas */}
      <section className="stats-rapidas">
        <div className="stat-card">
          <span className="stat-icono">📊</span>
          <div className="stat-datos">
            <span className="stat-numero">{asistencia}%</span>
            <span className="stat-texto">Asistencia</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icono">🔥</span>
          <div className="stat-datos">
            <span className="stat-numero">{alumno.estadisticas.racha}</span>
            <span className="stat-texto">Racha</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-icono">✅</span>
          <div className="stat-datos">
            <span className="stat-numero">{alumno.estadisticas.rutinasCompletadas}</span>
            <span className="stat-texto">Completadas</span>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="perfil-tabs">
        <button
          className={`tab ${tabActiva === 'rutinas' ? 'activa' : ''}`}
          onClick={() => setTabActiva('rutinas')}
        >
          Rutinas
        </button>
        <button
          className={`tab ${tabActiva === 'historial' ? 'activa' : ''}`}
          onClick={() => setTabActiva('historial')}
        >
          Historial
        </button>
        <button
          className={`tab ${tabActiva === 'progreso' ? 'activa' : ''}`}
          onClick={() => setTabActiva('progreso')}
        >
          Progreso
        </button>
      </div>

      {/* Contenido de tabs */}
      <AnimatePresence mode="wait">
        {tabActiva === 'rutinas' && (
          <motion.section
            key="rutinas"
            className="tab-content"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Selector de mes */}
            <div className="mes-selector">
              <span className="mes-label">Rutinas de:</span>
              <div className="mes-tabs">
                {mesesDisponibles.map(mes => (
                  <button
                    key={mes}
                    className={`mes-tab ${mes === mesSeleccionado ? 'activo' : ''} ${mes === getMesActual() ? 'actual' : ''} ${mes === getMesSiguiente(getMesActual()) ? 'siguiente' : ''}`}
                    onClick={() => setMesSeleccionado(mes)}
                  >
                    {getNombreMes(mes)}
                    {mes === getMesActual() && <span className="mes-badge">Actual</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="dias-entrenamiento">
              {/* Mostrar todos los días de la semana (1-6 = Lun-Sáb) */}
              {[1, 2, 3, 4, 5, 6].map(dia => {
                const rutinaDia = rutinas[dia];
                const tieneRutina = rutinaDia && rutinaDia.ejercicios && rutinaDia.ejercicios.length > 0;

                return (
                  <div key={dia} className="dia-card">
                    <div className="dia-header">
                      <span className="dia-nombre">{diasSemana[dia]}</span>
                      {tieneRutina && (
                        <span className="dia-ejercicios">
                          {rutinaDia.ejercicios.length} ejercicios
                        </span>
                      )}
                    </div>

                    {tieneRutina ? (
                      <div className="dia-rutina">
                        <h4 className="rutina-nombre">{rutinaDia.nombre}</h4>
                        <div className="rutina-preview">
                          {rutinaDia.ejercicios.slice(0, 3).map((ej, idx) => (
                            <span key={idx} className="ejercicio-mini">
                              {ej.series}x{ej.reps}
                            </span>
                          ))}
                          {rutinaDia.ejercicios.length > 3 && (
                            <span className="ejercicio-mini more">
                              +{rutinaDia.ejercicios.length - 3}
                            </span>
                          )}
                        </div>
                        <motion.button
                          className="btn-editar-rutina"
                          onClick={() => navigate(`/profesor/alumno/${id}/rutina/${rutinaDia.id}?mes=${mesSeleccionado}`)}
                          whileTap={{ scale: 0.95 }}
                        >
                          Editar rutina
                        </motion.button>
                      </div>
                    ) : (
                      <div className="dia-vacio">
                        <p>Sin rutina asignada</p>
                        <motion.button
                          className="btn-crear-rutina"
                          onClick={() => navigate(`/profesor/alumno/${id}/rutina/nueva?dia=${dia}&mes=${mesSeleccionado}`)}
                          whileTap={{ scale: 0.95 }}
                        >
                          + Crear rutina
                        </motion.button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.section>
        )}

        {tabActiva === 'historial' && (
          <motion.section
            key="historial"
            className="tab-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {historial.length > 0 ? (
              <div className="historial-lista">
                {historial.map((entrada, index) => (
                  <motion.div
                    key={entrada.id || index}
                    className="historial-card clickable"
                    onClick={() => setEntrenamientoSeleccionado(entrada)}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="historial-fecha">
                      <span className="fecha-dia">
                        {new Date(entrada.fecha).getDate()}
                      </span>
                      <span className="fecha-mes">
                        {new Date(entrada.fecha).toLocaleDateString('es-AR', { month: 'short' })}
                      </span>
                    </div>
                    <div className="historial-info">
                      <h4>{entrada.nombreRutina}</h4>
                      <div className="historial-stats">
                        <span>⏱️ {formatearTiempo(entrada.duracion)}</span>
                        <span>💪 {entrada.ejerciciosCompletados}/{entrada.ejerciciosTotales}</span>
                        <span>📦 {entrada.volumenTotal}kg</span>
                      </div>
                    </div>
                    <div className="historial-status">
                      {entrada.ejerciciosCompletados === entrada.ejerciciosTotales ? (
                        <span className="status-completo">✓</span>
                      ) : (
                        <span className="status-parcial">
                          {Math.round((entrada.ejerciciosCompletados / entrada.ejerciciosTotales) * 100)}%
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="historial-vacio">
                <p>Este alumno aún no tiene entrenamientos registrados</p>
              </div>
            )}
          </motion.section>
        )}

        {tabActiva === 'progreso' && (
          <motion.section
            key="progreso"
            className="tab-content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <HistorialSemanal alumnoId={id} />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Modal de detalle del entrenamiento */}
      <AnimatePresence>
        {entrenamientoSeleccionado && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setEntrenamientoSeleccionado(null); setConfirmandoEliminar(false); }}
          >
            <motion.div
              className="modal-detalle-entrenamiento"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>{entrenamientoSeleccionado.nombreRutina}</h3>
                <button
                  className="btn-cerrar-modal"
                  onClick={() => { setEntrenamientoSeleccionado(null); setConfirmandoEliminar(false); }}
                >
                  ✕
                </button>
              </div>

              <div className="modal-fecha">
                {new Date(entrenamientoSeleccionado.fecha).toLocaleDateString('es-AR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </div>

              <div className="modal-stats-resumen">
                <div className="stat-mini">
                  <span className="stat-valor">{formatearTiempo(entrenamientoSeleccionado.duracion)}</span>
                  <span className="stat-label">Duración</span>
                </div>
                <div className="stat-mini">
                  <span className="stat-valor">{entrenamientoSeleccionado.volumenTotal}kg</span>
                  <span className="stat-label">Volumen</span>
                </div>
              </div>

              <div className="modal-ejercicios">
                <h4>Detalle de ejercicios</h4>
                {entrenamientoSeleccionado.detalles?.ejercicios ? (
                  entrenamientoSeleccionado.detalles.ejercicios.map((ej, ejIndex) => (
                    <div key={ejIndex} className={`ejercicio-detalle ${ej.completado ? 'completado' : ''}`}>
                      <div className="ejercicio-header">
                        <span className="ejercicio-nombre">{ej.nombre}</span>
                        <span className={`ejercicio-estado ${ej.completado ? 'ok' : 'pendiente'}`}>
                          {ej.completado ? '✓' : '○'}
                        </span>
                      </div>
                      <div className="series-tabla">
                        <div className="series-header">
                          <span>Serie</span>
                          <span>Peso</span>
                          <span>Reps</span>
                          <span>RIR</span>
                        </div>
                        {ej.series.map((serie, sIndex) => (
                          <div
                            key={sIndex}
                            className={`serie-fila ${serie.completada ? 'completada' : ''}`}
                          >
                            <span className="serie-numero">{serie.numero}</span>
                            <span className="serie-peso">
                              {serie.completada ? (
                                <>
                                  <strong>{serie.pesoReal ?? serie.pesoObjetivo}kg</strong>
                                  {serie.pesoReal !== serie.pesoObjetivo && serie.pesoReal !== null && (
                                    <small className="objetivo">({serie.pesoObjetivo}kg)</small>
                                  )}
                                </>
                              ) : (
                                <span className="no-data">{serie.pesoObjetivo}kg</span>
                              )}
                            </span>
                            <span className="serie-reps">
                              {serie.completada ? (
                                <>
                                  <strong>{serie.repsReal ?? serie.repsObjetivo}</strong>
                                  {serie.repsReal !== serie.repsObjetivo && serie.repsReal !== null && (
                                    <small className="objetivo">({serie.repsObjetivo})</small>
                                  )}
                                </>
                              ) : (
                                <span className="no-data">{serie.repsObjetivo}</span>
                              )}
                            </span>
                            <span className="serie-rir">
                              {serie.completada && serie.rir !== null ? (
                                <strong>{serie.rir}</strong>
                              ) : (
                                <span className="no-data">-</span>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="sin-detalles">No hay detalles disponibles para este entrenamiento</p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="modal-acciones">
                {confirmandoEliminar ? (
                  <div className="confirmar-eliminar">
                    <p>¿Eliminar este entrenamiento del historial?</p>
                    <div className="confirmar-btns">
                      <button
                        className="btn-cancelar-eliminar"
                        onClick={() => setConfirmandoEliminar(false)}
                        disabled={eliminando}
                      >
                        Cancelar
                      </button>
                      <button
                        className="btn-confirmar-eliminar"
                        onClick={handleEliminar}
                        disabled={eliminando}
                      >
                        {eliminando ? 'Eliminando...' : 'Sí, eliminar'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className="btn-eliminar-entrenamiento"
                      onClick={() => setConfirmandoEliminar(true)}
                    >
                      Eliminar del historial
                    </button>
                    <button
                      className="btn-cerrar"
                      onClick={() => { setEntrenamientoSeleccionado(null); setConfirmandoEliminar(false); }}
                    >
                      Cerrar
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default PerfilAlumno;
