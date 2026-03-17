import { supabase } from '../lib/supabase';
import { calcularE1RM, calcularMejorE1RM } from './calculos.js';

export const getEntrenamientosSemanaActual = async (profileId) => {
  const { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .select('id')
    .eq('profile_id', profileId)
    .single();

  if (alumnoError || !alumno) return [];

  const hoy = new Date();
  const diaSemana = hoy.getDay();

  const lunes = new Date(hoy);
  const diasDesdeeLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  lunes.setDate(hoy.getDate() - diasDesdeeLunes);
  lunes.setHours(0, 0, 0, 0);

  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);

  const fechaInicio = lunes.toISOString().split('T')[0];
  const fechaFin = domingo.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('historial_entrenamientos')
    .select('detalles')
    .eq('alumno_id', alumno.id)
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin);

  if (error) return [];

  return data
    .map(h => h.detalles?.diaSemana)
    .filter(dia => dia !== undefined && dia !== null);
};

export const getHistorialAlumno = async (alumnoId) => {
  let alumno = null;

  if (alumnoId.startsWith('inv-')) {
    const invitacionId = alumnoId.replace('inv-', '');
    const { data, error } = await supabase
      .from('alumnos')
      .select('id')
      .eq('invitacion_id', invitacionId)
      .single();

    if (error && error.code !== 'PGRST116') return [];
    alumno = data;
  } else {
    const { data, error } = await supabase
      .from('alumnos')
      .select('id')
      .eq('profile_id', alumnoId)
      .single();

    if (error) return [];
    alumno = data;
  }

  if (!alumno) return [];

  const { data, error } = await supabase
    .from('historial_entrenamientos')
    .select('*')
    .eq('alumno_id', alumno.id)
    .order('fecha', { ascending: false });

  if (error) throw error;

  return data.map(h => ({
    id: h.id,
    fecha: h.fecha,
    rutinaId: h.rutina_id,
    nombreRutina: h.detalles?.nombreRutina || 'Entrenamiento',
    duracion: h.duracion,
    ejerciciosCompletados: h.ejercicios_completados,
    ejerciciosTotales: h.ejercicios_totales,
    volumenTotal: h.volumen_total,
    detalles: h.detalles,
  }));
};

export const guardarEntrenamiento = async (alumnoProfileId, entrenamiento) => {
  const { data: alumno, error: fetchError } = await supabase
    .from('alumnos')
    .select('id')
    .eq('profile_id', alumnoProfileId)
    .single();

  if (fetchError) throw fetchError;

  const ejerciciosConE1RM = (entrenamiento.detalles?.ejercicios || []).map(ej => {
    const { e1rm, mejorSerie } = calcularMejorE1RM(ej.series);
    return { ...ej, e1rm_sesion: e1rm, mejor_serie: mejorSerie };
  });

  const detallesEnriquecidos = {
    ...entrenamiento.detalles,
    ejercicios: ejerciciosConE1RM,
  };

  const { data, error } = await supabase
    .from('historial_entrenamientos')
    .insert({
      alumno_id: alumno.id,
      rutina_id: entrenamiento.rutinaId,
      duracion: entrenamiento.duracion,
      ejercicios_completados: entrenamiento.ejerciciosCompletados,
      ejercicios_totales: entrenamiento.ejerciciosTotales,
      volumen_total: entrenamiento.volumenTotal,
      detalles: detallesEnriquecidos,
    })
    .select()
    .single();

  if (error) throw error;

  const { data: alumnoData } = await supabase
    .from('alumnos')
    .select('estadisticas')
    .eq('id', alumno.id)
    .single();

  const stats = alumnoData?.estadisticas || {
    rutinasTotales: 0,
    rutinasCompletadas: 0,
    racha: 0,
  };

  const records = stats.records || {};
  const hoy = new Date().toISOString().split('T')[0];

  ejerciciosConE1RM.forEach(ej => {
    if (!ej.e1rm_sesion || ej.e1rm_sesion <= 0) return;
    const actual = records[ej.nombre];
    if (!actual || ej.e1rm_sesion > actual.e1rm) {
      records[ej.nombre] = {
        e1rm: ej.e1rm_sesion,
        fecha: hoy,
        peso: ej.mejor_serie?.peso,
        reps: ej.mejor_serie?.reps,
        rir: ej.mejor_serie?.rir,
      };
    }
  });

  await supabase
    .from('alumnos')
    .update({
      estadisticas: {
        rutinasTotales: stats.rutinasTotales + 1,
        rutinasCompletadas: stats.rutinasCompletadas + 1,
        racha: stats.racha + 1,
        records,
      },
    })
    .eq('id', alumno.id);

  return data;
};

