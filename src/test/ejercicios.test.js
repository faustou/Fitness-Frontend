import { describe, it, expect, vi, beforeEach } from 'vitest';

// mockeo supabase porque api.js lo importa al principio
// si no hago esto falla todo antes de llegar a los tests
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
    },
    from: vi.fn(),
    storage: { from: vi.fn() },
  },
}));

import { crearEjercicio, editarEjercicio, eliminarEjercicio, subirGifEjercicio } from '../services/api';
import { supabase } from '../lib/supabase';

// ============================================
// Tests de la gestion de ejercicios
// ============================================
// Son tests basicos para aprender como funciona vitest
// mockeamos supabase para no depender de internet

// funcion de validacion igual a la que usa el formulario en GestionEjercicios
// la copio aca para poder testearla sin montar el componente
const validarForm = (form) => {
  const errores = {};
  if (!form.nombre?.trim()) errores.nombre = 'El nombre es obligatorio';
  if (!form.categoria) errores.categoria = 'El grupo muscular es obligatorio';
  if (!form.dificultad) errores.dificultad = 'La dificultad es obligatoria';
  return errores;
};

describe('crearEjercicio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('guarda el ejercicio en supabase con los datos correctos', async () => {
    // preparo el mock para que simule que supabase devuelve el ejercicio creado
    const ejercicioCreado = {
      id: 'abc-123',
      nombre: 'Sentadilla',
      categoria: 'Piernas',
      dificultad: 'Intermedio',
      creado_por: 'profesor-uuid',
    };

    const mockSingle = vi.fn().mockResolvedValue({ data: ejercicioCreado, error: null });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    supabase.from.mockReturnValue({ insert: mockInsert });

    const datos = { nombre: 'Sentadilla', categoria: 'Piernas', dificultad: 'Intermedio' };
    const resultado = await crearEjercicio(datos, 'profesor-uuid');

    // verifico que se llamo a insert con los datos + creado_por
    // uso objectContaining porque ahora tambien se genera un id automatico
    expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
      nombre: 'Sentadilla',
      categoria: 'Piernas',
      dificultad: 'Intermedio',
      creado_por: 'profesor-uuid',
    }));
    // verifico que devuelve el ejercicio con el id generado por supabase
    expect(resultado.id).toBe('abc-123');
    expect(resultado.nombre).toBe('Sentadilla');
  });

  it('lanza error si supabase devuelve un error', async () => {
    const mockSingle = vi.fn().mockResolvedValue({ data: null, error: { message: 'Error de base de datos' } });
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle });
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect });
    supabase.from.mockReturnValue({ insert: mockInsert });

    await expect(crearEjercicio({ nombre: 'Test' }, 'uid')).rejects.toBeTruthy();
  });
});

describe('editarEjercicio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('actualiza solo los campos que se le pasan', async () => {
    const mockEq = vi.fn().mockResolvedValue({ error: null });
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
    supabase.from.mockReturnValue({ update: mockUpdate });

    // solo le paso nombre, no toco los otros campos
    await editarEjercicio('ej-uuid', { nombre: 'Nuevo nombre' });

    expect(mockUpdate).toHaveBeenCalledWith({ nombre: 'Nuevo nombre' });
    expect(mockEq).toHaveBeenCalledWith('id', 'ej-uuid');
  });
});

describe('eliminarEjercicio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('falla con mensaje claro si el ejercicio esta en uso en una rutina', async () => {
    // simulo que hay rutinas usando este ejercicio
    const mockLimit = vi.fn().mockResolvedValue({ data: [{ id: 'rutina-ej-1' }], error: null });
    const mockEqCheck = vi.fn().mockReturnValue({ limit: mockLimit });
    const mockSelectCheck = vi.fn().mockReturnValue({ eq: mockEqCheck });
    supabase.from.mockReturnValue({ select: mockSelectCheck });

    // tiene que tirar este error especifico
    await expect(eliminarEjercicio('ej-en-uso')).rejects.toThrow('Este ejercicio está en uso y no puede eliminarse');
  });

  it('llama a delete si el ejercicio no esta en uso', async () => {
    // primera llamada: check de uso (vacio, no esta en uso)
    // segunda llamada: obtener gif_url
    // tercera llamada: delete

    let llamadas = 0;
    const mockDelete = vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue({ error: null }),
    });

    supabase.from.mockImplementation(() => {
      llamadas++;
      if (llamadas === 1) {
        // check rutina_ejercicios - vacio
        return {
          select: () => ({ eq: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }),
        };
      }
      if (llamadas === 2) {
        // buscar gif_url
        return {
          select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: { gif_url: null }, error: null }) }) }),
        };
      }
      // delete
      return { delete: mockDelete };
    });

    await eliminarEjercicio('ej-libre');
    expect(mockDelete).toHaveBeenCalled();
  });
});

describe('subirGifEjercicio', () => {
  it('rechaza archivos mayores a 5MB', async () => {
    // creo un archivo falso que pesa 6MB
    const archivoGrande = { size: 6 * 1024 * 1024, name: 'ejercicio.gif' };

    await expect(subirGifEjercicio('ej-uuid', archivoGrande))
      .rejects.toThrow('El archivo no puede superar 5MB');
  });

  it('acepta archivos de exactamente 5MB o menos', async () => {
    const archivoJusto = { size: 5 * 1024 * 1024, name: 'ejercicio.gif' };

    const mockGetPublicUrl = vi.fn().mockReturnValue({ data: { publicUrl: 'https://ejemplo.com/gif.gif' } });
    const mockUpload = vi.fn().mockResolvedValue({ error: null });
    const mockFromStorage = vi.fn().mockReturnValue({ upload: mockUpload, getPublicUrl: mockGetPublicUrl });
    supabase.storage.from = mockFromStorage;

    const url = await subirGifEjercicio('ej-uuid', archivoJusto);
    expect(url).toBe('https://ejemplo.com/gif.gif');
  });
});

describe('validacion del formulario de ejercicio', () => {
  it('no permite guardar sin nombre', () => {
    const errores = validarForm({ nombre: '', categoria: 'Piernas', dificultad: 'Intermedio' });
    expect(errores.nombre).toBeTruthy();
  });

  it('no permite guardar sin grupo muscular', () => {
    const errores = validarForm({ nombre: 'Sentadilla', categoria: '', dificultad: 'Intermedio' });
    expect(errores.categoria).toBeTruthy();
  });

  it('no hay errores cuando todo esta completo', () => {
    const errores = validarForm({ nombre: 'Sentadilla', categoria: 'Piernas', dificultad: 'Intermedio' });
    expect(Object.keys(errores).length).toBe(0);
  });
});
