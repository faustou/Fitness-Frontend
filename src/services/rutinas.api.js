import { supabase } from '../lib/supabase';

export const diasSemana = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

export const getMesActual = () => {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
};

export const getNombreMes = (mesAnio) => {
  if (!mesAnio) return '';
  const [anio, mes] = mesAnio.split('-');
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return `${meses[parseInt(mes) - 1]} ${anio}`;
};

export const getMesSiguiente = (mesAnio) => {
  if (!mesAnio) mesAnio = getMesActual();
  const [anio, mes] = mesAnio.split('-').map(Number);
  const nuevaFecha = new Date(anio, mes);
  return `${nuevaFecha.getFullYear()}-${String(nuevaFecha.getMonth() + 1).padStart(2, '0')}`;
};

export const getSemanaActualCiclo = async (profileId) => {
  const { data: alumno, error } = await supabase
    .from('alumnos')
    .select('ciclo_config, ciclo_fecha_inicio')
    .eq('profile_id', profileId)
    .single();

  if (error || !alumno?.ciclo_config?.activo || !alumno.ciclo_fecha_inicio) return null;

  const fechaInicio = new Date(alumno.ciclo_fecha_inicio);
  fechaInicio.setHours(0, 0, 0, 0);

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const diffMs = hoy - fechaInicio;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffDays / 7);
  const duracion = alumno.ciclo_config.duracion_semanas || 4;

  return (diffWeeks % duracion) + 1;
};

export const getCicloInfo = async (profileId) => {
  const { data: alumno, error } = await supabase
    .from('alumnos')
    .select('ciclo_config, ciclo_fecha_inicio')
    .eq('profile_id', profileId)
    .single();

  if (error) return { activo: false };

  const config = alumno?.ciclo_config || { activo: false, semana_descarga: 4 };

  if (!config.activo || !alumno.ciclo_fecha_inicio) return { activo: false };

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

  const mesesUnicos = [...new Set((rutinas || []).map(r => r.mes_anio))].sort();

  const mesActual = getMesActual();
  const mesSiguiente = getMesSiguiente(mesActual);

  if (!mesesUnicos.includes(mesActual)) mesesUnicos.push(mesActual);
  if (!mesesUnicos.includes(mesSiguiente)) mesesUnicos.push(mesSiguiente);

  return mesesUnicos.sort();
};

