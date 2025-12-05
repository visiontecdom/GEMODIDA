-- =====================================================
-- FUNCIONES RPC PARA PLANIFICACIÓN Y MONITOREO
-- =====================================================

-- Función para obtener planificaciones filtradas
DROP FUNCTION IF EXISTS public.obtener_planificaciones_filtradas CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_planificaciones_filtradas(
    p_id_sucursal INTEGER DEFAULT NULL,
    p_tipo_trabajo VARCHAR DEFAULT NULL,
    p_estado VARCHAR DEFAULT NULL,
    p_fecha_inicio DATE DEFAULT NULL,
    p_fecha_fin DATE DEFAULT NULL,
    p_limite INTEGER DEFAULT 50,
    p_desplazamiento INTEGER DEFAULT 0
)
RETURNS TABLE(
    id_planificacion INTEGER,
    titulo VARCHAR,
    descripcion TEXT,
    tipo_trabajo VARCHAR,
    id_sucursal INTEGER,
    id_usuario_responsable UUID,
    responsable_nombre VARCHAR,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR,
    prioridad INTEGER,
    presupuesto_estimado NUMERIC,
    presupuesto_real NUMERIC,
    progreso_porcentaje INTEGER,
    metadatos JSONB,
    creado_por UUID,
    creado_en TIMESTAMP WITH TIME ZONE,
    actualizado_en TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.id_planificacion,
        pt.titulo,
        pt.descripcion,
        pt.tipo_trabajo,
        pt.id_sucursal,
        pt.id_usuario_responsable,
        u.nombre_completo,
        pt.fecha_inicio,
        pt.fecha_fin,
        pt.estado,
        pt.prioridad,
        pt.presupuesto_estimado,
        pt.presupuesto_real,
        pt.progreso_porcentaje,
        pt.metadatos,
        pt.creado_por,
        pt.creado_en,
        pt.actualizado_en
    FROM public.planificacion_trabajos pt
    LEFT JOIN public.usuarios u ON pt.id_usuario_responsable = u.id_usuario
    WHERE (p_id_sucursal IS NULL OR pt.id_sucursal = p_id_sucursal)
    AND (p_tipo_trabajo IS NULL OR pt.tipo_trabajo = p_tipo_trabajo)
    AND (p_estado IS NULL OR pt.estado = p_estado)
    AND (p_fecha_inicio IS NULL OR pt.fecha_inicio >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR pt.fecha_fin <= p_fecha_fin)
    ORDER BY pt.creado_en DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$$;

-- Función para obtener estadísticas de monitoreo por sucursal
DROP FUNCTION IF EXISTS public.obtener_estadisticas_monitoreo_sucursal CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_monitoreo_sucursal(
    p_id_sucursal INTEGER,
    p_fecha_inicio DATE DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
    p_fecha_fin DATE DEFAULT CURRENT_DATE
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_estadisticas JSON;
BEGIN
    SELECT json_build_object(
        'sucursal', json_build_object(
            'id', s.id_suc,
            'nombre', s.nombre_sucursal,
            'provincia', s.provincia
        ),
        'periodo', json_build_object(
            'inicio', p_fecha_inicio,
            'fin', p_fecha_fin
        ),
        'planificaciones', json_build_object(
            'total', COUNT(DISTINCT pt.id_planificacion),
            'completadas', COUNT(DISTINCT pt.id_planificacion) FILTER (WHERE pt.estado = 'completado'),
            'en_progreso', COUNT(DISTINCT pt.id_planificacion) FILTER (WHERE pt.estado = 'en_progreso'),
            'planificadas', COUNT(DISTINCT pt.id_planificacion) FILTER (WHERE pt.estado = 'planificado')
        ),
        'actividades', json_build_object(
            'total', COUNT(DISTINCT am.id_actividad),
            'completadas', COUNT(DISTINCT am.id_actividad) FILTER (WHERE am.estado_actividad = 'completada'),
            'en_progreso', COUNT(DISTINCT am.id_actividad) FILTER (WHERE am.estado_actividad = 'en_progreso')
        ),
        'usuarios_activos', COUNT(DISTINCT u.id_usuario) FILTER (WHERE u.ultimo_acceso >= p_fecha_inicio),
        'palabras_clave_monitoreadas', (
            SELECT COUNT(*) FROM public.palabras_clave 
            WHERE fecha_creacion >= p_fecha_inicio
        ),
        'resultados_obtenidos', (
            SELECT COUNT(*) FROM public.resultados 
            WHERE fecha_extraccion >= p_fecha_inicio
        )
    ) INTO v_estadisticas
    FROM public.sucursales s
    LEFT JOIN public.planificacion_trabajos pt ON s.id_suc = pt.id_sucursal 
        AND pt.fecha_inicio BETWEEN p_fecha_inicio AND p_fecha_fin
    LEFT JOIN public.actividad_matriz am ON s.id_suc = am.id_sucursal 
        AND am.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    LEFT JOIN public.usuarios_asignaciones au ON s.id_suc = au.id_sucursal
    LEFT JOIN public.usuarios u ON au.id_usuario = u.id_usuario
    WHERE s.id_suc = p_id_sucursal
    GROUP BY s.id_suc, s.nombre_sucursal, s.provincia;

    RETURN v_estadisticas;
END;
$$;

-- Función para obtener usuarios por departamento de monitoreo
DROP FUNCTION IF EXISTS public.obtener_usuarios_monitoreo CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_usuarios_monitoreo(
    p_id_sucursal INTEGER DEFAULT NULL,
    p_limite INTEGER DEFAULT 50,
    p_desplazamiento INTEGER DEFAULT 0
)
RETURNS TABLE(
    id_usuario UUID,
    nombre_completo VARCHAR,
    correo VARCHAR,
    telefono VARCHAR,
    rol_nombre VARCHAR,
    grupo_nombre VARCHAR,
    sucursal_nombre TEXT,
    esta_activo BOOLEAN,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id_usuario,
        u.nombre_completo,
        u.correo,
        u.telefono,
        ur.nombre_rol,
        ug.nombre_grupo,
        s.nombre_sucursal,
        u.esta_activo,
        u.ultimo_acceso,
        u.creado_en
    FROM public.usuarios u
    LEFT JOIN public.usuarios_asignaciones au ON u.id_usuario = au.id_usuario
    LEFT JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
    LEFT JOIN public.usuarios_grupos ug ON au.id_grupo = ug.id_grupo
    LEFT JOIN public.sucursales s ON au.id_sucursal = s.id_suc
    WHERE au.esta_activa = true
    AND ug.codigo_grupo = 'monitoreo'
    AND (p_id_sucursal IS NULL OR au.id_sucursal = p_id_sucursal)
    ORDER BY u.nombre_completo ASC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$$;

-- Función para obtener palabras clave con estadísticas de monitoreo
DROP FUNCTION IF EXISTS public.obtener_palabras_clave_monitoreo CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_palabras_clave_monitoreo(
    p_limite INTEGER DEFAULT 50,
    p_desplazamiento INTEGER DEFAULT 0
)
RETURNS TABLE(
    id_palabra INTEGER,
    palabra VARCHAR,
    descripcion TEXT,
    total_resultados BIGINT,
    resultados_hoy BIGINT,
    ultimo_resultado TIMESTAMP WITH TIME ZONE,
    sentimiento_promedio NUMERIC,
    es_publica BOOLEAN,
    fecha_creacion TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pc.id_palabra,
        pc.palabra,
        pc.descripcion,
        COUNT(r.id_resultado)::BIGINT AS total_resultados,
        COUNT(r.id_resultado) FILTER (WHERE DATE(r.fecha_publicacion) = CURRENT_DATE)::BIGINT AS resultados_hoy,
        MAX(r.fecha_publicacion) AS ultimo_resultado,
        AVG(
            CASE 
                WHEN r.sentimiento = 'positivo' THEN 1.0
                WHEN r.sentimiento = 'negativo' THEN -1.0
                ELSE 0.0
            END
        )::NUMERIC(5,2) AS sentimiento_promedio,
        pc.es_publica,
        pc.fecha_creacion
    FROM public.palabras_clave pc
    LEFT JOIN public.resultados r ON pc.id_palabra = r.id_palabra
    GROUP BY pc.id_palabra, pc.palabra, pc.descripcion, pc.es_publica, pc.fecha_creacion
    ORDER BY total_resultados DESC, pc.fecha_creacion DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$$;

-- Función para generar reporte de monitoreo
DROP FUNCTION IF EXISTS public.generar_reporte_monitoreo CASCADE;
CREATE OR REPLACE FUNCTION public.generar_reporte_monitoreo(
    p_id_sucursal INTEGER,
    p_fecha_inicio DATE,
    p_fecha_fin DATE,
    p_tipo_reporte VARCHAR DEFAULT 'general'
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
    v_reporte JSON;
BEGIN
    SELECT json_build_object(
        'metadata', json_build_object(
            'tipo_reporte', p_tipo_reporte,
            'sucursal_id', p_id_sucursal,
            'periodo', json_build_object(
                'inicio', p_fecha_inicio,
                'fin', p_fecha_fin
            ),
            'generado_en', NOW()
        ),
        'resumen_ejecutivo', json_build_object(
            'total_planificaciones', COUNT(DISTINCT pt.id_planificacion),
            'planificaciones_completadas', COUNT(DISTINCT pt.id_planificacion) FILTER (WHERE pt.estado = 'completado'),
            'total_actividades', COUNT(DISTINCT am.id_actividad),
            'actividades_completadas', COUNT(DISTINCT am.id_actividad) FILTER (WHERE am.estado_actividad = 'completada'),
            'usuarios_activos', COUNT(DISTINCT u.id_usuario) FILTER (WHERE u.ultimo_acceso >= p_fecha_inicio),
            'palabras_clave_monitoreadas', (SELECT COUNT(*) FROM public.palabras_clave WHERE fecha_creacion >= p_fecha_inicio),
            'resultados_obtenidos', (SELECT COUNT(*) FROM public.resultados WHERE fecha_extraccion >= p_fecha_inicio)
        ),
        'detalle_planificaciones', (
            SELECT json_agg(
                json_build_object(
                    'titulo', pt2.titulo,
                    'tipo_trabajo', pt2.tipo_trabajo,
                    'estado', pt2.estado,
                    'progreso_porcentaje', pt2.progreso_porcentaje,
                    'responsable', u2.nombre_completo,
                    'fecha_inicio', pt2.fecha_inicio,
                    'fecha_fin', pt2.fecha_fin
                )
            )
            FROM public.planificacion_trabajos pt2
            LEFT JOIN public.usuarios u2 ON pt2.id_usuario_responsable = u2.id_usuario
            WHERE pt2.id_sucursal = p_id_sucursal
            AND pt2.fecha_inicio BETWEEN p_fecha_inicio AND p_fecha_fin
        ),
        'top_palabras_clave', (
            SELECT json_agg(
                json_build_object(
                    'palabra', pc.palabra,
                    'total_resultados', COUNT(r.id_resultado),
                    'sentimiento_promedio', AVG(
                        CASE 
                            WHEN r.sentimiento = 'positivo' THEN 1.0
                            WHEN r.sentimiento = 'negativo' THEN -1.0
                            ELSE 0.0
                        END
                    )
                )
            )
            FROM public.palabras_clave pc
            LEFT JOIN public.resultados r ON pc.id_palabra = r.id_palabra
            WHERE r.fecha_extraccion BETWEEN p_fecha_inicio AND p_fecha_fin
            GROUP BY pc.id_palabra, pc.palabra
            ORDER BY COUNT(r.id_resultado) DESC
            LIMIT 10
        )
    ) INTO v_reporte
    FROM public.planificacion_trabajos pt
    LEFT JOIN public.actividad_matriz am ON pt.id_sucursal = am.id_sucursal
    LEFT JOIN public.usuarios u ON pt.id_usuario_responsable = u.id_usuario
    WHERE pt.id_sucursal = p_id_sucursal
    AND pt.fecha_inicio BETWEEN p_fecha_inicio AND p_fecha_fin;

    RETURN v_reporte;
END;
$$;

-- Insertar log de migración
INSERT INTO public.ddl_migrations_log (mensaje) 
VALUES ('Funciones RPC para planificación y monitoreo creadas exitosamente');