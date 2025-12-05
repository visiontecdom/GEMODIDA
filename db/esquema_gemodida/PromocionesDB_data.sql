-- Datos (DML) Generados por Sheet2Postgres

BEGIN;

--
-- Datos para la tabla actividad_renglon
--
INSERT INTO actividad_renglon (renglon, descripcion) VALUES
('Promociones', 'Promociones'),
('Capacitaciones', 'Capacitaciones'),
('Materiales', 'Materiales'),
('Seguimiento', 'Seguimiento'),
('Otros', 'Otros');

--
-- Datos para la tabla actividad_estados
--
INSERT INTO actividad_estados (estado_actividad, descripcion) VALUES
('Pendiente', 'Pendiente'),
('Procesando', 'Procesando'),
('Realizada', 'Realizada'),
('Cancelada', 'Cancelada');

--
-- Datos para la tabla actividad_tipos
--
INSERT INTO actividad_tipos (tipo_actividad, descripcion, renglon, estado) VALUES
('Evento', 'Evento', NULL, 'Activo'),
('Distribución', 'Distribución', 'Materiales', 'Activo'),
('Promoción', 'Promoción', 'Promociones', 'Activo'),
('Feria', 'Feria', 'Promociones', 'Activo'),
('Reunión', 'Reunión', 'Seguimiento', 'Activo'),
('Operativo', 'Operativo', 'Promociones', 'Activo'),
('Acuerdo', 'Acuerdo', 'Seguimiento', 'Activo'),
('Aniversario', 'Aniversario', 'Promociones', 'Activo'),
('Charla', 'Charla', 'Capacitaciones', 'Activo'),
('Taller', 'Taller', 'Capacitaciones', 'Activo'),
('Orientación', 'Orientación', 'Capacitaciones', 'Activo');

--
-- Datos para la tabla actividad_matriz
--
INSERT INTO actividad_matriz (
    id_actividad, fecha, renglon, tipo_actividad, id_sucursal, lugar_impactado, descripcion,
    nombre_sucursal, region, provincia, municipio, tipo_entidad, modalidad, tema_material,
    responsable_interno, telefono_responsable_interno, responsable_externo, telefono_responsable_externo,
    estado_actividad, tipo_seguimiento, progreso, cantidad_masculino, cantidad_femenino,
    cantidad_adultos_mayores, total_personas, observaciones, usuario, fecha_registro,
    edit_count, print_count, app_user_mail
) VALUES
('26d5d082', '2025-05-02', 'Capacitaciones', 'Orientación', 2, 'PARQUE DEL ESTE', 'ORIENTACIÓN REALIZADA EN PARQUE DEL ESTE',
 'SUCURSAL SAMBIL', 'Ozama', 'Santo Domingo', 'Distrito Nacional', 'Indefinida', 'Presencial', 'VOLANTES',
 'JUAN', NULL, 'JULIAN RODRIGUEZ', '8092222222', 'Realizada', NULL, NULL, 30, 44,
 8, 74, NULL, 'baez.israel@gmail.com', '2025-05-02 21:38:41',
 NULL, NULL, NULL),
('22b45c62', '2025-05-08', 'Promociones', 'Operativo', 1, 'HOSPITAL DE LA CRUZ', 'OPERATIVO REALIZADA EN HOSPITAL DE LA CRUZ',
 'SEDE CENTRAL SANTO DOMINGO', 'Ozama', 'Santo Domingo', 'Distrito Nacional', 'Pública', 'Presencial', 'Brochure',
 'JUAN PÉREZ PÉREZ', NULL, NULL, NULL, 'Realizada', NULL, NULL, 12, 16,
 4, 28, 'BFBFBFB DHDHDH JDJDH', 'baez.israel@gmail.com', '2025-05-08 14:29:12',
 NULL, NULL, 'baez.israel@gmail.com'),
('8ce4657a', '2025-05-08', 'Materiales', 'Distribución', 3, 'CENTRO EDUCATIVO TABOR', 'DISTRIBUCION REALIZADA EN CENTRO EDUCATIVO TABOR',
 'SAN PEDRO', NULL, 'San Pedro de Macoris', 'San Pedro', 'Privada', 'Presencial', 'SFS',
 'ROCIO', NULL, NULL, NULL, 'Realizada', NULL, NULL, 10, 15,
 5, 25, 'VER CARTA DE DERECHOS RC', 'rociojimenezvolquez@gmail.com', '2025-05-08 14:35:09',
 NULL, NULL, 'rociojimenezvolquez@gmail.com'),
('b49d60cf', '2025-05-08', 'Materiales', 'Distribución', 3, 'CIESS', 'DISTRIBUCION REALIZADA EN CIESS',
 'SAN PEDRO', NULL, 'San Pedro de Macoris', 'San Pedro', 'Pública', 'Presencial', 'SVDS',
 'KATTY', NULL, NULL, NULL, 'Realizada', NULL, NULL, 5, 10,
 2, 15, 'VER DOCUMENTO ADJUNTO', 'rociojimenezvolquez@gmail.com', '2025-05-08 14:40:52',
 NULL, NULL, 'rociojimenezvolquez@gmail.com');

