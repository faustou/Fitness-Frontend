// Base de datos centralizada de ejercicios
// Luego se reemplazará por datos de la API

import cuadricepsGif from '../assets/img/elevacionDePierna.gif';
import remoBajoGif from '../assets/img/RemoBajoMancuerna.gif';

//PIERNA
import HipTrustGif from '../assets/img/HipTrust.gif';
import PatadaGluteosGif from '../assets/img/PatadaGluteos.gif';
import MediaSentadillaGif from '../assets/img/MediaSentadilla.gif';
import AbduccionMaquinaGif from '../assets/img/AbduccionMaquina.gif';
import AbunccionPoleaGif from '../assets/img/AbunccionPolea.gif';
import SoleoSentadoGif from '../assets/img/SoleoSentado.gif';
import GemelosPrensaGif from '../assets/img/GemelosPrensa.gif';
import GemelosParadoGif from '../assets/img/GemelosParado.gif';
import GemelosMaquinaGif from '../assets/img/GemelosMaquina.gif';

//ESPALDA
import RemoBajoMancuernaGif from '../assets/img/RemoBajoMancuerna.gif';
import DominadasGif from '../assets/img/Dominadas.gif';
import RemoConBarraGif from '../assets/img/RemoConBarra.gif';
import PesoMuertoGif from '../assets/img/PesoMuerto.gif';
import JalonesGif from '../assets/img/Jalones.gif';
import FacePullsGif from '../assets/img/FacePulls.gif';

//BRAZOS //HOMBROS
import CurlDeBicepGif from '../assets/img/CurlDeBicep.gif';
import CurlMartilloGif from '../assets/img/CurlMartillo.gif';
import CurlPoleaGif from '../assets/img/CurlPolea.gif';
import VuelosLateralesGif from '../assets/img/VuelosLaterales.gif';
import TricepSogaGif from '../assets/img/TricepSoga.gif';
import FrancesPoleaGif from '../assets/img/FrancesPolea.gif';
import PressMartilloGif from '../assets/img/PressMartillo.gif';

//PECHO
import PressPlanoGif from '../assets/img/PressPlano.gif';
import PressInclinadoGif from '../assets/img/PressInclinado.gif';
import AperturasGif from '../assets/img/Aperturas.gif';
import AperturasInclinadoGif from '../assets/img/AperturasInclinado.gif';
import PushUpGif from '../assets/img/PushUp.gif';


import Gluteo from '../assets/img/muscles/gluteo.png';
import Gemelos from '../assets/img/muscles/gemelos.png';
import Pantorrilla from '../assets/img/muscles/pantorrilla.png';
import Back from '../assets/img/muscles/back.png';
import Dorsal from '../assets/img/muscles/dorsal.png';
import Trapecio from '../assets/img/muscles/trapecio.png';
import Biceps from '../assets/img/muscles/biceps.png';
import Tricep from '../assets/img/muscles/tricep.png';
import Shoulder from '../assets/img/muscles/shoulder.png';
import Pecho from '../assets/img/muscles/pecho.png';
import AntebrazoFrente from '../assets/img/muscles/antebrazo-frente.png';

