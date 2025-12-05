-- =====================================================
-- SCRIPT COMPLETO: TODAS LAS FUNCIONES FALTANTES
-- Fecha: 2025-11-24
-- Descripción: Funciones faltantes después de complete_migration.sql
-- =====================================================

-- Función para actualizar configuración de scraping
CREATE OR REPLACE FUNCTION public.actualizar_configuracion_scraping(p_id_config integer, p_nombre_configuracion character varying, p_descripcion text, p_fuentes_activas integer[], p_palabras_clave_activas integer[], p_frecuencia_minutos integer, p_esta_activa boolean, p_configuracion_avanzada jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Validar que la configuración existe
    IF NOT EXISTS (SELECT 1 FROM public.configuracion_scraping WHERE id_config = p_id_config) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Configuración no encontrada');
    END IF;

    -- Actualizar configuración
    UPDATE public.configuracion_scraping
    SET
        nombre_configuracion = p_nombre_configuracion,
        descripcion = p_descripcion,
        fuentes_activas = p_fuentes_activas,
        palabras_clave_activas = p_palabras_clave_activas,
        frecuencia_minutos = p_frecuencia_minutos,
        esta_activa = p_esta_activa,
        configuracion_avanzada = p_configuracion_avanzada,
        actualizado_en = NOW()
    WHERE id_config = p_id_config;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Configuración de scraping actualizada exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error al actualizar configuración: ' || SQLERRM
    );
END;
$function$;

-- Función para actualizar configuración del sistema
CREATE OR REPLACE FUNCTION public.actualizar_configuracion_sistema(p_clave character varying, p_valor text, p_tipo character varying, p_descripcion text, p_es_sensible boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Insertar o actualizar configuración
    INSERT INTO public.configuraciones_sistema (clave, valor, tipo, descripcion, es_sensible, creado_en, actualizado_en)
    VALUES (p_clave, p_valor, p_tipo, p_descripcion, p_es_sensible, NOW(), NOW())
    ON CONFLICT (clave)
    DO UPDATE SET
        valor = EXCLUDED.valor,
        tipo = EXCLUDED.tipo,
        descripcion = EXCLUDED.descripcion,
        es_sensible = EXCLUDED.es_sensible,
        actualizado_en = NOW();

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Configuración actualizada exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error al actualizar configuración: ' || SQLERRM
    );
END;
$function$;

