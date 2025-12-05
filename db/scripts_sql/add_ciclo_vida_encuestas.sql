-- =====================================================
-- MIGRACIÓN: AGREGAR CICLO DE VIDA A ENCUESTAS
-- Fecha: 2025-12-02
-- Descripción: Agrega columna estado dedicada a diseno_encuestas
--              para implementar el ciclo de vida completo de 10 etapas
-- =====================================================

-- Crear tipo enum para estados de encuesta
DROP TYPE IF EXISTS estado_encuesta CASCADE;
CREATE TYPE estado_encuesta AS ENUM (
    'borrador',
    'revision',
    'aprobacion',
    'publicacion',
    'recoleccion',
    'cierre',
    'validacion',
    'informe_preliminar',
    'informe_final',
    'archivo'
);

-- Agregar columna estado a diseno_encuestas
ALTER TABLE public.diseno_encuestas
ADD COLUMN IF NOT EXISTS estado estado_encuesta DEFAULT 'borrador';

-- Crear índice para la nueva columna
CREATE INDEX IF NOT EXISTS idx_diseno_encuestas_estado
ON public.diseno_encuestas(estado);

-- Actualizar registros existentes: extraer estado del JSON si existe
UPDATE public.diseno_encuestas
SET estado = CASE
    WHEN estructura_json->>'estado' IS NOT NULL
    THEN (estructura_json->>'estado')::estado_encuesta
    ELSE 'borrador'::estado_encuesta
END
WHERE estado IS NULL;

-- Agregar comentarios a la tabla
COMMENT ON COLUMN public.diseno_encuestas.estado IS 'Estado actual del ciclo de vida de la encuesta según las 10 etapas definidas';

