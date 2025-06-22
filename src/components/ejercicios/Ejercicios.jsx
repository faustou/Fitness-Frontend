import { Link, Route, Routes } from 'react-router-dom';
import Piernas from './Piernas.jsx'; // Importa los componentes de las categorías
import Espalda from './Espalda.jsx';
import BrazosHombros from './BrazosHombros.jsx';
import PechoAbdomen from './PechoAbdomen.jsx';
import './styles-ejercicios.css';
import PiernasIcon from '../../assets/img/piernas.svg';
import AbdomenPechoIcon from '../../assets/img/abdomenPecho.svg';
import BrazosHombrosIcon from '../../assets/img/BrazosHombros.svg';

function Ejercicios() {
  return (
    <div className='ejercicios-container'>
      <div>
        <h2>GUÍA EJERCICIOS</h2>
      </div>

      <div className='menu'>
        <div className='category-button'>
          <Link to="/ejercicios/piernas">
            <img src={PiernasIcon} alt="Piernas" />
          </Link>
        </div>
        <div className='category-button'>
          <Link to="/ejercicios/espalda">
            <img src={PiernasIcon} alt="Espalda" />
          </Link>
        </div>
        <div className='category-button'>
          <Link to="/ejercicios/brazos-hombros">
            <img src={BrazosHombrosIcon} alt="Brazos y Hombros" />
          </Link>
        </div>
        <div className='category-button'>
          <Link to="/ejercicios/pecho-abdomen">
            <img src={AbdomenPechoIcon} alt="Pecho y Abdomen" />
          </Link>
        </div>
      </div>


      <div className="category-content">
        {/* Aquí se renderizarán los componentes de las categorías según la ruta */}
        <Routes>
          <Route path="piernas" element={<Piernas />} />
          <Route path="espalda" element={<Espalda />} />
          <Route path="brazos-hombros" element={<BrazosHombros />} />
          <Route path="pecho-abdomen" element={<PechoAbdomen />} />
        </Routes>
      </div>
    </div>
  );
}

export default Ejercicios;
