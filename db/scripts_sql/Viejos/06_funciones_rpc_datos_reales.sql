-- ============================================================================
-- GEMODIDA: Funciones RPC para Recuperar Datos Reales del Dashboard
-- Fecha: 2025-11-19
-- Descripción: Funciones para obtener datos reales desde la BD
-- ============================================================================

-- ============================================================================
-- 1. OBTENER ESTADÍSTICAS DEL DASHBOARD
-- ============================================================================

DROP FUNCTION IF EXISTS public.obtener_estadisticas_dashboard() CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_estadisticas_dashboard()
RETURNS TABLE(
    total_usuarios bigint,
    usuarios_activos bigint,
    total_palabras_clave bigint,
    total_resultados bigint,
    reportes_pendientes bigint,
    alertas_activas bigint
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*)::BIGINT FROM usuarios)::BIGINT AS total_usuarios,
        (SELECT COUNT(*)::BIGINT FROM usuarios WHERE ultimo_acceso > NOW() - INTERVAL '24 hours')::BIGINT AS usuarios_activos,
        (SELECT COUNT(*)::BIGINT FROM palabras_clave)::BIGINT AS total_palabras_clave,
        (SELECT COUNT(*)::BIGINT FROM resultados)::BIGINT AS total_resultados,
        (SELECT COUNT(*)::BIGINT FROM reportes WHERE estado = 'en_proceso')::BIGINT AS reportes_pendientes,
        (SELECT COUNT(*)::BIGINT FROM logs_procesos WHERE estado = 'alerta')::BIGINT AS alertas_activas;
END;
$function$;

-- ============================================================================
-- 2. OBTENER USUARIOS ACTIVOS HOY
-- ============================================================================

