import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getProfesoresPendientes, aprobarProfesor, rechazarProfesor } from '../../services/api';
import './styles/auth.css';

function AdminProfesores() {
  const navigate = useNavigate();
  const { esAdmin, perfil } = useAuth();
  const [profesores, setProfesores] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(null); // ID del profesor siendo procesado

  useEffect(() => {
    if (!esAdmin) {
      navigate('/');
      return;
    }
    cargarPendientes();
  }, [esAdmin]);

  const cargarPendientes = async () => {
    try {
      setCargando(true);
      const data = await getProfesoresPendientes();
      setProfesores(data);
    } catch (err) {
      console.error('Error cargando profesores pendientes:', err);
    } finally {
      setCargando(false);
    }
  };

  const handleAprobar = async (id, nombre) => {
    if (!confirm(`¿Aprobar a ${nombre} como profesor?`)) return;
    setProcesando(id);
    try {
      await aprobarProfesor(id);
      setProfesores(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Error al aprobar: ' + err.message);
    } finally {
      setProcesando(null);
    }
  };

  const handleRechazar = async (id, nombre) => {
    if (!confirm(`¿Rechazar la solicitud de ${nombre}? Esta acción le impedirá acceder como profesor.`)) return;
    setProcesando(id);
    try {
      await rechazarProfesor(id);
      setProfesores(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Error al rechazar: ' + err.message);
    } finally {
      setProcesando(null);
    }
  };

  const formatFecha = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  if (!esAdmin) return null;

  return (
    <div className="admin-container">
      <motion.div
        className="admin-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="admin-header">
          <div>
            <h1>Panel de Administración</h1>
            <p>Solicitudes de acceso como Profesor</p>
          </div>
          <button className="admin-back-btn" onClick={() => navigate('/profesor')}>
            ← Volver
          </button>
        </div>

        {/* Contador */}
        <div className="admin-stats-bar">
          <span className="admin-badge">
            {cargando ? '...' : profesores.length} pendiente{profesores.length !== 1 ? 's' : ''}
          </span>
          <button className="admin-refresh-btn" onClick={cargarPendientes} disabled={cargando}>
            {cargando ? 'Cargando...' : 'Actualizar'}
          </button>
        </div>

        {/* Lista */}
        <div className="admin-list">
          {cargando ? (
            <div className="admin-loading">
              <div className="loading-spinner"></div>
              <p>Cargando solicitudes...</p>
            </div>
          ) : profesores.length === 0 ? (
            <motion.div
              className="admin-empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="admin-empty-icon">✓</span>
              <p>No hay solicitudes pendientes</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {profesores.map(prof => (
                <motion.div
                  key={prof.id}
                  className="admin-card"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0, padding: 0 }}
                  transition={{ duration: 0.25 }}
                  layout
                >
                  {/* Avatar / iniciales */}
                  <div className="admin-card-avatar">
                    {prof.avatar_url ? (
                      <img src={prof.avatar_url} alt={prof.nombre} />
                    ) : (
                      <span>{prof.nombre?.charAt(0)?.toUpperCase() || '?'}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="admin-card-info">
                    <h3>{prof.nombre}</h3>
                    <p className="admin-card-email">{prof.email}</p>
                    <p className="admin-card-fecha">Solicitó el {formatFecha(prof.created_at)}</p>
                  </div>

                  {/* Acciones */}
                  <div className="admin-card-actions">
                    <motion.button
                      className="admin-btn-aprobar"
                      onClick={() => handleAprobar(prof.id, prof.nombre)}
                      disabled={procesando === prof.id}
                      whileTap={{ scale: 0.95 }}
                    >
                      {procesando === prof.id ? '...' : '✓ Aprobar'}
                    </motion.button>
                    <motion.button
                      className="admin-btn-rechazar"
                      onClick={() => handleRechazar(prof.id, prof.nombre)}
                      disabled={procesando === prof.id}
                      whileTap={{ scale: 0.95 }}
                    >
                      {procesando === prof.id ? '...' : '✕ Rechazar'}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </motion.div>

      <style>{`
        .admin-container {
          min-height: 100vh;
          background-color: #07181f;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 2rem 1rem;
        }
        .admin-panel {
          width: 100%;
          max-width: 680px;
          background-color: #112830;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        }
        .admin-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }
        .admin-header h1 {
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.3rem;
        }
        .admin-header p {
          color: #888;
          font-size: 0.9rem;
          margin: 0;
        }
        .admin-back-btn {
          background: transparent;
          border: 1px solid #1a3a4a;
          border-radius: 8px;
          color: #888;
          font-size: 0.85rem;
          padding: 0.5rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .admin-back-btn:hover { color: #07ccef; border-color: #07ccef; }
        .admin-stats-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          padding-bottom: 1.25rem;
          border-bottom: 1px solid #1a3a4a;
        }
        .admin-badge {
          background-color: rgba(7,204,239,0.12);
          color: #07ccef;
          border: 1px solid rgba(7,204,239,0.25);
          border-radius: 20px;
          padding: 0.3rem 0.9rem;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .admin-refresh-btn {
          background: transparent;
          border: none;
          color: #555;
          font-size: 0.85rem;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        .admin-refresh-btn:hover { color: #07ccef; }
        .admin-loading, .admin-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 3rem;
          color: #555;
        }
        .admin-empty-icon {
          font-size: 2.5rem;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(34,197,94,0.1);
          border-radius: 50%;
          color: #22c55e;
        }
        .loading-spinner {
          width: 36px;
          height: 36px;
          border: 3px solid #112830;
          border-top-color: #07ccef;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .admin-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .admin-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background-color: #07181f;
          border: 1px solid #1a3a4a;
          border-radius: 14px;
          padding: 1rem 1.25rem;
          transition: border-color 0.2s ease;
        }
        .admin-card:hover { border-color: #07ccef33; }
        .admin-card-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background-color: rgba(7,204,239,0.12);
          border: 2px solid rgba(7,204,239,0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
          font-size: 1.2rem;
          font-weight: 700;
          color: #07ccef;
        }
        .admin-card-avatar img { width: 100%; height: 100%; object-fit: cover; }
        .admin-card-info { flex: 1; min-width: 0; }
        .admin-card-info h3 { color: white; font-size: 1rem; font-weight: 600; margin: 0 0 0.2rem; }
        .admin-card-email { color: #888; font-size: 0.85rem; margin: 0 0 0.15rem; }
        .admin-card-fecha { color: #555; font-size: 0.8rem; margin: 0; }
        .admin-card-actions { display: flex; gap: 0.5rem; flex-shrink: 0; }
        .admin-btn-aprobar {
          padding: 0.45rem 1rem;
          border: none;
          border-radius: 8px;
          background-color: rgba(34,197,94,0.12);
          color: #22c55e;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .admin-btn-aprobar:hover:not(:disabled) { background-color: rgba(34,197,94,0.22); }
        .admin-btn-rechazar {
          padding: 0.45rem 1rem;
          border: none;
          border-radius: 8px;
          background-color: rgba(239,68,68,0.1);
          color: #ef4444;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .admin-btn-rechazar:hover:not(:disabled) { background-color: rgba(239,68,68,0.2); }
        .admin-btn-aprobar:disabled, .admin-btn-rechazar:disabled { opacity: 0.5; cursor: not-allowed; }
        @media (max-width: 480px) {
          .admin-card { flex-wrap: wrap; }
          .admin-card-actions { width: 100%; justify-content: flex-end; }
        }
      `}</style>
    </div>
  );
}

export default AdminProfesores;
