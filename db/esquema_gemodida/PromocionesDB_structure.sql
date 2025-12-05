-- Esquema (DDL) Generado por Sheet2Postgres

-- Tabla para almacenar los renglones de las actividades
CREATE TABLE actividad_renglon (
    renglon TEXT PRIMARY KEY,
    descripcion TEXT
);

-- Tabla para almacenar los estados de las actividades
CREATE TABLE actividad_estados (
    estado_actividad TEXT PRIMARY KEY,
    descripcion TEXT
);

-- Tabla para almacenar los tipos de actividades
CREATE TABLE actividad_tipos (
    tipo_actividad TEXT PRIMARY KEY,
    descripcion TEXT,
    renglon TEXT,
    estado TEXT,
    CONSTRAINT fk_actividad_tipos_renglon FOREIGN KEY (renglon) REFERENCES actividad_renglon (renglon)
);

-- Tabla principal de la matriz de actividades
CREATE TABLE actividad_matriz (
    id_actividad TEXT PRIMARY KEY,
    fecha DATE,
    renglon TEXT,
    tipo_actividad TEXT,
    id_sucursal INTEGER,
    lugar_impactado TEXT,
    descripcion TEXT,
    nombre_sucursal TEXT,
    region TEXT,
    provincia TEXT,
    municipio TEXT,
    tipo_entidad TEXT,
    modalidad TEXT,
    tema_material TEXT,
    responsable_interno TEXT,
    telefono_responsable_interno TEXT,
    responsable_externo TEXT,
    telefono_responsable_externo TEXT,
    estado_actividad TEXT,
    tipo_seguimiento TEXT,
    progreso TEXT, -- Mantener como TEXT debido a valores no numéricos como ' '
    cantidad_masculino INTEGER,
    cantidad_femenino INTEGER,
    cantidad_adultos_mayores INTEGER,
    total_personas INTEGER,
    observaciones TEXT,
    usuario TEXT,
    fecha_registro TIMESTAMP,
    edit_count INTEGER,
    print_count INTEGER,
    app_user_mail TEXT,
    CONSTRAINT fk_actividad_matriz_renglon FOREIGN KEY (renglon) REFERENCES actividad_renglon (renglon),
    CONSTRAINT fk_actividad_matriz_tipo_actividad FOREIGN KEY (tipo_actividad) REFERENCES actividad_tipos (tipo_actividad),
    CONSTRAINT fk_actividad_matriz_estado_actividad FOREIGN KEY (estado_actividad) REFERENCES actividad_estados (estado_actividad)
);

-- Tabla para almacenar las evidencias de las actividades
CREATE TABLE actividad_evidencia (
    id TEXT PRIMARY KEY,
    id_actividad TEXT,
    titulo_evidencia TEXT,
    tipo_evidencia TEXT,
    foto TEXT,
    documento TEXT,
    sitio_web TEXT,
    ruta_evidencia TEXT,
    estado_evidencia TEXT,
    nota TEXT,
    usuario TEXT,
    fecha_registro TIMESTAMP,
    CONSTRAINT fk_actividad_evidencia_id_actividad FOREIGN KEY (id_actividad) REFERENCES actividad_matriz (id_actividad)
);

-- Tabla para almacenar los tipos de capacitaciones
CREATE TABLE capacitacion_tipos (
    actividad TEXT PRIMARY KEY,
    descripcion TEXT,
    estado TEXT
);

-- Tabla principal de la matriz de capacitaciones
CREATE TABLE capacitacion_matriz (
    id_capacitacion TEXT PRIMARY KEY,
    fecha DATE,
    id_sucursal INTEGER,
    region TEXT,
    provincia TEXT,
    municipio TEXT,
    direccion TEXT,
    tipo_seguimiento TEXT,
    descripcion TEXT,
    institucion TEXT,
    estado TEXT,
    progreso NUMERIC,
    responsable_interno TEXT,
    telefono_responsable_interno TEXT,
    responsable_externo TEXT,
    telefono_responsable_externo TEXT,
    observaciones TEXT,
    usuario TEXT,
    fecha_registro TIMESTAMP,
    edit_count INTEGER,
    print_count INTEGER,
    app_user_mail TEXT
    -- No FK a capacitacion_tipos.actividad porque 'Tipo_Seg' no coincide directamente con 'Actividad' de Capac_Tipos en el ejemplo.
    -- No FK a actividad_estados.estado_actividad, ya que 'Estatus' es 'Realizado' y no 'Realizada'
);

