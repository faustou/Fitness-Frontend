import * as React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MenuItem } from "./MenuItem";
import ComenzarButton from "./Comenzar-button";
import { useAuth } from "../../context/AuthContext";

const variants = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 }
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

const itemVariants = {
  open: { opacity: 1, y: 0, transition: { y: { stiffness: 1000, velocity: -100 } } },
  closed: { opacity: 0, y: 50, transition: { y: { stiffness: 1000 } } }
};

export const Navigation = ({isOpen}) => {
  const navigate = useNavigate();
  const { usuario, perfil } = useAuth();

  const handleAuthClick = () => {
    if (usuario && perfil) {
      if (perfil.rol === 'profesor') navigate('/profesor');
      else if (perfil.rol === 'profesor_pendiente' || perfil.rol === 'rechazado') navigate('/pendiente');
      else navigate('/alumno');
    } else {
      navigate('/login');
    }
  };

  return (
    <motion.ul className={`styles-ul ${!isOpen ? "oculto-ul" : ""}`} variants={variants}>
      {menuItems.map((item, index) => (
        <MenuItem text={item} key={index} index={index} />
      ))}
      <ComenzarButton />
      <motion.li className="menu-auth-item" variants={itemVariants}>
        <button className="menu-auth-btn" onClick={handleAuthClick}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {usuario ? (
              <>
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </>
            ) : (
              <>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </>
            )}
          </svg>
          {usuario
            ? `Mi Panel${perfil?.nombre ? ` · ${perfil.nombre}` : ''}`
            : 'Iniciar Sesión'}
        </button>
      </motion.li>
    </motion.ul>
  );
};

const menuItems = ["Planes", "Retos", "Exitos", "Faq", "Contacto"];
