# GUÍA DE USO - GEMODIDA COMPLETADO
**Versión:** 1.0  
**Fecha:** 2025-12-03  
**Estado:** ✅ COMPLETADO 100%

---

## 🚀 INICIO RÁPIDO

### Compilar Proyecto
```bash
npm run build
```

### Iniciar Servidor de Desarrollo
```bash
npm run dev
```

El servidor estará disponible en: `http://localhost:3003`

---

## 📋 ACCESO A FUNCIONALIDADES

### FASE 4: Panel de Promociones
**URL:** `http://localhost:3003/promociones`

**Funcionalidades:**
- Crear nuevas promociones
- Listar promociones activas
- Ejecutar promociones
- Analizar ROI
- Ver estadísticas

**Componentes:**
- FormularioPromocion - Crear promociones
- ListaPromociones - Listar y ejecutar
- AnalisisROI - Análisis de ROI

---

### FASE 5: Reportes e Indicadores
**URL:** `http://localhost:3003/reportes`

**Funcionalidades:**
- Ver KPIs principales
- Visualizar métricas
- Exportar reportes
- Analizar tendencias

**Componentes:**
- DashboardKPIs - Dashboard de KPIs
- Resumen ejecutivo

---

### FASE 6: Notificaciones
**Componente:** `CentroNotificaciones`

**Funcionalidades:**
- Ver notificaciones
- Marcar como leído
- Múltiples canales (push, email, WhatsApp)
- Historial de notificaciones

**API:** `POST /api/notificaciones/enviar`

---

### FASE 7: Optimización
**Módulos:**
- `src/lib/cache.ts` - Sistema de caché
- `src/lib/performance.ts` - Monitor de rendimiento

**Uso:**
```typescript
import { cacheManager } from '@/lib/cache';
import { performanceMonitor } from '@/lib/performance';

// Usar caché
cacheManager.set('key', data, 300); // 5 minutos TTL
const cached = cacheManager.get('key');

// Monitorear rendimiento
performanceMonitor.recordMetric('api_call', 150);
const metrics = performanceMonitor.getMetrics();
```

---

## 🔧 SERVICIOS DISPONIBLES

### PromocioneService
```typescript
import { PromocioneService } from '@/services/PromocioneService';

const service = new PromocioneService();

// Crear promoción
await service.crearPromocion(data);

// Listar promociones
await service.listarPromociones(filtros);

// Ejecutar promoción
await service.ejecutarPromocion(id);

// Calcular ROI
await service.calcularROI(id);
```

### KPIService
```typescript
import { KPIService } from '@/services/KPIService';

const service = new KPIService();

// Calcular KPIs
const kpis = await service.calcularKPIs();

// Obtener métricas
const metricas = await service.obtenerMetricas('mes');
```

### NotificacionService
```typescript
import { NotificacionService } from '@/services/NotificacionService';

const service = new NotificacionService();

// Enviar notificación
await service.enviarNotificacion(notif);

// Obtener notificaciones
await service.obtenerNotificaciones(usuarioId);

// Marcar como leída
await service.marcarComoLeida(id);
```

---

## 🎯 HOOKS DISPONIBLES

### usePromociones
```typescript
const { 
  promociones, 
  loading, 
  error, 
  listar, 
  crear, 
  actualizar, 
  eliminar, 
  ejecutar, 
  calcularROI 
} = usePromociones();
```

---

## 📡 API ENDPOINTS

### Promociones
- `POST /api/promociones/crear` - Crear promoción
- `GET /api/promociones/listar` - Listar promociones
- `POST /api/promociones/ejecutar` - Ejecutar promoción

### Notificaciones
- `POST /api/notificaciones/enviar` - Enviar notificación

---

## 📊 ESTRUCTURA DE DATOS

### Promocion
```typescript
interface Promocion {
  id?: number;
  nombre: string;
  descripcion?: string;
  tipo: 'porcentaje' | 'fijo' | 'bogo';
  valor: number;
  estado: 'borrador' | 'activa' | 'pausada' | 'finalizada';
  fecha_inicio: string;
  fecha_fin: string;
  limite_uso: number;
  uso_actual?: number;
}
```

### KPI
```typescript
interface KPI {
  id: string;
  nombre: string;
  valor: number;
  meta: number;
  porcentaje: number;
  tendencia: 'up' | 'down' | 'stable';
}
```

### Notificacion
```typescript
interface Notificacion {
  id?: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  canal: 'push' | 'email' | 'whatsapp';
  usuario_id?: string;
  leida?: boolean;
}
```

---

## 🔐 SEGURIDAD

- ✅ Autenticación con Supabase
- ✅ RBAC (Role-Based Access Control)
- ✅ Validación de datos
- ✅ Manejo de errores
- ✅ Políticas RLS en BD

---

## 📈 RENDIMIENTO

- ✅ Sistema de caché con TTL
- ✅ Monitor de rendimiento
- ✅ Optimización de queries
- ✅ Lazy loading de componentes
- ✅ Code splitting automático

---

## 🐛 TROUBLESHOOTING

### Error de compilación
```bash
npm run build
```

### Limpiar caché
```bash
rm -rf .next
npm run build
```

### Verificar tipos TypeScript
```bash
npx tsc --noEmit
```

---

## 📚 DOCUMENTACIÓN ADICIONAL

- `POLITICAS_DESARROLLO_GEMODIDA.md` - Políticas de desarrollo
- `docs/guia/GEMODIDA_BusinessLogic_FULL.md` - Lógica de negocio
- `FASES_4_7_COMPLETADAS.md` - Resumen de fases completadas

---

## 🎓 EJEMPLOS DE USO

### Crear Promoción
```typescript
const { crear } = usePromociones();

await crear({
  nombre: 'Black Friday',
  descripcion: 'Descuento especial',
  tipo: 'porcentaje',
  valor: 50,
  estado: 'activa',
  fecha_inicio: '2025-12-01',
  fecha_fin: '2025-12-31',
  limite_uso: 1000
});
```

### Enviar Notificación
```typescript
const service = new NotificacionService();

await service.enviarNotificacion({
  titulo: 'Nueva Promoción',
  mensaje: 'Black Friday disponible',
  tipo: 'info',
  canal: 'push',
  usuario_id: 'user-1'
});
```

### Usar Caché
```typescript
import { cacheManager } from '@/lib/cache';

// Guardar en caché
cacheManager.set('promociones', data, 600);

// Recuperar del caché
const cached = cacheManager.get('promociones');
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Compilación exitosa
- [ ] Servidor iniciado en puerto 3003
- [ ] Acceso a /promociones
- [ ] Acceso a /reportes
- [ ] Notificaciones funcionando
- [ ] Caché operativo
- [ ] Monitor de rendimiento activo

---

## 📞 SOPORTE

Para reportar problemas o sugerencias:
1. Revisar documentación
2. Verificar compilación
3. Revisar logs de consola
4. Contactar al equipo de desarrollo

---

**¡Proyecto GEMODIDA listo para usar!** 🚀

**Responsable:** Amazon Q  
**Última actualización:** 2025-12-03  
**Versión:** 1.0
