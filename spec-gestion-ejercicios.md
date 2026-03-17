# Estado: ✅ Completada — [3/3/26]
# SPEC: Gestión de Ejercicios por el Profesor

## Qué hace esta feature
Permite a cualquier profesor crear, editar y eliminar ejercicios de la biblioteca compartida.
Los ejercicios creados quedan disponibles para todos los profesores al armar rutinas.

---

## Dónde vive en la app
- Agregar una nueva sección en `HubProfesor.jsx` llamada "Biblioteca de ejercicios" con un botón para acceder
- Nueva ruta: `/profesor/ejercicios`
- Nuevo componente principal: `src/components/ejercicios/GestionEjercicios.jsx`
- Protegida con `<ProtectedRoute>` — solo rol `esProfesor` o `esAdmin`

---

## Datos del ejercicio

Campos obligatorios:
- `nombre` (string) — nombre del ejercicio
- `grupo_muscular` (string) — uno de: "Piernas", "Espalda", "Pecho", "Brazos", "Hombros", "Abdomen", "Movilidad"
- `dificultad` (string) — uno de: "Principiante", "Intermedio", "Avanzado"

Campos opcionales:
- `descripcion` (string) — instrucciones de ejecución
- `gif_url` (string) — URL del GIF subido a Supabase Storage

---

## Base de datos

### Tabla `ejercicios` — verificar que tenga estas columnas, agregarlas si faltan:
```sql
id           uuid primary key default gen_random_uuid()
nombre       text not null
grupo_muscular text
descripcion  text
dificultad   text
gif_url      text        -- URL pública de Supabase Storage (antes era path local)
creado_por   uuid references profiles(id)  -- profile_id del profesor que lo creó
created_at   timestamptz default now()
```

### Supabase Storage
- Bucket: `ejercicios-gifs` (crearlo si no existe, público)
- Path de cada archivo: `{ejercicioId}/{nombreArchivo}.gif`
- Tamaño máximo: 5MB
- Tipos permitidos: image/gif, image/webp

---

## Funciones a agregar en `src/services/api.js`

```js
// Obtener todos los ejercicios de Supabase
getEjerciciosDB() 
// → selecciona id, nombre, grupo_muscular, descripcion, dificultad, gif_url, creado_por

// Crear ejercicio nuevo
crearEjercicio(datos, profileId)
// → insert en ejercicios con creado_por = profileId
// → retorna el ejercicio creado con su id

// Editar ejercicio existente
editarEjercicio(ejercicioId, datos)
// → update en ejercicios donde id = ejercicioId

// Eliminar ejercicio
eliminarEjercicio(ejercicioId)
// → primero eliminar el GIF de Storage si tiene gif_url
// → luego delete en ejercicios donde id = ejercicioId

// Subir GIF a Supabase Storage
subirGifEjercicio(ejercicioId, archivo)
// → upload a bucket 'ejercicios-gifs' en path `{ejercicioId}/{archivo.name}`
// → retorna la URL pública
```

---

## Flujo: Crear ejercicio

1. Profesor hace clic en "Nuevo ejercicio"
2. Se abre un modal con el formulario
3. Completa: nombre (obligatorio), grupo muscular (obligatorio), dificultad (obligatorio), descripción (opcional)
4. Opcionalmente sube un GIF (input file, acepta gif/webp, máx 5MB)
5. Al hacer clic en "Guardar":
   a. Validar que nombre, grupo_muscular y dificultad estén completos — si no, mostrar error inline
   b. Llamar a `crearEjercicio()` → obtener el id del ejercicio nuevo
   c. Si hay GIF: llamar a `subirGifEjercicio(id, archivo)` → obtener URL
   d. Si hay GIF: llamar a `editarEjercicio(id, { gif_url: url })`
   e. Cerrar modal y actualizar la lista sin recargar la página
6. Mostrar toast/mensaje de éxito

