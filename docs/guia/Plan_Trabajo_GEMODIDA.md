# Plan de Trabajo por Fases y Prioridades --- Proyecto GEMODIDA

Este documento describe el plan oficial de ejecución del proyecto
GEMODIDA, organizado en fases, prioridades, entregables, dependencias y
criterios de completitud. Se utilizará como guía operativa y como
tablero maestro para dar seguimiento al avance del desarrollo.

------------------------------------------------------------------------

## 1. Objetivos del Plan de Trabajo

-   Organizar el desarrollo por fases lógicas y progresivas.
-   Priorizar actividades críticas para habilitar un MVP funcional.
-   Establecer controles de avance (pendientes, en proceso,
    completadas).
-   Proveer un roadmap claro para desarrolladores, analistas y
    dirección.
-   Facilitar ejecución híbrida (scrum/kanban) con iteraciones
    continuas.

------------------------------------------------------------------------

## 2. Macro‐Fases del Proyecto

### **Fase 1 --- Infraestructura y Fundamentos (Prioridad Máxima)**

**Objetivo:** Crear la base que soportará todos los módulos posteriores.

**Tareas principales:** 1. Diseño final del modelo de datos (BD
PostgreSQL -- Supabase). 2. Configuración de Supabase: políticas RLS,
triggers, vistas, funciones. 3. Arquitectura de la aplicación (Next.js +
Node.js + React + PWA). 4. Sistema de autenticación y autorización
(roles, grupos, sucursales). 5. Implementación de auditoría
centralizada. 6. Implementación del panel de desarrollo
(principal-dashboard -- versión mínima).

**Dependencias:** Ninguna, es la base del proyecto.

**Criterios de completitud:** - BD estable, sin cambios críticos
pendientes. - Login/Logout completo. - RBAC funcionando. - Registro de
auditoría funcionando.

------------------------------------------------------------------------

### **Fase 2 --- Paneles Base y Navegación Operativa (Prioridad Alta)**

**Objetivo:** Establecer el esqueleto navegable del sistema.

**Tareas:** 1. Página de inicio (tarjetas operativas con rutas y
metadatos). 2. Routing avanzado para paneles según grupo/rol/sucursal.
3. Generación del layout y sidebar para cada panel. 4. Implementar
paneles en blanco con estructura: - monitoreo-gerencia -
monitoreo-operaciones - monitoreo-encuestas - promociones-gerencia -
promociones-operaciones - admin-general - principal-dashboard

**Dependencias:** Fase 1 (RBAC + login + BD).

**Criterios de completitud:** - Cada panel debe cargar correctamente
según permisos. - Redirecciones automáticas por rol. - Control de acceso
aplicado en frontend + backend.

------------------------------------------------------------------------

## Fase 3 --- Módulos Críticos del MVP (Prioridad Alta)

**Objetivo:** Liberar la primera versión funcional del proyecto.

**Tareas:** \### 3.1 Módulo de Encuestas y Sondeos - CRUD de
plantillas. - Constructor dinámico de formularios. - Validaciones
automáticas. - Captura online/offline (PWA + IndexedDB). - Ciclo de vida
completo (borrador → archivo).

### 3.2 Módulo de Scraping y Tendencias

-   Configuración de palabras clave.
-   Conexión a APIs externas o scraping legal.
-   Registro de hallazgos.
-   Dashboard de alertas.

### 3.3 Módulo de Actividades (Monitoreo + Promociones)

-   Registro de actividades.
-   Seguimiento y control de avance.
-   Evidencias.

**Dependencias:** Paneles base funcionales.

**Criterios de completitud:** - Se puede realizar una encuesta
completa. - Scraping activo manual. - Actividades registrables desde
paneles. - Validación de calidad activa.

------------------------------------------------------------------------

## Fase 4 --- Reportes, Indicadores y Escritorio Analítico (Prioridad Media)

**Objetivo:** Proveer capacidad de análisis y salida institucional.

**Tareas:** 1. Motor de indicadores basado en fichas técnicas. 2.
Dashboard dinámico con KPIs. 3. Generación de documentos: PDF, MD, DOCX.
4. Exportación: CSV / JSON / XLSX. 5. Integración con Power BI y Data
Studio. 6. Informes ejecutivos automáticos.

**Criterios de completitud:** - Indicadores calculados correctamente. -
Exportaciones operativas. - Integración BI funcional.

------------------------------------------------------------------------

## Fase 5 --- Integraciones Externas, Automatizaciones y Notificaciones (Prioridad Media/Baja)

**Tareas:** - API pública y privada. - Automatización de scraping. -
Alertas por correo, WhatsApp, push. - Cron jobs para tareas programadas.

------------------------------------------------------------------------

## Fase 6 --- Optimización, Endurecimiento y Escalabilidad (Prioridad Baja)

**Tareas:** - Optimización de consultas SQL. - Monitoreo de
rendimiento. - Hardening de seguridad. - Refactor general. - Stress
testing.

------------------------------------------------------------------------

## 3. Roadmap en Orden de Prioridades

### **Prioridad Máxima (Urgente)**

1.  Modelo de datos final.
2.  RBAC completo.
3.  Paneles base y navegación.

### **Prioridad Alta**

4.  Encuestas (constructor + captura PWA).
5.  Scraping inicial.
6.  Actividades.

### **Prioridad Media**

7.  Reportes.
8.  Indicadores.
9.  Integraciones BI.

### **Prioridad Media/Baja**

10. Automatizaciones.
11. Notificaciones.
12. API pública.

### **Prioridad Baja**

13. Optimización.
14. Hardening.
15. Escalabilidad.

------------------------------------------------------------------------

## 4. Tablero de Control de Avance (Kanban Técnico)

### **Columna: PENDIENTES**

-   Elementos de la fase actual aún no iniciados.
-   Requerimientos en revisión.
-   Mockups y documentación previa.

### **Columna: EN PROCESO**

-   Tareas activas asignadas a uno o varios desarrolladores.
-   Revisiones de QA.
-   Integraciones en progreso.

### **Columna: COMPLETADAS**

-   Funcionalidades ya integradas en ambiente dev.
-   QA aprobado.
-   Merge final a rama principal.

### **Columna: ARCHIVADAS**

-   Fases concluidas.
-   Entregables aprobados por dirección.

------------------------------------------------------------------------

## 5. Riesgos y Mitigaciones

-   **Cambios futuros en paneles o módulos** → Arquitectura modular +
    diseño flexible.
-   **Complejidad del scraping** → Enfoque en APIs antes que HTML
    scraping.
-   **Cambios de política institucional** → Módulos configurables por
    BD.
-   **Dependencias externas (BI, APIs)** → Abstracción por servicios.

------------------------------------------------------------------------

## 6. Conclusión

Este plan de trabajo servirá como la guía operativa y estratégica del
proyecto GEMODIDA, permitiendo medir avance real, priorizar esfuerzos y
mantener coherencia entre las áreas de desarrollo, análisis, monitoreo y
dirección.
