import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './styles/auth.css';

function Login() {
  const navigate = useNavigate();
  const { login, perfil } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Si ya tiene perfil, redirigir automáticamente según el rol
  useEffect(() => {
    if (perfil) {
      if (perfil.rol === 'profesor') {
        navigate('/profesor');
      } else if (perfil.rol === 'profesor_pendiente' || perfil.rol === 'rechazado') {
        navigate('/pendiente');
      } else {
        navigate('/alumno');
      }
    }
  }, [perfil, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await login(email, password);
      // Esperar un poco y luego verificar si el perfil se cargó
      setTimeout(() => {
        setCargando(false);
      }, 3000);
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Email o contraseña incorrectos'
          : 'Error al iniciar sesión. Intentá de nuevo.'
      );
      setCargando(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="auth-header">
          <h1>Iniciar Sesión</h1>
          <p>Ingresá a tu cuenta para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <motion.div
              className="auth-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              {error}
            </motion.div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={cargando}
            />
          </div>

          <motion.button
            type="submit"
            className="auth-btn-primary"
            disabled={cargando}
            whileTap={{ scale: 0.98 }}
          >
            {cargando ? 'Ingresando...' : 'Ingresar'}
          </motion.button>
        </form>

        <div className="auth-footer">
          <p>
            ¿No tenés cuenta?{' '}
            <Link to="/registro">Registrate</Link>
          </p>
        </div>

        <Link to="/" className="auth-back">
          ← Volver al inicio
        </Link>
      </motion.div>
    </div>
  );
}

export default Login;
