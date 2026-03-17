# SPEC: Entrada en Calor

## Estado: ⏳ Pendiente

---

## Qué hace esta feature

El profesor puede asignar un tipo de calentamiento a cada rutina (Superior o Inferior).
Antes de comenzar el workout, el alumno ve la entrada en calor con sus ejercicios, puede marcar cada uno como hecho, y tiene la opción de omitirla. El calentamiento no genera estadísticas ni historial — es solo preparación.

---

## Los dos tipos de calentamiento (fijos en el sistema)

Estos ejercicios son fijos y no cambian. El profesor solo elige cuántas series/reps de cada uno.

### 🔵 Calentamiento Superior
1. Planchas
2. Planchas laterales
3. Balanceo de brazos
4. Rotación de hombros
5. Flexiones lentas

### 🟢 Calentamiento Inferior
1. Planchas
2. Dorsiflexión de tobillo
3. Sentadilla bodyweight
4. Estocadas caminando
5. Rotación de cadera

Cada ejercicio tiene:
- `nombre` (string)
- `descripcion` (string) — instrucciones de ejecución
- `gif_url` (string) — subir los GIFs a Supabase Storage, bucket `calentamiento-gifs`
- `tipo` — "superior" | "inferior"

**Estos datos van hardcodeados en un nuevo archivo: `src/data/calentamientoDB.js`**
No van en Supabase — son fijos y no se editan desde la app.

---

## Base de datos

### Modificar tabla `rutinas` — agregar columna:
```sql
tipo_calentamiento  text  -- valores: 'superior' | 'inferior' | null (sin calentamiento)
series_calentamiento jsonb -- configuración de series/reps por ejercicio
```

### Estructura de `series_calentamiento`:
```json
{
  "plancha": { "series": 3, "reps": 30 },
  "plancha_lateral": { "series": 2, "reps": 20 },
  "balanceo_brazos": { "series": 1, "reps": 15 },
  "rotacion_hombros": { "series": 2, "reps": 10 },
  "flexiones_lentas": { "series": 3, "reps": 8 }
}
```

---

## Funciones a agregar en `src/services/api.js`

```js
// Guardar tipo de calentamiento en una rutina
actualizarCalentamientoRutina(rutinaId, tipoCal, seriesConfig)
// → update en rutinas: tipo_calentamiento y series_calentamiento

// Ya existe getMisRutinas — verificar que traiga tipo_calentamiento y series_calentamiento en el select
```

---

## Cambios en el EditorRutina (profesor)

Agregar una nueva sección al final del editor de cada día llamada "Entrada en calor".

### UI del editor:
1. Dropdown para elegir tipo: "Sin calentamiento" / "Superior" / "Inferior"
2. Si elige Superior o Inferior: mostrar la lista de ejercicios correspondiente
3. Cada ejercicio de la lista muestra:
   - Nombre + GIF pequeño (thumbnail)
   - Input de series (número, mín 1, máx 5)
   - Input de reps (número, mín 5, máx 60)
4. Los valores por defecto al seleccionar un tipo:
   - Series: 2
   - Reps: según el ejercicio (planchas → 30seg, flexiones → 8 reps, etc.)
5. Al guardar la rutina: incluir `tipo_calentamiento` y `series_calentamiento` en `guardarRutina()`

Edge cases:
- Si cambia de Superior a Inferior, resetear los valores de series/reps a los defaults
- Si cambia a "Sin calentamiento", guardar `tipo_calentamiento: null`

---

## Cambios en el flujo del alumno (RutinaDia + PantallaInicio)

### En `PantallaInicio.jsx`:
- Si la rutina tiene `tipo_calentamiento`, mostrar un bloque antes del botón "Comenzar":
  ```
  🔥 Esta rutina incluye entrada en calor
  [Ver calentamiento]  [Omitir y comenzar]
  ```
- Si no tiene calentamiento: flujo actual sin cambios

### Nuevo componente: `src/components/rutina/EntradaCalor.jsx`

