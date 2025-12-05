
INSERT INTO public.calif_mucho_poco (calificacion, puntos) VALUES ('Seguro', 100);
INSERT INTO public.calif_mucho_poco (calificacion, puntos) VALUES ('No', 0);
INSERT INTO public.calif_si_no (calificacion, puntos) VALUES ('Tal vez', 1);

BEGIN;

-- CALIFICACIONES
INSERT INTO public.calif_bueno_malo (calificacion, puntos) VALUES
('Malo', 1),
('Regular', 20),
('Bueno', 50),
('Aceptable', 80),
('Excelente', 100);

INSERT INTO public.calif_si_no (calificacion, puntos) VALUES
('Si', 2),
('No', 0),
('Quizas', 1);

INSERT INTO public.calif_satisf (satisfaccion, puntos) VALUES
('Malo', 0),
('Regular', 0),
('Bueno', 0),
('Muy Bueno', 0),
('Excelente', 0);

INSERT INTO public.calif_mucho_poco (calificacion, puntos) VALUES
('Poco', 10),
('Suficiente', 20),
('Aceptable', 50),
('Mucho', 80),
('Demasiado', 100),
('Inseguro', 0);

INSERT INTO public.calif_nivel (nivel, descripcion) VALUES
(1, 'Nivel Uno'),
(2, 'Nivel Dos'),
(3, 'Nivel Tres'),
(4, 'Nivel Cuatro'),
(5, 'Nivel Cinco');

INSERT INTO public.calif_tiempo (duracion, puntos) VALUES
('Breve', 80),
('Corto', 60),
('Largo', 20),
('Extenso', 5);

INSERT INTO public.calif_alto_bajo (calificacion, puntos) VALUES
('Bajo', 10),
('Normal', 50),
('Alto', 70),
('Exagerado', 100);

INSERT INTO public.calif_claridad (calificacion, puntos) VALUES
('Confusa', 5),
('Limitada', 10),
('Clara', 30),
('Detallada', 50),
('Amplia', 100);

-- ENCUESTA Y INSTITUCIONES
INSERT INTO public.encue_tipos (tipo_encuesta, detalles) VALUES
('ARS', 'Administradora de Riesgos de Salud'),
('AFP', 'Administradora de Fondos de Pensiones'),
('PSS', 'Prestadora de Servicios de Salud'),
('ARL', 'Administradora de Riesgos Laborales'),
('TODO', 'Todos los tipos de prestadoras');

INSERT INTO public.instituc_tipos (tipo_institucion, detalles) VALUES
('Hospital', 'Hospital'),
('Clinica privada', 'Clinica privada'),
('Hospital Semi Privado', 'Hospital Semi Privado'),
('Laboratorio', 'Laboratorio'),
('Consultorio', 'Consultorio'),
('PSS', 'Prestadora de Servicios de Salud');

INSERT INTO public.clasif_centro (clasificacion, detalles) VALUES
('Hospital', 'Hospital'),
('Clinica privada', 'Clinica privada'),
('Primer nivel', NULL),
('Segundo Nivel', NULL),
('Alto Nivel', NULL);

INSERT INTO public.instituciones (id_inst, nombre_institucion, tipo_institucion, clasificacion, pueblo_o_ciudad, barrio_o_sector, calle_y_numero, provincia, geo_referencia, telefono, correo, persona_de_contacto) VALUES
('09cf4aea', 'HOSPITAL DE LA SANTA CRUZ', 'PSS', 'Hospital', NULL, NULL, 'C/ Orlando MArtinez #25, Piedra Blanca, Monseñor Nouel', NULL, NULL, '8095640000', 'santacruz@correo.com', 'JUANA MENDEZ'),
('acfe5ebc', 'CLINICA DOCTOR PUERRO', 'PSS', 'Clinica privada', NULL, NULL, 'AV. TIRADENTES, SANTO DOMINGO, REPÚBLICA DOMINICANA', NULL, '18.476100, -69.926795', '8092293333', 'clinicapuerro@puerro.com', 'JAVIER SOLIS GUERRERO'),
('9425f0d5', 'HOSPITAL LA LOMA DEL CHIVO', 'PSS', 'Hospital', NULL, NULL, 'AV LAS CARRERAS, 51000 SANTIAGO DE LOS CABALLEROS, REPÚBLICA DOMINICANA', NULL, '18.476196, -69.926781', '8095595555', 'correo@gmail.com', 'PEDRO PEREZ MARIA');

-- ENCUESTADORES
INSERT INTO public.encuestadores (id_encu, nombre_completo, cedula, telefono, correo, posicion, id_suc) VALUES
('9f016f3a', 'EL PRIMER ENCUESTADOR', '10000000111', '8099999999', 'encuestador@correo.com', 'Supervisor', 1),
('9f016f3b', 'ISRAEL BAEZ', '10000000222', '8098888888', 'baez.israel@gmail.com', 'Supervisor', 1);

-- ENCUESTA USS
INSERT INTO public.encuesta_uss (id_encue, fecha, sucursal_dida, id_inst, descripcion, tipo_institucion, pueblo_o_ciudad, tipo_encuesta, tipo_de_afiliado, genero, edad, esta_empleado, tiene_ars, tiempo_de_espera, nivel_de_higiene, nivel_de_comodidad, trato_del_personal, claridad_de_informaciones, claridad_del_diagnostico, claridad_del_tratamiento, cobro_irregular, satisfaccion_de_precios, satisfaccion_del_servicio, recomienda_el_centro, experiencia_con_el_centro, experiencia_con_ars, experiencia_con_afp, observaciones_encuestador, encuestado_por, puntuacion, stat_encue, usuario, fec_reg, edit_count) VALUES
('deaa2131', '2024-12-16', 1, 'acfe5ebc', 'ENCUESTA DE ARS EN CLINICA DOCTOR PUERRO', 'Clinica privada', NULL, 'ARS', 'Regular', 'Masculino', 48, 'Si', 'Inseguro', 'Corto', 'Bueno', 'Regular', 'Bueno', 'Limitada', 'Clara', 'Confusa', NULL, 'Normal', NULL, 'Si', NULL, 'NINGUNA', NULL, 'TODO BIEN', '9f016f3b', 277, 'Iniciada', 'dida.desarrollo@gmail.com', '2024-12-16 17:19:14', NULL),
('72ca8eba', '2024-12-16', 1, '09cf4aea', 'ENCUESTA DE ARS EN HOSPITAL DE LA SANTA CRUZ', 'Hospital', NULL, 'ARS', 'Regular', 'Femenino', 26, 'No', 'No', 'Largo', 'Regular', 'Malo', 'Regular', 'Confusa', 'Limitada', 'Limitada', NULL, 'Alto', 'Regular', 'No', NULL, NULL, NULL, NULL, '9f016f3b', 156, 'Iniciada', 'baez.israel@gmail.com', '2024-12-16 18:02:29', NULL),
('d8fbf335', '2025-01-13', 3, '9425f0d5', 'ENCUESTA DE EUTONA HOSPITAL RR', 'PSS', NULL, 'PSS', 'Regular', 'Femenino', 38, 'Si', 'Inseguro', 'Corto', 'Bueno', 'Bueno', 'Regular', 'Clara', 'Clara', 'Detallada', 'Si', 'Normal', 'Bueno', 'Si', 'BDHDHDHEH SUEUDJE HEHEH', NULL, NULL, 'ELSHDHDHD DHDHDHDHD SJDHDHDHD DHDHDH DHEHDHDH', '9f016f3b', 342, 'Cerrada', 'baez.israel@gmail.com', '2025-01-13 18:20:39', NULL);

COMMIT;
