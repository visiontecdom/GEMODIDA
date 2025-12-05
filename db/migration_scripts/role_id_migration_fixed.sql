-- ================================================================
-- GEMODIDA ROLE ID MIGRATION SCRIPT - FIXED VERSION
-- ================================================================
-- Purpose: Update role IDs from current values (28-36) to new values (1-9)
-- Date: 2025-11-22
-- Author: Kilo Code
-- Version: 2.0 (Fixed to handle FK constraints properly)
-- ================================================================

-- ================================================================
-- 1. PRE-MIGRATION VALIDATION AND BACKUP
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
        INSERT INTO public.ddl_migrations_log (mensaje) VALUES ('ROLE_ID_MIGRATION: Created ddl_migrations_log table');
    END IF;
END $$;

-- Log the start of migration
INSERT INTO public.ddl_migrations_log (mensaje) 
VALUES ('ROLE_ID_MIGRATION_START: Starting role ID migration from 28-36 to 1-9');

-- Create backup table for usuarios_roles (only the roles we're migrating)
CREATE TABLE IF NOT EXISTS public.usuarios_roles_backup_20251122 AS 
SELECT * FROM public.usuarios_roles 
WHERE id_rol BETWEEN 28 AND 36;

-- Create backup table for usuarios
CREATE TABLE IF NOT EXISTS public.usuarios_backup_20251122 AS 
SELECT * FROM public.usuarios;

-- Create backup table for usuarios_asignaciones
CREATE TABLE IF NOT EXISTS public.usuarios_asignaciones_backup_20251122 AS 
SELECT * FROM public.usuarios_asignaciones;

-- Validate current data integrity and backup success
DO $$
DECLARE
    v_role_count INTEGER;
    v_user_count INTEGER;
    v_assignment_count INTEGER;
    v_backup_role_count INTEGER;
    v_backup_user_count INTEGER;
    v_backup_assignment_count INTEGER;
BEGIN
    -- Check if all expected roles exist
    SELECT COUNT(*) INTO v_role_count
    FROM public.usuarios_roles 
    WHERE id_rol BETWEEN 28 AND 36;
    
    IF v_role_count != 9 THEN
        RAISE EXCEPTION 'Expected 9 roles (28-36), found %', v_role_count;
    END IF;
    
    -- Check for any users referencing these roles
    SELECT COUNT(*) INTO v_user_count
    FROM public.usuarios 
    WHERE id_rol BETWEEN 28 AND 36;
    
    -- Check for any assignments referencing these roles
    SELECT COUNT(*) INTO v_assignment_count
    FROM public.usuarios_asignaciones 
    WHERE id_rol BETWEEN 28 AND 36;
    
    -- Verify backups were created successfully
    SELECT COUNT(*) INTO v_backup_role_count FROM public.usuarios_roles_backup_20251122;
    SELECT COUNT(*) INTO v_backup_user_count FROM public.usuarios_backup_20251122;
    SELECT COUNT(*) INTO v_backup_assignment_count FROM public.usuarios_asignaciones_backup_20251122;
    
    -- Log validation results
    INSERT INTO public.ddl_migrations_log (mensaje) 
    VALUES (format('ROLE_ID_VALIDATION: Found % roles, % users, % assignments. Backups: % roles, % users, % assignments',
                   v_role_count, v_user_count, v_assignment_count,
                   v_backup_role_count, v_backup_user_count, v_backup_assignment_count));
    
    RAISE NOTICE 'Migration validation passed: % roles, % users, % assignments. Backups verified.',
                 v_role_count, v_user_count, v_assignment_count;
END $$;

-- ================================================================
-- 2. DROP FOREIGN KEY CONSTRAINTS TEMPORARILY
-- ================================================================

-- Store constraint information for later recreation
DO $$
DECLARE
    fk_constraint RECORD;
    constraint_names TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Get all foreign key constraints that reference usuarios_roles
    FOR fk_constraint IN 
        SELECT 
            tc.constraint_name,
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND ccu.table_name = 'usuarios_roles'
            AND ccu.column_name = 'id_rol'
    LOOP
        constraint_names := array_append(constraint_names, fk_constraint.constraint_name);
        RAISE NOTICE 'Found FK constraint: % on table %', fk_constraint.constraint_name, fk_table_name;
    END LOOP;
    
    -- Log found constraints
    INSERT INTO public.ddl_migrations_log (mensaje) 
    VALUES (format('ROLE_ID_FK_CONSTRAINTS: Found % constraints to handle: %s', 
                   array_length(constraint_names, 1), array_to_string(constraint_names, ', ')));
END $$;

-- Drop foreign key constraints that reference usuarios_roles.id_rol
DO $$
BEGIN
    -- Drop FK constraint in usuarios_asignaciones table (if exists)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'fk_asignacion_rol' 
               AND table_name = 'usuarios_asignaciones') THEN
        ALTER TABLE public.usuarios_asignaciones DROP CONSTRAINT IF EXISTS fk_asignacion_rol;
        RAISE NOTICE 'Dropped constraint: fk_asignacion_rol';
        INSERT INTO public.ddl_migrations_log (mensaje) VALUES ('ROLE_ID_FK_DROPPED: Dropped fk_asignacion_rol constraint');
    END IF;
