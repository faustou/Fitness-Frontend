import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  getEjerciciosDB,
  crearEjercicio,
  editarEjercicio,
  eliminarEjercicio,
  subirGifEjercicio,
} from '../../services/api';
import { ejerciciosDB } from '../../data/ejerciciosDB';
import './gestion-ejercicios.css';

const CATEGORIAS = ['Piernas', 'Espalda', 'Pecho', 'Brazos', 'Hombros', 'Abdomen', 'Movilidad'];
const DIFICULTADES = ['Principiante', 'Intermedio', 'Avanzado'];

// Mapeo de claves locales a categoría display
const CATEGORIA_LOCAL = {
  piernas: 'Piernas',
  espalda: 'Espalda',
  brazosHombros: 'Brazos',
  pechoAbdomen: 'Pecho',
  movilidad: 'Movilidad',
};

// Convertir ejerciciosDB hardcodeados al mismo formato que Supabase
const ejerciciosLocales = Object.entries(ejerciciosDB).flatMap(([clave, lista]) =>
  lista.map(ej => ({
    id: ej.id,
    nombre: ej.nombre,
    categoria: CATEGORIA_LOCAL[clave] || clave,
    dificultad: ej.dificultad,
    descripcion: ej.descripcion || '',
    gif_url: ej.gif || null,  // gif local (importado)
    creado_por: null,         // no tiene dueño, es predefinido
    predefinido: true,
  }))
);

const FORM_VACIO = { nombre: '', categoria: '', dificultad: '', descripcion: '' };

