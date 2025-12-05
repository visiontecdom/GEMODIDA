-- ============================================================================
-- GEMODIDA - Sistema Completo de Usuarios con Supabase Auth
-- ============================================================================

-- 1. Eliminar foreign key constraint problemática si existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'usuarios_id_usuario_fkey' 
               AND table_name = 'usuarios') THEN
        ALTER TABLE public.usuarios DROP CONSTRAINT usuarios_id_usuario_fkey;
    END IF;
END $$;

-- 2. Función para crear usuario en auth.users usando admin API
CREATE OR REPLACE FUNCTION crear_usuario_auth(
    p_email TEXT,
    p_password TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Generar UUID único
    v_user_id := gen_random_uuid();
    
    -- Insertar en auth.users (simulando admin API)
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data,
        is_super_admin,
        role
    ) VALUES (
        v_user_id,
        '00000000-0000-0000-0000-000000000000',
        p_email,
        crypt(p_password, gen_salt('bf')),
        now(),
        now(),
        now(),
        p_metadata,
        false,
        'authenticated'
    );
    
    RETURN v_user_id;
    
EXCEPTION WHEN OTHERS THEN
    -- Si falla, intentar obtener usuario existente
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Error creando usuario: %', SQLERRM;
    END IF;
    RETURN v_user_id;
END;
$$;

-- 3. Función completa para crear usuario en ambas tablas
CREATE OR REPLACE FUNCTION crear_usuario_completo_v2(
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
    v_metadata JSONB;
BEGIN
    -- Verificar si el usuario ya existe
    SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
    IF v_user_id IS NOT NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuario ya existe en auth.users');
    END IF;
    
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE correo = p_email) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuario ya existe en public.usuarios');
    END IF;
    
    -- Obtener IDs de rol y grupo
    SELECT id_rol INTO v_rol_id FROM public.usuarios_roles WHERE codigo_rol = p_codigo_rol;
    SELECT id_grupo INTO v_grupo_id FROM public.usuarios_grupos WHERE codigo_grupo = p_codigo_grupo;
    
    IF v_rol_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Rol no encontrado: ' || p_codigo_rol);
    END IF;
    
    IF v_grupo_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Grupo no encontrado: ' || p_codigo_grupo);
    END IF;
    
    -- Construir nombre completo y metadata
    v_nombre_completo := p_nombre || ' ' || p_apellido;
    v_metadata := jsonb_build_object(
        'full_name', v_nombre_completo,
        'role', p_codigo_rol,
        'group', p_codigo_grupo
    );
    
    -- 1. Crear usuario en auth.users primero
    v_user_id := crear_usuario_auth(p_email, p_password, v_metadata);
    
    -- 2. Crear usuario en public.usuarios
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
    
    -- 3. Crear asignación de usuario
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
        'message', 'Usuario creado exitosamente en ambas tablas',
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

-- 4. Función para sincronizar usuarios existentes
CREATE OR REPLACE FUNCTION sincronizar_usuarios_existentes()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_count INTEGER := 0;
BEGIN
    -- Sincronizar usuarios de auth.users que no están en public.usuarios
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
        1
    FROM auth.users au
    WHERE NOT EXISTS (
        SELECT 1 FROM public.usuarios pu WHERE pu.id_usuario = au.id
    );
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Sincronización completada',
        'usuarios_sincronizados', v_count
    );
END;
$$;

-- 5. Ejecutar sincronización inicial
SELECT sincronizar_usuarios_existentes();

-- Log de migración
INSERT INTO public.ddl_migrations_log (mensaje) VALUES 
('Sistema completo de usuarios con Supabase Auth configurado correctamente');