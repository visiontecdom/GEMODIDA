-- ============================================================================
-- GEMODIDA: Funciones RPC para Activities
-- ============================================================================

DROP FUNCTION IF EXISTS public.obtener_actividades(integer, integer) CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_actividades(p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0)
RETURNS TABLE(
    id_actividad integer,
    tipo_actividad text,
    descripcion text,
    fecha date,
    ubicacion text,
    usuario_asignado text,
    resultado text,
    creado_en timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        a.id_actividad,
        a.tipo_actividad,
        a.descripcion,
        a.fecha,
        a.ubicacion,
        u.nombre_completo,
        a.resultado,
        a.creado_en
    FROM activities a
    LEFT JOIN usuarios u ON a.id_usuario_asignado = u.id_usuario
    ORDER BY a.fecha DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$function$;

DROP FUNCTION IF EXISTS public.obtener_actividades_usuario(uuid, integer, integer) CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_actividades_usuario(p_id_usuario uuid, p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0)
RETURNS TABLE(
    id_actividad integer,
    tipo_actividad text,
    descripcion text,
    fecha date,
    ubicacion text,
    resultado text,
    creado_en timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        a.id_actividad,
        a.tipo_actividad,
        a.descripcion,
        a.fecha,
        a.ubicacion,
        a.resultado,
        a.creado_en
    FROM activities a
    WHERE a.id_usuario_asignado = p_id_usuario
    ORDER BY a.fecha DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$function$;
