# Contexto del Proyecto - Plataforma de Entrenamiento

**Fecha:** 23 de Enero 2026
**Última sesión de trabajo:** Implementación del módulo de rutinas del alumno

---

## Visión General del Proyecto

Plataforma de entrenamiento con 2 roles:
- **Alumno:** Ve su rutina del día, registra series/reps/peso, marca ejercicios completados
- **Profesor:** Asigna rutinas a alumnos, analiza progreso (pendiente)

---

## Lo que implementamos hoy

### 1. Estructura de datos centralizada
- `src/data/ejerciciosDB.js` - Base de datos de 51 ejercicios organizados por categoría
- `src/data/mockRutinas.js` - Datos mock de rutina del día (preparado para API)

### 2. Hook de estado
- `src/hooks/useRutinaState.js` - Maneja todo el estado del workout:
  - Timer del workout (cuenta hacia arriba)
  - Navegación entre ejercicios
  - CRUD de series (agregar, editar, eliminar, completar)
  - Cálculo de progreso granular

### 3. Componentes del módulo Rutina
```
src/components/rutina/
├── RutinaDia.jsx          # Contenedor principal
├── HubAlumno.jsx          # Página inicial del alumno
├── PantallaInicio.jsx     # Resumen antes de comenzar workout
├── BarraProgreso.jsx      # Thumbnails + barra de progreso horizontal
├── EjercicioActual.jsx    # Vista del ejercicio en ejecución
├── TablaSeries.jsx        # Tabla de series editable
├── FilaSerie.jsx          # Fila con swipe-to-delete
├── TimerWorkout.jsx       # Timer total del workout
├── TimerDescanso.jsx      # Timer entre series (overlay)
├── ResumenRutina.jsx      # Pantalla final con estadísticas
└── styles/                # CSS de cada componente
```

### 4. Rutas implementadas
| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/alumno` | HubAlumno | Hub principal del alumno |
| `/mi-rutina` | RutinaDia | Workout del día |
| `/ejercicios/*` | Ejercicios | Biblioteca (backup) |

### 5. Funcionalidades implementadas
- ✅ Pantalla de inicio con resumen de rutina
- ✅ Barra de progreso con thumbnails navegables
- ✅ Tabla de series editable (Reps, Peso, RIR)
- ✅ Marcar series como completadas
- ✅ Timer de descanso entre series (cuenta regresiva circular)
- ✅ Timer total del workout
- ✅ Swipe-to-delete para eliminar series
- ✅ Agregar series adicionales
- ✅ Navegación entre ejercicios (anterior/siguiente)
- ✅ Pantalla de resumen al finalizar (tiempo, series, volumen)
- ✅ Redirección al Hub al terminar

---

## Problemas conocidos / Pendientes

### Bugs a revisar
- [ ] Verificar que el swipe-to-delete funcione bien en móvil (touch events)
- [ ] El progreso no persiste si se recarga la página (sin localStorage aún)

### Funcionalidades pendientes del alumno
- [ ] Persistencia del progreso en localStorage
- [ ] Conectar con API real (actualmente usa mock)
- [ ] Historial de entrenamientos pasados
- [ ] Gráficos de progreso
- [ ] Notificaciones/recordatorios

### Funcionalidades del profesor (no iniciadas)
- [ ] Panel de control del profesor
- [ ] Crear/editar rutinas
- [ ] Asignar rutinas a alumnos
- [ ] Ver progreso de alumnos
- [ ] Gestión de alumnos

### Backend (no iniciado)
- [ ] API REST para rutinas
- [ ] Base de datos (ejercicios, rutinas, usuarios, progreso)
- [ ] Autenticación (roles alumno/profesor)

---

## Estructura de datos actual

```javascript
// Rutina del día
{
  id: 1,
  alumnoId: 123,
  fecha: "2026-01-23",
  nombreRutina: "Día de Piernas - Semana 1",
  ejercicios: [
    {
      id: 1,
      ejercicioId: "hip-trust",
      nombre: "HIP TRUST",
      gif: "...",
      muscle: "...",
      descanso: 90, // segundos
      series: [
        {
          numero: 1,
          repsObjetivo: 12,
          pesoObjetivo: 40,
          repsReal: null,
          pesoReal: null,
          rir: null,
          completada: false
        }
      ],
      completado: false
    }
  ]
}
```

---

## Siguiente paso lógico (mañana)

### Opción A: Persistencia local
1. Guardar progreso en localStorage al completar series
2. Recuperar estado si se recarga la página
3. Limpiar al finalizar workout

### Opción B: Backend básico
1. Crear API con Node/Express o similar
2. Endpoints: GET /rutina-del-dia, POST /registrar-progreso
3. Base de datos: PostgreSQL o MongoDB

### Opción C: Panel del profesor
1. Crear ruta `/profesor`
2. Vista para crear rutinas
3. Selector de ejercicios desde ejerciciosDB
4. Asignar series/reps/peso por ejercicio

---

## Comandos útiles

```bash
# Iniciar desarrollo
cd c:\Users\Fausto\Desktop\estudio\GERMAN\frontend
npm run dev

# Ver la app
http://localhost:5173/alumno    # Hub del alumno
http://localhost:5173/mi-rutina # Workout directo
```

---

## Paleta de colores

- Fondo principal: `#07181f`
- Fondo secundario: `#112830`
- Acento cyan: `#07ccef`
- Acento hover: `#05b4d6`
- Texto: `white` / `#dffbff`
