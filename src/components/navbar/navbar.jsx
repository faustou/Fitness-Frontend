import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ComenzarButton from "./Comenzar-button";
import { Example } from "./Example";
import './navbar.css';

function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { usuario, perfil } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthClick = () => {
    if (usuario && perfil) {
      if (perfil.rol === 'profesor') navigate('/profesor');
      else if (perfil.rol === 'profesor_pendiente' || perfil.rol === 'rechazado') navigate('/pendiente');
      else navigate('/alumno');
    } else {
      navigate('/login');
    }
  };

  const navLinks = [
    { id: 'planes', label: 'Planes' },
    { id: 'retos', label: 'Retos' },
    { id: 'exitos', label: 'Éxitos' },
    { id: 'faq', label: 'FAQ' },
    { id: 'contacto', label: 'Contacto' },
  ];

  return (
    <motion.div
      className={`navbar-wrapper ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={`navbar-container ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="menu-hamburguesa">
          <Example />
        </div>

        <motion.div
          className="navbar-logo"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <a href="#home">
            <span className="logo-first">GERMAN</span>
            <span className="logo-last">ALVARADO</span>
          </a>
        </motion.div>

        <nav className="navbar-links">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.id}
              href={`#${link.id}`}
              className="nav-link"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
              whileHover={{ y: -2 }}
            >
              <span>{link.label}</span>
            </motion.a>
          ))}

          {/* Login / Dashboard Button */}
          <motion.button
            className={`nav-auth-btn ${usuario ? 'logged-in' : ''}`}
            onClick={handleAuthClick}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.48, duration: 0.4 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            title={usuario ? `Ir a mi panel (${perfil?.nombre ?? ''})` : 'Iniciar sesión'}
          >
            {usuario && perfil?.avatar_url ? (
              <img
                src={perfil.avatar_url}
                alt={perfil.nombre}
                className="nav-auth-avatar"
              />
            ) : usuario ? (
              /* Dashboard icon when logged in without avatar */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            ) : (
              /* User icon when not logged in */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </motion.button>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
          >
            <ComenzarButton />
          </motion.div>
        </nav>
      </div>
    </motion.div>
  );
}

export default Navbar;
