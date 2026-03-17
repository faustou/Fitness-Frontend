import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // Verificar sesión actual
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUsuario(session?.user ?? null);

      if (session?.user) {
        await cargarPerfil(session.user.id);
      }
      setCargando(false);
    };

    getSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUsuario(session?.user ?? null);

        if (session?.user) {
          await cargarPerfil(session.user.id);
        } else {
          setPerfil(null);
        }
        setCargando(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Cargar perfil del usuario desde la tabla profiles con timeout
  const cargarPerfil = async (userId) => {
    try {
      // Crear promesa con timeout de 5 segundos
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]);

      if (error) {
        // Si no existe el perfil, intentar crearlo desde los metadatos del usuario
        if (error.code === 'PGRST116') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const nombre = user.user_metadata?.nombre || 'Usuario';
            const rol = user.user_metadata?.rol || 'alumno';

            const { data: newProfile, error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: userId,
                nombre,
                email: user.email,
                rol,
              })
              .select()
              .single();

            if (!insertError && newProfile) {
              setPerfil(newProfile);
              return newProfile;
            }
          }
        }
        return null;
      }

      setPerfil(data);
      return data;
    } catch (err) {
      // En caso de timeout u otro error, retornar null
      return null;
    }
  };

  // Subir avatar a Supabase Storage
  const subirAvatar = async (userId, file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    // El bucket ya es 'avatars', no incluir en filePath
    const filePath = fileName;

    // Subir archivo
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Error subiendo avatar:', uploadError);
      return null;
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  // Registro de nuevo usuario
  const registro = async (email, password, nombre, rol, avatarFile = null) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre,
          rol,
        },
      },
    });

    if (error) throw error;

    // Si el registro fue exitoso, subir avatar si existe
    let avatarUrl = null;
    if (data.user && avatarFile) {
      avatarUrl = await subirAvatar(data.user.id, avatarFile);
    }

    // Los profesores quedan pendientes de aprobación hasta que el admin los active
    const rolFinal = rol === 'profesor' ? 'profesor_pendiente' : rol;

    // Crear el perfil manualmente con avatar_url incluido
    if (data.user) {
      await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          nombre,
          email,
          rol: rolFinal,
          avatar_url: avatarUrl,
        });
    }

    // Si el registro fue exitoso, crear/vincular registro adicional según el rol
    if (data.user) {
      if (rol === 'alumno') {
        // Buscar si hay una invitación pendiente con este email
        const { data: invitacion } = await supabase
          .from('invitaciones')
          .select('id, profesor_id')
          .eq('email', email)
          .eq('usado', false)
          .single();

        if (invitacion) {
          const { data: alumnoExistente } = await supabase
            .from('alumnos')
            .select('id')
            .eq('invitacion_id', invitacion.id)
            .single();

          if (alumnoExistente) {
            await supabase
              .from('alumnos')
              .update({ profile_id: data.user.id, profesor_id: invitacion.profesor_id })
              .eq('id', alumnoExistente.id);
          } else {
            await supabase.from('alumnos').insert({
              profile_id: data.user.id,
              invitacion_id: invitacion.id,
              objetivo: 'General',
              dias_semana: [],
              profesor_id: invitacion.profesor_id,
            });
          }

          await supabase
            .from('invitaciones')
            .update({ usado: true })
            .eq('id', invitacion.id);
        } else {
          await supabase.from('alumnos').insert({
            profile_id: data.user.id,
            objetivo: 'General',
            dias_semana: [],
          });
        }

        // Verificar si hay pago previo (visitante que pagó y fue asignado por un profesor)
        const { data: pagoPrevio } = await supabase
          .from('alumnos_pendientes')
          .select('*')
          .eq('email', email)
          .eq('estado', 'asignado')
          .single();

        if (pagoPrevio) {
          const DURACION = { BRONCE: 30, PLATA: 90, ORO: 180, VIP: 30 };
          const dias = DURACION[pagoPrevio.plan] || 30;
          const vencimiento = new Date();
          vencimiento.setDate(vencimiento.getDate() + dias);

          await supabase
            .from('profiles')
            .update({
              suscripcion_activa: true,
              plan_activo: pagoPrevio.plan,
              fecha_vencimiento_plan: vencimiento.toISOString(),
            })
            .eq('id', data.user.id);

          await supabase
            .from('alumnos_pendientes')
            .update({ estado: 'registrado' })
            .eq('id', pagoPrevio.id);
        }
      } else if (rol === 'profesor') {
        await supabase.from('profesores').insert({
          profile_id: data.user.id,
        });
      }
    }

    return data;
  };

  // Login
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  };

  // Logout
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setPerfil(null);
  };

  // Refrescar perfil desde Supabase (útil tras un pago aprobado)
  const refrescarPerfil = async () => {
    if (!usuario?.id) return;
    await cargarPerfil(usuario.id);
  };

  // Actualizar avatar del usuario
  const actualizarAvatar = async (file) => {
    if (!usuario?.id) throw new Error('No hay usuario logueado');

    const avatarUrl = await subirAvatar(usuario.id, file);
    if (!avatarUrl) throw new Error('Error subiendo imagen');

    // Actualizar en la base de datos
    const { error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', usuario.id);

    if (error) throw error;

    // Actualizar estado local
    setPerfil(prev => ({ ...prev, avatar_url: avatarUrl }));

    return avatarUrl;
  };

  const value = {
    usuario,
    perfil,
    cargando,
    registro,
    login,
    logout,
    actualizarAvatar,
    refrescarPerfil,
    esAlumno: perfil?.rol === 'alumno',
    esProfesor: perfil?.rol === 'profesor',
    esAdmin: perfil?.es_admin === true || perfil?.rol === 'profesor',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
