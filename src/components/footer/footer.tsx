import './styles-footer.css';
import instagramLogo from '../../assets/img/instagram.svg';
import facebookLogo from '../../assets/img/facebook.svg';
import tiktokLogo from '../../assets/img/tiktok.svg';
import upArrow from '../../assets/img/uparrow.svg'; // Si usás react-icons (opcional)

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <h2>GERMAN ALVARADO</h2>
          <p>Transformá tu cuerpo, mente y vida.</p>
        </div>

        <div className="footer-links">
          <div className="footer-section">
            <h4>Redes</h4>
            <div className="footer-social">
              <a href="https://instagram.com/germanalva.fit" target="_blank" rel="noopener noreferrer">
                <img src={instagramLogo} alt="Instagram" className="social-icon" />
              </a>
              <a href="https://facebook.com/germanalva.fit" target="_blank" rel="noopener noreferrer">
                <img src={facebookLogo} alt="Facebook" className="social-icon" />
              </a>
              <a href="https://www.tiktok.com/@germansinacento" target="_blank" rel="noopener noreferrer">
                <img src={tiktokLogo} alt="TikTok" className="social-icon" />
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4>Contacto</h4>
            <p><i className="fa-solid fa-envelope"></i> GermanAlvarado@gmail.com</p>
          </div>
        </div>
      </div>

      <div className="footer-credits">
        <p>© 2025 <strong>Fausto Scarmato</strong>. Todos los derechos reservados.</p>
        <button className="scroll-to-top" onClick={scrollToTop} aria-label="Volver arriba">
          <img src={upArrow} alt="upArrow" className="upArrow" />
        </button>
      </div>
    </footer>
  );
}

export default Footer;
