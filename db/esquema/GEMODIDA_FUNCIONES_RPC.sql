-- Crear función para agregar un usuario con rol y sucursal
CREATE OR REPLACE FUNCTION public.agregar_usuario(
    p_correo VARCHAR,
    p_nombre_completo VARCHAR,
    p_rol_id INT,
    p_sucursal_id INT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.usuarios (correo, nombre_completo, id_rol, id_suc, creado_en)
    VALUES (p_correo, p_nombre_completo, p_rol_id, p_sucursal_id, NOW());
END;
$$ LANGUAGE plpgsql;

-- Crear función para generar reportes consolidados
CREATE OR REPLACE FUNCTION public.generar_reporte_consolidado(
    p_fecha_inicio TIMESTAMP,
    p_fecha_fin TIMESTAMP
) RETURNS TABLE(
    sucursal_id INT,
    total_actividades INT,
    total_encuestas INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.id_sucursal,
        COUNT(DISTINCT a.id_actividad) AS total_actividades,
        COUNT(DISTINCT e.id_encuesta) AS total_encuestas
    FROM public.actividad_matriz a
    LEFT JOIN public.encuesta_uss e ON a.id_sucursal = e.sucursal_dida
    WHERE a.fecha BETWEEN p_fecha_inicio AND p_fecha_fin
    GROUP BY a.id_sucursal;
END;
$$ LANGUAGE plpgsql;

-- Crear función para actualizar estadísticas
CREATE OR REPLACE FUNCTION public.actualizar_estadisticas(
    p_id_palabra INT
) RETURNS VOID AS $$
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
$$ LANGUAGE plpgsql;

-- Crear políticas de seguridad (RLS) para la tabla usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "usuarios_por_sucursal" ON public.usuarios
    FOR SELECT USING (id_suc = current_setting('app.current_sucursal')::INT);

CREATE POLICY "usuarios_admin" ON public.usuarios
    FOR ALL USING (current_setting('app.current_role') IN ('admin', 'super_user'));

-- Crear políticas de seguridad (RLS) para la tabla actividad_matriz
ALTER TABLE public.actividad_matriz ENABLE ROW LEVEL SECURITY;

CREATE POLICY "actividades_por_sucursal" ON public.actividad_matriz
    FOR SELECT USING (id_sucursal = current_setting('app.current_sucursal')::INT);

CREATE POLICY "actividades_admin" ON public.actividad_matriz
    FOR ALL USING (current_setting('app.current_role') IN ('admin', 'super_user'));
