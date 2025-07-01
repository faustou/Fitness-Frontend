import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Piernas from './Piernas.jsx';
import Espalda from './Espalda.jsx';
import Mobilidad from './Mobilidad.jsx';
import PechoAbdomen from './PechoAbdomen.jsx';
import BrazosHombros from './BrazosHombros.jsx'
import './styles-ejercicios.css';
import PiernasIcon from '../../assets/img/piernas.svg';
import MobilidadIcon from '../../assets/img/push-up.png';
import AbdomenPechoIcon from '../../assets/img/abdomenPecho.svg';
import BrazosHombrosIcon from '../../assets/img/brazosHombros.svg';
import EspaldaIcon from '../../assets/img/back.svg';

function Ejercicios() {
  const location = useLocation();
  return (
    <div className='ejercicios-container'>

      <div className='menu'>
        <div className={`category-button ${location.pathname === "/ejercicios/mobilidad" ? "activo" : ""}`}>
          <Link to="/ejercicios/mobilidad">
            <img src={MobilidadIcon} alt="Mobilidad" />
          </Link>
        </div>
                <div className={`category-button ${location.pathname === "/ejercicios/piernas" ? "activo" : ""}`}>
          <Link to="/ejercicios/piernas">
            <img src={PiernasIcon} alt="Piernas" />
          </Link>
        </div>
        <div className={`category-button ${location.pathname === "/ejercicios/espalda" ? "activo" : ""}`}>
          <Link to="/ejercicios/espalda">
            <img src={EspaldaIcon} alt="Espalda" />
          </Link>
        </div>
        <div className={`category-button ${location.pathname === "/ejercicios/brazos-hombros" ? "activo" : ""}`}>
          <Link to="/ejercicios/brazos-hombros">
            <img src={BrazosHombrosIcon} alt="Brazos y Hombros" />
          </Link>
        </div>
        <div className={`category-button ${location.pathname === "/ejercicios/pecho-abdomen" ? "activo" : ""}`}>
          <Link to="/ejercicios/pecho-abdomen">
            <img src={AbdomenPechoIcon} alt="Pecho y Abdomen" />
          </Link>
        </div>
      </div>


      <div className="category-content">
        {/* Aquí se renderizarán los componentes de las categorías según la ruta */}
        <Routes>
            <Route
    path=""
    element={<p style={{ color: '#ccc', marginTop: '2rem' }}>Seleccione grupo muscular</p>}
  />
          <Route path="piernas" element={<Piernas />} />
          <Route path="mobilidad" element={<Mobilidad />} />
          <Route path="espalda" element={<Espalda />} />
          <Route path="brazos-hombros" element={<BrazosHombros />} />
          <Route path="pecho-abdomen" element={<PechoAbdomen />} />
        </Routes>
      </div>
    </div>
  );
}

export default Ejercicios;
