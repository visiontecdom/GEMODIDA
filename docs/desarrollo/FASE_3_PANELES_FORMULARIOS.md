# FASE 3: PANELES Y FORMULARIOS - PLAN DETALLADO

**Fecha:** 2025-11-19  
**Estado:** PLANIFICACIÓN  
**Duración estimada:** 3-5 días

---

## 📋 RESUMEN

Esta fase se enfoca en crear los paneles principales de la aplicación (Administración y Operaciones) junto con los formularios necesarios para gestionar datos.

---

## 🎯 OBJETIVOS

1. ✅ Panel de Administración completo
2. ✅ Panel de Operaciones con gráficos
3. ✅ Formularios CRUD para gestión de datos
4. ✅ Validación de permisos por rol
5. ✅ Interfaz responsiva y moderna

---

## 📊 ESTRUCTURA DE PANELES

### Panel de Administración (Roles: admin, super_user)

**Ruta:** `/admin`

**Componentes:**
1. **Dashboard Admin**
   - Estadísticas del sistema
   - Usuarios activos
   - Últimas actividades
   - Alertas del sistema

2. **Gestión de Usuarios** (`/admin/users`)
   - Tabla de usuarios
   - Crear usuario
   - Editar usuario
   - Eliminar usuario
   - Asignar roles

3. **Gestión de Roles** (`/admin/roles`)
   - Tabla de roles
   - Crear rol
   - Editar permisos
   - Asignar a usuarios

4. **Configuración del Sistema** (`/admin/settings`)
   - Variables de configuración
   - Parámetros de scraping
   - Configuración de notificaciones

5. **Visor de Logs** (`/admin/logs`)
   - Tabla de logs
   - Filtros por tipo y fecha
   - Búsqueda

---

### Panel de Operaciones (Roles: operador, invitado)

**Ruta:** `/dashboard`

**Componentes:**
1. **Dashboard Principal**
   - Gráficos de estadísticas
   - Palabras clave más mencionadas
   - Actividades recientes
   - Alertas activas

2. **Gestión de Palabras Clave** (`/keywords`)
   - Tabla de palabras clave
   - Crear palabra clave
   - Editar palabra clave
   - Eliminar palabra clave
   - Ver resultados

3. **Gestión de Resultados** (`/results`)
   - Tabla de resultados
   - Filtros por palabra clave, fuente, fecha
   - Ver detalles
   - Exportar

4. **Gestión de Reportes** (`/reports`)
   - Tabla de reportes
   - Crear reporte
   - Descargar reporte
   - Ver historial

5. **Formulario de Encuestas** (`/surveys`)
   - Crear encuesta
   - Registrar respuestas
   - Ver resultados

6. **Formulario de Actividades** (`/activities`)
   - Registrar actividad
   - Asignar a usuario
   - Ver historial

---

## 🔧 TAREAS DETALLADAS

### TAREA 3.1: Panel de Administración - Dashboard

**Archivo:** `src/app/admin/page.tsx`

**Componentes necesarios:**
- Card para estadísticas
- Gráfico de usuarios activos
- Tabla de últimas actividades
- Botones de acción rápida

**Datos a mostrar:**
- Total de usuarios
- Usuarios activos hoy
- Palabras clave creadas
- Resultados procesados
- Reportes generados

---

### TAREA 3.2: Gestión de Usuarios

**Archivo:** `src/app/admin/users/page.tsx`

**Componentes:**
- Tabla de usuarios con paginación
- Formulario de crear usuario
- Formulario de editar usuario
- Modal de confirmación de eliminación

**Campos del formulario:**
- Nombre completo
- Correo electrónico
- Teléfono
- Rol (select)
- Estado (activo/inactivo)

**Acciones:**
- Crear usuario
- Editar usuario
- Eliminar usuario
- Cambiar rol
- Activar/Desactivar

---

### TAREA 3.3: Gestión de Palabras Clave

**Archivo:** `src/app/keywords/page.tsx`

**Componentes:**
- Tabla de palabras clave
- Formulario de crear palabra clave
- Formulario de editar palabra clave
- Botón de ver resultados

**Campos del formulario:**
- Palabra/Frase
- Descripción
- Etiquetas
- Pública (checkbox)

**Acciones:**
- Crear palabra clave
- Editar palabra clave
- Eliminar palabra clave
- Ver resultados
- Exportar resultados

---

### TAREA 3.4: Gestión de Resultados

**Archivo:** `src/app/results/page.tsx`

**Componentes:**
- Tabla de resultados con filtros
- Detalles de resultado
- Exportar a CSV/Excel

**Filtros:**
- Por palabra clave
- Por fuente
- Por fecha
- Por sentimiento

**Columnas:**
- Palabra clave
- Fuente
- Título
- Autor
- Fecha de publicación
- Sentimiento
- Relevancia

---