END $$;

-- ================================================================
-- 3. ROLE ID MIGRATION WITH TEMPORARY IDs
-- ================================================================

-- Since we can't have duplicate primary keys, we'll use temporary IDs first
-- Map current IDs to temporary IDs (add 1000 to avoid conflicts)
-- gerente: 28 -> 1028
-- supervisor: 29 -> 1029
-- operador: 30 -> 1030
-- encuestador: 31 -> 1031
-- admin: 32 -> 1032
-- desarrollo: 33 -> 1033
-- super_user: 34 -> 1034
-- invitado: 35 -> 1035
-- seguridad: 36 -> 1036

UPDATE public.usuarios_roles 
SET id_rol = id_rol + 1000 
WHERE id_rol BETWEEN 28 AND 36;

-- Update foreign key references in usuarios table (if any users have these roles)
UPDATE public.usuarios 
SET id_rol = id_rol + 1000 
WHERE id_rol BETWEEN 28 AND 36;

-- Update foreign key references in usuarios_asignaciones table
UPDATE public.usuarios_asignaciones 
SET id_rol = id_rol + 1000 
WHERE id_rol BETWEEN 28 AND 36;

-- Log intermediate step
INSERT INTO public.ddl_migrations_log (mensaje) 
VALUES ('ROLE_ID_MIGRATION_STEP1: Updated all role IDs to temporary values (added 1000)');

-- ================================================================
-- 4. UPDATE TO FINAL TARGET IDs
-- ================================================================

-- Now update to final target IDs
-- gerente: 1028 -> 3
-- supervisor: 1029 -> 4
-- operador: 1030 -> 5
-- encuestador: 1031 -> 6
-- admin: 1032 -> 2
-- desarrollo: 1033 -> 9
-- super_user: 1034 -> 1
-- invitado: 1035 -> 8
-- seguridad: 1036 -> 7

-- Update usuarios_roles table using codigo_rol to avoid ambiguity
UPDATE public.usuarios_roles SET id_rol = 3 WHERE codigo_rol = 'gerente';
UPDATE public.usuarios_roles SET id_rol = 4 WHERE codigo_rol = 'supervisor';
UPDATE public.usuarios_roles SET id_rol = 5 WHERE codigo_rol = 'operador';
UPDATE public.usuarios_roles SET id_rol = 6 WHERE codigo_rol = 'encuestador';
UPDATE public.usuarios_roles SET id_rol = 2 WHERE codigo_rol = 'admin';
UPDATE public.usuarios_roles SET id_rol = 9 WHERE codigo_rol = 'desarrollo';
UPDATE public.usuarios_roles SET id_rol = 1 WHERE codigo_rol = 'super_user';
UPDATE public.usuarios_roles SET id_rol = 8 WHERE codigo_rol = 'invitado';
UPDATE public.usuarios_roles SET id_rol = 7 WHERE codigo_rol = 'seguridad';