export const getMisRutinas = async (profileId) => {
  let { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .select('id')
    .eq('profile_id', profileId)
    .single();

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', profileId)
    .single();

  if (alumno) {
    const { data: rutinasCheck } = await supabase
      .from('rutinas')
      .select('id')
      .eq('alumno_id', alumno.id)
      .limit(1);

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
            await supabase
              .from('alumnos')
              .update({ profile_id: profileId })
              .eq('id', alumnoInv.id);

            await supabase
              .from('alumnos')
              .delete()
              .eq('id', alumno.id);

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
        await supabase
          .from('alumnos')
          .update({ profile_id: profileId })
          .eq('id', alumnoInv.id);

        await supabase
          .from('invitaciones')
          .update({ usado: true })
          .eq('id', invitacion.id);

        alumno = alumnoInv;
      }
    }
  }

  if (!alumno) return { rutinas: {}, ciclo: { activo: false } };

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

  if (error) throw error;

  const rutinasPorDia = {};
  rutinas.forEach(rutina => {
    const ejerciciosOrdenados = [...(rutina.rutina_ejercicios || [])].sort((a, b) => a.orden - b.orden);

    rutinasPorDia[rutina.dia_semana] = {
      id: rutina.id,
      nombre: rutina.nombre,
      diaSemana: rutina.dia_semana,
      tipo_calentamiento: rutina.tipo_calentamiento ?? null,
      series_calentamiento: rutina.series_calentamiento ?? null,
      ejercicios: ejerciciosOrdenados.map(re => {
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

export const getRutinasAlumno = async (alumnoId, mesAnio = null) => {
  let alumno = null;

  if (!mesAnio) mesAnio = getMesActual();

  if (alumnoId.startsWith('inv-')) {
    const invitacionId = alumnoId.replace('inv-', '');
    const { data, error } = await supabase
      .from('alumnos')
      .select('id')
      .eq('invitacion_id', invitacionId)
      .single();

    if (error && error.code !== 'PGRST116') return {};
    alumno = data;
  } else {
    const { data, error } = await supabase
      .from('alumnos')
      .select('id')
      .eq('profile_id', alumnoId)
      .single();

    if (error) return {};
    alumno = data;
  }

  if (!alumno) return {};

  let query = supabase
    .from('rutinas')
    .select(`
      *,
      rutina_ejercicios (
        *,
        ejercicios (*)
      )
    `)
    .eq('alumno_id', alumno.id)
    .or(`mes_anio.eq.${mesAnio},mes_anio.is.null`);

  const { data: rutinas, error } = await query;

  if (error) throw error;

  const rutinasPorDia = {};
  rutinas.forEach(rutina => {
    rutinasPorDia[rutina.dia_semana] = {
      id: rutina.id,
      nombre: rutina.nombre,
      mesAnio: rutina.mes_anio,
      tipo_calentamiento: rutina.tipo_calentamiento ?? null,
      series_calentamiento: rutina.series_calentamiento ?? null,
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

export const guardarRutina = async (alumnoProfileId, diaSemana, rutina, mesAnio = null) => {
  if (!mesAnio) mesAnio = getMesActual();
  let alumno = null;

  if (alumnoProfileId.startsWith('inv-')) {
    const invitacionId = alumnoProfileId.replace('inv-', '');

    let { data: existingAlumno, error: findError } = await supabase
      .from('alumnos')
      .select('id')
      .eq('invitacion_id', invitacionId)
      .single();

    if (findError && findError.code === 'PGRST116') {
      const { data: nuevoAlumno, error: createError } = await supabase
        .from('alumnos')
        .insert({
          invitacion_id: invitacionId,
          objetivo: 'General',
          dias_semana: [],
          estadisticas: { rutinasTotales: 0, rutinasCompletadas: 0, racha: 0 },
        })
        .select('id')
        .single();

      if (createError) throw createError;
      alumno = nuevoAlumno;
    } else if (findError) {
      throw findError;
    } else {
      alumno = existingAlumno;
    }
  } else {
    let { data: existingAlumno, error: alumnoError } = await supabase
      .from('alumnos')
      .select('id')
      .eq('profile_id', alumnoProfileId)
      .single();

    if (alumnoError && alumnoError.code === 'PGRST116') {
      const { data: nuevoAlumno, error: createError } = await supabase
        .from('alumnos')
        .insert({
          profile_id: alumnoProfileId,
          objetivo: 'General',
          dias_semana: [],
          estadisticas: { rutinasTotales: 0, rutinasCompletadas: 0, racha: 0 },
        })
        .select('id')
        .single();

      if (createError) throw createError;
      alumno = nuevoAlumno;
    } else if (alumnoError) {
      throw alumnoError;
    } else {
      alumno = existingAlumno;
    }
  }

  const { data: existente } = await supabase
    .from('rutinas')
    .select('id')
    .eq('alumno_id', alumno.id)
    .eq('dia_semana', diaSemana)
    .eq('mes_anio', mesAnio)
    .single();

  let rutinaId;

  if (existente) {
    const { data, error } = await supabase
      .from('rutinas')
      .update({
        nombre: rutina.nombre,
        mes_anio: mesAnio,
        tipo_calentamiento: rutina.tipoCalentamiento ?? null,
        series_calentamiento: rutina.seriesCalentamiento ?? null,
      })
      .eq('id', existente.id)
      .select()
      .single();

    if (error) throw error;
    rutinaId = data.id;

    await supabase
      .from('rutina_ejercicios')
      .delete()
      .eq('rutina_id', rutinaId);
  } else {
    const { data, error } = await supabase
      .from('rutinas')
      .insert({
        alumno_id: alumno.id,
        dia_semana: diaSemana,
        nombre: rutina.nombre,
        mes_anio: mesAnio,
        tipo_calentamiento: rutina.tipoCalentamiento ?? null,
        series_calentamiento: rutina.seriesCalentamiento ?? null,
      })
      .select()
      .single();

    if (error) throw error;
    rutinaId = data.id;
  }

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

export const actualizarCalentamientoRutina = async (rutinaId, tipoCal, seriesConfig) => {
  const { error } = await supabase
    .from('rutinas')
    .update({
      tipo_calentamiento: tipoCal ?? null,
      series_calentamiento: seriesConfig ?? null,
    })
    .eq('id', rutinaId);
  if (error) throw error;
};

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

  if (!alumno) return { activo: false, semana_descarga: 4, duracion_semanas: 4 };

  return alumno.ciclo_config || { activo: false, semana_descarga: 4, duracion_semanas: 4 };
};