-- Función para actualizar estadísticas
CREATE OR REPLACE FUNCTION public.actualizar_estadisticas(p_id_palabra integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_total_resultados INT;
    v_promedio_sentimiento NUMERIC;
BEGIN
    SELECT COUNT(*), AVG(
        CASE
            WHEN sentimiento = 'positivo' THEN 1
            WHEN sentimiento = 'negativo' THEN -1
            ELSE 0
        END
    )
    INTO v_total_resultados, v_promedio_sentimiento
    FROM public.resultados
    WHERE id_palabra = p_id_palabra;

    UPDATE public.estadisticas
    SET total_resultados = v_total_resultados,
        promedio_sentimiento = v_promedio_sentimiento,
        actualizado_en = NOW()
    WHERE id_palabra = p_id_palabra;
END;
$function$;

-- Función para actualizar estadísticas de palabra clave
CREATE OR REPLACE FUNCTION public.actualizar_estadisticas_palabra(p_id_palabra integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_fecha_inicio TIMESTAMP WITH TIME ZONE;
    v_fecha_fin TIMESTAMP WITH TIME ZONE;
    v_total_resultados INTEGER := 0;
    v_promedio_sentimiento NUMERIC(5,2) := 0;
    v_prev_count INTEGER := 0;
    v_tendencia NUMERIC(5,2) := 0;
BEGIN
    v_fecha_fin := NOW();
    v_fecha_inicio := v_fecha_fin - INTERVAL '24 hours';

    -- Calculate stats for last 24 hours
    SELECT
        COUNT(*)::INTEGER,
        AVG(
            CASE
                WHEN sentimiento = 'positivo' THEN 1.0
                WHEN sentimiento = 'negativo' THEN -1.0
                ELSE 0.0
            END
        )::NUMERIC(5,2)
    INTO
        v_total_resultados,
        v_promedio_sentimiento
    FROM
        resultados
    WHERE
        id_palabra = p_id_palabra
        AND fecha_publicacion BETWEEN v_fecha_inicio AND v_fecha_fin;

    v_total_resultados := COALESCE(v_total_resultados, 0);
    v_promedio_sentimiento := COALESCE(v_promedio_sentimiento, 0);

    -- Previous period count (previous 24 hours)
    SELECT COUNT(*)::INTEGER INTO v_prev_count
    FROM resultados
    WHERE id_palabra = p_id_palabra
      AND fecha_publicacion BETWEEN (v_fecha_inicio - INTERVAL '24 hours') AND v_fecha_inicio;

    v_prev_count := COALESCE(v_prev_count, 0);

    IF v_prev_count = 0 THEN
        IF v_total_resultados = 0 THEN
            v_tendencia := 0;
        ELSE
            v_tendencia := 100.0; -- define 100% increase if previous was 0 and current > 0
        END IF;
    ELSE
        v_tendencia := (v_total_resultados - v_prev_count) * 100.0 / v_prev_count;
    END IF;

    -- Insert or update statistics
    INSERT INTO estadisticas (
        id_palabra,
        fecha_inicio,
        fecha_fin,
        total_resultados,
        promedio_sentimiento,
        tendencia,
        datos_agregados,
        creado_en
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
        ),
        NOW()
    )
    ON CONFLICT (id_palabra, fecha_inicio, fecha_fin)
    DO UPDATE SET
        total_resultados = EXCLUDED.total_resultados,
        promedio_sentimiento = EXCLUDED.promedio_sentimiento,
        tendencia = EXCLUDED.tendencia,
        datos_agregados = COALESCE(estadisticas.datos_agregados, '{}'::jsonb) ||
                         jsonb_build_object('ultima_actualizacion', NOW()),
        creado_en = COALESCE(estadisticas.creado_en, NOW());

    -- Log the operation (if log_proceso exists)
    PERFORM public.log_proceso(
        'actualizacion_estadisticas',
        'completado',
        'Estadísticas actualizadas para la palabra clave con ID ' || p_id_palabra,
        'Total resultados: ' || COALESCE(v_total_resultados::text, '0') ||
        ', Sentimiento promedio: ' || COALESCE(v_promedio_sentimiento::text, 'N/A') ||
        ', Tendencia: ' || COALESCE(v_tendencia::text, 'N/A') || '%',
        NULL,
        '{}'::jsonb,
        NULL
    );
END;
$function$;

-- Función para actualizar rol
CREATE OR REPLACE FUNCTION public.actualizar_rol(p_id_rol integer, p_nombre_rol character varying, p_descripcion text, p_nivel_acceso integer, p_permisos_json jsonb, p_puede_crear_usuarios boolean, p_puede_ver_todas_sucursales boolean, p_esta_activo boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Validar que el rol existe
    IF NOT EXISTS (SELECT 1 FROM public.usuarios_roles WHERE id_rol = p_id_rol) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Rol no encontrado');
    END IF;

    -- Actualizar rol
    UPDATE public.usuarios_roles
    SET
        nombre_rol = p_nombre_rol,
        descripcion = p_descripcion,
        nivel_acceso = p_nivel_acceso,
        permisos_json = p_permisos_json,
        puede_crear_usuarios = p_puede_crear_usuarios,
        puede_ver_todas_sucursales = p_puede_ver_todas_sucursales,
        esta_activo = p_esta_activo,
        actualizado_en = NOW()
    WHERE id_rol = p_id_rol;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Rol actualizado exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error al actualizar rol: ' || SQLERRM
    );
END;
$function$;

-- Función para buscar palabras clave
CREATE OR REPLACE FUNCTION public.buscar_palabras_clave(p_busqueda text DEFAULT NULL::text, p_id_usuario uuid DEFAULT NULL::uuid, p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0)
 RETURNS TABLE(id_palabra integer, palabra text, descripcion text, total_resultados bigint, ultimo_resultado timestamp with time zone)
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
$function$;

-- Función para contar registros
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

-- Función para crear encuesta personalizada
CREATE OR REPLACE FUNCTION public.crear_encuesta_personalizada(p_titulo character varying, p_descripcion text, p_tipo_encuesta character varying, p_id_sucursal integer, p_estructura_json jsonb, p_creado_por uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_id_diseno INTEGER;
BEGIN
    INSERT INTO public.diseno_encuestas (
        titulo,
        descripcion,
        tipo_encuesta,
        id_sucursal,
        estructura_json,
        creado_por
    ) VALUES (
        p_titulo,
        p_descripcion,
        p_tipo_encuesta,
        p_id_sucursal,
        p_estructura_json,
        p_creado_por
    ) RETURNING id_diseno INTO v_id_diseno;

    RETURN json_build_object(
        'success', true,
        'diseno_id', v_id_diseno,
        'message', 'Encuesta personalizada creada exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Error al crear encuesta: ' || SQLERRM
    );
END;
$function$;

-- Función para crear nuevo usuario en el sistema
CREATE OR REPLACE FUNCTION public.crear_nuevo_usuario_sistema(p_email text, p_password text, p_nombre_completo text, p_codigo_rol text, p_codigo_grupo text, p_id_sucursal integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_user_id UUID;
    v_rol_id INTEGER;
    v_grupo_id INTEGER;
    v_max_attempts INTEGER := 10;
    v_attempt INTEGER := 0;
BEGIN
    -- Validaciones iniciales
    IF p_email IS NULL OR p_email = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Email es requerido');
    END IF;

    IF p_password IS NULL OR length(p_password) < 6 THEN
        RETURN jsonb_build_object('success', false, 'message', 'Contraseña debe tener al menos 6 caracteres');
    END IF;

    IF p_nombre_completo IS NULL OR p_nombre_completo = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Nombre completo es requerido');
    END IF;

    IF p_codigo_rol IS NULL OR p_codigo_rol = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Código de rol es requerido');
    END IF;

    IF p_codigo_grupo IS NULL OR p_codigo_grupo = '' THEN
        RETURN jsonb_build_object('success', false, 'message', 'Código de grupo es requerido');
    END IF;

    -- Validar que no existe el usuario
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
        RETURN jsonb_build_object('success', false, 'message', 'El email ya está registrado');
    END IF;

    IF EXISTS (SELECT 1 FROM public.usuarios WHERE correo = p_email) THEN
        RETURN jsonb_build_object('success', false, 'message', 'El usuario ya existe en el sistema');
    END IF;

    -- Obtener y validar IDs de rol y grupo
    SELECT id_rol INTO v_rol_id FROM public.usuarios_roles WHERE codigo_rol = p_codigo_rol AND esta_activo = true;
    SELECT id_grupo INTO v_grupo_id FROM public.usuarios_grupos WHERE codigo_grupo = p_codigo_grupo AND esta_activo = true;

    IF v_rol_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Rol no válido: ' || p_codigo_rol);
    END IF;

    IF v_grupo_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Grupo no válido: ' || p_codigo_grupo);
    END IF;

    -- Validar sucursal
    IF NOT EXISTS (SELECT 1 FROM public.sucursales WHERE id_suc = p_id_sucursal AND estado = 'Activo') THEN
        RETURN jsonb_build_object('success', false, 'message', 'Sucursal no válida');
    END IF;

    -- Generar UUID único
    WHILE v_attempt < v_max_attempts LOOP
        v_user_id := gen_random_uuid();
        v_attempt := v_attempt + 1;

        IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id_usuario = v_user_id)
           AND NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
            EXIT;
        END IF;

        IF v_attempt >= v_max_attempts THEN
            RETURN jsonb_build_object('success', false, 'message', 'No se pudo generar ID único');
        END IF;
    END LOOP;

    -- Crear usuario en public.usuarios
    INSERT INTO public.usuarios (
        id_usuario, correo, hash_contraseña, id_rol, nombre_completo,
        esta_activo, creado_en, actualizado_en, id_suc
    ) VALUES (
        v_user_id, p_email, crypt(p_password, gen_salt('bf')),
        v_rol_id, p_nombre_completo, true, now(), now(), p_id_sucursal
    );

    -- Crear asignación
    INSERT INTO public.asignaciones_usuario (
        id_usuario, id_grupo, id_rol, id_sucursal, es_principal, esta_activa, creado_en
    ) VALUES (
        v_user_id, v_grupo_id, v_rol_id, p_id_sucursal, true, true, now()
    );

    -- Crear en auth.users
    INSERT INTO auth.users (
        id, instance_id, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, is_super_admin, role
    ) VALUES (
        v_user_id, '00000000-0000-0000-0000-000000000000', p_email,
        crypt(p_password, gen_salt('bf')), now(), now(), now(),
        jsonb_build_object('full_name', p_nombre_completo, 'role', p_codigo_rol),
        false, 'authenticated'
    );

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Usuario creado exitosamente',
        'user_id', v_user_id,
        'email', p_email
    );

EXCEPTION WHEN OTHERS THEN
    -- Limpiar en caso de error
    BEGIN
        DELETE FROM auth.users WHERE id = v_user_id;
        DELETE FROM public.asignaciones_usuario WHERE id_usuario = v_user_id;
        DELETE FROM public.usuarios WHERE id_usuario = v_user_id;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error: ' || SQLERRM
    );