Flujo:
1. Muestra los ejercicios del calentamiento uno por uno (igual que EjercicioActual pero simplificado)
2. Cada ejercicio muestra: GIF, nombre, descripción, series y reps asignadas
3. El alumno marca cada serie como hecha (checkbox o botón simple, sin cargar peso/reps)
4. Barra de progreso del calentamiento (igual que BarraProgreso existente)
5. Al completar todos → botón "Comenzar rutina" que inicia el workout normal
6. Botón "Omitir calentamiento" siempre visible que salta directo al workout

### En `adaptarRutinaAPI` (RutinaDia.jsx):
- Agregar al objeto rutina adaptado:
  ```js
  calentamiento: {
    tipo: rutina.tipo_calentamiento,           // 'superior' | 'inferior' | null
    ejercicios: getCalentamientoEjercicios(    // función de calentamientoDB.js
      rutina.tipo_calentamiento,
      rutina.series_calentamiento
    )
  }
  ```

### En `useRutinaState.js`:
- Agregar estado: `calentamientoCompletado` (boolean, default false)
- Agregar acción: `completarCalentamiento()` → setea calentamientoCompletado = true
- El workout solo puede iniciarse si `calentamientoCompletado === true` O si el alumno omitió

---

## Nuevo archivo: `src/data/calentamientoDB.js`

```js
export const CALENTAMIENTO_TIPOS = {
  superior: {
    nombre: 'Calentamiento Superior',
    ejercicios: [
      {
        id: 'plancha',
        nombre: 'Plancha',
        descripcion: 'Posición de plancha, cuerpo recto, sostener el tiempo indicado',
        gif_url: null, // completar con URL de Supabase Storage
        unidad: 'seg'
      },
      // ... resto de ejercicios
    ]
  },
  inferior: {
    nombre: 'Calentamiento Inferior',
    ejercicios: [
      // ...
    ]
  }
}

export const getCalentamientoEjercicios = (tipo, seriesConfig) => {
  if (!tipo || !CALENTAMIENTO_TIPOS[tipo]) return []
  return CALENTAMIENTO_TIPOS[tipo].ejercicios.map(ej => ({
    ...ej,
    series: seriesConfig?.[ej.id]?.series ?? 2,
    reps: seriesConfig?.[ej.id]?.reps ?? 10,
  }))
}
```

---

## GIFs del calentamiento

- Subir manualmente los 8 GIFs únicos (planchas, plancha lateral, balanceo brazos, rotación hombros, flexiones, dorsiflexión, sentadilla BW, estocadas, rotación cadera) a Supabase Storage
- Bucket: `calentamiento-gifs` (público)
- Completar las `gif_url` en `calentamientoDB.js` con las URLs públicas

---

## Tests a escribir

```js
// src/test/calentamiento.test.js

// 1. getCalentamientoEjercicios('superior', null) retorna 5 ejercicios con series/reps default
// 2. getCalentamientoEjercicios('inferior', config) aplica la config correctamente
// 3. getCalentamientoEjercicios(null, null) retorna array vacío
// 4. seriesConfig con valores parciales usa defaults para los que faltan
```

---

## Criterios de aceptación

- [ ] El profesor puede asignar calentamiento Superior o Inferior a una rutina
- [ ] El profesor puede editar series y reps de cada ejercicio del calentamiento
- [ ] El alumno ve la opción de calentamiento en PantallaInicio si la rutina lo tiene
- [ ] El alumno puede omitir el calentamiento e ir directo al workout
- [ ] El alumno puede completar el calentamiento marcando cada serie
- [ ] Al completar el calentamiento aparece el botón para iniciar la rutina
- [ ] Rutinas sin calentamiento asignado no muestran ningún cambio en el flujo actual
- [ ] Los tests pasan con `npx vitest run`

---

## SQL para ejecutar en Supabase SQL Editor

```sql
-- 1. Agregar columnas a la tabla rutinas
ALTER TABLE rutinas
ADD COLUMN IF NOT EXISTS tipo_calentamiento text,
ADD COLUMN IF NOT EXISTS series_calentamiento jsonb;

-- 2. Verificar que quedó bien
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'rutinas'
AND column_name IN ('tipo_calentamiento', 'series_calentamiento');
```

> ⚠️ El bucket `calentamiento-gifs` no se crea por SQL, sino desde:
> Supabase Dashboard → Storage → New bucket → nombre: `calentamiento-gifs` → tildar "Public"
