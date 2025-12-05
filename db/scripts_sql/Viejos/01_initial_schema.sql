-- =============================================
-- GEMODIDA - Database Schema
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS logs_procesos CASCADE;
DROP TABLE IF EXISTS reportes CASCADE;
DROP TABLE IF EXISTS estadisticas CASCADE;
DROP TABLE IF EXISTS resultados CASCADE;
DROP TABLE IF EXISTS fuentes CASCADE;
DROP TABLE IF EXISTS palabras_clave CASCADE;
DROP TABLE IF EXISTS perfiles_usuarios CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS configuraciones_sistema CASCADE;

-- =============================================
-- Tables Creation
-- =============================================

-- Table: roles
CREATE TABLE roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    permisos JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: usuarios
CREATE TABLE usuarios (
    id_usuario UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    id_rol INTEGER REFERENCES roles(id_rol) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    telefono VARCHAR(20),
    avatar_url TEXT,
    esta_activo BOOLEAN DEFAULT TRUE,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: perfiles_usuarios
CREATE TABLE perfiles_usuarios (
    id_perfil SERIAL PRIMARY KEY,
    id_usuario UUID REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    empresa VARCHAR(100),
    cargo VARCHAR(100),
    preferencias JSONB DEFAULT '{}'::jsonb,
    configuracion_notificaciones JSONB DEFAULT '{"email": true, "app": true, "reportes_diarios": false}',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_usuario_perfil UNIQUE (id_usuario)
);

-- Table: palabras_clave
CREATE TABLE palabras_clave (
    id_palabra SERIAL PRIMARY KEY,
    palabra VARCHAR(255) NOT NULL,
    descripcion TEXT,
    id_usuario_creador UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    es_publica BOOLEAN DEFAULT FALSE,
    etiquetas TEXT[],
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_palabra_usuario UNIQUE (palabra, id_usuario_creador)
);

-- Table: categorias_fuentes
CREATE TABLE categorias_fuentes (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50)
);

