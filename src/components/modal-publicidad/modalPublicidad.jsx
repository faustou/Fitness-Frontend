import { useEffect, useState } from 'react';
import './modal-publicidad-styles.css';
import Promo from '../../assets/img/promo.png'

function ModalPublicidad() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 20000); // 20s
    return () => clearTimeout(timer);
  }, []);

  const goToPlanes = () => {
    setVisible(false);
    const planesSection = document.querySelector('#planes');
    if (planesSection) planesSection.scrollIntoView({ behavior: 'smooth' });
  };

  if (!visible) return null;

  return (
    <div className="promo-overlay">
      <div className="promo-content">
        <img src={Promo} alt="Promo" className="promo-image" />
        <button onClick={goToPlanes} className="promo-btn">Ver Planes</button>
        <button onClick={() => setVisible(false)} className="promo-close">×</button>
      </div>
    </div>
  );
}

export default ModalPublicidad;