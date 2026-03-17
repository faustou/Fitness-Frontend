import { supabase } from '../lib/supabase';

export const getEjerciciosDB = async () => {
  const { data, error } = await supabase
    .from('ejercicios')
    .select('id, nombre, categoria, descripcion, dificultad, gif_url, creado_por')
    .order('nombre');
  if (error) throw error;
  return data || [];
};

export const crearEjercicio = async (datos, profileId) => {
  const { data, error } = await supabase
    .from('ejercicios')
    .insert({ id: crypto.randomUUID(), ...datos, creado_por: profileId })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const editarEjercicio = async (ejercicioId, datos) => {
  const { error } = await supabase
    .from('ejercicios')
    .update(datos)
    .eq('id', ejercicioId);
  if (error) throw error;
};

export const eliminarEjercicio = async (ejercicioId) => {
  const { data: enUso, error: checkError } = await supabase
    .from('rutina_ejercicios')
    .select('id')
    .eq('ejercicio_id', ejercicioId)
    .limit(1);
  if (checkError) throw checkError;
  if (enUso && enUso.length > 0) {
    throw new Error('Este ejercicio está en uso y no puede eliminarse');
  }

  const { data: ejercicio } = await supabase
    .from('ejercicios')
    .select('gif_url')
    .eq('id', ejercicioId)
    .single();

  if (ejercicio?.gif_url) {
    const bucketPath = ejercicio.gif_url.split('/ejercicios-gifs/')[1];
    if (bucketPath) {
      await supabase.storage.from('ejercicios-gifs').remove([bucketPath]);
    }
  }

  const { error } = await supabase
    .from('ejercicios')
    .delete()
    .eq('id', ejercicioId);
  if (error) throw error;
};

export const subirGifEjercicio = async (ejercicioId, archivo) => {
  if (archivo.size > 5 * 1024 * 1024) {
    throw new Error('El archivo no puede superar 5MB');
  }
  const extension = archivo.name.split('.').pop();
  const path = `${ejercicioId}/${Date.now()}.${extension}`;
  const { error } = await supabase.storage
    .from('ejercicios-gifs')
    .upload(path, archivo, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('ejercicios-gifs').getPublicUrl(path);
  return data.publicUrl;
};
