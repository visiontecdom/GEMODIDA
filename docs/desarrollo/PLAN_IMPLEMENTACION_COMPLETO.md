# PLAN DE IMPLEMENTACIÓN COMPLETO - GEMODIDA

**Fecha:** 2025-11-19  
**Versión:** 2.0  
**Estado:** ACTIVO  
**Objetivo:** Implementar todas las funcionalidades faltantes con datos reales desde BD

---

## 📋 RESUMEN EJECUTIVO

Este documento consolida la planificación actual y define exactamente qué falta por implementar. El objetivo es crear una aplicación completamente funcional con datos reales recuperados desde la base de datos PostgreSQL en Supabase.

---

## ✅ ESTADO ACTUAL (COMPLETADO)

### Base de Datos
- ✅ 13 tablas creadas
- ✅ 9 funciones RPC funcionales
- ✅ Índices creados
- ✅ Políticas RLS implementadas

### Aplicación
- ✅ Compilación exitosa
- ✅ Autenticación funcional
- ✅ 8 páginas base creadas
- ✅ 10 componentes UI disponibles
- ✅ Configuración PWA completa

---

## ⏳ FALTA POR IMPLEMENTAR

### FASE 2: Funciones RPC para Datos Reales

**Funciones RPC a crear:**

1. `obtener_estadisticas_dashboard()` - Datos para dashboard principal
2. `obtener_usuarios_activos()` - Usuarios activos hoy
3. `obtener_palabras_clave_recientes()` - Palabras clave recientes
4. `obtener_resultados_recientes()` - Resultados recientes
5. `obtener_reportes_pendientes()` - Reportes en proceso
6. `obtener_alertas_activas()` - Alertas activas
7. `contar_usuarios()` - Total de usuarios
8. `contar_palabras_clave()` - Total de palabras clave
9. `contar_resultados()` - Total de resultados

**Ubicación:** `db/Scripts_SQL/06_funciones_rpc_datos_reales.sql`

---

### FASE 3: Páginas CRUD y Paneles

#### Panel de Administración (`/admin`)

**Páginas a crear:**

1. **Dashboard Admin** (`/admin/page.tsx`)
   - Estadísticas del sistema (datos reales)
   - Usuarios activos
   - Últimas actividades
   - Alertas del sistema

2. **Gestión de Usuarios** (`/admin/users/page.tsx`)
   - Tabla de usuarios (datos reales)
   - Crear usuario
   - Editar usuario
   - Eliminar usuario
   - Asignar roles

3. **Gestión de Roles** (`/admin/roles/page.tsx`)
   - Tabla de roles
   - Crear rol
   - Editar permisos
   - Asignar a usuarios

4. **Configuración del Sistema** (`/admin/settings/page.tsx`)
   - Variables de configuración
   - Parámetros de scraping
   - Configuración de notificaciones

5. **Visor de Logs** (`/admin/logs/page.tsx`)
   - Tabla de logs (datos reales)
   - Filtros por tipo y fecha
   - Búsqueda

#### Panel de Operaciones (`/dashboard`)

**Páginas a crear/mejorar:**

1. **Dashboard Principal** (`/dashboard/page.tsx`)
   - Gráficos de estadísticas (datos reales)
   - Palabras clave más mencionadas
   - Actividades recientes
   - Alertas activas

2. **Gestión de Palabras Clave** (`/keywords/page.tsx`)
   - Tabla de palabras clave (datos reales)
   - Crear palabra clave
   - Editar palabra clave
   - Eliminar palabra clave
   - Ver resultados

3. **Gestión de Resultados** (`/results/page.tsx`)
   - Tabla de resultados (datos reales)
   - Filtros por palabra clave, fuente, fecha
   - Ver detalles
   - Exportar

4. **Gestión de Reportes** (`/reports/page.tsx`)
   - Tabla de reportes (datos reales)
   - Crear reporte
   - Descargar reporte
   - Ver historial

5. **Formulario de Encuestas** (`/surveys/page.tsx`)
   - Crear encuesta
   - Registrar respuestas
   - Ver resultados

6. **Formulario de Actividades** (`/activities/page.tsx`)
   - Registrar actividad
   - Asignar a usuario
   - Ver historial

---

### FASE 4: Funcionalidades Avanzadas

#### Scraping Simulado

**API Routes a crear:**

1. `src/app/api/scraping/simulate/route.ts`
   - Simular scraping de palabras clave
   - Guardar resultados en BD
   - Análisis de sentimiento