export const eliminarEntrenamiento = async (entrenamientoId) => {
  const { data: entrenamiento, error: fetchError } = await supabase
    .from('historial_entrenamientos')
    .select('alumno_id')
    .eq('id', entrenamientoId)
    .single();

  if (fetchError) throw fetchError;

  const { error: deleteError } = await supabase
    .from('historial_entrenamientos')
    .delete()
    .eq('id', entrenamientoId);

  if (deleteError) throw deleteError;

  const { data: alumnoData } = await supabase
    .from('alumnos')
    .select('estadisticas')
    .eq('id', entrenamiento.alumno_id)
    .single();

  if (alumnoData) {
    const stats = alumnoData.estadisticas || {
      rutinasTotales: 0,
      rutinasCompletadas: 0,
      racha: 0,
    };

    await supabase
      .from('alumnos')
      .update({
        estadisticas: {
          rutinasTotales: Math.max(0, stats.rutinasTotales - 1),
          rutinasCompletadas: Math.max(0, stats.rutinasCompletadas - 1),
          racha: Math.max(0, stats.racha - 1),
        },
      })
      .eq('id', entrenamiento.alumno_id);
  }

  return { success: true };
};

export const getRachaAlumno = async (profileId) => {
  const { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .select('id')
    .eq('profile_id', profileId)
    .single();

  if (alumnoError || !alumno) return 0;

  const { data: historial, error } = await supabase
    .from('historial_entrenamientos')
    .select('fecha')
    .eq('alumno_id', alumno.id)
    .order('fecha', { ascending: false });

  if (error || !historial || historial.length === 0) return 0;

  const fechasEntrenamiento = new Set(historial.map(h => h.fecha));

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let racha = 0;
  let fechaActual = new Date(hoy);

  const hoyStr = hoy.toISOString().split('T')[0];
  if (!fechasEntrenamiento.has(hoyStr)) {
    fechaActual.setDate(fechaActual.getDate() - 1);
  }

  while (true) {
    const fechaStr = fechaActual.toISOString().split('T')[0];
    if (fechasEntrenamiento.has(fechaStr)) {
      racha++;
      fechaActual.setDate(fechaActual.getDate() - 1);
    } else {
      break;
    }
  }

  return racha;
};

export const getHistorialSemanal = async (alumnoId, mesAnio = null) => {
  let alumno = null;

  if (alumnoId.startsWith('inv-')) {
    const invitacionId = alumnoId.replace('inv-', '');
    const { data } = await supabase
      .from('alumnos')
      .select('id, ciclo_config, ciclo_fecha_inicio')
      .eq('invitacion_id', invitacionId)
      .single();
    alumno = data;
  } else {
    const { data } = await supabase
      .from('alumnos')
      .select('id, ciclo_config, ciclo_fecha_inicio')
      .eq('profile_id', alumnoId)
      .single();
    alumno = data;
  }

  if (!alumno) return { semanas: [], ejercicios: {} };

  let query = supabase
    .from('historial_entrenamientos')
    .select('*')
    .eq('alumno_id', alumno.id)
    .order('fecha', { ascending: true });

  if (mesAnio) {
    const [anio, mes] = mesAnio.split('-').map(Number);
    const primerDia = `${anio}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(anio, mes, 0).getDate();
    const ultimaFecha = `${anio}-${String(mes).padStart(2, '0')}-${ultimoDia}`;
    query = query.gte('fecha', primerDia).lte('fecha', ultimaFecha);
  }

  const { data: historial, error } = await query;

  if (error || !historial || historial.length === 0) return { semanas: [], ejercicios: {} };

  const semanasMap = {};
  const ejerciciosProgreso = {};

  historial.forEach(h => {
    const fecha = new Date(h.fecha);
    let semanaNum = 1;

    if (alumno.ciclo_fecha_inicio) {
      const fechaInicio = new Date(alumno.ciclo_fecha_inicio);
      const diffDays = Math.floor((fecha - fechaInicio) / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);
      const duracion = alumno.ciclo_config?.duracion_semanas || 4;
      semanaNum = (diffWeeks % duracion) + 1;
    } else {
      const startOfYear = new Date(fecha.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((fecha - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
      semanaNum = weekNum;
    }

    if (!semanasMap[semanaNum]) {
      semanasMap[semanaNum] = {
        semana: semanaNum,
        entrenamientos: 0,
        volumenTotal: 0,
        duracionTotal: 0,
        ejerciciosCompletados: 0,
        fechaInicio: h.fecha,
        fechaFin: h.fecha,
      };
    }

    semanasMap[semanaNum].entrenamientos++;
    semanasMap[semanaNum].volumenTotal += h.volumen_total || 0;
    semanasMap[semanaNum].duracionTotal += h.duracion || 0;
    semanasMap[semanaNum].ejerciciosCompletados += h.ejercicios_completados || 0;
    if (h.fecha > semanasMap[semanaNum].fechaFin) {
      semanasMap[semanaNum].fechaFin = h.fecha;
    }

    if (h.detalles?.ejercicios) {
      h.detalles.ejercicios.forEach(ej => {
        if (!ejerciciosProgreso[ej.nombre]) {
          ejerciciosProgreso[ej.nombre] = [];
        }

        let pesoMax = 0;
        let volumenEj = 0;
        let repsTotal = 0;

        (ej.series || []).forEach(serie => {
          const peso = serie.pesoReal ?? serie.pesoObjetivo ?? 0;
          const reps = serie.repsReal ?? serie.repsObjetivo ?? 0;
          if (peso > pesoMax) pesoMax = peso;
          volumenEj += peso * reps;
          repsTotal += reps;
        });

        const e1rmSesion = ej.e1rm_sesion || (() => {
          let max = 0;
          (ej.series || []).forEach(s => {
            if (!s.completada) return;
            const p = s.pesoReal ?? s.pesoObjetivo ?? 0;
            const r = s.repsReal ?? s.repsObjetivo ?? 0;
            const e = calcularE1RM(p, r, s.rir ?? 0);
            if (e > max) max = e;
          });
          return max;
        })();

        ejerciciosProgreso[ej.nombre].push({
          semana: semanaNum,
          fecha: h.fecha,
          pesoMax,
          volumen: volumenEj,
          reps: repsTotal,
          series: ej.series?.length || 0,
          e1rm: e1rmSesion,
        });
      });
    }
  });

  const semanas = Object.values(semanasMap).sort((a, b) => a.semana - b.semana);

  return {
    semanas,
    ejercicios: ejerciciosProgreso,
    cicloActivo: alumno.ciclo_config?.activo || false,
  };
};

export const crearEntrenamientosMuestra = async (alumnoId) => {
  let alumno = null;

  if (alumnoId.startsWith('inv-')) {
    const invitacionId = alumnoId.replace('inv-', '');
    const { data } = await supabase
      .from('alumnos')
      .select('id')
      .eq('invitacion_id', invitacionId)
      .single();
    alumno = data;
  } else {
    const { data } = await supabase
      .from('alumnos')
      .select('id')
      .eq('profile_id', alumnoId)
      .single();
    alumno = data;
  }

  if (!alumno) throw new Error('Alumno no encontrado');

  await supabase
    .from('historial_entrenamientos')
    .delete()
    .eq('alumno_id', alumno.id);

  const hoy = new Date();
  const entrenamientosMuestra = [];

  const rutinasSplit = {
    A: [
      { nombre: 'Press Plano', pesoBase: 60, categoria: 'pecho' },
      { nombre: 'Press Inclinado', pesoBase: 50, categoria: 'pecho' },
      { nombre: 'Aperturas', pesoBase: 14, categoria: 'pecho' },
      { nombre: 'Fondos', pesoBase: 0, categoria: 'triceps' },
      { nombre: 'Extensión Tríceps Polea', pesoBase: 25, categoria: 'triceps' },
    ],
    B: [
      { nombre: 'Dominadas', pesoBase: 0, categoria: 'espalda' },
      { nombre: 'Remo con Barra', pesoBase: 60, categoria: 'espalda' },
      { nombre: 'Jalón al Pecho', pesoBase: 55, categoria: 'espalda' },
      { nombre: 'Curl Bíceps', pesoBase: 12, categoria: 'biceps' },
      { nombre: 'Curl Martillo', pesoBase: 10, categoria: 'biceps' },
    ],
    C: [
      { nombre: 'Sentadilla', pesoBase: 80, categoria: 'piernas' },
      { nombre: 'Peso Muerto', pesoBase: 100, categoria: 'piernas' },
      { nombre: 'Prensa', pesoBase: 150, categoria: 'piernas' },
      { nombre: 'Extensión Cuádriceps', pesoBase: 40, categoria: 'piernas' },
      { nombre: 'Curl Femoral', pesoBase: 35, categoria: 'piernas' },
    ],
    D: [
      { nombre: 'Press Militar', pesoBase: 40, categoria: 'hombros' },
      { nombre: 'Vuelos Laterales', pesoBase: 8, categoria: 'hombros' },
      { nombre: 'Face Pulls', pesoBase: 20, categoria: 'hombros' },
      { nombre: 'Elevaciones Frontales', pesoBase: 8, categoria: 'hombros' },
      { nombre: 'Plancha', pesoBase: 0, categoria: 'core' },
    ],
  };

  const diasRutina = ['A', 'B', 'C', 'D'];
  const nombresRutina = {
    A: 'Pecho y Tríceps',
    B: 'Espalda y Bíceps',
    C: 'Piernas',
    D: 'Hombros y Core',
  };

  for (let semana = 1; semana <= 4; semana++) {
    const entrenamientosPorSemana = 4 + (Math.random() > 0.5 ? 1 : 0);
    const diasOrdenados = [...diasRutina].sort(() => Math.random() - 0.3);

    for (let entrenoNum = 0; entrenoNum < entrenamientosPorSemana; entrenoNum++) {
      const diaRutina = diasOrdenados[entrenoNum % 4];
      const ejerciciosDelDia = rutinasSplit[diaRutina];

      const fecha = new Date(hoy);
      const diasAtras = (4 - semana) * 7 + Math.floor((7 / entrenamientosPorSemana) * entrenoNum);
      fecha.setDate(fecha.getDate() - diasAtras);

      const factorProgresion = 1 + ((semana - 1) * 0.05);
      const esDescarga = semana === 4;
      const factorDescarga = esDescarga ? 0.65 : 1;

      const detallesEjercicios = ejerciciosDelDia.map(ej => {
        const pesoBase = ej.pesoBase || 0;
        const pesoReal = Math.round(pesoBase * factorProgresion * factorDescarga);
        const series = [];
        const numSeries = ej.categoria === 'core' ? 3 : (3 + Math.floor(Math.random() * 2));

        for (let s = 1; s <= numSeries; s++) {
          let repsObjetivo = esDescarga ? 15 : (12 - Math.floor((semana - 1) * 0.5));
          if (s === numSeries && Math.random() > 0.5) {
            repsObjetivo = Math.max(6, repsObjetivo - 2);
          }
          const repsReal = repsObjetivo + Math.floor(Math.random() * 3) - 1;

          series.push({
            numero: s,
            pesoObjetivo: pesoBase,
            pesoReal: pesoReal,
            repsObjetivo: repsObjetivo,
            repsReal: Math.max(1, repsReal),
            rir: esDescarga ? 4 : Math.max(0, 3 - Math.floor(Math.random() * 3)),
            completada: true,
          });
        }

        return { nombre: ej.nombre, categoria: ej.categoria, completado: true, series };
      });

      let volumenTotal = 0;
      let ejerciciosCompletados = 0;

      detallesEjercicios.forEach(ej => {
        if (ej.completado) ejerciciosCompletados++;
        ej.series.forEach(s => {
          volumenTotal += (s.pesoReal || 0) * (s.repsReal || 0);
        });
      });

      const duracionBase = detallesEjercicios.length * (8 + Math.floor(Math.random() * 5));

      entrenamientosMuestra.push({
        alumno_id: alumno.id,
        rutina_id: null,
        fecha: fecha.toISOString().split('T')[0],
        duracion: duracionBase * 60,
        ejercicios_completados: ejerciciosCompletados,
        ejercicios_totales: detallesEjercicios.length,
        volumen_total: Math.round(volumenTotal),
        detalles: {
          nombreRutina: `${nombresRutina[diaRutina]}${esDescarga ? ' (Descarga)' : ''}`,
          diaSemana: fecha.getDay(),
          semana: semana,
          ejercicios: detallesEjercicios,
        },
      });
    }
  }

  const { data, error } = await supabase
    .from('historial_entrenamientos')
    .insert(entrenamientosMuestra)
    .select();

  if (error) throw error;

  const fechaInicioCiclo = new Date(hoy);
  fechaInicioCiclo.setDate(fechaInicioCiclo.getDate() - 28);

  await supabase
    .from('alumnos')
    .update({
      estadisticas: {
        rutinasTotales: entrenamientosMuestra.length,
        rutinasCompletadas: entrenamientosMuestra.length,
        racha: 4,
      },
      ciclo_config: {
        activo: true,
        duracion_semanas: 4,
        semana_descarga: 4,
      },
      ciclo_fecha_inicio: fechaInicioCiclo.toISOString().split('T')[0],
    })
    .eq('id', alumno.id);

  return { insertados: data.length, semanas: 4 };
};

export const seedEntrenamientosTodosAlumnos = async (profesorId) => {
  const { data: invitaciones, error: invError } = await supabase
    .from('invitaciones')
    .select('id, email, nombre')
    .eq('profesor_id', profesorId);

  if (invError) throw new Error('Error obteniendo invitaciones: ' + invError.message);

  const invitacionIds = (invitaciones || []).map(i => i.id);
  let alumnos = [];

  if (invitacionIds.length > 0) {
    const { data: alumnosData } = await supabase
      .from('alumnos')
      .select('id, profile_id, invitacion_id')
      .in('invitacion_id', invitacionIds);

    if (alumnosData) {
      alumnos = alumnosData.map(a => {
        const inv = invitaciones.find(i => i.id === a.invitacion_id);
        return { ...a, nombre: inv?.nombre || 'Alumno' };
      });
    }
  }

  const emails = (invitaciones || []).map(i => i.email);

  if (emails.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nombre, email')
      .in('email', emails)
      .eq('rol', 'alumno');

    if (profiles) {
      for (const profile of profiles) {
        const yaExiste = alumnos.some(a => a.profile_id === profile.id);
        if (!yaExiste) {
          const { data: alumnoData } = await supabase
            .from('alumnos')
            .select('id, profile_id, invitacion_id')
            .eq('profile_id', profile.id)
            .single();

          if (alumnoData) {
            alumnos.push({ ...alumnoData, nombre: profile.nombre });
          }
        }
      }
    }
  }

  if (alumnos.length === 0) throw new Error('No se encontraron alumnos para este profesor');

  const resultados = [];

  for (const alumno of alumnos) {
    try {
      const alumnoId = alumno.profile_id || `inv-${alumno.invitacion_id}`;
      const resultado = await crearEntrenamientosMuestra(alumnoId);
      resultados.push({ alumno: alumno.nombre || alumnoId, ...resultado, exito: true });
    } catch (err) {
      resultados.push({ alumno: alumno.nombre || alumno.id, error: err.message, exito: false });
    }
  }

  return resultados;
};
