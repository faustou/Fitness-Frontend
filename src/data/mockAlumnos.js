// Datos mock de alumnos y sus rutinas asignadas
// Luego vendrán de la API

export const alumnosMock = [
  {
    id: 1,
    nombre: 'María García',
    email: 'maria@email.com',
    avatar: null, // Usar iniciales si es null
    diasSemana: [1, 3, 5], // Lunes, Miércoles, Viernes
    fechaInicio: '2024-01-15',
    objetivo: 'Tonificación',
    ultimaActividad: '2024-01-23',
    estadisticas: {
      rutinasTotales: 12,
      rutinasCompletadas: 10,
      racha: 5, // días consecutivos
    },
  },
  {
    id: 2,
    nombre: 'Juan Pérez',
    email: 'juan@email.com',
    avatar: null,
    diasSemana: [1, 2, 4, 5], // Lunes, Martes, Jueves, Viernes
    fechaInicio: '2024-01-10',
    objetivo: 'Hipertrofia',
    ultimaActividad: '2024-01-22',
    estadisticas: {
      rutinasTotales: 16,
      rutinasCompletadas: 14,
      racha: 3,
    },
  },
  {
    id: 3,
    nombre: 'Carolina López',
    email: 'carolina@email.com',
    avatar: null,
    diasSemana: [1, 3, 5], // Lunes, Miércoles, Viernes
    fechaInicio: '2024-01-20',
    objetivo: 'Pérdida de peso',
    ultimaActividad: '2024-01-21',
    estadisticas: {
      rutinasTotales: 4,
      rutinasCompletadas: 3,
      racha: 0,
    },
  },
  {
    id: 4,
    nombre: 'Diego Martínez',
    email: 'diego@email.com',
    avatar: null,
    diasSemana: [2, 4, 6], // Martes, Jueves, Sábado
    fechaInicio: '2024-01-05',
    objetivo: 'Fuerza',
    ultimaActividad: '2024-01-23',
    estadisticas: {
      rutinasTotales: 18,
      rutinasCompletadas: 17,
      racha: 8,
    },
  },
];

// Rutinas asignadas a cada alumno por día de semana
// Estructura: alumnoId -> díaSemana -> rutina
export const rutinasAsignadasMock = {
  1: { // María García
    1: { // Lunes
      id: 'r1-1',
      nombre: 'Tren Inferior A',
      ejercicios: [
        { ejercicioId: 'hip-trust', series: 3, reps: 12, peso: 40, descanso: 90 },
        { ejercicioId: 'media-sentadilla', series: 4, reps: 10, peso: 50, descanso: 120 },
        { ejercicioId: 'abduccion-maquina', series: 3, reps: 15, peso: 25, descanso: 60 },
        { ejercicioId: 'gemelos-prensa', series: 3, reps: 15, peso: 60, descanso: 60 },
        { ejercicioId: 'patada-gluteo', series: 3, reps: 12, peso: 15, descanso: 60 },
      ],
    },
    3: { // Miércoles
      id: 'r1-3',
      nombre: 'Tren Superior',
      ejercicios: [
        { ejercicioId: 'press-plano', series: 4, reps: 10, peso: 30, descanso: 90 },
        { ejercicioId: 'remo-bajo-mancuerna', series: 3, reps: 12, peso: 15, descanso: 90 },
        { ejercicioId: 'vuelos-laterales', series: 3, reps: 15, peso: 5, descanso: 60 },
        { ejercicioId: 'curl-bicep', series: 3, reps: 12, peso: 8, descanso: 60 },
        { ejercicioId: 'tricep-soga', series: 3, reps: 12, peso: 15, descanso: 60 },
      ],
    },
    5: { // Viernes
      id: 'r1-5',
      nombre: 'Tren Inferior B',
      ejercicios: [
        { ejercicioId: 'hip-trust', series: 4, reps: 10, peso: 45, descanso: 90 },
        { ejercicioId: 'abduccion-polea', series: 3, reps: 12, peso: 10, descanso: 60 },
        { ejercicioId: 'gemelos-parado', series: 3, reps: 15, peso: 0, descanso: 60 },
        { ejercicioId: 'soleo-sentado', series: 3, reps: 15, peso: 30, descanso: 60 },
      ],
    },
  },
  2: { // Juan Pérez
    1: { id: 'r2-1', nombre: 'Push', ejercicios: [] },
    2: { id: 'r2-2', nombre: 'Pull', ejercicios: [] },
    4: { id: 'r2-4', nombre: 'Legs', ejercicios: [] },
    5: { id: 'r2-5', nombre: 'Upper', ejercicios: [] },
  },
  // Otros alumnos sin rutinas asignadas aún
  3: {},
  4: {},
};

// Historial de entrenamientos completados
export const historialMock = {
  1: [ // María García
    {
      fecha: '2024-01-22',
      rutinaId: 'r1-1',
      nombreRutina: 'Tren Inferior A',
      duracion: 3600, // segundos
      ejerciciosCompletados: 5,
      ejerciciosTotales: 5,
      volumenTotal: 4500, // kg totales movidos
    },
    {
      fecha: '2024-01-19',
      rutinaId: 'r1-5',
      nombreRutina: 'Tren Inferior B',
      duracion: 2700,
      ejerciciosCompletados: 4,
      ejerciciosTotales: 4,
      volumenTotal: 3200,
    },
    {
      fecha: '2024-01-17',
      rutinaId: 'r1-3',
      nombreRutina: 'Tren Superior',
      duracion: 3000,
      ejerciciosCompletados: 5,
      ejerciciosTotales: 5,
      volumenTotal: 2800,
    },
  ],
};

// Helper para obtener alumno por ID
export const getAlumnoById = (id) => {
  return alumnosMock.find(a => a.id === parseInt(id));
};

// Helper para obtener rutinas de un alumno
export const getRutinasAlumno = (alumnoId) => {
  return rutinasAsignadasMock[alumnoId] || {};
};

// Helper para obtener historial de un alumno
export const getHistorialAlumno = (alumnoId) => {
  return historialMock[alumnoId] || [];
};

// Nombres de días de la semana
export const diasSemana = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

export default alumnosMock;
