import { useState } from 'react';

import RemoBajoMancuernaGif from '../../assets/img/RemoBajoMancuerna.gif';
import gluteosGif from '../../assets/img/elevacionDePierna.gif';
import Person from '../../assets/img/person.svg'
import Back from '../../assets/img/muscles/back.png'
import Clock from '../../assets/img/clock.svg'
import Timer from './Timer';
import Trapecio from '../../assets/img/muscles/trapecio.png';
import Dorsal from '../../assets/img/muscles/dorsal.png';


const ejercicios = [
  {
    nombre: 'REMO BAJO MANCUERNA',
    gif: RemoBajoMancuernaGif,
    muscle: Back,
    descripcion: 'Este ejercicio trabaja principalmente el Remo Bajo Mancuerna...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'DOMINADAS',
    gif: gluteosGif,
    muscle: Back,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Avanzada',
  },
  {
    nombre: 'REMO CON BARRA',
    gif: gluteosGif,
    muscle: Back,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'DOMINADAS AGARRE AMPLIO',
    gif: gluteosGif,
    muscle: Back,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'REMO BAJO POLEA AGARRE CERRADO',
    gif: gluteosGif,
    muscle: Back,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'PESO MUERTO',
    gif: gluteosGif,
    muscle: Dorsal,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'HYPEREXTENSIONES',
    gif: gluteosGif,
    muscle: Dorsal,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'PESO MUERTO RUMANO',
    gif: gluteosGif,
    muscle: Dorsal,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'SUPERMAN EN EL SUELO',
    gif: gluteosGif,
    muscle: Dorsal,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'JALONES',
    gif: gluteosGif,
    muscle: Trapecio,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'FACE PULLS',
    gif: gluteosGif,
    muscle: Trapecio,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'REMO EN MAQUINA HAMMER CON AGARRE NEUTRO',
    gif: gluteosGif,
    muscle: Trapecio,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'ENCOGIMINETO INVERTIDO',
    gif: gluteosGif,
    muscle: Trapecio,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'Y-RAISE CON MANCUERNA',
    gif: gluteosGif,
    muscle: Trapecio,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
  {
    nombre: 'REMO EN T',
    gif: gluteosGif,
    muscle: Trapecio,
    descripcion: 'Este ejercicio trabaja los glúteos...',
    dificultad: 'Intermedia',
  },
];

function Espalda() {
  const [ejercicioSeleccionado, setEjercicioSeleccionado] = useState(null);
  const [mostrarDificultad, setMostrarDificultad] = useState(false);
  const mostrarEjercicio = (ejercicio) => {
    setEjercicioSeleccionado(ejercicio);
  };

  return (
    <div className="ejercicio-container">
      <h2>Ejercicios de Espalda</h2>
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

export default Espalda;
