-- ============================================================================
-- GEMODIDA - Tablas Faltantes para Sistema de Roles y Permisos Avanzado
-- ============================================================================

-- Tabla para definir grupos de trabajo dinámicos
CREATE TABLE IF NOT EXISTS public.usuarios_grupos (
    id_grupo SERIAL PRIMARY KEY,
    codigo_grupo VARCHAR(50) UNIQUE NOT NULL,
    nombre_grupo VARCHAR(100) NOT NULL,
    descripcion TEXT,
    esta_activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para roles de usuario con permisos granulares
CREATE TABLE IF NOT EXISTS public.usuarios_roles (
    id_rol SERIAL PRIMARY KEY,
    codigo_rol VARCHAR(50) UNIQUE NOT NULL,
    nombre_rol VARCHAR(100) NOT NULL,
    descripcion TEXT,
    nivel_acceso INTEGER DEFAULT 1, -- 1=básico, 5=super_user
    permisos_json JSONB DEFAULT '{}',
    puede_crear_usuarios BOOLEAN DEFAULT false,
    puede_ver_todas_sucursales BOOLEAN DEFAULT false,
    esta_activo BOOLEAN DEFAULT true,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de asignaciones usuario-grupo-rol-sucursal
CREATE TABLE IF NOT EXISTS public.asignaciones_usuario (
    id_asignacion SERIAL PRIMARY KEY,
    id_usuario UUID NOT NULL,
    id_grupo INTEGER NOT NULL,
    id_rol INTEGER NOT NULL,
    id_sucursal INTEGER NOT NULL,
    es_principal BOOLEAN DEFAULT false, -- Indica la asignación principal del usuario
    fecha_inicio DATE DEFAULT CURRENT_DATE,
    fecha_fin DATE,
    esta_activa BOOLEAN DEFAULT true,
    creado_por UUID,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_asignacion_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuarios(id_usuario),
    CONSTRAINT fk_asignacion_grupo FOREIGN KEY (id_grupo) REFERENCES public.usuarios_grupos(id_grupo),
    CONSTRAINT fk_asignacion_rol FOREIGN KEY (id_rol) REFERENCES public.usuarios_roles(id_rol),
    CONSTRAINT fk_asignacion_sucursal FOREIGN KEY (id_sucursal) REFERENCES public.sucursales(id_suc),
    CONSTRAINT fk_asignacion_creador FOREIGN KEY (creado_por) REFERENCES public.usuarios(id_usuario),
    
    -- Un usuario solo puede tener una asignación principal por grupo
    CONSTRAINT unique_principal_por_grupo UNIQUE (id_usuario, id_grupo, es_principal) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Tabla para configuración de scraping
CREATE TABLE IF NOT EXISTS public.configuracion_scraping (
    id_config SERIAL PRIMARY KEY,
    nombre_configuracion VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fuentes_activas INTEGER[] DEFAULT '{}', -- Array de IDs de fuentes
    palabras_clave_activas INTEGER[] DEFAULT '{}', -- Array de IDs de palabras clave
    frecuencia_minutos INTEGER DEFAULT 60,
    esta_activa BOOLEAN DEFAULT true,
    configuracion_avanzada JSONB DEFAULT '{}',
    creado_por UUID,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_config_scraping_creador FOREIGN KEY (creado_por) REFERENCES public.usuarios(id_usuario)
);

-- Tabla para planificación de trabajos
CREATE TABLE IF NOT EXISTS public.planificacion_trabajos (
    id_planificacion SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo_trabajo VARCHAR(50) NOT NULL, -- 'monitoreo', 'promocion', 'encuesta'
    id_sucursal INTEGER NOT NULL,
    id_usuario_responsable UUID,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado VARCHAR(30) DEFAULT 'planificado', -- planificado, en_progreso, completado, cancelado
    prioridad INTEGER DEFAULT 3, -- 1=alta, 3=media, 5=baja
    presupuesto_estimado DECIMAL(10,2),
    presupuesto_real DECIMAL(10,2),
    progreso_porcentaje INTEGER DEFAULT 0,
    metadatos JSONB DEFAULT '{}',
    creado_por UUID,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_planificacion_sucursal FOREIGN KEY (id_sucursal) REFERENCES public.sucursales(id_suc),
    CONSTRAINT fk_planificacion_responsable FOREIGN KEY (id_usuario_responsable) REFERENCES public.usuarios(id_usuario),
    CONSTRAINT fk_planificacion_creador FOREIGN KEY (creado_por) REFERENCES public.usuarios(id_usuario)
);

-- Tabla para tareas específicas dentro de planificaciones
CREATE TABLE IF NOT EXISTS public.tareas_planificacion (
    id_tarea SERIAL PRIMARY KEY,
    id_planificacion INTEGER NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    id_usuario_asignado UUID,
    fecha_limite DATE,
    estado VARCHAR(30) DEFAULT 'pendiente', -- pendiente, en_progreso, completada, cancelada
    prioridad INTEGER DEFAULT 3,
    tiempo_estimado_horas DECIMAL(5,2),
    tiempo_real_horas DECIMAL(5,2),
    resultado TEXT,
    evidencias JSONB DEFAULT '[]', -- Array de URLs o paths de archivos
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_tarea_planificacion FOREIGN KEY (id_planificacion) REFERENCES public.planificacion_trabajos(id_planificacion),
    CONSTRAINT fk_tarea_asignado FOREIGN KEY (id_usuario_asignado) REFERENCES public.usuarios(id_usuario)
);

-- Tabla para diseño de encuestas personalizadas
CREATE TABLE IF NOT EXISTS public.diseno_encuestas (
    id_diseno SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo_encuesta VARCHAR(50) NOT NULL, -- 'uss', 'pss', 'personalizada'
    id_sucursal INTEGER,
    estructura_json JSONB NOT NULL, -- Estructura completa de la encuesta
    esta_activa BOOLEAN DEFAULT true,
    es_plantilla BOOLEAN DEFAULT false,
    creado_por UUID,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_diseno_encuesta_sucursal FOREIGN KEY (id_sucursal) REFERENCES public.sucursales(id_suc),
    CONSTRAINT fk_diseno_encuesta_creador FOREIGN KEY (creado_por) REFERENCES public.usuarios(id_usuario)
);

-- Tabla para respuestas de encuestas personalizadas
CREATE TABLE IF NOT EXISTS public.respuestas_encuestas_personalizadas (
    id_respuesta SERIAL PRIMARY KEY,
    id_diseno INTEGER NOT NULL,
    id_encuestador UUID,
    respuestas_json JSONB NOT NULL,
    ubicacion_gps VARCHAR(100),
    fecha_encuesta TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    duracion_minutos INTEGER,
    observaciones TEXT,
    estado VARCHAR(30) DEFAULT 'completada', -- completada, incompleta, validada
    
    CONSTRAINT fk_respuesta_diseno FOREIGN KEY (id_diseno) REFERENCES public.diseno_encuestas(id_diseno),
    CONSTRAINT fk_respuesta_encuestador FOREIGN KEY (id_encuestador) REFERENCES public.usuarios(id_usuario)
);

-- Tabla para notificaciones del sistema
CREATE TABLE IF NOT EXISTS public.notificaciones_sistema (
    id_notificacion SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    mensaje TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- 'alerta', 'info', 'warning', 'success'
    id_usuario_destinatario UUID,
    id_grupo_destinatario INTEGER, -- Para notificaciones grupales
    es_leida BOOLEAN DEFAULT false,
    es_global BOOLEAN DEFAULT false, -- Para notificaciones a todos los usuarios
    metadatos JSONB DEFAULT '{}',
    fecha_expiracion TIMESTAMP WITH TIME ZONE,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    leida_en TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT fk_notificacion_usuario FOREIGN KEY (id_usuario_destinatario) REFERENCES public.usuarios(id_usuario),
    CONSTRAINT fk_notificacion_grupo FOREIGN KEY (id_grupo_destinatario) REFERENCES public.usuarios_grupos(id_grupo)
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_asignaciones_usuario_activa ON public.asignaciones_usuario(id_usuario, esta_activa);
CREATE INDEX IF NOT EXISTS idx_asignaciones_sucursal ON public.asignaciones_usuario(id_sucursal);
CREATE INDEX IF NOT EXISTS idx_planificacion_fecha ON public.planificacion_trabajos(fecha_inicio, fecha_fin);
CREATE INDEX IF NOT EXISTS idx_tareas_estado ON public.tareas_planificacion(estado, fecha_limite);
CREATE INDEX IF NOT EXISTS idx_notificaciones_usuario ON public.notificaciones_sistema(id_usuario_destinatario, es_leida);

-- Triggers para actualizar timestamps
CREATE OR REPLACE FUNCTION actualizar_timestamp_modificacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.actualizado_en = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_usuarios_grupos_timestamp
    BEFORE UPDATE ON public.usuarios_grupos
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_modificacion();

CREATE TRIGGER trigger_usuarios_roles_timestamp
    BEFORE UPDATE ON public.usuarios_roles
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_modificacion();

CREATE TRIGGER trigger_configuracion_scraping_timestamp
    BEFORE UPDATE ON public.configuracion_scraping
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_modificacion();

CREATE TRIGGER trigger_planificacion_trabajos_timestamp
    BEFORE UPDATE ON public.planificacion_trabajos
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_modificacion();

CREATE TRIGGER trigger_tareas_planificacion_timestamp
    BEFORE UPDATE ON public.tareas_planificacion
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_modificacion();

CREATE TRIGGER trigger_diseno_encuestas_timestamp
    BEFORE UPDATE ON public.diseno_encuestas
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_modificacion();