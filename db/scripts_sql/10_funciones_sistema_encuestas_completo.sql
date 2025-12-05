-- =====================================================
-- SISTEMA COMPLETO DE ENCUESTAS - FUNCIONES RPC
-- Fecha: 2024-12-22
-- Descripción: Funciones para el sistema completo de encuestas personalizadas
-- =====================================================

-- Función para obtener encuestas con estadísticas
DROP FUNCTION IF EXISTS public.obtener_encuestas_con_estadisticas(integer, integer, boolean) CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_encuestas_con_estadisticas(
    p_id_sucursal integer DEFAULT NULL,
    p_limite integer DEFAULT 50,
    p_solo_activas boolean DEFAULT false
)
RETURNS TABLE(
    id_diseno integer,
    titulo character varying,
    descripcion text,
    tipo_encuesta character varying,
    id_sucursal integer,
    estructura_json jsonb,
    esta_activa boolean,
    es_plantilla boolean,
    creado_por uuid,
    creado_en timestamp with time zone,
    actualizado_en timestamp with time zone,
    sucursal_nombre text,
    creador_nombre character varying,
    total_respuestas bigint,
    respuestas_completadas bigint,
    respuestas_incompletas bigint,
    duracion_promedio numeric,
    ultima_respuesta timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        de.id_diseno,
        de.titulo,
        de.descripcion,
        de.tipo_encuesta,
        de.id_sucursal,
        de.estructura_json,
        de.esta_activa,
        de.es_plantilla,
        de.creado_por,
        de.creado_en,
        de.actualizado_en,
        s.nombre_sucursal,
        u.nombre_completo,
        COUNT(rep.id_respuesta)::bigint AS total_respuestas,
        COUNT(rep.id_respuesta) FILTER (WHERE rep.estado = 'completada')::bigint AS respuestas_completadas,
        COUNT(rep.id_respuesta) FILTER (WHERE rep.estado = 'incompleta')::bigint AS respuestas_incompletas,
        AVG(rep.duracion_minutos)::numeric AS duracion_promedio,
        MAX(rep.fecha_encuesta) AS ultima_respuesta
    FROM public.diseno_encuestas de
    LEFT JOIN public.sucursales s ON de.id_sucursal = s.id_suc
    LEFT JOIN public.usuarios u ON de.creado_por = u.id_usuario
    LEFT JOIN public.respuestas_encuestas_personalizadas rep ON de.id_diseno = rep.id_diseno
    WHERE (p_id_sucursal IS NULL OR de.id_sucursal = p_id_sucursal)
    AND (NOT p_solo_activas OR de.esta_activa = true)
    GROUP BY 
        de.id_diseno, de.titulo, de.descripcion, de.tipo_encuesta, 
        de.id_sucursal, de.estructura_json, de.esta_activa, de.es_plantilla,
        de.creado_por, de.creado_en, de.actualizado_en,
        s.nombre_sucursal, u.nombre_completo
    ORDER BY de.creado_en DESC
    LIMIT p_limite;
END;
$function$;

-- Función para obtener respuestas de una encuesta con detalles
DROP FUNCTION IF EXISTS public.obtener_respuestas_encuesta_detalladas(integer, integer, integer) CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_respuestas_encuesta_detalladas(
    p_id_diseno integer,
    p_limite integer DEFAULT 100,
    p_desplazamiento integer DEFAULT 0
)
RETURNS TABLE(
    id_respuesta integer,
    id_diseno integer,
    id_encuestador uuid,
    respuestas_json jsonb,
    ubicacion_gps character varying,
    fecha_encuesta timestamp with time zone,
    duracion_minutos integer,
    observaciones text,
    estado character varying,
    encuestador_nombre character varying,
    encuestador_sucursal text,
    diseno_titulo character varying
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        rep.id_respuesta,
        rep.id_diseno,
        rep.id_encuestador,
        rep.respuestas_json,
        rep.ubicacion_gps,
        rep.fecha_encuesta,
        rep.duracion_minutos,
        rep.observaciones,
        rep.estado,
        u.nombre_completo,
        s.nombre_sucursal,
        de.titulo
    FROM public.respuestas_encuestas_personalizadas rep
    LEFT JOIN public.usuarios u ON rep.id_encuestador = u.id_usuario
    LEFT JOIN public.sucursales s ON u.id_suc = s.id_suc
    LEFT JOIN public.diseno_encuestas de ON rep.id_diseno = de.id_diseno
    WHERE rep.id_diseno = p_id_diseno
    ORDER BY rep.fecha_encuesta DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$function$;

-- Función para crear respuesta de encuesta con validaciones
DROP FUNCTION IF EXISTS public.crear_respuesta_encuesta_validada(integer, uuid, jsonb, character varying, integer, text) CASCADE;
CREATE OR REPLACE FUNCTION public.crear_respuesta_encuesta_validada(
    p_id_diseno integer,
    p_id_encuestador uuid,
    p_respuestas_json jsonb,
    p_ubicacion_gps character varying DEFAULT NULL,
    p_duracion_minutos integer DEFAULT NULL,
    p_observaciones text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
    v_encuesta_activa boolean;
    v_id_respuesta integer;
BEGIN
    -- Verificar que la encuesta existe y está activa
    SELECT esta_activa INTO v_encuesta_activa
    FROM public.diseno_encuestas
    WHERE id_diseno = p_id_diseno;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Encuesta no encontrada'
        );
    END IF;

    IF NOT v_encuesta_activa THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'La encuesta no está activa'
        );
    END IF;

    -- Insertar respuesta
    INSERT INTO public.respuestas_encuestas_personalizadas (
        id_diseno,
        id_encuestador,
        respuestas_json,
        ubicacion_gps,
        duracion_minutos,
        observaciones,
        estado
    ) VALUES (
        p_id_diseno,
        p_id_encuestador,
        p_respuestas_json,
        p_ubicacion_gps,
        p_duracion_minutos,
        p_observaciones,
        'completada'
    ) RETURNING id_respuesta INTO v_id_respuesta;

    -- Log de la operación
    PERFORM public.log_proceso(
        'crear_respuesta_encuesta',
        'completado',
        'Respuesta de encuesta creada',
        'ID Respuesta: ' || v_id_respuesta::text || ', ID Diseño: ' || p_id_diseno::text,
        p_id_encuestador,
        jsonb_build_object('respuesta_id', v_id_respuesta, 'diseno_id', p_id_diseno),
        NULL
    );

    RETURN jsonb_build_object(
        'success', true,
        'respuesta_id', v_id_respuesta,
        'message', 'Respuesta guardada exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Error interno: ' || SQLERRM
    );
END;
$function$;

-- Función para actualizar estado de encuesta (ciclo de vida)
DROP FUNCTION IF EXISTS public.actualizar_estado_encuesta(integer, character varying, uuid, text) CASCADE;
CREATE OR REPLACE FUNCTION public.actualizar_estado_encuesta(
    p_id_diseno integer,
    p_nuevo_estado character varying,
    p_usuario_actualizacion uuid,
    p_observaciones text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
    v_estado_actual character varying;
    v_estados_validos character varying[] := ARRAY[
        'borrador', 'revision', 'aprobada', 'publicada', 
        'recoleccion', 'cerrada', 'validada', 'archivada'
    ];
BEGIN
    -- Verificar que el nuevo estado es válido
    IF NOT (p_nuevo_estado = ANY(v_estados_validos)) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Estado no válido: ' || p_nuevo_estado
        );
    END IF;

    -- Obtener estado actual
    SELECT COALESCE(
        (estructura_json->>'estado')::character varying, 
        'borrador'
    ) INTO v_estado_actual
    FROM public.diseno_encuestas
    WHERE id_diseno = p_id_diseno;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Encuesta no encontrada'
        );
    END IF;

    -- Actualizar estado en la estructura JSON
    UPDATE public.diseno_encuestas
    SET 
        estructura_json = estructura_json || jsonb_build_object(
            'estado', p_nuevo_estado,
            'fecha_cambio_estado', NOW(),
            'usuario_cambio_estado', p_usuario_actualizacion,
            'observaciones_estado', p_observaciones
        ),
        actualizado_en = NOW()
    WHERE id_diseno = p_id_diseno;

    -- Log del cambio de estado
    PERFORM public.log_proceso(
        'cambio_estado_encuesta',
        'completado',
        'Estado de encuesta actualizado: ' || v_estado_actual || ' → ' || p_nuevo_estado,
        'ID Diseño: ' || p_id_diseno::text || ', Observaciones: ' || COALESCE(p_observaciones, 'N/A'),
        p_usuario_actualizacion,
        jsonb_build_object(
            'diseno_id', p_id_diseno,
            'estado_anterior', v_estado_actual,
            'estado_nuevo', p_nuevo_estado
        ),
        NULL
    );

    RETURN jsonb_build_object(
        'success', true,
        'estado_anterior', v_estado_actual,
        'estado_nuevo', p_nuevo_estado,
        'message', 'Estado actualizado exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Error interno: ' || SQLERRM
    );
