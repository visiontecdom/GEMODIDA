-- Improved DDL for survey schema
-- Key changes:
-- 1) encuesta_* tables reference encuestadores.id_encu (primary key) instead of correo.
-- 2) Added NOT NULL to primary keys and frequently required columns.
-- 3) Added UNIQUE on correo in encuestadores (optional safety).
-- 4) Added appropriate indexes for FK columns and common filters.
-- 5) Added ON DELETE/ON UPDATE policies for referential integrity where reasonable.

-- Lookup / rating tables
CREATE TABLE calif_mucho_poco (
  calificacion TEXT PRIMARY KEY,
  puntos INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE calif_si_no (
  calificacion TEXT PRIMARY KEY,
  puntos INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE calif_bueno_malo (
  calificacion TEXT PRIMARY KEY,
  puntos INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE calif_satisf (
  satisfaccion TEXT PRIMARY KEY,
  puntos INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE calif_nivel (
  nivel INTEGER PRIMARY KEY,
  descripcion TEXT
);

CREATE TABLE calif_tiempo (
  duracion TEXT PRIMARY KEY,
  puntos INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE calif_alto_bajo (
  calificacion TEXT PRIMARY KEY,
  puntos INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE calif_claridad (
  calificacion TEXT PRIMARY KEY,
  puntos INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE encue_tipos (
  tipo_encuesta TEXT PRIMARY KEY,
  detalles TEXT
);

CREATE TABLE instituc_tipos (
  tipo_institucion TEXT PRIMARY KEY,
  detalles TEXT
);

CREATE TABLE clasif_centro (
  clasificacion TEXT PRIMARY KEY,
  detalles TEXT
);

-- Main institutions table
CREATE TABLE instituciones (
  id_inst TEXT PRIMARY KEY,
  nombre_institucion TEXT NOT NULL,
  tipo_institucion TEXT NOT NULL,
  clasificacion TEXT,
  pueblo_o_ciudad TEXT,
  barrio_o_sector TEXT,
  calle_y_numero TEXT,
  provincia TEXT,
  geo_referencia TEXT,
  telefono TEXT,
  correo TEXT,
  persona_de_contacto TEXT,
  CONSTRAINT fk_instituciones_tipo_institucion FOREIGN KEY (tipo_institucion)
    REFERENCES instituc_tipos (tipo_institucion) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_instituciones_clasificacion FOREIGN KEY (clasificacion)
    REFERENCES clasif_centro (clasificacion) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Surveyors table
CREATE TABLE encuestadores (
  id_encu TEXT PRIMARY KEY,            -- used as FK by survey tables
  nombre_completo TEXT NOT NULL,
  cedula TEXT UNIQUE,                  -- national id, unique if applicable
  telefono TEXT,
  correo TEXT,
  posicion TEXT,
  id_suc INTEGER
);

-- Optional: enforce unique email to allow referencing correo instead of id_encu.
-- Uncomment if you want to ensure correo uniqueness:
-- ALTER TABLE encuestadores ADD CONSTRAINT encuestadores_correo_unique UNIQUE (correo);

-- US Social Survey (USS)
CREATE TABLE encuesta_uss (
  id_encue TEXT PRIMARY KEY,
  fecha DATE,
  sucursal_dida INTEGER,
  id_inst TEXT NOT NULL,
  descripcion TEXT,
  tipo_institucion TEXT,
  pueblo_o_ciudad TEXT,
  tipo_encuesta TEXT,
  tipo_de_afiliado TEXT,
  genero TEXT,
  edad INTEGER,
  esta_empleado TEXT,
  tiene_ars TEXT,
  tiempo_de_espera TEXT,
  nivel_de_higiene TEXT,
  nivel_de_comodidad TEXT,
  trato_del_personal TEXT,
  claridad_de_informaciones TEXT,
  claridad_del_diagnostico TEXT,
  claridad_del_tratamiento TEXT,
  cobro_irregular TEXT,
  satisfaccion_de_precios TEXT,
  satisfaccion_del_servicio TEXT,
  recomienda_el_centro TEXT,
  experiencia_con_el_centro TEXT,
  experiencia_con_ars TEXT,
  experiencia_con_afp TEXT,
  observaciones_encuestador TEXT,
  encuestado_por TEXT,    -- stores encuestadores.id_encu
  puntuacion INTEGER,
  stat_encue TEXT,
  usuario TEXT,
  fec_reg TIMESTAMP DEFAULT now(),
  edit_count INTEGER DEFAULT 0,
  CONSTRAINT fk_encuesta_uss_inst FOREIGN KEY (id_inst)
    REFERENCES instituciones (id_inst) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_encuesta_uss_tipo_encuesta FOREIGN KEY (tipo_encuesta)
    REFERENCES encue_tipos (tipo_encuesta) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_encuestado_por FOREIGN KEY (encuestado_por)
    REFERENCES encuestadores (id_encu) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_tipo_institucion FOREIGN KEY (tipo_institucion)
    REFERENCES instituc_tipos (tipo_institucion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_esta_empleado FOREIGN KEY (esta_empleado)
    REFERENCES calif_si_no (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_tiene_ars FOREIGN KEY (tiene_ars)
    REFERENCES calif_mucho_poco (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_tiempo_de_espera FOREIGN KEY (tiempo_de_espera)
    REFERENCES calif_tiempo (duracion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_nivel_de_higiene FOREIGN KEY (nivel_de_higiene)
    REFERENCES calif_bueno_malo (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_nivel_de_comodidad FOREIGN KEY (nivel_de_comodidad)
    REFERENCES calif_bueno_malo (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_trato_del_personal FOREIGN KEY (trato_del_personal)
    REFERENCES calif_bueno_malo (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_claridad_de_informaciones FOREIGN KEY (claridad_de_informaciones)
    REFERENCES calif_claridad (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_claridad_del_diagnostico FOREIGN KEY (claridad_del_diagnostico)
    REFERENCES calif_claridad (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_claridad_del_tratamiento FOREIGN KEY (claridad_del_tratamiento)
    REFERENCES calif_claridad (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_cobro_irregular FOREIGN KEY (cobro_irregular)
    REFERENCES calif_si_no (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_satisfaccion_de_precios FOREIGN KEY (satisfaccion_de_precios)
    REFERENCES calif_alto_bajo (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_satisfaccion_del_servicio FOREIGN KEY (satisfaccion_del_servicio)
    REFERENCES calif_bueno_malo (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_uss_recomienda_el_centro FOREIGN KEY (recomienda_el_centro)
    REFERENCES calif_si_no (calificacion) ON UPDATE CASCADE ON DELETE SET NULL
);

-- PSS survey table
CREATE TABLE encuesta_pss (
  id_encue TEXT PRIMARY KEY,
  fecha DATE,
  sucursal INTEGER,
  institucion_evaluada TEXT NOT NULL,
  descripcion TEXT,
  tiempo_de_espera TEXT,
  nivel_de_higiene TEXT,
  nivel_de_comodidad TEXT,
  trato_del_personal TEXT,
  claridad_de_informaciones TEXT,
  claridad_del_diagnostico TEXT,
  claridad_del_tratamiento TEXT,
  satisfaccion_de_precios TEXT,
  recomienda_el_centro TEXT,
  observaciones_encuestado TEXT,
  observaciones_encuestador TEXT,
  encuestado_por TEXT,   -- stores encuestadores.id_encu
  puntuacion INTEGER,
  stat_encue TEXT,
  usuario TEXT,
  fec_reg TIMESTAMP DEFAULT now(),
  edit_count INTEGER DEFAULT 0,
  CONSTRAINT fk_encuesta_pss_inst FOREIGN KEY (institucion_evaluada)
    REFERENCES instituciones (id_inst) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_encuesta_pss_encuestado_por FOREIGN KEY (encuestado_por)
    REFERENCES encuestadores (id_encu) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_pss_tiempo_de_espera FOREIGN KEY (tiempo_de_espera)
    REFERENCES calif_tiempo (duracion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_pss_nivel_de_higiene FOREIGN KEY (nivel_de_higiene)
    REFERENCES calif_bueno_malo (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_pss_nivel_de_comodidad FOREIGN KEY (nivel_de_comodidad)
    REFERENCES calif_bueno_malo (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_pss_trato_del_personal FOREIGN KEY (trato_del_personal)
    REFERENCES calif_bueno_malo (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_pss_claridad_de_informaciones FOREIGN KEY (claridad_de_informaciones)
    REFERENCES calif_claridad (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_pss_claridad_del_diagnostico FOREIGN KEY (claridad_del_diagnostico)
    REFERENCES calif_claridad (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_pss_claridad_del_tratamiento FOREIGN KEY (claridad_del_tratamiento)
    REFERENCES calif_claridad (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_pss_satisfaccion_de_precios FOREIGN KEY (satisfaccion_de_precios)
    REFERENCES calif_alto_bajo (calificacion) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_encuesta_pss_recomienda_el_centro FOREIGN KEY (recomienda_el_centro)
    REFERENCES calif_si_no (calificacion) ON UPDATE CASCADE ON DELETE SET NULL
);

-- Points table (polymorphic id_encue left as TEXT intentionally)
CREATE TABLE encue_puntos (
  id_reg SERIAL PRIMARY KEY,
  id_encue TEXT NOT NULL,
  puntuacion INTEGER NOT NULL
);

-- Indexes to improve join/filter performance
CREATE INDEX idx_instituciones_tipo_institucion ON instituciones (tipo_institucion);
CREATE INDEX idx_instituciones_clasificacion ON instituciones (clasificacion);

CREATE INDEX idx_encuesta_uss_id_inst ON encuesta_uss (id_inst);
CREATE INDEX idx_encuesta_uss_tipo_encuesta ON encuesta_uss (tipo_encuesta);
CREATE INDEX idx_encuesta_uss_encuestado_por ON encuesta_uss (encuestado_por);
CREATE INDEX idx_encuesta_uss_tipo_institucion ON encuesta_uss (tipo_institucion);
CREATE INDEX idx_encuesta_uss_esta_empleado ON encuesta_uss (esta_empleado);
CREATE INDEX idx_encuesta_uss_tiene_ars ON encuesta_uss (tiene_ars);
CREATE INDEX idx_encuesta_uss_tiempo_de_espera ON encuesta_uss (tiempo_de_espera);
CREATE INDEX idx_encuesta_uss_nivel_de_higiene ON encuesta_uss (nivel_de_higiene);
CREATE INDEX idx_encuesta_uss_nivel_de_comodidad ON encuesta_uss (nivel_de_comodidad);
CREATE INDEX idx_encuesta_uss_trato_del_personal ON encuesta_uss (trato_del_personal);
CREATE INDEX idx_encuesta_uss_claridad_de_informaciones ON encuesta_uss (claridad_de_informaciones);
CREATE INDEX idx_encuesta_uss_claridad_del_diagnostico ON encuesta_uss (claridad_del_diagnostico);
CREATE INDEX idx_encuesta_uss_claridad_del_tratamiento ON encuesta_uss (claridad_del_tratamiento);
CREATE INDEX idx_encuesta_uss_cobro_irregular ON encuesta_uss (cobro_irregular);
CREATE INDEX idx_encuesta_uss_satisfaccion_de_precios ON encuesta_uss (satisfaccion_de_precios);
CREATE INDEX idx_encuesta_uss_satisfaccion_del_servicio ON encuesta_uss (satisfaccion_del_servicio);
CREATE INDEX idx_encuesta_uss_recomienda_el_centro ON encuesta_uss (recomienda_el_centro);

CREATE INDEX idx_encuesta_pss_institucion_evaluada ON encuesta_pss (institucion_evaluada);
CREATE INDEX idx_encuesta_pss_encuestado_por ON encuesta_pss (encuestado_por);
CREATE INDEX idx_encuesta_pss_tiempo_de_espera ON encuesta_pss (tiempo_de_espera);
CREATE INDEX idx_encuesta_pss_nivel_de_higiene ON encuesta_pss (nivel_de_higiene);
CREATE INDEX idx_encuesta_pss_nivel_de_comodidad ON encuesta_pss (nivel_de_comodidad);
CREATE INDEX idx_encuesta_pss_trato_del_personal ON encuesta_pss (trato_del_personal);
CREATE INDEX idx_encuesta_pss_claridad_de_informaciones ON encuesta_pss (claridad_de_informaciones);
CREATE INDEX idx_encuesta_pss_claridad_del_diagnostico ON encuesta_pss (claridad_del_diagnostico);
CREATE INDEX idx_encuesta_pss_claridad_del_tratamiento ON encuesta_pss (claridad_del_tratamiento);
CREATE INDEX idx_encuesta_pss_satisfaccion_de_precios ON encuesta_pss (satisfaccion_de_precios);
CREATE INDEX idx_encuesta_pss_recomienda_el_centro ON encuesta_pss (recomienda_el_centro);

-- Index for encuestadores lookup by cedula or correo (common lookup fields)
CREATE INDEX idx_encuestadores_cedula ON encuestadores (cedula);
CREATE INDEX idx_encuestadores_correo ON encuestadores (correo);

-- Optional: composite index for frequent queries (example: institution + date)
CREATE INDEX idx_encuesta_uss_inst_fecha ON encuesta_uss (id_inst, fecha);
CREATE INDEX idx_encuesta_pss_inst_fecha ON encuesta_pss (institucion_evaluada, fecha);