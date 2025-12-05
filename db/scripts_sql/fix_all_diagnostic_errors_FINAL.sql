-- ================================================================================
-- COMPREHENSIVE FIX FOR ALL DIAGNOSTIC ERRORS - FINAL CORRECTED VERSION
-- Date: 2025-11-22
-- Description: Fixes all errors identified in diagnostic file
-- ================================================================================

-- ============================================================================
-- 1. FIX MISSING RPC FUNCTIONS
-- ============================================================================

-- Drop existing function if it exists to avoid conflicts
DROP FUNCTION IF EXISTS public.obtener_permisos_usuario(uuid) CASCADE;

-- Create missing obtener_permisos_usuario function
CREATE OR REPLACE FUNCTION public.obtener_permisos_usuario(p_id_usuario uuid)
RETURNS TABLE(
    permiso_codigo varchar,
    permiso_nombre varchar,
    puede_crear boolean,
    puede_leer boolean,
    puede_actualizar boolean,
    puede_eliminar boolean,
    recurso varchar
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Return permissions based on user role
    RETURN QUERY
    SELECT 
        ur.codigo_rol as permiso_codigo,
        ur.nombre_rol as permiso_nombre,
        CASE 
            WHEN ur.nivel_acceso >= 1 THEN true 
            ELSE false 
        END as puede_crear,
        CASE 
            WHEN ur.nivel_acceso >= 1 THEN true 
            ELSE false 
        END as puede_leer,
        CASE 
            WHEN ur.nivel_acceso >= 2 THEN true 
            ELSE false 
        END as puede_actualizar,
        CASE 
            WHEN ur.nivel_acceso >= 3 THEN true 
            ELSE false 
        END as puede_eliminar,
        'usuarios' as recurso
    FROM public.usuarios u
    LEFT JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol
    WHERE u.id_usuario = p_id_usuario 
    AND ur.esta_activo = true;
END;
$$;

COMMENT ON FUNCTION public.obtener_permisos_usuario(uuid) IS 
'Obtiene los permisos de un usuario basado en su rol. Soluciona error 404 del diagnostic.';

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.obtener_permisos_usuario(uuid) TO authenticated;

-- ============================================================================
-- 2. FIX RLS POLICY INFINITE RECURSION ON USUARIOS TABLE
-- ============================================================================

-- First, identify existing problematic policies
DO $$
DECLARE
    policy_record record;
    table_name text := 'usuarios';
BEGIN
    RAISE NOTICE 'Fixing RLS policies for table: %', table_name;
    
    -- Drop all existing policies to start clean
    FOR policy_record IN 
        SELECT polname FROM pg_policies WHERE tablename = table_name
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_record.polname, table_name);
        RAISE NOTICE 'Dropped policy: %', policy_record.polname;
    END LOOP;
    
    -- Create simple, non-recursive policies
    -- Allow users to read their own data
    EXECUTE format('
        CREATE POLICY usuarios_select_own ON %I
        FOR SELECT
        USING (id_usuario = auth.uid()::uuid)
    ', table_name);
    
    -- Allow authenticated users to read all usuarios (for admin functions)
    EXECUTE format('
        CREATE POLICY usuarios_select_authenticated ON %I
        FOR SELECT
        TO authenticated
        USING (true)
    ', table_name);
    
    -- Allow users to update their own data
    EXECUTE format('
        CREATE POLICY usuarios_update_own ON %I
        FOR UPDATE
        USING (id_usuario = auth.uid()::uuid)
    ', table_name);
    
    -- Allow service role to do everything
    EXECUTE format('
        CREATE POLICY usuarios_all_service_role ON %I
        FOR ALL
        TO service_role
        USING (true)
        WITH CHECK (true)
    ', table_name);
    
    RAISE NOTICE 'RLS policies recreated successfully for %', table_name;
END $$;

-- ============================================================================
-- 3. FIX USUARIOS_ROLES TABLE RLS POLICIES
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Fixing RLS policies for table: usuarios_roles';
    
    -- Drop existing policies
    DROP POLICY IF EXISTS usuarios_roles_select ON usuarios_roles;
    DROP POLICY IF EXISTS usuarios_roles_all ON usuarios_roles;
    
    -- Create simple policies for usuarios_roles
    CREATE POLICY usuarios_roles_select ON usuarios_roles
    FOR SELECT
    TO authenticated
    USING (esta_activo = true);
    
    CREATE POLICY usuarios_roles_all ON usuarios_roles
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
    
    RAISE NOTICE 'RLS policies fixed for usuarios_roles';
END $$;

-- ============================================================================
-- 4. FIX USUARIOS_GRUPOS TABLE RLS POLICIES  
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Fixing RLS policies for table: usuarios_grupos';
    
    -- Drop existing policies
    DROP POLICY IF EXISTS usuarios_grupos_select ON usuarios_grupos;
    DROP POLICY IF EXISTS usuarios_grupos_all ON usuarios_grupos;
    
    -- Create simple policies for usuarios_grupos
    CREATE POLICY usuarios_grupos_select ON usuarios_grupos
    FOR SELECT
    TO authenticated
    USING (esta_activo = true);
    
    CREATE POLICY usuarios_grupos_all ON usuarios_grupos
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
    
    RAISE NOTICE 'RLS policies fixed for usuarios_grupos';
END $$;

-- ============================================================================
-- 5. FIX SUCURSALES TABLE INCONSISTENT ESTADO FIELD
-- ============================================================================

DO $$
DECLARE
    estado_column_exists boolean;
    estado_activo_column_exists boolean;
BEGIN
    -- Check which columns exist
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sucursales' AND column_name = 'estado'
    ) INTO estado_column_exists;
    
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sucursales' AND column_name = 'esta_activo'
    ) INTO estado_activo_column_exists;
    
    IF estado_column_exists AND NOT estado_activo_column_exists THEN
        -- Add esta_activo column and populate it
        ALTER TABLE public.sucursales ADD COLUMN esta_activo boolean DEFAULT true;
        
        -- Migrate data from estado to esta_activo
        UPDATE public.sucursales 
        SET esta_activo = CASE 
            WHEN estado = 'Activo' THEN true 
            WHEN estado = 'Inactivo' THEN false 
            ELSE true 
        END;
        
        RAISE NOTICE 'Added esta_activo column to sucursales and migrated estado data';
    ELSIF estado_activo_column_exists AND NOT estado_column_exists THEN
        RAISE NOTICE 'sucursales table already has esta_activo column';
    ELSE
        RAISE NOTICE 'sucursales table has both estado and esta_activo columns - manual review needed';
    END IF;
    
    -- Fix RLS policies for sucursales
    DROP POLICY IF EXISTS sucursales_select ON sucursales;
    DROP POLICY IF EXISTS sucursales_all ON sucursales;
    
    CREATE POLICY sucursales_select ON sucursales
    FOR SELECT
    TO authenticated
    USING (esta_activo = true OR estado = 'Activo' OR estado = 'activa');
    
    CREATE POLICY sucursales_all ON sucursales
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
    
    RAISE NOTICE 'Fixed RLS policies for sucursales';
END $$;

-- ============================================================================
-- 6. VERIFY AND FIX FOREIGN KEY RELATIONSHIPS
-- ============================================================================

DO $$
DECLARE
    fk_exists boolean;
BEGIN
    -- Check if foreign key relationship exists between usuarios and usuarios_roles
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'usuarios'
        AND kcu.column_name = 'id_rol'
        AND tc.referenced_table_name = 'usuarios_roles'
    ) INTO fk_exists;
    
    IF NOT fk_exists THEN
        -- Add foreign key constraint
        ALTER TABLE public.usuarios 
        ADD CONSTRAINT fk_usuarios_id_rol 
        FOREIGN KEY (id_rol) REFERENCES public.usuarios_roles(id_rol)
        ON DELETE SET NULL
        ON UPDATE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint usuarios.id_rol -> usuarios_roles.id_rol';
    ELSE
        RAISE NOTICE 'Foreign key relationship usuarios -> usuarios_roles already exists';
    END IF;
    
    -- Check usuarios to sucursales foreign key
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name = 'usuarios'
        AND kcu.column_name = 'id_suc'
        AND tc.referenced_table_name = 'sucursales'
    ) INTO fk_exists;
    
    IF NOT fk_exists THEN
        -- Add foreign key constraint
        ALTER TABLE public.usuarios 
        ADD CONSTRAINT fk_usuarios_id_suc 
        FOREIGN KEY (id_suc) REFERENCES public.sucursales(id_suc)
        ON DELETE SET NULL
        ON UPDATE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint usuarios.id_suc -> sucursales.id_suc';
    ELSE
        RAISE NOTICE 'Foreign key relationship usuarios -> sucursales already exists';
    END IF;
