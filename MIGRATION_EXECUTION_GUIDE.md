# Guía de Ejecución de Migraciones - Sistema de Login Dinámico

## 📋 Resumen de Cambios
Esta migración implementa un sistema de login flexible que permite autenticación con correo electrónico o nombre de usuario único.

### Cambios en Base de Datos:
- ✅ Renombrar columna `nombre` → `nombre_ingreso`
- ✅ Generar valores únicos para `nombre_ingreso` basados en `correo`
- ✅ Eliminar columnas innecesarias: `login`, `cod_lic`, `rol`
- ✅ Hacer campos obligatorios: `esta_activo`, `id_suc`, `grupo`, `estado`, `nombre_ingreso`
- ✅ Agregar constraints únicos en `correo` y `nombre_ingreso`
- ✅ Crear función `autenticar_usuario()` para login dual

## 🚀 Proceso de Ejecución Seguro

### Paso 1: Verificación Previa
```sql
-- Ejecutar en Supabase SQL Editor
\i db/scripts_sql/pre_migration_check.sql
```
**Objetivo:** Verificar estado actual antes de cambios.

### Paso 2: Backup (Obligatorio)
```sql
-- Crear backup de tabla usuarios
CREATE TABLE usuarios_backup AS SELECT * FROM usuarios;
```
**Nota:** Guarda este backup. Es tu red de seguridad.

### Paso 3: Ejecutar Migración
```sql
-- Ejecutar migración completa
\i db/scripts_sql/complete_migration.sql
```
**Tiempo estimado:** 2-5 minutos dependiendo del volumen de datos.

### Paso 4: Verificación Post-Migración
```sql
-- Verificar que todo se aplicó correctamente
\i db/scripts_sql/post_migration_check.sql
```

### Paso 5: Verificación Final
```sql
-- Verificación completa del sistema
\i db/scripts_sql/verify_migration.sql
```

## ⚠️ Manejo de Errores

### Si la migración falla:
1. **NO** ejecutes rollback automático
2. Revisa el mensaje de error específico
3. Si es error de valores nulos, verifica que el orden de pasos esté correcto
4. Si necesitas rollback:
   ```sql
   \i db/scripts_sql/rollback_migration.sql
   ```
   Luego restaura desde backup:
   ```sql
   TRUNCATE TABLE usuarios;
   INSERT INTO usuarios SELECT * FROM usuarios_backup;
   ```

### Errores Comunes:
- **"column contains null values"**: El orden de UPDATE antes de ALTER TABLE está mal
- **"duplicate key value"**: Hay valores duplicados en campos únicos
- **"function already exists"**: La función ya existe, puedes ignorar

## ✅ Verificación de Éxito

Después de ejecutar, deberías ver:
- ✅ Columna `nombre_ingreso` existe con valores únicos
- ✅ Columnas `login`, `cod_lic`, `rol` eliminadas
- ✅ Todos los campos obligatorios tienen valores
- ✅ Función `autenticar_usuario` creada
- ✅ Constraints únicos activos

## 🧪 Pruebas Funcionales

Una vez completada la migración:

1. **Prueba login con correo:**
   ```sql
   SELECT * FROM autenticar_usuario('usuario@ejemplo.com', 'password123');
   ```

2. **Prueba login con nombre_ingreso:**
   ```sql
   SELECT * FROM autenticar_usuario('usuario_unico', 'password123');
   ```

3. **Verifica UI:** El formulario de login debería aceptar ambos formatos.

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs de error en Supabase
2. Ejecuta las verificaciones en orden
3. Compara con el backup si es necesario
4. Documenta el error exacto para debugging

---
**Recuerda:** Las migraciones DDL son irreversibles. ¡Trabaja con backups!