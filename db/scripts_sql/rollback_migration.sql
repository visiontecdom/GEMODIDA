-- =====================================================
-- ROLLBACK SCRIPT: Revertir cambios de migración
-- Usar SOLO si la migración falla y necesitas restaurar
-- =====================================================

-- IMPORTANTE: Este script asume que tienes un backup de la tabla usuarios
-- Si no tienes backup, NO ejecutes este script

-- Paso 1: Eliminar función de autenticación si existe
DROP FUNCTION IF EXISTS autenticar_usuario(TEXT, TEXT);

-- Paso 2: Eliminar constraints si existen
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_nombre_ingreso_unique;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_correo_unique;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_esta_activo_check;
ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_id_suc_check;

-- Paso 3: Hacer campos nullable nuevamente
ALTER TABLE usuarios ALTER COLUMN esta_activo DROP NOT NULL;
ALTER TABLE usuarios ALTER COLUMN id_suc DROP NOT NULL;
ALTER TABLE usuarios ALTER COLUMN grupo DROP NOT NULL;
ALTER TABLE usuarios ALTER COLUMN estado DROP NOT NULL;
ALTER TABLE usuarios ALTER COLUMN nombre_ingreso DROP NOT NULL;

-- Paso 4: Restaurar columnas eliminadas (si es necesario)
-- Nota: Esto requiere tener los datos originales guardados
-- ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS login TEXT;
-- ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cod_lic TEXT;
-- ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS rol TEXT;

-- Paso 5: Renombrar columna de vuelta si es necesario
-- ALTER TABLE usuarios RENAME COLUMN nombre_ingreso TO nombre;

-- IMPORTANTE: Después de ejecutar este rollback,
-- necesitarás restaurar los datos desde un backup si eliminaste columnas