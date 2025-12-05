-- ============================================================================
-- GEMODIDA - Sistema de Usuarios para Producción
-- ============================================================================

-- 1. Función RPC para crear usuarios desde la aplicación
CREATE OR REPLACE FUNCTION crear_usuario_aplicacion(
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
    v_auth_user_id UUID;
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
    
    -- Generar UUID único
    LOOP
        v_user_id := gen_random_uuid();
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id_usuario = v_user_id)
              AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id);
    END LOOP;
    
    -- Crear usuario en auth.users primero
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, is_super_admin, role
    ) VALUES (
        v_user_id, '00000000-0000-0000-0000-000000000000', p_email,
        crypt(p_password, gen_salt('bf')), now(), now(), now(),
        jsonb_build_object('full_name', p_nombre_completo, 'role', p_codigo_rol),
        false, 'authenticated'
    );
    
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
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Usuario creado exitosamente',
        'user_id', v_user_id,
        'email', p_email
    );
    
EXCEPTION WHEN OTHERS THEN
    -- Limpiar en caso de error
    DELETE FROM public.asignaciones_usuario WHERE id_usuario = v_user_id;
    DELETE FROM public.usuarios WHERE id_usuario = v_user_id;
    DELETE FROM auth.users WHERE id = v_user_id;
    
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error creando usuario: ' || SQLERRM
    );
END;
$$;

-- 2. Función para validar login personalizado (opcional)
CREATE OR REPLACE FUNCTION validar_login_usuario(
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
    -- Buscar usuario
    SELECT 
        u.id_usuario,
        u.correo,
        u.nombre_completo,
        u.hash_contraseña,
        u.esta_activo,
        ur.codigo_rol,
        ur.nombre_rol,
        ug.codigo_grupo,
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
    SELECT (u.hash_contraseña = crypt(p_password, u.hash_contraseña)) INTO v_password_valid
    FROM public.usuarios u WHERE u.correo = p_email;
    
    IF NOT v_password_valid THEN
        RETURN jsonb_build_object('success', false, 'message', 'Contraseña incorrecta');
    END IF;
    
    -- Actualizar último acceso
    UPDATE public.usuarios SET ultimo_acceso = now() WHERE correo = p_email;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Login exitoso',
        'user', jsonb_build_object(
            'id', v_user_record.id_usuario,
            'email', v_user_record.correo,
            'nombre', v_user_record.nombre_completo,
            'rol', v_user_record.codigo_rol,
            'nombre_rol', v_user_record.nombre_rol,
            'grupo', v_user_record.codigo_grupo,
            'sucursal', v_user_record.nombre_sucursal
        )
    );
END;
$$;

-- 3. Trigger para sincronización automática (backup)
CREATE OR REPLACE FUNCTION sync_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Solo sincronizar si no existe en public.usuarios
    IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id_usuario = NEW.id) THEN
        INSERT INTO public.usuarios (
            id_usuario, correo, hash_contraseña, id_rol, nombre_completo,
            esta_activo, creado_en, id_suc
        ) VALUES (
            NEW.id,
            NEW.email,
            'synced_from_auth',
            (SELECT id_rol FROM public.usuarios_roles WHERE codigo_rol = 'invitado' LIMIT 1),
            COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
            true,
            NEW.created_at,
            1
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Crear trigger si no existe
DROP TRIGGER IF EXISTS sync_auth_to_usuarios ON auth.users;
CREATE TRIGGER sync_auth_to_usuarios
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION sync_new_auth_user();

-- 4. Función de prueba
SELECT crear_usuario_aplicacion(
    'test@ejemplo.com',
    'test123',
    'Usuario de Prueba',
    'operador',
    'general',
    1
) as resultado_prueba;

-- Limpiar usuario de prueba
DELETE FROM public.asignaciones_usuario WHERE id_usuario IN (
    SELECT id_usuario FROM public.usuarios WHERE correo = 'test@ejemplo.com'
);
DELETE FROM public.usuarios WHERE correo = 'test@ejemplo.com';
DELETE FROM auth.users WHERE email = 'test@ejemplo.com';

-- Log de migración
INSERT INTO public.ddl_migrations_log (mensaje) VALUES 
('Sistema de usuarios para producción configurado correctamente - Listo para la aplicación');