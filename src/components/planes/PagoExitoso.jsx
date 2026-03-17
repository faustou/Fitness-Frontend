import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

function PagoExitoso() {
  const navigate = useNavigate();
  const { perfil, refrescarPerfil } = useAuth();
  const [params] = useSearchParams();

  const paymentId = params.get('payment_id');
  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000';

  // Verificar el pago apenas llega la página — no espera el perfil
  useEffect(() => {
    console.log('[PagoExitoso] params:', Object.fromEntries(params.entries()));
    console.log('[PagoExitoso] paymentId:', paymentId);
    if (!paymentId) return;
    console.log('[PagoExitoso] llamando verify-payment...');
    fetch(`${SERVER_URL}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId }),
    })
      .then(r => r.json().then(data => console.log('[PagoExitoso] respuesta server:', r.status, data)))
      .catch(err => console.error('[PagoExitoso] Error verificando pago:', err));
  }, [paymentId]);

  // Refrescar perfil cuando carga (puede ser después del verify-payment)
  useEffect(() => {
    if (!perfil?.id || !paymentId) return;
    const timer = setTimeout(() => refrescarPerfil(), 1500);
    return () => clearTimeout(timer);
  }, [perfil?.id]);

  // MP puede enviar el email del pagador como query param en algunos flujos
  const emailParam = params.get('email');
  const esVisitante = !perfil;

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
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          background: '#112830',
          border: '1px solid rgba(7, 204, 239, 0.2)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          style={{ fontSize: '3.5rem', marginBottom: '1rem' }}
        >
          ✅
        </motion.div>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#e8f4f8', margin: '0 0 0.75rem' }}>
          ¡Tu pago fue aprobado!
        </h1>

        {esVisitante ? (
          <p style={{ fontSize: '0.9rem', color: '#7a9aaa', lineHeight: 1.6, margin: '0 0 2rem' }}>
            En breve un profesor se pondrá en contacto con vos
            {emailParam ? ` al email ${emailParam}` : ''} para coordinar el inicio del plan.
          </p>
        ) : (
          <p style={{ fontSize: '0.9rem', color: '#7a9aaa', lineHeight: 1.6, margin: '0 0 2rem' }}>
            Tu plan está activo. ¡Ya podés empezar a entrenar!
          </p>
        )}

        <motion.button
          onClick={() => navigate(perfil ? '/alumno' : '/')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%',
            padding: '0.9rem',
            background: 'linear-gradient(135deg, #07ccef, #3be9ff)',
            border: 'none',
            borderRadius: '14px',
            color: '#07181f',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {perfil ? 'Ir a mi panel' : 'Volver al inicio'}
        </motion.button>
      </motion.div>
    </div>
  );
}

export default PagoExitoso;