-- Función para actualizar estado de encuesta con validaciones
DROP FUNCTION IF EXISTS public.actualizar_estado_encuesta(integer, estado_encuesta, uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.actualizar_estado_encuesta(
    p_id_diseno integer,
    p_nuevo_estado estado_encuesta,
    p_id_usuario uuid DEFAULT NULL
)
RETURNS TABLE(success boolean, message text, estado_actual estado_encuesta)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
    v_estado_actual estado_encuesta;
    v_puede_cambiar boolean := false;
    v_mensaje text;
BEGIN
    -- Obtener estado actual
    SELECT estado INTO v_estado_actual
    FROM public.diseno_encuestas
    WHERE id_diseno = p_id_diseno;

    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Encuesta no encontrada'::text, NULL::estado_encuesta;
        RETURN;
    END IF;

    -- Validar transiciones permitidas
    CASE v_estado_actual
        WHEN 'borrador' THEN
            -- Desde borrador solo puede ir a revisión
            IF p_nuevo_estado = 'revision' THEN
                v_puede_cambiar := true;
            END IF;

        WHEN 'revision' THEN
            -- Desde revisión puede ir a aprobación o volver a borrador
            IF p_nuevo_estado IN ('aprobacion', 'borrador') THEN
                v_puede_cambiar := true;
            END IF;

        WHEN 'aprobacion' THEN
            -- Desde aprobación puede ir a publicación o volver a revisión
            IF p_nuevo_estado IN ('publicacion', 'revision') THEN
                v_puede_cambiar := true;
            END IF;

        WHEN 'publicacion' THEN
            -- Desde publicación va automáticamente a recolección
            IF p_nuevo_estado = 'recoleccion' THEN
                v_puede_cambiar := true;
            END IF;

        WHEN 'recoleccion' THEN
            -- Desde recolección puede ir a cierre (automático o manual)
            IF p_nuevo_estado = 'cierre' THEN
                v_puede_cambiar := true;
            END IF;

        WHEN 'cierre' THEN
            -- Desde cierre va a validación
            IF p_nuevo_estado = 'validacion' THEN
                v_puede_cambiar := true;
            END IF;

        WHEN 'validacion' THEN
            -- Desde validación puede ir a informe_preliminar
            IF p_nuevo_estado = 'informe_preliminar' THEN
                v_puede_cambiar := true;
            END IF;

        WHEN 'informe_preliminar' THEN
            -- Desde informe_preliminar va a informe_final
            IF p_nuevo_estado = 'informe_final' THEN
                v_puede_cambiar := true;
            END IF;

        WHEN 'informe_final' THEN
            -- Desde informe_final va a archivo
            IF p_nuevo_estado = 'archivo' THEN
                v_puede_cambiar := true;
            END IF;

        WHEN 'archivo' THEN
            -- Desde archivo no hay transiciones (estado final)
            v_puede_cambiar := false;
            v_mensaje := 'La encuesta está archivada y no puede cambiar de estado';

        ELSE
            v_puede_cambiar := false;
            v_mensaje := 'Estado actual no reconocido';
    END CASE;

    IF NOT v_puede_cambiar THEN
        IF v_mensaje IS NULL THEN
            v_mensaje := format('Transición no permitida de %s a %s', v_estado_actual, p_nuevo_estado);
        END IF;
        RETURN QUERY SELECT false, v_mensaje, v_estado_actual;
        RETURN;
    END IF;

    -- Actualizar estado
    UPDATE public.diseno_encuestas
    SET estado = p_nuevo_estado,
        actualizado_en = NOW()
    WHERE id_diseno = p_id_diseno;

    -- Log del cambio
    PERFORM public.log_proceso(
        'cambio_estado_encuesta',
        'completado',
        format('Estado cambiado de %s a %s', v_estado_actual, p_nuevo_estado),
        jsonb_build_object(
            'id_diseno', p_id_diseno,
            'estado_anterior', v_estado_actual,
            'estado_nuevo', p_nuevo_estado,
            'cambiado_por', p_id_usuario
        ),
        p_id_usuario::text,
        NULL,
        NULL
    );

    RETURN QUERY SELECT true, 'Estado actualizado exitosamente'::text, p_nuevo_estado;
END;
$function$;

-- Trigger para transición automática a recolección cuando se publica
DROP FUNCTION IF EXISTS public.trigger_publicacion_a_recoleccion() CASCADE;
CREATE OR REPLACE FUNCTION public.trigger_publicacion_a_recoleccion()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $function$
BEGIN
    -- Si el estado cambió a 'publicacion', programar transición automática a 'recoleccion'
    -- Nota: En PostgreSQL, los triggers no pueden hacer UPDATE directo en la misma tabla
    -- Esta lógica se manejará desde la aplicación o con un job programado

    -- Por ahora, solo logueamos el cambio
    PERFORM public.log_proceso(
        'encuesta_publicada',
        'completado',
        format('Encuesta %s publicada, esperando transición automática a recolección', NEW.titulo),
        jsonb_build_object('id_diseno', NEW.id_diseno, 'titulo', NEW.titulo),
        NEW.creado_por::text,
        NULL,
        NULL
    );

    RETURN NEW;
END;
$function$;

-- Crear trigger (comentado por ahora, se implementará la lógica en la app)
-- DROP TRIGGER IF EXISTS trigger_encuesta_publicada ON public.diseno_encuestas;
-- CREATE TRIGGER trigger_encuesta_publicada
--     AFTER UPDATE OF estado ON public.diseno_encuestas
--     FOR EACH ROW
--     WHEN (OLD.estado != 'publicacion' AND NEW.estado = 'publicacion')
--     EXECUTE FUNCTION public.trigger_publicacion_a_recoleccion();

-- Función para obtener estadísticas por estado
DROP FUNCTION IF EXISTS public.obtener_estadisticas_encuestas_por_estado(integer) CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_encuestas_por_estado(
    p_id_sucursal integer DEFAULT NULL
)
RETURNS TABLE(
    estado estado_encuesta,
    cantidad bigint,
    porcentaje numeric
)
LANGUAGE plpgsql
AS $function$
DECLARE
    v_total bigint;
BEGIN
    -- Obtener total de encuestas
    SELECT COUNT(*) INTO v_total
    FROM public.diseno_encuestas
    WHERE p_id_sucursal IS NULL OR id_sucursal = p_id_sucursal;

    -- Retornar estadísticas por estado
    RETURN QUERY
    SELECT
        de.estado,
        COUNT(*)::bigint AS cantidad,
        CASE
            WHEN v_total > 0 THEN ROUND((COUNT(*)::numeric / v_total) * 100, 2)
            ELSE 0
        END AS porcentaje
    FROM public.diseno_encuestas de
    WHERE p_id_sucursal IS NULL OR de.id_sucursal = p_id_sucursal
    GROUP BY de.estado
    ORDER BY de.estado;
END;
$function$;

-- Actualizar funciones existentes para usar la nueva columna estado
-- (Las funciones se actualizarán en migraciones posteriores para mantener compatibilidad)

COMMIT;