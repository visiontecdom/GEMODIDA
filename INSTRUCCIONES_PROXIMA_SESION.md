# INSTRUCCIONES PARA LA PRÓXIMA SESIÓN

**Fecha Creación:** 2025-12-03  
**Próxima Sesión:** 2025-12-04 (Estimado)  
**Objetivo:** Completar Fase 2 Tareas 2-3 + Fase 3 Tareas 2-3

---

## ANTES DE EMPEZAR

### 1. Revisar Documentación
Leer en este orden:
1. `RESUMEN_EJECUTIVO_FINAL.md` - Resumen general
2. `ANALISIS_COMPLETO_FALTANTE.md` - Lo que falta
3. `PLAN_ACCION_COMPLETAR_TODO.md` - Plan de acción

### 2. Verificar Estado Actual
```bash
cd d:\Proyectos\Web\GEMODIDA
npm run build
```

Debe compilar exitosamente en ~40 segundos.

### 3. Revisar Estructura
```bash
# Verificar que existen estos directorios
src/components/scraping/
src/components/planificacion/
src/app/api/scraping/
src/app/api/planificacion/
```

---

## TAREA 1: FASE 2 TAREA 2 - MOTOR DE SCRAPING

### Duración: 3 días (Lunes-Miércoles)

### Archivos a Crear

#### 1. Servicio de Scraping
**Archivo:** `src/services/ScrapingService.ts`

```typescript
// Funciones mínimas:
- ejecutarScraping(configId: number)
- almacenarResultados(resultados: any[])
- analizarSentimiento(texto: string)
- manejarErrores(error: any)
```

#### 2. Componente Motor
**Archivo:** `src/components/scraping/MotorScraping.tsx`

```typescript
// Componente que:
- Muestra configuraciones activas
- Botón para ejecutar scraping
- Muestra estado de ejecución
- Muestra resultados
```

#### 3. API Route Ejecutar
**Archivo:** `src/app/api/scraping/ejecutar/route.ts`

```typescript
// POST /api/scraping/ejecutar
// Parámetros: configId
// Retorna: { success, resultados, error }
```

#### 4. API Route Resultados
**Archivo:** `src/app/api/scraping/resultados/route.ts`

```typescript
// GET /api/scraping/resultados?configId=X
// Retorna: { resultados, estadisticas }
```

### Funcionalidades Mínimas
- [x] Ejecutar scraping manual
- [x] Almacenar resultados en BD
- [x] Análisis básico de sentimientos
- [x] Manejo de errores
- [x] Compilación exitosa

---

## TAREA 2: FASE 2 TAREA 3 - DASHBOARD DE MONITOREO

### Duración: 2 días (Jueves-Viernes)

### Archivos a Crear

#### 1. Dashboard Monitoreo
**Archivo:** `src/components/scraping/DashboardMonitoreo.tsx`

```typescript
// Componente que:
- Muestra resultados en tiempo real
- Filtros por fuente, sentimiento
- Búsqueda de palabras clave
- Estadísticas
```

#### 2. Gráficos Tendencias
**Archivo:** `src/components/scraping/GraficosTendencias.tsx`

```typescript
// Componente que:
- Gráfico de tendencias por fecha
- Gráfico de sentimientos
- Gráfico de fuentes
```

#### 3. Alertas Keywords
**Archivo:** `src/components/scraping/AlertasKeywords.tsx`

```typescript
// Componente que:
- Muestra alertas de palabras clave
- Filtros por palabra clave
- Acciones (ver, descartar)
```

### Funcionalidades Mínimas
- [x] Visualización de resultados
- [x] Gráficos de tendencias
- [x] Alertas de palabras clave
- [x] Compilación exitosa

---

## TAREA 3: FASE 3 TAREA 2 - SEGUIMIENTO DE TAREAS

### Duración: 2 días (Lunes-Martes Semana 2)

### Archivos a Crear

#### 1. Dashboard Tareas
**Archivo:** `src/components/planificacion/DashboardTareas.tsx`