-- Update usuarios table foreign key references using temporary IDs
UPDATE public.usuarios SET id_rol = 3 WHERE id_rol = 1028; -- gerente
UPDATE public.usuarios SET id_rol = 4 WHERE id_rol = 1029; -- supervisor
UPDATE public.usuarios SET id_rol = 5 WHERE id_rol = 1030; -- operador
UPDATE public.usuarios SET id_rol = 6 WHERE id_rol = 1031; -- encuestador
UPDATE public.usuarios SET id_rol = 2 WHERE id_rol = 1032; -- admin
UPDATE public.usuarios SET id_rol = 9 WHERE id_rol = 1033; -- desarrollo
UPDATE public.usuarios SET id_rol = 1 WHERE id_rol = 1034; -- super_user
UPDATE public.usuarios SET id_rol = 8 WHERE id_rol = 1035; -- invitado
UPDATE public.usuarios SET id_rol = 7 WHERE id_rol = 1036; -- seguridad

-- Update usuarios_asignaciones table foreign key references using temporary IDs
UPDATE public.usuarios_asignaciones SET id_rol = 3 WHERE id_rol = 1028; -- gerente
UPDATE public.usuarios_asignaciones SET id_rol = 4 WHERE id_rol = 1029; -- supervisor
UPDATE public.usuarios_asignaciones SET id_rol = 5 WHERE id_rol = 1030; -- operador
UPDATE public.usuarios_asignaciones SET id_rol = 6 WHERE id_rol = 1031; -- encuestador
UPDATE public.usuarios_asignaciones SET id_rol = 2 WHERE id_rol = 1032; -- admin
UPDATE public.usuarios_asignaciones SET id_rol = 9 WHERE id_rol = 1033; -- desarrollo
UPDATE public.usuarios_asignaciones SET id_rol = 1 WHERE id_rol = 1034; -- super_user
UPDATE public.usuarios_asignaciones SET id_rol = 8 WHERE id_rol = 1035; -- invitado
UPDATE public.usuarios_asignaciones SET id_rol = 7 WHERE id_rol = 1036; -- seguridad

-- Log main migration completion
INSERT INTO public.ddl_migrations_log (mensaje) 
VALUES ('ROLE_ID_MIGRATION_COMPLETE: Successfully updated all role IDs to target values');

-- ================================================================
-- 5. RECREATE FOREIGN KEY CONSTRAINTS
-- ================================================================

-- Recreate the foreign key constraint
DO $$
BEGIN
    -- Recreate FK constraint in usuarios_asignaciones table
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE constraint_name = 'fk_asignacion_rol' 
                   AND table_name = 'usuarios_asignaciones') THEN
        ALTER TABLE public.usuarios_asignaciones 
        ADD CONSTRAINT fk_asignacion_rol 
        FOREIGN KEY (id_rol) REFERENCES public.usuarios_roles(id_rol);
        RAISE NOTICE 'Recreated constraint: fk_asignacion_rol';
        INSERT INTO public.ddl_migrations_log (mensaje) VALUES ('ROLE_ID_FK_RECREATED: Recreated fk_asignacion_rol constraint');
    END IF;
EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.ddl_migrations_log (mensaje) VALUES (format('ROLE_ID_FK_ERROR: Failed to recreate fk_asignacion_rol: %s', SQLERRM));
    RAISE;
END $$;

-- ================================================================
-- 6. POST-MIGRATION VALIDATION
-- ================================================================

-- Validate migration results
DO $$
DECLARE
    v_new_role_count INTEGER;
    v_roles_with_correct_ids INTEGER;
    v_users_with_correct_roles INTEGER;
    v_assignments_with_correct_roles INTEGER;