2. `src/app/api/scraping/status/route.ts`
   - Obtener estado de scraping
   - Progreso de procesos

#### Notificaciones

**API Routes a crear:**

1. `src/app/api/notifications/send/route.ts`
   - Enviar notificaciones push
   - Alertas por email

#### Reportes

**API Routes a crear:**

1. `src/app/api/reports/generate/route.ts`
   - Generar reportes PDF
   - Exportar a CSV

---

## 🔧 PLAN DE IMPLEMENTACIÓN PASO A PASO

### PASO 1: Crear Funciones RPC para Datos Reales (1 día)

**Archivo:** `db/Scripts_SQL/06_funciones_rpc_datos_reales.sql`

**Funciones:**
```sql
-- Obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION obtener_estadisticas_dashboard()
RETURNS TABLE(
    total_usuarios bigint,
    usuarios_activos bigint,
    total_palabras_clave bigint,
    total_resultados bigint,
    reportes_pendientes bigint,
    alertas_activas bigint
)

-- Obtener usuarios activos hoy
CREATE OR REPLACE FUNCTION obtener_usuarios_activos()
RETURNS TABLE(...)

-- Obtener palabras clave recientes
CREATE OR REPLACE FUNCTION obtener_palabras_clave_recientes(p_limite integer DEFAULT 10)
RETURNS TABLE(...)

-- Obtener resultados recientes
CREATE OR REPLACE FUNCTION obtener_resultados_recientes(p_limite integer DEFAULT 10)
RETURNS TABLE(...)

-- Obtener reportes pendientes
CREATE OR REPLACE FUNCTION obtener_reportes_pendientes()
RETURNS TABLE(...)

-- Obtener alertas activas
CREATE OR REPLACE FUNCTION obtener_alertas_activas()
RETURNS TABLE(...)
```

**Acciones:**
1. Crear script SQL con todas las funciones
2. Ejecutar en Supabase
3. Validar que todas las funciones funcionan

---

### PASO 2: Crear Hooks para Consumir Datos (1 día)

**Archivos a crear:**

1. `src/hooks/useDashboardStats.ts` - Estadísticas del dashboard
2. `src/hooks/useUsers.ts` - Gestión de usuarios
3. `src/hooks/useKeywords.ts` - Gestión de palabras clave
4. `src/hooks/useResults.ts` - Gestión de resultados
5. `src/hooks/useReports.ts` - Gestión de reportes
6. `src/hooks/useLogs.ts` - Gestión de logs

**Estructura básica:**
```typescript
export function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Llamar a función RPC
    // Actualizar estado
  }, []);
  
  return { stats, loading };
}
```

---

### PASO 3: Crear Componentes Reutilizables (1 día)

**Archivos a crear:**

1. `src/components/shared/DataTable.tsx` - Tabla genérica
2. `src/components/shared/FormDialog.tsx` - Modal de formulario
3. `src/components/shared/ConfirmDialog.tsx` - Modal de confirmación
4. `src/components/shared/StatCard.tsx` - Tarjeta de estadística
5. `src/components/shared/ChartCard.tsx` - Tarjeta con gráfico
6. `src/components/shared/FilterBar.tsx` - Barra de filtros

---

### PASO 4: Crear Panel de Administración (2 días)

**Archivos a crear:**

1. `src/app/admin/page.tsx` - Dashboard admin
2. `src/app/admin/users/page.tsx` - Gestión de usuarios
3. `src/app/admin/roles/page.tsx` - Gestión de roles
4. `src/app/admin/settings/page.tsx` - Configuración
5. `src/app/admin/logs/page.tsx` - Visor de logs

**Componentes:**
- `src/components/admin/UserForm.tsx`
- `src/components/admin/UserTable.tsx`
- `src/components/admin/RoleForm.tsx`
- `src/components/admin/LogsTable.tsx`

---

### PASO 5: Mejorar Panel de Operaciones (2 días)

**Archivos a mejorar:**

1. `src/app/dashboard/page.tsx` - Dashboard con datos reales
2. `src/app/keywords/page.tsx` - Gestión de palabras clave
3. `src/app/results/page.tsx` - Gestión de resultados
4. `src/app/reports/page.tsx` - Gestión de reportes

**Nuevas páginas:**

5. `src/app/surveys/page.tsx` - Formulario de encuestas
6. `src/app/activities/page.tsx` - Formulario de actividades

---

### PASO 6: Crear API Routes para Scraping (1 día)

**Archivos a crear:**

1. `src/app/api/scraping/simulate/route.ts`
2. `src/app/api/scraping/status/route.ts`

