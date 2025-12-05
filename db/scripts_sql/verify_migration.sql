-- VERIFICACIÓN POST-MIGRACIÓN: Sistema de Login Dinámico
-- Ejecutar después de aplicar las migraciones para confirmar cambios

-- 1. Verificar estructura de tabla usuarios
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'usuarios'
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar que nombre_ingreso existe y tiene valores
SELECT
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN nombre_ingreso IS NOT NULL THEN 1 END) as con_nombre_ingreso,
    COUNT(CASE WHEN nombre_ingreso IS NULL THEN 1 END) as sin_nombre_ingreso
FROM usuarios;

-- 3. Mostrar algunos ejemplos de nombre_ingreso generado
SELECT
    id_usuario,
    correo,
    nombre_completo,
    nombre_ingreso,
    esta_activo
FROM usuarios
LIMIT 10;

-- 4. Verificar índices únicos
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'usuarios'
    AND schemaname = 'public'
    AND (indexdef LIKE '%UNIQUE%' OR indexname LIKE '%unique%');

-- 5. Verificar constraints únicos
SELECT
    conname,
    contype,
    conkey
FROM pg_constraint
WHERE conrelid = 'usuarios'::regclass
    AND contype = 'u';

-- 6. Verificar que columnas innecesarias fueron eliminadas
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'usuarios'
    AND table_schema = 'public'
    AND column_name IN ('login', 'cod_lic', 'rol');

-- 7. Verificar log de migraciones
SELECT * FROM ddl_migrations_log ORDER BY ejecutado_en DESC LIMIT 5;