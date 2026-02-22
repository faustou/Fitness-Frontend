import { describe, it, expect, vi } from 'vitest';

// Necesito mockear supabase porque api.js lo importa
// aunque estas funciones no lo usen directamente
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: { getSession: vi.fn(), onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })) },
    from: vi.fn(),
  },
}));

import { calcularE1RM, calcularMejorE1RM } from '../services/api';

// ============================================
// Tests para la formula de e1RM (Brzycki)
// ============================================
// La formula es: Peso / (1.0278 - 0.0278 * (Reps + RIR))
// Si alguien levanta 100kg x 5 reps con RIR 2, su 1RM estimado
// es mayor a 100kg porque todavia le quedaban repeticiones

describe('calcularE1RM - formula de Brzycki', () => {

  it('calcula bien un caso tipico: 100kg, 5 reps, RIR 0', () => {
    // Con 5 reps al fallo, el 1RM estimado deberia ser mayor a 100
    const resultado = calcularE1RM(100, 5, 0);
    expect(resultado).toBeGreaterThan(100);
  });

  it('a mas reps con el mismo peso, el e1RM es mayor', () => {
    // Si puedo hacer mas reps con el mismo peso, mi 1RM es mas alto
    const con5reps = calcularE1RM(80, 5, 0);
    const con10reps = calcularE1RM(80, 10, 0);
    expect(con10reps).toBeGreaterThan(con5reps);
  });

  it('con RIR mas alto el e1RM es mayor (quedaban mas reps en el tanque)', () => {
    // RIR 3 significa que me quedaban 3 reps, o sea que estaba lejos del fallo
    const sinRIR = calcularE1RM(100, 5, 0);
    const conRIR3 = calcularE1RM(100, 5, 3);
    expect(conRIR3).toBeGreaterThan(sinRIR);
  });

  it('devuelve 0 si el peso es 0', () => {
    // Si no cargue nada no tiene sentido calcular el 1RM
    const resultado = calcularE1RM(0, 10, 0);
    expect(resultado).toBe(0);
  });

  it('devuelve 0 si las reps son 0', () => {
    const resultado = calcularE1RM(100, 0, 0);
    expect(resultado).toBe(0);
  });

  it('el resultado esta redondeado a 1 decimal', () => {
    const resultado = calcularE1RM(75, 8, 1);
    // Verificar que no tenga mas de 1 decimal
    const decimales = resultado.toString().split('.')[1];
    const cantidadDecimales = decimales ? decimales.length : 0;
    expect(cantidadDecimales).toBeLessThanOrEqual(1);
  });

});

// ============================================
// Tests para calcularMejorE1RM
// Dado un array de series, encuentra la que
// tuvo el mejor rendimiento (mayor e1RM)
// ============================================

describe('calcularMejorE1RM - mejor serie de la sesion', () => {

  it('encuentra el e1RM mas alto entre varias series', () => {
    // Simulo 3 series de sentadilla en una sesion
    const seriesDeEntrenamiento = [
      { pesoReal: 100, repsReal: 8, rir: 2, completada: true },  // serie 1 - calentamiento
      { pesoReal: 120, repsReal: 5, rir: 1, completada: true },  // serie 2 - mas pesado
      { pesoReal: 120, repsReal: 4, rir: 0, completada: true },  // serie 3 - al fallo
    ];

    const { e1rm } = calcularMejorE1RM(seriesDeEntrenamiento);

    // El e1RM tiene que ser mayor a 120 (el peso mas alto usado)
    expect(e1rm).toBeGreaterThan(120);
  });

  it('ignora las series que no fueron completadas', () => {
    const series = [
      { pesoReal: 200, repsReal: 5, rir: 0, completada: false }, // no completada, peso muy alto
      { pesoReal: 100, repsReal: 5, rir: 0, completada: true },  // completada, peso normal
    ];

    const { e1rm } = calcularMejorE1RM(series);

    // Aunque la primera tiene mas peso, estaba sin completar
    // el e1RM debe calcularse solo con la serie completada (100kg)
    expect(e1rm).toBeGreaterThan(100);
    expect(e1rm).toBeLessThan(200); // no puede usar el peso de la serie incompleta
  });

  it('devuelve e1rm 0 y mejorSerie null si no hay series completadas', () => {
    const series = [
      { pesoReal: 150, repsReal: 5, rir: 0, completada: false },
    ];

    const { e1rm, mejorSerie } = calcularMejorE1RM(series);

    expect(e1rm).toBe(0);
    expect(mejorSerie).toBeNull();
  });

  it('funciona con un array vacio', () => {
    const { e1rm, mejorSerie } = calcularMejorE1RM([]);

    expect(e1rm).toBe(0);
    expect(mejorSerie).toBeNull();
  });

  it('la mejorSerie tiene los datos de la serie con mayor e1RM', () => {
    // Con los mismos reps y RIR, el peso mas alto siempre gana
    const series = [
      { pesoReal: 80, repsReal: 5, rir: 0, completada: true },
      { pesoReal: 100, repsReal: 5, rir: 0, completada: true }, // esta deberia ser la mejor
    ];

    const { mejorSerie } = calcularMejorE1RM(series);

    // La serie con 100kg deberia ganar porque tiene el mismo RIR y reps
    expect(mejorSerie.peso).toBe(100);
    expect(mejorSerie.reps).toBe(5);
  });

});
