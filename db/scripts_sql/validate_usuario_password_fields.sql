-- Script de validación para verificar que los cambios de usuario funcionen correctamente
-- Ejecutar después de aplicar ambas migraciones

-- ============================================================================
-- 1. Verificar que las columnas nuevas existen
-- ============================================================================
DO $$
DECLARE
    v_column_exists boolean;
BEGIN
    RAISE NOTICE 'Verificando columnas nuevas en tabla usuarios...';

    -- Verificar debe_cambiar_contrasena
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'usuarios'
        AND column_name = 'debe_cambiar_contrasena'
    ) INTO v_column_exists;

    IF v_column_exists THEN
        RAISE NOTICE '✓ Columna debe_cambiar_contrasena existe';
    ELSE
        RAISE EXCEPTION '✗ Columna debe_cambiar_contrasena no existe';
    END IF;

    -- Verificar fecha_expiracion
    SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'usuarios'
        AND column_name = 'fecha_expiracion'
    ) INTO v_column_exists;

    IF v_column_exists THEN
        RAISE NOTICE '✓ Columna fecha_expiracion existe';
    ELSE
        RAISE EXCEPTION '✗ Columna fecha_expiracion no existe';
    END IF;
END;
$$;

-- ============================================================================
-- 2. Verificar que las funciones RPC existen y funcionan
-- ============================================================================
DO $$
DECLARE
    v_count integer;
    v_test_result record;
BEGIN
    RAISE NOTICE 'Verificando funciones RPC...';

    -- Verificar obtener_usuarios_completos
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'obtener_usuarios_completos';

    IF v_count > 0 THEN
        RAISE NOTICE '✓ Función obtener_usuarios_completos existe';

        -- Probar la función
        BEGIN
            SELECT * INTO v_test_result FROM obtener_usuarios_completos(1, 0) LIMIT 1;
            RAISE NOTICE '✓ Función obtener_usuarios_completos funciona correctamente';
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING '✗ Error al ejecutar obtener_usuarios_completos: %', SQLERRM;
        END;
    ELSE
        RAISE WARNING '✗ Función obtener_usuarios_completos no existe';
    END IF;

    -- Verificar actualizar_usuario
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'actualizar_usuario';

    IF v_count > 0 THEN
        RAISE NOTICE '✓ Función actualizar_usuario existe';
    ELSE
        RAISE WARNING '✗ Función actualizar_usuario no existe';
    END IF;

    -- Verificar insertar_usuario_completo
    SELECT COUNT(*) INTO v_count
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' AND p.proname = 'insertar_usuario_completo';

    IF v_count > 0 THEN
        RAISE NOTICE '✓ Función insertar_usuario_completo existe';
    ELSE
        RAISE WARNING '✗ Función insertar_usuario_completo no existe';
    END IF;
END;
$$;

-- ============================================================================
-- 3. Crear un usuario de prueba con los nuevos campos
-- ============================================================================
DO $$
DECLARE
    v_test_user_id uuid;
    v_test_result record;
BEGIN
    RAISE NOTICE 'Creando usuario de prueba con nuevos campos...';

    -- Crear usuario de prueba
    BEGIN
        SELECT * INTO v_test_result FROM insertar_usuario_completo(
            'test.usuario.nuevo@example.com',
            'Usuario de Prueba Nuevo',
            '8091234567',
            1, -- Asumiendo que existe rol con id 1
            NULL, -- Sin sucursal
            true, -- Activo
            true, -- Debe cambiar contraseña
            '2025-12-31'::date -- Fecha de expiración
        );

        IF v_test_result.success THEN
            RAISE NOTICE '✓ Usuario de prueba creado correctamente con ID: %', v_test_result.id_usuario;

            -- Verificar que se puede obtener con los nuevos campos
            SELECT debe_cambiar_contrasena, fecha_expiracion
            INTO v_test_result
            FROM usuarios
            WHERE id_usuario = v_test_result.id_usuario;

            IF v_test_result.debe_cambiar_contrasena = true AND v_test_result.fecha_expiracion = '2025-12-31'::date THEN
                RAISE NOTICE '✓ Nuevos campos se guardaron correctamente';
            ELSE
                RAISE WARNING '✗ Los nuevos campos no se guardaron correctamente';
            END IF;

            -- Limpiar usuario de prueba
            DELETE FROM usuarios WHERE id_usuario = v_test_result.id_usuario;
            RAISE NOTICE '✓ Usuario de prueba eliminado';
        ELSE
            RAISE WARNING '✗ Error al crear usuario de prueba: %', v_test_result.message;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        RAISE WARNING '✗ Error en prueba de usuario: %', SQLERRM;
    END;
END;
$$;

RAISE NOTICE 'Validación completada. Revisa los mensajes anteriores para verificar el estado.';