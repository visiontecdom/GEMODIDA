-- Esquema (DDL) Generado por Sheet2Postgres

-- Tabla: regiones
CREATE TABLE regiones (
    region TEXT PRIMARY KEY,
    descripcion TEXT
);

-- Tabla: provincias
CREATE TABLE provincias (
    provincia TEXT PRIMARY KEY,
    capital TEXT,
    ciudad_mas_poblada TEXT,
    escudo TEXT,
    region TEXT,
    superficie_km2 NUMERIC,
    poblacion_2021 INTEGER,
    densidad_hab_km2 TEXT,
    latitud NUMERIC,
    longitud NUMERIC,
    mapa TEXT,
    FOREIGN KEY (region) REFERENCES regiones(region)
);
CREATE INDEX idx_provincias_region ON provincias(region);

-- Tabla: provincias_alt (Alternative/Simplified Provincias data)
CREATE TABLE provincias_alt (
    provincia TEXT PRIMARY KEY,
    capital TEXT,
    ciudad_principal TEXT,
    region TEXT,
    FOREIGN KEY (region) REFERENCES regiones(region)
);
CREATE INDEX idx_provincias_alt_region ON provincias_alt(region);

-- Tabla: municipios
CREATE TABLE municipios (
    nombre_municipio TEXT PRIMARY KEY,
    provincia TEXT,
    fecha_creado DATE,
    poblacion INTEGER,
    area_km2 NUMERIC,
    densidad TEXT,
    nombre_anterior TEXT,
    FOREIGN KEY (provincia) REFERENCES provincias(provincia)
);
CREATE INDEX idx_municipios_provincia ON municipios(provincia);

-- Tabla: areas_trabajo
CREATE TABLE areas_trabajo (
    area_trab TEXT PRIMARY KEY,
    descripcion TEXT
);

-- Tabla: usr_grupos
CREATE TABLE usr_grupos (
    grupo TEXT PRIMARY KEY,
    detalles TEXT
);

-- Tabla: licencias_sistema
CREATE TABLE licencias_sistema (
    id_lic TEXT PRIMARY KEY,
    nombre_negocio TEXT,
    persona_responsable TEXT,
    telefono_responsable TEXT,
    correo_responsable TEXT,
    codigo_licencia TEXT UNIQUE,
    clave_acceso TEXT,
    fecha_inicio DATE,
    fecha_vence DATE,
    nombre_bd TEXT,
    estado_licencia TEXT,
    cod_int_lic TEXT
);
CREATE INDEX idx_licencias_sistema_codigo_licencia ON licencias_sistema(codigo_licencia);

-- Tabla: menu_matz
CREATE TABLE menu_matz (
    id_reg INTEGER PRIMARY KEY,
    titulo TEXT,
    pantalla TEXT,
    descripcion TEXT,
    imagen TEXT,
    orden INTEGER,
    estado TEXT
);

-- Tabla: menu_admin
CREATE TABLE menu_admin (
    id_reg INTEGER PRIMARY KEY,
    titulo TEXT,
    pantalla TEXT,
    descripcion TEXT,
    imagen TEXT,
    orden INTEGER,
    estado TEXT
);

-- Tabla: menu_monit
CREATE TABLE menu_monit (
    id_reg INTEGER PRIMARY KEY,
    titulo TEXT,
    pantalla TEXT,
    descripcion TEXT,
    imagen TEXT,
    area_trab TEXT,
    grupo TEXT,
    acceso TEXT,
    orden INTEGER,
    estado TEXT,
    FOREIGN KEY (area_trab) REFERENCES areas_trabajo(area_trab),
    FOREIGN KEY (grupo) REFERENCES usr_grupos(grupo)
);
CREATE INDEX idx_menu_monit_area_trab ON menu_monit(area_trab);
CREATE INDEX idx_menu_monit_grupo ON menu_monit(grupo);

-- Tabla: menu_prom
CREATE TABLE menu_prom (
    id_reg INTEGER PRIMARY KEY,
    titulo TEXT,
    pantalla TEXT,
    descripcion TEXT,
    imagen TEXT,
    area_trab TEXT,
    grupo TEXT,
    acceso TEXT,
    orden INTEGER,
    estado TEXT,
    FOREIGN KEY (area_trab) REFERENCES areas_trabajo(area_trab),
    FOREIGN KEY (grupo) REFERENCES usr_grupos(grupo)
);
CREATE INDEX idx_menu_prom_area_trab ON menu_prom(area_trab);
CREATE INDEX idx_menu_prom_grupo ON menu_prom(grupo);

-- Tabla: sucursales
CREATE TABLE sucursales (
    id_suc INTEGER PRIMARY KEY,
    tipo_suc TEXT,
    nombre_sucursal TEXT,
    descripcion TEXT,
    provincia TEXT,
    municipio TEXT,
    direccion TEXT,
    geo_referencia TEXT,
    telefono_sucursal TEXT,
    correo_sucursal TEXT,
    persona_responsable TEXT,
    telefono_responsable TEXT,
    correo_responsable TEXT,
    horario TEXT,
    estado TEXT,
    fec_reg DATE,
    FOREIGN KEY (provincia) REFERENCES provincias(provincia),
    FOREIGN KEY (municipio) REFERENCES municipios(nombre_municipio)
);
CREATE INDEX idx_sucursales_provincia ON sucursales(provincia);
CREATE INDEX idx_sucursales_municipio ON sucursales(municipio);

-- Tabla: usuarios
CREATE TABLE usuarios (
    correo TEXT PRIMARY KEY,
    nombre TEXT,
    login TEXT,
    clave TEXT,
    cod_lic TEXT,
    id_suc INTEGER,
    area TEXT,
    grupo TEXT,
    rol TEXT,
    estado TEXT,
    fec_reg DATE,
    FOREIGN KEY (cod_lic) REFERENCES licencias_sistema(codigo_licencia),
    FOREIGN KEY (id_suc) REFERENCES sucursales(id_suc),
    FOREIGN KEY (area) REFERENCES areas_trabajo(area_trab),
    FOREIGN KEY (grupo) REFERENCES usr_grupos(grupo)
);
CREATE INDEX idx_usuarios_cod_lic ON usuarios(cod_lic);
CREATE INDEX idx_usuarios_id_suc ON usuarios(id_suc);
CREATE INDEX idx_usuarios_area ON usuarios(area);
CREATE INDEX idx_usuarios_grupo ON usuarios(grupo);

-- Tabla: sistema_usuarios
CREATE TABLE sistema_usuarios (
    correo TEXT PRIMARY KEY,
    titulo TEXT,
    contacto TEXT,
    telefono TEXT
);