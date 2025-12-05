-- =====================================================
-- GEMODIDA - SCRIPT DE ELIMINACIÓN CON CASCADE
-- Versión: 2.0
-- Descripción: Elimina todas las tablas del esquema actual para permitir recrearlas con las traducciones aplicadas
-- =====================================================

-- Eliminar funciones primero (en orden inverso de dependencia)
DROP FUNCTION IF EXISTS public.actualizar_estadisticas_palabra(integer) CASCADE;
DROP FUNCTION IF EXISTS public.buscar_palabras_clave(text, uuid, integer, integer) CASCADE;
DROP FUNCTION IF EXISTS public.generar_reporte(text, text, text, jsonb, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.limpiar_logs_antiguos(integer) CASCADE;
DROP FUNCTION IF EXISTS public.log_proceso(character varying, character varying, text, text, uuid, jsonb, inet) CASCADE;
DROP FUNCTION IF EXISTS public.obtener_estadisticas_palabra(integer, timestamp with time zone, timestamp with time zone) CASCADE;
DROP FUNCTION IF EXISTS public.obtener_estadisticas_por_periodo(integer, character varying, integer) CASCADE;
DROP FUNCTION IF EXISTS public.actualizar_columna_actualizado_en() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- Eliminar políticas RLS primero (en orden de dependencias)
DROP POLICY IF EXISTS "Los administradores pueden gestionar usuarios" ON public.usuarios CASCADE;
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON public.usuarios CASCADE;
DROP POLICY IF EXISTS "Los usuarios pueden eliminar sus propias palabras clave" ON public.palabras_clave CASCADE;
DROP POLICY IF EXISTS "Los usuarios pueden editar sus propias palabras clave" ON public.palabras_clave CASCADE;
DROP POLICY IF EXISTS "Los usuarios pueden crear palabras clave" ON public.palabras_clave CASCADE;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propias palabras clave" ON public.palabras_clave CASCADE;
DROP POLICY IF EXISTS "Los usuarios pueden crear reportes" ON public.reportes CASCADE;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios reportes" ON public.reportes CASCADE;

-- Eliminar tablas (en orden inverso de dependencias)
DROP TABLE IF EXISTS public.reportes CASCADE;
DROP TABLE IF EXISTS public.estadisticas CASCADE;
DROP TABLE IF EXISTS public.resultados CASCADE;
DROP TABLE IF EXISTS public.logs_procesos CASCADE;
DROP TABLE IF EXISTS public.configuraciones_sistema CASCADE;
DROP TABLE IF EXISTS public.palabras_clave CASCADE;
DROP TABLE IF EXISTS public.fuentes CASCADE;
DROP TABLE IF EXISTS public.categorias_fuentes CASCADE;
DROP TABLE IF EXISTS public.perfiles CASCADE;
DROP TABLE IF EXISTS public.perfiles_usuarios CASCADE;
DROP TABLE IF EXISTS public.usuarios CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;

-- =====================================================
-- Confirmación de eliminación
-- =====================================================

-- Verificar que todas las tablas han sido eliminadas
SELECT 
    schemaname, 
    tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;