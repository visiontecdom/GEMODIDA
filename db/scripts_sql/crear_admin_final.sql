-- ============================================================================
-- GEMODIDA - Crear Usuario Administrador Final
-- ============================================================================

-- Crear usuario administrador usando el sistema completo
SELECT crear_usuario_completo_v2(
    'dida.desarrollo@gmail.com',
    'a12300',
    'Administrador',
    'Desarrollo',
    'admin',
    'general',
    1
);

-- Verificar creación en ambas tablas
SELECT 
    'auth.users' as tabla,
    au.id::text as user_id,
    au.email,
    au.created_at
FROM auth.users au
WHERE au.email = 'dida.desarrollo@gmail.com'

UNION ALL

SELECT 
    'public.usuarios' as tabla,
    u.id_usuario::text,
    u.correo,
    u.creado_en
FROM public.usuarios u
WHERE u.correo = 'dida.desarrollo@gmail.com';

-- Verificar datos completos del usuario
SELECT 
    u.correo,
    u.nombre_completo,
    ur.nombre_rol,
    ug.nombre_grupo,
    s.nombre_sucursal,
    u.esta_activo
FROM public.usuarios u
JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol
JOIN public.asignaciones_usuario au ON au.id_usuario = u.id_usuario
JOIN public.usuarios_grupos ug ON ug.id_grupo = au.id_grupo
JOIN public.sucursales s ON u.id_suc = s.id_suc
WHERE u.correo = 'dida.desarrollo@gmail.com';