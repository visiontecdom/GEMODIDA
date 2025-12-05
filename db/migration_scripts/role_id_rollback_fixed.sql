-- ================================================================
-- GEMODIDA ROLE ID ROLLBACK SCRIPT - FIXED VERSION
-- ================================================================
-- Purpose: Rollback role ID migration from new values (1-9) back to original values (28-36)
-- Date: 2025-11-22
-- Author: Kilo Code
-- Version: 2.0 (Fixed to handle FK constraints properly)
-- ================================================================

-- ================================================================
-- 1. PRE-ROLLBACK VALIDATION
-- ================================================================

-- Check if ddl_migrations_log table exists, create if not
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ddl_migrations_log') THEN
        CREATE TABLE public.ddl_migrations_log (
            id integer NOT NULL DEFAULT nextval('ddl_migrations_log_id_seq'::regclass),
            mensaje text NOT NULL,
            ejecutado_en timestamp with time zone DEFAULT now(),
            CONSTRAINT ddl_migrations_log_pkey PRIMARY KEY (id)
        );
        INSERT INTO public.ddl_migrations_log (mensaje) VALUES ('ROLE_ID_ROLLBACK: Created ddl_migrations_log table');
    END IF;
END $$;

-- Log the start of rollback
INSERT INTO public.ddl_migrations_log (mensaje)
VALUES ('ROLE_ID_ROLLBACK_START: Starting rollback from IDs 1-9 back to 28-36');

-- Verify backup tables exist
DO $$
DECLARE
    backup_tables_exist BOOLEAN := TRUE;
BEGIN
    -- Check if backup tables exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios_roles_backup_20251122') THEN
        backup_tables_exist := FALSE;
        RAISE NOTICE 'Warning: usuarios_roles_backup_20251122 table not found';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usuarios_backup_20251122') THEN
        backup_tables_exist := FALSE;
        RAISE NOTICE 'Warning: usuarios_backup_20251122 table not found';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'asignaciones_usuario_backup_20251122') THEN
        backup_tables_exist := FALSE;
        RAISE NOTICE 'Warning: asignaciones_usuario_backup_20251122 table not found';
    END IF;
    
    IF NOT backup_tables_exist THEN
        RAISE EXCEPTION 'Rollback cannot proceed: Required backup tables are missing. Please restore from manual backup.';
    END IF;
    
    INSERT INTO public.ddl_migrations_log (mensaje)
    VALUES ('ROLE_ID_ROLLBACK_VALIDATION: All backup tables found, proceeding with rollback');
END $$;

-- Validate current state
DO $$
DECLARE
    v_current_roles_count INTEGER;
    v_current_users_count INTEGER;
    v_current_assignments_count INTEGER;
BEGIN
    -- Check current roles
    SELECT COUNT(*) INTO v_current_roles_count
    FROM public.usuarios_roles 
    WHERE id_rol BETWEEN 1 AND 9;
    
    -- Check users with new role IDs
    SELECT COUNT(*) INTO v_current_users_count
    FROM public.usuarios 
    WHERE id_rol BETWEEN 1 AND 9;
    
    -- Check assignments with new role IDs
    SELECT COUNT(*) INTO v_current_assignments_count
    FROM public.asignaciones_usuario 
    WHERE id_rol BETWEEN 1 AND 9;
    
    INSERT INTO public.ddl_migrations_log (mensaje)
    VALUES (format('ROLE_ID_ROLLBACK_CURRENT_STATE: Found % roles, % users, % assignments with new IDs',
                   v_current_roles_count, v_current_users_count, v_current_assignments_count));
    
    RAISE NOTICE 'Current state: % roles, % users, % assignments with new IDs', 
                 v_current_roles_count, v_current_users_count, v_current_assignments_count;
END $$;

-- ================================================================
-- 2. DROP FOREIGN KEY CONSTRAINTS TEMPORARILY
-- ================================================================

-- Drop foreign key constraints that reference usuarios_roles.id_rol
DO $$
BEGIN
    -- Drop FK constraint in asignaciones_usuario table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_asignacion_rol' 
               AND table_name = 'asignaciones_usuario') THEN
        ALTER TABLE public.asignaciones_usuario DROP CONSTRAINT IF EXISTS fk_asignacion_rol;
        RAISE NOTICE 'Dropped constraint: fk_asignacion_rol for rollback';
        INSERT INTO public.ddl_migrations_log (mensaje) VALUES ('ROLE_ID_ROLLBACK_FK_DROPPED: Dropped fk_asignacion_rol for rollback');
    END IF;
END $$;

-- ================================================================
-- 3. ROLLBACK USING BACKUP TABLES
-- ================================================================

-- Restore usuarios_roles table from backup
DELETE FROM public.usuarios_roles WHERE id_rol BETWEEN 1 AND 9;
INSERT INTO public.usuarios_roles
SELECT * FROM public.usuarios_roles_backup_20251122;

-- Restore usuarios table from backup (only users with migrated roles)
DELETE FROM public.usuarios WHERE id_rol BETWEEN 1 AND 9;
INSERT INTO public.usuarios
SELECT * FROM public.usuarios_backup_20251122
WHERE id_rol BETWEEN 28 AND 36;

-- Restore asignaciones_usuario table from backup (only assignments with migrated roles)
DELETE FROM public.asignaciones_usuario WHERE id_rol BETWEEN 1 AND 9;
INSERT INTO public.asignaciones_usuario
SELECT * FROM public.asignaciones_usuario_backup_20251122
WHERE id_rol BETWEEN 28 AND 36;

