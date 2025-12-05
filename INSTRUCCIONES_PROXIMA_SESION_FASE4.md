# INSTRUCCIONES PARA PRÓXIMA SESIÓN - FASE 4
**Fecha:** 2025-12-03  
**Objetivo:** Completar FASE 4: Panel de Promociones  
**Duración estimada:** 8 días  
**Prioridad:** 🔴 CRÍTICA

---

## 📋 RESUMEN EJECUTIVO

En la próxima sesión vamos a implementar el **Panel de Promociones** completo con:
- ✅ CRUD de promociones
- ✅ Configuración de descuentos
- ✅ Motor de ejecución
- ✅ Monitoreo en tiempo real
- ✅ Análisis y reportes

---

## 🎯 OBJETIVO PRINCIPAL

Implementar un sistema completo de gestión de promociones que permita:
1. Crear y configurar promociones con reglas complejas
2. Ejecutar promociones de forma manual o automática
3. Monitorear aplicación en tiempo real
4. Analizar impacto y ROI

---

## 📁 ESTRUCTURA A CREAR

### Directorios
```bash
mkdir -p src/components/promociones
mkdir -p src/app/api/promociones
mkdir -p src/app/promociones
mkdir -p src/hooks
mkdir -p src/services
```

### Archivos a crear (15 archivos)

#### Componentes (src/components/promociones/)
1. **FormularioPromocion.tsx** - Crear/editar promociones
2. **ListaPromociones.tsx** - Tabla de promociones
3. **ConfiguradorDescuentos.tsx** - Configurar descuentos
4. **ValidadorReglas.tsx** - Validar reglas
5. **MotorPromociones.tsx** - Ejecutar promociones
6. **MonitorPromociones.tsx** - Monitoreo en tiempo real
7. **AlertasPromociones.tsx** - Sistema de alertas
8. **ReportesPromociones.tsx** - Reportes de impacto
9. **AnalisisROI.tsx** - Análisis de ROI
10. **ComparativasPromociones.tsx** - Comparativas

#### Servicios (src/services/)
11. **PromocioneService.ts** - Lógica de negocio

#### Hooks (src/hooks/)
12. **usePromociones.ts** - Hook de promociones

#### API Routes (src/app/api/promociones/)
13. **crear/route.ts** - POST crear
14. **actualizar/route.ts** - PUT actualizar
15. **listar/route.ts** - GET listar

#### Página (src/app/promociones/)
16. **page.tsx** - Página principal

---

## 🔧 ESTRUCTURA DE DATOS

### Tabla: promociones
```sql
CREATE TABLE promociones (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50), -- 'porcentaje', 'fijo', 'bogo'
  valor DECIMAL(10, 2),
  estado VARCHAR(50), -- 'borrador', 'activa', 'pausada', 'finalizada'
  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  limite_uso INTEGER,
  uso_actual INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: promocion_descuentos
```sql
CREATE TABLE promocion_descuentos (
  id SERIAL PRIMARY KEY,
  promocion_id INTEGER REFERENCES promociones(id),
  tipo_descuento VARCHAR(50), -- 'producto', 'categoria', 'total'
  valor_descuento DECIMAL(10, 2),
  cantidad_minima DECIMAL(10, 2),
  cantidad_maxima DECIMAL(10, 2)
);
```

### Tabla: promocion_restricciones
```sql
CREATE TABLE promocion_restricciones (
  id SERIAL PRIMARY KEY,
  promocion_id INTEGER REFERENCES promociones(id),
  tipo_restriccion VARCHAR(50), -- 'producto', 'categoria', 'cliente', 'horario'
  valor VARCHAR(255)
);
```

---

## 📝 TAREAS DETALLADAS

### TAREA 1: Crear Servicio de Promociones (2 horas)

**Archivo:** `src/services/PromocioneService.ts`

```typescript
export class PromocioneService {
  // Métodos necesarios:
  
  // 1. CRUD
  async crearPromocion(data: PromocionData): Promise<Promocion>
  async actualizarPromocion(id: number, data: Partial<PromocionData>): Promise<Promocion>
  async eliminarPromocion(id: number): Promise<void>
  async obtenerPromocion(id: number): Promise<Promocion>
  async listarPromociones(filtros?: FiltrosPromocion): Promise<Promocion[]>
  
  // 2. Validación
  async validarReglas(promocion: Promocion): Promise<ValidationResult>
  async validarDescuentos(descuentos: Descuento[]): Promise<ValidationResult>
  
