-- Tabla de configuración de scraping
CREATE TABLE IF NOT EXISTS scraping_config (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  fuente VARCHAR(50) NOT NULL,
  url VARCHAR(500),
  palabras_clave JSONB,
  frecuencia VARCHAR(20) DEFAULT 'diaria',
  activo BOOLEAN DEFAULT true,
  usuario_id UUID REFERENCES auth.users(id),
  creado_en TIMESTAMP DEFAULT NOW(),
  actualizado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla de resultados de scraping
CREATE TABLE IF NOT EXISTS scraping_resultados (
  id BIGSERIAL PRIMARY KEY,
  config_id BIGINT REFERENCES scraping_config(id),
  titulo VARCHAR(500),
  contenido TEXT,
  url VARCHAR(500),
  fuente VARCHAR(50),
  sentimiento VARCHAR(20),
  palabras_encontradas JSONB,
  fecha_publicacion TIMESTAMP,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_scraping_config_usuario ON scraping_config(usuario_id);
CREATE INDEX idx_scraping_config_activo ON scraping_config(activo);
CREATE INDEX idx_scraping_resultados_config ON scraping_resultados(config_id);
CREATE INDEX idx_scraping_resultados_fecha ON scraping_resultados(creado_en);
CREATE INDEX idx_scraping_resultados_sentimiento ON scraping_resultados(sentimiento);

-- Políticas RLS
ALTER TABLE scraping_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraping_resultados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios ven sus configuraciones"
  ON scraping_config FOR SELECT
  USING (auth.uid() = usuario_id OR auth.uid() IN (
    SELECT id FROM usuarios WHERE rol IN ('admin', 'operador')
  ));

CREATE POLICY "Usuarios crean configuraciones"
  ON scraping_config FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Función para crear configuración de scraping
CREATE OR REPLACE FUNCTION crear_scraping_config(
  p_nombre VARCHAR,
  p_fuente VARCHAR,
  p_url VARCHAR,
  p_palabras_clave JSONB,
  p_frecuencia VARCHAR DEFAULT 'diaria'
) RETURNS JSON AS $$
DECLARE
  v_config_id BIGINT;
BEGIN
  INSERT INTO scraping_config (
    nombre, fuente, url, palabras_clave, frecuencia, usuario_id
  ) VALUES (
    p_nombre, p_fuente, p_url, p_palabras_clave, p_frecuencia, auth.uid()
  ) RETURNING id INTO v_config_id;

  RETURN json_build_object(
    'success', true,
    'id', v_config_id,
    'mensaje', 'Configuración creada correctamente'
  );
END;
$$ LANGUAGE plpgsql;

-- Función para obtener resultados de scraping
CREATE OR REPLACE FUNCTION obtener_resultados_scraping(
  p_config_id BIGINT DEFAULT NULL,
  p_sentimiento VARCHAR DEFAULT NULL,
  p_fecha_inicio DATE DEFAULT NULL,
  p_fecha_fin DATE DEFAULT NULL
) RETURNS TABLE (
  id BIGINT,
  titulo VARCHAR,
  contenido TEXT,
  url VARCHAR,
  fuente VARCHAR,
  sentimiento VARCHAR,
  palabras_encontradas JSONB,
  creado_en TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT sr.id, sr.titulo, sr.contenido, sr.url, sr.fuente,
         sr.sentimiento, sr.palabras_encontradas, sr.creado_en
  FROM scraping_resultados sr
  WHERE (p_config_id IS NULL OR sr.config_id = p_config_id)
    AND (p_sentimiento IS NULL OR sr.sentimiento = p_sentimiento)
    AND (p_fecha_inicio IS NULL OR DATE(sr.creado_en) >= p_fecha_inicio)
    AND (p_fecha_fin IS NULL OR DATE(sr.creado_en) <= p_fecha_fin)
  ORDER BY sr.creado_en DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de scraping
CREATE OR REPLACE FUNCTION obtener_estadisticas_scraping()
RETURNS TABLE (
  total_resultados BIGINT,
  por_sentimiento JSONB,
  por_fuente JSONB,
  por_palabra_clave JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT,
    jsonb_object_agg(sentimiento, cantidad) FILTER (WHERE sentimiento IS NOT NULL),
    jsonb_object_agg(fuente, cantidad) FILTER (WHERE fuente IS NOT NULL),
    jsonb_object_agg(palabra, cantidad) FILTER (WHERE palabra IS NOT NULL)
  FROM (
    SELECT sentimiento, COUNT(*) as cantidad FROM scraping_resultados GROUP BY sentimiento
  ) t1,
  (
    SELECT fuente, COUNT(*) as cantidad FROM scraping_resultados GROUP BY fuente
  ) t2,
  (
    SELECT jsonb_object_keys(palabras_encontradas) as palabra, COUNT(*) as cantidad
    FROM scraping_resultados
    WHERE palabras_encontradas IS NOT NULL
    GROUP BY palabra
  ) t3;
END;
$$ LANGUAGE plpgsql;
