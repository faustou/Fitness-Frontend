/**
 * Fórmula de Brzycki para estimar 1 Rep Max
 * 1RM = Peso / (1.0278 - 0.0278 × (Reps + RIR))
 */
export const calcularE1RM = (peso, reps, rir = 0) => {
  if (!peso || peso <= 0 || !reps || reps <= 0) return 0;
  const repsConRIR = (reps || 0) + (rir ?? 0);
  const denominador = 1.0278 - 0.0278 * repsConRIR;
  if (denominador <= 0) return 0;
  return Math.round((peso / denominador) * 10) / 10;
};

/**
 * Calcula el mejor e1RM de una sesión de un ejercicio
 */
export const calcularMejorE1RM = (series) => {
  let maxE1RM = 0;
  let mejorSerie = null;

  (series || []).forEach(s => {
    if (!s.completada) return;
    const peso = s.pesoReal ?? s.pesoObjetivo ?? 0;
    const reps = s.repsReal ?? s.repsObjetivo ?? 0;
    const rir = s.rir ?? 0;
    const e1rm = calcularE1RM(peso, reps, rir);
    if (e1rm > maxE1RM) {
      maxE1RM = e1rm;
      mejorSerie = { peso, reps, rir, e1rm };
    }
  });

  return { e1rm: maxE1RM, mejorSerie };
};
