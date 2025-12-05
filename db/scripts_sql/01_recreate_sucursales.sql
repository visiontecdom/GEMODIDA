-- Eliminar la tabla anterior (y dependencias) si existe
DROP TABLE IF EXISTS public.sucursales CASCADE;

-- Crear la tabla sucursales con id_suc autoincremental
CREATE TABLE public.sucursales (
  id_suc SERIAL PRIMARY KEY,
  tipo_suc TEXT,
  nombre_sucursal TEXT NOT NULL,
  descripcion TEXT,
  provincia TEXT NOT NULL,
  municipio TEXT,
  direccion TEXT,
  geo_referencia TEXT,
  telefono_sucursal TEXT,
  correo_sucursal TEXT,
  persona_responsable TEXT,
  telefono_responsable TEXT,
  correo_responsable TEXT,
  horario TEXT,
  estado TEXT NOT NULL,
  fec_reg DATE DEFAULT CURRENT_DATE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT now()
);
