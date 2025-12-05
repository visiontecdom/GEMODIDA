-- Script para implementar funcionalidad de reset de contraseña
-- Fecha: 24/11/2025
-- Descripción: Agrega tabla para tokens de reset, funciones RPC y notificaciones

-- Crear tabla para tokens de reset de contraseña
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
    token VARCHAR(6) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '15 minutes'),
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON public.password_reset_tokens(expires_at);

-- Función para solicitar reset de contraseña
CREATE OR REPLACE FUNCTION public.solicitar_reset_password(p_correo VARCHAR)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_record RECORD;
    v_token VARCHAR(6);
    v_admin_users UUID[];
    v_admin_user RECORD;
BEGIN
    -- Buscar usuario por correo
    SELECT id_usuario, nombre_completo, correo
    INTO v_user_record
    FROM public.usuarios
    WHERE correo = p_correo AND esta_activo = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Usuario no encontrado o inactivo'
        );
    END IF;

    -- Generar token de 6 dígitos
    v_token := LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');

    -- Insertar token en la tabla
    INSERT INTO public.password_reset_tokens (user_id, token)
    VALUES (v_user_record.id_usuario, v_token);

    -- Obtener lista de administradores (roles admin y gerente)
    SELECT array_agg(u.id_usuario)
    INTO v_admin_users
    FROM public.usuarios u
    JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol
    WHERE ur.codigo_rol IN ('admin', 'gerente') AND u.esta_activo = true;

    -- Crear notificaciones para administradores
    IF v_admin_users IS NOT NULL THEN
        FOR i IN 1..array_length(v_admin_users, 1) LOOP
            INSERT INTO public.notificaciones_sistema (
                titulo,
                mensaje,
                tipo,
                id_usuario_destinatario,
                metadatos
            ) VALUES (
                'Solicitud de Reset de Contraseña',
                format('El usuario %s (%s) ha solicitado un reset de contraseña',
                       v_user_record.nombre_completo, v_user_record.correo),
                'seguridad',
                v_admin_users[i],
                jsonb_build_object(
                    'tipo_evento', 'password_reset_request',
                    'usuario_afectado', v_user_record.id_usuario,
                    'correo_usuario', v_user_record.correo
                )
            );
        END LOOP;
    END IF;

    -- Log de la operación
    PERFORM public.log_proceso(
        'solicitar_reset_password',
        'completado',
        format('Solicitud de reset de contraseña para usuario: %s', p_correo),
        format('Token generado: %s, Notificaciones enviadas a %s administradores',
               v_token, COALESCE(array_length(v_admin_users, 1), 0)),
        v_user_record.id_usuario,
        jsonb_build_object('token_id', currval('password_reset_tokens_id_seq')),
        NULL
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Token de reset generado exitosamente',
        'token', v_token,
        'user_email', v_user_record.correo,
        'user_name', v_user_record.nombre_completo
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error interno: ' || SQLERRM
    );
END;
$$;

-- Función para verificar y usar token de reset
CREATE OR REPLACE FUNCTION public.verificar_reset_token(p_token VARCHAR, p_nueva_password TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_token_record RECORD;
    v_user_record RECORD;
    v_salt TEXT;
BEGIN
    -- Buscar token válido
    SELECT prt.*, u.correo, u.nombre_completo
    INTO v_token_record
    FROM public.password_reset_tokens prt
    JOIN public.usuarios u ON prt.user_id = u.id_usuario
    WHERE prt.token = p_token
    AND prt.used = FALSE
    AND prt.expires_at > NOW();

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Token inválido, expirado o ya utilizado'
        );
    END IF;

    -- Generar hash de la nueva contraseña
    v_salt := gen_salt('bf');
    UPDATE public.usuarios
    SET hash_contraseña = crypt(p_nueva_password, v_salt),
        actualizado_en = NOW()
    WHERE id_usuario = v_token_record.user_id;

    -- Actualizar auth.users en Supabase
    UPDATE auth.users
    SET encrypted_password = crypt(p_nueva_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = v_token_record.user_id;

    -- Marcar token como usado
    UPDATE public.password_reset_tokens
    SET used = TRUE, used_at = NOW()
    WHERE id = v_token_record.id;

    -- Log de la operación
    PERFORM public.log_proceso(
        'verificar_reset_token',
        'completado',
        format('Contraseña actualizada para usuario: %s', v_token_record.correo),
        'Token utilizado exitosamente',
        v_token_record.user_id,
        jsonb_build_object('token_id', v_token_record.id),
        NULL
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Contraseña actualizada exitosamente',
        'user_email', v_token_record.correo
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error interno: ' || SQLERRM
    );
END;
$$;

-- Función para limpiar tokens expirados (puede ser llamada por un job programado)
CREATE OR REPLACE FUNCTION public.limpiar_tokens_expirados()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_deleted_count INTEGER;
BEGIN
    DELETE FROM public.password_reset_tokens
    WHERE expires_at < NOW() OR (used = TRUE AND used_at < NOW() - INTERVAL '24 hours');

    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

    -- Log de limpieza
    IF v_deleted_count > 0 THEN
        PERFORM public.log_proceso(
            'limpiar_tokens_expirados',
            'completado',
            format('Tokens expirados eliminados: %s', v_deleted_count),
            'Limpieza automática de tokens',
            NULL,
            jsonb_build_object('tokens_eliminados', v_deleted_count),
            NULL
        );
    END IF;

    RETURN v_deleted_count;
END;
$$;

-- Políticas RLS para la tabla de tokens
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Política para que solo el service role pueda gestionar tokens
CREATE POLICY password_reset_tokens_service_role ON public.password_reset_tokens
AS PERMISSIVE
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);