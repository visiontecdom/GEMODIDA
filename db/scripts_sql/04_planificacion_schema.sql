-- Tabla de planificaciones
CREATE TABLE IF NOT EXISTS planificaciones (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  presupuesto DECIMAL(12, 2),
  estado VARCHAR(20) DEFAULT 'planificada',
  progreso INTEGER DEFAULT 0,
  usuario_id UUID REFERENCES auth.users(id),
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla de tareas
CREATE TABLE IF NOT EXISTS tareas (
  id BIGSERIAL PRIMARY KEY,
  planificacion_id BIGINT REFERENCES planificaciones(id),
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  prioridad VARCHAR(20) DEFAULT 'media',
  estado VARCHAR(20) DEFAULT 'pendiente',
  asignado_a UUID REFERENCES auth.users(id),
  progreso INTEGER DEFAULT 0,
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla de registro de tiempo
CREATE TABLE IF NOT EXISTS registro_tiempo (
  id BIGSERIAL PRIMARY KEY,
  tarea_id BIGINT REFERENCES tareas(id),
  usuario_id UUID REFERENCES auth.users(id),
  horas DECIMAL(5, 2),
  descripcion TEXT,
  fecha DATE DEFAULT CURRENT_DATE,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_planificaciones_usuario ON planificaciones(usuario_id);
CREATE INDEX idx_planificaciones_estado ON planificaciones(estado);
CREATE INDEX idx_planificaciones_fecha ON planificaciones(fecha_inicio, fecha_fin);
CREATE INDEX idx_tareas_planificacion ON tareas(planificacion_id);
CREATE INDEX idx_tareas_asignado ON tareas(asignado_a);
CREATE INDEX idx_tareas_estado ON tareas(estado);
CREATE INDEX idx_registro_tiempo_tarea ON registro_tiempo(tarea_id);
CREATE INDEX idx_registro_tiempo_usuario ON registro_tiempo(usuario_id);

-- Políticas RLS
ALTER TABLE planificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE registro_tiempo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus planificaciones"
  ON planificaciones FOR SELECT
  USING (auth.uid() = usuario_id OR auth.uid() IN (
    SELECT id FROM usuarios WHERE rol IN ('admin', 'operador')
  ));

CREATE POLICY "Usuarios ven tareas asignadas"
  ON tareas FOR SELECT
  USING (auth.uid() = asignado_a OR auth.uid() IN (
    SELECT id FROM usuarios WHERE rol IN ('admin', 'operador')
  ));

-- Función para crear planificación
CREATE OR REPLACE FUNCTION crear_planificacion(
  p_nombre VARCHAR,
  p_descripcion TEXT,
  p_fecha_inicio DATE,
  p_fecha_fin DATE,
  p_presupuesto DECIMAL DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_planificacion_id BIGINT;
BEGIN
  INSERT INTO planificaciones (
    nombre, descripcion, fecha_inicio, fecha_fin, presupuesto, usuario_id
  ) VALUES (
    p_nombre, p_descripcion, p_fecha_inicio, p_fecha_fin, p_presupuesto, auth.uid()
  ) RETURNING id INTO v_planificacion_id;

  RETURN json_build_object(
    'success', true,
    'id', v_planificacion_id,
    'mensaje', 'Planificación creada correctamente'
  );
END;
$$ LANGUAGE plpgsql;

-- Función para crear tarea
CREATE OR REPLACE FUNCTION crear_tarea(
  p_planificacion_id BIGINT,
  p_titulo VARCHAR,
  p_descripcion TEXT,
  p_fecha_inicio DATE,
  p_fecha_fin DATE,
  p_prioridad VARCHAR DEFAULT 'media',
  p_asignado_a UUID DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_tarea_id BIGINT;
BEGIN
  INSERT INTO tareas (
    planificacion_id, titulo, descripcion, fecha_inicio, fecha_fin,
    prioridad, asignado_a
  ) VALUES (
    p_planificacion_id, p_titulo, p_descripcion, p_fecha_inicio, p_fecha_fin,
    p_prioridad, p_asignado_a
  ) RETURNING id INTO v_tarea_id;

  RETURN json_build_object(
    'success', true,
    'id', v_tarea_id,
    'mensaje', 'Tarea creada correctamente'
  );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener planificaciones
CREATE OR REPLACE FUNCTION obtener_planificaciones(
  p_estado VARCHAR DEFAULT NULL,
  p_fecha_inicio DATE DEFAULT NULL,
  p_fecha_fin DATE DEFAULT NULL
) RETURNS TABLE (
  id BIGINT,
  nombre VARCHAR,
  descripcion TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  presupuesto DECIMAL,
  estado VARCHAR,
  progreso INTEGER,
  creado_en TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.nombre, p.descripcion, p.fecha_inicio, p.fecha_fin,
         p.presupuesto, p.estado, p.progreso, p.creado_en
  FROM planificaciones p
  WHERE (p_estado IS NULL OR p.estado = p_estado)
    AND (p_fecha_inicio IS NULL OR p.fecha_inicio >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR p.fecha_fin <= p_fecha_fin)
    AND (p.usuario_id = auth.uid() OR auth.uid() IN (
      SELECT id FROM usuarios WHERE rol IN ('admin', 'operador')
    ))
  ORDER BY p.fecha_inicio DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener tareas
CREATE OR REPLACE FUNCTION obtener_tareas(
  p_planificacion_id BIGINT DEFAULT NULL,
  p_estado VARCHAR DEFAULT NULL
) RETURNS TABLE (
  id BIGINT,
  titulo VARCHAR,
  descripcion TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  prioridad VARCHAR,
  estado VARCHAR,
  progreso INTEGER,
  asignado_a UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.titulo, t.descripcion, t.fecha_inicio, t.fecha_fin,
         t.prioridad, t.estado, t.progreso, t.asignado_a
  FROM tareas t
  WHERE (p_planificacion_id IS NULL OR t.planificacion_id = p_planificacion_id)
    AND (p_estado IS NULL OR t.estado = p_estado)
  ORDER BY t.fecha_inicio ASC;
END;
$$ LANGUAGE plpgsql;