END;
$function$;

-- Función para crear planificación de trabajo
CREATE OR REPLACE FUNCTION public.crear_planificacion_trabajo(p_titulo character varying, p_descripcion text, p_tipo_trabajo character varying, p_id_sucursal integer, p_id_responsable uuid, p_fecha_inicio date, p_fecha_fin date, p_presupuesto_estimado numeric, p_creado_por uuid)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_id_planificacion INTEGER;
BEGIN
    INSERT INTO public.planificacion_trabajos (
        titulo,
        descripcion,
        tipo_trabajo,
        id_sucursal,
        id_usuario_responsable,
        fecha_inicio,
        fecha_fin,
        presupuesto_estimado,
        creado_por
    ) VALUES (
        p_titulo,
        p_descripcion,
        p_tipo_trabajo,
        p_id_sucursal,
        p_id_responsable,
        p_fecha_inicio,
        p_fecha_fin,
        p_presupuesto_estimado,
        p_creado_por
    ) RETURNING id_planificacion INTO v_id_planificacion;

    -- Log de la operación
    PERFORM public.log_proceso(
        'crear_planificacion',
        'completado',
        'Planificación creada: ' || p_titulo,
        'ID: ' || v_id_planificacion::text,
        p_creado_por,
        json_build_object('planificacion_id', v_id_planificacion),
        NULL
    );

    RETURN json_build_object(
        'success', true,
        'planificacion_id', v_id_planificacion,
        'message', 'Planificación creada exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Error al crear planificación: ' || SQLERRM
    );
END;
$function$;

-- Función para generar reporte
CREATE OR REPLACE FUNCTION public.generar_reporte(p_titulo text, p_descripcion text, p_tipo_reporte text, p_parametros jsonb, p_id_usuario_solicitante uuid)
 RETURNS uuid
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_id_reporte UUID;
    v_nombre_archivo TEXT;
BEGIN
    v_nombre_archivo := 'reporte_' || REPLACE(LOWER(p_tipo_reporte), ' ', '_') || '_' ||
                        TO_CHAR(NOW(), 'YYYYMMDD_HH24MISS') || '.pdf';

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
        fecha_completado,
        creado_en
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
        NULL,
        NOW()
    )
    RETURNING id_reporte INTO v_id_reporte;

    RETURN v_id_reporte;
