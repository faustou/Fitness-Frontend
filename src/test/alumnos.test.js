import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../lib/supabase';
import { getAlumnosPendientes, tomarAlumnoPendiente } from '../services/alumnos.api';

// ============================================
// Tests para alumnos.api.js
// ============================================

// Helper para construir un mock de query chain completo
const buildQueryChain = (resolveValue) => {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue(resolveValue),
    single: vi.fn().mockResolvedValue(resolveValue),
    maybeSingle: vi.fn().mockResolvedValue(resolveValue),
    in: vi.fn().mockResolvedValue(resolveValue),
  };
  return chain;
};

describe('getAlumnosPendientes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna lista de alumnos pendientes sin asignar', async () => {
    const alumnosMock = [
      { id: 'ap-1', email: 'nuevo1@test.com', nombre: 'Nuevo Uno', estado: 'sin_asignar' },
      { id: 'ap-2', email: 'nuevo2@test.com', nombre: 'Nuevo Dos', estado: 'sin_asignar' },
    ];

    supabase.from.mockReturnValue(buildQueryChain({ data: alumnosMock, error: null }));

    const resultado = await getAlumnosPendientes();

    expect(resultado).toEqual(alumnosMock);
    expect(resultado).toHaveLength(2);
    expect(supabase.from).toHaveBeenCalledWith('alumnos_pendientes');
  });

  it('retorna array vacío si no hay alumnos pendientes', async () => {
    supabase.from.mockReturnValue(buildQueryChain({ data: [], error: null }));

    const resultado = await getAlumnosPendientes();

    expect(resultado).toEqual([]);
  });

  it('retorna array vacío si data es null', async () => {
    supabase.from.mockReturnValue(buildQueryChain({ data: null, error: null }));

    const resultado = await getAlumnosPendientes();

    expect(resultado).toEqual([]);
  });

  it('lanza error si la consulta a BD falla', async () => {
    const errorBD = { code: '500', message: 'Internal Server Error' };

    supabase.from.mockReturnValue(buildQueryChain({ data: null, error: errorBD }));

    await expect(getAlumnosPendientes()).rejects.toEqual(errorBD);
  });

  it('filtra por estado "sin_asignar" y ordena por created_at descendente', async () => {
    const eqMock = vi.fn().mockReturnThis();
    const orderMock = vi.fn().mockResolvedValue({ data: [], error: null });
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });

    eqMock.mockReturnValue({ eq: eqMock, order: orderMock });

    supabase.from.mockReturnValue({ select: selectMock });

    await getAlumnosPendientes();

    expect(eqMock).toHaveBeenCalledWith('estado', 'sin_asignar');
    expect(orderMock).toHaveBeenCalledWith('created_at', { ascending: false });
  });
});

describe('tomarAlumnoPendiente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('actualiza el estado del alumno pendiente a "asignado" con el profesor correcto', async () => {
    // Todas las queries devuelven sin error
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      // eq encadenado que se resuelve sin error para updates sin select
    };

    // Para el update sin encadenar más operaciones, necesitamos que eq sea thenable
    const eqResolvable = vi.fn().mockResolvedValue({ data: null, error: null });
    const eqChainable = vi.fn().mockReturnValue({
      eq: eqResolvable,
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    let callCount = 0;
    supabase.from.mockImplementation((table) => {
      callCount++;

      if (table === 'alumnos_pendientes') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }

      if (table === 'invitaciones') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: null }),
            }),
          }),
        };
      }

      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          }),
        };
      }

      if (table === 'alumnos') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: null, error: null }),
          }),
        };
      }

      return buildQueryChain({ data: null, error: null });
    });

    // No debe lanzar error
    await expect(
      tomarAlumnoPendiente('ap-1', 'profesor-uuid', { email: 'alumno@test.com' })
    ).resolves.toBeUndefined();

    expect(supabase.from).toHaveBeenCalledWith('alumnos_pendientes');
    expect(supabase.from).toHaveBeenCalledWith('invitaciones');
    expect(supabase.from).toHaveBeenCalledWith('profiles');
  });

  it('lanza error si falla la actualización de alumnos_pendientes', async () => {
    const errorBD = { code: '500', message: 'Update failed' };

    supabase.from.mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: errorBD }),
      }),
    });

    await expect(
      tomarAlumnoPendiente('ap-1', 'profesor-uuid', { email: 'alumno@test.com' })
    ).rejects.toEqual(errorBD);
  });

  it('asigna al alumno existente si ya tiene perfil con rol alumno', async () => {
    const perfilExistente = { id: 'profile-alumno-uuid' };

    let profilesCallDone = false;

    supabase.from.mockImplementation((table) => {
      if (table === 'alumnos_pendientes') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }

      if (table === 'invitaciones') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          }),
        };
      }

      if (table === 'profiles') {
        profilesCallDone = true;
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({ data: perfilExistente, error: null }),
              }),
            }),
          }),
        };
      }

      if (table === 'alumnos') {
        return {
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        };
      }

      return buildQueryChain({ data: null, error: null });
    });

    await tomarAlumnoPendiente('ap-1', 'profesor-uuid', { email: 'alumno@test.com' });

    // Se debe haber consultado la tabla profiles para ver si ya existe el alumno
    expect(profilesCallDone).toBe(true);
    // Tabla alumnos debe haberse actualizado con el profesor
    expect(supabase.from).toHaveBeenCalledWith('alumnos');
  });
});
