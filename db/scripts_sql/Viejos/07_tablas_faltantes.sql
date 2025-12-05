-- ============================================================================
-- GEMODIDA: Tablas Faltantes
-- Fecha: 2025-11-19
-- ============================================================================

-- Tabla surveys (Encuestas)
DROP TABLE IF EXISTS public.surveys CASCADE;
CREATE TABLE public.surveys (
    id_encuesta SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    id_usuario_creador UUID,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estado VARCHAR(50) DEFAULT 'activa',
    FOREIGN KEY (id_usuario_creador) REFERENCES usuarios(id_usuario)
);

-- Tabla activities (Actividades)
DROP TABLE IF EXISTS public.activities CASCADE;
CREATE TABLE public.activities (
    id_actividad SERIAL PRIMARY KEY,
    tipo_actividad VARCHAR(50) NOT NULL,
    descripcion TEXT,
    fecha DATE NOT NULL,
    ubicacion VARCHAR(255),
    id_usuario_asignado UUID,
    resultado TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (id_usuario_asignado) REFERENCES usuarios(id_usuario)
);

-- Tabla respuestas_encuesta (Respuestas de encuestas)
DROP TABLE IF EXISTS public.respuestas_encuesta CASCADE;
CREATE TABLE public.respuestas_encuesta (
    id_respuesta SERIAL PRIMARY KEY,
    id_encuesta INTEGER NOT NULL,
    id_usuario UUID,
    respuesta_json JSONB,
    fecha_respuesta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (id_encuesta) REFERENCES surveys(id_encuesta),
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Índices
CREATE INDEX idx_surveys_usuario ON surveys(id_usuario_creador);
CREATE INDEX idx_activities_usuario ON activities(id_usuario_asignado);
CREATE INDEX idx_respuestas_encuesta_encuesta ON respuestas_encuesta(id_encuesta);
