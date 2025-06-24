import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';

import Navbar from './components/navbar/navbar';
import Footer from './components/footer/footer';
import Home from './components/home/home';
import PlanesCards from './components/planes/planesCards';
import Whatsapp from './components/WhatsApp/WhatsApp';
import AntesDespuesSection from './components/exitos/exitos';
import Retos from './components/retos/Retos';
import PagosAdmin from './components/planes/PagosAdmin';
import Lanzamiento from './components/retos/lanzamiento';
import Faqs from './components/Faq/Faqs';
import Bienvenida from './components/home/bienvenida';
import ModalPublicidad from './components/modal-publicidad/modalPublicidad';
import Ejercicios from './components/ejercicios/Ejercicios';
import Piernas from './components/ejercicios/Piernas';
import Espalda from './components/ejercicios/Espalda';
import BrazosHombros from './components/ejercicios/BrazosHombros.jsx';
import PechoAbdomen from './components/ejercicios/PechoAbdomen';

function MainSite() {
  return (
    <>
      <ModalPublicidad />
      {/* IDs para navegación con anclas */}
      <section id="home"><Bienvenida /></section>
      <section id="retos"><Retos /></section>
      <Lanzamiento />
      <section id="exitos"><AntesDespuesSection /></section>
      <section id="planes"><PlanesCards /></section>
      <section id="faq"><Faqs /></section>
      <section id="contacto"><Footer /></section>
      <Whatsapp />
    </>
  );
}

// Protección con clave simple para /admin
function ProtectedPagosAdmin() {
  const [params] = useSearchParams();
  const clave = params.get("clave");

  if (clave !== "1234") {
    return <p style={{ padding: '2rem', color: 'red' }}>Acceso denegado</p>;
  }

  return <PagosAdmin />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainSite />} />
        <Route path="/admin" element={<ProtectedPagosAdmin />} />
        
        {/* Ruta principal para Ejercicios */}
        <Route path="/ejercicios" element={<Ejercicios />}>
          {/* Rutas internas de cada categoría */}
          <Route path="piernas" element={<Piernas />} />
          <Route path="espalda" element={<Espalda />} />
          <Route path="brazos-hombros" element={<BrazosHombros />} />
          <Route path="pecho-abdomen" element={<PechoAbdomen />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
