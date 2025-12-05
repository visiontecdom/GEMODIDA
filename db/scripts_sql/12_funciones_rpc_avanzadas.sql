-- ============================================================================
-- GEMODIDA - Funciones RPC Avanzadas para Sistema de Roles y Gestión
-- ============================================================================

-- Función para crear usuario con asignación completa
CREATE OR REPLACE FUNCTION public.crear_usuario_completo(
    p_correo VARCHAR,
    p_nombre_completo VARCHAR,
    p_telefono VARCHAR,
    p_id_grupo INTEGER,
    p_id_rol INTEGER,
    p_id_sucursal INTEGER,
    p_creado_por UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_resultado JSON;
BEGIN
    -- Verificar permisos del usuario creador
    IF NOT EXISTS (
        SELECT 1 FROM public.usuarios u
        JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
        JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
        WHERE u.id_usuario = p_creado_por 
        AND ur.puede_crear_usuarios = true
        AND au.esta_activa = true
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'No tiene permisos para crear usuarios'
        );
    END IF;

    -- Verificar que el correo no exista
    IF EXISTS (SELECT 1 FROM public.usuarios WHERE correo = p_correo) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'El correo electrónico ya está registrado'
        );
    END IF;

    -- Generar UUID para el nuevo usuario
    v_user_id := gen_random_uuid();

    -- Insertar usuario
    INSERT INTO public.usuarios (
        id_usuario,
        correo,
        nombre_completo,
        telefono,
        hash_contraseña,
        esta_activo,
        creado_en
    ) VALUES (
        v_user_id,
        p_correo,
        p_nombre_completo,
        p_telefono,
        crypt('temporal123', gen_salt('bf')), -- Contraseña temporal
        true,
        NOW()
    );

    -- Crear asignación principal
    INSERT INTO public.asignaciones_usuario (
        id_usuario,
        id_grupo,
        id_rol,
        id_sucursal,
        es_principal,
        creado_por
    ) VALUES (
        v_user_id,
        p_id_grupo,
        p_id_rol,
        p_id_sucursal,
        true,
        p_creado_por
    );

    -- Log de la operación
    PERFORM public.log_proceso(
        'crear_usuario',
        'completado',
        'Usuario creado: ' || p_correo,
        'ID: ' || v_user_id::text,
        p_creado_por,
        json_build_object('nuevo_usuario_id', v_user_id),
        NULL
    );

    RETURN json_build_object(
        'success', true,
        'user_id', v_user_id,
        'message', 'Usuario creado exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', 'Error interno: ' || SQLERRM
    );
END;
$$;

-- Función para obtener permisos de usuario
CREATE OR REPLACE FUNCTION public.obtener_permisos_usuario(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_resultado JSON;
BEGIN
    SELECT json_build_object(
        'usuario', json_build_object(
            'id', u.id_usuario,
            'nombre', u.nombre_completo,
            'correo', u.correo,
            'esta_activo', u.esta_activo
        ),
        'asignaciones', json_agg(
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
        )
    ) INTO v_resultado
    FROM public.usuarios u
    LEFT JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
    LEFT JOIN public.usuarios_grupos ug ON au.id_grupo = ug.id_grupo
    LEFT JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
    LEFT JOIN public.sucursales s ON au.id_sucursal = s.id_suc
    WHERE u.id_usuario = p_user_id
    AND au.esta_activa = true
    GROUP BY u.id_usuario, u.nombre_completo, u.correo, u.esta_activo;

    RETURN COALESCE(v_resultado, json_build_object('error', 'Usuario no encontrado'));
END;
$$;

-- Función para obtener estadísticas del dashboard por sucursal
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_dashboard_sucursal(
    p_id_sucursal INTEGER DEFAULT NULL,
    p_fecha_inicio DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_fecha_fin DATE DEFAULT CURRENT_DATE
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
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
$$;

-- Función para gestionar planificación de trabajos
CREATE OR REPLACE FUNCTION public.crear_planificacion_trabajo(
    p_titulo VARCHAR,
    p_descripcion TEXT,
    p_tipo_trabajo VARCHAR,
    p_id_sucursal INTEGER,
    p_id_responsable UUID,
    p_fecha_inicio DATE,
    p_fecha_fin DATE,
    p_presupuesto_estimado DECIMAL,
    p_creado_por UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
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
$$;

-- Función para obtener actividades por sucursal y filtros
CREATE OR REPLACE FUNCTION public.obtener_actividades_filtradas(
    p_id_sucursal INTEGER,
    p_tipo_actividad VARCHAR,
    p_estado VARCHAR,
    p_fecha_inicio DATE,
    p_fecha_fin DATE,
    p_limite INTEGER,
    p_desplazamiento INTEGER
)
RETURNS TABLE(
    id_actividad INTEGER,
    tipo_actividad VARCHAR,
    descripcion TEXT,
    fecha DATE,
    ubicacion VARCHAR,
    usuario_asignado TEXT,
    estado_actividad TEXT,
    sucursal_nombre TEXT,
    resultado TEXT,
    creado_en TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
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
$$;

-- Función para crear encuesta personalizada
CREATE OR REPLACE FUNCTION public.crear_encuesta_personalizada(
    p_titulo VARCHAR,
    p_descripcion TEXT,
    p_tipo_encuesta VARCHAR,
    p_id_sucursal INTEGER,
    p_estructura_json JSONB,
    p_creado_por UUID
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
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
$$;

-- Función para obtener notificaciones de usuario
CREATE OR REPLACE FUNCTION public.obtener_notificaciones_usuario(
    p_id_usuario UUID,
    p_solo_no_leidas BOOLEAN DEFAULT false,
    p_limite INTEGER DEFAULT 10
)
RETURNS TABLE(
    id_notificacion INTEGER,
    titulo VARCHAR,
    mensaje TEXT,
    tipo VARCHAR,
    es_leida BOOLEAN,
    creado_en TIMESTAMP WITH TIME ZONE,
    metadatos JSONB
)
LANGUAGE plpgsql
AS $$
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
$$;

-- Función para marcar notificación como leída
CREATE OR REPLACE FUNCTION public.marcar_notificacion_leida(
    p_id_notificacion INTEGER,
    p_id_usuario UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    UPDATE public.notificaciones_sistema 
    SET es_leida = true, leida_en = NOW()
    WHERE id_notificacion = p_id_notificacion
    AND (id_usuario_destinatario = p_id_usuario OR es_global = true);

    RETURN FOUND;
END;
$$;

-- Función para obtener reportes consolidados por sucursal
CREATE OR REPLACE FUNCTION public.generar_reporte_consolidado_sucursal(
    p_id_sucursal INTEGER,
    p_fecha_inicio DATE,
    p_fecha_fin DATE
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
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
$$;