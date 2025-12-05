-- Insertar sucursales iniciales (sin id_suc, que es autoincremental)
INSERT INTO public.sucursales (
  tipo_suc, nombre_sucursal, descripcion, provincia, direccion, estado
) VALUES
('Sede Central', 'DIDA - Sede Central', 'Oficina principal de la DIDA', 'Distrito Nacional', 'Av. Winston Churchill, Santo Domingo', 'activa'),
('Regional', 'DIDA - Santiago', 'Oficina regional de Santiago', 'Santiago', 'Calle del Sol, Santiago', 'activa'),
('Regional', 'DIDA - Puerto Plata', 'Oficina regional de Puerto Plata', 'Puerto Plata', 'Malecón de Puerto Plata', 'activa'),
('Provincial', 'DIDA - La Romana', 'Oficina provincial de La Romana', 'La Romana', 'Centro de La Romana', 'activa'),
('Provincial', 'DIDA - San Cristóbal', 'Oficina provincial de San Cristóbal', 'San Cristóbal', 'Centro de San Cristóbal', 'activa');
