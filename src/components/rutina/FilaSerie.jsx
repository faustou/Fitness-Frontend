import { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';

function FilaSerie({ serie, onUpdate, onCompletar, onEliminar, disabled, puedeEliminar }) {
  const [mostrarEliminar, setMostrarEliminar] = useState(false);
  // Estado local para los inputs - permite borrar completamente
  const [localReps, setLocalReps] = useState(null);
  const [localPeso, setLocalPeso] = useState(null);
  const [localRir, setLocalRir] = useState(null);

  const x = useMotionValue(0);
  const background = useTransform(x, [-100, 0], ['#ff4444', '#112830']);
  const opacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);

  // Obtener el valor a mostrar en el input
  const getInputValue = (campo) => {
    if (campo === 'repsReal') {
      if (localReps !== null) return localReps;
      return serie.repsReal ?? serie.repsObjetivo ?? '';
    }
    if (campo === 'pesoReal') {
      if (localPeso !== null) return localPeso;
      return serie.pesoReal ?? serie.pesoObjetivo ?? '';
    }
    if (campo === 'rir') {
      if (localRir !== null) return localRir;
      return serie.rir ?? '';
    }
    return '';
  };

  const handleChange = (campo, valor) => {
    // Guardar el valor local (permite string vacío)
    if (campo === 'repsReal') setLocalReps(valor);
    if (campo === 'pesoReal') setLocalPeso(valor);
    if (campo === 'rir') setLocalRir(valor);

    // Enviar al parent solo si hay valor numérico
    const valorNumerico = valor === '' ? null : parseFloat(valor);
    onUpdate({ [campo]: valorNumerico });
  };

  // Cuando el input pierde foco, sincronizar con el valor real
  const handleBlur = (campo) => {
    if (campo === 'repsReal') setLocalReps(null);
    if (campo === 'pesoReal') setLocalPeso(null);
    if (campo === 'rir') setLocalRir(null);
  };

  const handleDragEnd = (event, info) => {
    if (info.offset.x < -80 && puedeEliminar) {
      onEliminar();
    }
    setMostrarEliminar(false);
  };

  const handleDrag = (event, info) => {
    if (info.offset.x < -30 && puedeEliminar) {
      setMostrarEliminar(true);
    } else {
      setMostrarEliminar(false);
    }
  };

  return (
    <div className="fila-serie-container">
      {/* Fondo con botón eliminar */}
      <motion.div
        className="fila-serie-background"
        style={{ opacity: puedeEliminar ? opacity : 0 }}
      >
        <span className="eliminar-texto">Eliminar</span>
      </motion.div>

      {/* Contenido draggable */}
      <motion.div
        className={`fila-serie ${serie.completada ? 'serie-completada' : ''}`}
        drag={puedeEliminar ? "x" : false}
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{ x }}
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="serie-numero">{serie.numero}</div>

        <div className="serie-campo">
          <input
            type="number"
            inputMode="numeric"
            value={getInputValue('repsReal')}
            onChange={(e) => handleChange('repsReal', e.target.value)}
            onBlur={() => handleBlur('repsReal')}
            disabled={disabled || serie.completada}
            className="input-serie"
            min="0"
            max="999"
          />
        </div>

        <div className="serie-campo">
          <div className="input-peso-wrapper">
            <input
              type="number"
              inputMode="decimal"
              value={getInputValue('pesoReal')}
              onChange={(e) => handleChange('pesoReal', e.target.value)}
              onBlur={() => handleBlur('pesoReal')}
              disabled={disabled || serie.completada}
              className="input-serie"
              min="0"
              max="999"
              step="0.5"
            />
            <span className="unidad">kg</span>
          </div>
        </div>

        <div className="serie-campo">
          <input
            type="number"
            inputMode="numeric"
            value={getInputValue('rir')}
            onChange={(e) => handleChange('rir', e.target.value)}
            onBlur={() => handleBlur('rir')}
            disabled={disabled || serie.completada}
            className="input-serie input-rir"
            placeholder={serie.rirObjetivo != null ? String(serie.rirObjetivo) : '-'}
            min="0"
            max="10"
          />
        </div>

        <div className="serie-campo">
          <motion.button
            className={`btn-completar ${serie.completada ? 'completada' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onCompletar();
            }}
            onPointerDownCapture={(e) => e.stopPropagation()}
            disabled={disabled}
            whileTap={{ scale: 0.9 }}
          >
            ✓
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

export default FilaSerie;
