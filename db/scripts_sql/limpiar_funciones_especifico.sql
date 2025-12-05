-- ============================================================================
-- GEMODIDA - Limpiar Funciones Específicas
-- ============================================================================

-- Eliminar triggers primero
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS sync_auth_to_usuarios ON auth.users;

-- Eliminar funciones con firmas específicas
DO $$
BEGIN
    -- Eliminar todas las variantes de crear_usuario_completo
    DROP FUNCTION IF EXISTS crear_usuario_completo(text, text, text, text, text, text, integer) CASCADE;
    DROP FUNCTION IF EXISTS crear_usuario_completo_v2(text, text, text, text, text, text, integer) CASCADE;
    DROP FUNCTION IF EXISTS crear_usuario_aplicacion(text, text, text, text, text, integer) CASCADE;
    DROP FUNCTION IF EXISTS crear_usuario_aplicacion_v2(text, text, text, text, text, integer) CASCADE;
    DROP FUNCTION IF EXISTS crear_usuario_auth(text, text, jsonb) CASCADE;
    DROP FUNCTION IF EXISTS sync_auth_users_to_public() CASCADE;
    DROP FUNCTION IF EXISTS sincronizar_usuarios_existentes() CASCADE;
    DROP FUNCTION IF EXISTS handle_new_auth_user() CASCADE;
    DROP FUNCTION IF EXISTS sync_new_auth_user() CASCADE;
    DROP FUNCTION IF EXISTS validar_login_usuario(text, text) CASCADE;
    
    RAISE NOTICE 'Funciones obsoletas eliminadas correctamente';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Algunas funciones no existían o ya fueron eliminadas: %', SQLERRM;
END $$;

-- Función principal para crear usuarios
CREATE OR REPLACE FUNCTION crear_nuevo_usuario_sistema(
    p_email TEXT,
    p_password TEXT,
    p_nombre_completo TEXT,
    p_codigo_rol TEXT,
    p_codigo_grupo TEXT,
    p_id_sucursal INTEGER
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_rol_id INTEGER;
    v_grupo_id INTEGER;
    v_max_attempts INTEGER := 10;
    v_attempt INTEGER := 0;
BEGIN
    -- Validaciones iniciales
    IF p_email IS NULL OR p_email = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Email es requerido');
    END IF;
    
    IF p_password IS NULL OR length(p_password) < 6 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Contraseña debe tener al menos 6 caracteres');
    END IF;
    
    IF p_nombre_completo IS NULL OR p_nombre_completo = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Nombre completo es requerido');
    END IF;

    IF p_codigo_rol IS NULL OR p_codigo_rol = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Código de rol es requerido');
    END IF;

    IF p_codigo_grupo IS NULL OR p_codigo_grupo = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Código de grupo es requerido');
    END IF;
    
    -- Validar que no existe el usuario
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RETURN jsonb_build_object('success', false, 'message', 'El email ya está registrado');
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE correo = p_email) THEN
        RETURN jsonb_build_object('success', false, 'message', 'El usuario ya existe en el sistema');
    END IF;
    
    -- Obtener y validar IDs de rol y grupo
    SELECT id_rol INTO v_rol_id FROM public.usuarios_roles WHERE codigo_rol = p_codigo_rol AND esta_activo = true;
    SELECT id_grupo INTO v_grupo_id FROM public.usuarios_grupos WHERE codigo_grupo = p_codigo_grupo AND esta_activo = true;
    
    IF v_rol_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Rol no válido: ' || p_codigo_rol);
    END IF;
    
    IF v_grupo_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Grupo no válido: ' || p_codigo_grupo);
    END IF;
    
    -- Validar sucursal
    IF NOT EXISTS (SELECT 1 FROM public.sucursales WHERE id_suc = p_id_sucursal AND estado = 'Activo') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Sucursal no válida');
    END IF;
    
    -- Generar UUID único
    WHILE v_attempt < v_max_attempts LOOP
        v_user_id := gen_random_uuid();
        v_attempt := v_attempt + 1;
        
        IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id_usuario = v_user_id)
           AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
            EXIT;
        END IF;
        
        IF v_attempt >= v_max_attempts THEN
            RETURN jsonb_build_object('success', false, 'message', 'No se pudo generar ID único');
        END IF;
    END LOOP;
    
    -- Crear usuario en public.usuarios
    INSERT INTO public.usuarios (
        id_usuario, correo, hash_contraseña, id_rol, nombre_completo,
        esta_activo, creado_en, actualizado_en, id_suc
    ) VALUES (
        v_user_id, p_email, crypt(p_password, gen_salt('bf')),
        v_rol_id, p_nombre_completo, true, now(), now(), p_id_sucursal
    );
    
    -- Crear asignación
    INSERT INTO public.asignaciones_usuario (
        id_usuario, id_grupo, id_rol, id_sucursal, es_principal, esta_activa, creado_en
    ) VALUES (
        v_user_id, v_grupo_id, v_rol_id, p_id_sucursal, true, true, now()
    );
    
    -- Crear en auth.users
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, is_super_admin, role
    ) VALUES (
        v_user_id, '00000000-0000-0000-0000-000000000000', p_email,
        crypt(p_password, gen_salt('bf')), now(), now(), now(),
        jsonb_build_object('full_name', p_nombre_completo, 'role', p_codigo_rol),
        false, 'authenticated'
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Usuario creado exitosamente',
        'user_id', v_user_id,
        'email', p_email
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Limpiar en caso de error
    BEGIN
        DELETE FROM auth.users WHERE id = v_user_id;
        DELETE FROM public.asignaciones_usuario WHERE id_usuario = v_user_id;
        DELETE FROM public.usuarios WHERE id_usuario = v_user_id;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;
    
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error: ' || SQLERRM
    );
END;
$$;

-- Prueba
SELECT crear_nuevo_usuario_sistema(
    'test.final@ejemplo.com',
    'test123456',
    'Usuario Final',
    'operador',
    'general',
    1
) as resultado;

-- Limpiar prueba
DELETE FROM public.asignaciones_usuario WHERE id_usuario IN (
    SELECT id_usuario FROM public.usuarios WHERE correo = 'test.final@ejemplo.com'
);
DELETE FROM public.usuarios WHERE correo = 'test.final@ejemplo.com';
DELETE FROM auth.users WHERE email = 'test.final@ejemplo.com';

-- Log
INSERT INTO public.ddl_migrations_log (mensaje) VALUES 
('Sistema de usuarios limpio - Función única: crear_nuevo_usuario_sistema');
