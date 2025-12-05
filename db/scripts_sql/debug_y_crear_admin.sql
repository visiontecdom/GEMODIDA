-- ============================================================================
-- GEMODIDA - Debug y Crear Usuario Administrador
-- ============================================================================

-- Verificar usuarios existentes
SELECT 'Usuarios en public.usuarios:' as info;
SELECT id_usuario, correo, nombre_completo FROM public.usuarios WHERE correo = 'dida.desarrollo@gmail.com';

SELECT 'Usuarios en auth.users:' as info;
SELECT id, email FROM auth.users WHERE email = 'dida.desarrollo@gmail.com';

-- Limpiar completamente
DO $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Obtener ID del usuario si existe
    SELECT id_usuario INTO v_user_id FROM public.usuarios WHERE correo = 'dida.desarrollo@gmail.com';
    
    IF v_user_id IS NOT NULL THEN
        -- Limpiar asignaciones
        DELETE FROM public.asignaciones_usuario WHERE id_usuario = v_user_id;
        -- Limpiar usuario
        DELETE FROM public.usuarios WHERE id_usuario = v_user_id;
        RAISE NOTICE 'Usuario eliminado de public.usuarios: %', v_user_id;
    END IF;
    
    -- Limpiar de auth.users
    DELETE FROM auth.users WHERE email = 'dida.desarrollo@gmail.com';
    RAISE NOTICE 'Usuario eliminado de auth.users';
END $$;

-- Crear usuario directamente sin función problemática
DO $$
DECLARE
    v_user_id UUID := gen_random_uuid();
    v_rol_id INTEGER;
    v_grupo_id INTEGER;
BEGIN
    -- Obtener IDs
    SELECT id_rol INTO v_rol_id FROM public.usuarios_roles WHERE codigo_rol = 'admin';
    SELECT id_grupo INTO v_grupo_id FROM public.usuarios_grupos WHERE codigo_grupo = 'general';
    
    -- Crear en auth.users
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, is_super_admin, role
    ) VALUES (
        v_user_id, '00000000-0000-0000-0000-000000000000', 'dida.desarrollo@gmail.com',
        crypt('a12300', gen_salt('bf')), now(), now(), now(),
        '{"full_name": "Administrador Desarrollo"}'::jsonb, false, 'authenticated'
    );
    
    -- Crear en public.usuarios
    INSERT INTO public.usuarios (
        id_usuario, correo, hash_contraseña, id_rol, nombre_completo,
        esta_activo, creado_en, actualizado_en, id_suc
    ) VALUES (
        v_user_id, 'dida.desarrollo@gmail.com', crypt('a12300', gen_salt('bf')),
        v_rol_id, 'Administrador Desarrollo', true, now(), now(), 1
    );
    
    -- Crear asignación
    INSERT INTO public.asignaciones_usuario (
        id_usuario, id_grupo, id_rol, id_sucursal, es_principal, esta_activa, creado_en
    ) VALUES (
        v_user_id, v_grupo_id, v_rol_id, 1, true, true, now()
    );
    
    RAISE NOTICE 'Usuario creado exitosamente con ID: %', v_user_id;
END $$;

-- Verificar creación final
SELECT 
    u.correo,
    u.nombre_completo,
    ur.nombre_rol,
    u.esta_activo
FROM public.usuarios u
JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol
WHERE u.correo = 'dida.desarrollo@gmail.com';