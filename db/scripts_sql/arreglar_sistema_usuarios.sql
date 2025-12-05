-- ============================================================================
-- GEMODIDA - Arreglar Sistema de Usuarios
-- ============================================================================

-- Deshabilitar trigger problemático
DROP TRIGGER IF EXISTS sync_auth_to_usuarios ON auth.users;

-- Función corregida sin conflictos
CREATE OR REPLACE FUNCTION crear_usuario_aplicacion_v2(
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
    -- Validar que no existe el usuario
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RETURN jsonb_build_object('success', false, 'message', 'El email ya está registrado');
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE correo = p_email) THEN
        RETURN jsonb_build_object('success', false, 'message', 'El usuario ya existe en el sistema');
    END IF;
    
    -- Obtener IDs de rol y grupo
    SELECT id_rol INTO v_rol_id FROM public.usuarios_roles WHERE codigo_rol = p_codigo_rol;
    SELECT id_grupo INTO v_grupo_id FROM public.usuarios_grupos WHERE codigo_grupo = p_codigo_grupo;
    
    IF v_rol_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Rol no válido: ' || p_codigo_rol);
    END IF;
    
    IF v_grupo_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Grupo no válido: ' || p_codigo_grupo);
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
            RETURN jsonb_build_object('success', false, 'message', 'No se pudo generar UUID único');
        END IF;
    END LOOP;
    
    -- Crear usuario en public.usuarios PRIMERO (sin trigger)
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
    
    -- Crear en auth.users DESPUÉS (para login)
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
    -- Limpiar en caso de error (orden inverso)
    BEGIN
        DELETE FROM auth.users WHERE id = v_user_id;
        DELETE FROM public.asignaciones_usuario WHERE id_usuario = v_user_id;
        DELETE FROM public.usuarios WHERE id_usuario = v_user_id;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignorar errores de limpieza
    END;
    
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error creando usuario: ' || SQLERRM
    );
END;
$$;

-- Prueba de la función corregida
SELECT crear_usuario_aplicacion_v2(
    'test2@ejemplo.com',
    'test123',
    'Usuario Prueba 2',
    'operador',
    'general',
    1
) as resultado_prueba_v2;

-- Verificar creación en ambas tablas
SELECT 'Creado en ambas tablas:' as resultado;
SELECT 'auth.users' as tabla, email FROM auth.users WHERE email = 'test2@ejemplo.com'
UNION ALL
SELECT 'public.usuarios' as tabla, correo FROM public.usuarios WHERE correo = 'test2@ejemplo.com';

-- Limpiar usuario de prueba
DELETE FROM public.asignaciones_usuario WHERE id_usuario IN (
    SELECT id_usuario FROM public.usuarios WHERE correo = 'test2@ejemplo.com'
);
DELETE FROM public.usuarios WHERE correo = 'test2@ejemplo.com';
DELETE FROM auth.users WHERE email = 'test2@ejemplo.com';

-- Log de migración
INSERT INTO public.ddl_migrations_log (mensaje) VALUES 
('Sistema de usuarios corregido - Sin triggers conflictivos');