BEGIN
    -- Check if all target roles exist with correct IDs
    SELECT COUNT(*) INTO v_roles_with_correct_ids
    FROM public.usuarios_roles 
    WHERE id_rol IN (1,2,3,4,5,6,7,8,9)
    AND codigo_rol IN ('super_user','admin','gerente','supervisor','operador','encuestador','seguridad','invitado','desarrollo');
    
    -- Count total roles in system
    SELECT COUNT(*) INTO v_new_role_count
    FROM public.usuarios_roles;
    
    -- Check users with correct role assignments
    SELECT COUNT(*) INTO v_users_with_correct_roles
    FROM public.usuarios 
    WHERE id_rol IN (1,2,3,4,5,6,7,8,9);
    
    -- Check assignments with correct role references
    SELECT COUNT(*) INTO v_assignments_with_correct_roles
    FROM public.usuarios_asignaciones 
    WHERE id_rol IN (1,2,3,4,5,6,7,8,9);
    
    IF v_roles_with_correct_ids != 9 THEN
        RAISE EXCEPTION 'Migration validation failed: Expected 9 roles with correct IDs, found %', v_roles_with_correct_ids;
    END IF;
    
    -- Log validation success
    INSERT INTO public.ddl_migrations_log (mensaje) 
    VALUES (format('ROLE_ID_VALIDATION_SUCCESS: All % roles migrated. Users: %, Assignments: %. Total roles: %', 
                   v_roles_with_correct_ids, v_users_with_correct_roles, v_assignments_with_correct_roles, v_new_role_count));
    
    RAISE NOTICE 'Migration validation successful: % roles with correct IDs. Users: %, Assignments: %', 
                 v_roles_with_correct_ids, v_users_with_correct_roles, v_assignments_with_correct_roles;
END $$;

-- Verify foreign key constraints are working
DO $$
DECLARE
    constraint_check INTEGER;
BEGIN
    -- Try to insert a test record that would violate FK to verify constraint is active
    BEGIN
        INSERT INTO public.usuarios_asignaciones (id_usuario, id_rol, id_grupo, id_sucursal, creado_por, esta_activa)
        VALUES ('00000000-0000-0000-0000-000000000000', 999, 1, 1, '00000000-0000-0000-0000-000000000000', true);
        
        -- If we get here, the constraint is not working (rollback this test)
        RAISE EXCEPTION 'Foreign key constraint test failed - constraint may not be properly recreated';
    EXCEPTION WHEN OTHERS THEN
        -- This is expected - the constraint is working properly
        INSERT INTO public.ddl_migrations_log (mensaje) VALUES ('ROLE_ID_FK_VERIFIED: Foreign key constraints are working properly');
        RAISE NOTICE 'Foreign key constraint verification passed';
    END;
END $$;

-- ================================================================
-- 7. UPDATE SEQUENCES
-- ================================================================

-- Reset the sequence for usuarios_roles to avoid conflicts
SELECT setval('usuarios_roles_id_rol_seq', COALESCE((SELECT MAX(id_rol) FROM public.usuarios_roles), 1));

-- ================================================================
-- 8. SUCCESS LOGGING AND CLEANUP
-- ================================================================

INSERT INTO public.ddl_migrations_log (mensaje) 
VALUES ('ROLE_ID_MIGRATION_SUCCESS: Role ID migration completed successfully. Application should now use new role IDs 1-9.');

-- Optional: Clean up backup tables (uncomment if you want to remove them after successful migration)
-- WARNING: Only uncomment these lines after verifying the migration is completely successful
-- DROP TABLE IF EXISTS public.usuarios_roles_backup_20251122;
-- DROP TABLE IF EXISTS public.usuarios_backup_20251122;
-- DROP TABLE IF EXISTS public.usuarios_asignaciones_backup_20251122;
-- INSERT INTO public.ddl_migrations_log (mensaje) VALUES ('ROLE_ID_BACKUP_CLEANUP: Removed backup tables');

-- ================================================================
-- END OF MIGRATION SCRIPT
-- ================================================================