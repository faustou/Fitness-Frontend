// Ejercicios de calentamiento fijos — no se editan desde la app
// gif_url: null hasta que se suban los GIFs al bucket calentamiento-gifs

export const CALENTAMIENTO_DEFAULTS = {
  superior: {
    plancha:           { series: 2, reps: 30 },
    plancha_lateral:   { series: 2, reps: 20 },
    balanceo_brazos:   { series: 1, reps: 15 },
    rotacion_hombros:  { series: 2, reps: 10 },
    flexiones_lentas:  { series: 3, reps: 8 },
  },
  inferior: {
    plancha:              { series: 2, reps: 30 },
    dorsiflexion_tobillo: { series: 2, reps: 10 },
    sentadilla_bw:        { series: 2, reps: 12 },
    estocadas_caminando:  { series: 2, reps: 10 },
    rotacion_cadera:      { series: 2, reps: 10 },
  },
};

export const CALENTAMIENTO_TIPOS = {
  superior: {
    nombre: 'Calentamiento Superior',
    ejercicios: [
      {
        id: 'plancha',
        nombre: 'Plancha',
        descripcion: 'Posición de plancha en el suelo, cuerpo recto de cabeza a talones, core apretado. Sostener el tiempo indicado respirando de forma constante.',
        gif_url: null,
        unidad: 'seg',
      },
      {
        id: 'plancha_lateral',
        nombre: 'Plancha Lateral',
        descripcion: 'De costado, apoyado en un antebrazo y el lateral del pie. Cuerpo alineado, cadera arriba. Mantener la posición el tiempo indicado.',
        gif_url: null,
        unidad: 'seg',
      },
      {
        id: 'balanceo_brazos',
        nombre: 'Balanceo de Brazos',
        descripcion: 'De pie, extendé los brazos hacia los lados y cruzalos frente al pecho alternadamente. Movimiento fluido y controlado, aumentando el rango con cada rep.',
        gif_url: null,
        unidad: 'reps',
      },
      {
        id: 'rotacion_hombros',
        nombre: 'Rotación de Hombros',
        descripcion: 'De pie o sentado, rotá los hombros hacia adelante en círculos amplios. Luego repetí hacia atrás. Cada dirección cuenta como una rep.',
        gif_url: null,
        unidad: 'reps',
      },
      {
        id: 'flexiones_lentas',
        nombre: 'Flexiones Lentas',
        descripcion: 'Flexiones de pecho con tempo lento: 3 segundos para bajar, 1 segundo abajo, 2 segundos para subir. Mantené el cuerpo recto durante todo el movimiento.',
        gif_url: null,
        unidad: 'reps',
      },
    ],
  },
  inferior: {
    nombre: 'Calentamiento Inferior',
    ejercicios: [
      {
        id: 'plancha',
        nombre: 'Plancha',
        descripcion: 'Posición de plancha en el suelo, cuerpo recto de cabeza a talones, core apretado. Sostener el tiempo indicado respirando de forma constante.',
        gif_url: null,
        unidad: 'seg',
      },
      {
        id: 'dorsiflexion_tobillo',
        nombre: 'Dorsiflexión de Tobillo',
        descripcion: 'De pie frente a una pared, apoyá la punta del pie contra ella. Doblá la rodilla hacia adelante tratando de tocar la pared sin levantar el talón. Alternará piernas.',
        gif_url: null,
        unidad: 'reps',
      },
      {
        id: 'sentadilla_bw',
        nombre: 'Sentadilla Bodyweight',
        descripcion: 'Pies a la altura de los hombros, puntillas levemente hacia afuera. Bajá controlando la profundidad, talones en el piso. Subí extendiendo caderas y rodillas.',
        gif_url: null,
        unidad: 'reps',
      },
      {
        id: 'estocadas_caminando',
        nombre: 'Estocadas Caminando',
        descripcion: 'Dá un paso largo hacia adelante y bajá la rodilla trasera cerca del piso. Empujá con el pie delantero para avanzar y repetir con la otra pierna. Cada paso = 1 rep.',
        gif_url: null,
        unidad: 'reps',
      },
      {
        id: 'rotacion_cadera',
        nombre: 'Rotación de Cadera',
        descripcion: 'De pie, apoyate en algo si necesitás. Levantá una rodilla y rotá la cadera hacia afuera en un círculo amplio. Alternará piernas. Movimiento lento y controlado.',
        gif_url: null,
        unidad: 'reps',
      },
    ],
  },
};

/**
 * Devuelve los ejercicios del calentamiento con series/reps aplicadas.
 * Si seriesConfig es null/undefined, usa los valores por defecto.
 */
export const getCalentamientoEjercicios = (tipo, seriesConfig) => {
  if (!tipo || !CALENTAMIENTO_TIPOS[tipo]) return [];
  const defaults = CALENTAMIENTO_DEFAULTS[tipo];
  return CALENTAMIENTO_TIPOS[tipo].ejercicios.map(ej => ({
    ...ej,
    series: seriesConfig?.[ej.id]?.series ?? defaults[ej.id]?.series ?? 2,
    reps:   seriesConfig?.[ej.id]?.reps   ?? defaults[ej.id]?.reps   ?? 10,
  }));
};
