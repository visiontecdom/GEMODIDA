-- Datos (DML) Generados por Sheet2Postgres

BEGIN;

-- Inserting data into calif_bueno_malo
INSERT INTO calif_bueno_malo (calificacion, puntos) VALUES
('Malo', 1),
('Regular', 20),
('Bueno', 50),
('Aceptable', 80),
('Excelente', 100);

-- Inserting data into calif_si_no
INSERT INTO calif_si_no (calificacion, puntos) VALUES
('Si', 2),
('No', 0),
('Quizas', 1);

-- Inserting data into calif_satisf
INSERT INTO calif_satisf (satisfaccion, puntos) VALUES
('Malo', NULL),
('Regular', NULL),
('Bueno', NULL),
('Muy Bueno', NULL),
('Excelente', NULL);

-- Inserting data into calif_mucho_poco
INSERT INTO calif_mucho_poco (calificacion, puntos) VALUES
('Poco', 10),
('Suficiente', 20),
('Aceptable', 50),
('Mucho', 80),
('Demasiado', 100);

-- Inserting data into calif_nivel
INSERT INTO calif_nivel (nivel, descripcion) VALUES
(1, 'Nivel Uno'),
(2, 'Nivel Dos'),
(3, 'Nivel Tres'),
(4, 'Nivel Cuatro'),
(5, 'Nivel Cinco');

-- Inserting data into calif_tiempo
INSERT INTO calif_tiempo (duracion, puntos) VALUES
('Breve', 80),
('Corto', 60),
('Largo', 20),
('Extenso', 5);

-- Inserting data into calif_alto_bajo
INSERT INTO calif_alto_bajo (calificacion, puntos) VALUES
('Bajo', 10),
('Normal', 50),
('Alto', 70),
('Exagerado', 100);

-- Inserting data into calif_claridad
INSERT INTO calif_claridad (calificacion, puntos) VALUES
('Confusa', 5),
('Limitada', 10),
('Clara', 30),
('Detallada', 50),
('Amplia', 100);

-- Inserting data into encue_tipos
INSERT INTO encue_tipos (tipo_encuesta, detalles) VALUES
('ARS', 'Administradora de Riesgos de Salud'),
('AFP', 'Administradora de Fondos de Pensiones'),
('PSS', 'Prestadora de Servicios de Salud'),
('ARL', 'Administradora de Riesgos Laborales'),
('TODO', 'Todos los tipos de prestadoras');

-- Inserting data into instituc_tipos
INSERT INTO instituc_tipos (tipo_institucion, detalles) VALUES
('Hospital', 'Hospital'),
('Clinica privada', 'Clinica privada'),
('Hospital Semi Privado', 'Hospital Semi Privado'),
('Laboratorio', 'Laboratorio'),
('Consultorio', 'Consultorio');

-- Inserting data into clasif_centro
INSERT INTO clasif_centro (clasificacion, detalles) VALUES
('Primer nivel', NULL),
('Segundo Nivel', NULL),
('Alto Nivel', NULL);

-- Inserting data into instituciones
INSERT INTO instituciones (id_inst, nombre_institucion, tipo_institucion, clasificacion, pueblo_o_ciudad, barrio_o_sector, calle_y_numero, provincia, geo_referencia, telefono, correo, persona_de_contacto) VALUES
('09cf4aea', 'HOSPITAL DE LA SANTA CRUZ', 'PSS', 'Hospital', NULL, NULL, 'C/ Orlando MArtinez #25, Piedra Blanca, Monseñor Nouel', NULL, NULL, '8095640000', 'santacruz@correo.com', 'JUANA MENDEZ'),
('acfe5ebc', 'CLINICA DOCTOR PUERRO', 'PSS', 'Clinica privada', NULL, NULL, 'AV. TIRADENTES, SANTO DOMINGO, REPÚBLICA DOMINICANA', NULL, '18.476100, -69.926795', '8092293333', 'clinicapuerro@puerro.com', 'JAVIER SOLIS GUERRERO'),
('9425f0d5', 'HOSPITAL LA LOMA DEL CHIVO', 'PSS', 'Hospital', NULL, NULL, 'AV LAS CARRERAS, 51000 SANTIAGO DE LOS CABALLEROS, REPÚBLICA DOMINICANA', NULL, '18.476196, -69.926781', '8095595555', 'correo@gmail.com', 'PEDRO PEREZ MARIA');

-- Inserting data into encuestadores
INSERT INTO encuestadores (id_encu, nombre_completo, cedula, telefono, correo, posicion, id_suc) VALUES
('9f016f3a', 'EL PRIMER ENCUESTADOR', '10000000111', '8099999999', 'encuestador@correo.com', 'Supervisor', 1);

-- Inserting data into encuesta_uss
INSERT INTO encuesta_uss (id_encue, fecha, sucursal_dida, id_inst, descripcion, tipo_institucion, pueblo_o_ciudad, tipo_encuesta, tipo_de_afiliado, genero, edad, esta_empleado, tiene_ars, tiempo_de_espera, nivel_de_higiene, nivel_de_comodidad, trato_del_personal, claridad_de_informaciones, claridad_del_diagnostico, claridad_del_tratamiento, cobro_irregular, satisfaccion_de_precios, satisfaccion_del_servicio, recomienda_el_centro, experiencia_con_el_centro, experiencia_con_ars, experiencia_con_afp, observaciones_encuestador, encuestado_por, puntuacion, stat_encue, usuario, fec_reg, edit_count) VALUES
('deaa2131', '2024-12-16', 1, 'acfe5ebc', 'ENCUESTA DE ARS EN CLINICA DOCTOR PUERRO', 'Clinica privada', NULL, 'ARS', 'Regular', 'Masculino', 48, 'Si', 'Inseguro', 'Corto', 'Bueno', 'Regular', 'Bueno', 'Limitada', 'Clara', 'Confusa', NULL, 'Normal', NULL, 'Si', NULL, 'NINGUNA', NULL, 'TODO BIEN', 'baez.israel@gmail.com', 277, 'Iniciada', 'dida.desarrollo@gmail.com', '2024-12-16 17:19:14', NULL),
('72ca8eba', '2024-12-16', 1, '09cf4aea', 'ENCUESTA DE ARS EN HOSPITAL DE LA SANTA CRUZ', 'Hospital', NULL, 'ARS', 'Regular', 'Femenino', 26, 'No', 'No', 'Largo', 'Regular', 'Malo', 'Regular', 'Confusa', 'Limitada', 'Limitada', NULL, 'Alto', 'Regular', 'No', NULL, NULL, NULL, NULL, 'baez.israel@gmail.com', 156, 'Iniciada', 'baez.israel@gmail.com', '2024-12-16 18:02:29', NULL),
('d8fbf335', '2025-01-13', 3, '9425f0d5', 'ENCUESTA DE EUTONA HOSPITAL RR', 'PSS', NULL, 'PSS', 'Regular', 'Femenino', 38, 'Si', 'Inseguro', 'Corto', 'Bueno', 'Bueno', 'Regular', 'Clara', 'Clara', 'Detallada', 'Si', 'Normal', 'Bueno', 'Si', 'BDHDHDHEH SUEUDJE HEHEH', NULL, NULL, 'ELSHDHDHD DHDHDHDHD SJDHDHDHD DHDHDH DHEHDHDH', 'baez.israel@gmail.com', 342, 'Cerrada', 'baez.israel@gmail.com', '2025-01-13 18:20:39', NULL);

-- No data found for encuesta_pss. Skipping inserts for this table.

-- No data found for encue_puntos beyond headers and empty rows. Skipping inserts for this table.

COMMIT;