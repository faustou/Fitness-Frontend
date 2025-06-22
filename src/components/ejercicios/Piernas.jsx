import { useState } from 'react';

import cuadricepsGif from '../../assets/img/elevacionDePierna.gif';
import gluteosGif from '../../assets/img/elevacionDePierna.gif';

const ejercicios = [
  {
    nombre: 'Cuádriceps',
    gif: cuadricepsGif,
    descripcion: 'Este ejercicio trabaja principalmente el músculo cuádriceps...',
  },
  {
    nombre: 'Glúteos',
    gif: gluteosGif,
    descripcion: 'Este ejercicio trabaja los glúteos...',
  },
];

function Piernas() {
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);

  const mostrarEjercicio = (ejercicio) => {
    setEjercicioSeleccionado(ejercicio);
  };

  return (
    <div className="ejercicio-container">
      <h2>Ejercicios de Piernas</h2>
      <div className="botones-ejercicios">
        {ejercicios.map((ejercicio, index) => (
          <button
            key={index}
            className="boton-ejercicio"
            onClick={() => mostrarEjercicio(ejercicio)}
          >
            {ejercicio.nombre}
          </button>
        ))}
      </div>

      {ejercicioSeleccionado && (
        <div className="contenido-ejercicio">
          <h3>{ejercicioSeleccionado.nombre}</h3>
          <img
            src={ejercicioSeleccionado.gif}
            alt={`Gif de ${ejercicioSeleccionado.nombre}`}
            className="gif-ejercicio"
          />
          <p>{ejercicioSeleccionado.descripcion}</p>
          <button onClick={() => setEjercicioSeleccionado(null)} className="cerrar-ejercicio">
            Volver a la lista
          </button>
        </div>
      )}
    </div>
  );
}

export default Piernas;
