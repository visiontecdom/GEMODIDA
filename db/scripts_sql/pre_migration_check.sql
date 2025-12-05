-- =====================================================
-- PRUEBA PREVIA: Verificar orden de ejecución
-- Ejecutar antes de la migración completa
-- =====================================================

-- Verificar valores actuales antes de cambios
SELECT
    'Estado actual antes de migración' as estado,
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN esta_activo IS NULL THEN 1 END) as esta_activo_null,
    COUNT(CASE WHEN id_suc IS NULL THEN 1 END) as id_suc_null,
    COUNT(CASE WHEN grupo IS NULL OR grupo = '' THEN 1 END) as grupo_null,
    COUNT(CASE WHEN estado IS NULL OR estado = '' THEN 1 END) as estado_null,
    COUNT(CASE WHEN nombre IS NULL OR nombre = '' THEN 1 END) as nombre_null
FROM usuarios;

-- Mostrar algunos ejemplos de datos actuales
SELECT
    id_usuario,
    correo,
    nombre_completo,
    nombre,
    esta_activo,
    id_suc,
    grupo,
    estado
FROM usuarios
LIMIT 3;

-- Verificar que las columnas a eliminar existen
SELECT
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'usuarios' AND column_name = 'login'
    ) THEN 'login existe' ELSE 'login no existe' END as login_status,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'usuarios' AND column_name = 'cod_lic'
    ) THEN 'cod_lic existe' ELSE 'cod_lic no existe' END as cod_lic_status,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'usuarios' AND column_name = 'rol'
    ) THEN 'rol existe' ELSE 'rol no existe' END as rol_status;