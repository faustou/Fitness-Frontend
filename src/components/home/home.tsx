import Navbar from '../navbar/navbar';
import './styles-home.css';


function Home() {
  return (
    <div className="home">
      <Navbar />
      <div className="home-container">
        <div className="home-text">
          <h1>Bienvenido</h1>
          <p>Transformá tu cuerpo, mente y vida con mis planes personalizados.</p>
        </div>
        <div className="home-image">
          <model-viewer
            src="/assets/img/3d/scene.gltf"
            alt="Un modelo 3D"
            auto-rotate
            camera-controls
            interaction-prompt="none"
            style={{ width: '100%', height: '650px', zIndex: 10, position: 'relative' }}
            />
        </div>
      </div>
    </div>
  );
}

export default Home;