function GestionEjercicios() {
  const navigate = useNavigate();
  const { perfil, esProfesor, esAdmin } = useAuth();

  const [ejercicios, setEjercicios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroDificultad, setFiltroDificultad] = useState('');

  // Modal crear/editar
  const [mostrarModal, setMostrarModal] = useState(false);
  const [ejercicioEditando, setEjercicioEditando] = useState(null); // null = crear nuevo
  const [form, setForm] = useState(FORM_VACIO);
  const [archivoGif, setArchivoGif] = useState(null);
  const [previewGif, setPreviewGif] = useState(null);
  const [erroresForm, setErroresForm] = useState({});
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const inputFileRef = useRef(null);

  // Modal eliminar
  const [confirmEliminar, setConfirmEliminar] = useState(null); // ejercicio a eliminar
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState('');

  useEffect(() => {
    if (!esProfesor && !esAdmin) {
      navigate('/profesor');
      return;
    }
    cargarEjercicios();
  }, []);

  const cargarEjercicios = async () => {
    try {
      setCargando(true);
      setError(null);
      const dataSupabase = await getEjerciciosDB();
      // Evitar duplicados: si un ejercicio local ya está en Supabase (mismo id), usar el de Supabase
      const idsSupabase = new Set(dataSupabase.map(e => e.id));
      const localesSinDuplicados = ejerciciosLocales.filter(e => !idsSupabase.has(e.id));
      setEjercicios([...localesSinDuplicados, ...dataSupabase]);
    } catch (err) {
      setError('Error al cargar los ejercicios');
    } finally {
      setCargando(false);
    }
  };

  // Filtrado local
  const ejerciciosFiltrados = ejercicios.filter(ej => {
    const coincideNombre = ej.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = !filtroCategoria || ej.categoria === filtroCategoria;
    const coincideDificultad = !filtroDificultad || ej.dificultad === filtroDificultad;
    return coincideNombre && coincideCategoria && coincideDificultad;
  });

  const esMio = (ej) => !ej.predefinido && ej.creado_por === perfil?.id;
  const puedoEditar = (ej) => !ej.predefinido && (esMio(ej) || esAdmin);

  // ---- Formulario ----
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErroresForm(prev => ({ ...prev, [e.target.name]: '' }));
  };

  const handleArchivoGif = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    if (archivo.size > 5 * 1024 * 1024) {
      setErroresForm(prev => ({ ...prev, gif: 'El archivo no puede superar 5MB' }));
      return;
    }
    setArchivoGif(archivo);
    setPreviewGif(URL.createObjectURL(archivo));
    setErroresForm(prev => ({ ...prev, gif: '' }));
  };

  const validarForm = () => {
    const errores = {};
    if (!form.nombre.trim()) errores.nombre = 'El nombre es obligatorio';
    if (!form.categoria) errores.categoria = 'El grupo muscular es obligatorio';
    if (!form.dificultad) errores.dificultad = 'La dificultad es obligatoria';

    // Verificar nombre duplicado
    const yaExiste = ejercicios.some(
      ej => ej.nombre.toLowerCase() === form.nombre.trim().toLowerCase()
        && ej.id !== ejercicioEditando?.id
    );
    if (yaExiste) errores.nombre = 'Ya existe un ejercicio con ese nombre';

    return errores;
  };

  const abrirModalCrear = () => {
    setEjercicioEditando(null);
    setForm(FORM_VACIO);
    setArchivoGif(null);
    setPreviewGif(null);
    setErroresForm({});
    setMensajeExito('');
    setMostrarModal(true);
  };

  const abrirModalEditar = (ej) => {
    setEjercicioEditando(ej);
    setForm({
      nombre: ej.nombre,
      categoria: ej.categoria || '',
      dificultad: ej.dificultad || '',
      descripcion: ej.descripcion || '',
    });
    setArchivoGif(null);
    setPreviewGif(ej.gif_url || null);
    setErroresForm({});
    setMensajeExito('');
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    if (enviando) return;
    setMostrarModal(false);
    setEjercicioEditando(null);
    setArchivoGif(null);
    setPreviewGif(null);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    const errores = validarForm();
    if (Object.keys(errores).length > 0) {
      setErroresForm(errores);
      return;
    }

    setEnviando(true);
    setMensajeExito('');

    try {
      const datos = {
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        dificultad: form.dificultad,
        descripcion: form.descripcion.trim() || null,
      };

      if (ejercicioEditando) {
        // Editar
        await editarEjercicio(ejercicioEditando.id, datos);
        let gifUrl = ejercicioEditando.gif_url;

        if (archivoGif) {
          try {
            gifUrl = await subirGifEjercicio(ejercicioEditando.id, archivoGif);
            await editarEjercicio(ejercicioEditando.id, { gif_url: gifUrl });
          } catch {
            setErroresForm(prev => ({ ...prev, gif: 'No se pudo subir el GIF, el ejercicio se guardó igual' }));
          }
        }

        setEjercicios(prev => prev.map(ej =>
          ej.id === ejercicioEditando.id
            ? { ...ej, ...datos, gif_url: gifUrl }
            : ej
        ));
        setMensajeExito('Ejercicio actualizado');
      } else {
        // Crear
        const nuevo = await crearEjercicio(datos, perfil.id);

        if (archivoGif) {
          try {
            const gifUrl = await subirGifEjercicio(nuevo.id, archivoGif);
            await editarEjercicio(nuevo.id, { gif_url: gifUrl });
            nuevo.gif_url = gifUrl;
          } catch {
            setErroresForm(prev => ({ ...prev, gif: 'No se pudo subir el GIF, el ejercicio se guardó igual' }));
          }
        }

        setEjercicios(prev => [...prev, { ...nuevo, creado_por: perfil.id }]);
        setMensajeExito('Ejercicio creado');
      }

      setTimeout(cerrarModal, 1000);
    } catch (err) {
      setErroresForm({ general: err.message || 'Error al guardar' });
    } finally {
      setEnviando(false);
    }
  };

  // ---- Eliminar ----
  const handleEliminar = async () => {
    if (!confirmEliminar) return;
    setEliminando(true);
    setErrorEliminar('');
    try {
      await eliminarEjercicio(confirmEliminar.id);
      setEjercicios(prev => prev.filter(ej => ej.id !== confirmEliminar.id));
      setConfirmEliminar(null);
    } catch (err) {
      setErrorEliminar(err.message || 'Error al eliminar');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="gestion-ejercicios">
      {/* Header */}
      <header className="ge-header">
        <div className="ge-header-left">
          <button className="ge-btn-volver" onClick={() => navigate('/profesor')}>
            ← Volver
          </button>
          <h1>Biblioteca de Ejercicios</h1>
          <span className="ge-contador">{ejercicios.filter(e => !e.predefinido).length} propios · {ejerciciosLocales.length} predefinidos</span>
        </div>
        <motion.button
          className="ge-btn-nuevo"
          onClick={abrirModalCrear}
          whileTap={{ scale: 0.95 }}
        >
          + Nuevo ejercicio
        </motion.button>
      </header>

      {/* Filtros */}
      <div className="ge-filtros">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="ge-input-busqueda"
        />
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="ge-select"
        >
          <option value="">Todos los grupos</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filtroDificultad}
          onChange={(e) => setFiltroDificultad(e.target.value)}
          className="ge-select"
        >
          <option value="">Toda dificultad</option>
          {DIFICULTADES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Contenido */}
      {cargando && (
        <div className="ge-loading">
          <div className="ge-spinner"></div>
          <p>Cargando ejercicios...</p>
        </div>
      )}

      {error && (
        <div className="ge-error">
          <p>{error}</p>
          <button onClick={cargarEjercicios}>Reintentar</button>
        </div>
      )}

      {!cargando && !error && ejerciciosFiltrados.length === 0 && (
        <div className="ge-vacio">
          <div className="ge-vacio-icon">🏋️</div>
          <p>No hay ejercicios</p>
          {ejercicios.length > 0 && <p className="ge-vacio-hint">Probá cambiar los filtros</p>}
        </div>
      )}

      {!cargando && !error && (
        <div className="ge-grid">
          {ejerciciosFiltrados.map(ej => (
            <motion.div
              key={ej.predefinido ? `local-${ej.id}` : ej.id}
              className="ge-card"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* GIF o placeholder */}
              <div className="ge-card-gif">
                {ej.gif_url ? (
                  <img src={ej.gif_url} alt={ej.nombre} />
                ) : (
                  <div className="ge-gif-placeholder">
                    <span>🏋️</span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="ge-card-info">
                <h3 className="ge-card-nombre">{ej.nombre}</h3>
                <div className="ge-card-tags">
                  {ej.categoria && <span className="ge-tag ge-tag-cat">{ej.categoria}</span>}
                  {ej.dificultad && <span className={`ge-tag ge-tag-dif ge-dif-${ej.dificultad?.toLowerCase()}`}>{ej.dificultad}</span>}
                </div>
                {esMio(ej) && <span className="ge-badge-mio">Creado por ti</span>}
                {ej.predefinido && <span className="ge-badge-predefinido">Predefinido</span>}
              </div>

              {/* Acciones — solo para ejercicios editables */}
              {!ej.predefinido && (
                <div className="ge-card-acciones">
                  {puedoEditar(ej) ? (
                    <button
                      className="ge-btn-editar"
                      onClick={() => abrirModalEditar(ej)}
                      title="Editar ejercicio"
                    >
                      ✏️
                    </button>
                  ) : (
                    <button
                      className="ge-btn-editar deshabilitado"
                      disabled
                      title="Solo puede editarlo su creador"
                    >
                      ✏️
                    </button>
                  )}
                  {puedoEditar(ej) ? (
                    <button
                      className="ge-btn-eliminar"
                      onClick={() => { setConfirmEliminar(ej); setErrorEliminar(''); }}
                      title="Eliminar ejercicio"
                    >
                      🗑️
                    </button>
                  ) : (
                    <button
                      className="ge-btn-eliminar deshabilitado"
                      disabled
                      title="Solo puede eliminarlo su creador"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar */}
      <AnimatePresence>
        {mostrarModal && (
          <motion.div
            className="ge-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cerrarModal}
          >
            <motion.div
              className="ge-modal"
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ge-modal-header">
                <h2>{ejercicioEditando ? 'Editar ejercicio' : 'Nuevo ejercicio'}</h2>
                <button className="ge-modal-close" onClick={cerrarModal} disabled={enviando}>×</button>
              </div>

              <form onSubmit={handleGuardar} className="ge-modal-form">
                {/* Nombre */}
                <div className="ge-form-group">
                  <label>Nombre *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Sentadilla con barra"
                    disabled={enviando}
                  />
                  {erroresForm.nombre && <span className="ge-error-campo">{erroresForm.nombre}</span>}
                </div>

                {/* Categoría */}
                <div className="ge-form-group">
                  <label>Grupo muscular *</label>
                  <select name="categoria" value={form.categoria} onChange={handleChange} disabled={enviando}>
                    <option value="">Seleccioná uno</option>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {erroresForm.categoria && <span className="ge-error-campo">{erroresForm.categoria}</span>}
                </div>

                {/* Dificultad */}
                <div className="ge-form-group">
                  <label>Dificultad *</label>
                  <select name="dificultad" value={form.dificultad} onChange={handleChange} disabled={enviando}>
                    <option value="">Seleccioná una</option>
                    {DIFICULTADES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  {erroresForm.dificultad && <span className="ge-error-campo">{erroresForm.dificultad}</span>}
                </div>

                {/* Descripción */}
                <div className="ge-form-group">
                  <label>Descripción (opcional)</label>
                  <textarea
                    name="descripcion"
                    value={form.descripcion}
                    onChange={handleChange}
                    placeholder="Instrucciones de ejecución..."
                    rows={3}
                    disabled={enviando}
                  />
                </div>

                {/* GIF */}
                <div className="ge-form-group">
                  <label>GIF / WebP (opcional, máx. 5MB)</label>
                  {previewGif && (
                    <img src={previewGif} alt="preview" className="ge-gif-preview" />
                  )}
                  <button
                    type="button"
                    className="ge-btn-subir-gif"
                    onClick={() => inputFileRef.current?.click()}
                    disabled={enviando}
                  >
                    {previewGif ? 'Cambiar GIF' : 'Subir GIF'}
                  </button>
                  <input
                    ref={inputFileRef}
                    type="file"
                    accept="image/gif,image/webp"
                    onChange={handleArchivoGif}
                    style={{ display: 'none' }}
                  />
                  {erroresForm.gif && <span className="ge-error-campo">{erroresForm.gif}</span>}
                </div>

                {erroresForm.general && (
                  <div className="ge-error-general">{erroresForm.general}</div>
                )}
                {mensajeExito && (
                  <div className="ge-exito">{mensajeExito} ✓</div>
                )}

                <div className="ge-modal-acciones">
                  <button type="button" className="ge-btn-cancelar" onClick={cerrarModal} disabled={enviando}>
                    Cancelar
                  </button>
                  <button type="submit" className="ge-btn-guardar" disabled={enviando}>
                    {enviando ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Confirmar Eliminar */}
      <AnimatePresence>
        {confirmEliminar && (
          <motion.div
            className="ge-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !eliminando && setConfirmEliminar(null)}
          >
            <motion.div
              className="ge-modal ge-modal-confirm"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2>¿Eliminar ejercicio?</h2>
              <p>
                ¿Seguro que querés eliminar <strong>{confirmEliminar.nombre}</strong>?
                Esta acción no se puede deshacer.
              </p>
              {errorEliminar && <div className="ge-error-general">{errorEliminar}</div>}
              <div className="ge-modal-acciones">
                <button
                  className="ge-btn-cancelar"
                  onClick={() => setConfirmEliminar(null)}
                  disabled={eliminando}
                >
                  Cancelar
                </button>
                <button
                  className="ge-btn-eliminar-confirm"
                  onClick={handleEliminar}
                  disabled={eliminando}
                >
                  {eliminando ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GestionEjercicios;
