-- Función para autenticar usuario con correo o nombre_ingreso
-- DROP FUNCTION IF EXISTS public.autenticar_usuario(text, text);
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
$function$