END;
$function$;

-- Función para obtener estadísticas de encuestas por sucursal
DROP FUNCTION IF EXISTS public.obtener_estadisticas_encuestas_sucursal(integer, date, date) CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_encuestas_sucursal(
    p_id_sucursal integer DEFAULT NULL,
    p_fecha_inicio date DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
    p_fecha_fin date DEFAULT CURRENT_DATE
)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
    v_estadisticas jsonb;
BEGIN
    SELECT jsonb_build_object(
        'encuestas', jsonb_build_object(
            'total', COUNT(DISTINCT de.id_diseno),
            'activas', COUNT(DISTINCT CASE WHEN de.esta_activa THEN de.id_diseno END),
            'plantillas', COUNT(DISTINCT CASE WHEN de.es_plantilla THEN de.id_diseno END),
            'por_tipo', jsonb_object_agg(
                COALESCE(de.tipo_encuesta, 'sin_tipo'),
                COUNT(DISTINCT de.id_diseno)
            ) FILTER (WHERE de.id_diseno IS NOT NULL)
        ),
        'respuestas', jsonb_build_object(
            'total', COUNT(rep.id_respuesta),
            'completadas', COUNT(rep.id_respuesta) FILTER (WHERE rep.estado = 'completada'),
            'incompletas', COUNT(rep.id_respuesta) FILTER (WHERE rep.estado = 'incompleta'),
            'validadas', COUNT(rep.id_respuesta) FILTER (WHERE rep.estado = 'validada'),
            'hoy', COUNT(rep.id_respuesta) FILTER (WHERE DATE(rep.fecha_encuesta) = CURRENT_DATE),
            'esta_semana', COUNT(rep.id_respuesta) FILTER (WHERE rep.fecha_encuesta >= CURRENT_DATE - INTERVAL '7 days'),
            'duracion_promedio', ROUND(AVG(rep.duracion_minutos)::numeric, 2)
        ),
        'rendimiento', jsonb_build_object(
            'tasa_completado', CASE 
                WHEN COUNT(rep.id_respuesta) > 0 
                THEN ROUND((COUNT(rep.id_respuesta) FILTER (WHERE rep.estado = 'completada')::numeric / COUNT(rep.id_respuesta)::numeric) * 100, 2)
                ELSE 0 
            END,
            'encuestas_con_respuestas', COUNT(DISTINCT CASE WHEN rep.id_respuesta IS NOT NULL THEN de.id_diseno END),
            'promedio_respuestas_por_encuesta', CASE 
                WHEN COUNT(DISTINCT de.id_diseno) > 0 
                THEN ROUND(COUNT(rep.id_respuesta)::numeric / COUNT(DISTINCT de.id_diseno)::numeric, 2)
                ELSE 0 
            END
        ),
        'periodo', jsonb_build_object(
            'inicio', p_fecha_inicio,
            'fin', p_fecha_fin,
            'dias', p_fecha_fin - p_fecha_inicio + 1
        )
    ) INTO v_estadisticas
    FROM public.diseno_encuestas de
    LEFT JOIN public.respuestas_encuestas_personalizadas rep ON de.id_diseno = rep.id_diseno
        AND DATE(rep.fecha_encuesta) BETWEEN p_fecha_inicio AND p_fecha_fin
    WHERE (p_id_sucursal IS NULL OR de.id_sucursal = p_id_sucursal);

    RETURN v_estadisticas;
