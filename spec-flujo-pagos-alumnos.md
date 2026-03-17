# SPEC: Flujo de Pagos y Alta de Alumnos

## Estado: ⏳ Pendiente

---

## Qué hace esta feature

Permite dos modelos de pago:
- **Modelo A**: Un visitante sin cuenta paga un plan → queda visible para los profesores → un profesor lo toma y le manda invitación → el alumno se registra y su plan queda activo
- **Modelo B**: Un alumno ya registrado paga un plan desde su perfil → su suscripción se activa automáticamente

---

## Base de datos

### Nueva tabla `alumnos_pendientes`
Guarda visitantes que pagaron pero todavía no tienen cuenta:

```sql
CREATE TABLE alumnos_pendientes (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique,
  nombre            text not null,
  telefono          text,
  plan              text not null,
  monto             numeric(10,2),
  mp_payment_id     text unique,
  mp_preference_id  text,
  estado            text default 'sin_asignar', -- 'sin_asignar' | 'asignado' | 'registrado'
  profesor_id       uuid references profiles(id), -- se llena cuando un profesor lo toma
  created_at        timestamptz default now()
);
```

### Modificar tabla `pagos` — agregar columnas:
```sql
ALTER TABLE pagos
ADD COLUMN IF NOT EXISTS nombre_pagador text,
ADD COLUMN IF NOT EXISTS telefono_pagador text,
ADD COLUMN IF NOT EXISTS alumno_pendiente_id uuid references alumnos_pendientes(id);
```

### Modificar tabla `profiles` — ya definido en spec-pasarela-pagos.md:
```sql
-- Verificar que existan estas columnas (ya están en la spec anterior):
-- suscripcion_activa boolean default false
-- plan_activo text
-- fecha_vencimiento_plan timestamptz
```

---

## Backend Express — `server/index.js`

### `POST /create_preference`
Recibir en el body:
```js
{
  planId,        // 'BRONCE' | 'PLATA' | 'ORO' | 'VIP'
  monto,
  profileId,     // null si es visitante sin cuenta
  email,
  nombre,
  telefono,
  esVisitante    // boolean
}
```

Lógica:
1. Crear preferencia en MP con `back_urls` configuradas:
   ```js
   back_urls: {
     success: `${process.env.FRONTEND_URL}/pago-exitoso`,
     failure: `${process.env.FRONTEND_URL}/planes`,
     pending: `${process.env.FRONTEND_URL}/pago-pendiente`
   }
   ```
2. Si `esVisitante === true`: insertar en `alumnos_pendientes` con estado `'sin_asignar'`
3. Si `esVisitante === false`: insertar en `pagos` con `profile_id` y estado `'pendiente'`
4. Retornar `preferenceId`

### `POST /webhook`
Al recibir notificación de MP:
1. Verificar el pago contra la API de MP (`GET /v1/payments/:id`)
2. Si `status === 'approved'`:
   - Buscar si el pago corresponde a un `alumno_pendiente` o a un `profile_id`
   - **Si es visitante**: actualizar `alumnos_pendientes` con `mp_payment_id` y los datos del pagador desde MP
   - **Si es alumno registrado**: 
     - Actualizar `pagos`: `estado = 'aprobado'`, `fecha_pago`, `medio_pago`, `cuotas`
     - Actualizar `profiles`: `suscripcion_activa = true`, `plan_activo`, `fecha_vencimiento_plan`
3. Si `status === 'rejected'` o `'cancelled'`: actualizar solo el estado, no tocar perfiles

### Duración por plan:
```js
const DURACION_PLANES = {
  BRONCE: 30,
  PLATA:  90,
  ORO:    180,
  VIP:    30
}
```

---

## Frontend

### `planesCards.jsx` — detectar si es visitante o alumno registrado

```jsx
const { perfil } = useAuth()
const esVisitante = !perfil  // no está logueado

const handleBuy = async (plan) => {
  if (esVisitante) {
    // Mostrar modal para pedir nombre, email y teléfono antes de continuar
    setModalDatosVisible(true)
    setPlanSeleccionado(plan)
  } else {
    // Flujo directo con los datos del perfil
    await crearPreferencia(plan, perfil)
  }
}
```

### Nuevo modal "Tus datos" (solo para visitantes)
Aparece antes del modal de pago cuando el visitante no está logueado.
Campos:
- Nombre completo (obligatorio)
- Email (obligatorio)
- Teléfono (obligatorio)

Al confirmar → llama a `/create_preference` con `esVisitante: true` → abre el widget de MP.

### Nueva página `src/components/planes/PagoExitoso.jsx`
Ruta: `/pago-exitoso`
Muestra:
- ✅ "¡Tu pago fue aprobado!"
- Si es visitante: "En breve un profesor se pondrá en contacto con vos al email [email] para coordinar el inicio."
- Si es alumno registrado: "Tu plan [PLAN] está activo. ¡Ya podés empezar a entrenar!"
- Botón: "Volver al inicio"

