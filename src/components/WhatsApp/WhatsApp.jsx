import WhatsappLogo from '../../assets/img/Whatsapp.svg';
import '../WhatsApp/WhatsAppStyles.css';

function Whatsapp() {
  return (
    <section className="Whatsapp-container">
      <div className="whatsapp-wrapper">
        <a
          href="https://wa.me/5491121563405"
          target="_blank"
          rel="noopener noreferrer"
          className="whatsapp-link"
        >
          <img src={WhatsappLogo} alt="Whatsapp-logo" />
          <div className="whatsapp-tooltip">
            Escribime si necesitás ayuda o tenés preguntas.
          </div>
        </a>
      </div>
    </section>
  );
}

export default Whatsapp;
