-- ============================================================================
-- GEMODIDA - Tablas Complementarias Faltantes
-- ============================================================================

-- Tabla para material promocional y evidencias
CREATE TABLE IF NOT EXISTS public.material_tipos (
    tipo_material TEXT PRIMARY KEY,
    descripcion TEXT,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.material_matriz (
    id_material SERIAL PRIMARY KEY,
    tipo_material TEXT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    archivo_url TEXT,
    id_sucursal INTEGER,
    creado_por UUID,
    fecha_creacion DATE DEFAULT CURRENT_DATE,
    estado VARCHAR(30) DEFAULT 'activo',
    metadatos JSONB DEFAULT '{}',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_material_tipo FOREIGN KEY (tipo_material) REFERENCES public.material_tipos(tipo_material),
    CONSTRAINT fk_material_sucursal FOREIGN KEY (id_sucursal) REFERENCES public.sucursales(id_suc),
    CONSTRAINT fk_material_creador FOREIGN KEY (creado_por) REFERENCES public.usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS public.material_evidencia (
    id SERIAL PRIMARY KEY,
    id_material INTEGER NOT NULL,
    tipo_evidencia VARCHAR(50) NOT NULL, -- 'foto', 'documento', 'video', 'enlace'
    titulo VARCHAR(200),
    descripcion TEXT,
    archivo_url TEXT,
    metadatos JSONB DEFAULT '{}',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_evidencia_material FOREIGN KEY (id_material) REFERENCES public.material_matriz(id_material)
);

-- Tabla para capacitaciones
CREATE TABLE IF NOT EXISTS public.capacitacion_tipos (
    actividad TEXT PRIMARY KEY,
    descripcion TEXT,
    duracion_horas INTEGER DEFAULT 1,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.capacitacion_matriz (
    id_capacitacion SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo_actividad TEXT,
    id_sucursal INTEGER,
    fecha_capacitacion DATE NOT NULL,
    duracion_horas INTEGER DEFAULT 1,
    participantes_esperados INTEGER,
    participantes_reales INTEGER,
    instructor VARCHAR(200),
    ubicacion VARCHAR(200),
    resultado TEXT,
    calificacion_promedio DECIMAL(3,2),
    creado_por UUID,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_capacitacion_tipo FOREIGN KEY (tipo_actividad) REFERENCES public.capacitacion_tipos(actividad),
    CONSTRAINT fk_capacitacion_sucursal FOREIGN KEY (id_sucursal) REFERENCES public.sucursales(id_suc),
    CONSTRAINT fk_capacitacion_creador FOREIGN KEY (creado_por) REFERENCES public.usuarios(id_usuario)
);

CREATE TABLE IF NOT EXISTS public.capacitacion_evidencia (
    id SERIAL PRIMARY KEY,
    id_capacitacion INTEGER NOT NULL,
    tipo_evidencia VARCHAR(50) NOT NULL,
    titulo VARCHAR(200),
    descripcion TEXT,
    archivo_url TEXT,
    metadatos JSONB DEFAULT '{}',
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_evidencia_capacitacion FOREIGN KEY (id_capacitacion) REFERENCES public.capacitacion_matriz(id_capacitacion)
);

-- Tabla para enlaces externos de promoción
CREATE TABLE IF NOT EXISTS public.enlaces_externos_promocion (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    url TEXT NOT NULL,
    categoria VARCHAR(100),
    id_sucursal INTEGER,
    es_publico BOOLEAN DEFAULT true,
    fecha_publicacion DATE DEFAULT CURRENT_DATE,
    fecha_expiracion DATE,
    creado_por UUID,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_enlace_sucursal FOREIGN KEY (id_sucursal) REFERENCES public.sucursales(id_suc),
    CONSTRAINT fk_enlace_creador FOREIGN KEY (creado_por) REFERENCES public.usuarios(id_usuario)
);

-- Tabla para presupuestos
CREATE TABLE IF NOT EXISTS public.presupuestos (
    id_presupuesto SERIAL PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    tipo_presupuesto VARCHAR(50) NOT NULL, -- 'monitoreo', 'promocion', 'capacitacion'
    id_sucursal INTEGER NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fin DATE NOT NULL,
    monto_asignado DECIMAL(12,2) NOT NULL DEFAULT 0,
    monto_ejecutado DECIMAL(12,2) DEFAULT 0,
    monto_comprometido DECIMAL(12,2) DEFAULT 0,
    estado VARCHAR(30) DEFAULT 'activo', -- 'activo', 'cerrado', 'suspendido'
    aprobado_por UUID,
    fecha_aprobacion DATE,
    creado_por UUID,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_presupuesto_sucursal FOREIGN KEY (id_sucursal) REFERENCES public.sucursales(id_suc),
    CONSTRAINT fk_presupuesto_aprobador FOREIGN KEY (aprobado_por) REFERENCES public.usuarios(id_usuario),
    CONSTRAINT fk_presupuesto_creador FOREIGN KEY (creado_por) REFERENCES public.usuarios(id_usuario)
);

-- Tabla para ejecución presupuestaria
CREATE TABLE IF NOT EXISTS public.ejecucion_presupuestaria (
    id_ejecucion SERIAL PRIMARY KEY,
    id_presupuesto INTEGER NOT NULL,
    concepto VARCHAR(200) NOT NULL,
    descripcion TEXT,
    monto DECIMAL(10,2) NOT NULL,
    fecha_ejecucion DATE NOT NULL,
    tipo_movimiento VARCHAR(20) NOT NULL, -- 'gasto', 'compromiso', 'devolucion'
    numero_factura VARCHAR(100),
    proveedor VARCHAR(200),
    id_actividad INTEGER, -- Referencia opcional a actividad
    aprobado_por UUID,
    creado_por UUID,
    creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT fk_ejecucion_presupuesto FOREIGN KEY (id_presupuesto) REFERENCES public.presupuestos(id_presupuesto),
    CONSTRAINT fk_ejecucion_actividad FOREIGN KEY (id_actividad) REFERENCES public.actividad_matriz(id_actividad),
    CONSTRAINT fk_ejecucion_aprobador FOREIGN KEY (aprobado_por) REFERENCES public.usuarios(id_usuario),
    CONSTRAINT fk_ejecucion_creador FOREIGN KEY (creado_por) REFERENCES public.usuarios(id_usuario)
);

-- Insertar datos iniciales
INSERT INTO public.material_tipos (tipo_material, descripcion) VALUES
('Volante', 'Material impreso informativo'),
('Brochure', 'Folleto informativo detallado'),
('Banner', 'Material publicitario de gran formato'),
('Video', 'Material audiovisual'),
('Presentación', 'Presentación digital'),
('Infografía', 'Material gráfico informativo')
ON CONFLICT (tipo_material) DO NOTHING;

INSERT INTO public.capacitacion_tipos (actividad, descripcion, duracion_horas) VALUES
('Taller Básico', 'Taller de capacitación básica', 2),
('Seminario', 'Seminario especializado', 4),
('Conferencia', 'Conferencia magistral', 1),
('Curso Intensivo', 'Curso de capacitación intensiva', 8),
('Workshop', 'Taller práctico interactivo', 3)
ON CONFLICT (actividad) DO NOTHING;

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_material_matriz_sucursal ON public.material_matriz(id_sucursal);
CREATE INDEX IF NOT EXISTS idx_material_matriz_tipo ON public.material_matriz(tipo_material);
CREATE INDEX IF NOT EXISTS idx_capacitacion_matriz_sucursal ON public.capacitacion_matriz(id_sucursal);
CREATE INDEX IF NOT EXISTS idx_capacitacion_matriz_fecha ON public.capacitacion_matriz(fecha_capacitacion);
CREATE INDEX IF NOT EXISTS idx_presupuestos_sucursal ON public.presupuestos(id_sucursal);
CREATE INDEX IF NOT EXISTS idx_presupuestos_periodo ON public.presupuestos(periodo_inicio, periodo_fin);
CREATE INDEX IF NOT EXISTS idx_ejecucion_presupuesto ON public.ejecucion_presupuestaria(id_presupuesto);
CREATE INDEX IF NOT EXISTS idx_ejecucion_fecha ON public.ejecucion_presupuestaria(fecha_ejecucion);

-- Triggers para actualizar timestamps
CREATE TRIGGER trigger_presupuestos_timestamp
    BEFORE UPDATE ON public.presupuestos
    FOR EACH ROW EXECUTE FUNCTION actualizar_timestamp_modificacion();

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.material_matriz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_evidencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacitacion_matriz ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capacitacion_evidencia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enlaces_externos_promocion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ejecucion_presupuestaria ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
CREATE POLICY "usuarios_ven_material_sucursal" ON public.material_matriz
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.asignaciones_usuario au
            WHERE au.id_usuario = auth.uid()
            AND au.id_sucursal = material_matriz.id_sucursal
            AND au.esta_activa = true
        )
        OR
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.puede_ver_todas_sucursales = true
            AND au.esta_activa = true
        )
    );

