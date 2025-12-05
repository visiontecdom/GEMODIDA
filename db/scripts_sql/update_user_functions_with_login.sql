-- Actualización de funciones para incluir nombre_ingreso
-- DROP FUNCTION IF EXISTS public.obtener_usuarios_completos(integer, integer);
CREATE OR REPLACE FUNCTION public.obtener_usuarios_completos(p_limite integer DEFAULT 50, p_desplazamiento integer DEFAULT 0)
 RETURNS TABLE(id_usuario uuid, correo character varying, nombre_ingreso character varying, nombre_completo character varying, telefono character varying, esta_activo boolean, id_rol integer, nombre_rol character varying, id_suc integer, nombre_sucursal text, creado_en timestamp with time zone, ultimo_acceso timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        u.id_usuario,
        u.correo,
        u.nombre_ingreso,
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
$function$

-- Actualizar actualizar_usuario para incluir nombre_ingreso
-- DROP FUNCTION IF EXISTS public.actualizar_usuario(uuid, character varying, character varying, character varying, integer, integer, boolean);
CREATE OR REPLACE FUNCTION public.actualizar_usuario(p_id_usuario uuid, p_correo character varying, p_nombre_ingreso character varying, p_nombre_completo character varying, p_telefono character varying, p_id_rol integer, p_id_suc integer, p_esta_activo boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Validar que el usuario existe
    IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id_usuario = p_id_usuario) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuario no encontrado');
    END IF;

    -- Validar unicidad de correo (excluyendo el usuario actual)
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE correo = p_correo AND id_usuario != p_id_usuario) THEN
        RETURN jsonb_build_object('success', false, 'message', 'El correo electrónico ya está en uso');
    END IF;

    -- Validar unicidad de nombre_ingreso (excluyendo el usuario actual)
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE nombre_ingreso = p_nombre_ingreso AND id_usuario != p_id_usuario) THEN
        RETURN jsonb_build_object('success', false, 'message', 'El nombre de ingreso ya está en uso');
    END IF;

    -- Actualizar usuario
    UPDATE public.usuarios
    SET
        correo = p_correo,
        nombre_ingreso = p_nombre_ingreso,
        nombre_completo = p_nombre_completo,
        telefono = p_telefono,
        id_rol = p_id_rol,
        id_suc = p_id_suc,
        esta_activo = p_esta_activo,
        actualizado_en = NOW()
    WHERE id_usuario = p_id_usuario;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Usuario actualizado exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error al actualizar usuario: ' || SQLERRM
    );
END;
$function$

-- Actualizar crear_usuario_completo para incluir nombre_ingreso
-- DROP FUNCTION IF EXISTS public.crear_usuario_completo(character varying, character varying, character varying, character varying, integer, integer, integer, uuid);
CREATE OR REPLACE FUNCTION public.crear_usuario_completo(p_correo character varying, p_nombre_ingreso character varying, p_nombre_completo character varying, p_telefono character varying, p_id_grupo integer, p_id_rol integer, p_id_sucursal integer, p_creado_por uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_user_id UUID;
    v_resultado JSON;
BEGIN
    -- Verificar permisos del usuario creador
    IF NOT EXISTS (
        SELECT 1 FROM public.usuarios u
        JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
        JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
        WHERE u.id_usuario = p_creado_por
        AND ur.puede_crear_usuarios = true
        AND au.esta_activa = true
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No tiene permisos para crear usuarios'
        );
    END IF;

    -- Verificar que el correo no exista
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE correo = p_correo) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'El correo electrónico ya está registrado'
        );
    END IF;

    -- Verificar que el nombre_ingreso no exista
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE nombre_ingreso = p_nombre_ingreso) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'El nombre de ingreso ya está en uso'
        );
    END IF;

    -- Generar UUID para el nuevo usuario
    v_user_id := gen_random_uuid();

    -- Insertar usuario
    INSERT INTO public.usuarios (
        id_usuario,
        correo,
        nombre_ingreso,
        nombre_completo,
        telefono,
        hash_contraseña,
        esta_activo,
        creado_en
    ) VALUES (
        v_user_id,
        p_correo,
        p_nombre_ingreso,
        p_nombre_completo,
        p_telefono,
        crypt('temporal123', gen_salt('bf')), -- Contraseña temporal
        true,
        NOW()
    );

    -- Crear asignación principal
    INSERT INTO public.asignaciones_usuario (
        id_usuario,
        id_grupo,
        id_rol,
        id_sucursal,
        es_principal,
        creado_por
    ) VALUES (
        v_user_id,
        p_id_grupo,
        p_id_rol,
        p_id_sucursal,
        true,
        p_creado_por
    );

    -- Log de la operación
    PERFORM public.log_proceso(
        'crear_usuario',
        'completado',
        'Usuario creado: ' || p_correo,
        'ID: ' || v_user_id::text,
        p_creado_por,
        json_build_object('nuevo_usuario_id', v_user_id),
        NULL
    );

    RETURN json_build_object(
        'success', true,
        'user_id', v_user_id,
        'message', 'Usuario creado exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Error interno: ' || SQLERRM
    );
END;
$function$