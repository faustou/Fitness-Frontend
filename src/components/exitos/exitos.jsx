import './styles-antes-despues.css';
import Obeso from '../../assets/img/gordo.png'

function AntesDespuesSection() {
  return (
    <section className="antes-despues-section">
      <h2 className="antes-despues-title">CAMBIOS DE <span>MIS CLIENTES</span></h2>
      <div className="antes-despues-grid">

        {/* Card 1 */}
        <div className="antes-despues-card">
          <div className="imagen-container">
            <div className="imagen-item">
              {/* Reemplazar src por tu imagen "antes" */}
              <img src={Obeso} alt="Antes" />
              <span>Antes</span>
            </div>
            <div className="separador" />
            <div className="imagen-item">
              {/* Reemplazar src por tu imagen "despues" */}
              <img src={Obeso} alt="Después" />
              <span>Después</span>
            </div>
          </div>
        </div>

        {/* Repetir Card 2 a 6 con estructura idéntica */}
        {[2, 3, 4, 5, 6].map((i) => (
          <div className="antes-despues-card" key={i}>
            <div className="imagen-container">
              <div className="imagen-item">
                <img src={Obeso} alt="Antes" />
                <span>Antes</span>
              </div>
              <div className="separador" />
              <div className="imagen-item">
                <img src={Obeso} alt="Después" />
                <span>Después</span>
              </div>
            </div>
          </div>
        ))}

      </div>
      <div className="antes-despues-cta">
        <a href="#planes" style={{ textDecoration: "none" }}>
          <button className="btn-cambio">Empezá tu cambio hoy</button>
        </a>
      </div>
    </section>
  );
}

export default AntesDespuesSection;
