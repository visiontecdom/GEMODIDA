-- =====================================================
-- FUNCIONES RPC PARA MATRIZ DE SOPORTE
-- Fecha: 2025-11-22
-- Descripción: Funciones para gestión de usuarios, roles, configuraciones y estadísticas
-- =====================================================

-- =====================================================
-- 1. FUNCIONES PARA GESTIÓN DE USUARIOS
-- =====================================================

-- Función para obtener todos los usuarios con información de roles y sucursales
DROP FUNCTION IF EXISTS public.obtener_usuarios_completos(integer, integer) CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_usuarios_completos(
    p_limite integer DEFAULT 50,
    p_desplazamiento integer DEFAULT 0
)
RETURNS TABLE(
    id_usuario uuid,
    correo character varying,
    nombre_completo character varying,
    telefono character varying,
    esta_activo boolean,
    id_rol integer,
    nombre_rol character varying,
    id_suc integer,
    nombre_sucursal text,
    creado_en timestamp with time zone,
    ultimo_acceso timestamp with time zone
)
LANGUAGE plpgsql
AS $function$
BEGIN
    RETURN QUERY
    SELECT 
        u.id_usuario,
        u.correo,
        u.nombre_completo,
        u.telefono,
        u.esta_activo,
        u.id_rol,
        ur.nombre_rol,
        u.id_suc,
        s.nombre_sucursal,
        u.creado_en,
        u.ultimo_acceso
    FROM public.usuarios u
    LEFT JOIN public.usuarios_roles ur ON u.id_rol = ur.id_rol
    LEFT JOIN public.sucursales s ON u.id_suc = s.id_suc
    ORDER BY u.creado_en DESC
    LIMIT p_limite
    OFFSET p_desplazamiento;
END;
$function$;

-- Función para actualizar usuario
DROP FUNCTION IF EXISTS public.actualizar_usuario(uuid, character varying, character varying, character varying, integer, integer, boolean) CASCADE;
CREATE OR REPLACE FUNCTION public.actualizar_usuario(
    p_id_usuario uuid,
    p_correo character varying,
    p_nombre_completo character varying,
    p_telefono character varying,
    p_id_rol integer,
    p_id_suc integer,
    p_esta_activo boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
    -- Validar que el usuario existe
    IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id_usuario = p_id_usuario) THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuario no encontrado');
    END IF;

    -- Actualizar usuario
    UPDATE public.usuarios
    SET 
        correo = p_correo,
        nombre_completo = p_nombre_completo,
        telefono = p_telefono,
        id_rol = p_id_rol,
        id_suc = p_id_suc,
        esta_activo = p_esta_activo,
        actualizado_en = NOW()
    WHERE id_usuario = p_id_usuario;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Usuario actualizado exitosamente'
    );

EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', 'Error al actualizar usuario: ' || SQLERRM
    );
END;
$function$;

-- =====================================================
-- 2. FUNCIONES PARA GESTIÓN DE ROLES
-- =====================================================

-- Función para obtener todos los roles
DROP FUNCTION IF EXISTS public.obtener_roles_todos() CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_roles_todos()
RETURNS TABLE(
    id_rol integer,
    codigo_rol character varying,
    nombre_rol character varying,
    descripcion text,
    nivel_acceso integer,
    permisos_json jsonb,
    puede_crear_usuarios boolean,
    puede_ver_todas_sucursales boolean,
    esta_activo boolean,
    creado_en timestamp with time zone,
    total_usuarios bigint
)
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

-- Función para actualizar rol
DROP FUNCTION IF EXISTS public.actualizar_rol(integer, character varying, text, integer, jsonb, boolean, boolean, boolean) CASCADE;
CREATE OR REPLACE FUNCTION public.actualizar_rol(
    p_id_rol integer,
    p_nombre_rol character varying,
    p_descripcion text,
    p_nivel_acceso integer,
    p_permisos_json jsonb,
    p_puede_crear_usuarios boolean,
    p_puede_ver_todas_sucursales boolean,
    p_esta_activo boolean
)
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

-- =====================================================
-- 3. FUNCIONES PARA CONFIGURACIÓN DEL SISTEMA
-- =====================================================

-- Función para obtener todas las configuraciones del sistema
DROP FUNCTION IF EXISTS public.obtener_configuraciones_sistema() CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_configuraciones_sistema()
RETURNS TABLE(
    clave character varying,
    valor text,
    tipo character varying,
    descripcion text,
    es_sensible boolean,
    creado_en timestamp with time zone,
    actualizado_en timestamp with time zone
)
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

-- Función para actualizar configuración del sistema
DROP FUNCTION IF EXISTS public.actualizar_configuracion_sistema(character varying, text, character varying, text, boolean) CASCADE;
CREATE OR REPLACE FUNCTION public.actualizar_configuracion_sistema(
    p_clave character varying,
    p_valor text,
    p_tipo character varying,
    p_descripcion text,
    p_es_sensible boolean
)
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

-- =====================================================
-- 4. FUNCIONES PARA CONFIGURACIÓN DE SCRAPING
-- =====================================================

-- Función para obtener todas las configuraciones de scraping
DROP FUNCTION IF EXISTS public.obtener_configuraciones_scraping() CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_configuraciones_scraping()
RETURNS TABLE(
    id_config integer,
    nombre_configuracion character varying,
    descripcion text,
    fuentes_activas integer[],
    palabras_clave_activas integer[],
    frecuencia_minutos integer,
    esta_activa boolean,
    configuracion_avanzada jsonb,
    creado_por uuid,
    nombre_creador character varying,
    creado_en timestamp with time zone,
    actualizado_en timestamp with time zone
)
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

-- Función para actualizar configuración de scraping
DROP FUNCTION IF EXISTS public.actualizar_configuracion_scraping(integer, character varying, text, integer[], integer[], integer, boolean, jsonb) CASCADE;
CREATE OR REPLACE FUNCTION public.actualizar_configuracion_scraping(
    p_id_config integer,
    p_nombre_configuracion character varying,
    p_descripcion text,
    p_fuentes_activas integer[],
    p_palabras_clave_activas integer[],
    p_frecuencia_minutos integer,
    p_esta_activa boolean,
    p_configuracion_avanzada jsonb
)
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

-- =====================================================
-- 5. FUNCIONES PARA ESTADÍSTICAS DE DEPARTAMENTOS
-- =====================================================

-- Función para obtener estadísticas de trabajos por departamento
DROP FUNCTION IF EXISTS public.obtener_estadisticas_departamentos(date, date) CASCADE;
CREATE OR REPLACE FUNCTION public.obtener_estadisticas_departamentos(
    p_fecha_inicio date DEFAULT (CURRENT_DATE - INTERVAL '30 days'),
    p_fecha_fin date DEFAULT CURRENT_DATE
)
RETURNS TABLE(
    departamento text,
    total_trabajos bigint,
    completados bigint,
    en_progreso bigint,
    pendientes bigint,
    porcentaje_completado numeric
)
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

-- =====================================================
-- COMENTARIOS Y NOTAS
-- =====================================================
-- Estas funciones deben ejecutarse en Supabase SQL Editor
-- Asegúrese de tener los permisos necesarios antes de ejecutar
-- Las funciones con SECURITY DEFINER requieren permisos especiales