-- Tabla para almacenar las evidencias de las capacitaciones
CREATE TABLE capacitacion_evidencia (
    id TEXT PRIMARY KEY,
    id_capacitacion TEXT,
    titulo_evidencia TEXT,
    tipo_evidencia TEXT,
    foto TEXT,
    documento TEXT,
    sitio_web TEXT,
    estado_evidencia TEXT,
    nota TEXT,
    usuario TEXT,
    fecha_registro TIMESTAMP,
    CONSTRAINT fk_capacitacion_evidencia_id_capacitacion FOREIGN KEY (id_capacitacion) REFERENCES capacitacion_matriz (id_capacitacion)
);

-- Tabla para almacenar los tipos de materiales
CREATE TABLE material_tipos (
    tipo_material TEXT PRIMARY KEY,
    descripcion TEXT,
    detalles TEXT
);

-- Tabla principal de la matriz de materiales
CREATE TABLE material_matriz (
    id_material TEXT PRIMARY KEY,
    fecha DATE,
    id_sucursal INTEGER,
    region TEXT,
    provincia TEXT,
    municipio TEXT,
    direccion TEXT,
    tipo_material TEXT,
    concepto TEXT,
    estado_registro TEXT,
    observacion TEXT,
    usuario TEXT,
    fecha_registro TIMESTAMP,
    edit_count INTEGER,
    print_count INTEGER,
    app_user_mail TEXT,
    CONSTRAINT fk_material_matriz_tipo_material FOREIGN KEY (tipo_material) REFERENCES material_tipos (tipo_material)
);

-- Tabla para almacenar las evidencias de los materiales
CREATE TABLE material_evidencia (
    id TEXT PRIMARY KEY,
    id_material TEXT,
    titulo_evidencia TEXT,
    tipo_evidencia TEXT,
    foto TEXT,
    documento TEXT,
    sitio_web TEXT,
    estado_evidencia TEXT,
    nota TEXT,
    usuario TEXT,
    fecha_registro TIMESTAMP,
    CONSTRAINT fk_material_evidencia_id_material FOREIGN KEY (id_material) REFERENCES material_matriz (id_material)
);

-- Tabla para almacenar enlaces externos de promoción
CREATE TABLE enlaces_externos_promocion (
    id TEXT PRIMARY KEY,
    id_sucursal INTEGER,
    titulo TEXT,
    enlace TEXT,
    descripcion TEXT,
    icono TEXT,
    usuario TEXT,
    fecha_registro TIMESTAMP,
    app_user_mail TEXT
);

-- Creación de índices para las claves foráneas
CREATE INDEX idx_actividad_matriz_renglon ON actividad_matriz (renglon);
CREATE INDEX idx_actividad_matriz_tipo_actividad ON actividad_matriz (tipo_actividad);
CREATE INDEX idx_actividad_matriz_estado_actividad ON actividad_matriz (estado_actividad);
CREATE INDEX idx_actividad_evidencia_id_actividad ON actividad_evidencia (id_actividad);
CREATE INDEX idx_actividad_tipos_renglon ON actividad_tipos (renglon);
CREATE INDEX idx_capacitacion_evidencia_id_capacitacion ON capacitacion_evidencia (id_capacitacion);
CREATE INDEX idx_material_matriz_tipo_material ON material_matriz (tipo_material);
CREATE INDEX idx_material_evidencia_id_material ON material_evidencia (id_material);
-- No se crean índices para id_sucursal ya que no hay una tabla 'sucursales' con la que hacer FK.
-- Tampoco para tipo_seguimiento o estado en capacitacion_matriz por las razones mencionadas.