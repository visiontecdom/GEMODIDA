-- ============================================================================
-- GEMODIDA - Limpiar y Reorganizar Funciones de Usuarios
-- ============================================================================

-- Eliminar triggers obsoletos PRIMERO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS sync_auth_to_usuarios ON auth.users;

-- Eliminar todas las funciones obsoletas de usuarios (con CASCADE si es necesario)
DROP FUNCTION IF EXISTS crear_usuario_completo CASCADE;
DROP FUNCTION IF EXISTS crear_usuario_completo_v2 CASCADE;
DROP FUNCTION IF EXISTS crear_usuario_aplicacion CASCADE;
DROP FUNCTION IF EXISTS crear_usuario_aplicacion_v2 CASCADE;
DROP FUNCTION IF EXISTS crear_usuario_auth CASCADE;
DROP FUNCTION IF EXISTS sync_auth_users_to_public CASCADE;
DROP FUNCTION IF EXISTS sincronizar_usuarios_existentes CASCADE;
DROP FUNCTION IF EXISTS handle_new_auth_user CASCADE;
DROP FUNCTION IF EXISTS sync_new_auth_user CASCADE;
DROP FUNCTION IF EXISTS validar_login_usuario CASCADE;

-- Función principal para crear usuarios (nombre claro y descriptivo)
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
    
    -- Validar que no existe el usuario
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RETURN jsonb_build_object('success', false, 'message', 'El email ya está registrado en el sistema de autenticación');
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE correo = p_email) THEN
        RETURN jsonb_build_object('success', false, 'message', 'El usuario ya existe en el sistema');
    END IF;
    
    -- Obtener y validar IDs de rol y grupo
    SELECT id_rol INTO v_rol_id FROM public.usuarios_roles WHERE codigo_rol = p_codigo_rol AND esta_activo = true;
    SELECT id_grupo INTO v_grupo_id FROM public.usuarios_grupos WHERE codigo_grupo = p_codigo_grupo AND esta_activo = true;
    
    IF v_rol_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Rol no válido o inactivo: ' || p_codigo_rol);
    END IF;
    
    IF v_grupo_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Grupo no válido o inactivo: ' || p_codigo_grupo);
    END IF;
    
    -- Validar que la sucursal existe
    IF NOT EXISTS (SELECT 1 FROM public.sucursales WHERE id_suc = p_id_sucursal AND estado = 'activa') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Sucursal no válida o inactiva');
    END IF;
    
    -- Generar UUID único con límite de intentos
    WHILE v_attempt < v_max_attempts LOOP
        v_user_id := gen_random_uuid();
        v_attempt := v_attempt + 1;
        
        -- Verificar que no existe en ninguna tabla
        IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id_usuario = v_user_id)
           AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
            EXIT;
        END IF;
        
        IF v_attempt >= v_max_attempts THEN
            RETURN jsonb_build_object('success', false, 'message', 'No se pudo generar identificador único después de ' || v_max_attempts || ' intentos');
        END IF;
    END LOOP;
    
    -- 1. Crear usuario en public.usuarios PRIMERO
    INSERT INTO public.usuarios (
        id_usuario, correo, hash_contraseña, id_rol, nombre_completo,
        esta_activo, creado_en, actualizado_en, id_suc
    ) VALUES (
        v_user_id, p_email, crypt(p_password, gen_salt('bf')),
        v_rol_id, p_nombre_completo, true, now(), now(), p_id_sucursal
    );
    
    -- 2. Crear asignación de usuario
    INSERT INTO public.asignaciones_usuario (
        id_usuario, id_grupo, id_rol, id_sucursal, es_principal, esta_activa, creado_en
    ) VALUES (
        v_user_id, v_grupo_id, v_rol_id, p_id_sucursal, true, true, now()
    );
    
    -- 3. Crear usuario en auth.users para autenticación
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, is_super_admin, role
    ) VALUES (
        v_user_id, '00000000-0000-0000-0000-000000000000', p_email,
        crypt(p_password, gen_salt('bf')), now(), now(), now(),
        jsonb_build_object(
            'full_name', p_nombre_completo, 
            'role', p_codigo_rol,
            'group', p_codigo_grupo,
            'sucursal_id', p_id_sucursal
        ),
        false, 'authenticated'
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Usuario creado exitosamente en ambos sistemas',
        'user_id', v_user_id,
        'email', p_email,
        'nombre', p_nombre_completo
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Limpiar en caso de error (orden inverso de creación)
    BEGIN
        DELETE FROM auth.users WHERE id = v_user_id;
        DELETE FROM public.asignaciones_usuario WHERE id_usuario = v_user_id;
        DELETE FROM public.usuarios WHERE id_usuario = v_user_id;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignorar errores de limpieza
    END;
    
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error creando usuario: ' || SQLERRM,
        'error_detail', SQLSTATE
    );