  // 3. Ejecución
  async ejecutarPromocion(id: number): Promise<ExecutionResult>
  async pausarPromocion(id: number): Promise<void>
  async reanudarPromocion(id: number): Promise<void>
  
  // 4. Análisis
  async calcularROI(id: number): Promise<ROIAnalysis>
  async obtenerEstadisticas(id: number): Promise<Statistics>
  async compararPromociones(ids: number[]): Promise<Comparison>
}
```

---

### TAREA 2: Crear Hook usePromociones (1 hora)

**Archivo:** `src/hooks/usePromociones.ts`

```typescript
export function usePromociones() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Métodos:
  const crearPromocion = async (data: PromocionData) => { }
  const actualizarPromocion = async (id: number, data: Partial<PromocionData>) => { }
  const eliminarPromocion = async (id: number) => { }
  const listarPromociones = async (filtros?: FiltrosPromocion) => { }
  const ejecutarPromocion = async (id: number) => { }
  const pausarPromocion = async (id: number) => { }
  
  return {
    promociones,
    loading,
    error,
    crearPromocion,
    actualizarPromocion,
    eliminarPromocion,
    listarPromociones,
    ejecutarPromocion,
    pausarPromocion
  };
}
```

---

### TAREA 3: Crear Componentes UI (4 horas)

#### 3.1 FormularioPromocion.tsx
- Formulario para crear/editar promociones
- Campos: nombre, descripción, tipo, valor, fechas, límites
- Validación con Zod
- Integración con usePromociones

#### 3.2 ListaPromociones.tsx
- Tabla de promociones con DataTable
- Columnas: nombre, tipo, estado, uso, acciones
- Filtros por estado, tipo, fecha
- Acciones: editar, eliminar, ejecutar

#### 3.3 ConfiguradorDescuentos.tsx
- Configurar descuentos por producto/categoría
- Agregar/eliminar descuentos
- Validación de montos

#### 3.4 MotorPromociones.tsx
- Seleccionar promoción
- Botón ejecutar
- Mostrar resultado
- Alertas de éxito/error

#### 3.5 MonitorPromociones.tsx
- Gráfico de uso en tiempo real
- Estadísticas: total aplicado, uso actual, límite
- Alertas de límites alcanzados

#### 3.6 ReportesPromociones.tsx
- Tabla de resultados
- Gráficos de impacto
- Exportar a CSV/PDF

---

### TAREA 4: Crear API Routes (2 horas)

#### 4.1 POST /api/promociones/crear
```typescript
// Recibe: PromocionData
// Retorna: { success: boolean, promocion: Promocion, error?: string }
```

#### 4.2 PUT /api/promociones/actualizar
```typescript
// Recibe: { id: number, data: Partial<PromocionData> }
// Retorna: { success: boolean, promocion: Promocion, error?: string }
```

#### 4.3 GET /api/promociones/listar
```typescript
// Query params: estado?, tipo?, fecha_inicio?, fecha_fin?
// Retorna: { success: boolean, promociones: Promocion[], error?: string }
```

#### 4.4 POST /api/promociones/ejecutar
```typescript
// Recibe: { id: number }
// Retorna: { success: boolean, resultado: ExecutionResult, error?: string }
```

---

### TAREA 5: Crear Página Principal (1 hora)

**Archivo:** `src/app/promociones/page.tsx`

```typescript
'use client';

