-- MIGRACIÓN: Mejorar sistema de login con nombre_ingreso
-- Fecha: 2025-11-24
-- Descripción: Permite login con correo o nombre_ingreso, hace campos obligatorios y elimina columnas innecesarias

-- Paso 1: Asignar valores por defecto a campos que serán NOT NULL
UPDATE public.usuarios SET esta_activo = true WHERE esta_activo IS NULL;
UPDATE public.usuarios SET id_suc = 1 WHERE id_suc IS NULL;
UPDATE public.usuarios SET grupo = 'General' WHERE grupo IS NULL OR grupo = '';
UPDATE public.usuarios SET estado = 'Activo' WHERE estado IS NULL OR estado = '';

-- Paso 2: Generar valores por defecto para la columna 'nombre' antes de renombrarla
-- Formato: primera letra de primera palabra + segunda palabra completa del nombre_completo
UPDATE public.usuarios
SET nombre = LOWER(
  CASE
    WHEN nombre_completo IS NOT NULL AND nombre_completo != '' THEN
      -- Extraer primera letra de primera palabra
      LEFT(SPLIT_PART(TRIM(nombre_completo), ' ', 1), 1) ||
      -- Agregar segunda palabra completa (si existe)
      CASE
        WHEN ARRAY_LENGTH(STRING_TO_ARRAY(TRIM(nombre_completo), ' '), 1) >= 2
        THEN SPLIT_PART(TRIM(nombre_completo), ' ', 2)
        ELSE ''
      END
    ELSE
      -- Fallback si nombre_completo está vacío
      'usuario' || id_usuario::text
  END
)
WHERE nombre IS NULL OR nombre = '';

-- Paso 3: Renombrar columna 'nombre' a 'nombre_ingreso'
ALTER TABLE public.usuarios RENAME COLUMN nombre TO nombre_ingreso;

-- Paso 4: Eliminar columnas innecesarias
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS login;
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS cod_lic;
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS rol;

-- Paso 5: Hacer obligatorios los campos requeridos
ALTER TABLE public.usuarios ALTER COLUMN id_usuario SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN correo SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN nombre_ingreso SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN id_rol SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN nombre_completo SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN esta_activo SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN id_suc SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN grupo SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN estado SET NOT NULL;

-- Paso 6: Eliminar columnas innecesarias
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS login;
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS cod_lic;
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS rol;

-- Paso 7: Crear índices únicos para campos que no deben duplicarse
-- Nota: id_usuario ya es PRIMARY KEY, correo ya debería ser único
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_correo_unique ON public.usuarios(correo);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_nombre_ingreso_unique ON public.usuarios(nombre_ingreso);

-- Paso 8: Actualizar constraints para asegurar unicidad
-- Nota: Si ya existen, esto no hará nada
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_correo_unique UNIQUE (correo);
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_nombre_ingreso_unique UNIQUE (nombre_ingreso);

-- Paso 9: Crear tabla de log de migraciones si no existe
CREATE TABLE IF NOT EXISTS public.ddl_migrations_log (
    id SERIAL PRIMARY KEY,
    mensaje TEXT NOT NULL,
    ejecutado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Paso 10: Log de la migración
INSERT INTO public.ddl_migrations_log (mensaje) VALUES ('Migración completada: Sistema de login mejorado con nombre_ingreso');