### TAREA 3.5: Gestión de Reportes

**Archivo:** `src/app/reports/page.tsx`

**Componentes:**
- Tabla de reportes
- Formulario de crear reporte
- Botón de descargar

**Tipos de reportes:**
- Resumen de palabras clave
- Análisis de sentimiento
- Tendencias
- Comparativa de períodos

---

### TAREA 3.6: Formulario de Encuestas

**Archivo:** `src/app/surveys/page.tsx`

**Componentes:**
- Formulario de crear encuesta
- Tabla de encuestas
- Formulario de responder encuesta

**Campos:**
- Título
- Descripción
- Preguntas (dinámicas)
- Tipo de pregunta (texto, opción múltiple, escala)

---

### TAREA 3.7: Formulario de Actividades

**Archivo:** `src/app/activities/page.tsx`

**Componentes:**
- Formulario de registrar actividad
- Tabla de actividades
- Filtros por tipo y usuario

**Campos:**
- Tipo de actividad (reunión, charla, promoción)
- Descripción
- Fecha
- Ubicación
- Asignado a (usuario)
- Resultado

---

## 🎨 COMPONENTES REUTILIZABLES

### Componentes a crear:

1. **DataTable** - Tabla genérica con paginación y filtros
2. **FormDialog** - Modal para formularios
3. **ConfirmDialog** - Modal de confirmación
4. **StatCard** - Tarjeta de estadística
5. **ChartCard** - Tarjeta con gráfico
6. **FilterBar** - Barra de filtros
7. **ExportButton** - Botón de exportación

---

## 📋 ESTRUCTURA DE CARPETAS

```
src/
├── app/
│   ├── admin/
│   │   ├── page.tsx (Dashboard)
│   │   ├── users/
│   │   │   └── page.tsx
│   │   ├── roles/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── logs/
│   │       └── page.tsx
│   ├── keywords/
│   │   └── page.tsx
│   ├── results/
│   │   └── page.tsx
│   ├── reports/
│   │   └── page.tsx
│   ├── surveys/
│   │   └── page.tsx
│   └── activities/
│       └── page.tsx
├── components/
│   ├── admin/
│   │   ├── UserForm.tsx
│   │   ├── UserTable.tsx
│   │   ├── RoleForm.tsx
│   │   └── LogsTable.tsx
│   ├── keywords/
│   │   ├── KeywordForm.tsx
│   │   └── KeywordTable.tsx
│   ├── results/
│   │   ├── ResultsTable.tsx
│   │   └── ResultsFilter.tsx
│   ├── reports/
│   │   ├── ReportForm.tsx
│   │   └── ReportTable.tsx
│   ├── surveys/
│   │   ├── SurveyForm.tsx
│   │   └── SurveyTable.tsx
│   ├── activities/
│   │   ├── ActivityForm.tsx
│   │   └── ActivityTable.tsx
│   └── shared/
│       ├── DataTable.tsx
│       ├── FormDialog.tsx
│       ├── ConfirmDialog.tsx
│       ├── StatCard.tsx
│       ├── ChartCard.tsx
│       └── FilterBar.tsx
└── hooks/
    ├── useUsers.ts
    ├── useKeywords.ts
    ├── useResults.ts
    ├── useReports.ts
    ├── useSurveys.ts
    └── useActivities.ts
```

---

## 🔐 VALIDACIÓN DE PERMISOS

### Por Rol:

**Admin:**
- Acceso a `/admin` y todas sus subrutas
- Acceso a `/dashboard`
- Acceso a `/keywords`, `/results`, `/reports`
- Puede crear, editar, eliminar usuarios
- Puede ver logs

**Operador:**
- Acceso a `/dashboard`
- Acceso a `/keywords`, `/results`, `/reports`
- Puede crear palabras clave propias
- No puede ver logs

**Invitado:**
- Acceso a `/dashboard` (solo lectura)
- Puede ver `/results` y `/reports`
- No puede crear ni editar

---

## ✅ CHECKLIST DE VALIDACIÓN

- [ ] Panel de Administración funcional
- [ ] CRUD de usuarios completo
- [ ] CRUD de palabras clave completo
- [ ] Tabla de resultados con filtros
- [ ] Gestión de reportes
- [ ] Formularios de encuestas
- [ ] Formularios de actividades
- [ ] Validación de permisos por rol
- [ ] Interfaz responsiva
- [ ] Gráficos funcionales

---

## 🚀 PRÓXIMOS PASOS

Una vez completada esta fase:

1. **FASE 4:** Funcionalidades Avanzadas
   - Scraping simulado
   - Notificaciones push
   - Reportes PDF

2. **FASE 5:** Optimización y Testing
   - Tests unitarios
   - Tests de integración
   - Optimización de rendimiento

---

**Generado por:** Amazon Q  
**Última actualización:** 2025-11-19
