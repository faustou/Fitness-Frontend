import { supabase } from '../lib/supabase';

// ==================== ALUMNOS ====================

/**
 * Obtener alumnos con sus perfiles
 * @param {string|null} profesorId - Si se pasa, filtra solo los alumnos de ese profesor
 */
export const getAlumnos = async (profesorId = null) => {
  let profiles = [];
  let alumnos = [];

  if (profesorId) {
    // Filtrar por profesor: obtener alumnos donde profesor_id coincide
    const { data: alumnosData, error: alumnosError } = await supabase
      .from('alumnos')
      .select('*')
      .eq('profesor_id', profesorId);

    if (alumnosError) throw alumnosError;
    alumnos = alumnosData || [];

    // Obtener los perfiles de esos alumnos
    const profileIds = alumnos.map(a => a.profile_id).filter(Boolean);
    if (profileIds.length > 0) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .in('id', profileIds);
      if (error) throw error;
      profiles = data || [];
    }
  } else {
    // Sin filtro: obtener todos los alumnos del sistema
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('rol', 'alumno');
    if (error) throw error;
    profiles = data || [];

    const { data: alumnosData, error: alumnosError } = await supabase
      .from('alumnos')
      .select('*');
    if (alumnosError) throw alumnosError;
    alumnos = alumnosData || [];
  }

  // Combinar perfiles con datos de alumnos
  const alumnosCompletos = profiles.map(profile => {
    const alumnoData = alumnos.find(a => a.profile_id === profile.id);
    return {
      id: profile.id,
      nombre: profile.nombre,
      email: profile.email,
      avatar: profile.avatar_url,
      objetivo: alumnoData?.objetivo || 'General',
      diasSemana: alumnoData?.dias_semana || [],
      fechaInicio: alumnoData?.fecha_inicio || new Date().toISOString().split('T')[0],
      estadisticas: alumnoData?.estadisticas || {
        rutinasTotales: 0,
        rutinasCompletadas: 0,
        racha: 0,
      },
      pendiente: false,
    };
  });

  // Obtener invitaciones pendientes (filtradas por profesor si corresponde)
  let invQuery = supabase.from('invitaciones').select('*').eq('usado', false);
  if (profesorId) invQuery = invQuery.eq('profesor_id', profesorId);
  const { data: invitaciones } = await invQuery;

  const invitacionesPendientes = (invitaciones || []).map(inv => ({
    id: `inv-${inv.id}`,
    invitacionId: inv.id,
    nombre: inv.nombre,
    email: inv.email,
    avatar: null,
    objetivo: inv.objetivo || 'General',
    diasSemana: inv.dias_semana || [],
    fechaInicio: inv.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    estadisticas: {
      rutinasTotales: 0,
      rutinasCompletadas: 0,
      racha: 0,
    },
    pendiente: true,
  }));

  return [...alumnosCompletos, ...invitacionesPendientes];
};

/**
 * Obtener un alumno por su ID (profile_id o inv-{invitacionId})
 */
