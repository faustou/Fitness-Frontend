import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '../lib/supabase';
import { verificarPagoPrevio } from '../services/pagos.api';

// ============================================
// Tests para pagos.api.js
// ============================================

describe('verificarPagoPrevio', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna los datos del pago si existe un pago asignado para el email', async () => {
    const pagoMock = { id: 'pago-1', email: 'alumno@test.com', estado: 'asignado' };

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: pagoMock, error: null }),
    });

    const resultado = await verificarPagoPrevio('alumno@test.com');

    expect(resultado).toEqual(pagoMock);
    expect(supabase.from).toHaveBeenCalledWith('alumnos_pendientes');
  });

  it('retorna null si no existe pago asignado (error PGRST116 = no rows)', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'No rows' } }),
    });

    const resultado = await verificarPagoPrevio('sinpago@test.com');

    expect(resultado).toBeNull();
  });

  it('retorna null cuando data es null y no hay error', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
    });

    const resultado = await verificarPagoPrevio('otro@test.com');

    expect(resultado).toBeNull();
  });

  it('lanza error si el error no es PGRST116 (error real de BD)', async () => {
    const errorReal = { code: '42P01', message: 'relation does not exist' };

    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: errorReal }),
    });

    await expect(verificarPagoPrevio('alumno@test.com')).rejects.toEqual(errorReal);
  });

  it('filtra por estado "asignado" ademas del email', async () => {
    const eqMock = vi.fn().mockReturnThis();
    const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
    supabase.from.mockReturnValue({ select: selectMock });
    eqMock.mockReturnValue({ eq: eqMock, single: vi.fn().mockResolvedValue({ data: null, error: null }) });

    await verificarPagoPrevio('test@test.com');

    // Verificar que se filtra por email y por estado 'asignado'
    expect(eqMock).toHaveBeenCalledWith('email', 'test@test.com');
    expect(eqMock).toHaveBeenCalledWith('estado', 'asignado');
  });
});
