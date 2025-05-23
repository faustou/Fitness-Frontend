import ComenzarButton from "./Comenzar-button";
import { Example } from "./Example";
import './navbar.css';

function Navbar() {
  return (
    <>
      <div className="navbar-wrapper">
        <div className="navbar-container bg-dark text-white">
          <div className="menu-hamburguesa">
            <Example />
          </div>

          <div className="navbar-logo">
            <a href="#home">
              <span>GERMAN</span>
              <span>ALVARADO</span>
            </a>

          </div>

          <div className="navbar-links">
            <a href="#planes"><p>Planes</p></a>
            <a href="#retos"><p>Retos</p></a>
            <a href="#exitos"><p>Éxitos</p></a>
            <a href="#faq"><p>Faq</p></a>
            <a href="#contacto"><p>Contacto</p></a>
            <ComenzarButton />
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