--
-- Datos para la tabla actividad_evidencia
--
INSERT INTO actividad_evidencia (
    id, id_actividad, titulo_evidencia, tipo_evidencia, foto, documento, sitio_web,
    ruta_evidencia, estado_evidencia, nota, usuario, fecha_registro
) VALUES
('121fc8b8', '8ce4657a', 'Un documento PDF', 'Documento', NULL, 'Prom_Evid_Files_/121fc8b8.Documento.183922.pdf', NULL,
 'Prom_Evid_Files_%2F121fc8b8.Documento.183922.pdf', 'Activo', NULL, 'rociojimenezvolquez@gmail.com', '2025-05-08 14:38:47'),
('ba889022', 'b49d60cf', 'Una imagen de un documento', 'Foto', 'Prom_Evid_Images/ba889022.Foto.184253.jpg', NULL, NULL,
 'Prom_Evid_Images%2Fba889022.Foto.184253.jpg', 'Activo', NULL, 'rociojimenezvolquez@gmail.com', '2025-05-08 14:42:34');

--
-- Datos para la tabla capacitacion_tipos
--
INSERT INTO capacitacion_tipos (actividad, descripcion, estado) VALUES
('Operativo', 'Operativo', 'Activo'),
('Evento', 'Evento', 'Activo'),
('Reunion', 'Reunion', 'Activo'),
('Encuentro', 'Encuentro', 'Activo'),
('Orientacion', 'Orientacion', 'Activo'),
('Programacion', 'Programacion', 'Activo');

--
-- Datos para la tabla capacitacion_matriz
--
INSERT INTO capacitacion_matriz (
    id_capacitacion, fecha, id_sucursal, region, provincia, municipio, direccion, tipo_seguimiento,
    descripcion, institucion, estado, progreso, responsable_interno, telefono_responsable_interno,
    responsable_externo, telefono_responsable_externo, observaciones, usuario, fecha_registro,
    edit_count, print_count, app_user_mail
) VALUES
('8d3369d9', '2025-05-08', 1, 'Ozama', 'Santo Domingo', 'Distrito Nacional', 'Naco', 'Desarrollo de la Escuela',
 'Se realizó un Plan de Contenido', 'INFOTEP', 'Realizado', 0.00, 'Marco', '829546218',
 'Juan', '8095642156', 'Quedamos en espera de confirmación', 'rociojimenezvolquez@gmail.com', '2025-05-08 14:44:58',
 NULL, NULL, 'rociojimenezvolquez@gmail.com');

--
-- Datos para la tabla capacitacion_evidencia
--
INSERT INTO capacitacion_evidencia (
    id, id_capacitacion, titulo_evidencia, tipo_evidencia, foto, documento, sitio_web,
    estado_evidencia, nota, usuario, fecha_registro
) VALUES
('4843a03e', '8d3369d9', NULL, 'Documento', NULL, 'Capac_Evid_Images/4843a03e.Documento.185142.jpg', NULL,
 'Activo', NULL, 'rociojimenezvolquez@gmail.com', '2025-05-08 14:48:59');

--
-- Datos para la tabla material_tipos
--
INSERT INTO material_tipos (tipo_material, descripcion, detalles) VALUES
('Volantes', 'Volantes', NULL),
('Brochure', 'Brochure', NULL),
('Etiquetas', 'Etiquetas', NULL);

--
-- Datos para la tabla material_matriz
--
-- La hoja 'Material_Matz' no contiene datos, solo encabezados.
-- No se generarán sentencias INSERT para esta tabla.

--
-- Datos para la tabla material_evidencia
--
-- La hoja 'Material_Evid' no contiene datos, solo encabezados.
-- No se generarán sentencias INSERT para esta tabla.

--
-- Datos para la tabla enlaces_externos_promocion
--
INSERT INTO enlaces_externos_promocion (
    id, id_sucursal, titulo, enlace, descripcion, icono, usuario, fecha_registro, app_user_mail
) VALUES
('3ff775fa', 1, 'Informes Administrativos', 'https://lookerstudio.google.com/reporting/5394d86c-7472-4aa6-b5fa-42d26a1f5b0d',
 'Reportes de promociones para uso administrativo', 'Enlaces_Ext_Prom_Images/3ff775fa.Icono.214054.jpg', NULL, '2025-05-07 17:38:37', 'dida.desarrollo@gmail.com'),
('e2afde7d', 1, 'Informe General', 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRI56QRTWnVSD58XjqMGsnUMFttbpd8oeAvWXs1AZlsQ8TACzx5ztnYbnftwphdUOwbS9CFk2oc8cSk/pubhtml?gid=274293507&single=true',
 'Tabla de datos agrupados por renglón y trimestre', 'Enlaces_Ext_Prom_Images/e2afde7d.Icono.220915.png', NULL, '2025-05-07 18:07:13', 'dida.desarrollo@gmail.com');

--
-- Las hojas 'Informe_General', 'Producto_1_Prom_2T', 'Producto_2_Cap_2T', 'Producto_3_Material_Educativo'
-- contienen datos de reporte o plantillas y no se mapean directamente a las tablas DDL proporcionadas.
-- Por lo tanto, no se generan sentencias INSERT para estas hojas.

COMMIT;