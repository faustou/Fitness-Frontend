import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function PagoPendiente() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #07181f 0%, #0a1e28 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: '#112830',
          border: '1px solid rgba(255, 200, 50, 0.2)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>⏳</div>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e8f4f8', margin: '0 0 0.75rem' }}>
          Pago pendiente de acreditación
        </h1>

        <p style={{ fontSize: '0.9rem', color: '#7a9aaa', lineHeight: 1.6, margin: '0 0 1rem' }}>
          Tu pago está siendo procesado. Esto puede tardar hasta 72 horas hábiles dependiendo del medio de pago.
        </p>

        <p style={{ fontSize: '0.85rem', color: '#5a7a8a', lineHeight: 1.5, margin: '0 0 2rem' }}>
          Cuando se acredite te avisaremos y activaremos tu plan automáticamente. No hace falta que hagas nada más.
        </p>

        <motion.button
          onClick={() => navigate('/')}
          whileTap={{ scale: 0.97 }}
          style={{
            width: '100%',
            padding: '0.9rem',
            background: '#1a3a4a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '14px',
            color: '#c8dde8',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Volver al inicio
        </motion.button>
      </motion.div>
    </div>
  );
}

export default PagoPendiente;