END;
$function$;

-- Función para duplicar encuesta (clonar)
DROP FUNCTION IF EXISTS public.duplicar_encuesta(integer, character varying, uuid, boolean) CASCADE;
CREATE OR REPLACE FUNCTION public.duplicar_encuesta(
    p_id_diseno_origen integer,
    p_nuevo_titulo character varying,
    p_usuario_creador uuid,
    p_como_plantilla boolean DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
    v_encuesta_origen RECORD;
    v_nuevo_id integer;
    v_nueva_estructura jsonb;
BEGIN
    -- Obtener encuesta origen
    SELECT * INTO v_encuesta_origen
    FROM public.diseno_encuestas
    WHERE id_diseno = p_id_diseno_origen;

    IF NOT FOUND THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Encuesta origen no encontrada'
        );
    END IF;

    -- Preparar nueva estructura (resetear estado si existe)
    v_nueva_estructura := v_encuesta_origen.estructura_json;
    v_nueva_estructura := v_nueva_estructura - 'estado' - 'fecha_cambio_estado' - 'usuario_cambio_estado';
    v_nueva_estructura := v_nueva_estructura || jsonb_build_object('estado', 'borrador');

    -- Crear nueva encuesta
    INSERT INTO public.diseno_encuestas (
        titulo,
        descripcion,
        tipo_encuesta,
        id_sucursal,
        estructura_json,
        esta_activa,
        es_plantilla,
        creado_por
    ) VALUES (
        p_nuevo_titulo,
        'Copia de: ' || COALESCE(v_encuesta_origen.descripcion, v_encuesta_origen.titulo),
        v_encuesta_origen.tipo_encuesta,
        v_encuesta_origen.id_sucursal,
        v_nueva_estructura,
        false, -- Nueva encuesta inactiva por defecto
        p_como_plantilla,
        p_usuario_creador
    ) RETURNING id_diseno INTO v_nuevo_id;

    -- Log de la operación
    PERFORM public.log_proceso(
        'duplicar_encuesta',
        'completado',
        'Encuesta duplicada: ' || v_encuesta_origen.titulo || ' → ' || p_nuevo_titulo,
        'ID Origen: ' || p_id_diseno_origen::text || ', ID Nuevo: ' || v_nuevo_id::text,
        p_usuario_creador,
        jsonb_build_object(
            'diseno_origen_id', p_id_diseno_origen,
            'diseno_nuevo_id', v_nuevo_id,
            'como_plantilla', p_como_plantilla
        ),
        NULL
    );

    RETURN jsonb_build_object(
        'success', true,
        'nuevo_id', v_nuevo_id,
        'message', 'Encuesta duplicada exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'error', 'Error interno: ' || SQLERRM
    );
