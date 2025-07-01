import { useState } from 'react';

import cuadricepsGif from '../../assets/img/elevacionDePierna.gif';
import gluteosGif from '../../assets/img/elevacionDePierna.gif';
import AntebrazoFrente from '../../assets/img/muscles/antebrazo-frente.png';
import Biceps from '../../assets/img/muscles/biceps.png';
import Shoulder from '../../assets/img/muscles/shoulder.png';
import Tricep from '../../assets/img/muscles/tricep.png'
import Clock from '../../assets/img/clock.svg';
import Person from '../../assets/img/person.svg';
import Timer from './Timer';

const ejercicios = [
  {
    nombre: 'PRESS MARTILLO',
    gif: cuadricepsGif,
    muscle: AntebrazoFrente,
    descripcion: 'Este ejercicio trabaja principalmente el músculo cuádriceps...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'CURL DE BICEP',
    gif: gluteosGif,
    muscle: Biceps,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'CURL SCOT',
    gif: gluteosGif,
    muscle: Biceps,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'CURL MARTILLO',
    gif: gluteosGif,
    muscle: Biceps,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'CURL POLEA',
    gif: gluteosGif,
    muscle: Biceps,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'CURL 45°',
    gif: gluteosGif,
    muscle: Biceps,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'CURL SPIDER',
    gif: gluteosGif,
    muscle: Biceps,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'VUELOS LATERALES MACUERNA',
    gif: gluteosGif,
    muscle: Shoulder,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'VUELOS LATERALES POLEA PISO',
    gif: gluteosGif,
    muscle: Shoulder,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'VUELOS LATEREALES SENTADO INCLINADO',
    gif: gluteosGif,
    muscle: Shoulder,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'VUELOS LATERALES A UN BRAZO POLEA ALTURA MANO',
    gif: gluteosGif,
    muscle: Shoulder,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'TRICEP SOGA',
    gif: gluteosGif,
    muscle: Tricep,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'TRICEP MEDIO',
    gif: gluteosGif,
    muscle: Tricep,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'FRANCES POLEA',
    gif: gluteosGif,
    muscle: Tricep,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'FRANCES CON MANCUERNA',
    gif: gluteosGif,
    muscle: Tricep,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'FRANCES A UN BRAZO MANCUENA',
    gif: gluteosGif,
    muscle: Tricep,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'ROMPECRANEOS',
    gif: gluteosGif,
    muscle: Tricep,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
];

function BrazosHombros() {
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
  const [mostrarDificultad, setMostrarDificultad] = useState(false);

  const mostrarEjercicio = (ejercicio) => {
    setEjercicioSeleccionado(ejercicio);
  };

  return (
    <div className="ejercicio-container">
      <h2>Ejercicios de Brazos y Hombros</h2>
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

export default BrazosHombros;