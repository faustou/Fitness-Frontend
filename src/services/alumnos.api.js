import { supabase } from '../lib/supabase';

export const getAlumnos = async (profesorId = null) => {
  let profiles = [];
  let alumnos = [];

  if (profesorId) {
    const { data: alumnosData, error: alumnosError } = await supabase
      .from('alumnos')
      .select('*')
      .eq('profesor_id', profesorId);

    if (alumnosError) throw alumnosError;
    alumnos = alumnosData || [];

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

export const getAlumnoById = async (id) => {
  if (id.startsWith('inv-')) {
    const invitacionId = id.replace('inv-', '');
    const { data: invitacion, error: invError } = await supabase
      .from('invitaciones')
      .select('*')
      .eq('id', invitacionId)
      .single();

    if (invError) throw invError;

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

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (profileError) throw profileError;

  const { data: alumno, error: alumnoError } = await supabase
    .from('alumnos')
    .select('*')
    .eq('profile_id', id)
    .single();

  if (alumnoError && alumnoError.code !== 'PGRST116') throw alumnoError;

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

  if (error) throw error;
  return data;
};

export const crearInvitacion = async ({ email, nombre, profesorId }) => {
  const { data: existente } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();

  if (existente) throw new Error('Ya existe un usuario con ese email');

  const { data: invitacionExistente } = await supabase
    .from('invitaciones')
    .select('id')
    .eq('email', email)
    .eq('usado', false)
    .single();

  if (invitacionExistente) throw new Error('Ya existe una invitación pendiente para ese email');

  const { data, error } = await supabase
    .from('invitaciones')
    .insert({ email, nombre, profesor_id: profesorId })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getInvitacionPorEmail = async (email) => {
  const { data, error } = await supabase
    .from('invitaciones')
    .select('*')
    .eq('email', email)
    .eq('usado', false)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const marcarInvitacionUsada = async (invitacionId) => {
  const { error } = await supabase
    .from('invitaciones')
    .update({ usado: true })
    .eq('id', invitacionId);

  if (error) throw error;
};

export const getProfesoresPendientes = async () => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('rol', 'profesor_pendiente')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const aprobarProfesor = async (profileId) => {
  const { error } = await supabase
    .from('profiles')
    .update({ rol: 'profesor' })
    .eq('id', profileId);

  if (error) throw error;
  return { success: true };
};

export const rechazarProfesor = async (profileId) => {
  const { error } = await supabase
    .from('profiles')
    .update({ rol: 'rechazado' })
    .eq('id', profileId);

  if (error) throw error;
  return { success: true };
};

export const getAlumnosPendientes = async () => {
  const { data, error } = await supabase
    .from('alumnos_pendientes')
    .select('*')
    .eq('estado', 'sin_asignar')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const tomarAlumnoPendiente = async (alumnosPendienteId, profesorProfileId, datosAlumno) => {
  const { error } = await supabase
    .from('alumnos_pendientes')
    .update({ estado: 'asignado', profesor_id: profesorProfileId })
    .eq('id', alumnosPendienteId);
  if (error) throw error;

  await supabase
    .from('invitaciones')
    .update({ profesor_id: profesorProfileId })
    .eq('email', datosAlumno.email)
    .eq('usado', false);

  const { data: perfilExistente } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', datosAlumno.email)
    .eq('rol', 'alumno')
    .maybeSingle();

  if (perfilExistente) {
    await supabase
      .from('alumnos')
      .update({ profesor_id: profesorProfileId })
      .eq('profile_id', perfilExistente.id);

    await supabase
      .from('invitaciones')
      .update({ usado: true })
      .eq('email', datosAlumno.email)
      .eq('usado', false);
  }
};