-- Table: fuentes
CREATE TABLE fuentes (
    id_fuente SERIAL PRIMARY KEY,
    nombre VARCHAR(200) NOT NULL,
    url_base TEXT,
    tipo_fuente VARCHAR(50) NOT NULL,
    id_categoria INTEGER REFERENCES categorias_fuentes(id_categoria) ON DELETE SET NULL,
    configuracion JSONB DEFAULT '{}'::jsonb,
    esta_activa BOOLEAN DEFAULT TRUE,
    requiere_autenticacion BOOLEAN DEFAULT FALSE,
    creado_por UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: resultados
CREATE TABLE resultados (
    id_resultado BIGSERIAL PRIMARY KEY,
    id_palabra INTEGER REFERENCES palabras_clave(id_palabra) ON DELETE CASCADE,
    id_fuente INTEGER REFERENCES fuentes(id_fuente) ON DELETE SET NULL,
    titulo TEXT,
    contenido TEXT NOT NULL,
    url_origen TEXT,
    url_imagen TEXT,
    autor VARCHAR(200),
    fecha_publicacion TIMESTAMP WITH TIME ZONE,
    fecha_extraccion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sentimiento VARCHAR(50),
    relevancia INTEGER CHECK (relevancia >= 0 AND relevancia <= 100),
    metadatos JSONB DEFAULT '{}'::jsonb,
    procesado BOOLEAN DEFAULT FALSE
);

-- Table: estadisticas
CREATE TABLE estadisticas (
    id_estadistica BIGSERIAL PRIMARY KEY,
    id_palabra INTEGER REFERENCES palabras_clave(id_palabra) ON DELETE CASCADE,
    id_fuente INTEGER REFERENCES fuentes(id_fuente) ON DELETE CASCADE,
    fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    total_resultados INTEGER DEFAULT 0,
    promedio_sentimiento NUMERIC(5, 2),
    tendencia NUMERIC(5, 2),
    datos_agregados JSONB DEFAULT '{}'::jsonb,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_estadistica_fuente_palabra UNIQUE (id_palabra, id_fuente, fecha_inicio, fecha_fin)
);

-- Table: reportes
CREATE TABLE reportes (
    id_reporte UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_reporte VARCHAR(50) NOT NULL,
    parametros JSONB DEFAULT '{}'::jsonb,
    ruta_archivo TEXT,
    formato VARCHAR(20) NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    id_usuario_solicitante UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_completado TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: logs_procesos
CREATE TABLE logs_procesos (
    id_log BIGSERIAL PRIMARY KEY,
    tipo_proceso VARCHAR(100) NOT NULL,
    estado VARCHAR(50) NOT NULL,
    mensaje TEXT,
    detalles TEXT,
    duracion_ms INTEGER,
    id_usuario UUID REFERENCES usuarios(id_usuario) ON DELETE SET NULL,
    metadatos JSONB DEFAULT '{}'::jsonb,
    fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_fin TIMESTAMP WITH TIME ZONE,
    ip_origen INET
);

-- Table: configuraciones_sistema
CREATE TABLE configuraciones_sistema (
    clave VARCHAR(100) PRIMARY KEY,
    valor TEXT,
    tipo VARCHAR(50) NOT NULL,
    descripcion TEXT,
    es_sensible BOOLEAN DEFAULT FALSE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- Indexes
-- =============================================

-- Indexes for usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(id_rol);

-- Indexes for palabras_clave
CREATE INDEX idx_palabras_clave_palabra ON palabras_clave(palabra);
CREATE INDEX idx_palabras_clave_usuario ON palabras_clave(id_usuario_creador);
CREATE INDEX idx_palabras_clave_publica ON palabras_clave(es_publica) WHERE es_publica = TRUE;

-- Indexes for fuentes
CREATE INDEX idx_fuentes_tipo ON fuentes(tipo_fuente);
CREATE INDEX idx_fuentes_categoria ON fuentes(id_categoria);
CREATE INDEX idx_fuentes_activas ON fuentes(esta_activa) WHERE esta_activa = TRUE;

-- Indexes for resultados
CREATE INDEX idx_resultados_palabra ON resultados(id_palabra);
CREATE INDEX idx_resultados_fuente ON resultados(id_fuente);
CREATE INDEX idx_resultados_fecha_publicacion ON resultados(fecha_publicacion);
CREATE INDEX idx_resultados_sentimiento ON resultados(sentimiento);
CREATE INDEX idx_resultados_procesado ON resultados(procesado) WHERE procesado = FALSE;

-- Indexes for estadisticas
CREATE INDEX idx_estadisticas_palabra_fuente ON estadisticas(id_palabra, id_fuente);
CREATE INDEX idx_estadisticas_fechas ON estadisticas(fecha_inicio, fecha_fin);

-- Indexes for reportes
CREATE INDEX idx_reportes_usuario ON reportes(id_usuario_solicitante);
CREATE INDEX idx_reportes_estado ON reportes(estado);
CREATE INDEX idx_reportes_fecha_solicitud ON reportes(fecha_solicitud);

-- Indexes for logs_procesos
CREATE INDEX idx_logs_procesos_tipo ON logs_procesos(tipo_proceso);
CREATE INDEX idx_logs_procesos_estado ON logs_procesos(estado);
CREATE INDEX idx_logs_procesos_fecha ON logs_procesos(fecha_inicio);

-- =============================================
-- Functions
-- =============================================

-- Function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log process
CREATE OR REPLACE FUNCTION log_proceso(
    p_tipo_proceso VARCHAR(100),
    p_estado VARCHAR(50),
    p_mensaje TEXT,
    p_detalles TEXT DEFAULT NULL,
    p_id_usuario UUID DEFAULT NULL,
    p_metadatos JSONB DEFAULT '{}'::jsonb,
    p_ip_origen INET DEFAULT NULL
) RETURNS BIGINT AS $$
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
        fecha_fin,
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
$$ LANGUAGE plpgsql;

-- Function to get keyword statistics
CREATE OR REPLACE FUNCTION obtener_estadisticas_palabra(
    p_id_palabra INTEGER,
    p_fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT (NOW() - INTERVAL '30 days'),
    p_fecha_fin TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) RETURNS TABLE (
    fecha DATE,
    total_resultados BIGINT,
    promedio_sentimiento NUMERIC(5,2),
    fuentes JSONB
) AS $$
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
$$ LANGUAGE plpgsql;

-- =============================================
-- Triggers
-- =============================================

-- Update triggers for updated_at columns
CREATE TRIGGER update_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_perfiles_usuarios_updated_at
BEFORE UPDATE ON perfiles_usuarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_palabras_clave_updated_at
BEFORE UPDATE ON palabras_clave
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fuentes_updated_at
BEFORE UPDATE ON fuentes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_configuraciones_sistema_updated_at
BEFORE UPDATE ON configuraciones_sistema
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- Initial Data
-- =============================================

-- Insert default roles
INSERT INTO roles (nombre_rol, descripcion, permisos) VALUES
    ('admin', 'Administrador del sistema', '{"*": true}'),
    ('usuario', 'Usuario estándar', '{"palabras_clave": ["read", "create", "update", "delete"], "reportes": ["read", "create"]}'),
    ('lector', 'Solo lectura', '{"palabras_clave": ["read"], "reportes": ["read"]}');

-- Insert default categories
INSERT INTO categorias_fuentes (nombre, descripcion, icono) VALUES
    ('redes_sociales', 'Plataformas de redes sociales', 'share-2'),
    ('noticias', 'Sitios de noticias y periódicos', 'newspaper'),
    ('foros', 'Foros y comunidades en línea', 'message-square'),
    ('blogs', 'Blogs personales y corporativos', 'edit-3'),
    ('comercio_electronico', 'Tiendas en línea y marketplaces', 'shopping-cart');

-- Insert default system configuration
INSERT INTO configuraciones_sistema (clave, valor, tipo, descripcion, es_sensible) VALUES
    ('app_name', 'GEMODIDA', 'string', 'Nombre de la aplicación', FALSE),
    ('app_description', 'Sistema de monitoreo de medios digitales', 'string', 'Descripción de la aplicación', FALSE),
    ('resultados_por_pagina', '20', 'number', 'Número de resultados por página', FALSE),
    ('retencion_logs_dias', '90', 'number', 'Días de retención de logs', FALSE),
    ('notificaciones_habilitadas', 'true', 'boolean', 'Habilitar notificaciones', FALSE);

-- =============================================
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on tables
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles_usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE palabras_clave ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Los usuarios pueden ver su propio perfil" 
ON usuarios FOR SELECT 
USING (auth.uid() = id_usuario);

CREATE POLICY "Los administradores pueden gestionar usuarios" 
ON usuarios 
USING (auth.role() = 'authenticated' AND 
       EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = auth.uid() AND id_rol = 1));

-- Keywords policies
CREATE POLICY "Los usuarios pueden ver sus propias palabras clave" 
ON palabras_clave FOR SELECT 
USING (id_usuario_creador = auth.uid() OR es_publica = TRUE);

CREATE POLICY "Los usuarios pueden crear palabras clave" 
ON palabras_clave FOR INSERT 
WITH CHECK (id_usuario_creador = auth.uid());

CREATE POLICY "Los usuarios pueden editar sus propias palabras clave" 
ON palabras_clave FOR UPDATE 
USING (id_usuario_creador = auth.uid());

CREATE POLICY "Los usuarios pueden eliminar sus propias palabras clave" 
ON palabras_clave FOR DELETE 
USING (id_usuario_creador = auth.uid());

-- Reports policies
CREATE POLICY "Los usuarios pueden ver sus propios reportes" 
ON reportes FOR SELECT 
USING (id_usuario_solicitante = auth.uid() OR 
       EXISTS (SELECT 1 FROM usuarios WHERE id_usuario = auth.uid() AND id_rol = 1));

CREATE POLICY "Los usuarios pueden crear reportes" 
ON reportes FOR INSERT 
WITH CHECK (id_usuario_solicitante = auth.uid());

-- =============================================
-- Comments
-- =============================================

COMMENT ON TABLE usuarios IS 'Almacena la información de los usuarios del sistema';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash de la contraseña del usuario (usar bcrypt)';
COMMENT ON COLUMN usuarios.esta_activo IS 'Indica si la cuenta del usuario está activa o no';

COMMENT ON TABLE palabras_clave IS 'Palabras clave para realizar el seguimiento en las fuentes';
COMMENT ON COLUMN palabras_clave.es_publica IS 'Indica si la palabra clave es visible para todos los usuarios';

COMMENT ON TABLE resultados IS 'Resultados de búsqueda de las palabras clave en las fuentes';
COMMENT ON COLUMN resultados.sentimiento IS 'Análisis de sentimiento del resultado (positivo, negativo, neutro)';

COMMENT ON TABLE estadisticas IS 'Estadísticas agregadas de búsquedas por período';
COMMENT ON COLUMN estadisticas.tendencia IS 'Porcentaje de cambio respecto al período anterior';

COMMENT ON TABLE logs_procesos IS 'Registro de actividades y procesos del sistema';

-- =============================================
-- End of Script
-- =============================================
