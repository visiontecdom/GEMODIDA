-- ================================================================
-- GEMODIDA ROLE ID ROLLBACK SCRIPT
-- ================================================================
-- Purpose: Rollback role ID migration from new values (1-9) back to original values (28-36)
-- Date: 2025-11-22
-- Author: Kilo Code
-- ================================================================

-- ================================================================
-- 1. PRE-ROLLBACK VALIDATION
-- ================================================================

-- Log the start of rollback
INSERT INTO public.ddl_migrations_log (mensaje) 
VALUES ('ROLE_ID_ROLLBACK_START: Starting rollback from IDs 1-9 back to 28-36');

-- Verify backup tables exist
DO $$
DECLARE
    v_backup_roles INTEGER;
    v_backup_users INTEGER;
    v_backup_assignments INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_backup_roles
    FROM information_schema.tables 
    WHERE table_name = 'usuarios_roles_backup_20251122';
    
    SELECT COUNT(*) INTO v_backup_users
    FROM information_schema.tables 
    WHERE table_name = 'usuarios_backup_20251122';
    
    SELECT COUNT(*) INTO v_backup_assignments
    FROM information_schema.tables 
    WHERE table_name = 'asignaciones_usuario_backup_20251122';
    
    IF v_backup_roles = 0 OR v_backup_users = 0 OR v_backup_assignments = 0 THEN
        RAISE EXCEPTION 'Rollback cannot proceed: Missing backup tables. Expected all backup tables to exist.';
    END IF;
    
    INSERT INTO public.ddl_migrations_log (mensaje) 
    VALUES ('ROLE_ID_ROLLBACK_VALIDATION: Backup tables found, proceeding with rollback');
END $$;

-- ================================================================
-- 2. DISABLE TRIGGERS TEMPORARILY
-- ================================================================

ALTER TABLE public.usuarios DISABLE TRIGGER ALL;
ALTER TABLE public.asignaciones_usuario DISABLE TRIGGER ALL;

-- ================================================================
-- 3. RESTORE FROM BACKUP TABLES
-- ================================================================

-- Restore usuarios_roles table from backup
DELETE FROM public.usuarios_roles WHERE id_rol BETWEEN 1 AND 9;
INSERT INTO public.usuarios_roles 
SELECT * FROM public.usuarios_roles_backup_20251122;

-- Restore usuarios table from backup
DELETE FROM public.usuarios WHERE id_rol BETWEEN 1 AND 9;
INSERT INTO public.usuarios 
SELECT * FROM public.usuarios_backup_20251122;

-- Restore asignaciones_usuario table from backup
DELETE FROM public.asignaciones_usuario WHERE id_rol BETWEEN 1 AND 9;
INSERT INTO public.asignaciones_usuario 
SELECT * FROM public.asignaciones_usuario_backup_20251122;

-- Log restoration
INSERT INTO public.ddl_migrations_log (mensaje) 
VALUES ('ROLE_ID_ROLLBACK_RESTORE: Restored all data from backup tables');

-- ================================================================
-- 4. VALIDATE ROLLBACK
-- ================================================================

DO $$
DECLARE
    v_role_count INTEGER;
    v_user_count INTEGER;
    v_assignment_count INTEGER;
BEGIN
    -- Check if original roles are restored
    SELECT COUNT(*) INTO v_role_count
    FROM public.usuarios_roles 
    WHERE id_rol BETWEEN 28 AND 36;
    
    -- Count users with original role IDs
    SELECT COUNT(*) INTO v_user_count
    FROM public.usuarios 
    WHERE id_rol BETWEEN 28 AND 36;
    
    -- Count assignments with original role IDs
    SELECT COUNT(*) INTO v_assignment_count
    FROM public.asignaciones_usuario 
    WHERE id_rol BETWEEN 28 AND 36;
    
    IF v_role_count != 9 THEN
        RAISE EXCEPTION 'Rollback validation failed: Expected 9 roles (28-36), found %', v_role_count;
    END IF;
    
    -- Log validation results
    INSERT INTO public.ddl_migrations_log (mensaje) 
    VALUES ('ROLE_ID_ROLLBACK_VALIDATION: Successfully restored % roles, % users, % assignments to original IDs', 
            v_role_count, v_user_count, v_assignment_count);
    
    RAISE NOTICE 'Rollback validation successful: % roles, % users, % assignments restored', v_role_count, v_user_count, v_assignment_count;
END $$;

-- ================================================================
-- 5. RE-ENABLE TRIGGERS
-- ================================================================

ALTER TABLE public.usuarios ENABLE TRIGGER ALL;
ALTER TABLE public.asignaciones_usuario ENABLE TRIGGER ALL;

-- Reset sequence
SELECT setval('usuarios_roles_id_rol_seq', COALESCE((SELECT MAX(id_rol) FROM public.usuarios_roles), 1));

-- ================================================================
-- 6. CLEANUP OPTIONAL (Uncomment if you want to remove backup tables)
-- ================================================================

-- WARNING: Only uncomment these lines if you want to permanently remove backup tables
-- DROP TABLE IF EXISTS public.usuarios_roles_backup_20251122;
-- DROP TABLE IF EXISTS public.usuarios_backup_20251122;
-- DROP TABLE IF EXISTS public.asignaciones_usuario_backup_20251122;

-- ================================================================
-- 7. SUCCESS LOGGING
-- ================================================================

INSERT INTO public.ddl_migrations_log (mensaje) 
VALUES ('ROLE_ID_ROLLBACK_SUCCESS: Role ID rollback completed successfully. Restored to original IDs 28-36.');

-- ================================================================
-- END OF ROLLBACK SCRIPT
-- ================================================================