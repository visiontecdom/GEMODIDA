# Lógica de Negocio Unificada — GEMODIDA / DIDA

> Documento consolidado a partir del *Manual de Procedimientos Misionales (Ago 2024)* y del documento *GEMODIDA_Lógica_de_Negocio*. Esta versión integra reglas, políticas, procesos, paneles, definiciones funcionales y parámetros técnicos para la construcción de la aplicación web PWA GEMODIDA.

---

## 1. Introducción

El Sistema Dominicano de Seguridad Social (SDSS) agrupa instituciones como ARS, ARL, AFP y PSS. La DIDA, organismo especializado del CNSS, es responsable de:
- Defender los derechos de los afiliados.
- Informar y orientar sobre derechos y deberes.
- Acompañar a los afiliados en el ejercicio de los beneficios.
- Monitorear el cumplimiento normativo de las instituciones del SDSS.

GEMODIDA es la herramienta oficial para capturar, organizar, procesar y monitorear información relacionada a salud, seguridad social, encuestas, promociones, scraping, tendencias y alertas.

---

## 2. Resumen Ejecutivo del Sistema GEMODIDA

GEMODIDA es una **aplicación web progresiva (PWA)**, responsiva y de uso institucional. Entre sus capacidades principales:
- Registrar informaciones de los trabajos diarios.
- Diseñar y ejecutar encuestas y sondeos.
- Realizar scraping en redes sociales y portales noticiosos.
- Monitorear palabras clave y tendencias.
- Registrar actividades de campo, reuniones, charlas, promociones.
- Integración con Data Studio, Power BI y otros reporteros.
- Generación de informes ejecutivos, técnicos y estadísticos.
- Envío programado de reportes por email/WhatsApp.
- Notificaciones push de eventos programados.

---

## 3. Dinámica Operativa Institucional

La plataforma se utilizará en:
- Sede central.
- Sucursales regionales y provinciales.
- Sucursales satélite en zonas de la capital.

Cada usuario pertenece a:
- Una o más sucursales.
- Uno o más grupos de trabajo.
- Un rol específico que determina sus permisos.

El sistema ajusta accesos dinámicamente según sucursal, grupo y rol.

---

## 4. Paneles de Trabajo (Módulos Operativos)

Cada panel corresponde a un **grupo de trabajo y rol**, con funcionalidades definidas.

### 4.1 Panel: Gerencia de Monitoreo (monitoreo-gerencia)
Funciones principales:
- Crear usuarios y asignar permisos del área.
- Planificación de trabajos y asignación de tareas.
- Diseño de informes estadísticos.
- Gestión de sucursales (solo gerentes/admins).
- Definir temas para scraping.
- Registrar frases, palabras clave y criterios de investigación.
- Visualización de KPIs y gráficos de monitoreo.

Acceso: usuarios de grupos *Monitoreo* o *General* con rol: gerente, admin, super_user, desarrollador.

### 4.2 Panel: Operaciones de Monitoreo (monitoreo-operaciones)
Funciones:
- Registrar encuestas manuales.
- Actualizar planificación y avance de tareas.
- Ejecutar scraping.
- Generar informes ejecutivos periódicos.
- Visualización de gráficos y conteos recientes.

Acceso: operador, admin, super_user, desarrollador.

### 4.3 Panel: Encuestas de Monitoreo (monitoreo-encuestas)
Funciones:
- Diseñar plantillas de encuestas y sondeos.
- Realizar encuestas.
- Generar resultados, imprimir/exportar.
- Actualizar planificación.
- Generar informes.

Acceso: encuestador, gerente.

### 4.4 Panel: Gerencia de Promociones (promociones-gerencia)
Funciones:
- Crear sucursales y usuarios del área.
- Planificar actividades: charlas, reuniones, campañas.
- Elaborar presupuesto de promociones.
- Informes estadísticos.
- Visualización de KPIs.

### 4.5 Panel: Operaciones de Promociones (promociones-operaciones)
Funciones:
- Registrar actividades realizadas.
- Registrar avance de tareas.
- Actualizar presupuesto.
- Generar reportes e informes.

### 4.6 Panel: Administración General (admin-general)
Funciones:
- Ver datos de todas las sucursales.
- Filtrar por sucursal, usuario, periodo, tipo de actividad.
- Generar informes globales.
- Asignar o revocar permisos.

### 4.7 Panel: Principal de Desarrollo (principal-dashboard)
Funciones:
- Soporte al equipo de desarrollo.
- Herramientas especiales y utilitarios.
- Configuraciones avanzadas.

