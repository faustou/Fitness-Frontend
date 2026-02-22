import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ejerciciosDB, getAllEjercicios } from '../../data/ejerciciosDB';
import { getAlumnoById, getRutinasAlumno, guardarRutina as guardarRutinaAPI, diasSemana, getCicloConfigAlumno, configurarCiclo, getMesActual, getNombreMes } from '../../services/api';
import './styles/editor-rutina.css';

function EditorRutina() {
  const { id: alumnoId, rutinaId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const diaParam = searchParams.get('dia');
  const mesParam = searchParams.get('mes') || getMesActual();
  const esNueva = rutinaId === 'nueva';

  // Estado para datos del alumno y rutinas
  const [alumno, setAlumno] = useState(null);
  const [rutinasExistentes, setRutinasExistentes] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Estado del editor
  const [nombreRutina, setNombreRutina] = useState('');
  const [ejerciciosSeleccionados, setEjerciciosSeleccionados] = useState([]);
  const [mostrarBiblioteca, setMostrarBiblioteca] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState('piernas');
  const [busqueda, setBusqueda] = useState('');
  // Valores temporales mientras se edita un input (para evitar parseInt en cada keystroke)
  const [editingValues, setEditingValues] = useState({});
  // Día de la rutina (para edición de rutinas existentes)
  const [diaRutina, setDiaRutina] = useState(diaParam);

  // Estado del ciclo mensual
  const [cicloActivo, setCicloActivo] = useState(false);
  const [semanaEditando, setSemanaEditando] = useState(1);
  const [semanaDescarga, setSemanaDescarga] = useState(4);

  // Cargar datos del alumno y rutinas
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setCargando(true);
        const [alumnoData, rutinasData, cicloConfig] = await Promise.all([
          getAlumnoById(alumnoId),
          getRutinasAlumno(alumnoId, mesParam),
          getCicloConfigAlumno(alumnoId),
        ]);
        setAlumno(alumnoData);
        setRutinasExistentes(rutinasData);
        // Cargar config del ciclo
        if (cicloConfig) {
          setCicloActivo(cicloConfig.activo || false);
          setSemanaDescarga(cicloConfig.semana_descarga || 4);
        }
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar datos del alumno');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [alumnoId]);

  // Normalizar reps: si es número lo convierte a array, si es array lo deja
  const normalizarReps = (reps, cantidadSeries) => {
    if (Array.isArray(reps)) {
      // Ajustar longitud si cambió la cantidad de series
      if (reps.length === cantidadSeries) return reps;
      if (reps.length > cantidadSeries) return reps.slice(0, cantidadSeries);
      // Si faltan, rellenar con el último valor
      const ultimo = reps[reps.length - 1] || 12;
      return [...reps, ...Array(cantidadSeries - reps.length).fill(ultimo)];
    }
    // Es un número: crear array con ese valor
    return Array(cantidadSeries).fill(typeof reps === 'number' ? reps : 12);
  };

  // Cargar rutina existente si es edición
  useEffect(() => {
    if (!cargando && !esNueva && rutinaId && Object.keys(rutinasExistentes).length > 0) {
      // Buscar la rutina en todos los días
      for (const dia of Object.keys(rutinasExistentes)) {
        const rutina = rutinasExistentes[dia];
        if (rutina && rutina.id === rutinaId) {
          setNombreRutina(rutina.nombre || '');
          setDiaRutina(dia); // Guardar el día de la rutina
          setEjerciciosSeleccionados(
            (rutina.ejercicios || []).map((ej, idx) => {
              const series = ej.series || 3;
              return {
                id: `${ej.ejercicioId}-${idx}`,
                ejercicioId: ej.ejercicioId,
                series,
                reps: normalizarReps(ej.reps, series),
                peso: ej.peso,
                descanso: ej.descanso,
                rir: ej.rir ?? 2,
                cargasSemana: ej.cargasSemana || null,
              };
            })
          );
          break;
        }
      }
    }
  }, [cargando, esNueva, rutinaId, rutinasExistentes]);

  // Obtener info del ejercicio desde la DB
  const getEjercicioInfo = (ejercicioId) => {
    const todos = getAllEjercicios();
    return todos.find(ej => ej.id === ejercicioId);
  };

  // Agregar ejercicio a la rutina
  const agregarEjercicio = (ejercicio) => {
    const seriesDefault = 3;
    const nuevoEjercicio = {
      id: `${ejercicio.id}-${Date.now()}`,
      ejercicioId: ejercicio.id,
      series: seriesDefault,
      reps: Array(seriesDefault).fill(12),
      peso: 0,
      descanso: 90,
      rir: 2,
    };
    setEjerciciosSeleccionados([...ejerciciosSeleccionados, nuevoEjercicio]);
    setMostrarBiblioteca(false);
  };

  // Eliminar ejercicio de la rutina
  const eliminarEjercicio = (id) => {
    setEjerciciosSeleccionados(ejerciciosSeleccionados.filter(ej => ej.id !== id));
  };

  // Manejar cambio de input (guarda valor raw sin parsear)
  const handleInputChange = (key, valor) => {
    setEditingValues(prev => ({ ...prev, [key]: valor }));
  };

  // Al perder foco: parsear, validar y aplicar al estado real
  const handleConfigBlur = (ejercicioId, campo) => {
    const key = `${ejercicioId}-${campo}`;
    const raw = editingValues[key];
    if (raw === undefined) return;

    // Limpiar el valor temporal
    setEditingValues(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    const nuevoValor = parseInt(raw) || 0;
    setEjerciciosSeleccionados(prev => prev.map(ej => {
      if (ej.id !== ejercicioId) return ej;
      if (campo === 'series') {
        const nuevaSeries = Math.max(1, Math.min(10, nuevoValor || 1));
        return {
          ...ej,
          series: nuevaSeries,
          reps: normalizarReps(ej.reps, nuevaSeries),
        };
      }
      return { ...ej, [campo]: nuevoValor };
    }));
  };

  // Al perder foco en un input de reps por serie
  const handleRepsSerieBlur = (ejercicioId, serieIndex) => {
    const key = `${ejercicioId}-rep-${serieIndex}`;
    const raw = editingValues[key];
    if (raw === undefined) return;

    setEditingValues(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    setEjerciciosSeleccionados(prev => prev.map(ej => {
      if (ej.id !== ejercicioId) return ej;
      const nuevasReps = [...ej.reps];
      nuevasReps[serieIndex] = Math.max(1, parseInt(raw) || 1);
      return { ...ej, reps: nuevasReps };
    }));
  };

  // Obtener valor a mostrar: el temporal (raw) si existe, o el real
  const getInputValue = (ejercicioId, campo, valorReal) => {
    const key = `${ejercicioId}-${campo}`;
    return editingValues[key] !== undefined ? editingValues[key] : valorReal;
  };

  const getRepSerieValue = (ejercicioId, serieIndex, valorReal) => {
    const key = `${ejercicioId}-rep-${serieIndex}`;
    return editingValues[key] !== undefined ? editingValues[key] : valorReal;
  };

  // Obtener peso para una semana específica
  const getPesoSemana = (ejercicio, semana) => {
    if (!cicloActivo) return ejercicio.peso;
    if (ejercicio.cargasSemana && ejercicio.cargasSemana[semana]) {
      return ejercicio.cargasSemana[semana].peso ?? ejercicio.peso;
    }
    return ejercicio.peso;
  };

  // Obtener reps para una semana específica
  const getRepsSemana = (ejercicio, semana) => {
    if (!cicloActivo) return ejercicio.reps;
    if (ejercicio.cargasSemana && ejercicio.cargasSemana[semana]?.reps) {
      return ejercicio.cargasSemana[semana].reps;
    }
    return ejercicio.reps;
  };

  // Obtener valor de una rep específica para una semana
  const getRepSerieSemanaValue = (ejercicioId, serieIndex, ejercicio) => {
    const key = `${ejercicioId}-rep-s${semanaEditando}-${serieIndex}`;
    if (editingValues[key] !== undefined) return editingValues[key];
    const reps = getRepsSemana(ejercicio, semanaEditando);
    return reps[serieIndex] ?? 12;
  };

  // Manejar cambio de peso para una semana específica
  const handlePesoSemanaBlur = (ejercicioId, semana) => {
    const key = `${ejercicioId}-peso-s${semana}`;
    const raw = editingValues[key];
    if (raw === undefined) return;

    setEditingValues(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    const nuevoValor = parseInt(raw) || 0;
    setEjerciciosSeleccionados(prev => prev.map(ej => {
      if (ej.id !== ejercicioId) return ej;

      const cargasSemana = { ...(ej.cargasSemana || {}) };
      cargasSemana[semana] = {
        ...(cargasSemana[semana] || {}),
        peso: nuevoValor,
      };

      return {
        ...ej,
        cargasSemana,
        // Si es semana 1, también actualizar peso base
        peso: semana === 1 ? nuevoValor : ej.peso,
      };
    }));
  };

  // Manejar cambio de reps para una semana específica
  const handleRepsSemanaBlur = (ejercicioId, serieIndex, semana) => {
    const key = `${ejercicioId}-rep-s${semana}-${serieIndex}`;
    const raw = editingValues[key];
    if (raw === undefined) return;

    setEditingValues(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });

    const nuevoValor = Math.max(1, parseInt(raw) || 1);
    setEjerciciosSeleccionados(prev => prev.map(ej => {
      if (ej.id !== ejercicioId) return ej;

      const cargasSemana = { ...(ej.cargasSemana || {}) };
      const repsActuales = getRepsSemana(ej, semana);
      const nuevasReps = [...repsActuales];
      nuevasReps[serieIndex] = nuevoValor;

      cargasSemana[semana] = {
        ...(cargasSemana[semana] || {}),
        reps: nuevasReps,
      };

      return {
        ...ej,
        cargasSemana,
        // Si es semana 1, también actualizar reps base
        reps: semana === 1 ? nuevasReps : ej.reps,
      };
    }));
  };

  // Auto-calcular semana de descarga (65% de semana 3)
  const calcularDescarga = () => {
    setEjerciciosSeleccionados(prev => prev.map(ej => {
      const pesoSemana3 = getPesoSemana(ej, 3);
      const pesoDescarga = Math.round(pesoSemana3 * 0.65);

      const cargasSemana = { ...(ej.cargasSemana || {}) };
      cargasSemana[semanaDescarga] = {
        ...(cargasSemana[semanaDescarga] || {}),
        peso: pesoDescarga,
      };

      return { ...ej, cargasSemana };
    }));
  };

  // Toggle ciclo y guardar config
  const handleToggleCiclo = async (nuevoEstado) => {
    setCicloActivo(nuevoEstado);
    try {
      await configurarCiclo(alumnoId, {
        activo: nuevoEstado,
        semana_descarga: semanaDescarga,
        duracion_semanas: 4,
      });
    } catch (err) {
      console.error('Error guardando config ciclo:', err);
    }
  };

  // Cambiar semana de descarga
  const handleCambiarSemanaDescarga = async (nuevaSemana) => {
    setSemanaDescarga(nuevaSemana);
    if (cicloActivo) {
      try {
        await configurarCiclo(alumnoId, {
          activo: true,
          semana_descarga: nuevaSemana,
          duracion_semanas: 4,
        });
      } catch (err) {
        console.error('Error guardando semana descarga:', err);
      }
    }
  };

  // Guardar rutina
  const guardarRutina = async () => {
    const diaGuardar = diaRutina || diaParam;
    if (!diaGuardar || ejerciciosSeleccionados.length === 0) return;

    setGuardando(true);
    try {
      const rutina = {
        nombre: nombreRutina || `Rutina ${diasSemana[diaGuardar]}`,
        ejercicios: ejerciciosSeleccionados.map(ej => ({
          ejercicioId: ej.ejercicioId,
          series: ej.series,
          reps: ej.reps,
          peso: ej.peso,
          descanso: ej.descanso,
          rir: ej.rir,
          cargasSemana: cicloActivo ? ej.cargasSemana : null,
        })),
      };

      await guardarRutinaAPI(alumnoId, parseInt(diaGuardar), rutina, mesParam);
      navigate(`/profesor/alumno/${alumnoId}`);
    } catch (err) {
      console.error('Error guardando rutina:', err);
      alert('Error al guardar la rutina. Intentá de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  // Filtrar ejercicios por categoría y búsqueda
  const ejerciciosFiltrados = ejerciciosDB[categoriaActiva]?.filter(ej =>
    ej.nombre.toLowerCase().includes(busqueda.toLowerCase())
  ) || [];

  // Categorías disponibles
  const categorias = [
    { id: 'piernas', nombre: 'Piernas' },
    { id: 'espalda', nombre: 'Espalda' },
    { id: 'brazosHombros', nombre: 'Brazos' },
    { id: 'pechoAbdomen', nombre: 'Pecho' },
    { id: 'movilidad', nombre: 'Movilidad' },
  ];

  if (cargando) {
    return (
      <div className="editor-rutina">
        <div className="loading-editor">
          <div className="loading-spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (error || !alumno) {
    return (
      <div className="editor-rutina">
        <div className="error-editor">
          <p>{error || 'Alumno no encontrado'}</p>
          <button onClick={() => navigate('/profesor')}>Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-rutina">
      {/* Header */}
      <header className="editor-header">
        <motion.button
          className="btn-cancelar"
          onClick={() => navigate(`/profesor/alumno/${alumnoId}`)}
          whileTap={{ scale: 0.95 }}
        >
          Cancelar
        </motion.button>
        <h2>{esNueva ? 'Nueva Rutina' : 'Editar Rutina'}</h2>
        <motion.button
          className="btn-guardar"
          onClick={guardarRutina}
          whileTap={{ scale: 0.95 }}
          disabled={ejerciciosSeleccionados.length === 0 || guardando}
        >
          {guardando ? 'Guardando...' : 'Guardar'}
        </motion.button>
      </header>

      {/* Info básica */}
      <section className="editor-info">
        <div className="info-row">
          <div className="info-alumno">
            <span className="label">Alumno:</span>
            <span className="valor">{alumno.nombre}</span>
          </div>
          {(diaRutina || diaParam) && (
            <div className="info-dia">
              <span className="label">Día:</span>
              <span className="valor">{diasSemana[diaRutina || diaParam]}</span>
            </div>
          )}
          <div className="info-mes">
            <span className="label">Mes:</span>
            <span className="valor">{getNombreMes(mesParam)}</span>
          </div>
        </div>
        <input
          type="text"
          placeholder="Nombre de la rutina (ej: Tren Inferior A)"
          value={nombreRutina}
          onChange={(e) => setNombreRutina(e.target.value)}
          className="input-nombre-rutina"
        />

        {/* Configuración del ciclo mensual */}
        <div className="ciclo-config-section">
          <label className="ciclo-toggle-label">
            <input
              type="checkbox"
              checked={cicloActivo}
              onChange={(e) => handleToggleCiclo(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-text">Ciclo mensual (4 semanas)</span>
          </label>

          {cicloActivo && (
            <div className="ciclo-controls">
              {/* Tabs de semana */}
              <div className="semana-tabs">
                {[1, 2, 3, 4].map(semana => (
                  <button
                    key={semana}
                    type="button"
                    className={`tab-semana ${semanaEditando === semana ? 'activa' : ''} ${semana === semanaDescarga ? 'descarga' : ''}`}
                    onClick={() => setSemanaEditando(semana)}
                  >
                    S{semana}
                    {semana === semanaDescarga && <span className="badge-descarga">D</span>}
                  </button>
                ))}
              </div>

              {/* Selector de semana descarga */}
              <div className="descarga-selector">
                <label>Semana descarga:</label>
                <select
                  value={semanaDescarga}
                  onChange={(e) => handleCambiarSemanaDescarga(parseInt(e.target.value))}
                >
                  {[1, 2, 3, 4].map(s => (
                    <option key={s} value={s}>Semana {s}</option>
                  ))}
                </select>
              </div>

              {/* Botón auto-calcular */}
              <button
                type="button"
                className="btn-auto-descarga"
                onClick={calcularDescarga}
              >
                Auto-calcular descarga (65%)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Lista de ejercicios agregados */}
      <section className="ejercicios-agregados">
        <div className="seccion-header">
          <h3>Ejercicios ({ejerciciosSeleccionados.length})</h3>
          <span className="hint">Mantené presionado para reordenar</span>
        </div>

        {ejerciciosSeleccionados.length === 0 ? (
          <div className="lista-vacia">
            <p>No hay ejercicios agregados</p>
            <p className="hint">Agregá ejercicios desde la biblioteca</p>
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={ejerciciosSeleccionados}
            onReorder={setEjerciciosSeleccionados}
            className="lista-ejercicios"
          >
            {ejerciciosSeleccionados.map((ej, index) => {
              const info = getEjercicioInfo(ej.ejercicioId);
              return (
                <Reorder.Item
                  key={ej.id}
                  value={ej}
                  className="ejercicio-en-rutina"
                >
                  <div className="ejercicio-orden">{index + 1}</div>

                  <div className="ejercicio-info-mini">
                    {info?.gif && (
                      <img src={info.gif} alt={info?.nombre} className="ejercicio-thumb" />
                    )}
                    <div className="ejercicio-datos">
                      <span className="ejercicio-nombre-mini">{info?.nombre || ej.ejercicioId}</span>
                      <span className="ejercicio-dificultad-mini">{info?.dificultad}</span>
                    </div>
                  </div>

                  <div className="ejercicio-config">
                    <div className="config-grupo">
                      <label>Series</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={getInputValue(ej.id, 'series', ej.series)}
                        onChange={(e) => handleInputChange(`${ej.id}-series`, e.target.value)}
                        onBlur={() => handleConfigBlur(ej.id, 'series')}
                        min="1"
                        max="10"
                      />
                    </div>
                    <div className="config-grupo">
                      <label>Peso {cicloActivo && `(S${semanaEditando})`}</label>
                      {cicloActivo ? (
                        <input
                          type="number"
                          inputMode="numeric"
                          value={getInputValue(ej.id, `peso-s${semanaEditando}`, getPesoSemana(ej, semanaEditando))}
                          onChange={(e) => handleInputChange(`${ej.id}-peso-s${semanaEditando}`, e.target.value)}
                          onBlur={() => handlePesoSemanaBlur(ej.id, semanaEditando)}
                          min="0"
                          max="500"
                          className={semanaEditando === semanaDescarga ? 'input-descarga' : ''}
                        />
                      ) : (
                        <input
                          type="number"
                          inputMode="numeric"
                          value={getInputValue(ej.id, 'peso', ej.peso)}
                          onChange={(e) => handleInputChange(`${ej.id}-peso`, e.target.value)}
                          onBlur={() => handleConfigBlur(ej.id, 'peso')}
                          min="0"
                          max="500"
                        />
                      )}
                    </div>
                    <div className="config-grupo">
                      <label>Descanso</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={getInputValue(ej.id, 'descanso', ej.descanso)}
                        onChange={(e) => handleInputChange(`${ej.id}-descanso`, e.target.value)}
                        onBlur={() => handleConfigBlur(ej.id, 'descanso')}
                        min="0"
                        max="300"
                      />
                    </div>
                    <div className="config-grupo">
                      <label>RIR</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={getInputValue(ej.id, 'rir', ej.rir)}
                        onChange={(e) => handleInputChange(`${ej.id}-rir`, e.target.value)}
                        onBlur={() => handleConfigBlur(ej.id, 'rir')}
                        min="0"
                        max="10"
                      />
                    </div>
                  </div>

                  {/* Preview de cargas por semana cuando ciclo activo */}
                  {cicloActivo && (
                    <div className="semanas-preview">
                      <div className="peso-semanas-preview">
                        <span className="preview-label">Peso:</span>
                        {[1, 2, 3, 4].map(s => (
                          <span
                            key={s}
                            className={`peso-preview ${s === semanaDescarga ? 'descarga' : ''} ${s === semanaEditando ? 'editando' : ''}`}
                            onClick={() => setSemanaEditando(s)}
                          >
                            S{s}: {getPesoSemana(ej, s)}kg
                          </span>
                        ))}
                      </div>
                      <div className="reps-semanas-preview">
                        <span className="preview-label">Reps:</span>
                        {[1, 2, 3, 4].map(s => {
                          const reps = getRepsSemana(ej, s);
                          const repsStr = reps.join('-');
                          return (
                            <span
                              key={s}
                              className={`peso-preview ${s === semanaDescarga ? 'descarga' : ''} ${s === semanaEditando ? 'editando' : ''}`}
                              onClick={() => setSemanaEditando(s)}
                            >
                              S{s}: {repsStr}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Reps por serie */}
                  <div className="reps-por-serie">
                    <span className="reps-por-serie-label">
                      Reps por serie {cicloActivo && `(S${semanaEditando})`}
                    </span>
                    <div className="reps-por-serie-inputs">
                      {(cicloActivo ? getRepsSemana(ej, semanaEditando) : ej.reps).map((rep, sIdx) => (
                        <div key={sIdx} className="rep-serie-item">
                          <span className="rep-serie-num">S{sIdx + 1}</span>
                          {cicloActivo ? (
                            <input
                              type="number"
                              inputMode="numeric"
                              value={getRepSerieSemanaValue(ej.id, sIdx, ej)}
                              onChange={(e) => handleInputChange(`${ej.id}-rep-s${semanaEditando}-${sIdx}`, e.target.value)}
                              onBlur={() => handleRepsSemanaBlur(ej.id, sIdx, semanaEditando)}
                              min="1"
                              max="100"
                              className={`input-rep-serie ${semanaEditando === semanaDescarga ? 'input-descarga' : ''}`}
                            />
                          ) : (
                            <input
                              type="number"
                              inputMode="numeric"
                              value={getRepSerieValue(ej.id, sIdx, rep)}
                              onChange={(e) => handleInputChange(`${ej.id}-rep-${sIdx}`, e.target.value)}
                              onBlur={() => handleRepsSerieBlur(ej.id, sIdx)}
                              min="1"
                              max="100"
                              className="input-rep-serie"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <motion.button
                    className="btn-eliminar-ejercicio"
                    onClick={() => eliminarEjercicio(ej.id)}
                    whileTap={{ scale: 0.9 }}
                  >
                    ×
                  </motion.button>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}

        {/* Botón agregar */}
        <motion.button
          className="btn-agregar-ejercicio"
          onClick={() => setMostrarBiblioteca(true)}
          whileTap={{ scale: 0.98 }}
        >
          + Agregar ejercicio
        </motion.button>
      </section>

      {/* Modal Biblioteca de ejercicios */}
      <AnimatePresence>
        {mostrarBiblioteca && (
          <motion.div
            className="biblioteca-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMostrarBiblioteca(false)}
          >
            <motion.div
              className="biblioteca-modal"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="biblioteca-header">
                <h3>Biblioteca de Ejercicios</h3>
                <button
                  className="btn-cerrar-biblioteca"
                  onClick={() => setMostrarBiblioteca(false)}
                >
                  ×
                </button>
              </div>

              {/* Búsqueda */}
              <div className="biblioteca-busqueda-container">
                <input
                  type="text"
                  placeholder="Buscar ejercicio..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="biblioteca-busqueda"
                />
                <span className="biblioteca-busqueda-icon">🔍</span>
              </div>

              {/* Categorías */}
              <div className="biblioteca-categorias">
                {categorias.map(cat => (
                  <button
                    key={cat.id}
                    className={`cat-btn ${categoriaActiva === cat.id ? 'activa' : ''}`}
                    onClick={() => setCategoriaActiva(cat.id)}
                  >
                    {cat.nombre}
                  </button>
                ))}
              </div>

              {/* Lista de ejercicios */}
              <div className="biblioteca-lista">
                {ejerciciosFiltrados.length === 0 ? (
                  <div className="biblioteca-vacia">
                    <div className="biblioteca-vacia-icon">🏋️</div>
                    <p>No se encontraron ejercicios</p>
                  </div>
                ) : (
                  ejerciciosFiltrados.map((ejercicio) => {
                    const yaAgregado = ejerciciosSeleccionados.some(
                      ej => ej.ejercicioId === ejercicio.id
                    );
                    return (
                      <div
                        key={ejercicio.id}
                        className={`biblioteca-ejercicio ${yaAgregado ? 'agregado' : ''}`}
                        onClick={() => !yaAgregado && agregarEjercicio(ejercicio)}
                      >
                        <img src={ejercicio.gif} alt={ejercicio.nombre} className="biblioteca-gif" />
                        <div className="biblioteca-info">
                          <span className="biblioteca-nombre">{ejercicio.nombre}</span>
                          <span className="biblioteca-dificultad">{ejercicio.dificultad}</span>
                        </div>
                        {yaAgregado ? (
                          <span className="biblioteca-check">✓</span>
                        ) : (
                          <span className="biblioteca-add">+</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EditorRutina;
