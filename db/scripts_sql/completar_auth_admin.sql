-- ============================================================================
-- GEMODIDA - Completar Usuario en auth.users
-- ============================================================================

-- Crear el mismo usuario en auth.users para login
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
    'ff9550cd-65ca-4e56-8726-005b84754f07',
    '00000000-0000-0000-0000-000000000000',
    'dida.desarrollo@gmail.com',
    crypt('a12300', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"full_name": "Administrador Desarrollo", "role": "admin"}'::jsonb,
    false,
    'authenticated'
);

-- Verificar que existe en ambas tablas
SELECT 'Usuario en auth.users:' as tabla, id::text as user_id, email, created_at
FROM auth.users 
WHERE email = 'dida.desarrollo@gmail.com'

UNION ALL

SELECT 'Usuario en public.usuarios' as tabla, id_usuario::text, correo, creado_en
FROM public.usuarios 
WHERE correo = 'dida.desarrollo@gmail.com';

-- Verificar datos completos
SELECT 
    'USUARIO LISTO PARA LOGIN' as estado,
    u.correo as email,
    'a12300' as password,
    ur.nombre_rol as rol,
    u.esta_activo as activo
FROM public.usuarios u
JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol
WHERE u.correo = 'dida.desarrollo@gmail.com';