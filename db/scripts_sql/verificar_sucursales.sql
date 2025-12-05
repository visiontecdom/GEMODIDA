-- ============================================================================
-- GEMODIDA - Verificar Sucursales Disponibles
-- ============================================================================

-- Ver todas las sucursales
SELECT 'Todas las sucursales:' as info;
SELECT id_suc, nombre_sucursal, estado FROM public.sucursales ORDER BY id_suc;

-- Ver sucursales activas específicamente
SELECT 'Sucursales activas:' as info;
SELECT id_suc, nombre_sucursal, estado FROM public.sucursales WHERE estado = 'activa' ORDER BY id_suc;

-- Probar la función con una sucursal que sabemos que existe
SELECT crear_nuevo_usuario_sistema(
    'test.sucursal@ejemplo.com',
    'test123456',
    'Usuario Test Sucursal',
    'operador',
    'general',
    (SELECT id_suc FROM public.sucursales WHERE estado = 'activa' LIMIT 1)
) as resultado_con_sucursal_valida;

-- Limpiar usuario de prueba
DELETE FROM public.asignaciones_usuario WHERE id_usuario IN (
    SELECT id_usuario FROM public.usuarios WHERE correo = 'test.sucursal@ejemplo.com'
);
DELETE FROM public.usuarios WHERE correo = 'test.sucursal@ejemplo.com';
DELETE FROM auth.users WHERE email = 'test.sucursal@ejemplo.com';