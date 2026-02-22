# Plan: Sistema de Ciclo Mensual (4 Semanas)

## Resumen

Implementar un ciclo de entrenamiento de 4 semanas donde:
- Las cargas (peso) varían cada semana
- Una semana es "descarga" (el profesor elige cuál, típicamente la 4)
- El alumno ve la semana de descarga con un color diferente (verde)
- El ciclo se repite automáticamente

---

## 1. Cambios en Base de Datos (Supabase)

### Tabla `rutina_ejercicios` - Agregar columna:
```sql
ALTER TABLE rutina_ejercicios
ADD COLUMN cargas_semana JSONB DEFAULT NULL;

-- Estructura del JSONB:
-- {
--   "1": {"peso": 50, "rir": 3},
--   "2": {"peso": 55, "rir": 2},
--   "3": {"peso": 60, "rir": 1},
--   "4": {"peso": 40, "rir": 4}  -- semana descarga
-- }
```

### Tabla `alumnos` - Agregar columnas:
```sql
ALTER TABLE alumnos
ADD COLUMN ciclo_config JSONB DEFAULT '{"semana_descarga": 4, "activo": false}';

ALTER TABLE alumnos
ADD COLUMN ciclo_fecha_inicio DATE DEFAULT NULL;
```

---

## 2. Cambios en API (api.js)

- Nueva función `getSemanaActualCiclo()` - Calcula la semana actual basada en fecha
- Nueva función `getCicloInfo()` - Retorna info completa del ciclo
- Nueva función `configurarCiclo()` - Para activar/configurar ciclo por alumno
- Modificar `getMisRutinas()` - Incluir info de ciclo y peso semanal correcto
- Modificar `guardarRutina()` - Guardar `cargas_semana`

---

## 3. Cambios en EditorRutina (Vista Profesor)

### Nuevos elementos UI:
1. **Toggle** "Activar ciclo mensual (4 semanas)"
2. **Tabs de semana** S1 | S2 | S3 | S4 (con indicador de descarga)
3. **Selector** de semana de descarga
4. **Input de peso por semana** - cambia según tab seleccionada
5. **Preview** de cargas: "S1: 50kg | S2: 55kg | S3: 60kg | S4: 40kg"
6. **Botón** "Auto-calcular descarga" (65% de semana 3)

---

## 4. Cambios en Vista Alumno

### HubAlumno:
- Banner superior con info del ciclo: "Semana 3/4"
- Indicador visual de progreso (4 puntos)
- Banner especial verde cuando es semana de descarga:
  - 🌿 "Semana de Descarga - Cargas reducidas para recuperar"

### RutinaDia:
- Pasar info de descarga a componentes hijos
- Estilo verde en PantallaInicio cuando es descarga

### Colores:
- Normal: Cyan (#07ccef)
- Descarga: Verde (#22c55e)

---

## 5. Lógica de Seguimiento de Semana

**Método: Basado en fecha**
- Se calcula desde `ciclo_fecha_inicio`
- Semana actual = (días desde inicio / 7) % 4 + 1
- El ciclo se repite automáticamente (semana 5 = semana 1)
- El profesor puede reiniciar el ciclo si es necesario

---

## 6. Orden de Implementación

1. **Base de datos** - Agregar columnas en Supabase
2. **API** - Nuevas funciones y modificaciones
3. **EditorRutina** - UI para configurar ciclo y cargas semanales
4. **HubAlumno** - Banner de ciclo y estilo descarga
5. **RutinaDia** - Propagar info de descarga
6. **Pruebas** - Verificar transiciones de semana

---

## Archivos a Modificar

| Archivo | Cambios |
|---------|---------|
| `src/services/api.js` | Funciones de ciclo, modificar rutinas |
| `src/components/profesor/EditorRutina.jsx` | Tabs semana, toggle ciclo, peso semanal |
| `src/components/profesor/editor-rutina.css` | Estilos nuevos UI |
| `src/components/rutina/HubAlumno.jsx` | Banner ciclo, info descarga |
| `src/components/rutina/styles/hub-alumno.css` | Estilos verde descarga |
| `src/components/rutina/RutinaDia.jsx` | Pasar info ciclo |
| `src/components/rutina/PantallaInicio.jsx` | Banner descarga |

---

## Compatibilidad

- Rutinas existentes funcionan igual (cargas_semana = NULL usa peso base)
- El profesor activa el ciclo cuando quiera
- No se pierde ningún dato existente
