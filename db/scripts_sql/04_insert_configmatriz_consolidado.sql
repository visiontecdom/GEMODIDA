-- Script consolidado de datos iniciales para GEMODIDA
-- Adaptado a la estructura actual de las tablas
-- Cumple con las políticas de desarrollo del proyecto

BEGIN;

INSERT INTO public.regiones (region, descripcion) VALUES
('Sureste', 'Region Sureste'),
('Nordeste', 'RegionNordeste'),
('Suroeste', 'Suroeste'),
('Valdesia', 'Valdesia'),
('Cibao Noroeste', 'Cibao Noroeste'),
('Cibao Nordeste', 'Cibao Nordeste'),
('Cibao Norte', 'Cibao Norte'),
('Cibao Sur', 'Cibao Sur'),
('El Valle', 'El Valle'),
('Yuma', 'Yuma'),
('Higuamo', 'Higuamo'),
('Enriquillo', 'Enriquillo'),
('Ozama', 'Ozama')
ON CONFLICT (region) DO NOTHING;

-- PROVINCIAS
INSERT INTO public.provincias (provincia, capital, region, superficie_km2, poblacion_2021)
VALUES
('Azua', 'Azua de Compostela', 'Valdesia', 2531.77, 222610),
('Bahoruco', 'Neiba', 'Enriquillo', 1282.23, 101306),
('Barahona', 'Barahona', 'Enriquillo', 1739.38, 189100),
('Dajabón', 'Dajabón', 'Cibao Noroeste', 1020.73, 66675),
('Duarte', 'San Francisco de Macorís', 'Cibao Nordeste', 1605.35, 299583),
('El Seibo', 'El Seibo', 'Yuma', 1786.8, 94049),
('Elías Piña', 'Comendador', 'El Valle', 1426.2, 63303),
('Espaillat', 'Moca', 'Cibao Norte', 838.62, 240428),
('Hato Mayor', 'Hato Mayor', 'Higuamo', 1329.29, 85747),
('Hermanas Mirabal', 'Salcedo', 'Cibao Nordeste', 440.43, 92045),
('Independencia', 'Jimaní', 'Enriquillo', 2006.44, 58951),
('La Altagracia', 'Salvaleón de Higüey', 'Yuma', 3010.34, 360874),
('La Romana', 'La Romana', 'Yuma', 653.95, 274894),
('La Vega', 'La Vega', 'Cibao Sur', 2287.24, 412469),
('María Trinidad Sánchez', 'Nagua', 'Cibao Nordeste', 1271.71, 140954),
('Monseñor Nouel', 'Bonao', 'Cibao Sur', 992.39, 174959),
('Monte Cristi', 'Monte Cristi', 'Cibao Noroeste', 1924.35, 117736),
('Monte Plata', 'Monte Plata', 'Higuamo', 2632.14, 191447),
('Pedernales', 'Pedernales', 'Enriquillo', 2074.53, 35280),
('Peravia', 'Baní', 'Valdesia', 792.33, 198499),
('Puerto Plata', 'Puerto Plata', 'Cibao Norte', 1852.9, 333940),
('Samaná', 'Santa Bárbara de Samaná', 'Cibao Nordeste', 853.74, 113036),
('San Cristóbal', 'San Cristóbal', 'Valdesia', 1265.77, 643595),
('San José de Ocoa', 'San José de Ocoa', 'Valdesia', 855.4, 53833),
('San Juan', 'San Juan de la Maguana', 'El Valle', 3569.39, 220264),
('San Pedro de Macorís', 'San Pedro de Macorís', 'Higuamo', 1255.46, 306002),
('Sánchez Ramírez', 'Cotuí', 'Cibao Sur', 1196.13, 151888),
('Santiago', 'Santiago', 'Cibao Norte', 2836.51, 1052088),
('Santiago Rodríguez', 'San Ignacio de Sabaneta', 'Cibao Noroeste', 1111.14, 57209),
('Santo Domingo', 'Santo Domingo Este', 'Ozama', 1301.84, 2955339),
('Valverde', 'Mao', 'Cibao Noroeste', 823.38, 177865),
('Distrito Nacional', 'Santo Domingo', 'Ozama', 104.44, 1049567)
ON CONFLICT (provincia) DO NOTHING;

INSERT INTO public.areas_trabajo (area_trab, descripcion) VALUES
('Todas', 'Todas las Areas'),
('Monitoreo', 'Área de Monitoreo'),
('Promociones', 'Área de Promociones'),
('Orientacion', 'Área de Orientación'),
('Defensoria', 'Área de Defensoría');

INSERT INTO public.usr_grupos (grupo, detalles) VALUES
('Supervisores', 'Supervisores'),
('Encuestadores', 'Encuestadores'),
('Digitadores', 'Digitadores'),
('Lectura', 'Lectura'),
('General', NULL),
('Administrador', NULL);

INSERT INTO public.sucursales (
  tipo_suc, nombre_sucursal, descripcion, provincia, municipio, direccion, geo_referencia, telefono_sucursal, correo_sucursal, persona_responsable, telefono_responsable, correo_responsable, horario, estado
) VALUES
('Oficina', 'SEDE PRINCIPAL SD', 'SEDE CENTRAL SANTO DOMINGO', 'Santo Domingo', 'Santo Domingo', 'AV. TIRADENTES #33, SANTO DOMINGO', '19.479196, -70.693057', '8092993185', 'dida.desarrollo@gmail.com', 'ISRAEL BAEZ', '8092993185', NULL, NULL, 'Activo'),
('Punto Expreso', 'PUNTO GOB SAMBIL', 'SUCURSAL SAMBIL', 'Santo Domingo', 'Santo Domingo', 'AV. JOHN F. KENNEDY, SANTO DOMINGO, REPÚBLICA DOMINICANA', '19.479196, -70.693057', '8095609121', 'didasambil@gmail.com', 'EL RESPONSABLE SAMBIL', NULL, NULL, NULL, 'Activo'),
('Oficina', 'SUCURSAL SAN PEDRO DE MACORIS', 'SAN PEDRO', 'San Pedro de Macorís', 'San Pedro de Macorís', 'SAN PEDRO GARZA GARCÍA, N.L., MÉXICO', '18.840982, -70.321896', '8092222222', 'coreeo@hhj.com', 'JUAN PEREZ', '8299999999', NULL, NULL, 'Activo');

COMMIT;
