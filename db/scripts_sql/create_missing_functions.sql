-- =====================================================
-- SCRIPT COMPLETO: Todas las funciones faltantes
-- Fecha: 2025-11-24
-- Descripción: Crea todas las funciones necesarias para el sistema
-- =====================================================

-- Función de autenticación (ya incluida en complete_migration.sql)
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

-- Función para obtener permisos del usuario
CREATE OR REPLACE FUNCTION public.obtener_permisos_usuario(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_resultado JSON;
BEGIN
    SELECT json_build_object(
        'usuario', json_build_object(
            'id', u.id_usuario,
            'nombre_completo', u.nombre_completo,
            'correo', u.correo,
            'esta_activo', u.esta_activo
        ),
        'asignaciones', COALESCE(
            json_agg(
                json_build_object(
                    'grupo', json_build_object(
                        'codigo', ug.codigo_grupo,
                        'nombre', ug.nombre_grupo
                    ),
                    'rol', json_build_object(
                        'codigo', ur.codigo_rol,
                        'nombre', ur.nombre_rol,
                        'nivel_acceso', ur.nivel_acceso,
                        'permisos', ur.permisos_json
                    ),
                    'sucursal', json_build_object(
                        'id', s.id_suc,
                        'nombre', s.nombre_sucursal,
                        'provincia', s.provincia
                    ),
                    'es_principal', au.es_principal,
                    'esta_activa', au.esta_activa
                )
            ) FILTER (WHERE au.esta_activa = true), '[]'::json
        )
    ) INTO v_resultado
    FROM public.usuarios u
    LEFT JOIN public.usuarios_asignaciones au ON u.id_usuario = au.id_usuario
    LEFT JOIN public.usuarios_grupos ug ON au.id_grupo = ug.id_grupo
    LEFT JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
    LEFT JOIN public.sucursales s ON au.id_sucursal = s.id_suc
    WHERE u.id_usuario = p_user_id
    GROUP BY u.id_usuario, u.nombre_completo, u.correo, u.esta_activo;

    RETURN COALESCE(v_resultado, json_build_object('error', 'Usuario no encontrado'));
END;
$function$;

-- Función para obtener usuarios completos
CREATE OR REPLACE FUNCTION public.obtener_usuarios_completos(p_limite integer DEFAULT 50, p_desplazamiento integer DEFAULT 0)
 RETURNS TABLE(id_usuario uuid, correo character varying, nombre_completo character varying, telefono character varying, esta_activo boolean, id_rol integer, nombre_rol character varying, id_suc integer, nombre_sucursal text, creado_en timestamp with time zone, ultimo_acceso timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
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
$function$;

-- Función para crear usuario completo
CREATE OR REPLACE FUNCTION public.crear_usuario_completo(p_correo character varying, p_nombre_ingreso character varying, p_nombre_completo character varying, p_telefono character varying, p_password text, p_id_rol integer, p_id_suc integer, p_esta_activo boolean DEFAULT true)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_user_id UUID;
BEGIN
    -- Validar que el correo no exista
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE correo = p_correo) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'El correo electrónico ya está registrado'
        );
    END IF;

    -- Validar que el nombre_ingreso no exista
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE nombre_ingreso = p_nombre_ingreso) THEN
        RETURN jsonb_build_object(
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
        id_rol,
        id_suc,
        creado_en
    ) VALUES (
        v_user_id,
        p_correo,
        p_nombre_ingreso,
        p_nombre_completo,
        p_telefono,
        crypt(p_password, gen_salt('bf')),
        p_esta_activo,
        p_id_rol,
        p_id_suc,
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'message', 'Usuario creado exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Error interno: ' || SQLERRM
    );
END;
$function$;

-- Función para actualizar usuario
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
        RETURN jsonb_build_object('success', false, 'message', 'El correo electrónico ya está registrado');
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
$function$;

-- Función para registrar usuario desde signup
CREATE OR REPLACE FUNCTION public.registrar_usuario_signup(p_id_usuario uuid, p_correo character varying, p_nombre_completo character varying, p_telefono character varying)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_default_rol_id INTEGER;
    v_default_suc_id INTEGER;
BEGIN
    -- Obtener rol por defecto (primer rol activo)
    SELECT id_rol INTO v_default_rol_id
    FROM public.usuarios_roles
    WHERE esta_activo = true
    ORDER BY nivel_acceso ASC
    LIMIT 1;

    -- Obtener sucursal por defecto
    v_default_suc_id := 1;

    -- Generar nombre_ingreso basado en nombre_completo
    INSERT INTO public.usuarios (
        id_usuario,
        correo,
        nombre_ingreso,
        nombre_completo,
        telefono,
        hash_contraseña,
        esta_activo,
        id_rol,
        id_suc,
        grupo,
        estado,
        creado_en
    ) VALUES (
        p_id_usuario,
        p_correo,
        LOWER(
            LEFT(SPLIT_PART(TRIM(p_nombre_completo), ' ', 1), 1) ||
            CASE
                WHEN ARRAY_LENGTH(STRING_TO_ARRAY(TRIM(p_nombre_completo), ' '), 1) >= 2
                THEN SPLIT_PART(TRIM(p_nombre_completo), ' ', 2)
                ELSE ''
            END
        ),
        p_nombre_completo,
        p_telefono,
        crypt('temporal123', gen_salt('bf')), -- Contraseña temporal
        true,
        COALESCE(v_default_rol_id, 1),
        v_default_suc_id,
        'General',
        'Activo',
        NOW()
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Usuario registrado exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error al registrar usuario: ' || SQLERRM
    );
