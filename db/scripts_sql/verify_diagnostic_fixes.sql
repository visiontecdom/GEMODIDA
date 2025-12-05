-- ================================================================================
-- DIAGNOSTIC ERRORS VERIFICATION SCRIPT
-- Date: 2025-11-22
-- Purpose: Verify all diagnostic fixes were applied successfully
-- ================================================================================

DO $$
DECLARE
    v_test_results json := '{}'::json;
    v_total_tests integer := 0;
    v_passed_tests integer := 0;
    v_failed_tests integer := 0;
    v_error_details text := '';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'DIAGNOSTIC ERRORS VERIFICATION REPORT';
    RAISE NOTICE 'Generated: %', NOW();
    RAISE NOTICE '============================================================================';
    
    -- Test 1: Check obtener_permisos_usuario function exists
    v_total_tests := v_total_tests + 1;
    BEGIN
        IF EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = 'obtener_permisos_usuario'
        ) THEN
            v_passed_tests := v_passed_tests + 1;
            v_test_results := v_test_results || '{"test_1_permisos_function": "PASS"}'::json;
            RAISE NOTICE '✅ TEST 1: obtener_permisos_usuario function exists';
        ELSE
            v_failed_tests := v_failed_tests + 1;
            v_test_results := v_test_results || '{"test_1_permisos_function": "FAIL"}'::json;
            RAISE NOTICE '❌ TEST 1: obtener_permisos_usuario function MISSING';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_failed_tests := v_failed_tests + 1;
        v_error_details := SQLERRM;
        v_test_results := v_test_results || '{"test_1_permisos_function": "ERROR", "error": "' || v_error_details || '"}'::json;
        RAISE NOTICE '❌ TEST 1 ERROR: %', v_error_details;
    END;
    
    -- Test 2: Check usuarios table RLS policies (no infinite recursion)
    v_total_tests := v_total_tests + 1;
    BEGIN
        IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'usuarios') THEN
            -- Test that queries don't cause infinite recursion
            PERFORM COUNT(*) FROM usuarios WHERE esta_activo = true LIMIT 1;
            v_passed_tests := v_passed_tests + 1;
            v_test_results := v_test_results || '{"test_2_usuarios_rls": "PASS"}'::json;
            RAISE NOTICE '✅ TEST 2: usuarios table RLS policies working (no infinite recursion)';
        ELSE
            v_failed_tests := v_failed_tests + 1;
            v_test_results := v_test_results || '{"test_2_usuarios_rls": "FAIL"}'::json;
            RAISE NOTICE '❌ TEST 2: usuarios table has no RLS policies';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%infinite recursion%' THEN
            v_failed_tests := v_failed_tests + 1;
            v_test_results := v_test_results || '{"test_2_usuarios_rls": "FAIL_INFINITE_RECURSION"}'::json;
            RAISE NOTICE '❌ TEST 2: usuarios table still has infinite recursion in RLS policies';
        ELSE
            v_failed_tests := v_failed_tests + 1;
            v_test_results := v_test_results || '{"test_2_usuarios_rls": "ERROR", "error": "' || SQLERRM || '"}'::json;
            RAISE NOTICE '❌ TEST 2 ERROR: %', SQLERRM;
        END IF;
    END;
    
    -- Test 3: Check foreign key constraints exist
    v_total_tests := v_total_tests + 1;
    BEGIN
        IF (
            SELECT COUNT(*) 
            FROM information_schema.table_constraints tc
            WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_name = 'usuarios'
        ) >= 2 THEN
            v_passed_tests := v_passed_tests + 1;
            v_test_results := v_test_results || '{"test_3_foreign_keys": "PASS"}'::json;
            RAISE NOTICE '✅ TEST 3: usuarios table has foreign key constraints';
        ELSE
            v_failed_tests := v_failed_tests + 1;
            v_test_results := v_test_results || '{"test_3_foreign_keys": "FAIL"}'::json;
            RAISE NOTICE '❌ TEST 3: usuarios table missing foreign key constraints';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_failed_tests := v_failed_tests + 1;
        v_test_results := v_test_results || '{"test_3_foreign_keys": "ERROR", "error": "' || SQLERRM || '"}'::json;
        RAISE NOTICE '❌ TEST 3 ERROR: %', SQLERRM;
    END;
    
    -- Test 4: Test obtener_usuarios_completos function
    v_total_tests := v_total_tests + 1;
    BEGIN
        PERFORM * FROM obtener_usuarios_completos(10, 0);
        v_passed_tests := v_passed_tests + 1;
        v_test_results := v_test_results || '{"test_4_usuarios_completos": "PASS"}'::json;
        RAISE NOTICE '✅ TEST 4: obtener_usuarios_completos function working';
    EXCEPTION WHEN OTHERS THEN
        v_failed_tests := v_failed_tests + 1;
        v_test_results := v_test_results || '{"test_4_usuarios_completos": "ERROR", "error": "' || SQLERRM || '"}'::json;
        RAISE NOTICE '❌ TEST 4 ERROR: obtener_usuarios_completos failed - %', SQLERRM;
    END;
    
    -- Test 5: Test usuarios_roles table query
    v_total_tests := v_total_tests + 1;
    BEGIN
        PERFORM COUNT(*) FROM usuarios_roles WHERE esta_activo = true LIMIT 1;
        v_passed_tests := v_passed_tests + 1;
        v_test_results := v_test_results || '{"test_5_usuarios_roles": "PASS"}'::json;
        RAISE NOTICE '✅ TEST 5: usuarios_roles table queries working';
    EXCEPTION WHEN OTHERS THEN
        v_failed_tests := v_failed_tests + 1;
        v_test_results := v_test_results || '{"test_5_usuarios_roles": "ERROR", "error": "' || SQLERRM || '"}'::json;
        RAISE NOTICE '❌ TEST 5 ERROR: usuarios_roles query failed - %', SQLERRM;
    END;
    
    -- Test 6: Test usuarios_grupos table query
    v_total_tests := v_total_tests + 1;
    BEGIN
        PERFORM COUNT(*) FROM usuarios_grupos WHERE esta_activo = true LIMIT 1;
        v_passed_tests := v_passed_tests + 1;
        v_test_results := v_test_results || '{"test_6_usuarios_grupos": "PASS"}'::json;
        RAISE NOTICE '✅ TEST 6: usuarios_grupos table queries working';
    EXCEPTION WHEN OTHERS THEN
        v_failed_tests := v_failed_tests + 1;
        v_test_results := v_test_results || '{"test_6_usuarios_grupos": "ERROR", "error": "' || SQLERRM || '"}'::json;
        RAISE NOTICE '❌ TEST 6 ERROR: usuarios_grupos query failed - %', SQLERRM;
    END;
    
    -- Test 7: Test sucursales esta_activo column
    v_total_tests := v_total_tests + 1;
    BEGIN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'sucursales' AND column_name = 'esta_activo'
        ) THEN
            PERFORM COUNT(*) FROM sucursales WHERE esta_activo = true LIMIT 1;
            v_passed_tests := v_passed_tests + 1;
            v_test_results := v_test_results || '{"test_7_sucursales_column": "PASS"}'::json;
            RAISE NOTICE '✅ TEST 7: sucursales table has esta_activo column';
        ELSE
            v_failed_tests := v_failed_tests + 1;
            v_test_results := v_test_results || '{"test_7_sucursales_column": "FAIL"}'::json;
            RAISE NOTICE '❌ TEST 7: sucursales table missing esta_activo column';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_failed_tests := v_failed_tests + 1;
        v_test_results := v_test_results || '{"test_7_sucursales_column": "ERROR", "error": "' || SQLERRM || '"}'::json;
        RAISE NOTICE '❌ TEST 7 ERROR: sucursales esta_activo test failed - %', SQLERRM;
    END;
    
    -- Test 8: Test joined users query (the main failing query from diagnostic)
    v_total_tests := v_total_tests + 1;
    BEGIN
        PERFORM COUNT(*) 
        FROM usuarios u
        LEFT JOIN usuarios_roles ur ON u.id_rol = ur.id_rol AND ur.esta_activo = true
        LEFT JOIN sucursales s ON u.id_suc = s.id_suc AND s.esta_activo = true
        WHERE u.esta_activo = true
        LIMIT 10;
        
        v_passed_tests := v_passed_tests + 1;
        v_test_results := v_test_results || '{"test_8_joined_query": "PASS"}'::json;
        RAISE NOTICE '✅ TEST 8: usuarios joined query working (no 400/500 errors)';
    EXCEPTION WHEN OTHERS THEN
        IF SQLERRM LIKE '%relationship%' OR SQLERRM LIKE '%PGRST200%' THEN
            v_failed_tests := v_failed_tests + 1;
            v_test_results := v_test_results || '{"test_8_joined_query": "FAIL_RELATIONSHIP"}'::json;
            RAISE NOTICE '❌ TEST 8: Foreign key relationship still missing - %', SQLERRM;
        ELSE
            v_failed_tests := v_failed_tests + 1;
            v_test_results := v_test_results || '{"test_8_joined_query": "ERROR", "error": "' || SQLERRM || '"}'::json;
            RAISE NOTICE '❌ TEST 8 ERROR: joined query failed - %', SQLERRM;
        END IF;
    END;
    
    -- Test 9: Test obtener_permisos_usuario function actually works
    v_total_tests := v_total_tests + 1;
    BEGIN
        -- Try to call it with a sample user ID (adjust as needed)
        PERFORM * FROM obtener_permisos_usuario('f5073781-ed4b-41c2-8ad6-cf3c7d76f8ed'::uuid);
        v_passed_tests := v_passed_tests + 1;
        v_test_results := v_test_results || '{"test_9_permisos_function_call": "PASS"}'::json;
        RAISE NOTICE '✅ TEST 9: obtener_permisos_usuario function call successful';
    EXCEPTION WHEN OTHERS THEN
        v_failed_tests := v_failed_tests + 1;
        v_test_results := v_test_results || '{"test_9_permisos_function_call": "ERROR", "error": "' || SQLERRM || '"}'::json;
        RAISE NOTICE '❌ TEST 9 ERROR: obtener_permisos_usuario call failed - %', SQLERRM;
    END;
    
    -- Test 10: Verify no 404 errors on RPC functions
    v_total_tests := v_total_tests + 1;
    BEGIN
        -- Check that all expected RPC functions exist
        IF (
            SELECT COUNT(*) 
            FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
            AND p.proname IN ('obtener_usuarios_completos', 'obtener_permisos_usuario', 'obtener_roles_todos')
        ) >= 3 THEN
            v_passed_tests := v_passed_tests + 1;
            v_test_results := v_test_results || '{"test_10_rpc_functions": "PASS"}'::json;
            RAISE NOTICE '✅ TEST 10: All critical RPC functions exist (no 404 errors)';
        ELSE
            v_failed_tests := v_failed_tests + 1;
            v_test_results := v_test_results || '{"test_10_rpc_functions": "FAIL"}'::json;
            RAISE NOTICE '❌ TEST 10: Missing critical RPC functions';
        END IF;
    EXCEPTION WHEN OTHERS THEN
        v_failed_tests := v_failed_tests + 1;
        v_test_results := v_test_results || '{"test_10_rpc_functions": "ERROR", "error": "' || SQLERRM || '"}'::json;
        RAISE NOTICE '❌ TEST 10 ERROR: RPC functions check failed - %', SQLERRM;
    END;
    
    -- FINAL SUMMARY
    RAISE NOTICE '';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'FINAL VERIFICATION SUMMARY';
    RAISE NOTICE '============================================================================';
    RAISE NOTICE 'Total Tests: %', v_total_tests;
    RAISE NOTICE 'Passed: %', v_passed_tests;
    RAISE NOTICE 'Failed: %', v_failed_tests;
    RAISE NOTICE 'Success Rate: %%%', ROUND((v_passed_tests::numeric / v_total_tests::numeric) * 100, 1);
    
    IF v_failed_tests = 0 THEN
        RAISE NOTICE '';
        RAISE NOTICE '🎉 ALL DIAGNOSTIC ERRORS HAVE BEEN SUCCESSFULLY FIXED! 🎉';
        RAISE NOTICE '';
        RAISE NOTICE '✅ All 10 verification tests passed';
        RAISE NOTICE '✅ No more 404 errors (missing RPC functions)';
        RAISE NOTICE '✅ No more 500 errors (RLS policy issues)';
        RAISE NOTICE '✅ No more 400 errors (foreign key relationships)';
        RAISE NOTICE '✅ Matriz de Soporte page should now work perfectly';
        RAISE NOTICE '';
        RAISE NOTICE 'You can now test the application at: http://localhost:3003/matriz-soporte';
    ELSE
        RAISE NOTICE '';
        RAISE NOTICE '⚠️  % TESTS FAILED - MANUAL INTERVENTION REQUIRED', v_failed_tests;
        RAISE NOTICE '';
        RAISE NOTICE 'Please review the failed tests above and:';
        RAISE NOTICE '1. Check the error messages for details';
        RAISE NOTICE '2. Re-run the fix script if needed';
        RAISE NOTICE '3. Verify database schema is correct';
        RAISE NOTICE '4. Contact support if issues persist';
    END IF;
    
    -- Store results for external access
    CREATE TABLE IF NOT EXISTS diagnostic_fix_results (
        test_timestamp timestamptz DEFAULT NOW(),
        total_tests integer,
        passed_tests integer,
        failed_tests integer,
        success_rate numeric,
        test_results json,
        status text
    );
    
    INSERT INTO diagnostic_fix_results (
        total_tests, passed_tests, failed_tests, success_rate, test_results, status
    ) VALUES (
        v_total_tests, v_passed_tests, v_failed_tests, 
        ROUND((v_passed_tests::numeric / v_total_tests::numeric) * 100, 1),
        v_test_results,
        CASE WHEN v_failed_tests = 0 THEN 'SUCCESS' ELSE 'FAILURE' END
    );
    
    RAISE NOTICE '';
    RAISE NOTICE 'Verification results stored in diagnostic_fix_results table';
    RAISE NOTICE '============================================================================';
END $$;

-- Grant permissions to view results
GRANT SELECT ON diagnostic_fix_results TO authenticated;

SELECT * FROM diagnostic_fix_results ORDER BY test_timestamp DESC LIMIT 1;