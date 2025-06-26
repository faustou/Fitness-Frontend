import { useState, useEffect, useRef } from 'react';
import PlayIcon from '../../assets/img/play.svg';
import StopIcon from '../../assets/img/stop.svg';
import ClockIcon from '../../assets/img/timer.svg';

import './styles-timer.css'

function Timer() {
  const [duration, setDuration] = useState(0); // tiempo total en segundos
  const [remaining, setRemaining] = useState(0); // tiempo restante
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const [botonActivo, setBotonActivo] = useState(null);

  // Formatear a mm:ss
  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, '0');
    const s = String(secs % 60).padStart(2, '0');
    return `${m}:${s}`;
  };

  // Manejar el temporizador
  useEffect(() => {
    if (isRunning && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, remaining]);

    const handleSetTime = (secs) => {
    setDuration(secs);
    setRemaining(secs);
    setIsRunning(false);
    setBotonActivo(secs);
    };

  const handleStartStop = () => {
    if (remaining > 0) {
      setIsRunning(prev => !prev);
    }
  };

  return (
    <div className='timer'>
        <h2 className={`time ${remaining === 0 && duration !== 0 ? 'ended' : ''}`}>
        {remaining === 0 && duration !== 0 ? "Tiempo" : formatTime(remaining)}
        </h2>


      <div className='select-time'>
        <button
            className={botonActivo === 30 ? 'activo' : ''}
            onClick={() => handleSetTime(30)}
        >
            <img src={ClockIcon} alt="30 segundos" />
            30'
        </button>
        <button
            className={botonActivo === 120 ? 'activo' : ''}
            onClick={() => handleSetTime(120)}
        >
            <img src={ClockIcon} alt="2 minutos" />
            2"
        </button>
        <button
            className={botonActivo === 180 ? 'activo' : ''}
            onClick={() => handleSetTime(180)}
        >
            <img src={ClockIcon} alt="3 minutos" />
            3"
        </button>
        </div>

        <button className='StartStop' onClick={handleStartStop}>
        <img 
            src={isRunning ? StopIcon : PlayIcon} 
            alt={isRunning ? "Detener" : "Empezar"} 
        />
        </button>
    </div>
  );
}

export default Timer;
