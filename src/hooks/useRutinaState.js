import { useState, useEffect, useCallback } from 'react';

export function useRutinaState(rutinaInicial) {
  const [rutina, setRutina] = useState(rutinaInicial);
  const [ejercicioActualIndex, setEjercicioActualIndex] = useState(0);
  const [workoutIniciado, setWorkoutIniciado] = useState(false);
  const [workoutCompletado, setWorkoutCompletado] = useState(false);
  const [tiempoTotal, setTiempoTotal] = useState(0);
  const [mostrandoDescanso, setMostrandoDescanso] = useState(false);
  const [tiempoDescanso, setTiempoDescanso] = useState(0);
  const [calentamientoCompletado, setCalentamientoCompletado] = useState(false);

  // Sincronizar cuando rutinaInicial cambia (ej: cuando se carga desde API)
  useEffect(() => {
    if (rutinaInicial) {
      setRutina(rutinaInicial);
    }
  }, [rutinaInicial]);

  // Timer del workout total (cuenta hacia arriba)
  useEffect(() => {
    let interval;
    if (workoutIniciado && !workoutCompletado) {
      interval = setInterval(() => {
        setTiempoTotal(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [workoutIniciado, workoutCompletado]);

  // Ejercicio actual
  const ejercicioActual = rutina?.ejercicios?.[ejercicioActualIndex] || null;

  // Calcular progreso (más granular: incluye series del ejercicio actual)
  const ejerciciosCompletados = rutina?.ejercicios?.filter(ej => ej.completado).length || 0;
  const totalEjercicios = rutina?.ejercicios?.length || 0;

  // Progreso granular: ejercicios completos + porción del ejercicio actual
  const calcularProgresoGranular = () => {
    if (!rutina?.ejercicios || totalEjercicios === 0) return 0;

    let progreso = 0;
    const valorPorEjercicio = 100 / totalEjercicios;

    rutina.ejercicios.forEach((ej, idx) => {
      if (ej.completado) {
        progreso += valorPorEjercicio;
      } else if (idx === ejercicioActualIndex) {
        // Progreso parcial del ejercicio actual basado en series
        const seriesCompletadas = ej.series.filter(s => s.completada).length;
        const totalSeries = ej.series.length;
        if (totalSeries > 0) {
          progreso += (seriesCompletadas / totalSeries) * valorPorEjercicio;
        }
      }
    });

    return Math.min(progreso, 100);
  };

  const progresoPercent = calcularProgresoGranular();

  // Completar calentamiento
  const completarCalentamiento = useCallback(() => {
    setCalentamientoCompletado(true);
  }, []);

  // Iniciar workout
  const iniciarWorkout = useCallback(() => {
    setWorkoutIniciado(true);
    setTiempoTotal(0);
  }, []);

  // Actualizar serie (reps, peso, rir)
  const actualizarSerie = useCallback((ejercicioIdx, serieIdx, datos) => {
    setRutina(prev => {
      const nuevaRutina = JSON.parse(JSON.stringify(prev));
      nuevaRutina.ejercicios[ejercicioIdx].series[serieIdx] = {
        ...nuevaRutina.ejercicios[ejercicioIdx].series[serieIdx],
        ...datos,
      };
      return nuevaRutina;
    });
  }, []);

  // Completar serie
  const completarSerie = useCallback((ejercicioIdx, serieIdx) => {
    setRutina(prev => {
      const nuevaRutina = JSON.parse(JSON.stringify(prev));
      const serie = nuevaRutina.ejercicios[ejercicioIdx].series[serieIdx];

      // Si no tiene valores reales, usar los objetivos
      if (serie.repsReal === null) serie.repsReal = serie.repsObjetivo;
      if (serie.pesoReal === null) serie.pesoReal = serie.pesoObjetivo;

      serie.completada = true;

      // Verificar si todas las series del ejercicio están completadas
      const todasCompletadas = nuevaRutina.ejercicios[ejercicioIdx].series.every(s => s.completada);
      if (todasCompletadas) {
        nuevaRutina.ejercicios[ejercicioIdx].completado = true;
      }

      return nuevaRutina;
    });

    // Iniciar timer de descanso
    const descanso = rutina.ejercicios[ejercicioIdx].descanso;
    setTiempoDescanso(descanso);
    setMostrandoDescanso(true);
  }, [rutina]);

  // Descompletar serie (toggle)
  const descompletarSerie = useCallback((ejercicioIdx, serieIdx) => {
    setRutina(prev => {
      const nuevaRutina = JSON.parse(JSON.stringify(prev));
      nuevaRutina.ejercicios[ejercicioIdx].series[serieIdx].completada = false;
      nuevaRutina.ejercicios[ejercicioIdx].completado = false;
      return nuevaRutina;
    });
  }, []);

  // Agregar serie
  const agregarSerie = useCallback((ejercicioIdx) => {
    setRutina(prev => {
      const nuevaRutina = JSON.parse(JSON.stringify(prev));
      const series = nuevaRutina.ejercicios[ejercicioIdx].series;
      const ultimaSerie = series[series.length - 1];

      series.push({
        numero: series.length + 1,
        repsObjetivo: ultimaSerie.repsObjetivo,
        pesoObjetivo: ultimaSerie.pesoObjetivo,
        rirObjetivo: ultimaSerie.rirObjetivo ?? null,
        repsReal: null,
        pesoReal: null,
        rir: null,
        completada: false,
      });

      return nuevaRutina;
    });
  }, []);

  // Eliminar serie
  const eliminarSerie = useCallback((ejercicioIdx, serieIdx) => {
    setRutina(prev => {
      const nuevaRutina = JSON.parse(JSON.stringify(prev));
      const series = nuevaRutina.ejercicios[ejercicioIdx].series;

      // No permitir eliminar si solo queda 1 serie
      if (series.length <= 1) return prev;

      // Eliminar la serie
      series.splice(serieIdx, 1);

      // Renumerar las series restantes
      series.forEach((serie, idx) => {
        serie.numero = idx + 1;
      });

      // Verificar si todas las series restantes están completadas
      const todasCompletadas = series.every(s => s.completada);
      nuevaRutina.ejercicios[ejercicioIdx].completado = todasCompletadas && series.length > 0;

      return nuevaRutina;
    });
  }, []);

  // Verificar si el ejercicio actual está completado
  const ejercicioActualCompletado = ejercicioActual?.completado || false;

  // Navegar a ejercicio específico (solo permite ir atrás libremente, adelante requiere completar)
  const navegarEjercicio = useCallback((index) => {
    if (index >= 0 && index < totalEjercicios) {
      // Puede ir hacia atrás siempre
      if (index <= ejercicioActualIndex) {
        setEjercicioActualIndex(index);
        return true;
      }
      // Solo puede avanzar si completó los ejercicios anteriores
      const puedeAvanzar = rutina.ejercicios.slice(0, index).every(ej => ej.completado);
      if (puedeAvanzar) {
        setEjercicioActualIndex(index);
        return true;
      }
      return false;
    }
    return false;
  }, [totalEjercicios, ejercicioActualIndex, rutina]);

  // Ir al siguiente ejercicio (requiere completar el actual a menos que se fuerce)
  const siguienteEjercicio = useCallback((forzar = false) => {
    const completado = rutina?.ejercicios?.[ejercicioActualIndex]?.completado;

    if (ejercicioActualIndex < totalEjercicios - 1) {
      if (!completado && !forzar) {
        return false; // No puede avanzar
      }
      setEjercicioActualIndex(prev => prev + 1);
      return true;
    } else {
      // Último ejercicio - ir al resumen
      setWorkoutCompletado(true);
      return true;
    }
  }, [ejercicioActualIndex, totalEjercicios, rutina]);

  // Ir al ejercicio anterior
  const anteriorEjercicio = useCallback(() => {
    if (ejercicioActualIndex > 0) {
      setEjercicioActualIndex(prev => prev - 1);
    }
  }, [ejercicioActualIndex]);

  // Finalizar descanso
  const finalizarDescanso = useCallback(() => {
    setMostrandoDescanso(false);
    setTiempoDescanso(0);
  }, []);

  // Completar workout
  const completarWorkout = useCallback(() => {
    setWorkoutCompletado(true);
  }, []);

  // Formatear tiempo
  const formatearTiempo = (segundos) => {
    const hrs = Math.floor(segundos / 3600);
    const mins = Math.floor((segundos % 3600) / 60);
    const secs = segundos % 60;

    if (hrs > 0) {
      return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return {
    // Estado
    rutina,
    ejercicioActual,
    ejercicioActualIndex,
    workoutIniciado,
    workoutCompletado,
    tiempoTotal,
    tiempoTotalFormateado: formatearTiempo(tiempoTotal),
    mostrandoDescanso,
    tiempoDescanso,
    ejerciciosCompletados,
    totalEjercicios,
    progresoPercent,
    ejercicioActualCompletado,
    calentamientoCompletado,

    // Acciones
    completarCalentamiento,
    iniciarWorkout,
    actualizarSerie,
    completarSerie,
    descompletarSerie,
    agregarSerie,
    eliminarSerie,
    navegarEjercicio,
    siguienteEjercicio,
    anteriorEjercicio,
    finalizarDescanso,
    completarWorkout,
    formatearTiempo,
  };
}

export default useRutinaState;