END;
$function$;

-- Función para generar reporte consolidado
CREATE OR REPLACE FUNCTION public.generar_reporte_consolidado(p_fecha_inicio timestamp without time zone, p_fecha_fin timestamp without time zone)
 RETURNS TABLE(sucursal_id integer, total_actividades integer, total_encuestas integer)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        a.id_sucursal,
        COUNT(DISTINCT a.id_actividad) AS total_actividades,
        COUNT(DISTINCT e.id_encue) AS total_encuestas
    FROM public.actividad_matriz a
    LEFT JOIN public.encuesta_uss e ON a.id_sucursal = e.sucursal_dida
    WHERE a.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY a.id_sucursal;
END;
$function$;

-- Función para generar reporte consolidado por sucursal
CREATE OR REPLACE FUNCTION public.generar_reporte_consolidado_sucursal(p_id_sucursal integer, p_fecha_inicio date, p_fecha_fin date)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_reporte JSON;
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
        'actividades', json_build_object(
            'total', COUNT(DISTINCT am.id_actividad),
            'por_tipo', json_object_agg(
                COALESCE(am.tipo_actividad, 'Sin tipo'),
                COUNT(DISTINCT am.id_actividad)
            ) FILTER (WHERE am.id_actividad IS NOT NULL),
            'completadas', COUNT(DISTINCT am.id_actividad) FILTER (WHERE am.estado_actividad = 'completada')
        ),
        'encuestas', json_build_object(
            'uss', COUNT(DISTINCT eu.id_encue),
            'pss', COUNT(DISTINCT ep.id_encue)
        ),
        'usuarios_activos', COUNT(DISTINCT u.id_usuario) FILTER (WHERE u.ultimo_acceso >= p_fecha_inicio)
    ) INTO v_reporte
    FROM public.sucursales s
    LEFT JOIN public.actividad_matriz am ON s.id_suc = am.id_sucursal
        AND am.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    LEFT JOIN public.encuesta_uss eu ON s.id_suc = eu.sucursal_dida
        AND eu.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    LEFT JOIN public.encuesta_pss ep ON s.id_suc = ep.sucursal
        AND ep.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    LEFT JOIN public.asignaciones_usuario au ON s.id_suc = au.id_sucursal
    LEFT JOIN public.usuarios u ON au.id_usuario = u.id_usuario
    WHERE s.id_suc = p_id_sucursal
    GROUP BY s.id_suc, s.nombre_sucursal, s.provincia;

    RETURN v_reporte;
END;
$function$;

-- Función para log de procesos
CREATE OR REPLACE FUNCTION public.log_proceso(p_tipo_proceso character varying, p_estado character varying, p_mensaje text, p_detalles text DEFAULT NULL::text, p_id_usuario uuid DEFAULT NULL::uuid, p_metadatos jsonb DEFAULT '{}'::jsonb, p_ip_origen inet DEFAULT NULL::inet)
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
        fecha_inicio,
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
$function$;

-- Función para marcar notificación como leída
CREATE OR REPLACE FUNCTION public.marcar_notificacion_leida(p_id_notificacion integer, p_id_usuario uuid)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
BEGIN
    UPDATE public.notificaciones_sistema
    SET es_leida = true, leida_en = NOW()
    WHERE id_notificacion = p_id_notificacion
    AND (id_usuario_destinatario = p_id_usuario OR es_global = true);

    RETURN FOUND;
END;
$function$;

-- Función para obtener actividades
CREATE OR REPLACE FUNCTION public.obtener_actividades(p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0)
 RETURNS TABLE(id_actividad integer, tipo_actividad text, descripcion text, fecha date, ubicacion text, usuario_asignado text, resultado text, creado_en timestamp with time zone)
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