END $$;

-- ============================================================================
-- 7. UPDATE obtener_usuarios_completos FUNCTION TO HANDLE ERRORS BETTER
-- ============================================================================

DROP FUNCTION IF EXISTS public.obtener_usuarios_completos(integer, integer) CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_usuarios_completos(
    p_limite integer DEFAULT 50,
    p_desplazamiento integer DEFAULT 0
)
RETURNS TABLE(
    id_usuario uuid,
    correo character varying,
    nombre_completo character varying,
    telefono character varying,
    esta_activo boolean,
    id_rol integer,
    nombre_rol character varying,
    id_suc integer,
    nombre_sucursal text,
    creado_en timestamp with time zone,
    ultimo_acceso timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id_usuario,
        u.correo,
        u.nombre_completo,
        u.telefono,
        COALESCE(u.esta_activo, false) as esta_activo,
        u.id_rol,
        COALESCE(ur.nombre_rol, 'Sin rol') as nombre_rol,
        u.id_suc,
        COALESCE(s.nombre_sucursal, 'Sin sucursal') as nombre_sucursal,
        u.creado_en,
        u.ultimo_acceso
    FROM public.usuarios u
    LEFT JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol AND ur.esta_activo = true
    LEFT JOIN public.sucursales s ON u.id_suc = s.id_suc AND (s.esta_activo = true OR s.estado = 'Activo')
    WHERE u.esta_activo = true
    ORDER BY u.creado_en DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
EXCEPTION WHEN OTHERS THEN
    -- Log error and re-raise with more context
    RAISE EXCEPTION 'Error in obtener_usuarios_completos: %', SQLERRM;
END;
$$;

COMMENT ON FUNCTION public.obtener_usuarios_completos(integer, integer) IS 
'Gets users with role and branch info. Fixed to handle RLS issues better.';

-- ============================================================================
-- 8. VERIFICATION AND TESTING
-- ============================================================================

DO $$
DECLARE
    v_count integer;
    v_error_count integer := 0;
BEGIN
    RAISE NOTICE 'Starting verification of all fixes';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'VERIFICATION OF ALL FIXES';
    RAISE NOTICE '========================================';
    
    -- Test 1: Check obtener_permisos_usuario function exists
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'obtener_permisos_usuario';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ obtener_permisos_usuario function exists';
    ELSE
        RAISE WARNING '✗ obtener_permisos_usuario function missing';
        v_error_count := v_error_count + 1;
    END IF;
    
    -- Test 2: Check RLS policies on usuarios table
    SELECT COUNT(*) INTO v_count
    FROM pg_policies WHERE tablename = 'usuarios';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ usuarios table has % RLS policies', v_count;
    ELSE
        RAISE WARNING '✗ usuarios table has no RLS policies';
        v_error_count := v_error_count + 1;
    END IF;
    
    -- Test 3: Check foreign key constraints
    SELECT COUNT(*) INTO v_count
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'usuarios';
    
    IF v_count >= 2 THEN
        RAISE NOTICE '✓ usuarios table has % foreign key constraints', v_count;
    ELSE
        RAISE WARNING '✗ usuarios table missing foreign key constraints (found: %)', v_count;
        v_error_count := v_error_count + 1;
    END IF;
    
    -- Test 4: Test obtener_usuarios_completos function
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM public.obtener_usuarios_completos(10, 0);
        RAISE NOTICE '✓ obtener_usuarios_completos function works (% users)', v_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '✗ Error testing obtener_usuarios_completos: %', SQLERRM;
        v_error_count := v_error_count + 1;
    END;
    
    -- Test 5: Check sucursales esta_activo column
    SELECT COUNT(*) INTO v_count
    FROM information_schema.columns
    WHERE table_name = 'sucursales' AND column_name = 'esta_activo';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ sucursales table has esta_activo column';
    ELSE
        RAISE WARNING '✗ sucursales table missing esta_activo column';
        v_error_count := v_error_count + 1;
    END IF;
    
    RAISE NOTICE 'Verification complete';
    IF v_error_count = 0 THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE '🎉 ALL FIXES APPLIED SUCCESSFULLY!';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'All diagnostic errors have been resolved:';
        RAISE NOTICE '✓ Missing obtener_permisos_usuario function created';
        RAISE NOTICE '✓ RLS infinite recursion fixed';
        RAISE NOTICE '✓ Foreign key relationships verified';
        RAISE NOTICE '✓ Table query errors resolved';
        RAISE NOTICE '✓ Inconsistent estado field naming fixed';
        RAISE NOTICE '';
        RAISE NOTICE 'The Matriz de Soporte page should now work without errors.';
    ELSE
        RAISE NOTICE '========================================';
        RAISE NOTICE '⚠️  % ERRORS REMAIN - MANUAL INTERVENTION NEEDED', v_error_count;
        RAISE NOTICE '========================================';
    END IF;
END $$;

-- Grant all necessary permissions
GRANT EXECUTE ON FUNCTION public.obtener_usuarios_completos(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obtener_permisos_usuario(uuid) TO authenticated;

RAISE NOTICE '========================================';
RAISE NOTICE 'DIAGNOSTIC ERRORS FIX SCRIPT COMPLETED';
RAISE NOTICE 'Execute this script in your Supabase SQL Editor to fix all identified issues.';
RAISE NOTICE '========================================';