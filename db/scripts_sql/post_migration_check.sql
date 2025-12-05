-- =====================================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- Ejecutar después de complete_migration.sql
-- =====================================================

-- Verificar estructura de tabla después de migración
SELECT
    'Estructura después de migración' as estado,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN esta_activo IS NOT NULL THEN 1 END) as esta_activo_not_null,
    COUNT(CASE WHEN id_suc IS NOT NULL THEN 1 END) as id_suc_not_null,
    COUNT(CASE WHEN grupo IS NOT NULL AND grupo != '' THEN 1 END) as grupo_not_null,
    COUNT(CASE WHEN estado IS NOT NULL AND estado != '' THEN 1 END) as estado_not_null,
    COUNT(CASE WHEN nombre_ingreso IS NOT NULL AND nombre_ingreso != '' THEN 1 END) as nombre_ingreso_not_null
FROM usuarios;

-- Verificar que columnas fueron renombradas correctamente
SELECT
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'usuarios' AND column_name = 'nombre_ingreso'
    ) THEN 'nombre_ingreso existe' ELSE 'ERROR: nombre_ingreso no existe' END as nombre_ingreso_status,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'usuarios' AND column_name = 'correo'
    ) THEN 'correo existe' ELSE 'ERROR: correo no existe' END as correo_status,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'usuarios' AND column_name = 'nombre_completo'
    ) THEN 'nombre_completo existe' ELSE 'ERROR: nombre_completo no existe' END as nombre_completo_status;

-- Verificar que columnas innecesarias fueron eliminadas
SELECT
    CASE WHEN NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'usuarios' AND column_name = 'login'
    ) THEN 'login eliminado correctamente' ELSE 'ERROR: login aún existe' END as login_status,
    CASE WHEN NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'usuarios' AND column_name = 'cod_lic'
    ) THEN 'cod_lic eliminado correctamente' ELSE 'ERROR: cod_lic aún existe' END as cod_lic_status,
    CASE WHEN NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'usuarios' AND column_name = 'rol'
    ) THEN 'rol eliminado correctamente' ELSE 'ERROR: rol aún existe' END as rol_status;

-- Verificar constraints NOT NULL
SELECT
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'usuarios' AND kcu.column_name = 'esta_activo' AND tc.constraint_type = 'CHECK'
    ) THEN 'esta_activo tiene constraint' ELSE 'esta_activo sin constraint' END as esta_activo_constraint,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'usuarios' AND kcu.column_name = 'id_suc' AND tc.constraint_type = 'CHECK'
    ) THEN 'id_suc tiene constraint' ELSE 'id_suc sin constraint' END as id_suc_constraint;

-- Verificar valores únicos en nombre_ingreso
SELECT
    'Verificación unicidad nombre_ingreso' as verificacion,
    COUNT(DISTINCT nombre_ingreso) as valores_unicos,
    COUNT(*) as total_registros,
    CASE WHEN COUNT(DISTINCT nombre_ingreso) = COUNT(*) THEN 'UNICIDAD OK' ELSE 'ERROR: Duplicados en nombre_ingreso' END as estado_unicidad
FROM usuarios;

-- Mostrar algunos ejemplos de datos después de migración
SELECT
    id_usuario,
    correo,
    nombre_completo,
    nombre_ingreso,
    esta_activo,
    id_suc,
    grupo,
    estado
FROM usuarios
ORDER BY id_usuario
LIMIT 5;

-- Verificar función de autenticación existe
SELECT
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines
        WHERE routine_name = 'autenticar_usuario' AND routine_type = 'FUNCTION'
    ) THEN 'Función autenticar_usuario existe' ELSE 'ERROR: Función autenticar_usuario no existe' END as funcion_auth_status;