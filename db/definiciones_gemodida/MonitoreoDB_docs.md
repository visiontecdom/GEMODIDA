# Documentación del Esquema

Este documento describe la estructura de la base de datos generada a partir de los datos de las hojas de cálculo.

## Resumen de Tablas

| Nombre de Tabla          | Descripción Funcional                                                                                                      |
| :----------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| `calif_mucho_poco`       | Catálogo para calificar aspectos con gradientes como "Mucho", "Poco", "Suficiente", "Demasiado".                          |
| `calif_si_no`            | Catálogo para respuestas binarias "Sí" o "No", incluyendo "Quizás".                                                      |
| `calif_bueno_malo`       | Catálogo para calificar aspectos con gradientes de calidad como "Bueno", "Regular", "Malo", "Aceptable", "Excelente".      |
| `calif_satisf`           | Catálogo para niveles de satisfacción como "Malo", "Regular", "Bueno", "Muy Bueno", "Excelente".                         |
| `calif_nivel`            | Catálogo para definir niveles numéricos con su descripción.                                                              |
| `calif_tiempo`           | Catálogo para describir duraciones de tiempo como "Breve", "Corto", "Largo", "Extenso".                                  |
| `calif_alto_bajo`        | Catálogo para calificar aspectos con gradientes de magnitud como "Bajo", "Normal", "Alto", "Exagerado".                  |
| `calif_claridad`         | Catálogo para calificar la claridad de información o diagnóstico como "Confusa", "Limitada", "Clara", "Detallada", "Amplia".|
| `encue_tipos`            | Catálogo que lista los diferentes tipos de encuestas (ARS, AFP, PSS, ARL, TODO).                                           |
| `instituc_tipos`         | Catálogo que define los tipos de instituciones de salud (Hospital, Clínica privada, etc.).                                |
| `clasif_centro`          | Catálogo para la clasificación de centros de salud (Primer nivel, Segundo Nivel, Alto Nivel).                            |
| `instituciones`          | Almacena información detallada sobre las instituciones evaluadas, incluyendo su tipo y clasificación.                      |
| `encuestadores`          | Contiene los datos de los encuestadores que realizan las evaluaciones.                                                     |
| `encuesta_uss`           | Registra los resultados de las encuestas realizadas bajo el esquema "USS", que incluye datos demográficos del encuestado y valoraciones de servicios. |
| `encuesta_pss`           | Registra los resultados de las encuestas realizadas bajo el esquema "PSS", centrándose en la institución evaluada y la calidad del servicio. |
| `encue_puntos`           | Tabla para almacenar puntuaciones asociadas a encuestas. Se asume que `id_encue` hace referencia a un ID de encuesta general. |