// Datos mock de rutinas - Luego vendrán de la API
import { getEjercicioById } from './ejerciciosDB';

// Helper para crear estructura de series
const crearSeries = (cantidad, repsObjetivo, pesoObjetivo) => {
  return Array.from({ length: cantidad }, (_, i) => ({
    numero: i + 1,
    repsObjetivo,
    pesoObjetivo,
    repsReal: null,
    pesoReal: null,
    rir: null,
    completada: false,
  }));
};

// Rutina de ejemplo - Día de Piernas
export const rutinaDiaMock = {
  id: 1,
  alumnoId: 123,
  fecha: new Date().toISOString().split('T')[0],
  nombreRutina: 'Día de Piernas - Semana 1',
  ejercicios: [
    {
      id: 1,
      ejercicioId: 'hip-trust',
      ...getEjercicioById('hip-trust'),
      descanso: 90,
      series: crearSeries(3, 12, 40),
      completado: false,
      orden: 1,
    },
    {
      id: 2,
      ejercicioId: 'media-sentadilla',
      ...getEjercicioById('media-sentadilla'),
      descanso: 120,
      series: crearSeries(4, 10, 60),
      completado: false,
      orden: 2,
    },
    {
      id: 3,
      ejercicioId: 'abduccion-maquina',
      ...getEjercicioById('abduccion-maquina'),
      descanso: 60,
      series: crearSeries(3, 15, 30),
      completado: false,
      orden: 3,
    },
    {
      id: 4,
      ejercicioId: 'gemelos-prensa',
      ...getEjercicioById('gemelos-prensa'),
      descanso: 60,
      series: crearSeries(3, 15, 80),
      completado: false,
      orden: 4,
    },
    {
      id: 5,
      ejercicioId: 'remo-bajo-mancuerna',
      ...getEjercicioById('remo-bajo-mancuerna'),
      descanso: 90,
      series: crearSeries(3, 12, 20),
      completado: false,
      orden: 5,
    },
    {
      id: 6,
      ejercicioId: 'curl-bicep',
      ...getEjercicioById('curl-bicep'),
      descanso: 60,
      series: crearSeries(3, 12, 10),
      completado: false,
      orden: 6,
    },
  ],
};

// Función para adaptar datos de API (para cuando conectemos el backend)
export const adaptarRutinaAPI = (rutinaAPI) => {
  return {
    ...rutinaAPI,
    ejercicios: rutinaAPI.ejercicios.map((ej, index) => ({
      ...ej,
      ...getEjercicioById(ej.ejercicioId),
      orden: index + 1,
      series: ej.series.map((s, i) => ({
        ...s,
        numero: i + 1,
        repsReal: null,
        pesoReal: null,
        rir: null,
        completada: false,
      })),
      completado: false,
    })),
  };
};

export default rutinaDiaMock;
