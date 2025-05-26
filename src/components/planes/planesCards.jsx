import './PlanesStyles.css';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import axios from 'axios';
import { useState } from 'react';
import Close from '../../assets/img/close.svg';

function PlanesCards() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPlan, setModalPlan] = useState(null);
  const [preferenceId, setPreferenceId] = useState(null);

  initMercadoPago('TEST-9b5a1571-f0d1-4a1a-a736-cbbc620946b9', {
    locale: 'es-AR',
  });

  const handleBuy = async (planInfo) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/create_preference`, {
        title: planInfo.title,
        quantity: 1,
        price: planInfo.price,
      });
      setPreferenceId(response.data.id);
      setModalPlan(planInfo);
      setIsModalOpen(true);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <section className="planes-section">
      <h2 className="antes-despues-title">CONTRATA <span>MIS SERVICIOS</span></h2>
      <div className="planes-cards">

        {/* Card ORO */}
        <div className="plan-card-wrapper oro-wrapper">
          <div className="plan-card-bg"></div>
          <div className="plan-card plan-card-gold oro">
            <h3>ORO</h3>
            <p className="plan-duration">6 meses</p>
            <div className="plan-icon">🥇</div>
            <div className="plan-price-container">
              <p className="plan-price-old">$57000</p>
              <div className="plan-price-new">
                <span className="price-final">$40000</span>
                <span className="discount-badge">30% OFF</span>
              </div>
            </div>
            <ul>
              <li>Beneficio destacado</li>
              <li>Otro beneficio más</li>
            </ul>
            <button
              className="plan-button"
              onClick={() =>
                handleBuy({
                  title: 'Plan Oro - German Alvarado',
                  price: 40000,
                  oldPrice: 57000,
                  name: 'ORO',
                  duration: '6 meses',
                })
              }
            >
              COMENZAR
            </button>
          </div>
        </div>

        {/* Card PLATA */}
        <div className="plan-card-wrapper destacada plata-wrapper">
          <div className="plan-card-bg"></div>
          <div className="plan-card plan-card-silver plata">
            <h3>PLATA</h3>
            <p className="plan-duration">3 meses</p>
            <div className="plan-icon">🥈</div>
            <div className="plan-price-container">
              <p className="plan-price-old">$57000</p>
              <div className="plan-price-new">
                <span className="price-final">$40000</span>
                <span className="discount-badge">30% OFF</span>
              </div>
            </div>
            <ul>
              <li>Beneficio destacado</li>
              <li>Otro beneficio más</li>
            </ul>
            <button
              className="plan-button"
              onClick={() =>
                handleBuy({
                  title: 'Plan Plata - German Alvarado',
                  price: 40000,
                  oldPrice: 57000,
                  name: 'PLATA',
                  duration: '3 meses',
                })
              }
            >
              COMENZAR
            </button>
          </div>
        </div>

        {/* Card BRONCE */}
        <div className="plan-card-wrapper bronce-wrapper">
          <div className="plan-card-bg"></div>
          <div className="plan-card plan-card-bronze bronce">
            <div className="bronce-border"></div>
            <h3>BRONCE</h3>
            <p className="plan-duration">1 mes</p>
            <div className="plan-icon">🥉</div>
            <div className="plan-price-container">
              <p className="plan-price-old">$21000</p>
              <div className="plan-price-new">
                <span className="price-final">$14700</span>
                <span className="discount-badge">30% OFF</span>
              </div>
            </div>
            <ul>
              <li>Beneficio destacado</li>
              <li>Otro beneficio más</li>
            </ul>
            <button
              className="plan-button"
              onClick={() =>
                handleBuy({
                  title: 'Plan Bronce - German Alvarado',
                  price: 14700,
                  oldPrice: 21000,
                  name: 'BRONCE',
                  duration: '1 mes',
                })
              }
            >
              COMENZAR
            </button>
          </div>
        </div>
      </div>

      {/* Card VIP */}
    <div className="plan-card-wrapper vip-wrapper">
      <div className="plan-card vip">
        <h3>PLAN VIP - MENSUAL</h3>
        <div className="plan-price-container">
          <p className="plan-price-old">$70000</p>
          <div className="plan-price-new">
            <span className="price-final">$49000</span>
            <span className="discount-badge">30% OFF</span>
          </div>
        </div>
        <div className="vip-benefits">
          <div className="vip-column">
            <ul>
              <li>Beneficio destacado</li>
              <li>Otro beneficio más</li>
            </ul>
          </div>
          <div className="vip-button-wrapper">
            <button
              className="plan-button"
              onClick={() =>
                handleBuy({
                  title: 'Plan VIP - German Alvarado',
                  price: 49000,
                  oldPrice: 70000,
                  name: 'VIP',
                  duration: '1 MES',
                })
              }
            >
              COMENZAR
            </button>
          </div>
          <div className="vip-column">
            <ul>
              <li>Beneficio destacado</li>
              <li>Otro beneficio más</li>
            </ul>
          </div>
        </div>
      </div>

      {/* borde animado ENCIMA de la card */}
      <div className="vip-border-anim"></div>
    </div>


      {/* MODAL */}
      {isModalOpen && modalPlan && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">RESUMEN DE COMPRA</h2>

            <div className="modal-box">
              <div className="modal-plan-header">
                <span className="modal-icon">
                  {modalPlan.name === 'ORO' && '🥇'}
                  {modalPlan.name === 'PLATA' && '🥈'}
                  {modalPlan.name === 'BRONCE' && '🥉'}
                  {modalPlan.name === 'VIP' && '👑'}
                </span>
                <div className="modal-plan-text">
                  <p className="modal-plan-title">{`PLAN ${modalPlan.name} – ${modalPlan.duration}`}</p>
                  <div className="modal-price-container">
                    <p className="modal-price-old">${modalPlan.oldPrice}</p>
                    <p className="modal-price-final">${modalPlan.price} <span>*30%OFF*</span> </p>
                  </div>
                </div>
                <ul className="modal-benefits">
                  <li>Acceso completo</li>
                  <li>Soporte prioritario</li>
                </ul>
              </div>

              {preferenceId && (
                <div className="modal-mp">
                  <Wallet initialization={{ preferenceId }} />
                </div>
              )}

              <p className="modal-warning">
                Una vez hecho el pago, nos pondremos en contacto contigo.
              </p>
            </div>

            <button className="modal-close" onClick={() => setIsModalOpen(false)}>
              <img src={Close} alt="Close-Button" />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default PlanesCards;