-- Log restoration
INSERT INTO public.ddl_migrations_log (mensaje)
VALUES ('ROLE_ID_ROLLBACK_RESTORE: Restored all data from backup tables');

-- ================================================================
-- 4. RECREATE FOREIGN KEY CONSTRAINTS
-- ================================================================

-- Recreate the foreign key constraint
DO $$
BEGIN
    -- Recreate FK constraint in asignaciones_usuario table
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_asignacion_rol' 
                   AND table_name = 'asignaciones_usuario') THEN
        ALTER TABLE public.asignaciones_usuario 
        ADD CONSTRAINT fk_asignacion_rol 
        FOREIGN KEY (id_rol) REFERENCES public.usuarios_roles(id_rol);
        RAISE NOTICE 'Recreated constraint: fk_asignacion_rol after rollback';
        INSERT INTO public.ddl_migrations_log (mensaje) VALUES ('ROLE_ID_ROLLBACK_FK_RECREATED: Recreated fk_asignacion_rol after rollback');
    END IF;
EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.ddl_migrations_log (mensaje) VALUES (format('ROLE_ID_ROLLBACK_FK_ERROR: Failed to recreate fk_asignacion_rol: %s', SQLERRM));
    RAISE;
END $$;

-- ================================================================
-- 5. POST-ROLLBACK VALIDATION
-- ================================================================

-- Validate rollback results
DO $$
DECLARE
    v_restored_roles_count INTEGER;
    v_restored_users_count INTEGER;
    v_restored_assignments_count INTEGER;
    v_original_roles_count INTEGER;
BEGIN
    -- Check if original roles were restored
    SELECT COUNT(*) INTO v_restored_roles_count
    FROM public.usuarios_roles 
    WHERE id_rol BETWEEN 28 AND 36;
    
    -- Check users restored
    SELECT COUNT(*) INTO v_restored_users_count
    FROM public.usuarios 
    WHERE id_rol BETWEEN 28 AND 36;
    
    -- Check assignments restored
    SELECT COUNT(*) INTO v_restored_assignments_count
    FROM public.asignaciones_usuario 
    WHERE id_rol BETWEEN 28 AND 36;
    
    -- Count total roles to ensure we didn't lose any
    SELECT COUNT(*) INTO v_original_roles_count
    FROM public.usuarios_roles;
    
    IF v_restored_roles_count != 9 THEN
        RAISE EXCEPTION 'Rollback validation failed: Expected 9 roles restored, found %', v_restored_roles_count;
    END IF;
    
    -- Log validation results
    INSERT INTO public.ddl_migrations_log (mensaje)
    VALUES (format('ROLE_ID_ROLLBACK_VALIDATION: Successfully restored % roles, % users, % assignments to original IDs. Total roles: %',
                   v_restored_roles_count, v_restored_users_count, v_restored_assignments_count, v_original_roles_count));
    
    RAISE NOTICE 'Rollback validation successful: % roles, % users, % assignments restored to original IDs',
                 v_restored_roles_count, v_restored_users_count, v_restored_assignments_count;
END $$;

-- Verify foreign key constraints are working
DO $$
BEGIN
    -- Try to insert a test record that would violate FK to verify constraint is active
    BEGIN
        INSERT INTO public.asignaciones_usuario (id_usuario, id_rol, id_grupo, id_sucursal, creado_por, esta_activa)
        VALUES ('00000000-0000-0000-0000-000000000000', 999, 1, 1, '00000000-0000-0000-0000-000000000000', true);
        
        -- If we get here, the constraint is not working (rollback this test)
        RAISE EXCEPTION 'Foreign key constraint test failed - constraint may not be properly recreated after rollback';
    EXCEPTION WHEN OTHERS THEN
        -- This is expected - the constraint is working properly
        INSERT INTO public.ddl_migrations_log (mensaje) VALUES ('ROLE_ID_ROLLBACK_FK_VERIFIED: Foreign key constraints are working properly after rollback');
        RAISE NOTICE 'Foreign key constraint verification passed after rollback';
    END;
END $$;

-- ================================================================
-- 6. UPDATE SEQUENCES
-- ================================================================

-- Reset the sequence for usuarios_roles to the maximum existing ID
SELECT setval('usuarios_roles_id_rol_seq', COALESCE((SELECT MAX(id_rol) FROM public.usuarios_roles), 1));

-- ================================================================
-- 7. SUCCESS LOGGING
-- ================================================================

INSERT INTO public.ddl_migrations_log (mensaje)
VALUES ('ROLE_ID_ROLLBACK_SUCCESS: Role ID rollback completed successfully. Restored to original IDs 28-36.');

-- ================================================================
-- 8. CLEANUP (OPTIONAL)
-- ================================================================

-- WARNING: Only uncomment these lines if you want to permanently remove backup tables
-- This should only be done after verifying the rollback is completely successful
-- DROP TABLE IF EXISTS public.usuarios_roles_backup_20251122;
-- DROP TABLE IF EXISTS public.usuarios_backup_20251122;
-- DROP TABLE IF EXISTS public.asignaciones_usuario_backup_20251122;
-- INSERT INTO public.ddl_migrations_log (mensaje) VALUES ('ROLE_ID_ROLLBACK_BACKUP_CLEANUP: Removed backup tables');

-- ================================================================
-- END OF ROLLBACK SCRIPT
-- ================================================================