-- Tabla: sucursales
CREATE TABLE public.sucursales (
  id_sucursal SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion TEXT,
  telefono VARCHAR(20),
  correo VARCHAR(255),
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: usuarios_grupos
CREATE TABLE public.usuarios_grupos (
  id_grupo SERIAL PRIMARY KEY,
  nombre_grupo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: usuarios_roles
CREATE TABLE public.usuarios_roles (
  id_rol SERIAL PRIMARY KEY,
  nombre_rol VARCHAR(255) NOT NULL,
  descripcion TEXT,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: config_scraping
CREATE TABLE public.config_scraping (
  id_config SERIAL PRIMARY KEY,
  nombre_config VARCHAR(255) NOT NULL,
  parametros JSONB,
  creado_por UUID,
  creado_en TIMESTAMP DEFAULT NOW()
);

-- Tabla: registros_actividades
CREATE TABLE public.registros_actividades (
  id_actividad SERIAL PRIMARY KEY,
  descripcion TEXT NOT NULL,
  fecha TIMESTAMP NOT NULL,
  id_usuario UUID,
  id_sucursal INT REFERENCES public.sucursales(id_sucursal),
  creado_en TIMESTAMP DEFAULT NOW()
);