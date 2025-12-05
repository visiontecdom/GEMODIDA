-- Script para actualizar funciones RPC de usuarios con nuevos campos de contraseña y expiración
-- Ejecutar después de aplicar la migración add_usuario_password_fields.sql

-- ============================================================================
-- 1. Actualizar función: obtener_usuarios_completos
-- ============================================================================
DROP FUNCTION IF EXISTS public.obtener_usuarios_completos(integer, integer) CASCADE;

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
    ultimo_acceso timestamp with time zone,
    debe_cambiar_contrasena boolean,
    fecha_expiracion date
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
        u.ultimo_acceso,
        u.debe_cambiar_contrasena,
        u.fecha_expiracion
    FROM public.usuarios u
    LEFT JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol
    LEFT JOIN public.sucursales s ON u.id_suc = s.id_suc
    ORDER BY u.creado_en DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$$;

COMMENT ON FUNCTION public.obtener_usuarios_completos(integer, integer) IS
'Obtiene la lista de usuarios con información completa incluyendo campos de contraseña y expiración. Usado en Matriz de Soporte.';

-- ============================================================================
-- 2. Actualizar función: actualizar_usuario
-- ============================================================================
DROP FUNCTION IF EXISTS public.actualizar_usuario(uuid, character varying, character varying, character varying, integer, integer, boolean, boolean, date) CASCADE;

CREATE OR REPLACE FUNCTION public.actualizar_usuario(
    p_id_usuario uuid,
    p_correo character varying,
    p_nombre_completo character varying,
    p_telefono character varying,
    p_id_rol integer,
    p_id_suc integer,
    p_esta_activo boolean,
    p_debe_cambiar_contrasena boolean DEFAULT false,
    p_fecha_expiracion date DEFAULT NULL
)
RETURNS TABLE(
    success boolean,
    message text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Actualizar usuario con nuevos campos
    UPDATE public.usuarios
    SET
        correo = p_correo,
        nombre_completo = p_nombre_completo,
        telefono = p_telefono,
        id_rol = p_id_rol,
        id_suc = p_id_suc,
        esta_activo = p_esta_activo,
        debe_cambiar_contrasena = p_debe_cambiar_contrasena,
        fecha_expiracion = p_fecha_expiracion,
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

COMMENT ON FUNCTION public.actualizar_usuario(uuid, character varying, character varying, character varying, integer, integer, boolean, boolean, date) IS
'Actualiza la información de un usuario incluyendo campos de contraseña y expiración. Usado en Matriz de Soporte.';

-- ============================================================================
-- 3. Nueva función: insertar_usuario_completo
-- ============================================================================
DROP FUNCTION IF EXISTS public.insertar_usuario_completo(character varying, character varying, character varying, integer, integer, boolean, boolean, date) CASCADE;

CREATE OR REPLACE FUNCTION public.insertar_usuario_completo(
    p_correo character varying,
    p_nombre_completo character varying,
    p_telefono character varying,
    p_id_rol integer,
    p_id_suc integer,
    p_esta_activo boolean DEFAULT true,
    p_debe_cambiar_contrasena boolean DEFAULT false,
    p_fecha_expiracion date DEFAULT NULL
)
RETURNS TABLE(
    success boolean,
    message text,
    id_usuario uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id_usuario uuid;
BEGIN
    -- Insertar nuevo usuario con todos los campos
    INSERT INTO public.usuarios (
        correo,
        nombre_completo,
        telefono,
        id_rol,
        id_suc,
        esta_activo,
        debe_cambiar_contrasena,
        fecha_expiracion,
        creado_en
    ) VALUES (
        p_correo,
        p_nombre_completo,
        p_telefono,
        p_id_rol,
        p_id_suc,
        p_esta_activo,
        p_debe_cambiar_contrasena,
        p_fecha_expiracion,
        NOW()
    ) RETURNING id_usuario INTO v_id_usuario;

    -- Verificar si se insertó
    IF v_id_usuario IS NOT NULL THEN
        RETURN QUERY SELECT true, 'Usuario creado correctamente'::text, v_id_usuario;
    ELSE
        RETURN QUERY SELECT false, 'Error al crear usuario'::text, NULL::uuid;
    END IF;
END;
$$;

COMMENT ON FUNCTION public.insertar_usuario_completo(character varying, character varying, character varying, integer, integer, boolean, boolean, date) IS
'Crea un nuevo usuario con todos los campos incluyendo contraseña y expiración. Usado en Matriz de Soporte.';

-- ============================================================================
-- Verificación de funciones actualizadas
-- ============================================================================
DO $$
DECLARE
    v_count integer;
BEGIN
    RAISE NOTICE 'Verificando funciones actualizadas...';

    -- Verificar obtener_usuarios_completos
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'obtener_usuarios_completos';

    IF v_count > 0 THEN
        RAISE NOTICE '✓ Función obtener_usuarios_completos actualizada correctamente';
    ELSE
        RAISE WARNING '✗ Error al actualizar función obtener_usuarios_completos';
    END IF;

    -- Verificar actualizar_usuario
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'actualizar_usuario';

    IF v_count > 0 THEN
        RAISE NOTICE '✓ Función actualizar_usuario actualizada correctamente';
    ELSE
        RAISE WARNING '✗ Error al actualizar función actualizar_usuario';
    END IF;

    -- Verificar insertar_usuario_completo
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'insertar_usuario_completo';

    IF v_count > 0 THEN
        RAISE NOTICE '✓ Función insertar_usuario_completo creada correctamente';
    ELSE
        RAISE WARNING '✗ Error al crear función insertar_usuario_completo';
    END IF;

    RAISE NOTICE 'Actualización de funciones completada.';
END;
$$;