---

## 5. Modelo de Seguridad: Roles, Grupos y Sucursales

### 5.1 Grupos de trabajo
Almacenados en tabla `usuarios_grupos`. Iniciales:
- General
- Monitoreo
- Promociones
- Seguridad
- Desarrollo

### 5.2 Roles del sistema
Almacenados en `usuarios_roles`. Roles principales:
- gerente
- supervisor
- operador
- encuestador
- admin
- desarrollo
- super_user
- invitado
- seguridad

### 5.3 Sucursales
Tabla `sucursales`. Toda acción registra la sucursal del usuario. CRUD administrado desde paneles gerenciales.

### 5.4 Creación de usuarios
- Desde DDL (ambiente desarrollo).
- Desde panel de seguridad (roles altos).
- Desde panel de gerencia.

---

## 6. Funcionalidades Especiales: Scraping y Monitoreo de Tendencias

El sistema debe permitir:
- Scraping en Facebook, Instagram, X, YouTube, portales noticiosos.
- Monitoreo de palabras/frases clave.
- Ejecución manual o automática.
- Registro y almacenamiento de resultados.
- Configuración de URLs específicas.
- Alertas sobre ocurrencias relevantes.
- Exportación a herramientas externas.

---

## 7. Encuestas y Sondeos: Diseño, Registro y Gestión

### 7.1 Plantillas de encuestas
- Campos dinámicos: texto, numérico, fecha, correo, teléfono, archivo, etc.
- Versionables, duplicables.
- Solo se usan si están marcadas como “Terminadas”.

### 7.2 Realización de encuestas
Acceso desde panel correspondiente.
- Selección de plantilla.
- Registro de datos.
- Validaciones automáticas.
- Evidencia según aplique.

### 7.3 Ciclo de vida de una encuesta (unificado)
1. Borrador
2. Revisión (gerencia)
3. Aprobación
4. Publicación (web o interna)
5. Recolección (máximo 2 meses)
6. Cierre
7. Validación de calidad
8. Informe preliminar
9. Informe final
10. Archivo (retención 3 años)

---

## 8. Base de Datos — Modelo Conceptual Unificado

Tablas principales:
- users
- usuarios_grupos
- usuarios_roles
- sucursales
- surveys
- survey_templates
- survey_responses (JSONB)
- scraping_config
- scraping_results
- actividades_promociones
- monitoreo_visitas
- indicadores
- reports
- audit_logs

Características:
- PostgreSQL hospedado en Supabase.
- Modelo maestro–detalle.
- JSONB para flexibilidad en respuestas.
- Reglas de retención integradas.

---

## 9. Interfaz Operativa — Página de Inicio

La página de bienvenida mostrará tarjetas con:
- **Título**
- **Descripción**
- Grupo (interno)
- URL (interno)
- Posición
- Ícono

Tarjetas principales:
1. GESTIÓN DE MONITOREO
2. GESTIÓN DE PROMOCIONES
3. SOPORTE Y MANTENIMIENTO
4. OTRAS TAREAS (En desarrollo)

El clic dirige a la página de login.

---

## 10. Reglas de Negocio Unificadas

1. Toda acción debe registrar la sucursal del usuario.
2. Toda encuesta, visita o actividad debe registrar evidencia.
3. Scraping debe registrar origen, URL, entidad y timestamp.
4. Las encuestas deben cumplir el ciclo normativo de 10 etapas.
5. Informes deben ser generables en PDF, MD, CSV.
6. Los roles y grupos determinan los paneles visibles.
7. Indicadores deben tener ficha técnica completa.
8. Auditoría obligatoria en cada acción relevante.
9. Retención: 3 años para encuestas/visitas, 1 año casos sensibles.

---

## 11. Integraciones

- Power BI
- Google Data Studio
- APIs para scraping
- Notificaciones (email, WhatsApp, push)

---

## 12. Prompts para Agente IA (actualizados y no duplicados)

### Generación de esquema SQL
*(idéntico, pero adaptado a nuevo modelo)*

### API REST Node.js / Next.js

### Componentes React PWA

### Dashboards y KPIs

### Pruebas E2E

---

## 13. Checklist de Aceptación

- 80% pruebas unitarias.
- Flujo completo encuestas.
- Informes exportables.
- Auditoría activa.
- Integración DOD cuando aplique.

---

## 14. Próximos Pasos
- Construcción del MVP.
- Integración scraping.
- Paneles completos.
- Dataset de prueba anonimizado.

---

Documento consolidado y listo para servir como guía oficial del desarrollo GEMODIDA.

