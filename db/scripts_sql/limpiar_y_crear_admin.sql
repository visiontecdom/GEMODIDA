-- ============================================================================
-- GEMODIDA - Limpiar y Crear Usuario Administrador
-- ============================================================================

-- Limpiar usuario existente si existe
DELETE FROM public.asignaciones_usuario WHERE id_usuario IN (
    SELECT id_usuario FROM public.usuarios WHERE correo = 'dida.desarrollo@gmail.com'
);

DELETE FROM public.usuarios WHERE correo = 'dida.desarrollo@gmail.com';

DELETE FROM auth.users WHERE email = 'dida.desarrollo@gmail.com';

-- Crear usuario administrador
SELECT crear_usuario_completo_v2(
    'dida.desarrollo@gmail.com',
    'a12300',
    'Administrador',
    'Desarrollo',
    'admin',
    'general',
    1
);

-- Verificar creación
SELECT 
    u.correo,
    u.nombre_completo,
    ur.nombre_rol,
    u.esta_activo,
    'Usuario creado exitosamente' as estado
FROM public.usuarios u
JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol
WHERE u.correo = 'dida.desarrollo@gmail.com';