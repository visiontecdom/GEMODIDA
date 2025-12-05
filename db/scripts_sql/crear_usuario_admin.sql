-- ============================================================================
-- GEMODIDA - Crear Usuario Administrador
-- ============================================================================

-- Primero ejecutar el script de sincronización
-- \i sincronizacion_usuarios.sql

-- Crear usuario administrador
SELECT crear_usuario_completo(
    'dida.desarrollo@gmail.com',
    'a12300',
    'Administrador',
    'Desarrollo',
    'admin',
    'general',
    1
);

-- Verificar que el usuario fue creado correctamente
SELECT 
    u.correo,
    u.nombre_completo,
    ur.nombre_rol,
    s.nombre_sucursal,
    u.esta_activo
FROM public.usuarios u
JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol
JOIN public.sucursales s ON u.id_suc = s.id_suc
WHERE u.correo = 'dida.desarrollo@gmail.com';