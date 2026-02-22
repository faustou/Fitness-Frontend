import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAlumnos, diasSemana, crearInvitacion, getProfesoresPendientes } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './styles/hub-profesor.css';

function HubProfesor() {
  const navigate = useNavigate();
  const { logout, perfil, esAdmin } = useAuth();
  const [busqueda, setBusqueda] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [pendientesCount, setPendientesCount] = useState(0);

  // Modal de nuevo alumno
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoAlumno, setNuevoAlumno] = useState({ email: '', nombre: '' });
  const [enviando, setEnviando] = useState(false);
  const [mensajeModal, setMensajeModal] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    const cargarAlumnos = async () => {
      try {
        setCargando(true);
        const data = await getAlumnos(perfil?.id);
        setAlumnos(data);
      } catch (err) {
        setError('Error al cargar alumnos');
      } finally {
        setCargando(false);
      }
    };

    cargarAlumnos();

    if (esAdmin) {
      getProfesoresPendientes()
        .then(data => setPendientesCount(data.length))
        .catch(() => {});
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const alumnosFiltrados = alumnos.filter(alumno =>
    alumno.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    alumno.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Obtener iniciales del nombre
  const getIniciales = (nombre) => {
    return nombre
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Formatear días de entrenamiento
  const formatearDias = (dias) => {
    if (!dias || dias.length === 0) return 'Sin definir';
    return dias.map(d => diasSemana[d]?.slice(0, 3)).filter(Boolean).join(', ');
  };

  // Calcular porcentaje de asistencia
  const calcularAsistencia = (stats) => {
    if (stats.rutinasTotales === 0) return 0;
    return Math.round((stats.rutinasCompletadas / stats.rutinasTotales) * 100);
  };

  // Manejar creación de invitación
  const handleCrearInvitacion = async (e) => {
    e.preventDefault();
    if (!nuevoAlumno.email || !nuevoAlumno.nombre) {
      setMensajeModal({ tipo: 'error', texto: 'Completá todos los campos' });
      return;
    }

    setEnviando(true);
    setMensajeModal({ tipo: '', texto: '' });

    try {
      await crearInvitacion({
        email: nuevoAlumno.email,
        nombre: nuevoAlumno.nombre,
        profesorId: perfil?.id,
      });
      setMensajeModal({
        tipo: 'exito',
        texto: `¡Listo! ${nuevoAlumno.nombre} fue agregado. Ahora podés enviarle el link de registro.`,
        linkRegistro: `${window.location.origin}/registro`,
      });
      setNuevoAlumno({ email: '', nombre: '' });
      // Recargar lista
      const data = await getAlumnos(perfil?.id);
      setAlumnos(data);
    } catch (err) {
      setMensajeModal({
        tipo: 'error',
        texto: err.message || 'Error al crear invitación'
      });
    } finally {
      setEnviando(false);
    }
  };

  // Cerrar modal
  const cerrarModal = () => {
    setMostrarModal(false);
    setNuevoAlumno({ email: '', nombre: '' });
    setMensajeModal({ tipo: '', texto: '' });
  };

  return (
    <div className="hub-profesor">
      {/* Header */}
      <header className="profesor-header">
        <div className="header-left">
          <h1>Mis Alumnos</h1>
          <span className="contador-alumnos">{alumnos.length} alumnos</span>
        </div>
        <div className="header-actions">
          {esAdmin && (
            <motion.button
              className="btn-admin"
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/profesores')}
              title="Panel de administración"
            >
              Profesores
              {pendientesCount > 0 && (
                <span className="btn-admin-badge">{pendientesCount}</span>
              )}
            </motion.button>
          )}
          <motion.button
            className="btn-agregar-alumno"
            whileTap={{ scale: 0.95 }}
            onClick={() => setMostrarModal(true)}
          >
            + Nuevo Alumno
          </motion.button>
          <motion.button
            className="btn-logout"
            onClick={handleLogout}
            whileTap={{ scale: 0.95 }}
            title="Cerrar sesión"
          >
            🚪
          </motion.button>
        </div>
      </header>

      {/* Barra de búsqueda */}
      <div className="busqueda-container">
        <input
          type="text"
          placeholder="Buscar alumno..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-busqueda"
        />
      </div>

      {/* Lista de alumnos */}
      <div className="lista-alumnos">
        {cargando && (
          <div className="loading-alumnos">
            <div className="loading-spinner"></div>
            <p>Cargando alumnos...</p>
          </div>
        )}

        {error && (
          <div className="error-alumnos">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Reintentar</button>
          </div>
        )}

        {!cargando && !error && alumnosFiltrados.map((alumno, index) => (
          <motion.div
            key={alumno.id}
            className={`alumno-card ${alumno.pendiente ? 'pendiente' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              // Navegar al perfil del alumno (tanto registrado como pendiente)
              navigate(`/profesor/alumno/${alumno.id}`);
            }}
          >
            {/* Avatar */}
            <div className={`alumno-avatar ${alumno.pendiente ? 'pendiente' : ''}`}>
              {alumno.avatar ? (
                <img src={alumno.avatar} alt={alumno.nombre} />
              ) : (
                <span>{getIniciales(alumno.nombre)}</span>
              )}
            </div>

            {/* Info principal */}
            <div className="alumno-info">
              <div className="alumno-nombre-container">
                <h3 className="alumno-nombre">{alumno.nombre}</h3>
                {alumno.pendiente && (
                  <span className="badge-pendiente">Pendiente</span>
                )}
              </div>
              <p className="alumno-objetivo">{alumno.pendiente ? alumno.email : alumno.objetivo}</p>
              {!alumno.pendiente && (
                <div className="alumno-dias">
                  <span className="dias-label">Entrena:</span>
                  <span className="dias-valor">{formatearDias(alumno.diasSemana)}</span>
                </div>
              )}
            </div>

            {/* Stats (solo si no está pendiente) */}
            {!alumno.pendiente && (
              <div className="alumno-stats">
                <div className="stat">
                  <span className="stat-valor">{calcularAsistencia(alumno.estadisticas)}%</span>
                  <span className="stat-label">Asistencia</span>
                </div>
                <div className="stat">
                  <span className="stat-valor">{alumno.estadisticas.racha}</span>
                  <span className="stat-label">Racha</span>
                </div>
              </div>
            )}

            {/* Flecha */}
            <div className="alumno-arrow">{alumno.pendiente ? '⏳' : '→'}</div>
          </motion.div>
        ))}

        {!cargando && !error && alumnosFiltrados.length === 0 && (
          <div className="no-resultados">
            <p>No se encontraron alumnos</p>
          </div>
        )}
      </div>

      {/* Modal Nuevo Alumno */}
      <AnimatePresence>
        {mostrarModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cerrarModal}
          >
            <motion.div
              className="modal-content"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Agregar Nuevo Alumno</h2>
                <button className="modal-close" onClick={cerrarModal}>×</button>
              </div>

              <form onSubmit={handleCrearInvitacion} className="modal-form">
                {!mensajeModal.linkRegistro && (
                  <>
                    <div className="form-group">
                      <label htmlFor="nombre">Nombre del alumno</label>
                      <input
                        type="text"
                        id="nombre"
                        value={nuevoAlumno.nombre}
                        onChange={(e) => setNuevoAlumno(prev => ({ ...prev, nombre: e.target.value }))}
                        placeholder="Ej: Franco García"
                        disabled={enviando}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email del alumno</label>
                      <input
                        type="email"
                        id="email"
                        value={nuevoAlumno.email}
                        onChange={(e) => setNuevoAlumno(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="alumno@email.com"
                        disabled={enviando}
                      />
                    </div>
                  </>
                )}

                {mensajeModal.texto && (
                  <div className={`modal-mensaje ${mensajeModal.tipo}`}>
                    {mensajeModal.texto}
                  </div>
                )}

                {mensajeModal.linkRegistro && (
                  <div className="link-registro-container">
                    <p className="link-label">Link de registro:</p>
                    <div className="link-box">
                      <span className="link-text">{mensajeModal.linkRegistro}</span>
                      <button
                        type="button"
                        className="btn-copiar"
                        onClick={() => {
                          navigator.clipboard.writeText(mensajeModal.linkRegistro);
                          alert('Link copiado!');
                        }}
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                )}

                {!mensajeModal.linkRegistro && (
                  <div className="modal-info">
                    <p>El alumno deberá registrarse en la app con este email para ver sus rutinas.</p>
                  </div>
                )}

                <div className="modal-actions">
                  {mensajeModal.linkRegistro ? (
                    <button type="button" className="btn-crear" onClick={cerrarModal} style={{flex: 1}}>
                      Listo
                    </button>
                  ) : (
                    <>
                      <button type="button" className="btn-cancelar" onClick={cerrarModal} disabled={enviando}>
                        Cancelar
                      </button>
                      <button type="submit" className="btn-crear" disabled={enviando}>
                        {enviando ? 'Creando...' : 'Crear Alumno'}
                      </button>
                    </>
                  )}
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HubProfesor;
