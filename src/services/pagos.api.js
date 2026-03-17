import { supabase } from '../lib/supabase';

export const verificarPagoPrevio = async (email) => {
  const { data, error } = await supabase
    .from('alumnos_pendientes')
    .select('*')
    .eq('email', email)
    .eq('estado', 'asignado')
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};