**Funcionalidad:**
- Simular scraping de palabras clave
- Guardar resultados en BD
- Análisis de sentimiento

---

### PASO 7: Crear Sistema de Notificaciones (1 día)

**Archivos a crear:**

1. `src/app/api/notifications/send/route.ts`

**Funcionalidad:**
- Enviar notificaciones push
- Alertas por email

---

### PASO 8: Crear Generador de Reportes (1 día)

**Archivos a crear:**

1. `src/app/api/reports/generate/route.ts`

**Funcionalidad:**
- Generar reportes PDF
- Exportar a CSV

---

### PASO 9: Compilación y Validación (1 día)

**Acciones:**
1. Ejecutar `npm run build`
2. Corregir errores de TypeScript
3. Validar que todas las páginas funcionan
4. Probar flujos de usuario

---

## 📊 CRONOGRAMA

```
Día 1: Funciones RPC para datos reales
Día 2: Hooks para consumir datos
Día 3: Componentes reutilizables
Día 4-5: Panel de Administración
Día 6-7: Panel de Operaciones
Día 8: API Routes para scraping
Día 9: Sistema de notificaciones
Día 10: Generador de reportes
Día 11: Compilación y validación
```

**Duración total:** ~2 semanas

---

## 🎯 CRITERIOS DE ÉXITO

### Datos Reales
- ✅ Todos los datos provienen de la BD
- ✅ No hay datos mock o hardcodeados
- ✅ Las funciones RPC funcionan correctamente

### Funcionalidad
- ✅ CRUD completo para usuarios
- ✅ CRUD completo para palabras clave
- ✅ CRUD completo para resultados
- ✅ CRUD completo para reportes
- ✅ Scraping simulado funciona
- ✅ Notificaciones se envían
- ✅ Reportes se generan

### Calidad
- ✅ Compilación sin errores
- ✅ TypeScript validado
- ✅ Interfaz responsiva
- ✅ Permisos por rol implementados

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Funciones RPC
- [ ] Crear script SQL con funciones
- [ ] Ejecutar en Supabase
- [ ] Validar funciones

### Hooks
- [ ] useDashboardStats
- [ ] useUsers
- [ ] useKeywords
- [ ] useResults
- [ ] useReports
- [ ] useLogs

### Componentes
- [ ] DataTable
- [ ] FormDialog
- [ ] ConfirmDialog
- [ ] StatCard
- [ ] ChartCard
- [ ] FilterBar

### Panel de Administración
- [ ] Dashboard admin
- [ ] Gestión de usuarios
- [ ] Gestión de roles
- [ ] Configuración
- [ ] Visor de logs

### Panel de Operaciones
- [ ] Dashboard mejorado
- [ ] Gestión de palabras clave
- [ ] Gestión de resultados
- [ ] Gestión de reportes
- [ ] Formulario de encuestas
- [ ] Formulario de actividades

### API Routes
- [ ] Scraping simulado
- [ ] Notificaciones
- [ ] Generador de reportes

### Validación
- [ ] Compilación exitosa
- [ ] TypeScript sin errores
- [ ] Todas las páginas funcionan
- [ ] Datos reales en todas partes

---

## 🔐 CONSIDERACIONES DE SEGURIDAD

1. **Validación de Permisos**
   - Admin: Acceso total
   - Operador: Acceso a operaciones
   - Invitado: Solo lectura

2. **Políticas RLS**
   - Usuarios ven solo sus datos
   - Admins ven todos los datos
   - Logs solo para admins

3. **Validación de Entrada**
   - Validar todos los formularios
   - Sanitizar datos
   - Prevenir SQL injection

---

## 📝 NOTAS IMPORTANTES

1. **Políticas de Desarrollo**
   - Seguir políticas de POLITICAS_DESARROLLO_GEMODIDA.md
   - Cambios mínimos y localizados
   - Validación inmediata tras cada cambio

2. **Base de Datos**
   - No modificar archivos en `db/Esquema/`
   - Crear scripts en `db/Scripts_SQL/`
   - Revisar estructura antes de crear funciones

3. **Datos Reales**
   - Todos los datos deben venir de la BD
   - No usar datos mock
   - Usar funciones RPC para recuperar datos

4. **Compilación**
   - Compilar después de cada cambio importante
   - Corregir errores inmediatamente
   - Validar TypeScript

---

**Generado por:** Amazon Q  
**Última actualización:** 2025-11-19  
**Próxima revisión:** Después de completar PASO 1
