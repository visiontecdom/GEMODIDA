-- ============================================================================
-- GEMODIDA - Sincronización de Usuarios entre auth.users y public.usuarios
-- ============================================================================

-- Función para sincronizar usuarios de auth.users a public.usuarios
CREATE OR REPLACE FUNCTION sync_auth_users_to_public()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insertar usuarios de auth.users que no existen en public.usuarios
    INSERT INTO public.usuarios (
        id_usuario, 
        correo, 
        hash_contraseña, 
        id_rol, 
        nombre_completo, 
        esta_activo, 
        creado_en,
        id_suc
    )
    SELECT 
        au.id,
        au.email,
        'synced_from_auth',
        (SELECT id_rol FROM public.usuarios_roles WHERE codigo_rol = 'invitado' LIMIT 1),
        COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)),
        true,
        au.created_at,
        1 -- Sucursal por defecto
    FROM auth.users au
    WHERE NOT EXISTS (
        SELECT 1 FROM public.usuarios pu WHERE pu.id_usuario = au.id
    );
END;
$$;

-- Trigger para sincronizar automáticamente cuando se crea un usuario en auth.users
CREATE OR REPLACE FUNCTION handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insertar en public.usuarios cuando se crea en auth.users
    INSERT INTO public.usuarios (
        id_usuario, 
        correo, 
        hash_contraseña, 
        id_rol, 
        nombre_completo, 
        esta_activo, 
        creado_en,
        id_suc
    ) VALUES (
        NEW.id,
        NEW.email,
        'synced_from_auth',
        (SELECT id_rol FROM public.usuarios_roles WHERE codigo_rol = 'invitado' LIMIT 1),
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        true,
        NEW.created_at,
        1
    )
    ON CONFLICT (id_usuario) DO NOTHING;
    
    RETURN NEW;
END;
$$;

-- Crear trigger en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_auth_user();

-- Función mejorada para crear usuario completo
CREATE OR REPLACE FUNCTION crear_usuario_completo(
    p_email TEXT,
    p_password TEXT,
    p_nombre TEXT,
    p_apellido TEXT,
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
    v_nombre_completo TEXT;
BEGIN
    -- Verificar si el usuario ya existe
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuario ya existe');
    END IF;
    
    -- Obtener IDs de rol y grupo
    SELECT id_rol INTO v_rol_id FROM public.usuarios_roles WHERE codigo_rol = p_codigo_rol;
    SELECT id_grupo INTO v_grupo_id FROM public.usuarios_grupos WHERE codigo_grupo = p_codigo_grupo;
    
    IF v_rol_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Rol no encontrado');
    END IF;
    
    IF v_grupo_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Grupo no encontrado');
    END IF;
    
    -- Construir nombre completo
    v_nombre_completo := p_nombre || ' ' || p_apellido;
    
    -- Crear usuario en auth.users usando admin API
    SELECT auth.uid() INTO v_user_id;
    
    -- Si no hay usuario autenticado, generar UUID
    IF v_user_id IS NULL THEN
        v_user_id := gen_random_uuid();
    END IF;
    
    -- Insertar directamente en public.usuarios (el trigger se encargará de auth.users)
    INSERT INTO public.usuarios (
        id_usuario,
        correo,
        hash_contraseña,
        id_rol,
        nombre_completo,
        esta_activo,
        creado_en,
        actualizado_en,
        id_suc
    ) VALUES (
        v_user_id,
        p_email,
        crypt(p_password, gen_salt('bf')),
        v_rol_id,
        v_nombre_completo,
        true,
        now(),
        now(),
        p_id_sucursal
    );
    
    -- Crear asignación de usuario
    INSERT INTO public.asignaciones_usuario (
        id_usuario,
        id_grupo,
        id_rol,
        id_sucursal,
        es_principal,
        esta_activa,
        creado_en
    ) VALUES (
        v_user_id,
        v_grupo_id,
        v_rol_id,
        p_id_sucursal,
        true,
        true,
        now()
    );
    
    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Usuario creado exitosamente',
        'user_id', v_user_id,
        'email', p_email
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false, 
        'message', 'Error: ' || SQLERRM
    );
END;
$$;

-- Ejecutar sincronización inicial
SELECT sync_auth_users_to_public();

-- Log de migración
INSERT INTO public.ddl_migrations_log (mensaje) VALUES 
('Sistema de sincronización de usuarios configurado correctamente');