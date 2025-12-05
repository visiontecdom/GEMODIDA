# FASE 1: SISTEMA DE ACTIVIDADES Y MONITOREO

**Duración:** 2 semanas (Semanas 3-4)  
**Prioridad:** ALTA  
**Estado:** Pendiente  
**Versión:** 1.0

---

## OBJETIVO GENERAL

Implementar el sistema completo de registro, seguimiento y monitoreo de actividades operativas con integración con planificación.

---

## TAREA 1: UI PARA REGISTRO DE ACTIVIDADES

### Duración: 3 días

### Descripción
Crear formulario completo para registrar actividades con tipos, evidencias y geolocalización.

### Entregables

#### 1.1 Componente Formulario de Actividades
**Archivo:** `src/components/actividades/FormularioActividad.tsx`

Debe incluir:
- [ ] Tipo de actividad (charla, reunión, visita, capacitación, etc.)
- [ ] Descripción detallada
- [ ] Ubicación (manual + GPS)
- [ ] Participantes
- [ ] Duración
- [ ] Evidencias (fotos, documentos)
- [ ] Validaciones automáticas

#### 1.2 Tipos de Actividades
```typescript
const TIPOS_ACTIVIDADES = [
  'Charla',
  'Reunión',
  'Visita',
  'Capacitación',
  'Evento',
  'Seguimiento',
  'Otro'
];
```

#### 1.3 Captura de Evidencias
- [ ] Cámara (foto)
- [ ] Galería (múltiples fotos)
- [ ] Documentos (PDF, Word, Excel)
- [ ] Compresión automática de imágenes

#### 1.4 Geolocalización
- [ ] Captura automática de GPS
- [ ] Mapa interactivo
- [ ] Dirección manual
- [ ] Historial de ubicaciones

### Criterios de Aceptación
- [ ] Formulario completo y funcional
- [ ] Validaciones en tiempo real
- [ ] Captura de evidencias funcional
- [ ] Geolocalización precisa

---

## TAREA 2: SEGUIMIENTO DE ACTIVIDADES

### Duración: 3 días

### Descripción
Crear dashboard de seguimiento con filtros, estadísticas y gráficos.

### Entregables

#### 2.1 Dashboard de Actividades
**Archivo:** `src/app/operaciones/actividades/page.tsx`

Debe mostrar:
- [ ] Lista de actividades con tabla
- [ ] Filtros por tipo, fecha, usuario, sucursal
- [ ] Búsqueda avanzada
- [ ] Estadísticas (total, por tipo, por usuario)
- [ ] Gráficos de tendencias

#### 2.2 Componentes de Estadísticas
- [ ] Total de actividades
- [ ] Actividades por tipo
- [ ] Actividades por usuario
- [ ] Actividades por sucursal
- [ ] Promedio de duración

#### 2.3 Gráficos
- [ ] Gráfico de barras (actividades por tipo)
- [ ] Gráfico de líneas (tendencia temporal)
- [ ] Gráfico de pastel (distribución por usuario)
- [ ] Mapa de calor (actividades por ubicación)

### Criterios de Aceptación
- [ ] Dashboard carga rápido
- [ ] Filtros funcionan correctamente
- [ ] Estadísticas son precisas
- [ ] Gráficos son interactivos

---

## TAREA 3: INTEGRACIÓN CON PLANIFICACIÓN

### Duración: 2 días

### Descripción
Vincular actividades con planificaciones y actualizar progreso automáticamente.

### Entregables

#### 3.1 Vinculación de Actividades
- [ ] Seleccionar planificación al registrar actividad
- [ ] Actualizar estado de tarea
- [ ] Registrar tiempo invertido
- [ ] Marcar como completada

#### 3.2 Actualización de Progreso
- [ ] Calcular progreso automático
- [ ] Actualizar porcentaje de completitud
- [ ] Mostrar estado en dashboard
- [ ] Alertas de cambios

#### 3.3 Alertas y Notificaciones
- [ ] Alertas de tareas vencidas
- [ ] Notificaciones de cambios
- [ ] Recordatorios de actividades
- [ ] Resumen diario

### Criterios de Aceptación
- [ ] Vinculación funciona correctamente
- [ ] Progreso se actualiza automáticamente
- [ ] Alertas se envían a tiempo
- [ ] Notificaciones son claras

---

## ESTÁNDARES DE DISEÑO

### Diseño Visual
- ✅ Moderno y dinámico
- ✅ Responsivo en todos los dispositivos
- ✅ Efectos hover suaves
- ✅ Paleta de colores consistente

### Navegación
- ✅ Menú funcional
- ✅ Breadcrumbs
- ✅ Acceso rápido
- ✅ Indicador de página activa

### Funcionalidad
- ✅ Validaciones en tiempo real
- ✅ Mensajes claros
- ✅ Carga optimizada
- ✅ Confirmaciones para acciones críticas

---

## CHECKLIST DE COMPLETITUD

- [ ] Formulario de actividades completo
- [ ] Tipos de actividades definidos
- [ ] Captura de evidencias funcional
- [ ] Geolocalización implementada
- [ ] Dashboard de seguimiento
- [ ] Estadísticas calculadas
- [ ] Gráficos implementados
- [ ] Vinculación con planificación
- [ ] Actualización de progreso
- [ ] Alertas y notificaciones
- [ ] Diseño responsivo
- [ ] Compilación sin errores

---

## COMPILACIÓN Y TESTING

```bash
npm run build
npm run lint
```

---

## PRÓXIMOS PASOS

1. **Completar Fase Inmediata** - Encuestas
2. **Comenzar Tarea 1** - Formulario de actividades
3. **Revisar 05_FASE_2_SISTEMA_SCRAPING.md** - Siguiente fase

---

**Última actualización:** 2025-12-03
**Estado:** Documento de fase 1 creado
