-- =============================================
-- GEMODIDA - Database Functions
-- =============================================

-- Function to search keywords with pagination
CREATE OR REPLACE FUNCTION buscar_palabras_clave(
    p_busqueda TEXT DEFAULT NULL,
    p_id_usuario UUID DEFAULT NULL,
    p_limite INTEGER DEFAULT 10,
    p_desplazamiento INTEGER DEFAULT 0
) 
RETURNS TABLE (
    id_palabra INTEGER,
    palabra TEXT,
    descripcion TEXT,
    total_resultados BIGINT,
    ultimo_resultado TIMESTAMP WITH TIME ZONE
) AS $$
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
$$ LANGUAGE plpgsql;

-- Function to get keyword statistics by period
CREATE OR REPLACE FUNCTION obtener_estadisticas_por_periodo(
    p_id_palabra INTEGER,
    p_tipo_periodo VARCHAR(10) DEFAULT 'day',
    p_limite INTEGER DEFAULT 30
) 
RETURNS TABLE (
    periodo TIMESTAMP WITH TIME ZONE,
    total_resultados BIGINT,
    positivos BIGINT,
    negativos BIGINT,
    neutros BIGINT,
    sentimiento_promedio NUMERIC(5,2)
) AS $$
DECLARE
    v_interval TEXT;
    v_interval_value INTEGER;
BEGIN
    -- Set interval based on period type
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
$$ LANGUAGE plpgsql;

-- Function to generate a report
CREATE OR REPLACE FUNCTION generar_reporte(
    p_titulo TEXT,
    p_descripcion TEXT,
    p_tipo_reporte TEXT,
    p_parametros JSONB,
    p_id_usuario_solicitante UUID
) 
RETURNS UUID AS $$
DECLARE
    v_id_reporte UUID;
    v_nombre_archivo TEXT;
BEGIN
    -- Generate a unique filename
    v_nombre_archivo := 'reporte_' || REPLACE(LOWER(p_tipo_reporte), ' ', '_') || '_' || 
                        TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS') || '.pdf';
    
    -- Insert the report record
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
    
    -- Here you would typically call an external service or use a background job
    -- to generate the actual report file and update the status when done
    
    -- For now, we'll just return the ID
    RETURN v_id_reporte;
END;
$$ LANGUAGE plpgsql;

-- Function to clean old logs
CREATE OR REPLACE FUNCTION limpiar_logs_antiguos(
    p_dias_retencion INTEGER DEFAULT 90
) 
RETURNS INTEGER AS $$
DECLARE
    v_logs_eliminados INTEGER;
BEGIN
    DELETE FROM logs_procesos 
    WHERE fecha_inicio < (NOW() - (p_dias_retencion || ' days')::INTERVAL)
    RETURNING id_log INTO v_logs_eliminados;
    
    RETURN COALESCE(v_logs_eliminados, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to update statistics for a keyword
CREATE OR REPLACE FUNCTION actualizar_estadisticas_palabra(
    p_id_palabra INTEGER
) 
RETURNS VOID AS $$
DECLARE
    v_fecha_inicio TIMESTAMP WITH TIME ZONE;
    v_fecha_fin TIMESTAMP WITH TIME ZONE;
    v_total_resultados INTEGER;
    v_promedio_sentimiento NUMERIC(5,2);
    v_tendencia NUMERIC(5,2);
BEGIN
    -- Set the time period (last 24 hours)
    v_fecha_fin := NOW();
    v_fecha_inicio := v_fecha_fin - INTERVAL '24 hours';
    
    -- Calculate statistics
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
    
    -- Calculate trend compared to previous period
    SELECT 
        (v_total_resultados - COALESCE(COUNT(*), 0)) * 100.0 / NULLIF(COUNT(*), 0)
    INTO 
        v_tendencia
    FROM 
        resultados 
    WHERE 
        id_palabra = p_id_palabra
        AND fecha_publicacion BETWEEN (v_fecha_inicio - INTERVAL '24 hours') AND v_fecha_inicio;
    
    -- Insert or update statistics
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
    
    -- Log the operation
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
$$ LANGUAGE plpgsql;
