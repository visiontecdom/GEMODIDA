-- =====================================================
-- GEMODIDA - SCRIPT DE INSERCIÓN DE DATOS
-- Versión: 1.0
-- Descripción: Inserta datos iniciales usando los nombres de columnas en español
-- Fuente: GEMODIDA_DATOS_TABLAS.json
-- Fecha: 2025-11-18
-- =====================================================

-- =====================================================
-- INSERCIÓN EN TABLA public.perfiles (traducida)
-- Nota: Los datos de auth.users se manejan automáticamente por Supabase Auth
-- =====================================================

-- Insertar perfil de usuario con nombres de columnas traducidos
INSERT INTO public.perfiles (
    id_perfil,
    nombre_completo,
    correo,
    telefono,
    rol,
    creado_en,
    actualizado_en
) VALUES (
    '88035f13-9834-4b6a-8fab-4ea8e5c3d249'::uuid,
    'Israel Báez Herrera',
    'baez.israel@gmail.com',
    '18092993185',
    'admin',
    '2025-11-17 16:32:18.219254+00'::timestamp with time zone,
    '2025-11-17 16:32:18.219254+00'::timestamp with time zone
) ON CONFLICT (id_perfil) DO UPDATE SET
    nombre_completo = EXCLUDED.nombre_completo,
    correo = EXCLUDED.correo,
    telefono = EXCLUDED.telefono,
    rol = EXCLUDED.rol,
    actualizado_en = EXCLUDED.actualizado_en;

-- =====================================================
-- INSERCIÓN EN TABLA public.roles (ya estaba en español)
-- =====================================================

-- Insertar rol de administrador
INSERT INTO public.roles (
    id_rol,
    nombre_rol,
    descripcion,
    permisos,
    creado_en,
    actualizado_en
) VALUES (
    1,
    'admin',
    'Administrador del sistema',
    '{"*": true}'::jsonb,
    '2025-11-13 17:28:55.430016+00'::timestamp with time zone,
    '2025-11-13 17:28:55.430016+00'::timestamp with time zone
) ON CONFLICT (id_rol) DO UPDATE SET
    nombre_rol = EXCLUDED.nombre_rol,
    descripcion = EXCLUDED.descripcion,
    permisos = EXCLUDED.permisos,
    actualizado_en = EXCLUDED.actualizado_en;

-- Insertar rol de usuario estándar
INSERT INTO public.roles (
    id_rol,
    nombre_rol,
    descripcion,
    permisos,
    creado_en,
    actualizado_en
) VALUES (
    2,
    'usuario',
    'Usuario estándar',
    '{"reportes": ["read", "create"], "palabras_clave": ["read", "create", "update", "delete"]}'::jsonb,
    '2025-11-13 17:28:55.430016+00'::timestamp with time zone,
    '2025-11-13 17:28:55.430016+00'::timestamp with time zone
) ON CONFLICT (id_rol) DO UPDATE SET
    nombre_rol = EXCLUDED.nombre_rol,
    descripcion = EXCLUDED.descripcion,
    permisos = EXCLUDED.permisos,
    actualizado_en = EXCLUDED.actualizado_en;

-- Insertar rol de lector
INSERT INTO public.roles (
    id_rol,
    nombre_rol,
    descripcion,
    permisos,
    creado_en,
    actualizado_en
) VALUES (
    3,
    'lector',
    'Solo lectura',
    '{"reportes": ["read"], "palabras_clave": ["read"]}'::jsonb,
    '2025-11-13 17:28:55.430016+00'::timestamp with time zone,
    '2025-11-13 17:28:55.430016+00'::timestamp with time zone
) ON CONFLICT (id_rol) DO UPDATE SET
    nombre_rol = EXCLUDED.nombre_rol,
    descripcion = EXCLUDED.descripcion,
    permisos = EXCLUDED.permisos,
    actualizado_en = EXCLUDED.actualizado_en;

-- =====================================================
-- VERIFICACIÓN DE INSERCIONES
-- =====================================================

-- Verificar datos insertados en perfiles
SELECT 
    'perfiles' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN rol = 'admin' THEN 1 END) as administradores
FROM public.perfiles;

-- Verificar datos insertados en roles
SELECT 
    'roles' as tabla,
    id_rol,
    nombre_rol,
    descripcion,
    permisos
FROM public.roles
ORDER BY id_rol;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
DECLARE
    perfiles_count INTEGER;
    roles_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO perfiles_count FROM public.perfiles;
    SELECT COUNT(*) INTO roles_count FROM public.roles;
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'GEMODIDA - DATOS INSERTADOS EXITOSAMENTE';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Perfiles insertados: %', perfiles_count;
    RAISE NOTICE 'Roles insertados: %', roles_count;
    RAISE NOTICE 'Usuario administrador: Israel Báez Herrera';
    RAISE NOTICE 'Email: baez.israel@gmail.com';
    RAISE NOTICE '==============================================';
END $$;