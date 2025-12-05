-- =====================================================
-- GEMODIDA - FUNCIONES PUBLICAS TRADUCIDAS AL ESPAÑOL
-- Versión: 2.1
-- Descripción: Funciones RPC con nombres y comentarios en español
-- Corrección: Formato de funciones largas corregido
-- =====================================================

-- public.actualizar_estadisticas_palabra(p_id_palabra integer)
CREATE OR REPLACE FUNCTION public.actualizar_estadisticas_palabra(p_id_palabra integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_fecha_inicio TIMESTAMP WITH TIME ZONE;
    v_fecha_fin TIMESTAMP WITH TIME ZONE;
    v_total_resultados INTEGER;
    v_promedio_sentimiento NUMERIC(5,2);
    v_tendencia NUMERIC(5,2);
BEGIN
    -- Establecer el período de tiempo (últimas 24 horas)
    v_fecha_fin := NOW();
    v_fecha_inicio := v_fecha_fin - INTERVAL '24 hours';
    
    -- Calcular estadísticas
    SELECT 
        COUNT(*),
        AVG(
            CASE 
                WHEN sentimiento = 'positivo' THEN 1.0
                WHEN sentimiento = 'negativo' THEN -1.0
                ELSE 0.0
            END
        )
    INTO 
        v_total_resultados,
        v_promedio_sentimiento
    FROM 
        resultados 
    WHERE 
        id_palabra = p_id_palabra
        AND fecha_publicacion BETWEEN v_fecha_inicio AND v_fecha_fin;
    
    -- Calcular tendencia comparada con el período anterior
    SELECT 
        (v_total_resultados - COALESCE(COUNT(*), 0)) * 100.0 / NULLIF(COUNT(*), 0)
    INTO 
        v_tendencia
    FROM 
        resultados 
    WHERE 
        id_palabra = p_id_palabra
        AND fecha_publicacion BETWEEN (v_fecha_inicio - INTERVAL '24 hours') AND v_fecha_inicio;
    
    -- Insertar o actualizar estadísticas
    INSERT INTO estadisticas (
        id_palabra,
        fecha_inicio,
        fecha_fin,
        total_resultados,
        promedio_sentimiento,
        tendencia,
        datos_agregados
    ) VALUES (
        p_id_palabra,
        v_fecha_inicio,
        v_fecha_fin,
        v_total_resultados,
        v_promedio_sentimiento,
        v_tendencia,
        jsonb_build_object(
            'periodo', '24h',
            'ultima_actualizacion', NOW()
        )
    )
    ON CONFLICT (id_palabra, fecha_inicio, fecha_fin) 
    DO UPDATE SET
        total_resultados = EXCLUDED.total_resultados,
        promedio_sentimiento = EXCLUDED.promedio_sentimiento,
        tendencia = EXCLUDED.tendencia,
        datos_agregados = EXCLUDED.datos_agregados || 
                         jsonb_build_object('ultima_actualizacion', NOW());
    
    -- Registrar la operación
    PERFORM log_proceso(
        'actualizacion_estadisticas',
        'completado',
        'Estadísticas actualizadas para la palabra clave con ID ' || p_id_palabra,
        'Total resultados: ' || COALESCE(v_total_resultados, 0) || 
        ', Sentimiento promedio: ' || COALESCE(v_promedio_sentimiento::TEXT, 'N/A') ||
        ', Tendencia: ' || COALESCE(v_tendencia::TEXT, 'N/A') || '%',
        NULL
    );
END;
$function$

--------------------------------------------------------------------------------

-- public.buscar_palabras_clave()
CREATE OR REPLACE FUNCTION public.buscar_palabras_clave(
    p_busqueda text DEFAULT NULL::text, 
    p_id_usuario uuid DEFAULT NULL::uuid, 
    p_limite integer DEFAULT 10, 
    p_desplazamiento integer DEFAULT 0
)
 RETURNS TABLE(
    id_palabra integer, 
    palabra text, 
    descripcion text, 
    total_resultados bigint, 
    ultimo_resultado timestamp with time zone
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
        MAX(r.fecha_publicacion) AS ultimo_resultado
    FROM 
        palabras_clave pc
        LEFT JOIN resultados r ON pc.id_palabra = r.id_palabra
    WHERE 
        (p_busqueda IS NULL OR pc.palabra ILIKE '%' || p_busqueda || '%')
        AND (p_id_usuario IS NULL OR pc.id_usuario_creador = p_id_usuario OR pc.es_publica = TRUE)
    GROUP BY 
        pc.id_palabra, pc.palabra, pc.descripcion
    ORDER BY 
        pc.palabra
    LIMIT 
        p_limite 
    OFFSET 
        p_desplazamiento;
END;
$function$

--------------------------------------------------------------------------------

-- public.generar_reporte()
CREATE OR REPLACE FUNCTION public.generar_reporte(
    p_titulo text, 
    p_descripcion text, 
    p_tipo_reporte text, 
    p_parametros jsonb, 
    p_id_usuario_solicitante uuid
)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_id_reporte UUID;
    v_nombre_archivo TEXT;
BEGIN
    -- Generar un nombre de archivo único
    v_nombre_archivo := 'reporte_' || REPLACE(LOWER(p_tipo_reporte), ' ', '_') || '_' || 
                        TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS') || '.pdf';
    
    -- Insertar el registro del reporte
    INSERT INTO reportes (
        titulo,
        descripcion,
        tipo_reporte,
        parametros,
        ruta_archivo,
        formato,
        estado,
        id_usuario_solicitante,
        fecha_solicitud,
        fecha_completado
    ) VALUES (
        p_titulo,
        p_descripcion,
        p_tipo_reporte,
        p_parametros,
        v_nombre_archivo,
        'pdf',
        'en_proceso',
        p_id_usuario_solicitante,
        NOW(),
        NULL
    )
    RETURNING id_reporte INTO v_id_reporte;
    
    -- Aquí normalmente se llamaría a un servicio externo o se usaría un trabajo en segundo plano
    -- para generar el archivo de reporte real y actualizar el estado cuando esté listo
    
    -- Por ahora, simplemente devolvemos el ID
    RETURN v_id_reporte;
END;
$function$

--------------------------------------------------------------------------------

-- public.limpiar_logs_antiguos(p_dias_retencion integer DEFAULT 90)
CREATE OR REPLACE FUNCTION public.limpiar_logs_antiguos(p_dias_retencion integer DEFAULT 90)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_logs_eliminados INTEGER;
BEGIN
    DELETE FROM logs_procesos 
    WHERE fecha_inicio < (NOW() - (p_dias_retencion || ' days')::INTERVAL)
    RETURNING id_log INTO v_logs_eliminados;
    
    RETURN COALESCE(v_logs_eliminados, 0);
END;
$function$

--------------------------------------------------------------------------------

-- public.log_proceso()
CREATE OR REPLACE FUNCTION public.log_proceso(
    p_tipo_proceso character varying, 
    p_estado character varying, 
    p_mensaje text, 
    p_detalles text DEFAULT NULL::text, 
    p_id_usuario uuid DEFAULT NULL::uuid, 
    p_metadatos jsonb DEFAULT '{}'::jsonb, 
    p_ip_origen inet DEFAULT NULL::inet
)
 RETURNS bigint
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_log_id BIGINT;
BEGIN
    INSERT INTO logs_procesos (
        tipo_proceso,
        estado,
        mensaje,
        detalles,
        id_usuario,
        metadatos,
        fecha_fin,
        ip_origen
    ) VALUES (
        p_tipo_proceso,
        p_estado,
        p_mensaje,
        p_detalles,
        p_id_usuario,
        p_metadatos,
        NOW(),
        p_ip_origen
    ) RETURNING id_log INTO v_log_id;
    
    RETURN v_log_id;
END;
$function$

--------------------------------------------------------------------------------

-- public.obtener_estadisticas_palabra()
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_palabra(
    p_id_palabra integer, 
    p_fecha_inicio timestamp with time zone DEFAULT (now() - '30 days'::interval), 
    p_fecha_fin timestamp with time zone DEFAULT now()
)
 RETURNS TABLE(
    fecha date, 
    total_resultados bigint, 
    promedio_sentimiento numeric, 
    fuentes jsonb
)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(r.fecha_publicacion) AS fecha,
        COUNT(*)::BIGINT AS total_resultados,
        AVG(
            CASE 
                WHEN r.sentimiento = 'positivo' THEN 1.0
                WHEN r.sentimiento = 'negativo' THEN -1.0
                ELSE 0.0
            END
        )::NUMERIC(5,2) AS promedio_sentimiento,
        jsonb_agg(
            jsonb_build_object(
                'fuente', f.nombre,
                'total', COUNT(*)::INTEGER
            )
        ) AS fuentes
    FROM 
        resultados r
        JOIN fuentes f ON r.id_fuente = f.id_fuente
    WHERE 
        r.id_palabra = p_id_palabra
        AND r.fecha_publicacion BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY 
        DATE(r.fecha_publicacion)
    ORDER BY 
        fecha;
END;
$function$

--------------------------------------------------------------------------------

-- public.obtener_estadisticas_por_periodo()
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_por_periodo(
    p_id_palabra integer, 
    p_tipo_periodo character varying DEFAULT 'day'::character varying, 
    p_limite integer DEFAULT 30
)
 RETURNS TABLE(
    periodo timestamp with time zone, 
    total_resultados bigint, 
    positivos bigint, 
    negativos bigint, 
    neutros bigint, 
    sentimiento_promedio numeric
)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_interval TEXT;
    v_interval_value INTEGER;
BEGIN
    -- Establecer intervalo basado en el tipo de período
    CASE p_tipo_periodo
        WHEN 'hour' THEN 
            v_interval := '1 hour';
            v_interval_value := p_limite;
        WHEN 'day' THEN 
            v_interval := '1 day';
            v_interval_value := p_limite;
        WHEN 'week' THEN 
            v_interval := '1 week';
            v_interval_value := p_limite;
        WHEN 'month' THEN 
            v_interval := '1 month';
            v_interval_value := p_limite;
        ELSE 
            v_interval := '1 day';
            v_interval_value := p_limite;
    END CASE;
    
    RETURN QUERY
    WITH periodos AS (
        SELECT 
            generate_series(
                DATE_TRUNC(p_tipo_periodo, NOW() - (v_interval_value || ' ' || p_tipo_periodo)::INTERVAL),
                DATE_TRUNC(p_tipo_periodo, NOW()),
                (v_interval_value || ' ' || p_tipo_periodo)::INTERVAL / p_limite
            ) AS periodo
    )
    SELECT 
        p.periodo,
        COUNT(r.id_resultado)::BIGINT AS total_resultados,
        COUNT(r.id_resultado) FILTER (WHERE r.sentimiento = 'positivo')::BIGINT AS positivos,
        COUNT(r.id_resultado) FILTER (WHERE r.sentimiento = 'negativo')::BIGINT AS negativos,
        COUNT(r.id_resultado) FILTER (WHERE r.sentimiento IS NULL OR r.sentimiento = 'neutro')::BIGINT AS neutros,
        COALESCE(AVG(
            CASE 
                WHEN r.sentimiento = 'positivo' THEN 1.0
                WHEN r.sentimiento = 'negativo' THEN -1.0
                ELSE 0.0
            END
        )::NUMERIC(5,2), 0) AS sentimiento_promedio
    FROM 
        periodos p
        LEFT JOIN resultados r ON 
            DATE_TRUNC(p_tipo_periodo, r.fecha_publicacion) = p.periodo
            AND r.id_palabra = p_id_palabra
    GROUP BY 
        p.periodo
    ORDER BY 
        p.periodo DESC
    LIMIT p_limite;
END;
$function$

--------------------------------------------------------------------------------

-- public.actualizar_columna_actualizado_en()
-- Traducción de update_updated_at_column()
CREATE OR REPLACE FUNCTION public.actualizar_columna_actualizado_en()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$function$

--------------------------------------------------------------------------------