CREATE POLICY "usuarios_ven_capacitaciones_sucursal" ON public.capacitacion_matriz
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.asignaciones_usuario au
            WHERE au.id_usuario = auth.uid()
            AND au.id_sucursal = capacitacion_matriz.id_sucursal
            AND au.esta_activa = true
        )
        OR
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.puede_ver_todas_sucursales = true
            AND au.esta_activa = true
        )
    );

CREATE POLICY "usuarios_ven_presupuestos_sucursal" ON public.presupuestos
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.asignaciones_usuario au
            WHERE au.id_usuario = auth.uid()
            AND au.id_sucursal = presupuestos.id_sucursal
            AND au.esta_activa = true
        )
        OR
        EXISTS (
            SELECT 1 FROM public.usuarios u
            JOIN public.asignaciones_usuario au ON u.id_usuario = au.id_usuario
            JOIN public.usuarios_roles ur ON au.id_rol = ur.id_rol
            WHERE u.id_usuario = auth.uid()
            AND ur.puede_ver_todas_sucursales = true
            AND au.esta_activa = true
        )
    );

-- Log de migración
INSERT INTO public.ddl_migrations_log (mensaje) VALUES 
('Tablas complementarias creadas: material, capacitación, enlaces, presupuestos y ejecución presupuestaria');