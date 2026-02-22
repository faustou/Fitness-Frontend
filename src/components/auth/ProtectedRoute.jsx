import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function ProtectedRoute({ children, requiredRole }) {
  const { usuario, perfil, cargando } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (cargando) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
        <style>{`
          .loading-container {
            min-height: 100vh;
            background-color: #07181f;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 1rem;
            color: white;
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #112830;
            border-top-color: #07ccef;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Si no hay usuario logueado, redirigir al login
  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  // Si hay usuario pero no hay perfil, redirigir al login
  if (!perfil) {
    return <Navigate to="/login" replace />;
  }

  // Profesor pendiente o rechazado — no puede acceder a rutas protegidas
  if (perfil.rol === 'profesor_pendiente' || perfil.rol === 'rechazado') {
    return <Navigate to="/pendiente" replace />;
  }

  // Si se requiere un rol específico y el usuario no lo tiene
  if (requiredRole && perfil.rol !== requiredRole) {
    // Redirigir al hub correspondiente según su rol
    if (perfil.rol === 'alumno') {
      return <Navigate to="/alumno" replace />;
    }
    if (perfil.rol === 'profesor') {
      return <Navigate to="/profesor" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Todo bien, mostrar el contenido protegido
  return children;
}

export default ProtectedRoute;
