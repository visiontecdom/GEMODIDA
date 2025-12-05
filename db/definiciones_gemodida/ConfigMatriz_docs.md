# Documentación del Esquema

## Resumen de Tablas

| Tabla             | Descripción Funcional                                     | Clave Primaria       | Claves Foráneas                                      |
| :---------------- | :-------------------------------------------------------- | :------------------- | :--------------------------------------------------- |
| `regiones`        | Almacena la información de las diferentes regiones geográficas. | `region`             |                                                      |
| `provincias`      | Contiene datos detallados de las provincias, incluyendo información geográfica y demográfica. | `provincia`          | `region` (a `regiones`)                            |
| `provincias_alt`  | Versión alternativa o simplificada de la tabla de provincias. | `provincia`          | `region` (a `regiones`)                            |
| `municipios`      | Almacena los municipios, su provincia asociada, fechas de creación y datos demográficos. | `nombre_municipio`   | `provincia` (a `provincias`)                     |
| `areas_trabajo`   | Define las diferentes áreas o departamentos de trabajo dentro del sistema. | `area_trab`          |                                                      |
| `usr_grupos`      | Categoriza los grupos de usuarios con sus descripciones.    | `grupo`              |                                                      |
| `licencias_sistema`| Gestiona la información de las licencias de sistema, incluyendo detalles del negocio, contactos y fechas. | `id_lic`             |                                                      |
| `menu_matz`       | Contiene ítems del menú principal ("Menu_Matz").         | `id_reg`             |                                                      |
| `menu_admin`      | Almacena ítems para el menú de administración.            | `id_reg`             |                                                      |
| `menu_monit`      | Define ítems para el menú de monitoreo, con asignaciones a áreas y grupos de trabajo. | `id_reg`             | `area_trab` (a `areas_trabajo`), `grupo` (a `usr_grupos`) |
| `menu_prom`       | Contiene ítems para el menú de promociones, con asignaciones a áreas y grupos de trabajo. | `id_reg`             | `area_trab` (a `areas_trabajo`), `grupo` (a `usr_grupos`) |
| `sucursales`      | Información de las sucursales, incluyendo ubicación, contacto y persona responsable. | `id_suc`             | `provincia` (a `provincias`), `municipio` (a `municipios`) |
| `usuarios`        | Registra los usuarios del sistema, sus credenciales, roles y asignaciones a sucursales, áreas y grupos. | `correo`             | `cod_lic` (a `licencias_sistema`), `id_suc` (a `sucursales`), `area` (a `areas_trabajo`), `grupo` (a `usr_grupos`) |
| `sistema_usuarios`| Almacena contactos de usuarios del sistema o corporativos. | `correo`             |                                                      |