DROP FUNCTION IF EXISTS public.obtener_usuarios_activos(integer) CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_usuarios_activos(p_limite integer DEFAULT 10)
RETURNS TABLE(
    id_usuario uuid,
    nombre_completo text,
    correo text,
    ultimo_acceso timestamp with time zone,
    rol_nombre text
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        u.id_usuario,
        u.nombre_completo,
        u.correo,
        u.ultimo_acceso,
        r.nombre_rol
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    WHERE u.ultimo_acceso > NOW() - INTERVAL '24 hours'
    ORDER BY u.ultimo_acceso DESC
    LIMIT p_limite;
END;
$function$;

-- ============================================================================
-- 3. OBTENER PALABRAS CLAVE RECIENTES
-- ============================================================================

DROP FUNCTION IF EXISTS public.obtener_palabras_clave_recientes(integer) CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_palabras_clave_recientes(p_limite integer DEFAULT 10)
RETURNS TABLE(
    id_palabra integer,
    palabra text,
    descripcion text,
    total_resultados bigint,
    fecha_creacion timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        pc.id_palabra,
        pc.palabra,
        pc.descripcion,
        COUNT(r.id_resultado)::BIGINT AS total_resultados,
        pc.fecha_creacion
    FROM palabras_clave pc
    LEFT JOIN resultados r ON pc.id_palabra = r.id_palabra
    GROUP BY pc.id_palabra, pc.palabra, pc.descripcion, pc.fecha_creacion
    ORDER BY pc.fecha_creacion DESC
    LIMIT p_limite;
END;
$function$;

-- ============================================================================
-- 4. OBTENER RESULTADOS RECIENTES
-- ============================================================================

DROP FUNCTION IF EXISTS public.obtener_resultados_recientes(integer) CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_resultados_recientes(p_limite integer DEFAULT 10)
RETURNS TABLE(
    id_resultado bigint,
    palabra text,
    fuente_nombre text,
    titulo text,
    autor text,
    fecha_publicacion timestamp with time zone,
    sentimiento text,
    relevancia integer
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        r.id_resultado,
        pc.palabra,
        f.nombre,
        r.titulo,
        r.autor,
        r.fecha_publicacion,
        r.sentimiento,
        r.relevancia
    FROM resultados r
    LEFT JOIN palabras_clave pc ON r.id_palabra = pc.id_palabra
    LEFT JOIN fuentes f ON r.id_fuente = f.id_fuente
    ORDER BY r.fecha_publicacion DESC
    LIMIT p_limite;
END;
$function$;

-- ============================================================================
-- 5. OBTENER REPORTES PENDIENTES
-- ============================================================================

DROP FUNCTION IF EXISTS public.obtener_reportes_pendientes(integer) CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_reportes_pendientes(p_limite integer DEFAULT 10)
RETURNS TABLE(
    id_reporte uuid,
    titulo text,
    tipo_reporte text,
    estado text,
    fecha_solicitud timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        r.id_reporte,
        r.titulo,
        r.tipo_reporte,
        r.estado,
        r.fecha_solicitud
    FROM reportes r
    WHERE r.estado = 'en_proceso'
    ORDER BY r.fecha_solicitud DESC
    LIMIT p_limite;
END;
$function$;

-- ============================================================================
-- 6. OBTENER ALERTAS ACTIVAS
-- ============================================================================

DROP FUNCTION IF EXISTS public.obtener_alertas_activas(integer) CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_alertas_activas(p_limite integer DEFAULT 10)
RETURNS TABLE(
    id_log bigint,
    tipo_proceso text,
    mensaje text,
    fecha_inicio timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        lp.id_log,
        lp.tipo_proceso,
        lp.mensaje,
        lp.fecha_inicio
    FROM logs_procesos lp
    WHERE lp.estado = 'alerta' OR lp.estado = 'error'
    ORDER BY lp.fecha_inicio DESC
    LIMIT p_limite;
END;
$function$;

-- ============================================================================
-- 7. OBTENER TODOS LOS USUARIOS (CON PAGINACIÓN)
-- ============================================================================

DROP FUNCTION IF EXISTS public.obtener_usuarios(integer, integer) CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_usuarios(p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0)
RETURNS TABLE(
    id_usuario uuid,
    nombre_completo text,
    correo text,
    rol_nombre text,
    esta_activo boolean,
    creado_en timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        u.id_usuario,
        u.nombre_completo,
        u.correo,
        r.nombre_rol,
        u.esta_activo,
        u.creado_en
    FROM usuarios u
    LEFT JOIN roles r ON u.id_rol = r.id_rol
    ORDER BY u.creado_en DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$function$;

-- ============================================================================
-- 8. OBTENER TODAS LAS PALABRAS CLAVE (CON PAGINACIÓN)
-- ============================================================================

DROP FUNCTION IF EXISTS public.obtener_palabras_clave_todas(integer, integer) CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_palabras_clave_todas(p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0)
RETURNS TABLE(
    id_palabra integer,
    palabra text,
    descripcion text,
    total_resultados bigint,
    es_publica boolean,
    fecha_creacion timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        pc.id_palabra,
        pc.palabra,
        pc.descripcion,
        COUNT(r.id_resultado)::BIGINT AS total_resultados,
        pc.es_publica,
        pc.fecha_creacion
    FROM palabras_clave pc
    LEFT JOIN resultados r ON pc.id_palabra = r.id_palabra
    GROUP BY pc.id_palabra, pc.palabra, pc.descripcion, pc.es_publica, pc.fecha_creacion
    ORDER BY pc.fecha_creacion DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$function$;

-- ============================================================================
-- 9. OBTENER TODOS LOS RESULTADOS (CON PAGINACIÓN Y FILTROS)
-- ============================================================================

DROP FUNCTION IF EXISTS public.obtener_resultados_todos(integer, integer, integer, text) CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_resultados_todos(
    p_limite integer DEFAULT 10,
    p_desplazamiento integer DEFAULT 0,
    p_id_palabra integer DEFAULT NULL,
    p_sentimiento text DEFAULT NULL
)
RETURNS TABLE(
    id_resultado bigint,
    palabra text,
    fuente_nombre text,
    titulo text,
    autor text,
    fecha_publicacion timestamp with time zone,
    sentimiento text,
    relevancia integer
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        r.id_resultado,
        pc.palabra,
        f.nombre,
        r.titulo,
        r.autor,
        r.fecha_publicacion,
        r.sentimiento,
        r.relevancia
    FROM resultados r
    LEFT JOIN palabras_clave pc ON r.id_palabra = pc.id_palabra
    LEFT JOIN fuentes f ON r.id_fuente = f.id_fuente
    WHERE (p_id_palabra IS NULL OR r.id_palabra = p_id_palabra)
      AND (p_sentimiento IS NULL OR r.sentimiento = p_sentimiento)
    ORDER BY r.fecha_publicacion DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$function$;

-- ============================================================================
-- 10. OBTENER TODOS LOS REPORTES (CON PAGINACIÓN)
-- ============================================================================

DROP FUNCTION IF EXISTS public.obtener_reportes_todos(integer, integer) CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_reportes_todos(p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0)
RETURNS TABLE(
    id_reporte uuid,
    titulo text,
    tipo_reporte text,
    estado text,
    fecha_solicitud timestamp with time zone,
    fecha_completado timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        r.id_reporte,
        r.titulo,
        r.tipo_reporte,
        r.estado,
        r.fecha_solicitud,
        r.fecha_completado
    FROM reportes r
    ORDER BY r.fecha_solicitud DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$function$;

-- ============================================================================
-- 11. OBTENER TODOS LOS LOGS (CON PAGINACIÓN Y FILTROS)
-- ============================================================================

DROP FUNCTION IF EXISTS public.obtener_logs_todos(integer, integer, text) CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_logs_todos(
    p_limite integer DEFAULT 10,
    p_desplazamiento integer DEFAULT 0,
    p_tipo_proceso text DEFAULT NULL
)
RETURNS TABLE(
    id_log bigint,
    tipo_proceso text,
    estado text,
    mensaje text,
    fecha_inicio timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        lp.id_log,
        lp.tipo_proceso,
        lp.estado,
        lp.mensaje,
        lp.fecha_inicio
    FROM logs_procesos lp
    WHERE (p_tipo_proceso IS NULL OR lp.tipo_proceso = p_tipo_proceso)
    ORDER BY lp.fecha_inicio DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$function$;

-- ============================================================================
-- 12. CONTAR TOTAL DE REGISTROS
-- ============================================================================

DROP FUNCTION IF EXISTS public.contar_registros(text) CASCADE;

CREATE OR REPLACE FUNCTION public.contar_registros(p_tabla text)
RETURNS bigint
LANGUAGE plpgsql
AS $function$
DECLARE
    v_count bigint;
BEGIN
    EXECUTE 'SELECT COUNT(*) FROM ' || quote_ident(p_tabla) INTO v_count;
    RETURN v_count;
END;
$function$;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
