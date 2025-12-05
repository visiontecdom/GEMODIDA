-- ============================================================================
-- GEMODIDA - Crear Usuario Administrador Simple
-- ============================================================================

-- Crear usuario directamente en public.usuarios sin foreign key a auth.users
DO $$
DECLARE
    v_user_id UUID := gen_random_uuid();
    v_rol_id INTEGER;
BEGIN
    -- Obtener ID del rol admin
    SELECT id_rol INTO v_rol_id FROM public.usuarios_roles WHERE codigo_rol = 'admin';
    
    -- Insertar usuario directamente en public.usuarios
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
        'dida.desarrollo@gmail.com',
        crypt('a12300', gen_salt('bf')),
        v_rol_id,
        'Administrador Desarrollo',
        true,
        now(),
        now(),
        1
    )
    ON CONFLICT (correo) DO NOTHING;
    
    -- Mostrar resultado
    RAISE NOTICE 'Usuario creado con ID: %', v_user_id;
END $$;

-- Verificar que el usuario fue creado
SELECT 
    u.id_usuario,
    u.correo,
    u.nombre_completo,
    ur.nombre_rol,
    u.esta_activo
FROM public.usuarios u
JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol
WHERE u.correo = 'dida.desarrollo@gmail.com';