-- ============================================================================
-- GEMODIDA: Funciones RPC para Surveys
-- ============================================================================

DROP FUNCTION IF EXISTS public.obtener_encuestas(integer, integer) CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_encuestas(p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0)
RETURNS TABLE(
    id_encuesta integer,
    titulo text,
    descripcion text,
    estado text,
    fecha_creacion timestamp with time zone,
    total_respuestas bigint
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        s.id_encuesta,
        s.titulo,
        s.descripcion,
        s.estado,
        s.fecha_creacion,
        COUNT(sr.id_respuesta)::BIGINT AS total_respuestas
    FROM surveys s
    LEFT JOIN respuestas_encuesta sr ON s.id_encuesta = sr.id_encuesta
    GROUP BY s.id_encuesta, s.titulo, s.descripcion, s.estado, s.fecha_creacion
    ORDER BY s.fecha_creacion DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$function$;

DROP FUNCTION IF EXISTS public.obtener_respuestas_encuesta(integer) CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_respuestas_encuesta(p_id_encuesta integer)
RETURNS TABLE(
    id_respuesta integer,
    id_usuario uuid,
    respuesta_json jsonb,
    fecha_respuesta timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        sr.id_respuesta,
        sr.id_usuario,
        sr.respuesta_json,
        sr.fecha_respuesta
    FROM respuestas_encuesta sr
    WHERE sr.id_encuesta = p_id_encuesta
    ORDER BY sr.fecha_respuesta DESC;
END;
$function$;
