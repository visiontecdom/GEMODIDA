# ROLE ID MIGRATION - FOREIGN KEY CONSTRAINT FIX

## PROBLEM SOLVED ✅

The migration script has been **FIXED** to handle foreign key constraints properly.

## WHAT WAS WRONG

The original script (`role_id_migration.sql`) had this issue:
- It tried to update `usuarios_roles.id_rol` primary keys directly
- But `usuarios_asignaciones.id_rol` still had foreign key references to the old IDs
- PostgreSQL prevented the update due to foreign key constraint violations

**Error:** `ERROR: 23503: update or delete on table "usuarios_roles" violates foreign key constraint "fk_asignacion_rol"`

## HOW IT'S FIXED NOW

The script now follows the **correct order**:

1. **Drop Foreign Key Constraints** (Line 135)
   - Temporarily removes `fk_asignacion_rol` constraint
   - Allows safe updates without constraint violations

2. **Update All Tables** (Lines 157-221)
   - Update `usuarios_roles` to temporary IDs (+1000)
   - Update `usuarios` foreign keys to temporary IDs (+1000)
   - Update `usuarios_asignaciones` foreign keys to temporary IDs (+1000)
   - Then update all tables to final target IDs (1-9)

3. **Recreate Foreign Key Constraints** (Lines 238-242)
   - Restores `fk_asignacion_rol` constraint with new references
   - Validates that constraints are working properly

## KEY DIFFERENCES FROM OLD SCRIPT

| Aspect | Old Script (BROKEN) | New Script (FIXED) |
|--------|--------------------|-------------------|
| FK Handling | ❌ No FK constraint management | ✅ Drop → Update → Recreate |
| Update Order | ❌ Direct primary key updates | ✅ Temporary IDs → Final IDs |
| Error Handling | ❌ Basic error handling | ✅ Comprehensive validation |
| Logging | ❌ Limited logging | ✅ Detailed logging & monitoring |

## HOW TO USE THE FIXED SCRIPT

### Run the Migration
```sql
-- Execute the fixed migration script
\i db/migration_scripts/role_id_migration.sql
```

### If Something Goes Wrong
Use the rollback script:
```sql
-- Rollback to original state
\i db/migration_scripts/role_id_rollback_fixed.sql
```

## VERIFICATION

The script includes:
- ✅ Pre-migration data validation
- ✅ Automatic backup creation
- ✅ Foreign key constraint verification
- ✅ Post-migration validation
- ✅ Detailed logging in `ddl_migrations_log` table

## SAFETY FEATURES

1. **Backup Tables Created Automatically:**
   - `usuarios_roles_backup_20251122`
   - `usuarios_backup_20251122`  
   - `usuarios_asignaciones_backup_20251122`

2. **Comprehensive Validation:**
   - Verifies expected data before migration
   - Confirms all updates completed successfully
   - Tests foreign key constraints are working

3. **Detailed Logging:**
   - Every step logged to `ddl_migrations_log`
   - Easy troubleshooting if issues occur

## MIGRATION MAPPING

| Role | Original ID | Temporary ID | Final ID |
|------|------------|-------------|----------|
| gerente | 28 | 1028 | 3 |
| supervisor | 29 | 1029 | 4 |
| operador | 30 | 1030 | 5 |
| encuestador | 31 | 1031 | 6 |
| admin | 32 | 1032 | 2 |
| desarrollo | 33 | 1033 | 9 |
| super_user | 34 | 1034 | 1 |
| invitado | 35 | 1035 | 8 |
| seguridad | 36 | 1036 | 7 |

---

**STATUS: ✅ READY TO RUN**

The migration script is now fixed and ready to execute without foreign key constraint violations.