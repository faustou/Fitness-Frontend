import './ComenzarStyles.css';
import { motion } from 'framer-motion';

const itemVariants = {
  open: {
    opacity: 1,
    y: 0,
    transition: { y: { stiffness: 1000, velocity: -100 } }
  },
  closed: {
    opacity: 0,
    y: 20,
    transition: { y: { stiffness: 1000 } }
  }
};

function ComenzarButton() {
  return (
    <motion.li
      variants={itemVariants}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      style={{ listStyle: 'none' }}
    >
      <a href="#planes" style={{ textDecoration: 'none' }}>
        <button className="navbar-button">COMENZAR AHORA</button>
      </a>
    </motion.li>
  );
}

export default ComenzarButton;
