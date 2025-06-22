import './bienvenida-styles.css'
import ProgressUp from '../../assets/img/progress-up.png'
import Heart from '../../assets/img/heart.png'
import Navbar from '../navbar/navbar';

function Bienvenida() {
  return (
    <section className="bienvenida-section">
    <Navbar />
      <div className="bienvenida-overlay">
        <div className="bienvenida-content">

          {/* Elementos flotantes reubicados */}

          <div className="bienvenida-floating top-right">
            <p className="floating-title"> <span> 3/4 </span> <br /> SERIES</p>
          </div>

          <div className="bienvenida-floating bottom-left">
            <img src={Heart} alt="Heart" className="floating-graph-heart" />
            <p className="floating-value">145</p>
          </div>

          <div className="bienvenida-floating top-left">
            <p className="floating-title">PLAN DE<br />ENTRENAMIENTO</p>
          </div>

          <div className="bienvenida-floating bottom-right">
            <p className="floating-title">PROGRESO</p>
            <img src={ProgressUp} alt="Progreso" className="floating-graph" />

          </div>

          {/* Contenido principal */}
          <h1>ENTRENÁ DIFERENTE.<br />ENTRENÁ CON PROPÓSITO.</h1>
          <a href="#planes">
            <button className="btn-comenzar">COMENZAR AHORA</button>
          </a>
        </div>

        <div className="scroll-indicator">
          <p>↓ SCROLL</p>
        </div>
      </div>
    </section>
    
  );
}

export default Bienvenida;
