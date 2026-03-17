import { describe, it, expect } from 'vitest';
import { getCalentamientoEjercicios, CALENTAMIENTO_DEFAULTS } from '../data/calentamientoDB';

describe('getCalentamientoEjercicios', () => {
  it('retorna 5 ejercicios para superior con seriesConfig null', () => {
    const resultado = getCalentamientoEjercicios('superior', null);
    expect(resultado).toHaveLength(5);
  });

  it('retorna 5 ejercicios para inferior con seriesConfig null', () => {
    const resultado = getCalentamientoEjercicios('inferior', null);
    expect(resultado).toHaveLength(5);
  });

  it('usa valores por defecto cuando seriesConfig es null', () => {
    const resultado = getCalentamientoEjercicios('superior', null);
    const plancha = resultado.find(e => e.id === 'plancha');
    expect(plancha.series).toBe(CALENTAMIENTO_DEFAULTS.superior.plancha.series);
    expect(plancha.reps).toBe(CALENTAMIENTO_DEFAULTS.superior.plancha.reps);
  });

  it('aplica seriesConfig correctamente', () => {
    const config = {
      plancha: { series: 4, reps: 45 },
      plancha_lateral: { series: 3, reps: 25 },
    };
    const resultado = getCalentamientoEjercicios('superior', config);
    const plancha = resultado.find(e => e.id === 'plancha');
    const lateral = resultado.find(e => e.id === 'plancha_lateral');
    const balanceo = resultado.find(e => e.id === 'balanceo_brazos');

    expect(plancha.series).toBe(4);
    expect(plancha.reps).toBe(45);
    expect(lateral.series).toBe(3);
    expect(lateral.reps).toBe(25);
    // balanceo no está en config → usa default
    expect(balanceo.series).toBe(CALENTAMIENTO_DEFAULTS.superior.balanceo_brazos.series);
    expect(balanceo.reps).toBe(CALENTAMIENTO_DEFAULTS.superior.balanceo_brazos.reps);
  });

  it('retorna array vacío para tipo null', () => {
    expect(getCalentamientoEjercicios(null, null)).toEqual([]);
  });

  it('retorna array vacío para tipo undefined', () => {
    expect(getCalentamientoEjercicios(undefined, null)).toEqual([]);
  });

  it('retorna array vacío para tipo inválido', () => {
    expect(getCalentamientoEjercicios('full_body', null)).toEqual([]);
  });

  it('seriesConfig con valores parciales usa defaults para los que faltan', () => {
    const config = { plancha: { series: 5, reps: 60 } }; // solo plancha
    const resultado = getCalentamientoEjercicios('inferior', config);
    const plancha = resultado.find(e => e.id === 'plancha');
    const sentadilla = resultado.find(e => e.id === 'sentadilla_bw');

    expect(plancha.series).toBe(5);
    expect(plancha.reps).toBe(60);
    expect(sentadilla.series).toBe(CALENTAMIENTO_DEFAULTS.inferior.sentadilla_bw.series);
    expect(sentadilla.reps).toBe(CALENTAMIENTO_DEFAULTS.inferior.sentadilla_bw.reps);
  });

  it('cada ejercicio tiene las propiedades requeridas', () => {
    const resultado = getCalentamientoEjercicios('superior', null);
    resultado.forEach(ej => {
      expect(ej).toHaveProperty('id');
      expect(ej).toHaveProperty('nombre');
      expect(ej).toHaveProperty('descripcion');
      expect(ej).toHaveProperty('gif_url');
      expect(ej).toHaveProperty('unidad');
      expect(ej).toHaveProperty('series');
      expect(ej).toHaveProperty('reps');
      expect(typeof ej.series).toBe('number');
      expect(typeof ej.reps).toBe('number');
    });
  });
});
