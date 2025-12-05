-- =====================================================
-- MIGRACIÓN COMPLETA: Sistema de Login Dinámico
-- Fecha: 2025-11-24
-- Descripción: Implementa login con correo o nombre_ingreso
-- =====================================================

-- =====================================================
-- MIGRACIÓN COMPLETA: Sistema de Login Dinámico
-- Fecha: 2025-11-24
-- Descripción: Implementa login con correo o nombre_ingreso
-- =====================================================

-- PASO 1: Asignar valores por defecto a campos que serán NOT NULL
UPDATE public.usuarios SET esta_activo = true WHERE esta_activo IS NULL;
UPDATE public.usuarios SET id_suc = 1 WHERE id_suc IS NULL;
UPDATE public.usuarios SET grupo = 'General' WHERE grupo IS NULL OR grupo = '';
UPDATE public.usuarios SET estado = 'Activo' WHERE estado IS NULL OR estado = '';

-- PASO 2: Generar valores únicos para nombre_ingreso
-- Usar una tabla temporal para generar nombres únicos sin conflictos
CREATE TEMP TABLE temp_nombres_unicos AS
WITH ranked_users AS (
  SELECT
    id_usuario,
    LOWER(
      CASE
        WHEN nombre_completo IS NOT NULL AND nombre_completo != '' THEN
          -- Extraer primera letra de primera palabra + segunda palabra completa
          LEFT(SPLIT_PART(TRIM(nombre_completo), ' ', 1), 1) ||
          CASE
            WHEN ARRAY_LENGTH(STRING_TO_ARRAY(TRIM(nombre_completo), ' '), 1) >= 2
            THEN SPLIT_PART(TRIM(nombre_completo), ' ', 2)
            ELSE SPLIT_PART(TRIM(nombre_completo), ' ', 1)
          END
        ELSE
          -- Fallback si nombre_completo está vacío
          'usuario' || id_usuario::text
      END
    ) as nombre_base,
    ROW_NUMBER() OVER (ORDER BY id_usuario) as rn
  FROM public.usuarios
  WHERE nombre IS NULL OR nombre = ''
),
unique_names AS (
  SELECT
    id_usuario,
    CASE
      WHEN COUNT(*) OVER (PARTITION BY nombre_base) > 1 THEN
        nombre_base || '_' || ROW_NUMBER() OVER (PARTITION BY nombre_base ORDER BY id_usuario)
      ELSE nombre_base
    END as nombre_ingreso_final
  FROM ranked_users
)
SELECT id_usuario, nombre_ingreso_final
FROM unique_names;

-- Actualizar la tabla con los nombres únicos generados
UPDATE public.usuarios
SET nombre = t.nombre_ingreso_final
FROM temp_nombres_unicos t
WHERE public.usuarios.id_usuario = t.id_usuario;

-- Limpiar tabla temporal
DROP TABLE temp_nombres_unicos;

-- PASO 3: Renombrar columna nombre → nombre_ingreso
ALTER TABLE public.usuarios RENAME COLUMN nombre TO nombre_ingreso;

-- PASO 4: Eliminar columnas innecesarias
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS login;
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS cod_lic;
ALTER TABLE public.usuarios DROP COLUMN IF EXISTS rol;

-- PASO 5: Hacer NOT NULL campos obligatorios
ALTER TABLE public.usuarios ALTER COLUMN id_usuario SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN correo SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN nombre_ingreso SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN id_rol SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN nombre_completo SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN esta_activo SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN id_suc SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN grupo SET NOT NULL;
ALTER TABLE public.usuarios ALTER COLUMN estado SET NOT NULL;

-- PASO 6: Crear índices únicos
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_correo_unique ON public.usuarios(correo);
CREATE UNIQUE INDEX IF NOT EXISTS idx_usuarios_nombre_ingreso_unique ON public.usuarios(nombre_ingreso);

-- PASO 7: Crear constraints únicos
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_correo_unique UNIQUE (correo);
ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_nombre_ingreso_unique UNIQUE (nombre_ingreso);

-- PASO 8: Crear tabla de logs si no existe
CREATE TABLE IF NOT EXISTS public.ddl_migrations_log (
    id SERIAL PRIMARY KEY,
    mensaje TEXT NOT NULL,
    ejecutado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASO 9: Registrar migración
INSERT INTO public.ddl_migrations_log (mensaje)
VALUES ('Migración completada: Sistema de login mejorado con nombre_ingreso');

-- PASO 10: Crear función de autenticación
CREATE OR REPLACE FUNCTION public.autenticar_usuario(p_identificador text, p_password text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_user_record RECORD;
    v_password_valid boolean := false;
BEGIN
    -- Buscar usuario por correo o nombre_ingreso
    SELECT
        u.id_usuario,
        u.correo,
        u.nombre_ingreso,
        u.nombre_completo,
        u.hash_contraseña,
        u.esta_activo,
        u.id_rol,
        u.id_suc,
        u.grupo,
        u.estado,
        ur.nombre_rol,
        s.nombre_sucursal
    INTO v_user_record
    FROM public.usuarios u
    LEFT JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol
    LEFT JOIN public.sucursales s ON u.id_suc = s.id_suc
    WHERE (u.correo = p_identificador OR u.nombre_ingreso = p_identificador)
    AND u.esta_activo = true;

    -- Verificar si el usuario existe
    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Usuario no encontrado o inactivo'
        );
    END IF;

    -- Verificar contraseña
    IF v_user_record.hash_contraseña IS NOT NULL AND v_user_record.hash_contraseña != '' THEN
        -- Usar crypt para verificar contraseña hasheada
        v_password_valid := (v_user_record.hash_contraseña = crypt(p_password, v_user_record.hash_contraseña));
    ELSE
        -- Si no hay hash, comparar directamente (solo para migración)
        v_password_valid := (p_password = 'temporal123'); -- Contraseña temporal por defecto
    END IF;

    IF NOT v_password_valid THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Contraseña incorrecta'
        );
    END IF;

    -- Actualizar último acceso
    UPDATE public.usuarios
    SET ultimo_acceso = NOW()
    WHERE id_usuario = v_user_record.id_usuario;

    -- Retornar información del usuario
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Autenticación exitosa',
        'user', jsonb_build_object(
            'id_usuario', v_user_record.id_usuario,
            'correo', v_user_record.correo,
            'nombre_ingreso', v_user_record.nombre_ingreso,
            'nombre_completo', v_user_record.nombre_completo,
            'esta_activo', v_user_record.esta_activo,
            'id_rol', v_user_record.id_rol,
            'nombre_rol', v_user_record.nombre_rol,
            'id_suc', v_user_record.id_suc,
            'nombre_sucursal', v_user_record.nombre_sucursal,
            'grupo', v_user_record.grupo,
            'estado', v_user_record.estado
        )
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error interno: ' || SQLERRM
    );
END;
$function$;

-- =====================================================
-- VERIFICACIÓN INMEDIATA
-- =====================================================

-- Mostrar resultado de la migración
SELECT
    'Migración completada exitosamente' as estado,
    NOW() as fecha_ejecucion;

-- Verificar nombre_ingreso generado
SELECT
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN nombre_ingreso IS NOT NULL THEN 1 END) as con_nombre_ingreso,
    COUNT(CASE WHEN nombre_ingreso IS NULL THEN 1 END) as sin_nombre_ingreso
FROM usuarios;

-- Mostrar ejemplos
SELECT id_usuario, correo, nombre_completo, nombre_ingreso
FROM usuarios
LIMIT 5;