END;
$$;

-- Función auxiliar para validar login (opcional)
CREATE OR REPLACE FUNCTION validar_credenciales_usuario(
    p_email TEXT,
    p_password TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_record RECORD;
    v_password_valid BOOLEAN := false;
BEGIN
    -- Buscar usuario activo
    SELECT 
        u.id_usuario,
        u.correo,
        u.nombre_completo,
        u.hash_contraseña,
        u.esta_activo,
        ur.codigo_rol,
        ur.nombre_rol,
        ug.codigo_grupo,
        ug.nombre_grupo,
        s.nombre_sucursal
    INTO v_user_record
    FROM public.usuarios u
    JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol
    JOIN public.asignaciones_usuario au ON au.id_usuario = u.id_usuario AND au.esta_activa = true
    JOIN public.usuarios_grupos ug ON ug.id_grupo = au.id_grupo
    JOIN public.sucursales s ON s.id_suc = u.id_suc
    WHERE u.correo = p_email AND u.esta_activo = true;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuario no encontrado o inactivo');
    END IF;
    
    -- Validar contraseña
    SELECT (v_user_record.hash_contraseña = crypt(p_password, v_user_record.hash_contraseña)) INTO v_password_valid;
    
    IF NOT v_password_valid THEN
        RETURN jsonb_build_object('success', false, 'message', 'Credenciales incorrectas');
    END IF;
    
    -- Actualizar último acceso
    UPDATE public.usuarios SET ultimo_acceso = now() WHERE correo = p_email;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Credenciales válidas',
        'user', jsonb_build_object(
            'id', v_user_record.id_usuario,
            'email', v_user_record.correo,
            'nombre', v_user_record.nombre_completo,
            'rol_codigo', v_user_record.codigo_rol,
            'rol_nombre', v_user_record.nombre_rol,
            'grupo_codigo', v_user_record.codigo_grupo,
            'grupo_nombre', v_user_record.nombre_grupo,
            'sucursal', v_user_record.nombre_sucursal
        )
    );
END;
$$;

-- Prueba de la función principal
SELECT crear_nuevo_usuario_sistema(
    'test.limpieza@ejemplo.com',
    'test123456',
    'Usuario de Prueba Limpieza',
    'operador',
    'general',
    1
) as resultado_prueba;

-- Verificar creación
SELECT 'Verificación de creación:' as info;
SELECT 'auth.users' as tabla, email, created_at FROM auth.users WHERE email = 'test.limpieza@ejemplo.com'
UNION ALL
SELECT 'public.usuarios' as tabla, correo, creado_en FROM public.usuarios WHERE correo = 'test.limpieza@ejemplo.com';

-- Limpiar usuario de prueba
DELETE FROM public.asignaciones_usuario WHERE id_usuario IN (
    SELECT id_usuario FROM public.usuarios WHERE correo = 'test.limpieza@ejemplo.com'
);
DELETE FROM public.usuarios WHERE correo = 'test.limpieza@ejemplo.com';
DELETE FROM auth.users WHERE email = 'test.limpieza@ejemplo.com';

-- Log de migración
INSERT INTO public.ddl_migrations_log (mensaje) VALUES 
('Funciones de usuarios limpiadas y reorganizadas - Función principal: crear_nuevo_usuario_sistema');