-- Función para obtener actividades filtradas
CREATE OR REPLACE FUNCTION public.obtener_actividades_filtradas(p_id_sucursal integer, p_tipo_actividad character varying, p_estado character varying, p_fecha_inicio date, p_fecha_fin date, p_limite integer, p_desplazamiento integer)
 RETURNS TABLE(id_actividad integer, tipo_actividad character varying, descripcion text, fecha date, ubicacion character varying, usuario_asignado text, estado_actividad text, sucursal_nombre text, resultado text, creado_en timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        am.id_actividad,
        am.tipo_actividad,
        am.descripcion,
        am.fecha,
        am.ubicacion,
        u.nombre_completo,
        am.estado_actividad,
        s.nombre_sucursal,
        am.resultado,
        am.creado_en
    FROM public.actividad_matriz am
    LEFT JOIN public.usuarios u ON am.id_usuario_asignado = u.id_usuario
    LEFT JOIN public.sucursales s ON am.id_sucursal = s.id_suc
    WHERE (p_id_sucursal IS NULL OR am.id_sucursal = p_id_sucursal)
    AND (p_tipo_actividad IS NULL OR am.tipo_actividad = p_tipo_actividad)
    AND (p_estado IS NULL OR am.estado_actividad = p_estado)
    AND (p_fecha_inicio IS NULL OR am.fecha >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR am.fecha <= p_fecha_fin)
    ORDER BY am.fecha DESC, am.creado_en DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$function$;

-- Función para obtener actividades de usuario
CREATE OR REPLACE FUNCTION public.obtener_actividades_usuario(p_id_usuario uuid, p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0)
 RETURNS TABLE(id_actividad integer, tipo_actividad text, descripcion text, fecha date, ubicacion text, resultado text, creado_en timestamp with time zone)
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

-- Función para obtener alertas activas
CREATE OR REPLACE FUNCTION public.obtener_alertas_activas(p_limite integer DEFAULT 10)
 RETURNS TABLE(id_log bigint, tipo_proceso text, mensaje text, fecha_inicio timestamp with time zone)
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

-- Función para obtener configuraciones de scraping
CREATE OR REPLACE FUNCTION public.obtener_configuraciones_scraping()
 RETURNS TABLE(id_config integer, nombre_configuracion character varying, descripcion text, fuentes_activas integer[], palabras_clave_activas integer[], frecuencia_minutos integer, esta_activa boolean, configuracion_avanzada jsonb, creado_por uuid, nombre_creador character varying, creado_en timestamp with time zone, actualizado_en timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        cs.id_config,
        cs.nombre_configuracion,
        cs.descripcion,
        cs.fuentes_activas,
        cs.palabras_clave_activas,
        cs.frecuencia_minutos,
        cs.esta_activa,
        cs.configuracion_avanzada,
        cs.creado_por,
        u.nombre_completo,
        cs.creado_en,
        cs.actualizado_en
    FROM public.configuracion_scraping cs
    LEFT JOIN public.usuarios u ON cs.creado_por = u.id_usuario
    ORDER BY cs.creado_en DESC;
END;
$function$;

-- Función para obtener configuraciones del sistema
CREATE OR REPLACE FUNCTION public.obtener_configuraciones_sistema()
 RETURNS TABLE(clave character varying, valor text, tipo character varying, descripcion text, es_sensible boolean, creado_en timestamp with time zone, actualizado_en timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        cs.clave,
        cs.valor,
        cs.tipo,
        cs.descripcion,
        cs.es_sensible,
        cs.creado_en,
        cs.actualizado_en
    FROM public.configuraciones_sistema cs
    ORDER BY cs.clave ASC;
END;
$function$;

-- Función para obtener encuestas
CREATE OR REPLACE FUNCTION public.obtener_encuestas(p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0)
 RETURNS TABLE(id_encuesta integer, titulo text, descripcion text, estado text, fecha_creacion timestamp with time zone, total_respuestas bigint)
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
    LEFT JOIN survey_responses sr ON s.id_encuesta = sr.id_encuesta
    GROUP BY s.id_encuesta, s.titulo, s.descripcion, s.estado, s.fecha_creacion
    ORDER BY s.fecha_creacion DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$function$;

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_dashboard()
 RETURNS TABLE(total_usuarios bigint, usuarios_activos bigint, total_palabras_clave bigint, total_resultados bigint, reportes_pendientes bigint, alertas_activas bigint)
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

-- Función para obtener estadísticas del dashboard por sucursal
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_dashboard_sucursal(p_id_sucursal integer DEFAULT NULL::integer, p_fecha_inicio date DEFAULT (CURRENT_DATE - '30 days'::interval), p_fecha_fin date DEFAULT CURRENT_DATE)
 RETURNS json
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_estadisticas JSON;
BEGIN
    SELECT json_build_object(
        'usuarios', json_build_object(
            'total', COUNT(DISTINCT u.id_usuario),
            'activos', COUNT(DISTINCT CASE WHEN u.ultimo_acceso > NOW() - INTERVAL '24 hours' THEN u.id_usuario END)
        ),
        'actividades', json_build_object(
            'total', COUNT(DISTINCT am.id_actividad),
            'completadas', COUNT(DISTINCT CASE WHEN am.estado_actividad = 'completada' THEN am.id_actividad END),
            'en_progreso', COUNT(DISTINCT CASE WHEN am.estado_actividad = 'en_progreso' THEN am.id_actividad END)
        ),
        'encuestas', json_build_object(
            'uss_total', COUNT(DISTINCT eu.id_encue),
            'pss_total', COUNT(DISTINCT ep.id_encue)
        ),
        'planificaciones', json_build_object(
            'total', COUNT(DISTINCT pt.id_planificacion),
            'activas', COUNT(DISTINCT CASE WHEN pt.estado = 'en_progreso' THEN pt.id_planificacion END)
        ),
        'palabras_clave_activas', (
            SELECT COUNT(*) FROM public.palabras_clave
            WHERE fecha_creacion >= p_fecha_inicio
        ),
        'resultados_recientes', (
            SELECT COUNT(*) FROM public.resultados
            WHERE fecha_extraccion >= p_fecha_inicio
        )
    ) INTO v_estadisticas
    FROM public.usuarios u
    LEFT JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
    LEFT JOIN public.actividad_matriz am ON au.id_sucursal = am.id_sucursal
    LEFT JOIN public.encuesta_uss eu ON au.id_sucursal = eu.sucursal_dida
    LEFT JOIN public.encuesta_pss ep ON au.id_sucursal = ep.sucursal
    LEFT JOIN public.planificacion_trabajos pt ON au.id_sucursal = pt.id_sucursal
    WHERE (p_id_sucursal IS NULL OR au.id_sucursal = p_id_sucursal)
    AND au.esta_activa = true
    AND (am.fecha IS NULL OR am.fecha BETWEEN p_fecha_inicio AND p_fecha_fin);

    RETURN v_estadisticas;
END;
$function$;

-- Función para obtener estadísticas por departamentos
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_departamentos(p_fecha_inicio date DEFAULT (CURRENT_DATE - '30 days'::interval), p_fecha_fin date DEFAULT CURRENT_DATE)
 RETURNS TABLE(departamento text, total_trabajos bigint, completados bigint, en_progreso bigint, pendientes bigint, porcentaje_completado numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    WITH trabajos_por_depto AS (
        SELECT
            CASE
                WHEN tipo_actividad LIKE '%Monitoreo%' THEN 'Monitoreo'
                WHEN tipo_actividad LIKE '%Promocion%' THEN 'Promociones'
                WHEN tipo_actividad LIKE '%Encuesta%' THEN 'Encuestas'
                ELSE 'Otros'
            END AS depto,
            estado_actividad
        FROM public.actividad_matriz
        WHERE fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    )
    SELECT
        depto AS departamento,
        COUNT(*)::bigint AS total_trabajos,
        COUNT(*) FILTER (WHERE estado_actividad = 'completada')::bigint AS completados,
        COUNT(*) FILTER (WHERE estado_actividad = 'en_progreso')::bigint AS en_progreso,
        COUNT(*) FILTER (WHERE estado_actividad = 'pendiente' OR estado_actividad IS NULL)::bigint AS pendientes,
        ROUND(
            (COUNT(*) FILTER (WHERE estado_actividad = 'completada')::numeric /
            NULLIF(COUNT(*)::numeric, 0)) * 100,
            2
        ) AS porcentaje_completado
    FROM trabajos_por_depto
    GROUP BY depto
    ORDER BY total_trabajos DESC;
END;
$function$;

-- Función para obtener estadísticas por palabra clave
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_palabra(p_id_palabra integer, p_fecha_inicio timestamp with time zone DEFAULT (now() - '30 days'::interval), p_fecha_fin timestamp with time zone DEFAULT now())
 RETURNS TABLE(fecha date, total_resultados bigint, promedio_sentimiento numeric, fuentes jsonb)
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
$function$;

-- Función para obtener estadísticas por período
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_por_periodo(p_id_palabra integer, p_tipo_periodo character varying DEFAULT 'day'::character varying, p_limite integer DEFAULT 30)
 RETURNS TABLE(periodo timestamp with time zone, total_resultados bigint, positivos bigint, negativos bigint, neutros bigint, sentimiento_promedio numeric)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_interval TEXT;
    v_interval_value INTEGER;
    v_step INTERVAL;
    v_period_start timestamp with time zone;
BEGIN
    -- Normalize inputs
    v_interval_value := GREATEST(p_limite, 1);

    CASE p_tipo_periodo
        WHEN 'hour' THEN v_interval := '1 hour';
        WHEN 'day' THEN v_interval := '1 day';
        WHEN 'week' THEN v_interval := '1 week';
        WHEN 'month' THEN v_interval := '1 month';
        ELSE v_interval := '1 day';
    END CASE;

    -- Build step as interval dividing the span into p_limite parts
    v_step := (v_interval::interval);

    -- Generate a series of periods ending now
    RETURN QUERY
    WITH periodos AS (
        SELECT generate_series(
            DATE_TRUNC(p_tipo_periodo, NOW() - (v_interval_value * v_interval::interval)),
            DATE_TRUNC(p_tipo_periodo, NOW()),
            v_step
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
$function$;

-- Función para obtener logs de todos los procesos
CREATE OR REPLACE FUNCTION public.obtener_logs_todos(p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0, p_tipo_proceso text DEFAULT NULL::text)
 RETURNS TABLE(id_log bigint, tipo_proceso text, estado text, mensaje text, fecha_inicio timestamp with time zone)
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

-- Función para obtener notificaciones de usuario
CREATE OR REPLACE FUNCTION public.obtener_notificaciones_usuario(p_id_usuario uuid, p_solo_no_leidas boolean DEFAULT false, p_limite integer DEFAULT 10)
 RETURNS TABLE(id_notificacion integer, titulo character varying, mensaje text, tipo character varying, es_leida boolean, creado_en timestamp with time zone, metadatos jsonb)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        ns.id_notificacion,
        ns.titulo,
        ns.mensaje,
        ns.tipo,
        ns.es_leida,
        ns.creado_en,
        ns.metadatos
    FROM public.notificaciones_sistema ns
    LEFT JOIN public.asignaciones_usuario au ON ns.id_grupo_destinatario = au.id_grupo
    WHERE (ns.id_usuario_destinatario = p_id_usuario
           OR au.id_usuario = p_id_usuario
           OR ns.es_global = true)
    AND (NOT p_solo_no_leidas OR ns.es_leida = false)
    AND (ns.fecha_expiracion IS NULL OR ns.fecha_expiracion > NOW())
    ORDER BY ns.creado_en DESC
    LIMIT p_limite;
END;
$function$;

-- Función para obtener palabras clave recientes
CREATE OR REPLACE FUNCTION public.obtener_palabras_clave_recientes(p_limite integer DEFAULT 10)
 RETURNS TABLE(id_palabra integer, palabra text, descripcion text, total_resultados bigint, fecha_creacion timestamp with time zone)
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

-- Función para obtener todas las palabras clave
CREATE OR REPLACE FUNCTION public.obtener_palabras_clave_todas(p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0)
 RETURNS TABLE(id_palabra integer, palabra text, descripcion text, total_resultados bigint, es_publica boolean, fecha_creacion timestamp with time zone)
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

-- Función para obtener permisos de usuario
CREATE OR REPLACE FUNCTION public.obtener_permisos_usuario(p_user_id uuid)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_resultado JSON;
BEGIN
    SELECT json_build_object(
        'usuario', json_build_object(
            'id', u.id_usuario,
            'nombre_completo', u.nombre_completo,
            'correo', u.correo,
            'esta_activo', u.esta_activo
        ),
        'asignaciones', COALESCE(
            json_agg(
                json_build_object(
                    'grupo', json_build_object(
                        'codigo', ug.codigo_grupo,
                        'nombre', ug.nombre_grupo
                    ),
                    'rol', json_build_object(
                        'codigo', ur.codigo_rol,
                        'nombre', ur.nombre_rol,
                        'nivel_acceso', ur.nivel_acceso,
                        'permisos', ur.permisos_json
                    ),
                    'sucursal', json_build_object(
                        'id', s.id_suc,
                        'nombre', s.nombre_sucursal,
                        'provincia', s.provincia
                    ),
                    'es_principal', au.es_principal,
                    'esta_activa', au.esta_activa
                )
            ) FILTER (WHERE au.esta_activa = true), '[]'::json
        )
    ) INTO v_resultado
    FROM public.usuarios u
    LEFT JOIN public.usuarios_asignaciones au ON u.id_usuario = au.id_usuario
    LEFT JOIN public.usuarios_grupos ug ON au.id_grupo = ug.id_grupo
    LEFT JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
    LEFT JOIN public.sucursales s ON au.id_sucursal = s.id_suc
    WHERE u.id_usuario = p_user_id
    GROUP BY u.id_usuario, u.nombre_completo, u.correo, u.esta_activo;

    RETURN COALESCE(v_resultado, json_build_object('error', 'Usuario no encontrado'));
END;
$function$;

-- Función para obtener reportes pendientes
CREATE OR REPLACE FUNCTION public.obtener_reportes_pendientes(p_limite integer DEFAULT 10)
 RETURNS TABLE(id_reporte uuid, titulo text, tipo_reporte text, estado text, fecha_solicitud timestamp with time zone)
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

-- Función para obtener todos los reportes
CREATE OR REPLACE FUNCTION public.obtener_reportes_todos(p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0)
 RETURNS TABLE(id_reporte uuid, titulo text, tipo_reporte text, estado text, fecha_solicitud timestamp with time zone, fecha_completado timestamp with time zone)
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

-- Función para obtener respuestas de encuesta
CREATE OR REPLACE FUNCTION public.obtener_respuestas_encuesta(p_id_encuesta integer)
 RETURNS TABLE(id_respuesta integer, id_usuario uuid, respuesta_json jsonb, fecha_respuesta timestamp with time zone)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        sr.id_respuesta,
        sr.id_usuario,
        sr.respuesta_json,
        sr.fecha_respuesta
    FROM survey_responses sr
    WHERE sr.id_encuesta = p_id_encuesta
    ORDER BY sr.fecha_respuesta DESC;
END;
$function$;

-- Función para obtener resultados recientes
CREATE OR REPLACE FUNCTION public.obtener_resultados_recientes(p_limite integer DEFAULT 10)
 RETURNS TABLE(id_resultado bigint, palabra text, fuente_nombre text, titulo text, autor text, fecha_publicacion timestamp with time zone, sentimiento text, relevancia integer)
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

-- Función para obtener todos los resultados
CREATE OR REPLACE FUNCTION public.obtener_resultados_todos(p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0, p_id_palabra integer DEFAULT NULL::integer, p_sentimiento text DEFAULT NULL::text)
 RETURNS TABLE(id_resultado bigint, palabra text, fuente_nombre text, titulo text, autor text, fecha_publicacion timestamp with time zone, sentimiento text, relevancia integer)
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

-- Función para obtener todos los roles
CREATE OR REPLACE FUNCTION public.obtener_roles_todos()
 RETURNS TABLE(id_rol integer, codigo_rol character varying, nombre_rol character varying, descripcion text, nivel_acceso integer, permisos_json jsonb, puede_crear_usuarios boolean, puede_ver_todas_sucursales boolean, esta_activo boolean, creado_en timestamp with time zone, total_usuarios bigint)
 LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT
        ur.id_rol,
        ur.codigo_rol,
        ur.nombre_rol,
        ur.descripcion,
        ur.nivel_acceso,
        ur.permisos_json,
        ur.puede_crear_usuarios,
        ur.puede_ver_todas_sucursales,
        ur.esta_activo,
        ur.creado_en,
        COUNT(u.id_usuario)::bigint AS total_usuarios
    FROM public.usuarios_roles ur
    LEFT JOIN public.usuarios u ON ur.id_rol = u.id_rol
    GROUP BY ur.id_rol, ur.codigo_rol, ur.nombre_rol, ur.descripcion,
             ur.nivel_acceso, ur.permisos_json, ur.puede_crear_usuarios,
             ur.puede_ver_todas_sucursales, ur.esta_activo, ur.creado_en
    ORDER BY ur.nivel_acceso ASC;
END;
$function$;

-- Función para obtener usuarios
CREATE OR REPLACE FUNCTION public.obtener_usuarios(p_limite integer DEFAULT 10, p_desplazamiento integer DEFAULT 0)
 RETURNS TABLE(id_usuario uuid, nombre_completo text, correo text, rol_nombre text, esta_activo boolean, creado_en timestamp with time zone)
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

-- Función para obtener usuarios activos
CREATE OR REPLACE FUNCTION public.obtener_usuarios_activos(p_limite integer DEFAULT 10)
 RETURNS TABLE(id_usuario uuid, nombre_completo text, correo text, ultimo_acceso timestamp with time zone, rol_nombre text)
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

-- Función para verificar si usuario tiene permiso
CREATE OR REPLACE FUNCTION public.usuario_tiene_permiso(p_usuario_id uuid, p_permiso text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.usuarios u
        JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
        JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
        WHERE u.id_usuario = p_usuario_id
        AND au.esta_activa = true
        AND (
            ur.permisos_json ? p_permiso
            OR ur.codigo_rol IN ('admin', 'super_user')
        )
    );
END;
$function$;

-- Función para actualizar columna actualizado_en (trigger)
CREATE OR REPLACE FUNCTION public.actualizar_columna_actualizado_en()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.actualizado_en := NOW();
    RETURN NEW;
END;
$function$;

-- Función para actualizar timestamp de modificación (trigger)
CREATE OR REPLACE FUNCTION public.actualizar_timestamp_modificacion()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.actualizado_en := NOW();
    RETURN NEW;
END;
$function$;

-- Función para agregar usuario
CREATE OR REPLACE FUNCTION public.agregar_usuario(p_correo character varying, p_nombre_completo character varying, p_rol_id integer, p_sucursal_id integer)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    INSERT INTO public.usuarios (correo, nombre_completo, id_rol, id_suc, creado_en)
    VALUES (p_correo, p_nombre_completo, p_rol_id, p_sucursal_id, NOW());
END;
$function$;

-- Función para crear admin user
CREATE OR REPLACE FUNCTION public.create_admin_user()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    admin_user_id UUID;
    user_email TEXT := 'baez.israel@gmail.com';
BEGIN
    -- Verificar si el usuario ya existe
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = user_email
    LIMIT 1;

    -- Si el usuario no existe, crearlo
    IF admin_user_id IS NULL THEN
        -- Insertar en auth.users (usando la función auth.create_user de Supabase)
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            is_super_admin,
            created_at,
            updated_at,
            phone,
            phone_confirmed_at
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            user_email,
            crypt('a12300', gen_salt('bf')), -- Contraseña: a12300
            NOW(), -- email confirmado
            false,
            NOW(),
            NOW(),
            '18092993185',
            NOW()
        ) RETURNING id INTO admin_user_id;

        RAISE NOTICE 'Usuario administrador creado con ID: %', admin_user_id;
    ELSE
        RAISE NOTICE 'El usuario administrador ya existe con ID: %', admin_user_id;
    END IF;

    -- Crear o actualizar el perfil del usuario
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        phone,
        role,
        updated_at
    ) VALUES (
        admin_user_id,
        'Israel Báez Herrera',
        user_email,
        '18092993185',
        'admin',
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        role = EXCLUDED.role,
        updated_at = NOW();

    RAISE NOTICE 'Perfil de administrador creado/actualizado correctamente';
END;
$function$;

-- Función para limpiar logs antiguos
CREATE OR REPLACE FUNCTION public.limpiar_logs_antiguos(p_dias_retencion integer DEFAULT 90)
 RETURNS integer
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_logs_eliminados INTEGER := 0;
BEGIN
    DELETE FROM logs_procesos
    WHERE fecha_inicio < (NOW() - (p_dias_retencion || ' days')::INTERVAL)
    RETURNING id_log INTO v_logs_eliminados;

    RETURN COALESCE(v_logs_eliminados, 0);
END;
$function$;

-- Función para agregar columna si no existe
CREATE OR REPLACE FUNCTION public.add_column_if_not_exists(tab text, col text, col_def text)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = tab AND column_name = col
  ) THEN
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN %I %s', tab, col, col_def);
    INSERT INTO ddl_migrations_log (mensaje) VALUES (format('Añadida columna %s a %s', col, tab));
  END IF;
END;
$function$;

-- Función para manejar evento de usuario de auth
CREATE OR REPLACE FUNCTION public.handle_auth_user_event()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  v_token text;
BEGIN
  SELECT confirmation_token INTO v_token FROM auth.users WHERE id = NEW.id;
  v_token := COALESCE(v_token, '');
  -- resto de la lógica usando v_token seguro
  RETURN NEW;
END;
$function$;

-- =====================================================
-- VERIFICACIÓN DE FUNCIONES CREADAS
-- =====================================================

SELECT
    'Funciones creadas exitosamente' as estado,
    COUNT(*) as total_funciones_creadas,
    NOW() as fecha_creacion
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION'
    AND routine_name NOT IN ('autenticar_usuario', 'obtener_usuarios_completos', 'actualizar_usuario', 'crear_usuario_completo');