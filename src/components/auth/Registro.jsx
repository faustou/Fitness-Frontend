import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import ImageCropper from '../shared/ImageCropper';
import './styles/auth.css';

function Registro() {
  const navigate = useNavigate();
  const { registro } = useAuth();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'alumno',
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [imagenParaRecortar, setImagenParaRecortar] = useState(null);
  const [mostrarCropper, setMostrarCropper] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [exito, setExito] = useState(false);

  // Manejar selección de imagen - abre el cropper
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea imagen
      if (!file.type.startsWith('image/')) {
        setError('Solo se permiten archivos de imagen');
        return;
      }
      // Validar tamaño (max 5MB para la original, se recortará después)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no puede superar 5MB');
        return;
      }
      setError('');
      // Mostrar el cropper con la imagen seleccionada
      setImagenParaRecortar(URL.createObjectURL(file));
      setMostrarCropper(true);
    }
    // Limpiar el input para poder seleccionar la misma imagen de nuevo
    e.target.value = '';
  };

  // Cuando el usuario confirma el recorte
  const handleCropComplete = (croppedFile) => {
    setAvatar(croppedFile);
    setAvatarPreview(URL.createObjectURL(croppedFile));
    setMostrarCropper(false);
    // Limpiar la imagen temporal
    if (imagenParaRecortar) {
      URL.revokeObjectURL(imagenParaRecortar);
      setImagenParaRecortar(null);
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

  // Limpiar preview cuando se desmonta
  const removeAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatar(null);
    setAvatarPreview(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);

    try {
      await registro(
        formData.email,
        formData.password,
        formData.nombre,
        formData.rol,
        avatar
      );

      setExito(true);
      // Los profesores van a la página de solicitud pendiente
      setTimeout(() => {
        navigate(formData.rol === 'profesor' ? '/pendiente' : '/alumno');
      }, 2000);
    } catch (err) {
      console.error('Error en registro:', err);
      if (err.message.includes('already registered')) {
        setError('Este email ya está registrado');
      } else {
        setError('Error al crear cuenta. Intentá de nuevo.');
      }
    } finally {
      setCargando(false);
    }
  };

  if (exito) {
    return (
      <div className="auth-container">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="auth-success">
            <span className="success-icon">{formData.rol === 'profesor' ? '⏳' : '✓'}</span>
            <h2>{formData.rol === 'profesor' ? '¡Solicitud enviada!' : '¡Cuenta creada!'}</h2>
            <p>
              {formData.rol === 'profesor'
                ? 'Tu solicitud está siendo revisada. Te avisaremos cuando sea aprobada.'
                : 'Redirigiendo a tu panel...'}
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <motion.div
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="auth-header">
          <h1>Crear Cuenta</h1>
          <p>Registrate para comenzar a entrenar</p>
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
            <label htmlFor="nombre">Nombre completo</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
              disabled={cargando}
            />
          </div>

          {/* Selector de foto de perfil */}
          <div className="form-group">
            <label>Foto de perfil (opcional)</label>
            <div className="avatar-upload">
              <div className="avatar-preview">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" />
                ) : (
                  <span className="avatar-placeholder">📷</span>
                )}
              </div>
              <div className="avatar-actions">
                <label className="avatar-btn" htmlFor="avatar-input">
                  {avatarPreview ? 'Cambiar foto' : 'Subir foto'}
                </label>
                <input
                  type="file"
                  id="avatar-input"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={cargando}
                  style={{ display: 'none' }}
                />
                {avatarPreview && (
                  <button
                    type="button"
                    className="avatar-remove"
                    onClick={removeAvatar}
                    disabled={cargando}
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              required
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repetí tu contraseña"
              required
              disabled={cargando}
            />
          </div>

          <div className="form-group">
            <label>Tipo de cuenta</label>
            <div className="rol-selector">
              <button
                type="button"
                className={`rol-btn ${formData.rol === 'alumno' ? 'activo' : ''}`}
                onClick={() => setFormData({ ...formData, rol: 'alumno' })}
                disabled={cargando}
              >
                <span className="rol-icon">🏋️</span>
                <span className="rol-nombre">Alumno</span>
                <span className="rol-desc">Quiero entrenar</span>
              </button>
              <button
                type="button"
                className={`rol-btn ${formData.rol === 'profesor' ? 'activo' : ''}`}
                onClick={() => setFormData({ ...formData, rol: 'profesor' })}
                disabled={cargando}
              >
                <span className="rol-icon">📋</span>
                <span className="rol-nombre">Profesor</span>
                <span className="rol-desc">Requiere aprobación</span>
              </button>
            </div>
          </div>

          <motion.button
            type="submit"
            className="auth-btn-primary"
            disabled={cargando}
            whileTap={{ scale: 0.98 }}
          >
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </motion.button>
        </form>

        <div className="auth-footer">
          <p>
            ¿Ya tenés cuenta?{' '}
            <Link to="/login">Iniciá sesión</Link>
          </p>
        </div>

        <Link to="/" className="auth-back">
          ← Volver al inicio
        </Link>
      </motion.div>

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

export default Registro;
