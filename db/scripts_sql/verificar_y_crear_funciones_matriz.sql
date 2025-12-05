-- Script para verificar y crear las funciones RPC necesarias para Matriz de Soporte
-- Ejecutar este script si hay errores al cargar usuarios, roles o configuraciones

-- ============================================================================
-- 1. Función: obtener_usuarios_completos
-- ============================================================================
-- Eliminar función existente si hay conflictos
DROP FUNCTION IF EXISTS public.obtener_usuarios_completos(integer, integer) CASCADE;

-- Crear función para obtener usuarios con información completa
CREATE OR REPLACE FUNCTION public.obtener_usuarios_completos(
    p_limite integer DEFAULT 50,
    p_desplazamiento integer DEFAULT 0
)
RETURNS TABLE(
    id_usuario uuid,
    correo character varying,
    nombre_completo character varying,
    telefono character varying,
    esta_activo boolean,
    id_rol integer,
    nombre_rol character varying,
    id_suc integer,
    nombre_sucursal text,
    creado_en timestamp with time zone,
    ultimo_acceso timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id_usuario,
        u.correo,
        u.nombre_completo,
        u.telefono,
        u.esta_activo,
        u.id_rol,
        ur.nombre_rol,
        u.id_suc,
        s.nombre_sucursal,
        u.creado_en,
        u.ultimo_acceso
    FROM public.usuarios u
    LEFT JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol
    LEFT JOIN public.sucursales s ON u.id_suc = s.id_suc
    ORDER BY u.creado_en DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$$;

-- Comentario de la función
COMMENT ON FUNCTION public.obtener_usuarios_completos(integer, integer) IS 
'Obtiene la lista de usuarios con información de roles y sucursales. Usado en Matriz de Soporte.';

-- ============================================================================
-- 2. Función: obtener_roles_todos
-- ============================================================================
DROP FUNCTION IF EXISTS public.obtener_roles_todos() CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_roles_todos()
RETURNS TABLE(
    id_rol integer,
    codigo_rol character varying,
    nombre_rol character varying,
    descripcion text,
    nivel_acceso integer,
    esta_activo boolean,
    total_usuarios bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ur.id_rol,
        ur.codigo_rol,
        ur.nombre_rol,
        ur.descripcion,
        ur.nivel_acceso,
        ur.esta_activo,
        COUNT(u.id_usuario) as total_usuarios
    FROM public.usuarios_roles ur
    LEFT JOIN public.usuarios u ON ur.id_rol = u.id_rol
    GROUP BY ur.id_rol, ur.codigo_rol, ur.nombre_rol, ur.descripcion, ur.nivel_acceso, ur.esta_activo
    ORDER BY ur.nivel_acceso ASC;
END;
$$;

COMMENT ON FUNCTION public.obtener_roles_todos() IS 
'Obtiene todos los roles con el conteo de usuarios asignados. Usado en Matriz de Soporte.';

-- ============================================================================
-- 3. Función: obtener_configuraciones_sistema
-- ============================================================================
DROP FUNCTION IF EXISTS public.obtener_configuraciones_sistema() CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_configuraciones_sistema()
RETURNS TABLE(
    clave character varying,
    valor character varying,
    tipo character varying,
    descripcion text,
    es_sensible boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cs.clave,
        cs.valor,
        cs.tipo,
        cs.descripcion,
        cs.es_sensible
    FROM public.configuraciones_sistema cs
    ORDER BY cs.clave ASC;
END;
$$;

COMMENT ON FUNCTION public.obtener_configuraciones_sistema() IS 
'Obtiene todas las configuraciones del sistema. Usado en Matriz de Soporte.';

-- ============================================================================
-- 4. Función: actualizar_usuario
-- ============================================================================
DROP FUNCTION IF EXISTS public.actualizar_usuario(uuid, character varying, character varying, character varying, integer, integer, boolean) CASCADE;

CREATE OR REPLACE FUNCTION public.actualizar_usuario(
    p_id_usuario uuid,
    p_correo character varying,
    p_nombre_completo character varying,
    p_telefono character varying,
    p_id_rol integer,
    p_id_suc integer,
    p_esta_activo boolean
)
RETURNS TABLE(
    success boolean,
    message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Actualizar usuario
    UPDATE public.usuarios
    SET 
        correo = p_correo,
        nombre_completo = p_nombre_completo,
        telefono = p_telefono,
        id_rol = p_id_rol,
        id_suc = p_id_suc,
        esta_activo = p_esta_activo,
        actualizado_en = NOW()
    WHERE id_usuario = p_id_usuario;
    
    -- Verificar si se actualizó
    IF FOUND THEN
        RETURN QUERY SELECT true, 'Usuario actualizado correctamente'::text;
    ELSE
        RETURN QUERY SELECT false, 'Usuario no encontrado'::text;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.actualizar_usuario(uuid, character varying, character varying, character varying, integer, integer, boolean) IS 
'Actualiza la información de un usuario. Usado en Matriz de Soporte.';

-- ============================================================================
-- Verificación de funciones creadas
-- ============================================================================
DO $$
DECLARE
    v_count integer;
BEGIN
    -- Verificar obtener_usuarios_completos
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'obtener_usuarios_completos';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ Función obtener_usuarios_completos creada correctamente';
    ELSE
        RAISE WARNING '✗ Error al crear función obtener_usuarios_completos';
    END IF;
    
    -- Verificar obtener_roles_todos
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'obtener_roles_todos';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ Función obtener_roles_todos creada correctamente';
    ELSE
        RAISE WARNING '✗ Error al crear función obtener_roles_todos';
    END IF;
    
    -- Verificar obtener_configuraciones_sistema
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'obtener_configuraciones_sistema';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ Función obtener_configuraciones_sistema creada correctamente';
    ELSE
        RAISE WARNING '✗ Error al crear función obtener_configuraciones_sistema';
    END IF;
    
    -- Verificar actualizar_usuario
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'actualizar_usuario';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ Función actualizar_usuario creada correctamente';
    ELSE
        RAISE WARNING '✗ Error al crear función actualizar_usuario';
    END IF;
END $$;

-- ============================================================================
-- Otorgar permisos de ejecución
-- ============================================================================
GRANT EXECUTE ON FUNCTION public.obtener_usuarios_completos(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_roles_todos() TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_configuraciones_sistema() TO authenticated;
GRANT EXECUTE ON FUNCTION public.actualizar_usuario(uuid, character varying, character varying, character varying, integer, integer, boolean) TO authenticated;

RAISE NOTICE '============================================================================';
RAISE NOTICE 'Script completado. Todas las funciones RPC para Matriz de Soporte están listas.';
RAISE NOTICE '============================================================================';
