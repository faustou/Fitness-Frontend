import { motion } from 'framer-motion';
import './styles-footer.css';
import instagramLogo from '../../assets/img/instagram.svg';
import facebookLogo from '../../assets/img/facebook.svg';
import tiktokLogo from '../../assets/img/tiktok.svg';

const socialLinks = [
  {
    name: 'Instagram',
    url: 'https://instagram.com/germanalva.fit',
    icon: instagramLogo,
  },
  {
    name: 'Facebook',
    url: 'https://facebook.com/germanalva.fit',
    icon: facebookLogo,
  },
  {
    name: 'TikTok',
    url: 'https://www.tiktok.com/@germansinacento',
    icon: tiktokLogo,
  },
];

const quickLinks = [
  { name: 'Inicio', href: '#' },
  { name: 'Planes', href: '#planes' },
  { name: 'Resultados', href: '#exitos' },
  { name: 'FAQ', href: '#faq' },
];

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-glow"></div>

      <div className="footer-container">
        {/* Brand Section */}
        <motion.div
          className="footer-brand"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>GERMAN ALVARADO</h2>
          <p>Transformá tu cuerpo, mente y vida.</p>

          {/* Social Links */}
          <div className="footer-social">
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ y: -4 }}
              >
                <img src={social.icon} alt={social.name} className="social-icon" />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Links Sections */}
        <div className="footer-links">
          <motion.div
            className="footer-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4>Enlaces</h4>
            <ul>
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a href={link.href}>{link.name}</a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            className="footer-section"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4>Contacto</h4>
            <a href="mailto:GermanAlvarado@gmail.com" className="footer-contact">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              GermanAlvarado@gmail.com
            </a>
          </motion.div>
        </div>
      </div>

      {/* Divider */}
      <div className="footer-divider"></div>

      {/* Credits */}
      <motion.div
        className="footer-credits"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <p>
          © {currentYear} <strong>Fausto Scarmato</strong>. Todos los derechos reservados.
        </p>

        <motion.button
          className="scroll-to-top"
          onClick={scrollToTop}
          aria-label="Volver arriba"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </motion.button>
      </motion.div>
    </footer>
  );
}

export default Footer;
