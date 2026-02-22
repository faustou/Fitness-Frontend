import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './styles/auth.css';

function ProfesorPendiente() {
  const { perfil, logout } = useAuth();
  const rechazado = perfil?.rol === 'rechazado';

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card pendiente-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Icono animado */}
        <motion.div
          className="pendiente-icon-wrapper"
          style={rechazado ? {
            background: 'linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.05) 100%)',
            borderColor: 'rgba(239,68,68,0.3)',
            color: '#ef4444',
          } : {}}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        >
          {rechazado ? (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          ) : (
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          )}
        </motion.div>

        <div className="pendiente-content">
          <h1>{rechazado ? 'Solicitud no aprobada' : 'Solicitud en revisión'}</h1>

          {perfil?.nombre && (
            <p className="pendiente-nombre">Hola, <strong>{perfil.nombre}</strong></p>
          )}

          {rechazado ? (
            <p className="pendiente-desc">
              Tu solicitud para acceder como <strong>Profesor</strong> no fue aprobada en esta
              oportunidad. Para más información contactate con el administrador.
            </p>
          ) : (
            <p className="pendiente-desc">
              Tu solicitud para acceder como <strong>Profesor</strong> está siendo revisada.
              Te notificaremos cuando sea aprobada.
            </p>
          )}

          {!rechazado && (
            <div className="pendiente-steps">
              <div className="step step-done">
                <span className="step-icon">✓</span>
                <span>Cuenta creada</span>
              </div>
              <div className="step-line"></div>
              <div className="step step-active">
                <span className="step-icon">⏳</span>
                <span>Revisión pendiente</span>
              </div>
              <div className="step-line"></div>
              <div className="step step-pending">
                <span className="step-icon">🚀</span>
                <span>Acceso habilitado</span>
              </div>
            </div>
          )}

          <p className="pendiente-nota">
            ¿Necesitás ayuda? Contactate directamente con el administrador.
          </p>
        </div>

        <div className="pendiente-actions">
          <Link to="/" className="auth-back">
            ← Volver al inicio
          </Link>
          <button className="pendiente-logout-btn" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default ProfesorPendiente;