END;
$function$;

-- Función para validar estructura de encuesta
DROP FUNCTION IF EXISTS public.validar_estructura_encuesta(jsonb) CASCADE;
CREATE OR REPLACE FUNCTION public.validar_estructura_encuesta(
    p_estructura jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $function$
DECLARE
    v_errores text[] := '{}';
    v_seccion jsonb;
    v_pregunta jsonb;
    v_contador_secciones integer := 0;
    v_contador_preguntas integer := 0;
BEGIN
    -- Validar estructura básica
    IF NOT (p_estructura ? 'titulo') OR (p_estructura->>'titulo') = '' THEN
        v_errores := array_append(v_errores, 'El título es requerido');
    END IF;

    IF NOT (p_estructura ? 'secciones') OR jsonb_array_length(p_estructura->'secciones') = 0 THEN
        v_errores := array_append(v_errores, 'Debe tener al menos una sección');
    END IF;

    IF NOT (p_estructura ? 'configuracion') THEN
        v_errores := array_append(v_errores, 'La configuración es requerida');
    END IF;

    -- Validar secciones
    IF p_estructura ? 'secciones' THEN
        FOR v_seccion IN SELECT * FROM jsonb_array_elements(p_estructura->'secciones')
        LOOP
            v_contador_secciones := v_contador_secciones + 1;
            
            IF NOT (v_seccion ? 'titulo') OR (v_seccion->>'titulo') = '' THEN
                v_errores := array_append(v_errores, 'Sección ' || v_contador_secciones || ': título requerido');
            END IF;

            IF NOT (v_seccion ? 'preguntas') THEN
                v_errores := array_append(v_errores, 'Sección ' || v_contador_secciones || ': debe tener preguntas');
            ELSE
                -- Validar preguntas
                FOR v_pregunta IN SELECT * FROM jsonb_array_elements(v_seccion->'preguntas')
                LOOP
                    v_contador_preguntas := v_contador_preguntas + 1;
                    
                    IF NOT (v_pregunta ? 'titulo') OR (v_pregunta->>'titulo') = '' THEN
                        v_errores := array_append(v_errores, 'Pregunta ' || v_contador_preguntas || ': título requerido');
                    END IF;

                    IF NOT (v_pregunta ? 'tipo') THEN
                        v_errores := array_append(v_errores, 'Pregunta ' || v_contador_preguntas || ': tipo requerido');
                    ELSIF NOT (v_pregunta->>'tipo' = ANY(ARRAY['texto', 'numero', 'fecha', 'seleccion_unica', 'seleccion_multiple', 'escala', 'boolean', 'archivo'])) THEN
                        v_errores := array_append(v_errores, 'Pregunta ' || v_contador_preguntas || ': tipo no válido');
                    END IF;

                    -- Validaciones específicas por tipo
                    IF v_pregunta->>'tipo' IN ('seleccion_unica', 'seleccion_multiple') THEN
                        IF NOT (v_pregunta ? 'opciones') OR jsonb_array_length(v_pregunta->'opciones') = 0 THEN
                            v_errores := array_append(v_errores, 'Pregunta ' || v_contador_preguntas || ': opciones requeridas');
                        END IF;
                    END IF;

                    IF v_pregunta->>'tipo' = 'escala' THEN
                        IF NOT (v_pregunta ? 'min_valor') OR NOT (v_pregunta ? 'max_valor') THEN
                            v_errores := array_append(v_errores, 'Pregunta ' || v_contador_preguntas || ': valores mín/máx requeridos para escala');
                        END IF;
                    END IF;
                END LOOP;
            END IF;
        END LOOP;
    END IF;

    -- Validar que hay al menos una pregunta
    IF v_contador_preguntas = 0 THEN
        v_errores := array_append(v_errores, 'Debe tener al menos una pregunta');
    END IF;

    RETURN jsonb_build_object(
        'valida', array_length(v_errores, 1) IS NULL,
        'errores', v_errores,
        'estadisticas', jsonb_build_object(
            'total_secciones', v_contador_secciones,
            'total_preguntas', v_contador_preguntas
        )
    );
END;
$function$;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_diseno_encuestas_sucursal_activa ON public.diseno_encuestas(id_sucursal, esta_activa);
CREATE INDEX IF NOT EXISTS idx_diseno_encuestas_tipo_activa ON public.diseno_encuestas(tipo_encuesta, esta_activa);
CREATE INDEX IF NOT EXISTS idx_respuestas_encuestas_diseno_fecha ON public.respuestas_encuestas_personalizadas(id_diseno, fecha_encuesta);
CREATE INDEX IF NOT EXISTS idx_respuestas_encuestas_estado ON public.respuestas_encuestas_personalizadas(estado);
CREATE INDEX IF NOT EXISTS idx_respuestas_encuestas_encuestador ON public.respuestas_encuestas_personalizadas(id_encuestador);

-- Insertar log de migración
INSERT INTO public.ddl_migrations_log (mensaje) 
VALUES ('Sistema completo de encuestas - Funciones RPC creadas exitosamente');

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE 'Sistema completo de encuestas implementado exitosamente';
    RAISE NOTICE 'Funciones creadas: 7';
    RAISE NOTICE 'Índices optimizados: 5';
END $$;