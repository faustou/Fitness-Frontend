import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getMisRutinas, diasSemana, getEntrenamientosSemanaActual, getRachaAlumno } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import ImageCropper from '../shared/ImageCropper';
import './styles/hub-alumno.css';

function HubAlumno() {
  const navigate = useNavigate();
  const { perfil, logout, actualizarAvatar } = useAuth();
  const [rutinas, setRutinas] = useState({});
  const [diasCompletados, setDiasCompletados] = useState([]);
  const [racha, setRacha] = useState(0);
  const [cicloInfo, setCicloInfo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarMenuPerfil, setMostrarMenuPerfil] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [imagenParaRecortar, setImagenParaRecortar] = useState(null);
  const [mostrarCropper, setMostrarCropper] = useState(false);

  // Manejar selección de imagen - abre el cropper
  const handleSeleccionarFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      alert('Solo se permiten imágenes');
      return;
    }
    // Validar tamaño (max 5MB para la original)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no puede superar 5MB');
      return;
    }

    // Mostrar el cropper
    setImagenParaRecortar(URL.createObjectURL(file));
    setMostrarCropper(true);
    setMostrarMenuPerfil(false);
    // Limpiar input
    e.target.value = '';
  };

  // Cuando el usuario confirma el recorte
  const handleCropComplete = async (croppedFile) => {
    setMostrarCropper(false);
    setSubiendoFoto(true);

    try {
      await actualizarAvatar(croppedFile);
    } catch (err) {
      console.error('Error actualizando avatar:', err);
      alert('Error al subir la imagen');
    } finally {
      setSubiendoFoto(false);
      // Limpiar imagen temporal
      if (imagenParaRecortar) {
        URL.revokeObjectURL(imagenParaRecortar);
        setImagenParaRecortar(null);
      }
    }
  };

  // Cancelar el recorte
  const handleCropCancel = () => {
    setMostrarCropper(false);
    if (imagenParaRecortar) {
      URL.revokeObjectURL(imagenParaRecortar);
      setImagenParaRecortar(null);
    }
  };

  // Obtener día actual de la semana (0=Dom, 1=Lun, etc.)
  const diaHoy = new Date().getDay();

  useEffect(() => {
    const cargarDatos = async () => {
      if (!perfil?.id) return;

      try {
        setCargando(true);
        const [rutinasResponse, entrenamientosSemana, rachaData] = await Promise.all([
          getMisRutinas(perfil.id),
          getEntrenamientosSemanaActual(perfil.id),
          getRachaAlumno(perfil.id),
        ]);
        // getMisRutinas ahora retorna { rutinas, ciclo }
        setRutinas(rutinasResponse.rutinas || rutinasResponse);
        setCicloInfo(rutinasResponse.ciclo || null);
        setDiasCompletados(entrenamientosSemana);
        setRacha(rachaData);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError('Error al cargar tus rutinas');
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [perfil?.id]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const fechaFormateada = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // Días de entrenamiento (Lunes a Sábado = 1 a 6)
  const diasEntrenamiento = [1, 2, 3, 4, 5, 6];

  // Contar rutinas asignadas
  const rutinasAsignadas = Object.keys(rutinas).length;

  // Contar entrenamientos completados esta semana (usando Set para evitar duplicados)
  const diasCompletadosUnicos = [...new Set(diasCompletados)];
  const entrenamientosCompletados = diasCompletadosUnicos.filter(dia =>
    rutinas[dia] !== undefined
  ).length;

  // Verificar si un día específico fue completado esta semana
  const diaCompletado = (dia) => diasCompletadosUnicos.includes(dia);

  // Rutina de hoy (si existe)
  const rutinaHoy = rutinas[diaHoy];

  if (cargando) {
    return (
      <div className="hub-alumno">
        <div className="hub-loading">
          <div className="loading-spinner"></div>
          <p>Cargando tus rutinas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hub-alumno">
      {/* Header */}
      <header className="hub-header">
        <div className="hub-saludo">
          <h1>¡Hola{perfil?.nombre ? `, ${perfil.nombre.split(' ')[0]}` : ''}!</h1>
          <p className="hub-fecha">{fechaFormateada}</p>
        </div>
        <div className="hub-header-actions">
          <div className="perfil-menu-container">
            <motion.button
              className="perfil-avatar-btn"
              onClick={() => setMostrarMenuPerfil(!mostrarMenuPerfil)}
              whileTap={{ scale: 0.95 }}
            >
              {perfil?.avatar_url ? (
                <img src={perfil.avatar_url} alt={perfil.nombre} className="perfil-avatar-img" />
              ) : (
                <span className="perfil-avatar-placeholder">
                  {perfil?.nombre?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </motion.button>
            {mostrarMenuPerfil && (
              <>
                <div
                  className="perfil-menu-overlay"
                  onClick={() => setMostrarMenuPerfil(false)}
                />
                <motion.div
                  className="perfil-menu-dropdown"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="perfil-menu-info">
                    <span className="perfil-menu-nombre">{perfil?.nombre}</span>
                    <span className="perfil-menu-email">{perfil?.email}</span>
                  </div>
                  <label className="perfil-menu-item">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSeleccionarFoto}
                      disabled={subiendoFoto}
                      style={{ display: 'none' }}
                    />
                    {subiendoFoto ? 'Subiendo...' : 'Cambiar foto'}
                  </label>
                  <button
                    className="perfil-menu-logout"
                    onClick={handleLogout}
                  >
                    Cerrar sesión
                  </button>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </header>

      {error && (
        <div className="hub-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      )}

      {/* Banner de Ciclo Mensual */}
      {cicloInfo?.activo && (
        <section className={`hub-ciclo-info ${cicloInfo.esDescarga ? 'es-descarga' : ''}`}>
          <div className="ciclo-semana-actual">
            <span className="ciclo-label">Semana del ciclo</span>
            <span className="ciclo-numero">{cicloInfo.semanaActual}/4</span>
          </div>
          {cicloInfo.esDescarga && (
            <div className="ciclo-descarga-banner">
              <span className="descarga-icon">🌿</span>
              <div className="descarga-texto">
                <strong>Semana de Descarga</strong>
                <span>Cargas reducidas para recuperar</span>
              </div>
            </div>
          )}
          <div className="ciclo-progreso">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`ciclo-dot ${s <= cicloInfo.semanaActual ? 'completada' : ''} ${s === cicloInfo.semanaDescarga ? 'descarga' : ''}`}
              />
            ))}
          </div>
        </section>
      )}

      {/* Card de rutina de hoy (si existe) */}
      {rutinaHoy && (
        <motion.div
          className="hub-card-hoy"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate(`/mi-rutina/${diaHoy}`)}
        >
          <div className="card-badge-hoy">HOY</div>
          <div className="card-icono">💪</div>
          <div className="card-contenido">
            <h2>Entrenamiento de hoy</h2>
            <p className="card-rutina-nombre">{rutinaHoy.nombre}</p>
            <div className="card-stats">
              <span>{rutinaHoy.ejercicios.length} ejercicios</span>
            </div>
          </div>
          <div className="card-flecha">→</div>
        </motion.div>
      )}

      {/* Sin rutina para hoy */}
      {!rutinaHoy && !cargando && (
        <div className="hub-sin-rutina-hoy">
          <span className="sin-rutina-icono">😴</span>
          <p>Hoy es día de descanso</p>
          <span className="sin-rutina-hint">Seleccioná otro día para entrenar</span>
        </div>
      )}

      {/* Semana completa */}
      <section className="hub-semana">
        <h3>Tu semana de entrenamiento</h3>

        {rutinasAsignadas === 0 ? (
          <div className="hub-sin-rutinas">
            <span className="sin-rutinas-icono">📋</span>
            <p>Todavía no tenés rutinas asignadas</p>
            <span className="sin-rutinas-hint">Tu profesor te asignará rutinas pronto</span>
          </div>
        ) : (
          <div className="semana-grid">
            {diasEntrenamiento.map((dia) => {
              const rutinaDia = rutinas[dia];
              const esHoy = dia === diaHoy;
              const tieneRutina = !!rutinaDia;

              return (
                <motion.div
                  key={dia}
                  className={`dia-card ${esHoy ? 'es-hoy' : ''} ${tieneRutina ? 'tiene-rutina' : 'sin-rutina'} ${diaCompletado(dia) ? 'completado' : ''}`}
                  whileTap={tieneRutina ? { scale: 0.98 } : {}}
                  onClick={() => tieneRutina && navigate(`/mi-rutina/${dia}`)}
                >
                  <div className="dia-header">
                    <span className="dia-nombre">{diasSemana[dia].slice(0, 3)}</span>
                    {esHoy && <span className="badge-hoy">Hoy</span>}
                    {diaCompletado(dia) && <span className="badge-completado">✓</span>}
                  </div>

                  {tieneRutina ? (
                    <div className="dia-contenido">
                      <span className="dia-rutina-nombre">{rutinaDia.nombre}</span>
                      <span className="dia-ejercicios">{rutinaDia.ejercicios.length} ej.</span>
                    </div>
                  ) : (
                    <div className="dia-contenido dia-descanso">
                      <span className="descanso-icono">😴</span>
                      <span className="descanso-texto">Descanso</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Preview de próxima rutina (si hoy es descanso) */}
      {!rutinaHoy && rutinasAsignadas > 0 && (
        <section className="hub-proxima">
          <h3>Próximo entrenamiento</h3>
          {(() => {
            // Encontrar próximo día con rutina
            for (let i = 1; i <= 7; i++) {
              const proximoDia = ((diaHoy + i - 1) % 6) + 1; // Solo días 1-6
              if (rutinas[proximoDia]) {
                const rutina = rutinas[proximoDia];
                return (
                  <motion.div
                    className="proxima-card"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/mi-rutina/${proximoDia}`)}
                  >
                    <div className="proxima-dia">{diasSemana[proximoDia]}</div>
                    <div className="proxima-info">
                      <span className="proxima-nombre">{rutina.nombre}</span>
                      <span className="proxima-ejercicios">{rutina.ejercicios.length} ejercicios</span>
                    </div>
                    <div className="proxima-flecha">→</div>
                  </motion.div>
                );
              }
            }
            return null;
          })()}
        </section>
      )}

      {/* Progreso semanal */}
      {rutinasAsignadas > 0 && (
        <section className="hub-progreso-semanal">
          <h3>Progreso de esta semana</h3>
          <div className="progreso-card">
            <div className="progreso-numero">
              <span className="progreso-actual">{entrenamientosCompletados}</span>
              <span className="progreso-separador">/</span>
              <span className="progreso-total">{rutinasAsignadas}</span>
            </div>
            <span className="progreso-label">entrenamientos completados</span>
            <div className="progreso-barra">
              <div
                className="progreso-fill"
                style={{ width: `${rutinasAsignadas > 0 ? (entrenamientosCompletados / rutinasAsignadas) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        </section>
      )}

      {/* Panel de Racha */}
      <section className="hub-racha">
        <motion.div
          className={`racha-card ${racha >= 7 ? 'racha-fire' : racha >= 3 ? 'racha-good' : ''}`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="racha-icon-container">
            <span className="racha-icon">{racha >= 7 ? '🔥' : racha >= 3 ? '💪' : '⚡'}</span>
            {racha >= 7 && <div className="racha-glow"></div>}
          </div>
          <div className="racha-content">
            <span className="racha-numero">{racha}</span>
            <span className="racha-label">{racha === 1 ? 'día de racha' : 'días de racha'}</span>
          </div>
          <div className="racha-mensaje">
            {racha === 0 && '¡Empezá hoy tu racha!'}
            {racha >= 1 && racha < 3 && '¡Buen comienzo!'}
            {racha >= 3 && racha < 7 && '¡Vas muy bien!'}
            {racha >= 7 && racha < 14 && '¡Increíble constancia!'}
            {racha >= 14 && racha < 30 && '¡Sos imparable!'}
            {racha >= 30 && '¡Leyenda del gym!'}
          </div>
        </motion.div>
      </section>

      {/* Stats rápidas */}
      {rutinasAsignadas > 0 && (
        <section className="hub-stats">
          <div className="stat-mini">
            <span className="stat-numero">{rutinasAsignadas}</span>
            <span className="stat-label">días de entreno</span>
          </div>
          <div className="stat-mini">
            <span className="stat-numero">{7 - rutinasAsignadas}</span>
            <span className="stat-label">días descanso</span>
          </div>
        </section>
      )}

      {/* Modal de recorte de imagen */}
      {mostrarCropper && imagenParaRecortar && (
        <ImageCropper
          imageSrc={imagenParaRecortar}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

export default HubAlumno;
