import { useState } from 'react';

import cuadricepsGif from '../../assets/img/elevacionDePierna.gif';
import gluteosGif from '../../assets/img/elevacionDePierna.gif';
import Back from '../../assets/img/muscles/back.png'
import Clock from '../../assets/img/clock.svg'
import Person from '../../assets/img/person.svg'

const ejercicios = [
  {
    nombre: 'CUADRICEPS',
    gif: cuadricepsGif,
    muscle: Back,
    descripcion: 'Este ejercicio trabaja principalmente el músculo cuádriceps...',
  },
  {
    nombre: 'GLUTEOS',
    gif: gluteosGif,
    muscle: Back,
    descripcion: 'Este ejercicio trabaja los glúteos...',
  },
  {
    nombre: 'REMO CABALLO',
    gif: gluteosGif,
    muscle: Back,
    descripcion: 'Este ejercicio trabaja los glúteos...',
  },
  {
    nombre: 'REMO BAJO MAQUINA',
    gif: gluteosGif,
    muscle: Back,
    descripcion: 'Este ejercicio trabaja los glúteos...',
  },
  {
    nombre: 'REMO CON APOLLO',
    gif: gluteosGif,
    muscle: Back,
    descripcion: 'Este ejercicio trabaja los glúteos...',
  },
  {
    nombre: 'REMO BAJO POLEA',
    gif: gluteosGif,
    muscle: Back,
    descripcion: 'Este ejercicio trabaja los glúteos...',
  },
  {
    nombre: 'DOMINADAS',
    gif: gluteosGif,
    muscle: Back,
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
            className={`boton-ejercicio ${ejercicioSeleccionado?.nombre === ejercicio.nombre ? 'activo' : ''}`}
            onClick={() => mostrarEjercicio(ejercicio)}
          >
            {ejercicio.nombre}
          </button>
        ))}
      </div>

      {ejercicioSeleccionado ? (
      <div className="contenido-ejercicio">
        <h3>{ejercicioSeleccionado.nombre}</h3>
        <img
          src={ejercicioSeleccionado.gif}
          alt={`Gif de ${ejercicioSeleccionado.nombre}`}
          className="gif-ejercicio"
        />
        <p>{ejercicioSeleccionado.descripcion}</p>
        <div className='content-info'>
          <div className='dificultad'>
            <div>
              <p> <img src={Clock} alt="Piernas" /> 30s</p>
            </div>
            <div>
              <p> <img src={Person} alt="Piernas" /> Intermedio</p>
            </div>
          </div>
          <div>
            <img className='muscle' src={ejercicioSeleccionado.muscle} alt="" />
          </div>
        </div>
        <button onClick={() => setEjercicioSeleccionado(null)} className="cerrar-ejercicio">
          Volver a la lista
        </button>
      </div>
    ) : (
      <p style={{ color: '#aaa', marginTop: '2rem' }}>Seleccione un ejercicio</p>
    )}

        
    </div>
  );
}

export default Piernas;
