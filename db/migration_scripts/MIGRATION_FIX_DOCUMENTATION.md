# Role ID Migration Fix - System Trigger Issue Resolution

## Problem Summary

The original migration script (`role_id_migration.sql`) failed with the error:
```
ERROR: 42501: permission denied: "RI_ConstraintTrigger_a_26346" is a system trigger
```

### Root Cause
The script attempted to disable all triggers on the `usuarios` and `asignaciones_usuario` tables using:
```sql
ALTER TABLE public.usuarios DISABLE TRIGGER ALL;
ALTER TABLE public.asignaciones_usuario DISABLE TRIGGER ALL;
```

This fails because PostgreSQL doesn't allow disabling **system triggers** (foreign key constraint triggers) that are managed internally by the database to enforce referential integrity.

### Foreign Key Constraints Involved
- **`fk_asignacion_rol`** in `asignaciones_usuario` table referencing `usuarios_roles(id_rol)`
- **`fk_asignacion_usuario`** and **`fk_asignacion_creador`** in `asignaciones_usuario` table referencing `usuarios(id_usuario)`

## Solution Approach

Instead of trying to disable system triggers, the fixed approach:

1. **Drops foreign key constraints temporarily** (not system triggers)
2. **Performs the migration updates** without constraint interference
3. **Recreates foreign key constraints** after migration completion
4. **Validates the migration** thoroughly with proper error handling

## Fixed Files Created

### 1. `role_id_migration_fixed.sql`
**Main migration script with the following improvements:**

- ✅ **No trigger disabling** - Avoids the permission denied error
- ✅ **FK constraint management** - Drops and recreates constraints properly
- ✅ **Automatic ddl_migrations_log creation** - Handles missing log table gracefully
- ✅ **Enhanced validation** - Better error checking and data integrity verification
- ✅ **Constraint verification** - Tests that FK constraints are working after recreation
- ✅ **Comprehensive logging** - Detailed progress tracking throughout the migration
- ✅ **Backup verification** - Ensures backup tables are created successfully before proceeding

### 2. `role_id_rollback_fixed.sql`
**Improved rollback script with the following enhancements:**

- ✅ **Uses backup tables** - Safer restoration approach
- ✅ **FK constraint management** - Handles constraints during rollback
- ✅ **Pre-rollback validation** - Checks backup table existence
- ✅ **Post-rollback verification** - Ensures rollback completed correctly
- ✅ **Automatic log table creation** - Handles missing infrastructure

## Key Changes from Original Script

### Original Problematic Code (Lines 68-69):
```sql
-- This fails with permission denied error
ALTER TABLE public.usuarios DISABLE TRIGGER ALL;
ALTER TABLE public.asignaciones_usuario DISABLE TRIGGER ALL;
```

### Fixed Approach:
```sql
-- Drop foreign key constraints temporarily
ALTER TABLE public.asignaciones_usuario DROP CONSTRAINT IF EXISTS fk_asignacion_rol;

-- Perform migration updates...

-- Recreate foreign key constraints
ALTER TABLE public.asignaciones_usuario 
ADD CONSTRAINT fk_asignacion_rol 
FOREIGN KEY (id_rol) REFERENCES public.usuarios_roles(id_rol);
```

## Migration Process Overview

### Step 1: Pre-Migration Validation
- Creates `ddl_migrations_log` table if missing
- Creates backup tables with data to be migrated
- Validates that all expected roles exist
- Verifies backup creation success

### Step 2: FK Constraint Management
- Identifies all foreign key constraints referencing `usuarios_roles(id_rol)`
- Drops constraint `fk_asignacion_rol` temporarily

### Step 3: Role ID Migration
- Updates `usuarios_roles` table IDs from 28-36 to temporary values (1028-1036)
- Updates related tables (`usuarios`, `asignaciones_usuario`) to temporary values
- Updates all tables to final target values (1-9) based on `codigo_rol`

### Step 4: FK Constraint Recreation
- Recreates the `fk_asignacion_rol` constraint
- Validates constraint is working with test insert

### Step 5: Post-Migration Validation
- Verifies all 9 roles have correct target IDs
- Checks user and assignment role references are updated
- Confirms FK constraints are active and working

## How to Use the Fixed Migration Script

### Prerequisites
- Ensure you have PostgreSQL superuser privileges or the required permissions to modify foreign key constraints
- Make sure no other applications are modifying the database during migration
- Have a current database backup (in addition to the script's internal backups)

### Running the Migration

1. **Backup your database** (in addition to the script's built-in backups):
   ```bash
   pg_dump -h your_host -U your_user -d your_database > backup_before_role_migration.sql
   ```

2. **Run the fixed migration script**:
   ```sql
   -- Using psql
   \i db/migration_scripts/role_id_migration_fixed.sql
   
   -- Or using any SQL client, execute the contents of the file
   ```

3. **Monitor the execution**:
   - Watch for any error messages in the output
   - Check the `ddl_migrations_log` table for progress messages
   - The script will log success/failure at each step

### Expected Output
```sql
-- You should see messages like:
NOTICE: Migration validation passed: 9 roles, X users, Y assignments
NOTICE: Dropped constraint: fk_asignacion_rol
NOTICE: Recreated constraint: fk_asignacion_rol
NOTICE: Migration validation successful: 9 roles with correct IDs
```

### If Migration Fails
If the migration fails at any step, you can rollback using:
```sql
\i db/migration_scripts/role_id_rollback_fixed.sql
```

### After Successful Migration
1. **Update your application code** to use the new role IDs (1-9 instead of 28-36)
2. **Test your application** thoroughly
3. **Clean up backup tables** (optional - uncomment cleanup lines in the scripts)

## Testing the Migration

### Pre-Migration Test
Before running the actual migration, you can test the FK constraint handling:
```sql
-- This should fail with a foreign key violation
INSERT INTO public.asignaciones_usuario (id_usuario, id_rol, id_grupo, id_sucursal, creado_por, esta_activa)
VALUES ('00000000-0000-0000-0000-000000000000', 999, 1, 1, '00000000-0000-0000-0000-000000000000', true);
```

### Post-Migration Verification
After successful migration, verify the results:
```sql
-- Check role mappings
SELECT codigo_rol, id_rol FROM public.usuarios_roles 
WHERE id_rol IN (1,2,3,4,5,6,7,8,9)
ORDER BY id_rol;

-- Should return:
-- super_user, 1
-- admin, 2  
-- gerente, 3
-- supervisor, 4
-- operador, 5
-- encuestador, 6
-- seguridad, 7
-- invitado, 8
-- desarrollo, 9

-- Check if FK constraints are working
INSERT INTO public.asignaciones_usuario (id_usuario, id_rol, id_grupo, id_sucursal, creado_por, esta_activa)
VALUES ('00000000-0000-0000-0000-000000000000', 999, 1, 1, '00000000-0000-0000-0000-000000000000', true);
-- Should fail with foreign key violation
```

## Benefits of the Fixed Approach

1. **No Permission Issues** - Works within PostgreSQL's security model
2. **Data Integrity** - Maintains referential integrity throughout the process
3. **Rollback Safety** - Built-in rollback capability with data restoration
4. **Comprehensive Logging** - Full audit trail of the migration process
5. **Error Handling** - Better validation and error detection
6. **Constraint Verification** - Ensures FK constraints are working after recreation

## Files Updated

- **Created**: `db/migration_scripts/role_id_migration_fixed.sql`
- **Created**: `db/migration_scripts/role_id_rollback_fixed.sql`
- **Preserved**: Original files remain unchanged for reference

The fixed scripts resolve the system trigger permission issue while maintaining data integrity and providing a robust migration process.