export const ejerciciosDB = {
  piernas: [
    { id: 'hip-trust', nombre: 'HIP TRUST', gif: HipTrustGif, muscle: Gluteo, descripcion: 'Ejercicio para glúteos e isquiotibiales', dificultad: 'Intermedio' },
    { id: 'patada-gluteo', nombre: 'PATADA DE GLUTEO', gif: PatadaGluteosGif, muscle: Gluteo, descripcion: 'Aislamiento de glúteos', dificultad: 'Básico' },
    { id: 'media-sentadilla', nombre: 'MEDIA SENTADILLA', gif: MediaSentadillaGif, muscle: Gluteo, descripcion: 'Trabajo de cuádriceps y glúteos', dificultad: 'Básico' },
    { id: 'abduccion-maquina', nombre: 'ABDUCCION MAQUINA', gif: AbduccionMaquinaGif, muscle: Gluteo, descripcion: 'Trabajo de abductores', dificultad: 'Básico' },
    { id: 'abduccion-polea', nombre: 'ABDUCCION POLEA', gif: AbunccionPoleaGif, muscle: Gluteo, descripcion: 'Trabajo de abductores con polea', dificultad: 'Intermedio' },
    { id: 'soleo-sentado', nombre: 'SOLEO SENTADO', gif: SoleoSentadoGif, muscle: Pantorrilla, descripcion: 'Aislamiento de sóleo', dificultad: 'Básico' },
    { id: 'gemelos-prensa', nombre: 'GEMELOS PRENSA', gif: GemelosPrensaGif, muscle: Gemelos, descripcion: 'Trabajo de gemelos en prensa', dificultad: 'Intermedio' },
    { id: 'gemelos-parado', nombre: 'GEMELOS PARADO', gif: GemelosParadoGif, muscle: Gemelos, descripcion: 'Trabajo de gemelos de pie', dificultad: 'Básico' },
    { id: 'gemelos-maquina', nombre: 'GEMELOS MAQUINA', gif: GemelosMaquinaGif, muscle: Gemelos, descripcion: 'Gemelos en máquina', dificultad: 'Básico' },
  ],
  espalda: [
    { id: 'remo-bajo-mancuerna', nombre: 'REMO BAJO MANCUERNA', gif: RemoBajoMancuernaGif, muscle: Back, descripcion: 'Trabajo de dorsales y romboides', dificultad: 'Intermedio' },
    { id: 'dominadas', nombre: 'DOMINADAS', gif: DominadasGif, muscle: Dorsal, descripcion: 'Ejercicio compuesto para espalda', dificultad: 'Avanzado' },
    { id: 'remo-barra', nombre: 'REMO CON BARRA', gif: RemoConBarraGif, muscle: Back, descripcion: 'Ejercicio compuesto para espalda', dificultad: 'Intermedio' },
    { id: 'peso-muerto', nombre: 'PESO MUERTO', gif: PesoMuertoGif, muscle: Back, descripcion: 'Ejercicio compuesto principal', dificultad: 'Avanzado' },
    { id: 'jalones', nombre: 'JALONES', gif: JalonesGif, muscle: Dorsal, descripcion: 'Trabajo de dorsales', dificultad: 'Intermedio' },
    { id: 'face-pulls', nombre: 'FACE PULLS', gif: FacePullsGif, muscle: Trapecio, descripcion: 'Trabajo de deltoides posterior y trapecio', dificultad: 'Básico' },
  ],
  brazosHombros: [
    { id: 'curl-bicep', nombre: 'CURL DE BICEP', gif: CurlDeBicepGif, muscle: Biceps, descripcion: 'Aislamiento de bíceps', dificultad: 'Básico' },
    { id: 'curl-martillo', nombre: 'CURL MARTILLO', gif: CurlMartilloGif, muscle: Biceps, descripcion: 'Trabajo de bíceps y braquial', dificultad: 'Básico' },
    { id: 'curl-polea', nombre: 'CURL POLEA', gif: CurlPoleaGif, muscle: Biceps, descripcion: 'Curl de bíceps en polea', dificultad: 'Intermedio' },
    { id: 'vuelos-laterales', nombre: 'VUELOS LATERALES', gif: VuelosLateralesGif, muscle: Shoulder, descripcion: 'Aislamiento de deltoides lateral', dificultad: 'Básico' },
    { id: 'tricep-soga', nombre: 'TRICEP SOGA', gif: TricepSogaGif, muscle: Tricep, descripcion: 'Extensión de tríceps con soga', dificultad: 'Básico' },
    { id: 'frances-polea', nombre: 'FRANCES POLEA', gif: FrancesPoleaGif, muscle: Tricep, descripcion: 'Extensión de tríceps francés', dificultad: 'Intermedio' },
    { id: 'press-martillo', nombre: 'PRESS MARTILLO', gif: PressMartilloGif, muscle: Shoulder, descripcion: 'Press de hombros con agarre neutro', dificultad: 'Intermedio' },
  ],
  pechoAbdomen: [
    { id: 'press-plano', nombre: 'PRESS PLANO', gif: PressPlanoGif, muscle: Pecho, descripcion: 'Press de pecho en banco plano', dificultad: 'Intermedio' },
    { id: 'press-inclinado', nombre: 'PRESS INCLINADO', gif: PressInclinadoGif, muscle: Pecho, descripcion: 'Press de pecho en banco inclinado', dificultad: 'Intermedio' },
    { id: 'aperturas', nombre: 'APERTURAS', gif: AperturasGif, muscle: Pecho, descripcion: 'Aperturas para pectorales', dificultad: 'Básico' },
    { id: 'aperturas-inclinado', nombre: 'APERTURAS INCLINADO', gif: AperturasInclinadoGif, muscle: Pecho, descripcion: 'Aperturas en banco inclinado', dificultad: 'Intermedio' },
    { id: 'push-up', nombre: 'PUSH UP', gif: PushUpGif, muscle: Pecho, descripcion: 'Flexiones de pecho', dificultad: 'Básico' },
  ],
  movilidad: [
    { id: 'estiramiento-cadera', nombre: 'ESTIRAMIENTO CADERA', gif: cuadricepsGif, muscle: Gluteo, descripcion: 'Movilidad de cadera', dificultad: 'Básico' },
    { id: 'rotacion-torax', nombre: 'ROTACION TORAX', gif: cuadricepsGif, muscle: Back, descripcion: 'Movilidad torácica', dificultad: 'Básico' },
  ],
};

// Helper para obtener ejercicio por ID
export const getEjercicioById = (id) => {
  for (const categoria of Object.values(ejerciciosDB)) {
    const ejercicio = categoria.find(ej => ej.id === id);
    if (ejercicio) return ejercicio;
  }
  return null;
};

// Helper para obtener todos los ejercicios como array plano
export const getAllEjercicios = () => {
  return Object.values(ejerciciosDB).flat();
};

export default ejerciciosDB;
