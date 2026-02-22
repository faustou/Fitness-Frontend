-- =====================================================
-- SQL para Sistema de Ciclo Mensual
-- Ejecutar en Supabase SQL Editor
-- =====================================================

-- 1. Agregar columna cargas_semana a rutina_ejercicios
-- Almacena las cargas variables por semana
ALTER TABLE rutina_ejercicios
ADD COLUMN IF NOT EXISTS cargas_semana JSONB DEFAULT NULL;

-- Estructura del JSONB:
-- {
--   "1": {"peso": 50, "rir": 3},
--   "2": {"peso": 55, "rir": 2},
--   "3": {"peso": 60, "rir": 1},
--   "4": {"peso": 40, "rir": 4}
-- }

-- 2. Agregar columnas de ciclo a alumnos
ALTER TABLE alumnos
ADD COLUMN IF NOT EXISTS ciclo_config JSONB DEFAULT '{"semana_descarga": 4, "activo": false}';

ALTER TABLE alumnos
ADD COLUMN IF NOT EXISTS ciclo_fecha_inicio DATE DEFAULT NULL;

-- Estructura de ciclo_config:
-- {
--   "semana_descarga": 4,    -- cual semana es descarga (1-4)
--   "activo": true,          -- si el ciclo esta habilitado
--   "duracion_semanas": 4    -- duracion del ciclo
-- }

-- =====================================================
-- Verificar que las columnas se crearon correctamente
-- =====================================================
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'rutina_ejercicios' AND column_name = 'cargas_semana';

-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'alumnos' AND column_name IN ('ciclo_config', 'ciclo_fecha_inicio');
