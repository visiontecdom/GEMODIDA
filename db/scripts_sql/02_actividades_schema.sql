-- Tabla de actividades
CREATE TABLE IF NOT EXISTS actividades (
  id BIGSERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  descripcion TEXT NOT NULL,
  resultado TEXT,
  ubicacion JSONB,
  evidencias JSONB,
  usuario_id UUID REFERENCES auth.users(id),
  planificacion_id BIGINT,
  estado VARCHAR(20) DEFAULT 'registrada',
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_actividades_usuario ON actividades(usuario_id);
CREATE INDEX idx_actividades_planificacion ON actividades(planificacion_id);
CREATE INDEX idx_actividades_tipo ON actividades(tipo);
CREATE INDEX idx_actividades_estado ON actividades(estado);
CREATE INDEX idx_actividades_fecha ON actividades(creado_en);

-- Políticas RLS
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios pueden ver sus propias actividades"
  ON actividades FOR SELECT
  USING (auth.uid() = usuario_id OR auth.uid() IN (
    SELECT id FROM usuarios WHERE rol IN ('admin', 'operador')
  ));

CREATE POLICY "Usuarios pueden crear actividades"
  ON actividades FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Usuarios pueden actualizar sus actividades"
  ON actividades FOR UPDATE
  USING (auth.uid() = usuario_id OR auth.uid() IN (
    SELECT id FROM usuarios WHERE rol = 'admin'
  ));

-- Función para registrar actividad
CREATE OR REPLACE FUNCTION registrar_actividad(
  p_tipo VARCHAR,
  p_descripcion TEXT,
  p_resultado TEXT,
  p_ubicacion JSONB,
  p_evidencias JSONB,
  p_planificacion_id BIGINT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_actividad_id BIGINT;
BEGIN
  INSERT INTO actividades (
    tipo, descripcion, resultado, ubicacion, evidencias, 
    usuario_id, planificacion_id, estado
  ) VALUES (
    p_tipo, p_descripcion, p_resultado, p_ubicacion, p_evidencias,
    auth.uid(), p_planificacion_id, 'registrada'
  ) RETURNING id INTO v_actividad_id;

  RETURN json_build_object(
    'success', true,
    'id', v_actividad_id,
    'mensaje', 'Actividad registrada correctamente'
  );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener actividades
CREATE OR REPLACE FUNCTION obtener_actividades(
  p_tipo VARCHAR DEFAULT NULL,
  p_estado VARCHAR DEFAULT NULL,
  p_fecha_inicio DATE DEFAULT NULL,
  p_fecha_fin DATE DEFAULT NULL
) RETURNS TABLE (
  id BIGINT,
  tipo VARCHAR,
  descripcion TEXT,
  resultado TEXT,
  ubicacion JSONB,
  usuario_id UUID,
  estado VARCHAR,
  creado_en TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.tipo, a.descripcion, a.resultado, a.ubicacion,
         a.usuario_id, a.estado, a.creado_en
  FROM actividades a
  WHERE (p_tipo IS NULL OR a.tipo = p_tipo)
    AND (p_estado IS NULL OR a.estado = p_estado)
    AND (p_fecha_inicio IS NULL OR DATE(a.creado_en) >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR DATE(a.creado_en) <= p_fecha_fin)
    AND (a.usuario_id = auth.uid() OR auth.uid() IN (
      SELECT id FROM usuarios WHERE rol IN ('admin', 'operador')
    ))
  ORDER BY a.creado_en DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de actividades
CREATE OR REPLACE FUNCTION obtener_estadisticas_actividades()
RETURNS TABLE (
  total BIGINT,
  por_tipo JSONB,
  por_estado JSONB,
  por_usuario JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    jsonb_object_agg(tipo, cantidad) FILTER (WHERE tipo IS NOT NULL),
    jsonb_object_agg(estado, cantidad) FILTER (WHERE estado IS NOT NULL),
    jsonb_object_agg(usuario_id::TEXT, cantidad) FILTER (WHERE usuario_id IS NOT NULL)
  FROM (
    SELECT tipo, COUNT(*) as cantidad FROM actividades GROUP BY tipo
  ) t1,
  (
    SELECT estado, COUNT(*) as cantidad FROM actividades GROUP BY estado
  ) t2,
  (
    SELECT usuario_id, COUNT(*) as cantidad FROM actividades GROUP BY usuario_id
  ) t3;
END;
$$ LANGUAGE plpgsql;