```typescript
// Componente que:
- Muestra todas las tareas
- Filtros por estado, prioridad
- Actualizar estado
- Asignar usuario
```

#### 2. Registro Tiempo
**Archivo:** `src/components/planificacion/RegistroTiempo.tsx`

```typescript
// Componente que:
- Formulario para registrar tiempo
- Historial de tiempo
- Total de horas
```

#### 3. API Route Tareas
**Archivo:** `src/app/api/planificacion/tareas/route.ts`

```typescript
// GET /api/planificacion/tareas?planId=X
// POST /api/planificacion/tareas (crear)
// PUT /api/planificacion/tareas/:id (actualizar)
```

### Funcionalidades Mínimas
- [x] Dashboard de tareas
- [x] Registro de tiempo
- [x] Actualización de estado
- [x] Compilación exitosa

---

## TAREA 4: FASE 3 TAREA 3 - REPORTES DE PLANIFICACIÓN

### Duración: 1 día (Miércoles Semana 2)

### Archivos a Crear

#### 1. Reportes Avance
**Archivo:** `src/components/planificacion/ReportesAvance.tsx`

```typescript
// Componente que:
- Muestra avance por planificación
- Tareas completadas vs pendientes
- Gráfico de progreso
- Exportar reporte
```

#### 2. Analíticas Carga
**Archivo:** `src/components/planificacion/AnaliticasCarga.tsx`

```typescript
// Componente que:
- Carga de usuarios
- Tareas por usuario
- Horas registradas
```

### Funcionalidades Mínimas
- [x] Reportes de avance
- [x] Analíticas de carga
- [x] Exportación básica
- [x] Compilación exitosa

---

## CHECKLIST DIARIO

### Cada Día
- [ ] Compilar proyecto: `npm run build`
- [ ] Verificar sin errores
- [ ] Crear archivos según plan
- [ ] Actualizar documentación
- [ ] Commit de cambios

### Cada Semana
- [ ] Actualizar SEGUIMIENTO_PROGRESO.md
- [ ] Crear documento de tarea completada
- [ ] Revisar compilación
- [ ] Verificar funcionalidades

---

## COMANDOS ÚTILES

```bash
# Compilar
npm run build

# Iniciar servidor de desarrollo
npm run dev

# Linting
npm run lint

# Ver cambios
git status

# Crear directorio
mkdir src/components/scraping
```

---

## POLÍTICAS A RECORDAR

1. **Compilación:** Siempre compilar después de cambios
2. **Código Minimal:** Solo lo necesario, sin verbosidad
3. **Documentación:** Documentar cada tarea completada
4. **Validación:** Validar en cliente y servidor
5. **Errores:** Manejar todos los errores

---

## RECURSOS DISPONIBLES

### Documentación
- `docs/PLAN_DESARROLLO_ETAPAS/` - Todas las fases
- `POLITICAS_DESARROLLO_GEMODIDA.md` - Políticas
- `.amazonq/rules/` - Reglas de desarrollo

### Código Existente
- `src/components/` - Componentes reutilizables
- `src/hooks/` - Hooks personalizados
- `src/app/api/` - API routes existentes

---

## NOTAS IMPORTANTES

1. **Reutilizar Componentes:** Usar DataTable, Button, Input, etc.
2. **Seguir Patrones:** Usar patrones existentes en el proyecto
3. **Mantener Compilación:** Compilar después de cada cambio
4. **Documentar:** Crear documento de tarea completada
5. **Validar:** Probar funcionalidades antes de compilar

---

## PRÓXIMA SESIÓN DESPUÉS

Después de completar estas 4 tareas:
1. Revisar Fase 4 (Panel de Promociones)
2. Preparar estructura de BD
3. Crear componentes de promociones
4. Implementar operaciones

---

**Preparación Completada:** ✅ SÍ  
**Listo para Próxima Sesión:** ✅ SÍ  
**Documentación:** ✅ COMPLETA

---

*Instrucciones preparadas el 2025-12-03 por Amazon Q*
