-- =============================
-- DATOS INICIALES DEL SISTEMA
-- =============================

-- REGIONES
INSERT INTO public.regiones (region, descripcion) VALUES
('Cibao Norte', 'Región del Cibao Norte'),
('Cibao Sur', 'Región del Cibao Sur'),
('Cibao Nordeste', 'Región del Cibao Nordeste'),
('Cibao Noroeste', 'Región del Cibao Noroeste'),
('Valdesia', 'Región de Valdesia'),
('Enriquillo', 'Región de Enriquillo'),
('El Valle', 'Región de El Valle'),
('Yuma', 'Región de Yuma'),
('Higuamo', 'Región del Higuamo'),
('Ozama', 'Región de Ozama')
ON CONFLICT (region) DO NOTHING;

-- PROVINCIAS
INSERT INTO public.provincias (provincia, capital, region, superficie_km2, poblacion_2021) VALUES
('Distrito Nacional', 'Santo Domingo', 'Ozama', 91.58, 1029110),
('Santo Domingo', 'Santo Domingo Este', 'Ozama', 1302.20, 3339410),
('Santiago', 'Santiago de los Caballeros', 'Cibao Norte', 2836.51, 1200000),
('La Altagracia', 'Higüey', 'Yuma', 3010.34, 350000),
('Puerto Plata', 'Puerto Plata', 'Cibao Norte', 1852.93, 350000),
('La Romana', 'La Romana', 'Yuma', 653.95, 250000),
('San Cristóbal', 'San Cristóbal', 'Valdesia', 1240.61, 600000),
('Duarte', 'San Francisco de Macorís', 'Cibao Nordeste', 1649.84, 300000),
('La Vega', 'La Vega', 'Cibao Sur', 2287.24, 400000),
('Espaillat', 'Moca', 'Cibao Norte', 839.48, 250000)
ON CONFLICT (provincia) DO NOTHING;

-- MUNICIPIOS (ejemplo)
INSERT INTO public.municipios (nombre_municipio, provincia, fecha_creado, poblacion, area_km2) VALUES
('Santo Domingo', 'Distrito Nacional', CURRENT_DATE, 1029110, 91.58),
('Santiago', 'Santiago', CURRENT_DATE, 1200000, 2836.51),
('Higüey', 'La Altagracia', CURRENT_DATE, 350000, 3010.34)
ON CONFLICT (nombre_municipio) DO NOTHING;

-- ÁREAS DE TRABAJO
INSERT INTO public.areas_trabajo (area_trab, descripcion) VALUES
('Monitoreo', 'Área de monitoreo y vigilancia'),
('Promociones', 'Área de promociones y divulgación'),
('Administración', 'Área administrativa'),
('Tecnología', 'Área de tecnología e informática'),
('Recursos Humanos', 'Área de recursos humanos'),
('Finanzas', 'Área financiera y presupuestaria')
ON CONFLICT (area_trab) DO NOTHING;

-- GRUPOS DE USUARIOS
INSERT INTO public.usr_grupos (grupo, detalles) VALUES
('general', 'Usuarios con acceso a cualquier área de la plataforma'),
('monitoreo', 'Usuarios del departamento de monitoreo'),
('promociones', 'Usuarios del departamento de promociones'),
('seguridad', 'Usuarios que administran la seguridad del sistema'),
('desarrollo', 'Usuarios exclusivos para desarrollo de aplicaciones')
ON CONFLICT (grupo) DO NOTHING;

-- SUCURSALES
INSERT INTO public.sucursales (
  tipo_suc, nombre_sucursal, descripcion, provincia, direccion, estado
) VALUES
('Sede Central', 'DIDA - Sede Central', 'Oficina principal de la DIDA', 'Distrito Nacional', 'Av. Winston Churchill, Santo Domingo', 'activa'),
('Regional', 'DIDA - Santiago', 'Oficina regional de Santiago', 'Santiago', 'Calle del Sol, Santiago', 'activa'),
('Regional', 'DIDA - Puerto Plata', 'Oficina regional de Puerto Plata', 'Puerto Plata', 'Malecón de Puerto Plata', 'activa'),
('Provincial', 'DIDA - La Romana', 'Oficina provincial de La Romana', 'La Romana', 'Centro de La Romana', 'activa'),
('Provincial', 'DIDA - San Cristóbal', 'Oficina provincial de San Cristóbal', 'San Cristóbal', 'Centro de San Cristóbal', 'activa')
ON CONFLICT (nombre_sucursal) DO NOTHING;