export const getAlumnoById = async (id) => {
  // Verificar si es una invitación pendiente
  if (id.startsWith('inv-')) {
    const invitacionId = id.replace('inv-', '');
    const { data: invitacion, error: invError } = await supabase
      .from('invitaciones')
      .select('*')
      .eq('id', invitacionId)
      .single();

    if (invError) {
      throw invError;
    }

    return {
      id: id,
      invitacionId: invitacionId,
      nombre: invitacion.nombre,
      email: invitacion.email,
      avatar: null,
      objetivo: invitacion.objetivo || 'General',
      diasSemana: invitacion.dias_semana || [],
      fechaInicio: invitacion.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      estadisticas: {
        rutinasTotales: 0,
        rutinasCompletadas: 0,
        racha: 0,
      },
      pendiente: true,
    };
  }

  // Es un alumno registrado
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (profileError) {
    throw profileError;
  }

  const { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .select('*')
    .eq('profile_id', id)
    .single();

  if (alumnoError && alumnoError.code !== 'PGRST116') {
    throw alumnoError;
  }

  return {
    id: profile.id,
    nombre: profile.nombre,
    email: profile.email,
    avatar: profile.avatar_url,
    objetivo: alumno?.objetivo || 'General',
    diasSemana: alumno?.dias_semana || [],
    fechaInicio: alumno?.fecha_inicio || new Date().toISOString().split('T')[0],
    estadisticas: alumno?.estadisticas || {
      rutinasTotales: 0,
      rutinasCompletadas: 0,
      racha: 0,
    },
    pendiente: false,
  };
};

/**
 * Actualizar datos de un alumno
 */
export const actualizarAlumno = async (profileId, datos) => {
  const { data, error } = await supabase
    .from('alumnos')
    .update({
      objetivo: datos.objetivo,
      dias_semana: datos.diasSemana,
      estadisticas: datos.estadisticas,
    })
    .eq('profile_id', profileId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

// ==================== RUTINAS ====================

/**
 * Obtener las rutinas del alumno logueado (para vista de alumno)
 * Retorna las rutinas formateadas para el componente de entrenamiento
 */
export const getMisRutinas = async (profileId) => {
  // Buscar el registro del alumno por profile_id
  let { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .select('id')
    .eq('profile_id', profileId)
    .single();

  // Obtener el email del profile para buscar por invitación si es necesario
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', profileId)
    .single();

  // Si encontramos alumno por profile_id, verificar si tiene rutinas
  if (alumno) {
    const { data: rutinasCheck } = await supabase
      .from('rutinas')
      .select('id')
      .eq('alumno_id', alumno.id)
      .limit(1);

    // Si no tiene rutinas, buscar si hay otro registro por invitación que sí tenga
    if (!rutinasCheck || rutinasCheck.length === 0) {
      if (profile?.email) {
        const { data: invitacion } = await supabase
          .from('invitaciones')
          .select('id')
          .eq('email', profile.email)
          .single();

        if (invitacion) {
          const { data: alumnoInv } = await supabase
            .from('alumnos')
            .select('id')
            .eq('invitacion_id', invitacion.id)
            .single();

          if (alumnoInv && alumnoInv.id !== alumno.id) {
            // Hay otro registro con las rutinas - usar ese y vincular
            await supabase
              .from('alumnos')
              .update({ profile_id: profileId })
              .eq('id', alumnoInv.id);

            // Eliminar el registro duplicado sin rutinas
            await supabase
              .from('alumnos')
              .delete()
              .eq('id', alumno.id);

            // Marcar invitación como usada
            await supabase
              .from('invitaciones')
              .update({ usado: true })
              .eq('id', invitacion.id);

            alumno = alumnoInv;
          }
        }
      }
    }
  } else if (profile?.email) {
    // No hay registro por profile_id, buscar por invitación
    const { data: invitacion } = await supabase
      .from('invitaciones')
      .select('id')
      .eq('email', profile.email)
      .single();

    if (invitacion) {
      const { data: alumnoInv } = await supabase
        .from('alumnos')
        .select('id')
        .eq('invitacion_id', invitacion.id)
        .single();

      if (alumnoInv) {
        // Vincular con profile_id
        await supabase
          .from('alumnos')
          .update({ profile_id: profileId })
          .eq('id', alumnoInv.id);

        // Marcar invitación como usada
        await supabase
          .from('invitaciones')
          .update({ usado: true })
          .eq('id', invitacion.id);

        alumno = alumnoInv;
      }
    }
  }

  if (!alumno) {
    return { rutinas: {}, ciclo: { activo: false } };
  }

  // Obtener info del ciclo
  const cicloInfo = await getCicloInfo(profile?.id || profileId);
  const semanaActual = cicloInfo.activo ? cicloInfo.semanaActual : null;

  const { data: rutinas, error } = await supabase
    .from('rutinas')
    .select(`
      *,
      rutina_ejercicios (
        *,
        ejercicios (*)
      )
    `)
    .eq('alumno_id', alumno.id)
    .order('dia_semana', { ascending: true });

  if (error) {
    throw error;
  }

  // Transformar a estructura por día
  const rutinasPorDia = {};
  rutinas.forEach(rutina => {
    // Ordenar ejercicios por su orden
    const ejerciciosOrdenados = [...(rutina.rutina_ejercicios || [])].sort((a, b) => a.orden - b.orden);

    rutinasPorDia[rutina.dia_semana] = {
      id: rutina.id,
      nombre: rutina.nombre,
      diaSemana: rutina.dia_semana,
      ejercicios: ejerciciosOrdenados.map(re => {
        // Obtener peso, reps y rir para la semana actual si hay ciclo activo
        let pesoSemana = re.peso;
        let repsSemana = re.reps;
        let rirSemana = re.rir;

        if (semanaActual && re.cargas_semana && re.cargas_semana[semanaActual]) {
          pesoSemana = re.cargas_semana[semanaActual].peso ?? re.peso;
          repsSemana = re.cargas_semana[semanaActual].reps ?? re.reps;
          rirSemana = re.cargas_semana[semanaActual].rir ?? re.rir;
        }

        return {
          ejercicioId: re.ejercicio_id,
          series: re.series,
          reps: repsSemana,
          repsBase: re.reps,
          peso: pesoSemana,
          pesoBase: re.peso,
          descanso: re.descanso,
          rir: rirSemana,
          nombre: re.ejercicios?.nombre,
          descripcion: re.ejercicios?.descripcion,
          categoria: re.ejercicios?.categoria,
          dificultad: re.ejercicios?.dificultad,
          cargasSemana: re.cargas_semana,
        };
      }),
    };
  });

  return { rutinas: rutinasPorDia, ciclo: cicloInfo };
};

// Helper: obtener mes actual en formato YYYY-MM
export const getMesActual = () => {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
};

// Helper: obtener nombre del mes en español
export const getNombreMes = (mesAnio) => {
  if (!mesAnio) return '';
  const [anio, mes] = mesAnio.split('-');
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${meses[parseInt(mes) - 1]} ${anio}`;
};

// Helper: obtener mes siguiente
export const getMesSiguiente = (mesAnio) => {
  if (!mesAnio) mesAnio = getMesActual();
  const [anio, mes] = mesAnio.split('-').map(Number);
  const nuevaFecha = new Date(anio, mes); // mes ya es el siguiente (0-indexed + 1)
  return `${nuevaFecha.getFullYear()}-${String(nuevaFecha.getMonth() + 1).padStart(2, '0')}`;
};

/**
 * Obtener los meses disponibles para un alumno (que tienen rutinas)
 */
export const getMesesDisponibles = async (alumnoId) => {
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

  if (!alumno) return [];

  const { data: rutinas } = await supabase
    .from('rutinas')
    .select('mes_anio')
    .eq('alumno_id', alumno.id)
    .not('mes_anio', 'is', null);

  // Obtener meses únicos y ordenarlos
  const mesesUnicos = [...new Set((rutinas || []).map(r => r.mes_anio))].sort();

  // Siempre incluir mes actual y siguiente si no están
  const mesActual = getMesActual();
  const mesSiguiente = getMesSiguiente(mesActual);

  if (!mesesUnicos.includes(mesActual)) mesesUnicos.push(mesActual);
  if (!mesesUnicos.includes(mesSiguiente)) mesesUnicos.push(mesSiguiente);

  return mesesUnicos.sort();
};

/**
 * Obtener rutinas de un alumno (para vista del profesor)
 * @param {string} alumnoId - ID del alumno o inv-{invitacionId}
 * @param {string} mesAnio - Mes en formato YYYY-MM (opcional, default: mes actual)
 */
export const getRutinasAlumno = async (alumnoId, mesAnio = null) => {
  let alumno = null;

  // Si no se especifica mes, usar el actual
  if (!mesAnio) {
    mesAnio = getMesActual();
  }

  // Verificar si es una invitación pendiente
  if (alumnoId.startsWith('inv-')) {
    const invitacionId = alumnoId.replace('inv-', '');
    // Buscar alumnos record por invitacion_id
    const { data, error } = await supabase
      .from('alumnos')
      .select('id')
      .eq('invitacion_id', invitacionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return {};
    }
    alumno = data;
  } else {
    // Es un alumno registrado - buscar por profile_id
    const { data, error } = await supabase
      .from('alumnos')
      .select('id')
      .eq('profile_id', alumnoId)
      .single();

    if (error) {
      return {};
    }
    alumno = data;
  }

  // Si no hay registro de alumno, retornar vacío
  if (!alumno) {
    return {};
  }

  // Buscar rutinas para el mes especificado
  let query = supabase
    .from('rutinas')
    .select(`
      *,
      rutina_ejercicios (
        *,
        ejercicios (*)
      )
    `)
    .eq('alumno_id', alumno.id);

  // Filtrar por mes si la columna existe
  // Si mes_anio es null en la DB, también incluir esas rutinas (retrocompatibilidad)
  query = query.or(`mes_anio.eq.${mesAnio},mes_anio.is.null`);

  const { data: rutinas, error } = await query;

  if (error) {
    throw error;
  }

  // Transformar a la estructura esperada por el frontend
  // { diaSemana: { id, nombre, ejercicios: [...] } }
  const rutinasPorDia = {};
  rutinas.forEach(rutina => {
    rutinasPorDia[rutina.dia_semana] = {
      id: rutina.id,
      nombre: rutina.nombre,
      mesAnio: rutina.mes_anio,
      ejercicios: rutina.rutina_ejercicios.map(re => ({
        ejercicioId: re.ejercicio_id,
        series: re.series,
        reps: re.reps,
        peso: re.peso,
        descanso: re.descanso,
        rir: re.rir,
        nombre: re.ejercicios?.nombre,
        gif: re.ejercicios?.gif_url,
        cargasSemana: re.cargas_semana,
      })),
    };
  });

  return rutinasPorDia;
};

/**
 * Crear o actualizar una rutina
 * @param {string} alumnoProfileId - ID del alumno
 * @param {number} diaSemana - Día de la semana (1-6)
 * @param {object} rutina - Datos de la rutina
 * @param {string} mesAnio - Mes en formato YYYY-MM (opcional, default: mes actual)
 */
export const guardarRutina = async (alumnoProfileId, diaSemana, rutina, mesAnio = null) => {
  // Si no se especifica mes, usar el actual
  if (!mesAnio) {
    mesAnio = getMesActual();
  }
  let alumno = null;

  // Verificar si es una invitación pendiente
  if (alumnoProfileId.startsWith('inv-')) {
    const invitacionId = alumnoProfileId.replace('inv-', '');

    // Buscar si ya existe un registro en alumnos para esta invitación
    let { data: existingAlumno, error: findError } = await supabase
      .from('alumnos')
      .select('id')
      .eq('invitacion_id', invitacionId)
      .single();

    if (findError && findError.code === 'PGRST116') {
      // No existe, crear uno nuevo
      const { data: nuevoAlumno, error: createError } = await supabase
        .from('alumnos')
        .insert({
          invitacion_id: invitacionId,
          objetivo: 'General',
          dias_semana: [],
          estadisticas: {
            rutinasTotales: 0,
            rutinasCompletadas: 0,
            racha: 0,
          },
        })
        .select('id')
        .single();

      if (createError) {
        throw createError;
      }
      alumno = nuevoAlumno;
    } else if (findError) {
      throw findError;
    } else {
      alumno = existingAlumno;
    }
  } else {
    // Es un alumno registrado - buscar por profile_id
    let { data: existingAlumno, error: alumnoError } = await supabase
      .from('alumnos')
      .select('id')
      .eq('profile_id', alumnoProfileId)
      .single();

    // Si no existe el registro en alumnos, crearlo
    if (alumnoError && alumnoError.code === 'PGRST116') {
      const { data: nuevoAlumno, error: createError } = await supabase
        .from('alumnos')
        .insert({
          profile_id: alumnoProfileId,
          objetivo: 'General',
          dias_semana: [],
          estadisticas: {
            rutinasTotales: 0,
            rutinasCompletadas: 0,
            racha: 0,
          },
        })
        .select('id')
        .single();

      if (createError) {
        throw createError;
      }
      alumno = nuevoAlumno;
    } else if (alumnoError) {
      throw alumnoError;
    } else {
      alumno = existingAlumno;
    }
  }

  // Verificar si ya existe una rutina para ese día Y mes
  const { data: existente } = await supabase
    .from('rutinas')
    .select('id')
    .eq('alumno_id', alumno.id)
    .eq('dia_semana', diaSemana)
    .eq('mes_anio', mesAnio)
    .single();

  let rutinaId;

  if (existente) {
    // Actualizar rutina existente
    const { data, error } = await supabase
      .from('rutinas')
      .update({ nombre: rutina.nombre, mes_anio: mesAnio })
      .eq('id', existente.id)
      .select()
      .single();

    if (error) throw error;
    rutinaId = data.id;

    // Eliminar ejercicios antiguos
    await supabase
      .from('rutina_ejercicios')
      .delete()
      .eq('rutina_id', rutinaId);
  } else {
    // Crear nueva rutina
    const { data, error } = await supabase
      .from('rutinas')
      .insert({
        alumno_id: alumno.id,
        dia_semana: diaSemana,
        nombre: rutina.nombre,
        mes_anio: mesAnio,
      })
      .select()
      .single();

    if (error) throw error;
    rutinaId = data.id;
  }

  // Insertar ejercicios
  if (rutina.ejercicios && rutina.ejercicios.length > 0) {
    const ejerciciosInsert = rutina.ejercicios.map((ej, index) => ({
      rutina_id: rutinaId,
      ejercicio_id: ej.ejercicioId,
      orden: index,
      series: ej.series,
      reps: ej.reps,
      peso: ej.peso,
      descanso: ej.descanso,
      rir: ej.rir ?? null,
      cargas_semana: ej.cargasSemana || null,
    }));

    const { error: ejError } = await supabase
      .from('rutina_ejercicios')
      .insert(ejerciciosInsert);

    if (ejError) throw ejError;
  }

  return { id: rutinaId };
};

// ==================== e1RM ====================

/**
 * Fórmula de Brzycki para estimar 1 Rep Max
 * 1RM = Peso / (1.0278 - 0.0278 × (Reps + RIR))
 * @param {number} peso - Peso levantado (kg)
 * @param {number} reps - Repeticiones realizadas
 * @param {number} rir - Reps in Reserve (0 si no se usa)
 * @returns {number} e1RM redondeado a 1 decimal
 */
export const calcularE1RM = (peso, reps, rir = 0) => {
  if (!peso || peso <= 0 || !reps || reps <= 0) return 0;
  const repsConRIR = (reps || 0) + (rir ?? 0);
  const denominador = 1.0278 - 0.0278 * repsConRIR;
  if (denominador <= 0) return 0;
  return Math.round((peso / denominador) * 10) / 10;
};

/**
 * Calcula el mejor e1RM de una sesión de un ejercicio
 * Evalúa todas las series completadas y devuelve el valor más alto
 * @param {Array} series - Array de series del ejercicio
 * @returns {{ e1rm: number, mejorSerie: object|null }}
 */
export const calcularMejorE1RM = (series) => {
  let maxE1RM = 0;
  let mejorSerie = null;

  (series || []).forEach(s => {
    if (!s.completada) return;
    const peso = s.pesoReal ?? s.pesoObjetivo ?? 0;
    const reps = s.repsReal ?? s.repsObjetivo ?? 0;
    const rir = s.rir ?? 0;
    const e1rm = calcularE1RM(peso, reps, rir);
    if (e1rm > maxE1RM) {
      maxE1RM = e1rm;
      mejorSerie = { peso, reps, rir, e1rm };
    }
  });

  return { e1rm: maxE1RM, mejorSerie };
};

// ==================== HISTORIAL ====================

/**
 * Obtener los días de la semana actual que ya fueron completados
 * Retorna un Set con los días de la semana (1-6) que tienen entrenamiento esta semana
 */
export const getEntrenamientosSemanaActual = async (profileId) => {
  // Buscar el alumno por profile_id
  const { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .select('id')
    .eq('profile_id', profileId)
    .single();

  if (alumnoError || !alumno) {
    return [];
  }

  // Calcular inicio y fin de la semana actual (lunes a domingo)
  const hoy = new Date();
  const diaSemana = hoy.getDay(); // 0 = domingo, 1 = lunes, etc.

  // Calcular el lunes de esta semana
  const lunes = new Date(hoy);
  const diasDesdeeLunes = diaSemana === 0 ? 6 : diaSemana - 1; // Si es domingo, retroceder 6 días
  lunes.setDate(hoy.getDate() - diasDesdeeLunes);
  lunes.setHours(0, 0, 0, 0);

  // Calcular el domingo de esta semana
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);

  // Formatear fechas para la query
  const fechaInicio = lunes.toISOString().split('T')[0];
  const fechaFin = domingo.toISOString().split('T')[0];

  const { data, error } = await supabase
    .from('historial_entrenamientos')
    .select('detalles')
    .eq('alumno_id', alumno.id)
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin);

  if (error) {
    return [];
  }

  // Extraer los días de la semana de los entrenamientos
  const diasCompletados = data
    .map(h => h.detalles?.diaSemana)
    .filter(dia => dia !== undefined && dia !== null);

  return diasCompletados;
};

/**
 * Obtener historial de entrenamientos de un alumno
 * Soporta tanto profile_id como inv-{invitacionId}
 */
export const getHistorialAlumno = async (alumnoId) => {
  let alumno = null;

  // Verificar si es una invitación pendiente
  if (alumnoId.startsWith('inv-')) {
    const invitacionId = alumnoId.replace('inv-', '');
    const { data, error } = await supabase
      .from('alumnos')
      .select('id')
      .eq('invitacion_id', invitacionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return [];
    }
    alumno = data;
  } else {
    // Es un alumno registrado - buscar por profile_id
    const { data, error } = await supabase
      .from('alumnos')
      .select('id')
      .eq('profile_id', alumnoId)
      .single();

    if (error) {
      return [];
    }
    alumno = data;
  }

  if (!alumno) {
    return [];
  }

  const { data, error } = await supabase
    .from('historial_entrenamientos')
    .select('*')
    .eq('alumno_id', alumno.id)
    .order('fecha', { ascending: false });

  if (error) {
    throw error;
  }

  return data.map(h => ({
    id: h.id,
    fecha: h.fecha,
    rutinaId: h.rutina_id,
    nombreRutina: h.detalles?.nombreRutina || 'Entrenamiento',
    duracion: h.duracion,
    ejerciciosCompletados: h.ejercicios_completados,
    ejerciciosTotales: h.ejercicios_totales,
    volumenTotal: h.volumen_total,
    detalles: h.detalles, // Incluir detalles completos para vista detallada
  }));
};

/**
 * Guardar un entrenamiento completado
 */
export const guardarEntrenamiento = async (alumnoProfileId, entrenamiento) => {
  const { data: alumno, error: fetchError } = await supabase
    .from('alumnos')
    .select('id')
    .eq('profile_id', alumnoProfileId)
    .single();

  if (fetchError) throw fetchError;

  // Enriquecer cada ejercicio con su e1RM máximo de la sesión
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

  // Actualizar estadísticas y récords personales (e1RM)
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

  // Comparar e1RM de esta sesión con el récord histórico y actualizar si es mejor
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

// ==================== INVITACIONES ====================

/**
 * Crear una invitación para un nuevo alumno
 * El alumno verá sus rutinas cuando se registre con el mismo email
 */
export const crearInvitacion = async ({ email, nombre, profesorId }) => {
  // Verificar si ya existe un alumno con ese email
  const { data: existente } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (existente) {
    throw new Error('Ya existe un usuario con ese email');
  }

  // Verificar si ya hay una invitación pendiente
  const { data: invitacionExistente } = await supabase
    .from('invitaciones')
    .select('id')
    .eq('email', email)
    .eq('usado', false)
    .single();

  if (invitacionExistente) {
    throw new Error('Ya existe una invitación pendiente para ese email');
  }

  // Crear la invitación
  const { data, error } = await supabase
    .from('invitaciones')
    .insert({
      email,
      nombre,
      profesor_id: profesorId,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Obtener invitación por email (usado durante el registro)
 */
export const getInvitacionPorEmail = async (email) => {
  const { data, error } = await supabase
    .from('invitaciones')
    .select('*')
    .eq('email', email)
    .eq('usado', false)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
};

/**
 * Marcar invitación como usada
 */
export const marcarInvitacionUsada = async (invitacionId) => {
  const { error } = await supabase
    .from('invitaciones')
    .update({ usado: true })
    .eq('id', invitacionId);

  if (error) {
    throw error;
  }
};

/**
 * Eliminar un entrenamiento del historial
 * Solo para uso del profesor
 * También actualiza las estadísticas del alumno (completadas y racha)
 */
export const eliminarEntrenamiento = async (entrenamientoId) => {
  // Primero obtener el entrenamiento para saber el alumno_id
  const { data: entrenamiento, error: fetchError } = await supabase
    .from('historial_entrenamientos')
    .select('alumno_id')
    .eq('id', entrenamientoId)
    .single();

  if (fetchError) {
    throw fetchError;
  }

  // Eliminar el entrenamiento
  const { error: deleteError } = await supabase
    .from('historial_entrenamientos')
    .delete()
    .eq('id', entrenamientoId);

  if (deleteError) {
    throw deleteError;
  }

  // Actualizar estadísticas del alumno (decrementar)
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

/**
 * Obtener la racha de días consecutivos de entrenamiento
 * Cuenta días consecutivos hacia atrás desde hoy (o ayer si hoy aún no entrenó)
 */
export const getRachaAlumno = async (profileId) => {
  // Buscar el alumno por profile_id
  const { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .select('id')
    .eq('profile_id', profileId)
    .single();

  if (alumnoError || !alumno) {
    return 0;
  }

  // Obtener historial ordenado por fecha descendente
  const { data: historial, error } = await supabase
    .from('historial_entrenamientos')
    .select('fecha')
    .eq('alumno_id', alumno.id)
    .order('fecha', { ascending: false });

  if (error || !historial || historial.length === 0) {
    return 0;
  }

  // Crear set de fechas únicas de entrenamiento
  const fechasEntrenamiento = new Set(
    historial.map(h => h.fecha)
  );

  // Calcular racha contando días consecutivos hacia atrás
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  let racha = 0;
  let fechaActual = new Date(hoy);

  // Verificar si hoy entrenó, si no, empezar desde ayer
  const hoyStr = hoy.toISOString().split('T')[0];
  if (!fechasEntrenamiento.has(hoyStr)) {
    fechaActual.setDate(fechaActual.getDate() - 1);
  }

  // Contar días consecutivos hacia atrás
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

// ==================== ADMIN ====================

/**
 * Obtener profesores pendientes de aprobación
 * Solo para uso del administrador
 */
export const getProfesoresPendientes = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('rol', 'profesor_pendiente')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

/**
 * Aprobar a un profesor pendiente (cambia rol a 'profesor')
 */
export const aprobarProfesor = async (profileId) => {
  const { error } = await supabase
    .from('profiles')
    .update({ rol: 'profesor' })
    .eq('id', profileId);

  if (error) throw error;
  return { success: true };
};

/**
 * Rechazar a un profesor pendiente (cambia rol a 'rechazado')
 */
export const rechazarProfesor = async (profileId) => {
  const { error } = await supabase
    .from('profiles')
    .update({ rol: 'rechazado' })
    .eq('id', profileId);

  if (error) throw error;
  return { success: true };
};

// Exportar constante de días (para mantener compatibilidad)
export const diasSemana = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

// ==================== CICLO MENSUAL ====================

/**
 * Calcular la semana actual del ciclo (1-4)
 * Basado en fecha de inicio del ciclo
 */
export const getSemanaActualCiclo = async (profileId) => {
  const { data: alumno, error } = await supabase
    .from('alumnos')
    .select('ciclo_config, ciclo_fecha_inicio')
    .eq('profile_id', profileId)
    .single();

  if (error || !alumno?.ciclo_config?.activo || !alumno.ciclo_fecha_inicio) {
    return null;
  }

  const fechaInicio = new Date(alumno.ciclo_fecha_inicio);
  fechaInicio.setHours(0, 0, 0, 0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diffMs = hoy - fechaInicio;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const duracion = alumno.ciclo_config.duracion_semanas || 4;

  // Ciclo se repite: semana 5 -> semana 1
  return (diffWeeks % duracion) + 1;
};

/**
 * Obtener información completa del ciclo de un alumno
 */
export const getCicloInfo = async (profileId) => {
  const { data: alumno, error } = await supabase
    .from('alumnos')
    .select('ciclo_config, ciclo_fecha_inicio')
    .eq('profile_id', profileId)
    .single();

  if (error) return { activo: false };

  const config = alumno?.ciclo_config || { activo: false, semana_descarga: 4 };

  if (!config.activo || !alumno.ciclo_fecha_inicio) {
    return { activo: false };
  }

  const semanaActual = await getSemanaActualCiclo(profileId);

  return {
    activo: config.activo,
    semanaActual,
    semanaDescarga: config.semana_descarga || 4,
    esDescarga: semanaActual === (config.semana_descarga || 4),
    fechaInicio: alumno.ciclo_fecha_inicio,
    duracionSemanas: config.duracion_semanas || 4,
  };
};

/**
 * Configurar ciclo para un alumno (activar/desactivar, elegir semana descarga)
 */
export const configurarCiclo = async (alumnoProfileId, config) => {
  const isInvitation = alumnoProfileId.startsWith('inv-');

  const updateData = {
    ciclo_config: config,
    ciclo_fecha_inicio: config.activo ? new Date().toISOString().split('T')[0] : null,
  };

  let result;
  if (isInvitation) {
    const invitacionId = alumnoProfileId.replace('inv-', '');
    result = await supabase
      .from('alumnos')
      .update(updateData)
      .eq('invitacion_id', invitacionId);
  } else {
    result = await supabase
      .from('alumnos')
      .update(updateData)
      .eq('profile_id', alumnoProfileId);
  }

  if (result.error) throw result.error;
  return { success: true };
};

/**
 * Reiniciar ciclo (comenzar desde semana 1)
 */
export const reiniciarCiclo = async (alumnoProfileId) => {
  const isInvitation = alumnoProfileId.startsWith('inv-');

  const updateData = {
    ciclo_fecha_inicio: new Date().toISOString().split('T')[0],
  };

  let result;
  if (isInvitation) {
    const invitacionId = alumnoProfileId.replace('inv-', '');
    result = await supabase
      .from('alumnos')
      .update(updateData)
      .eq('invitacion_id', invitacionId);
  } else {
    result = await supabase
      .from('alumnos')
      .update(updateData)
      .eq('profile_id', alumnoProfileId);
  }

  if (result.error) throw result.error;
  return { success: true };
};

/**
 * Obtener configuración de ciclo de un alumno (para vista profesor)
 */
export const getCicloConfigAlumno = async (alumnoId) => {
  let alumno = null;

  if (alumnoId.startsWith('inv-')) {
    const invitacionId = alumnoId.replace('inv-', '');
    const { data, error } = await supabase
      .from('alumnos')
      .select('ciclo_config, ciclo_fecha_inicio')
      .eq('invitacion_id', invitacionId)
      .single();

    if (!error) alumno = data;
  } else {
    const { data, error } = await supabase
      .from('alumnos')
      .select('ciclo_config, ciclo_fecha_inicio')
      .eq('profile_id', alumnoId)
      .single();

    if (!error) alumno = data;
  }

  if (!alumno) {
    return { activo: false, semana_descarga: 4, duracion_semanas: 4 };
  }

  return alumno.ciclo_config || { activo: false, semana_descarga: 4, duracion_semanas: 4 };
};

// ==================== HISTORIAL SEMANAL ====================

/**
 * Obtener historial agrupado por semana del ciclo
 * Retorna datos agregados para gráficos de progreso
 * @param {string} alumnoId - ID del alumno
 * @param {string} mesAnio - Mes en formato YYYY-MM (opcional, si se pasa filtra por mes)
 */
export const getHistorialSemanal = async (alumnoId, mesAnio = null) => {
  let alumno = null;

  // Obtener alumno
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

  if (!alumno) {
    return { semanas: [], ejercicios: {} };
  }

  // Obtener historial (filtrado por mes si se especifica)
  let query = supabase
    .from('historial_entrenamientos')
    .select('*')
    .eq('alumno_id', alumno.id)
    .order('fecha', { ascending: true });

  // Si hay mes específico, filtrar por rango de fechas del mes
  if (mesAnio) {
    const [anio, mes] = mesAnio.split('-').map(Number);
    const primerDia = `${anio}-${String(mes).padStart(2, '0')}-01`;
    const ultimoDia = new Date(anio, mes, 0).getDate(); // último día del mes
    const ultimaFecha = `${anio}-${String(mes).padStart(2, '0')}-${ultimoDia}`;
    query = query.gte('fecha', primerDia).lte('fecha', ultimaFecha);
  }

  const { data: historial, error } = await query;

  if (error || !historial || historial.length === 0) {
    return { semanas: [], ejercicios: {} };
  }

  // Agrupar por semana del ciclo
  const semanasMap = {};
  const ejerciciosProgreso = {};

  historial.forEach(h => {
    // Calcular número de semana basado en fecha
    const fecha = new Date(h.fecha);
    let semanaNum = 1;

    if (alumno.ciclo_fecha_inicio) {
      const fechaInicio = new Date(alumno.ciclo_fecha_inicio);
      const diffDays = Math.floor((fecha - fechaInicio) / (1000 * 60 * 60 * 24));
      const diffWeeks = Math.floor(diffDays / 7);
      const duracion = alumno.ciclo_config?.duracion_semanas || 4;
      semanaNum = (diffWeeks % duracion) + 1;
    } else {
      // Si no hay ciclo activo, agrupar por semana calendario
      const startOfYear = new Date(fecha.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((fecha - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
      semanaNum = weekNum;
    }

    // Inicializar semana si no existe
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

    // Acumular datos de la semana
    semanasMap[semanaNum].entrenamientos++;
    semanasMap[semanaNum].volumenTotal += h.volumen_total || 0;
    semanasMap[semanaNum].duracionTotal += h.duracion || 0;
    semanasMap[semanaNum].ejerciciosCompletados += h.ejercicios_completados || 0;
    if (h.fecha > semanasMap[semanaNum].fechaFin) {
      semanasMap[semanaNum].fechaFin = h.fecha;
    }

    // Procesar detalles de ejercicios para progreso individual
    if (h.detalles?.ejercicios) {
      h.detalles.ejercicios.forEach(ej => {
        if (!ejerciciosProgreso[ej.nombre]) {
          ejerciciosProgreso[ej.nombre] = [];
        }

        // Calcular peso máximo y volumen del ejercicio
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

        // Usar e1RM pre-calculado si existe (sesiones nuevas), o calcularlo de las series
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

  // Convertir a array y ordenar
  const semanas = Object.values(semanasMap).sort((a, b) => a.semana - b.semana);

  return {
    semanas,
    ejercicios: ejerciciosProgreso,
    cicloActivo: alumno.ciclo_config?.activo || false,
  };
};

/**
 * Crear entrenamientos de muestra para un alumno
 * Genera un mes completo de entrenamientos con progresión realista
 */
export const crearEntrenamientosMuestra = async (alumnoId) => {
  let alumno = null;

  // Obtener alumno
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

  if (!alumno) {
    throw new Error('Alumno no encontrado');
  }

  // Primero eliminar entrenamientos existentes de muestra
  await supabase
    .from('historial_entrenamientos')
    .delete()
    .eq('alumno_id', alumno.id);

  const hoy = new Date();
  const entrenamientosMuestra = [];

  // Ejercicios organizados por día (rutina split realista)
  const rutinasSplit = {
    // Día A: Pecho + Tríceps
    A: [
      { nombre: 'Press Plano', pesoBase: 60, categoria: 'pecho' },
      { nombre: 'Press Inclinado', pesoBase: 50, categoria: 'pecho' },
      { nombre: 'Aperturas', pesoBase: 14, categoria: 'pecho' },
      { nombre: 'Fondos', pesoBase: 0, categoria: 'triceps' },
      { nombre: 'Extensión Tríceps Polea', pesoBase: 25, categoria: 'triceps' },
    ],
    // Día B: Espalda + Bíceps
    B: [
      { nombre: 'Dominadas', pesoBase: 0, categoria: 'espalda' },
      { nombre: 'Remo con Barra', pesoBase: 60, categoria: 'espalda' },
      { nombre: 'Jalón al Pecho', pesoBase: 55, categoria: 'espalda' },
      { nombre: 'Curl Bíceps', pesoBase: 12, categoria: 'biceps' },
      { nombre: 'Curl Martillo', pesoBase: 10, categoria: 'biceps' },
    ],
    // Día C: Piernas
    C: [
      { nombre: 'Sentadilla', pesoBase: 80, categoria: 'piernas' },
      { nombre: 'Peso Muerto', pesoBase: 100, categoria: 'piernas' },
      { nombre: 'Prensa', pesoBase: 150, categoria: 'piernas' },
      { nombre: 'Extensión Cuádriceps', pesoBase: 40, categoria: 'piernas' },
      { nombre: 'Curl Femoral', pesoBase: 35, categoria: 'piernas' },
    ],
    // Día D: Hombros + Core
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

  // Crear entrenamientos para las últimas 4 semanas (mes completo)
  for (let semana = 1; semana <= 4; semana++) {
    // 4-5 entrenamientos por semana (más realista)
    const entrenamientosPorSemana = 4 + (Math.random() > 0.5 ? 1 : 0);

    // Mezclar orden de días para variedad
    const diasOrdenados = [...diasRutina].sort(() => Math.random() - 0.3);

    for (let entrenoNum = 0; entrenoNum < entrenamientosPorSemana; entrenoNum++) {
      const diaRutina = diasOrdenados[entrenoNum % 4];
      const ejerciciosDelDia = rutinasSplit[diaRutina];

      // Calcular fecha (distribuir entrenamientos en la semana)
      const fecha = new Date(hoy);
      const diasAtras = (4 - semana) * 7 + Math.floor((7 / entrenamientosPorSemana) * entrenoNum);
      fecha.setDate(fecha.getDate() - diasAtras);

      // Progresión de peso: 5% más cada semana (progresión lineal realista)
      const factorProgresion = 1 + ((semana - 1) * 0.05);

      // Semana 4 = descarga (65% del peso)
      const esDescarga = semana === 4;
      const factorDescarga = esDescarga ? 0.65 : 1;

      const detallesEjercicios = ejerciciosDelDia.map(ej => {
        const pesoBase = ej.pesoBase || 0;
        const pesoReal = Math.round(pesoBase * factorProgresion * factorDescarga);
        const series = [];

        // 3-4 series por ejercicio
        const numSeries = ej.categoria === 'core' ? 3 : (3 + Math.floor(Math.random() * 2));

        for (let s = 1; s <= numSeries; s++) {
          // Progresión de reps inversas al peso
          let repsObjetivo = esDescarga ? 15 : (12 - Math.floor((semana - 1) * 0.5));
          // Última serie puede tener menos reps (fatiga)
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

        return {
          nombre: ej.nombre,
          categoria: ej.categoria,
          completado: true,
          series,
        };
      });

      // Calcular totales
      let volumenTotal = 0;
      let ejerciciosCompletados = 0;

      detallesEjercicios.forEach(ej => {
        if (ej.completado) ejerciciosCompletados++;
        ej.series.forEach(s => {
          volumenTotal += (s.pesoReal || 0) * (s.repsReal || 0);
        });
      });

      // Duración basada en cantidad de ejercicios (8-12 min por ejercicio)
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

  // Insertar entrenamientos
  const { data, error } = await supabase
    .from('historial_entrenamientos')
    .insert(entrenamientosMuestra)
    .select();

  if (error) {
    throw error;
  }

  // Actualizar estadísticas y activar ciclo para el alumno
  const fechaInicioCiclo = new Date(hoy);
  fechaInicioCiclo.setDate(fechaInicioCiclo.getDate() - 28); // 4 semanas atrás

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

/**
 * Cargar datos de muestra para todos los alumnos de un profesor
 */
export const seedEntrenamientosTodosAlumnos = async (profesorId) => {
  // Obtener invitaciones del profesor (tanto usadas como no usadas)
  const { data: invitaciones, error: invError } = await supabase
    .from('invitaciones')
    .select('id, email, nombre')
    .eq('profesor_id', profesorId);

  if (invError) {
    throw new Error('Error obteniendo invitaciones: ' + invError.message);
  }

  // Obtener alumnos vinculados a esas invitaciones
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
        return {
          ...a,
          nombre: inv?.nombre || 'Alumno',
        };
      });
    }
  }

  // También obtener alumnos registrados que tengan profile en profiles
  // y que estén en la lista de invitaciones por email
  const emails = (invitaciones || []).map(i => i.email);

  if (emails.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nombre, email')
      .in('email', emails)
      .eq('rol', 'alumno');

    if (profiles) {
      for (const profile of profiles) {
        // Verificar que no esté ya en la lista
        const yaExiste = alumnos.some(a => a.profile_id === profile.id);
        if (!yaExiste) {
          // Buscar si tiene registro en alumnos
          const { data: alumnoData } = await supabase
            .from('alumnos')
            .select('id, profile_id, invitacion_id')
            .eq('profile_id', profile.id)
            .single();

          if (alumnoData) {
            alumnos.push({
              ...alumnoData,
              nombre: profile.nombre,
            });
          }
        }
      }
    }
  }

  if (alumnos.length === 0) {
    throw new Error('No se encontraron alumnos para este profesor');
  }

  const resultados = [];

  for (const alumno of alumnos) {
    try {
      // Usar profile_id si existe, sino usar invitacion_id
      const alumnoId = alumno.profile_id || `inv-${alumno.invitacion_id}`;
      const resultado = await crearEntrenamientosMuestra(alumnoId);
      resultados.push({
        alumno: alumno.nombre || alumnoId,
        ...resultado,
        exito: true,
      });
    } catch (err) {
      resultados.push({
        alumno: alumno.nombre || alumno.id,
        error: err.message,
        exito: false,
      });
    }
  }

  return resultados;
};
