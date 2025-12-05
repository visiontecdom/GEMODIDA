-- ============================================================================
-- GEMODIDA - Script Consolidado para Ejecutar Todas las Migraciones
-- ============================================================================
-- IMPORTANTE: Ejecutar este script en Supabase para completar la implementación
-- Fecha: 2025-11-22
-- Versión: Consolidada con fixes aplicados

-- ============================================================================
-- 1. EJECUTAR SCRIPTS PREVIOS (Ejecutar manualmente antes de continuar)
-- ============================================================================
-- \i 10_tablas_faltantes_sistema_roles.sql
-- \i 11_datos_iniciales_sistema.sql  
-- \i 12_funciones_rpc_avanzadas.sql
-- \i 13_politicas_rls_avanzadas.sql

-- ============================================================================
-- 2. EJECUTAR MIGRACIÓN DE ROLE IDs (CRÍTICO)
-- ============================================================================
-- El script de migración de roles ya fue preparado y debe ejecutarse
-- \i ../../migration_scripts/role_id_migration.sql

-- ============================================================================
-- 3. VERIFICACIÓN DE TABLAS REQUERIDAS
-- ============================================================================
DO $$
DECLARE
    tabla_faltante TEXT;
    tablas_requeridas TEXT[] := ARRAY[
        'usuarios_grupos',
        'usuarios_roles', 
        'usuarios_asignaciones',  -- FIXED: Era 'asignaciones_usuario'
        'planificacion_trabajos',
        'tareas_planificacion',
        'diseno_encuestas',
        'respuestas_encuestas_personalizadas',
        'notificaciones_sistema',
        'configuracion_scraping'
    ];
BEGIN
    FOREACH tabla_faltante IN ARRAY tablas_requeridas
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = tabla_faltante
        ) THEN
            RAISE EXCEPTION 'Tabla faltante: %', tabla_faltante;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Todas las tablas requeridas están presentes';
END $$;

-- ============================================================================
-- 4. VERIFICACIÓN DE FUNCIONES RPC CRÍTICAS
-- ============================================================================
DO $$
DECLARE
    funcion_faltante TEXT;
    funciones_requeridas TEXT[] := ARRAY[
        'crear_usuario_completo',
        'obtener_permisos_usuario',
        'crear_planificacion_trabajo',
        'crear_encuesta_personalizada',
        'obtener_notificaciones_usuario',
        'marcar_notificacion_leida',
        'actualizar_estadisticas_palabra'
    ];
BEGIN
    FOREACH funcion_faltante IN ARRAY funciones_requeridas
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_schema = 'public' 
            AND routine_name = funcion_faltante
        ) THEN
            RAISE EXCEPTION 'Función RPC faltante: %', funcion_faltante;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ Todas las funciones RPC requeridas están presentes';
END $$;

-- ============================================================================
-- 5. VERIFICACIÓN DE TABLA respuestas_encuesta (NOMBRE ACTUALIZADO)
-- ============================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'respuestas_encuesta'
    ) THEN
        RAISE EXCEPTION 'Tabla respuestas_encuesta no encontrada (era survey_responses)';
    END IF;
    
    RAISE NOTICE '✅ Tabla respuestas_encuesta existe correctamente';
END $$;

-- ============================================================================
-- 6. VERIFICACIÓN DE ROLES ACTUALIZADOS
-- ============================================================================
DO $$
DECLARE
    expected_roles INTEGER;
    actual_roles INTEGER;
BEGIN
    -- Verificar que tenemos los 9 roles esperados con IDs 1-9
    SELECT COUNT(*) INTO actual_roles
    FROM public.usuarios_roles 
    WHERE id_rol BETWEEN 1 AND 9;
    
    IF actual_roles != 9 THEN
        RAISE EXCEPTION 'Se esperaban 9 roles con IDs 1-9, pero se encontraron: %', actual_roles;
    END IF;
    
    RAISE NOTICE '✅ Los 9 roles están correctamente configurados con IDs 1-9';
END $$;

-- ============================================================================
-- 7. LOG FINAL DE MIGRACIÓN EXITOSA
-- ============================================================================
INSERT INTO public.ddl_migrations_log (mensaje) VALUES 
('GEMODIDA - Migración completa ejecutada exitosamente. Sistema listo para producción.');

-- ============================================================================
-- 8. MOSTRAR RESUMEN DEL SISTEMA
-- ============================================================================
SELECT 
    'RESUMEN DEL SISTEMA GEMODIDA' as titulo,
    (SELECT COUNT(*) FROM public.usuarios_grupos) as grupos_disponibles,
    (SELECT COUNT(*) FROM public.usuarios_roles) as roles_disponibles,
    (SELECT COUNT(*) FROM public.sucursales) as sucursales_activas,
    (SELECT COUNT(*) FROM public.fuentes WHERE esta_activa = true) as fuentes_scraping,
    (SELECT COUNT(*) FROM public.configuraciones_sistema) as configuraciones_sistema,
    (SELECT COUNT(*) FROM public.respuestas_encuesta) as respuestas_encuesta_count;

-- ============================================================================
-- 9. VERIFICACIÓN FINAL DE MIGRACIÓN
-- ============================================================================
DO $$
DECLARE
    v_status TEXT;
BEGIN
    SELECT 
        CASE 
            WHEN COUNT(*) = 9 THEN 'EXITOSA'
            ELSE 'REQUIERE ATENCIÓN'
        END INTO v_status
    FROM public.usuarios_roles 
    WHERE id_rol BETWEEN 1 AND 9;
    
    RAISE NOTICE '=== ESTADO FINAL DE MIGRACIÓN: % ===', v_status;
    
    IF v_status = 'EXITOSA' THEN
        RAISE NOTICE '🎉 GEMODIDA está listo para producción';
    ELSE
        RAISE NOTICE '⚠️  Se requiere revisión adicional del sistema de roles';
    END IF;
END $$;

-- ============================================================================
-- FIN DEL SCRIPT DE EJECUCIÓN COMPLETA
-- ============================================================================