export default function PromocionesPage() {
  const [tab, setTab] = useState('lista');
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1>Gestión de Promociones</h1>
        
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="lista">Lista</TabsTrigger>
            <TabsTrigger value="crear">Crear</TabsTrigger>
            <TabsTrigger value="ejecutar">Ejecutar</TabsTrigger>
            <TabsTrigger value="monitoreo">Monitoreo</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="lista">
            <ListaPromociones />
          </TabsContent>
          
          <TabsContent value="crear">
            <FormularioPromocion />
          </TabsContent>
          
          <TabsContent value="ejecutar">
            <MotorPromociones />
          </TabsContent>
          
          <TabsContent value="monitoreo">
            <MonitorPromociones />
          </TabsContent>
          
          <TabsContent value="reportes">
            <ReportesPromociones />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
```

---

## 🔍 CHECKLIST DE IMPLEMENTACIÓN

### Día 1-2: Servicio y Hook
- [ ] Crear PromocioneService.ts
- [ ] Crear usePromociones.ts
- [ ] Crear tipos TypeScript
- [ ] Compilar sin errores

### Día 3-4: Componentes Básicos
- [ ] FormularioPromocion.tsx
- [ ] ListaPromociones.tsx
- [ ] ConfiguradorDescuentos.tsx
- [ ] Compilar sin errores

### Día 5-6: Componentes Avanzados
- [ ] MotorPromociones.tsx
- [ ] MonitorPromociones.tsx
- [ ] AlertasPromociones.tsx
- [ ] Compilar sin errores

### Día 7: API Routes y Página
- [ ] Crear API routes
- [ ] Crear página principal
- [ ] Integrar componentes
- [ ] Compilar sin errores

### Día 8: Testing y Ajustes
- [ ] Probar CRUD completo
- [ ] Probar ejecución
- [ ] Probar monitoreo
- [ ] Ajustes finales

---

## 🚀 COMANDOS A EJECUTAR

### Crear directorios
```bash
mkdir -p src/components/promociones
mkdir -p src/app/api/promociones/crear
mkdir -p src/app/api/promociones/actualizar
mkdir -p src/app/api/promociones/listar
mkdir -p src/app/api/promociones/ejecutar
mkdir -p src/app/promociones
```

### Compilar después de cada cambio
```bash
npm run build
```

### Iniciar servidor de desarrollo
```bash
npm run dev
```

---

## 📊 TIPOS TYPESCRIPT A DEFINIR

```typescript
// Tipos principales
interface Promocion {
  id: number;
  nombre: string;
  descripcion?: string;
  tipo: 'porcentaje' | 'fijo' | 'bogo';
  valor: number;
  estado: 'borrador' | 'activa' | 'pausada' | 'finalizada';
  fecha_inicio: Date;
  fecha_fin: Date;
  limite_uso: number;
  uso_actual: number;
  created_at: Date;
  updated_at: Date;
}

interface PromocionData {
  nombre: string;
  descripcion?: string;
  tipo: 'porcentaje' | 'fijo' | 'bogo';
  valor: number;
  fecha_inicio: Date;
  fecha_fin: Date;
  limite_uso: number;
}

interface Descuento {
  tipo_descuento: 'producto' | 'categoria' | 'total';
  valor_descuento: number;
  cantidad_minima?: number;
  cantidad_maxima?: number;
}

interface ExecutionResult {
  success: boolean;
  promocion_id: number;
  aplicaciones: number;
  monto_total: number;
  timestamp: Date;
}

interface ROIAnalysis {
  promocion_id: number;
  inversion: number;
  retorno: number;
  roi_porcentaje: number;
  periodo: string;
}
```

---

## 🔗 REFERENCIAS IMPORTANTES

### Documentos relacionados
- `RESUMEN_ESTADO_ACTUAL.md` - Estado actual del proyecto
- `PLAN_ACCION_PROXIMAS_FASES.md` - Plan completo de fases 4-7
- `POLITICAS_DESARROLLO_GEMODIDA.md` - Políticas de desarrollo
- `docs/guia/GEMODIDA_BusinessLogic_FULL.md` - Lógica de negocio

### Componentes existentes a reutilizar
- `DataTable.tsx` - Para mostrar listas
- `FormDialog.tsx` - Para formularios
- `Button.tsx` - Botones
- `Input.tsx` - Inputs
- `Textarea.tsx` - Áreas de texto
- `Card.tsx` - Tarjetas
- `Tabs.tsx` - Pestañas

### Hooks existentes
- `useAuth()` - Autenticación
- `useToast()` - Notificaciones
- `useSupabase()` - Base de datos

---

## ⚠️ CONSIDERACIONES IMPORTANTES

1. **Compilación:** Ejecutar `npm run build` después de cada cambio
2. **Tipos:** Definir todos los tipos TypeScript antes de implementar
3. **Validación:** Usar Zod para validar datos
4. **Errores:** Manejar errores con try-catch y mostrar toasts
5. **Base de datos:** Usar Supabase client singleton
6. **Seguridad:** Validar permisos en API routes

---

## 📞 SOPORTE

Si encuentras problemas:
1. Revisar compilación: `npm run build`
2. Revisar tipos TypeScript
3. Revisar políticas de desarrollo
4. Revisar documentación de lógica de negocio

---

**Estado:** 📋 LISTO PARA IMPLEMENTAR  
**Responsable:** Amazon Q  
**Fecha de inicio:** 2025-12-04  
**Fecha de finalización estimada:** 2025-12-12  
**Próxima revisión:** Después de completar FASE 4
