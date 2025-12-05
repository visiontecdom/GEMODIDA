# Documentación del Esquema

Este documento detalla la estructura de la base de datos generada a partir de las hojas de cálculo proporcionadas. Se han aplicado principios de normalización, limpieza de nombres y estandarización de tipos de datos para PostgreSQL.

## Resumen de Tablas

| Nombre de Tabla                  | Descripción Funcional                                                                  | Clave Primaria       | Claves Foráneas                                                                                                     |
| :------------------------------- | :------------------------------------------------------------------------------------- | :------------------- | :------------------------------------------------------------------------------------------------------------------ |
| `actividad_renglon`              | Catálogo de los diferentes renglones o categorías de actividades.                      | `renglon`            | N/A                                                                                                                 |
| `actividad_estados`              | Catálogo de los posibles estados en los que puede encontrarse una actividad.           | `estado_actividad`   | N/A                                                                                                                 |
| `actividad_tipos`                | Catálogo de los tipos específicos de actividades, con referencia a un renglón.         | `tipo_actividad`     | `renglon` (referencia a `actividad_renglon`)                                                                        |
| `actividad_matriz`               | Tabla principal que registra los detalles de cada actividad realizada o planificada.   | `id_actividad`       | `renglon` (referencia a `actividad_renglon`), `tipo_actividad` (referencia a `actividad_tipos`), `estado_actividad` (referencia a `actividad_estados`) |
| `actividad_evidencia`            | Almacena la información de las evidencias (fotos, documentos, enlaces) de las actividades. | `id`                 | `id_actividad` (referencia a `actividad_matriz`)                                                                    |
| `capacitacion_tipos`             | Catálogo de los tipos de actividades dentro del módulo de capacitaciones.             | `actividad`          | N/A                                                                                                                 |
| `capacitacion_matriz`            | Tabla principal que registra los detalles de cada capacitación.                       | `id_capacitacion`    | N/A (id_sucursal es un ID, pero no hay tabla de sucursales explícita; tipo_seguimiento no coincide con capacitacion_tipos.actividad) |
| `capacitacion_evidencia`         | Almacena la información de las evidencias para las capacitaciones.                     | `id`                 | `id_capacitacion` (referencia a `capacitacion_matriz`)                                                              |
| `material_tipos`                 | Catálogo de los tipos de materiales (volantes, brochures, etc.).                      | `tipo_material`      | N/A                                                                                                                 |
| `material_matriz`                | Tabla principal que registra los detalles de cada material.                           | `id_material`        | `tipo_material` (referencia a `material_tipos`)                                                                     |
| `material_evidencia`             | Almacena la información de las evidencias para los materiales.                         | `id`                 | `id_material` (referencia a `material_matriz`)                                                                      |
| `enlaces_externos_promocion`     | Registra enlaces a recursos externos relacionados con la promoción.                   | `id`                 | N/A (id_sucursal es un ID, pero no hay tabla de sucursales explícita)                                              |

## Hojas de Cálculo No Convertidas a DDL

Las siguientes hojas de cálculo fueron identificadas como hojas de reporte o con estructuras de datos complejas que no se ajustan directamente a un esquema de base de datos transaccional. Su contenido parece ser una agregación o presentación de datos ya procesados, en lugar de datos fuente para una tabla.

*   `Informe_General`
*   `Producto_1_Prom_2T`
*   `Producto_2_Cap_2T`
*   `Producto_3_Material_Educativo`

Estas hojas contienen múltiples filas de encabezado, resúmenes, totales y una disposición que es más adecuada para visualización de informes que para la importación directa de datos en tablas normalizadas. Serían la base para generar vistas o reportes desde las tablas transaccionales existentes.