Edge cases:
- Si el upload del GIF falla, el ejercicio igual se guarda (sin GIF) y se muestra advertencia
- No permitir nombres duplicados — verificar antes de insertar
- El botón Guardar se deshabilita mientras está cargando

---

## Flujo: Editar ejercicio

1. Cada ejercicio en la lista tiene un botón "Editar" (lápiz)
2. Se abre el mismo modal con los datos precargados
3. El profesor modifica lo que quiera
4. Si sube un GIF nuevo: reemplaza el anterior (borrar el viejo de Storage primero)
5. Al guardar: llamar a `editarEjercicio(id, datos)`
6. Actualizar la lista sin recargar

Edge cases:
- Un profesor solo puede editar ejercicios que él creó (`creado_por === perfil.id`), a menos que sea Admin
- Si intenta editar uno ajeno, mostrar el botón deshabilitado con tooltip "Solo puede editarlo su creador"

---

## Flujo: Eliminar ejercicio

1. Cada ejercicio tiene un botón "Eliminar" (tacho)
2. Mostrar modal de confirmación: "¿Eliminar [nombre]? Esta acción no se puede deshacer."
3. Al confirmar: llamar a `eliminarEjercicio(id)`
4. Actualizar la lista sin recargar

Edge cases:
- Solo puede eliminar ejercicios que él creó (misma regla que editar)
- Si el ejercicio está siendo usado en una rutina activa, mostrar error: "Este ejercicio está en uso y no puede eliminarse"

---

## UI del listado

- Mostrar todos los ejercicios de Supabase como cards o tabla
- Filtros: por grupo muscular (dropdown) y por dificultad (dropdown)
- Buscador por nombre (filtrado local, no nuevo fetch)
- Cada card muestra: GIF (o placeholder si no tiene), nombre, grupo muscular, dificultad
- Indicador visual si el ejercicio fue creado por el profesor actual ("Creado por ti")
- Estado de carga con spinner mientras fetchea
- Mensaje "No hay ejercicios" si la lista está vacía

---

## Compatibilidad con ejerciciosDB.js

El archivo `src/data/ejerciciosDB.js` contiene los ejercicios hardcodeados que ya existen.
La función `getEjercicioById` lo usa para obtener GIFs locales durante el workout.

**NO modificar ejerciciosDB.js.** Los ejercicios nuevos creados por profesores solo viven en Supabase.
Cuando se muestra el GIF en el workout, la lógica actual ya hace:
```js
const ejercicioLocal = getEjercicioById(ej.ejercicioId) // busca en DB local
gif: ejercicioLocal?.gif || null                        // si no tiene, null
```
Para los ejercicios nuevos (de Supabase), el gif vendrá como `gif_url` desde la rutina.
Verificar que `adaptarRutinaAPI` en `RutinaDia.jsx` use `gif_url` si `ejercicioLocal?.gif` es null.

---

## Tests a escribir

```js
// En src/test/ejercicios.test.js

// 1. crearEjercicio guarda correctamente en Supabase (mock)
// 2. editarEjercicio actualiza solo los campos enviados
// 3. eliminarEjercicio falla con mensaje claro si el ejercicio está en uso
// 4. Validación del formulario: no permite guardar sin nombre
// 5. Validación del formulario: no permite guardar sin grupo muscular
// 6. subirGifEjercicio rechaza archivos mayores a 5MB
```

---

## Criterios de aceptación

- [ ] Un profesor puede crear un ejercicio con nombre, grupo muscular y dificultad
- [ ] El ejercicio aparece en la lista inmediatamente después de crearlo
- [ ] Un profesor puede subir un GIF y verlo en la card del ejercicio
- [ ] Un profesor puede editar solo sus propios ejercicios
- [ ] Un profesor puede eliminar solo sus propios ejercicios
- [ ] No se puede eliminar un ejercicio que está en uso en una rutina
- [ ] Los ejercicios creados aparecen disponibles en el EditorRutina para asignar a alumnos
- [ ] Los tests pasan con `npx vitest run`