### Nueva página `src/components/planes/PagoPendiente.jsx`
Ruta: `/pago-pendiente`
Muestra mensaje de pago pendiente de acreditación con instrucciones.

---

## Panel del profesor — lista de alumnos sin asignar

### En `HubProfesor.jsx`
Agregar una nueva sección "Alumnos nuevos sin asignar" que muestra los registros de `alumnos_pendientes` con `estado = 'sin_asignar'`.

Cada card muestra:
- Nombre
- Email
- Teléfono
- Plan pagado
- Fecha de pago
- Botón "Tomar alumno"

### Flujo "Tomar alumno":
1. Profesor hace clic en "Tomar alumno"
2. Modal de confirmación: "¿Querés tomar a [nombre] como tu alumno?"
3. Al confirmar:
   a. Actualizar `alumnos_pendientes`: `estado = 'asignado'`, `profesor_id = perfil.id`
   b. Llamar a `crearInvitacion()` que ya existe — usar el email y nombre del alumno pendiente
4. El alumno desaparece de la lista "sin asignar"
5. Aparece en la lista de invitaciones pendientes del profesor

### Flujo del alumno al registrarse (modificar `AuthContext.registro()`):
Al registrarse, además de buscar invitación pendiente, verificar si existe un `alumno_pendiente` con ese email:
```js
// Si hay alumno_pendiente con ese email y estado 'asignado':
// 1. Crear el perfil normal
// 2. Activar suscripcion_activa = true, plan_activo, fecha_vencimiento_plan
// 3. Actualizar alumnos_pendientes: estado = 'registrado'
```

---

## Nuevas funciones en `src/services/api.js`

```js
// Obtener alumnos pendientes sin asignar (para el hub del profesor)
getAlumnosPendientes()
// → select * from alumnos_pendientes where estado = 'sin_asignar' order by created_at desc

// Tomar un alumno pendiente
tomarAlumnoPendiente(alumnosPendienteId, profesorProfileId)
// → update alumnos_pendientes set estado='asignado', profesor_id=profesorProfileId
// → luego llama a crearInvitacion() con los datos del alumno

// Verificar si hay pago previo al registrarse
verificarPagoPrevio(email)
// → select * from alumnos_pendientes where email=email and estado='asignado'
```

---

## Variables de entorno a agregar

### Backend (Render):
```
FRONTEND_URL=https://tu-dominio-en-vercel.app
```

### Frontend:
```
VITE_MP_PUBLIC_KEY_TEST=TEST-xxxx
```

---

## Tests a escribir

```js
// src/test/flujo-pagos.test.js

// 1. Visitante sin cuenta: crearPreferencia recibe esVisitante=true e inserta en alumnos_pendientes
// 2. Webhook approved para visitante: actualiza alumnos_pendientes, NO toca profiles
// 3. Webhook approved para alumno registrado: activa suscripcion_activa en profiles
// 4. Al registrarse con email que tiene pago previo: suscripcion_activa queda en true
// 5. getAlumnosPendientes retorna solo los de estado 'sin_asignar'
// 6. tomarAlumnoPendiente cambia estado a 'asignado' y crea invitación
```

---

## Criterios de aceptación

- [ ] Un visitante puede elegir un plan, ingresar sus datos y pagar
- [ ] Al aprobarse el pago, el visitante aparece en "Alumnos sin asignar" en el hub del profesor
- [ ] El profesor puede tomar al alumno → se crea la invitación automáticamente
- [ ] El alumno recibe la invitación, se registra, y su suscripción queda activa
- [ ] Un alumno ya registrado puede pagar desde su perfil y su suscripción se activa sola
- [ ] La página `/pago-exitoso` muestra el mensaje correcto según si es visitante o registrado
- [ ] Los tests pasan con `npx vitest run`

---

## SQL para ejecutar en Supabase SQL Editor

```sql
-- 1. Crear tabla alumnos_pendientes
CREATE TABLE alumnos_pendientes (
  id                uuid primary key default gen_random_uuid(),
  email             text not null unique,
  nombre            text not null,
  telefono          text,
  plan              text not null,
  monto             numeric(10,2),
  mp_payment_id     text unique,
  mp_preference_id  text,
  estado            text default 'sin_asignar',
  profesor_id       uuid references profiles(id),
  created_at        timestamptz default now()
);

-- 2. Agregar columnas a pagos
ALTER TABLE pagos
ADD COLUMN IF NOT EXISTS nombre_pagador text,
ADD COLUMN IF NOT EXISTS telefono_pagador text,
ADD COLUMN IF NOT EXISTS alumno_pendiente_id uuid references alumnos_pendientes(id);

-- 3. RLS para alumnos_pendientes
ALTER TABLE alumnos_pendientes ENABLE ROW LEVEL SECURITY;

-- Los profesores pueden ver todos los pendientes sin asignar
CREATE POLICY "profesores_ver_pendientes"
ON alumnos_pendientes FOR SELECT
USING (estado = 'sin_asignar');

-- 4. Verificar
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'alumnos_pendientes';
```
