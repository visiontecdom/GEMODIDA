-- ============================================================================
-- GEMODIDA - Script Consolidado para Ejecutar Todas las Migraciones
-- ============================================================================
-- IMPORTANTE: Ejecutar este script en Supabase para completar la implementación


-- Ejecuta manualmente el contenido de 10_tablas_faltantes_sistema_roles.sql antes de continuar.


-- Ejecuta manualmente el contenido de 11_datos_iniciales_sistema.sql antes de continuar.


-- Ejecuta manualmente el contenido de 12_funciones_rpc_avanzadas.sql antes de continuar.


-- Ejecuta manualmente el contenido de 13_politicas_rls_avanzadas.sql antes de continuar.

-- Verificación final: Comprobar que todas las tablas existen
DO $$
DECLARE
    tabla_faltante TEXT;
    tablas_requeridas TEXT[] := ARRAY[
        'usuarios_grupos',
        'usuarios_roles', 
        'asignaciones_usuario',
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
    
    RAISE NOTICE 'Todas las tablas requeridas están presentes';
END $$;

-- Verificación de funciones RPC críticas
DO $$
DECLARE
    funcion_faltante TEXT;
    funciones_requeridas TEXT[] := ARRAY[
        'crear_usuario_completo',
        'obtener_permisos_usuario',
        'crear_planificacion_trabajo',
        'crear_encuesta_personalizada',
        'obtener_notificaciones_usuario',
        'marcar_notificacion_leida'
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
    
    RAISE NOTICE 'Todas las funciones RPC requeridas están presentes';
END $$;

-- Log final de migración exitosa
INSERT INTO public.ddl_migrations_log (mensaje) VALUES 
('GEMODIDA - Migración completa ejecutada exitosamente. Sistema listo para producción.');

-- Mostrar resumen del sistema
SELECT 
    'RESUMEN DEL SISTEMA GEMODIDA' as titulo,
    (SELECT COUNT(*) FROM public.usuarios_grupos) as grupos_disponibles,
    (SELECT COUNT(*) FROM public.usuarios_roles) as roles_disponibles,
    (SELECT COUNT(*) FROM public.sucursales) as sucursales_activas,
    (SELECT COUNT(*) FROM public.fuentes WHERE esta_activa = true) as fuentes_scraping,
    (SELECT COUNT(*) FROM public.configuraciones_sistema) as configuraciones_sistema;