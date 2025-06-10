import { useState } from 'react';
import './retos.css';
import Close from '../../assets/img/close.svg';

function Retos() {
  const [modalVideo, setModalVideo] = useState(null);

  const handleOpenModal = (videoId) => {
    setModalVideo(videoId);
  };

  const handleCloseModal = () => {
    setModalVideo(null);
  };

  return (
    <section className="retos-section">

      {/* Título de la sección */}
      <div className="retos-title-container">
        <h2 className="retos-title">
          RETOS <span>GRATUITOS</span>
        </h2>
      </div>

      {/* Reto 1 */}
      <div className="reto-1-wrapper">
        <div className="reto-card reto-1">
          <h3>KETO 30 DIAS</h3>
          <p>Un plan de 30 días para iniciarte en el estilo de vida keto, con pautas claras, recetas y acompañamiento para optimizar tu alimentación y alcanzar tus objetivos.</p>
          <a
            className="reto-btn"
            href="https://wa.me/5491121563405?text=Quiero%20comenzar%20el%20reto%20de%2030%20d%C3%ADas%20keto%21"
            target="_blank"
            rel="noopener noreferrer"
          >
            Comenzar reto
          </a>
        </div>
      </div>

      {/* Reto 2 */}
      <div className="reto-2-wrapper">
        <div className="reto-card reto-2">
          <h3>ENTRADA EN CALOR</h3>
          <p>“Activá tu cuerpo con esta rutina de entrada en calor ideal para preparar músculos y articulaciones antes de entrenar. ¡Mejorá tu rendimiento y prevení lesiones en solo unos minutos!”</p>
          <button
            className="reto-btn"
            onClick={() => handleOpenModal('zykDJg8JA3Y')}
          >
            Comenzar reto
          </button>
        </div>
      </div>

      {/* Reto 3 */}
      <div className="reto-3-wrapper">
        <div className="reto-card reto-3">
          <h3>¿HIPERTROFIA?</h3>
          <p>¿Sabías que para que nuestros músculos crezcan deben “romperse? ¡Este proceso se llama hipertrofia muscular y aquí te contamos todos los detalles que no sabías, comparte!</p>
          <button
            className="reto-btn"
            onClick={() => handleOpenModal('7U9YVWhzScE')}
          >
            Comenzar reto
          </button>
        </div>
      </div>

      {/* Modal tipo Planes pero con video */}
      {modalVideo && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              <img src={Close} alt="Close-button" />
            </button>
            <div className="modal-video-box">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${modalVideo}`}
                title="Reto Video"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Retos;
