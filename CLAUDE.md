# CLAUDE.md — Entrenador Personal App

## Stack y tecnologías
- **React 18** con **Vite** — NO usar Create React App ni Next.js
- **TypeScript/TSX** para componentes nuevos, JSX para los existentes
- **React Router DOM v7** para rutas
- **Supabase** como base de datos y auth — importar siempre desde `src/lib/supabase.js`
- **Bootstrap + React Bootstrap** para UI base
- **Framer Motion** para animaciones
- **ApexCharts / Recharts** para gráficos de estadísticas
- **NO usar**: Redux, Zustand, React Query, Formik, React Hook Form — el proyecto usa Context API y useState nativo

## Arquitectura y estructura
- Organización **feature-based**: cada dominio tiene su carpeta en `src/components/`
  - `auth/` — login, registro, rutas protegidas
  - `rutina/` — flujo de entrenamiento del alumno
  - `profesor/` — herramientas del profesor
  - `ejercicios/` — biblioteca de ejercicios
- Estado global SOLO en `src/context/AuthContext.jsx` — no crear nuevos contextos sin consultar
- Custom hooks en `src/hooks/` — lógica de estado compleja va ahí, no en los componentes
- NUNCA llamar a supabase directamente desde un componente — siempre usar las funciones de `src/services/`
- Assets estáticos en `src/assets/img/`

## Organización de servicios
Las llamadas a Supabase están divididas por dominio en `src/services/`:
- `rutinas.api.js` — rutinas, ejercicios de rutina, ciclos, calentamiento
- `ejercicios.api.js` — catálogo de ejercicios, GIFs
- `alumnos.api.js` — alumnos, profesores, invitaciones, alumnos pendientes
- `pagos.api.js` — pagos, suscripciones
- `historial.api.js` — historial de entrenamientos, estadísticas
- `calculos.js` — funciones de cálculo (calcularE1RM, calcularMejorE1RM)
- `api.js` — archivo índice que re-exporta todo, no agregar lógica acá

Cuando agregues funciones nuevas, identificá el dominio correspondiente y agregalo al archivo correcto. Si un dominio nuevo supera 3 funciones, creá un archivo nuevo.

## Patrones de código establecidos

### Llamadas a la API
```js
// ✅ CORRECTO — siempre en api.js, siempre con try/catch
export const getMisDatos = async (profileId) => {
  const { data, error } = await supabase
    .from('tabla')
    .select('campo1, campo2')
    .eq('profile_id', profileId)
    .single()
  
  if (error) throw error
  return data
}

// ✅ CORRECTO — en el componente, con estado local
const [datos, setDatos] = useState(null)
const [cargando, setCargando] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const cargar = async () => {
    try {
      setCargando(true)
      const resultado = await getMisDatos(perfil.id)
      setDatos(resultado)
    } catch (err) {
      setError('Error al cargar los datos')
    } finally {
      setCargando(false)
    }
  }
  if (perfil?.id) cargar()
}, [perfil?.id])
```

### Formularios (sin librería)
```tsx
// ✅ CORRECTO — useState local + onChange
const [form, setForm] = useState({ nombre: '', peso: '' })

const handleChange = (e) => {
  setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
}

// ❌ INCORRECTO — no instalar react-hook-form ni formik
```

### Roles y autenticación
```js
// Siempre leer roles desde el contexto, nunca desde localStorage directo
const { perfil, esAlumno, esProfesor, esAdmin } = useAuth()
```

### Rutas protegidas
- Usar `<ProtectedRoute>` existente en `src/components/auth/ProtectedRoute.jsx`
- No crear nuevos sistemas de protección de rutas

## Cálculos de fitness
- **e1RM**: usar siempre `calcularE1RM(peso, reps, rir)` de `calculos.js` — fórmula de Brzycki con RIR
- **RIR (Reps In Reserve)**: es el esfuerzo percibido. 0 = al fallo, 3 = fácil
- **Ciclos de entrenamiento**: la app maneja semanas de carga/descarga (`cicloInfo.esDescarga`)
- **Días de semana**: 0-6, donde 0 = Lunes (convención del proyecto)

## Base de datos Supabase — tablas principales
- `profiles` — datos de usuario (vinculado a auth.users)
- `alumnos` — alumnos registrados, con `profile_id` como FK
- `profesores` — profesores registrados, con `profile_id` como FK
- `rutinas` — rutinas por alumno, día y mes (`alumno_id`, `dia_semana`, `mes_anio`)
- `rutina_ejercicios` — ejercicios dentro de cada rutina (con orden, series, reps, peso, rir)
- `ejercicios` — catálogo de ejercicios
- `historial_entrenamientos` — entrenamientos completados con `datos_ejercicios` (JSON)

## Anti-patrones — NUNCA hacer esto
- ❌ Llamar a `supabase` directamente desde un componente
- ❌ Guardar el JWT o token manualmente — Supabase Auth lo maneja solo
- ❌ Crear un contexto nuevo sin necesidad — primero evaluar si alcanza con estado local
- ❌ Mutar el estado directamente — siempre usar el setter: `setRutina(prev => {...prev})`
- ❌ Usar `JSON.parse(JSON.stringify())` en producción para clonar (usar structuredClone o spread)
- ❌ Hacer múltiples fetches en cascada innecesarios — Supabase soporta joins en una sola query
- ❌ Hardcodear IDs de roles o perfiles
- ❌ Instalar librerías nuevas sin verificar si ya existe algo en el stack que lo resuelva

## Testing
- Tests unitarios con **Vitest** en `src/test/`
- Tests de componentes con `@testing-library/react`
- Para funciones de cálculo (e1RM, progreso): siempre escribir tests unitarios
- Correr tests: `npm run test` (watch) o `npx vitest run` (una sola vez)

## Convenciones de nombres
- Componentes: PascalCase (`RutinaDia.jsx`)
- Hooks: camelCase con prefijo `use` (`useRutinaState.js`)
- Funciones de API: camelCase descriptivo (`getMisRutinas`, `guardarEntrenamiento`)
- Variables de estado: español, descriptivas (`cargando`, `ejercicioActualIndex`)
- CSS: archivos separados por componente en subcarpeta `styles/`