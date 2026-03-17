# Skill: Crear Gráfico de Estadísticas

Usá esta skill cuando el usuario pida crear un nuevo gráfico o panel de estadísticas para el profesor o alumno.

## Cuándo activar esta skill
- "Agregá un gráfico de progreso de peso"
- "Quiero ver la evolución del e1RM por ejercicio"
- "Creá una estadística de frecuencia de entrenamiento"

## Pasos a seguir

1. Revisá `src/services/api.js` para entender qué datos ya existen en el historial
2. Usá el archivo `ejemplo.tsx` como base visual y estructural
3. Seguí el `template.tsx` para la estructura del componente
4. Antes de terminar, revisá el `checklist.md`

## Decisiones de librería
- Datos a lo largo del tiempo (progreso semanal/mensual) → **Recharts** (LineChart, AreaChart)
- Comparaciones entre ejercicios o categorías → **ApexCharts** (BarChart, RadarChart)
- Nunca mezclar las dos librerías en el mismo componente

## Datos disponibles en historial_entrenamientos
```js
// datos_ejercicios es un JSON con esta forma:
{
  ejercicioId: string,
  nombre: string,
  series: [
    { repsReal: number, pesoReal: number, rir: number, completada: boolean }
  ]
}
```

## Cálculos ya disponibles en api.js
- `calcularE1RM(peso, reps, rir)` — fuerza máxima estimada
- `calcularMejorE1RM(series)` — el mejor e1RM de todas las series de un ejercicio
