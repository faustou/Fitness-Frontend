import { useState } from 'react';

import cuadricepsGif from '../../assets/img/elevacionDePierna.gif';
import gluteosGif from '../../assets/img/elevacionDePierna.gif';
import Gluteo from '../../assets/img/muscles/gluteo.png'
import Gemelos from '../../assets/img/muscles/gemelos.png'
import Pantorrilla from '../../assets/img/muscles/pantorrilla.png'
import Clock from '../../assets/img/clock.svg'
import Person from '../../assets/img/person.svg'
import Timer from './Timer';

const ejercicios = [
  {
    nombre: 'HIP TRUST',
    gif: cuadricepsGif,
    muscle: Gluteo,
    descripcion: 'Este ejercicio trabaja principalmente el músculo cuádriceps...',
    dificultad: 'Avanzado',
  },
  {
    nombre: 'PATADA DE GLUOTE',
    gif: gluteosGif,
    muscle: Gluteo,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Avanzado',
  },
  {
    nombre: 'MEDIA SENTADILLA',
    gif: gluteosGif,
    muscle: Gluteo,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Avanzado',
  },
  {
    nombre: 'ABEDUCCION MAQUINA',
    gif: gluteosGif,
    muscle: Gluteo,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Avanzado',
  },
  {
    nombre: 'ABEDUCCION POLEA',
    gif: gluteosGif,
    muscle: Gluteo,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Avanzado',
  },
  {
    nombre: 'SOLEO SENTADO',
    gif: gluteosGif,
    muscle: Pantorrilla,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Avanzado',
  },
  {
    nombre: 'GEMELOS PRENSA',
    gif: gluteosGif,
    muscle: Gemelos,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Avanzado',
  },
  {
    nombre: 'GEMELOS PARADO',
    gif: gluteosGif,
    muscle: Gemelos,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Avanzado',
  },
  {
    nombre: 'GEMELOS MAQUINA',
    gif: gluteosGif,
    muscle: Gemelos,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Avanzado',
  },
];

function Piernas() {
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
  const [mostrarDificultad, setMostrarDificultad] = useState(false);

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
          <div className="dificultad">
            <div>
              <p><img src={Clock} alt="Clock" /> 30s</p>
            </div>

            <div className="tooltip-wrapper">
              <img
                src={Person}
                alt="Person"
                className="tooltip-icon"
                onClick={() => setMostrarDificultad(prev => !prev)}
              />
              {mostrarDificultad && <span className="tooltip-floating">{ejercicioSeleccionado.dificultad}</span>}
            </div>
          </div>
          <div>
            <img className='muscle' src={ejercicioSeleccionado.muscle} alt="" />
          </div>
        </div>
        <Timer />
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
