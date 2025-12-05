-- Script de verificación para Matriz de Soporte
-- Ejecutar este script para verificar que todo está configurado correctamente

-- ============================================================================
-- PARTE 1: Verificar que las tablas existen
-- ============================================================================
DO $$
DECLARE
    v_count integer;
BEGIN
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'VERIFICACIÓN DE TABLAS';
    RAISE NOTICE '============================================================================';
    
    -- Verificar tabla usuarios
    SELECT COUNT(*) INTO v_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'usuarios';
    
    IF v_count > 0 THEN
        SELECT COUNT(*) INTO v_count FROM public.usuarios;
        RAISE NOTICE '✓ Tabla usuarios existe con % registros', v_count;
    ELSE
        RAISE WARNING '✗ Tabla usuarios NO existe';
    END IF;
    
    -- Verificar tabla usuarios_roles
    SELECT COUNT(*) INTO v_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'usuarios_roles';
    
    IF v_count > 0 THEN
        SELECT COUNT(*) INTO v_count FROM public.usuarios_roles;
        RAISE NOTICE '✓ Tabla usuarios_roles existe con % registros', v_count;
    ELSE
        RAISE WARNING '✗ Tabla usuarios_roles NO existe';
    END IF;
    
    -- Verificar tabla sucursales
    SELECT COUNT(*) INTO v_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'sucursales';
    
    IF v_count > 0 THEN
        SELECT COUNT(*) INTO v_count FROM public.sucursales;
        RAISE NOTICE '✓ Tabla sucursales existe con % registros', v_count;
    ELSE
        RAISE WARNING '✗ Tabla sucursales NO existe';
    END IF;
    
    -- Verificar tabla configuraciones_sistema
    SELECT COUNT(*) INTO v_count
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'configuraciones_sistema';
    
    IF v_count > 0 THEN
        SELECT COUNT(*) INTO v_count FROM public.configuraciones_sistema;
        RAISE NOTICE '✓ Tabla configuraciones_sistema existe con % registros', v_count;
    ELSE
        RAISE WARNING '✗ Tabla configuraciones_sistema NO existe';
    END IF;
END $$;

-- ============================================================================
-- PARTE 2: Verificar que las funciones RPC existen
-- ============================================================================
DO $$
DECLARE
    v_count integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'VERIFICACIÓN DE FUNCIONES RPC';
    RAISE NOTICE '============================================================================';
    
    -- Verificar obtener_usuarios_completos
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'obtener_usuarios_completos';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ Función obtener_usuarios_completos existe';
    ELSE
        RAISE WARNING '✗ Función obtener_usuarios_completos NO existe';
    END IF;
    
    -- Verificar obtener_roles_todos
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'obtener_roles_todos';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ Función obtener_roles_todos existe';
    ELSE
        RAISE WARNING '✗ Función obtener_roles_todos NO existe';
    END IF;
    
    -- Verificar obtener_configuraciones_sistema
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'obtener_configuraciones_sistema';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ Función obtener_configuraciones_sistema existe';
    ELSE
        RAISE WARNING '✗ Función obtener_configuraciones_sistema NO existe';
    END IF;
    
    -- Verificar actualizar_usuario
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'actualizar_usuario';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ Función actualizar_usuario existe';
    ELSE
        RAISE WARNING '✗ Función actualizar_usuario NO existe';
    END IF;
END $$;

-- ============================================================================
-- PARTE 3: Probar las funciones RPC
-- ============================================================================
DO $$
DECLARE
    v_count integer;
    v_result record;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'PRUEBA DE FUNCIONES RPC';
    RAISE NOTICE '============================================================================';
    
    -- Probar obtener_usuarios_completos
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM public.obtener_usuarios_completos(10, 0);
        RAISE NOTICE '✓ obtener_usuarios_completos() funciona correctamente (% usuarios)', v_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '✗ Error al ejecutar obtener_usuarios_completos(): %', SQLERRM;
    END;
    
    -- Probar obtener_roles_todos
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM public.obtener_roles_todos();
        RAISE NOTICE '✓ obtener_roles_todos() funciona correctamente (% roles)', v_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '✗ Error al ejecutar obtener_roles_todos(): %', SQLERRM;
    END;
    
    -- Probar obtener_configuraciones_sistema
    BEGIN
        SELECT COUNT(*) INTO v_count
        FROM public.obtener_configuraciones_sistema();
        RAISE NOTICE '✓ obtener_configuraciones_sistema() funciona correctamente (% configs)', v_count;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '✗ Error al ejecutar obtener_configuraciones_sistema(): %', SQLERRM;
    END;
END $$;

-- ============================================================================
-- PARTE 4: Verificar permisos
-- ============================================================================
DO $$
DECLARE
    v_count integer;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'VERIFICACIÓN DE PERMISOS';
    RAISE NOTICE '============================================================================';
    
    -- Verificar permisos en obtener_usuarios_completos
    SELECT COUNT(*) INTO v_count
    FROM information_schema.routine_privileges
    WHERE routine_schema = 'public' 
    AND routine_name = 'obtener_usuarios_completos'
    AND grantee = 'authenticated';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ Permisos EXECUTE otorgados a authenticated para obtener_usuarios_completos';
    ELSE
        RAISE WARNING '✗ Falta permiso EXECUTE para authenticated en obtener_usuarios_completos';
    END IF;
    
    -- Verificar permisos en obtener_roles_todos
    SELECT COUNT(*) INTO v_count
    FROM information_schema.routine_privileges
    WHERE routine_schema = 'public' 
    AND routine_name = 'obtener_roles_todos'
    AND grantee = 'authenticated';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ Permisos EXECUTE otorgados a authenticated para obtener_roles_todos';
    ELSE
        RAISE WARNING '✗ Falta permiso EXECUTE para authenticated en obtener_roles_todos';
    END IF;
    
    -- Verificar permisos en obtener_configuraciones_sistema
    SELECT COUNT(*) INTO v_count
    FROM information_schema.routine_privileges
    WHERE routine_schema = 'public' 
    AND routine_name = 'obtener_configuraciones_sistema'
    AND grantee = 'authenticated';
    
    IF v_count > 0 THEN
        RAISE NOTICE '✓ Permisos EXECUTE otorgados a authenticated para obtener_configuraciones_sistema';
    ELSE
        RAISE WARNING '✗ Falta permiso EXECUTE para authenticated en obtener_configuraciones_sistema';
    END IF;
END $$;

-- ============================================================================
-- PARTE 5: Mostrar datos de ejemplo
-- ============================================================================
RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'DATOS DE EJEMPLO';
RAISE NOTICE '============================================================================';

-- Mostrar primeros 3 usuarios
RAISE NOTICE '';
RAISE NOTICE 'Primeros 3 usuarios:';
SELECT 
    id_usuario,
    correo,
    nombre_completo,
    nombre_rol,
    nombre_sucursal
FROM public.obtener_usuarios_completos(3, 0);

-- Mostrar todos los roles
RAISE NOTICE '';
RAISE NOTICE 'Roles disponibles:';
SELECT 
    codigo_rol,
    nombre_rol,
    nivel_acceso,
    total_usuarios
FROM public.obtener_roles_todos();

-- ============================================================================
-- RESUMEN FINAL
-- ============================================================================
RAISE NOTICE '';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'VERIFICACIÓN COMPLETADA';
RAISE NOTICE '============================================================================';
RAISE NOTICE 'Si todos los checks muestran ✓, la configuración es correcta.';
RAISE NOTICE 'Si hay ✗, ejecutar: db/scripts_sql/verificar_y_crear_funciones_matriz.sql';
RAISE NOTICE '============================================================================';
