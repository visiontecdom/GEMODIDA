-- Script: Ciclo de Vida Completo de Encuestas
-- Descripción: Agrega soporte para el ciclo de vida de 10 etapas en encuestas
-- Fecha: 2025-12-03

-- 1. Agregar columna estado a diseno_encuestas si no existe
ALTER TABLE public.diseno_encuestas 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'borrador';

-- 2. Crear tabla para historial de cambios de estado
DROP TABLE IF EXISTS public.diseno_encuestas_historial_estados CASCADE;

CREATE TABLE public.diseno_encuestas_historial_estados (
  id BIGSERIAL PRIMARY KEY,
  id_diseno INTEGER NOT NULL REFERENCES public.diseno_encuestas(id_diseno) ON DELETE CASCADE,
  estado_anterior VARCHAR(20),
  estado_nuevo VARCHAR(20) NOT NULL,
  id_usuario UUID REFERENCES public.usuarios(id_usuario),
  razon TEXT,
  fecha_cambio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_diseno_encuestas_estado ON public.diseno_encuestas(estado);
CREATE INDEX IF NOT EXISTS idx_diseno_encuestas_historial_diseno ON public.diseno_encuestas_historial_estados(id_diseno);
CREATE INDEX IF NOT EXISTS idx_diseno_encuestas_historial_fecha ON public.diseno_encuestas_historial_estados(fecha_cambio);

-- 4. Crear función para validar transiciones de estado
DROP FUNCTION IF EXISTS public.validar_transicion_estado_encuesta(VARCHAR, VARCHAR) CASCADE;

CREATE OR REPLACE FUNCTION public.validar_transicion_estado_encuesta(
  p_estado_actual VARCHAR,
  p_estado_nuevo VARCHAR
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN CASE
    WHEN p_estado_actual = 'borrador' AND p_estado_nuevo IN ('revision', 'archivo') THEN true
    WHEN p_estado_actual = 'revision' AND p_estado_nuevo IN ('borrador', 'aprobacion') THEN true
    WHEN p_estado_actual = 'aprobacion' AND p_estado_nuevo IN ('revision', 'publicacion') THEN true
    WHEN p_estado_actual = 'publicacion' AND p_estado_nuevo = 'recoleccion' THEN true
    WHEN p_estado_actual = 'recoleccion' AND p_estado_nuevo = 'cierre' THEN true
    WHEN p_estado_actual = 'cierre' AND p_estado_nuevo = 'validacion' THEN true
    WHEN p_estado_actual = 'validacion' AND p_estado_nuevo = 'informe' THEN true
    WHEN p_estado_actual = 'informe' AND p_estado_nuevo = 'archivo' THEN true
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear función para cambiar estado de encuesta
DROP FUNCTION IF EXISTS public.cambiar_estado_encuesta(INTEGER, VARCHAR, TEXT) CASCADE;

CREATE OR REPLACE FUNCTION public.cambiar_estado_encuesta(
  p_id_diseno INTEGER,
  p_estado_nuevo VARCHAR,
  p_razon TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_estado_actual VARCHAR;
  v_usuario_id UUID;
BEGIN
  -- Obtener estado actual
  SELECT estado INTO v_estado_actual FROM public.diseno_encuestas WHERE id_diseno = p_id_diseno;
  
  IF v_estado_actual IS NULL THEN
    RETURN json_build_object('success', false, 'message', 'Encuesta no encontrada');
  END IF;
  
  -- Validar transición
  IF NOT public.validar_transicion_estado_encuesta(v_estado_actual, p_estado_nuevo) THEN
    RETURN json_build_object('success', false, 'message', 'Transición de estado no válida');
  END IF;
  
  -- Obtener usuario actual
  v_usuario_id := auth.uid();
  
  -- Actualizar estado
  UPDATE public.diseno_encuestas SET estado = p_estado_nuevo WHERE id_diseno = p_id_diseno;
  
  -- Registrar en historial
  INSERT INTO public.diseno_encuestas_historial_estados 
  (id_diseno, estado_anterior, estado_nuevo, id_usuario, razon)
  VALUES (p_id_diseno, v_estado_actual, p_estado_nuevo, v_usuario_id, p_razon);
  
  RETURN json_build_object('success', true, 'estado_nuevo', p_estado_nuevo);
END;
$$ LANGUAGE plpgsql;

-- 6. Crear función para obtener historial de cambios
DROP FUNCTION IF EXISTS public.obtener_historial_estados_encuesta(INTEGER) CASCADE;

CREATE OR REPLACE FUNCTION public.obtener_historial_estados_encuesta(p_id_diseno INTEGER)
RETURNS TABLE(
  id BIGINT,
  estado_anterior VARCHAR,
  estado_nuevo VARCHAR,
  usuario_nombre VARCHAR,
  razon TEXT,
  fecha_cambio TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    h.id,
    h.estado_anterior,
    h.estado_nuevo,
    u.nombre_completo,
    h.razon,
    h.fecha_cambio
  FROM public.diseno_encuestas_historial_estados h
  LEFT JOIN public.usuarios u ON h.id_usuario = u.id_usuario
  WHERE h.id_diseno = p_id_diseno
  ORDER BY h.fecha_cambio DESC;
END;
$$ LANGUAGE plpgsql;

-- 7. Crear política RLS para historial de estados
ALTER TABLE public.diseno_encuestas_historial_estados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Usuarios pueden ver historial de sus encuestas" ON public.diseno_encuestas_historial_estados;

CREATE POLICY "Usuarios pueden ver historial de sus encuestas" 
ON public.diseno_encuestas_historial_estados 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.diseno_encuestas de
    WHERE de.id_diseno = diseno_encuestas_historial_estados.id_diseno
    AND (de.creado_por = auth.uid() OR auth.uid() IN (
      SELECT id_usuario FROM public.usuarios WHERE id_rol IN (
        SELECT id_rol FROM public.usuarios_roles WHERE puede_ver_todas_sucursales = true
      )
    ))
  )
);