END;
$function$;

-- Función para obtener roles
CREATE OR REPLACE FUNCTION public.obtener_roles_todos()
 RETURNS TABLE(id_rol integer, codigo_rol character varying, nombre_rol character varying, descripcion text, nivel_acceso integer, permisos_json jsonb, puede_crear_usuarios boolean, puede_ver_todas_sucursales boolean, esta_activo boolean, creado_en timestamp with time zone, total_usuarios bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        ur.id_rol,
        ur.codigo_rol,
        ur.nombre_rol,
        ur.descripcion,
        ur.nivel_acceso,
        ur.permisos_json,
        ur.puede_crear_usuarios,
        ur.puede_ver_todas_sucursales,
        ur.esta_activo,
        ur.creado_en,
        COUNT(u.id_usuario)::bigint AS total_usuarios
    FROM public.usuarios_roles ur
    LEFT JOIN public.usuarios u ON ur.id_rol = u.id_rol
    GROUP BY ur.id_rol, ur.codigo_rol, ur.nombre_rol, ur.descripcion,
             ur.nivel_acceso, ur.permisos_json, ur.puede_crear_usuarios,
             ur.puede_ver_todas_sucursales, ur.esta_activo, ur.creado_en
    ORDER BY ur.nivel_acceso ASC;
END;
$function$;

-- Función para verificar permisos de usuario
CREATE OR REPLACE FUNCTION public.usuario_tiene_permiso(p_usuario_id uuid, p_permiso text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.usuarios u
        JOIN public.usuarios_asignaciones au ON u.id_usuario = au.id_usuario
        JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
        WHERE u.id_usuario = p_usuario_id
        AND au.esta_activa = true
        AND (
            ur.permisos_json ? p_permiso
            OR ur.codigo_rol IN ('admin', 'super_user')
        )
    );
END;
$function$;

-- Función para log de procesos
CREATE OR REPLACE FUNCTION public.log_proceso(p_tipo_proceso character varying, p_estado character varying, p_mensaje text, p_detalles text DEFAULT NULL::text, p_id_usuario uuid DEFAULT NULL::uuid, p_metadatos jsonb DEFAULT '{}'::jsonb, p_ip_origen inet DEFAULT NULL::inet)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_log_id BIGINT;
BEGIN
    INSERT INTO logs_procesos (
        tipo_proceso,
        estado,
        mensaje,
        detalles,
        id_usuario,
        metadatos,
        fecha_inicio,
        ip_origen
    ) VALUES (
        p_tipo_proceso,
        p_estado,
        p_mensaje,
        p_detalles,
        p_id_usuario,
        p_metadatos,
        NOW(),
        p_ip_origen
    ) RETURNING id_log INTO v_log_id;

    RETURN v_log_id;
END;
$function$;

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION public.actualizar_columna_actualizado_en()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.actualizado_en := NOW();
    RETURN NEW;
END;
$function$;

-- =====================================================
-- VERIFICACIÓN DE FUNCIONES CREADAS
-- =====================================================

SELECT
    'Funciones creadas exitosamente' as estado,
    NOW() as fecha_creacion;

-- Verificar que las funciones principales existen
SELECT
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name = 'autenticar_usuario' AND routine_type = 'FUNCTION'
    ) THEN '✅ autenticar_usuario existe' ELSE '❌ autenticar_usuario NO existe' END as autenticar_usuario,

    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name = 'obtener_permisos_usuario' AND routine_type = 'FUNCTION'
    ) THEN '✅ obtener_permisos_usuario existe' ELSE '❌ obtener_permisos_usuario NO existe' END as obtener_permisos,

    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name = 'obtener_usuarios_completos' AND routine_type = 'FUNCTION'
    ) THEN '✅ obtener_usuarios_completos existe' ELSE '❌ obtener_usuarios_completos NO existe' END as obtener_usuarios,

    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name = 'crear_usuario_completo' AND routine_type = 'FUNCTION'
    ) THEN '✅ crear_usuario_completo existe' ELSE '❌ crear_usuario_completo NO existe' END as crear_usuario,

    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name = 'actualizar_usuario' AND routine_type = 'FUNCTION'
    ) THEN '✅ actualizar_usuario existe' ELSE '❌ actualizar_usuario NO existe' END as actualizar_usuario;