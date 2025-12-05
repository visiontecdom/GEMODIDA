# FASE INMEDIATA: SISTEMA DE ENCUESTAS COMPLETO

**Duración:** 2 semanas  
**Prioridad:** CRÍTICA  
**Estado:** En progreso  
**Versión:** 1.0

---

## OBJETIVO GENERAL

Completar el sistema de encuestas con ciclo de vida completo (10 estados) y hacer funcionales todos los menús de navegación en todos los paneles.

---

## TAREA 1: CICLO DE VIDA COMPLETO DE ENCUESTAS

### Duración: 3 días

### Descripción
Implementar los 10 estados del ciclo de vida de encuestas con transiciones validadas, auditoría completa y funciones RPC.

### Estados del Ciclo de Vida
1. **Borrador** - Encuesta en creación
2. **Revisión** - Enviada para revisión
3. **Aprobación** - En proceso de aprobación
4. **Publicación** - Aprobada, lista para publicar
5. **Recolección** - Activa, recolectando respuestas
6. **Cierre** - Cerrada, sin más respuestas
7. **Validación** - En validación de datos
8. **Informe** - Generando informe
9. **Archivo** - Archivada

### Transiciones Válidas
```
Borrador → Revisión
Revisión → Borrador (rechazar)
Revisión → Aprobación
Aprobación → Revisión (rechazar)
Aprobación → Publicación
Publicación → Recolección
Recolección → Cierre
Cierre → Validación
Validación → Informe
Informe → Archivo
```

### Entregables

#### 1.1 Base de Datos
- [ ] Agregar columna `estado` a tabla `encuestas`
- [ ] Crear tabla `encuestas_historial_estados` para auditoría
- [ ] Crear función RPC `cambiar_estado_encuesta()`
- [ ] Crear función RPC `obtener_historial_estados()`
- [ ] Crear función RPC `validar_transicion_estado()`

**Archivos a modificar:**
- `db/scripts_sql/XX_ciclo_vida_encuestas.sql` (nuevo)

**SQL a ejecutar:**
```sql
-- Agregar columna estado
ALTER TABLE encuestas ADD COLUMN estado VARCHAR(20) DEFAULT 'borrador';

-- Crear tabla de historial
CREATE TABLE encuestas_historial_estados (
  id BIGSERIAL PRIMARY KEY,
  encuesta_id BIGINT REFERENCES encuestas(id),
  estado_anterior VARCHAR(20),
  estado_nuevo VARCHAR(20),
  usuario_id UUID REFERENCES auth.users(id),
  razon TEXT,
  fecha_cambio TIMESTAMP DEFAULT NOW()
);

-- Crear función para cambiar estado
CREATE OR REPLACE FUNCTION cambiar_estado_encuesta(
  p_encuesta_id BIGINT,
  p_estado_nuevo VARCHAR(20),
  p_razon TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_estado_actual VARCHAR(20);
  v_usuario_id UUID;
BEGIN
  -- Obtener estado actual
  SELECT estado INTO v_estado_actual FROM encuestas WHERE id = p_encuesta_id;
  
  -- Validar transición
  IF NOT validar_transicion_estado(v_estado_actual, p_estado_nuevo) THEN
    RETURN json_build_object('error', 'Transición no válida');
  END IF;
  
  -- Obtener usuario actual
  v_usuario_id := auth.uid();
  
  -- Actualizar estado
  UPDATE encuestas SET estado = p_estado_nuevo WHERE id = p_encuesta_id;
  
  -- Registrar en historial
  INSERT INTO encuestas_historial_estados 
  (encuesta_id, estado_anterior, estado_nuevo, usuario_id, razon)
  VALUES (p_encuesta_id, v_estado_actual, p_estado_nuevo, v_usuario_id, p_razon);
  
  RETURN json_build_object('success', true, 'estado_nuevo', p_estado_nuevo);
END;
$$ LANGUAGE plpgsql;

-- Crear función para validar transición
CREATE OR REPLACE FUNCTION validar_transicion_estado(
  p_estado_actual VARCHAR(20),
  p_estado_nuevo VARCHAR(20)
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN CASE
    WHEN p_estado_actual = 'borrador' AND p_estado_nuevo IN ('revisión', 'archivo') THEN true
    WHEN p_estado_actual = 'revisión' AND p_estado_nuevo IN ('borrador', 'aprobación') THEN true
    WHEN p_estado_actual = 'aprobación' AND p_estado_nuevo IN ('revisión', 'publicación') THEN true
    WHEN p_estado_actual = 'publicación' AND p_estado_nuevo = 'recolección' THEN true
    WHEN p_estado_actual = 'recolección' AND p_estado_nuevo = 'cierre' THEN true
    WHEN p_estado_actual = 'cierre' AND p_estado_nuevo = 'validación' THEN true
    WHEN p_estado_actual = 'validación' AND p_estado_nuevo = 'informe' THEN true
    WHEN p_estado_actual = 'informe' AND p_estado_nuevo = 'archivo' THEN true
    ELSE false
  END;
END;
$$ LANGUAGE plpgsql;
```

#### 1.2 Frontend - Componente de Cambio de Estado
**Archivo:** `src/components/encuestas/CambioEstadoEncuesta.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface CambioEstadoEncuestaProps {
  encuestaId: number;
  estadoActual: string;
  onEstadoCambiado: (nuevoEstado: string) => void;
}

const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  'borrador': ['revisión', 'archivo'],
  'revisión': ['borrador', 'aprobación'],
  'aprobación': ['revisión', 'publicación'],
  'publicación': ['recolección'],
  'recolección': ['cierre'],
  'cierre': ['validación'],
  'validación': ['informe'],
  'informe': ['archivo'],
};

const ETIQUETAS_ESTADO: Record<string, string> = {
  'borrador': 'Borrador',
  'revisión': 'Revisión',
  'aprobación': 'Aprobación',
  'publicación': 'Publicación',
  'recolección': 'Recolección',
  'cierre': 'Cierre',
  'validación': 'Validación',
  'informe': 'Informe',
  'archivo': 'Archivo',
};

export function CambioEstadoEncuesta({
  encuestaId,
  estadoActual,
  onEstadoCambiado,
}: CambioEstadoEncuestaProps) {
  const [abierto, setAbierto] = useState(false);
  const [estadoNuevo, setEstadoNuevo] = useState('');
  const [razon, setRazon] = useState('');
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();

  const transicionesDisponibles = TRANSICIONES_VALIDAS[estadoActual] || [];

  const handleCambiarEstado = async () => {
    if (!estadoNuevo) {
      toast({
        title: 'Error',
        description: 'Selecciona un nuevo estado',
        variant: 'destructive',
      });
      return;
    }

    setCargando(true);
    try {
      const response = await fetch('/api/encuestas/cambiar-estado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encuestaId,
          estadoNuevo,
          razon,
        }),
      });

      if (!response.ok) throw new Error('Error al cambiar estado');

      toast({
        title: 'Éxito',
        description: `Estado cambiado a ${ETIQUETAS_ESTADO[estadoNuevo]}`,
        variant: 'default',
      });

      onEstadoCambiado(estadoNuevo);
      setAbierto(false);
      setEstadoNuevo('');
      setRazon('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo cambiar el estado',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setAbierto(true)}
        variant="outline"
        size="sm"
      >
        Cambiar Estado
      </Button>

      <Dialog open={abierto} onOpenChange={setAbierto}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar Estado de Encuesta</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Estado Actual</label>
              <p className="text-sm text-gray-600">{ETIQUETAS_ESTADO[estadoActual]}</p>
            </div>

            <div>
              <label className="text-sm font-medium">Nuevo Estado</label>
              <select
                value={estadoNuevo}
                onChange={(e) => setEstadoNuevo(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecciona un estado</option>
                {transicionesDisponibles.map((estado) => (
                  <option key={estado} value={estado}>
                    {ETIQUETAS_ESTADO[estado]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Razón (opcional)</label>
              <Textarea
                value={razon}
                onChange={(e) => setRazon(e.target.value)}
                placeholder="Explica por qué cambias el estado..."
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setAbierto(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCambiarEstado}
                disabled={cargando}
              >
                {cargando ? 'Cambiando...' : 'Cambiar Estado'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

#### 1.3 API Route para Cambio de Estado
**Archivo:** `src/app/api/encuestas/cambiar-estado/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase/singleton';

export async function POST(request: NextRequest) {
  try {
    const { encuestaId, estadoNuevo, razon } = await request.json();

    const supabase = getSupabaseClient();

    const { data, error } = await supabase.rpc('cambiar_estado_encuesta', {
      p_encuesta_id: encuestaId,
      p_estado_nuevo: estadoNuevo,
      p_razon: razon,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

#### 1.4 Integración en Gestor de Encuestas
**Archivo:** `src/components/encuestas/GestorEncuestas.tsx` (modificar)

Agregar el componente `CambioEstadoEncuesta` en la vista de detalles de encuesta.

### Criterios de Aceptación
- [ ] Todas las transiciones funcionan correctamente
- [ ] No se pueden hacer transiciones inválidas
- [ ] Se registra quién y cuándo cambió el estado
- [ ] Los cambios se reflejan en tiempo real
- [ ] Se muestra historial de cambios

---

## TAREA 2: VALIDACIÓN DE CALIDAD DE ENCUESTAS

### Duración: 2 días

### Descripción
Implementar validador de estructura de encuestas con reglas por tipo de pregunta.

### Entregables

#### 2.1 Componente Validador
**Archivo:** `src/components/encuestas/ValidadorEncuesta.tsx`

```typescript
'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ValidadorEncuestaProps {
  estructura: any;
  onValidacionCompleta: (valida: boolean, errores: string[]) => void;
}

export function ValidadorEncuesta({
  estructura,
  onValidacionCompleta,
}: ValidadorEncuestaProps) {
  const [errores, setErrores] = useState<string[]>([]);
  const [valida, setValida] = useState(true);

  const validar = () => {
    const nuevosErrores: string[] = [];

    // Validar título
    if (!estructura.titulo || estructura.titulo.trim() === '') {
      nuevosErrores.push('El título de la encuesta es requerido');
    }

    // Validar descripción
    if (!estructura.descripcion || estructura.descripcion.trim() === '') {
      nuevosErrores.push('La descripción de la encuesta es requerida');
    }

    // Validar preguntas
    if (!estructura.preguntas || estructura.preguntas.length === 0) {
      nuevosErrores.push('La encuesta debe tener al menos una pregunta');
    }

    // Validar cada pregunta
    estructura.preguntas?.forEach((pregunta: any, index: number) => {
      if (!pregunta.texto || pregunta.texto.trim() === '') {
        nuevosErrores.push(`Pregunta ${index + 1}: El texto es requerido`);
      }

      if (pregunta.tipo === 'selección' || pregunta.tipo === 'múltiple') {
        if (!pregunta.opciones || pregunta.opciones.length < 2) {
          nuevosErrores.push(
            `Pregunta ${index + 1}: Debe tener al menos 2 opciones`
          );
        }
      }

      if (pregunta.tipo === 'escala') {
        if (!pregunta.minimo || !pregunta.maximo) {
          nuevosErrores.push(
            `Pregunta ${index + 1}: Debe definir mínimo y máximo`
          );
        }
      }
    });

    const esValida = nuevosErrores.length === 0;
    setErrores(nuevosErrores);
    setValida(esValida);
    onValidacionCompleta(esValida, nuevosErrores);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={validar}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Validar Encuesta
      </button>

      {errores.length === 0 && valida && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✓ La encuesta es válida y puede ser publicada
          </AlertDescription>
        </Alert>
      )}

      {errores.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-semibold mb-2">Errores encontrados:</div>
            <ul className="list-disc list-inside space-y-1">
              {errores.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

### Criterios de Aceptación
- [ ] Se detectan todas las inconsistencias
- [ ] Los errores son claros y accionables
- [ ] No se puede publicar con errores
- [ ] Se sugieren correcciones

---

## TAREA 3: EXPORTACIÓN DE RESULTADOS

### Duración: 2 días

### Descripción
Implementar exportación a CSV, Excel y PDF.

### Entregables

#### 3.1 Componente Exportador
**Archivo:** `src/components/encuestas/ExportadorResultados.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface ExportadorResultadosProps {
  encuestaId: number;
  encuestaNombre: string;
  resultados: any[];
}

export function ExportadorResultados({
  encuestaId,
  encuestaNombre,
  resultados,
}: ExportadorResultadosProps) {
  const [cargando, setCargando] = useState(false);
  const { toast } = useToast();

  const exportarCSV = () => {
    setCargando(true);
    try {
      const csv = convertirACSV(resultados);
      descargarArchivo(csv, `${encuestaNombre}.csv`, 'text/csv');
      toast({
        title: 'Éxito',
        description: 'Archivo CSV descargado',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar a CSV',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  const exportarExcel = async () => {
    setCargando(true);
    try {
      const response = await fetch('/api/encuestas/exportar-excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encuestaId, resultados }),
      });

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      descargarArchivo(blob, `${encuestaNombre}.xlsx`, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      toast({
        title: 'Éxito',
        description: 'Archivo Excel descargado',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar a Excel',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  const exportarPDF = async () => {
    setCargando(true);
    try {
      const response = await fetch('/api/encuestas/exportar-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encuestaId, resultados }),
      });

      if (!response.ok) throw new Error('Error al exportar');

      const blob = await response.blob();
      descargarArchivo(blob, `${encuestaNombre}.pdf`, 'application/pdf');
      toast({
        title: 'Éxito',
        description: 'Archivo PDF descargado',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar a PDF',
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={exportarCSV}
        disabled={cargando}
        variant="outline"
        size="sm"
      >
        <Download className="w-4 h-4 mr-2" />
        CSV
      </Button>
      <Button
        onClick={exportarExcel}
        disabled={cargando}
        variant="outline"
        size="sm"
      >
        <Download className="w-4 h-4 mr-2" />
        Excel
      </Button>
      <Button
        onClick={exportarPDF}
        disabled={cargando}
        variant="outline"
        size="sm"
      >
        <Download className="w-4 h-4 mr-2" />
        PDF
      </Button>
    </div>
  );
}

function convertirACSV(datos: any[]): string {
  if (datos.length === 0) return '';

  const headers = Object.keys(datos[0]);
  const csv = [
    headers.join(','),
    ...datos.map((row) =>
      headers.map((header) => JSON.stringify(row[header] || '')).join(',')
    ),
  ].join('\n');

  return csv;
}

function descargarArchivo(contenido: any, nombre: string, tipo: string) {
  const blob = contenido instanceof Blob ? contenido : new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nombre;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
```

### Criterios de Aceptación
- [ ] Los archivos se generan correctamente
- [ ] Los datos están completos y bien formateados
- [ ] Los gráficos se incluyen en PDF
- [ ] Las exportaciones se pueden programar

---

## TAREA 4: MENÚS FUNCIONALES EN TODOS LOS PANELES

### Duración: 3 días

### Descripción
Revisar todos los menús de todos los paneles y asegurar que todas las opciones sean funcionales.

### Checklist de Paneles

#### Panel de Administración
- [ ] Usuarios - CRUD funcional
- [ ] Roles - CRUD funcional
- [ ] Configuración - Formulario funcional
- [ ] Logs - Visualización funcional

#### Panel de Operaciones
- [ ] Encuestas - CRUD funcional
- [ ] Palabras Clave - CRUD funcional
- [ ] Resultados - Visualización funcional
- [ ] Actividades - CRUD funcional

#### Panel de Monitoreo
- [ ] Dashboard - Visualización funcional
- [ ] Alertas - CRUD funcional
- [ ] Reportes - Generación funcional

#### Panel de Promociones
- [ ] Campañas - CRUD funcional
- [ ] Actividades - CRUD funcional
- [ ] Presupuestos - Visualización funcional

### Entregables

#### 4.1 Auditoría de Menús
**Archivo:** `docs/PLAN_DESARROLLO_ETAPAS/AUDITORIA_MENUS.md`

Crear documento con estado de cada menú.

#### 4.2 Correcciones Necesarias
- [ ] Crear páginas CRUD faltantes
- [ ] Conectar menús a páginas
- [ ] Aplicar estilos consistentes

### Criterios de Aceptación
- [ ] Cada opción de menú navega a su página
- [ ] Las páginas CRUD están completas
- [ ] Los botones tienen efectos hover
- [ ] El diseño es consistente

---

## TAREA 5: DISEÑO VISUAL MEJORADO

### Duración: 2 días

### Descripción
Mejorar efectos visuales de menús y aplicar transiciones suaves.

### Entregables

#### 5.1 Componente de Botón de Menú Mejorado
**Archivo:** `src/components/shared/MenuButton.tsx`

```typescript
'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface MenuButtonProps {
  href: string;
  icon: ReactNode;
  label: string;
  active?: boolean;
}

export function MenuButton({ href, icon, label, active = false }: MenuButtonProps) {
  return (
    <Link href={href}>
      <div
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg
          transition-all duration-300 ease-in-out
          ${
            active
              ? 'bg-blue-600 text-white shadow-lg scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-500 hover:text-white hover:shadow-md hover:scale-105'
          }
          cursor-pointer
        `}
      >
        <div className="w-5 h-5">{icon}</div>
        <span className="font-medium">{label}</span>
      </div>
    </Link>
  );
}
```

#### 5.2 Estilos Globales Mejorados
**Archivo:** `src/app/globals.css` (agregar)

```css
/* Transiciones suaves */
* {
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
}

/* Efectos hover en botones */
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Efectos hover en enlaces */
a:hover {
  opacity: 0.9;
}

/* Animación de carga */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Criterios de Aceptación
- [ ] Los efectos son suaves y elegantes
- [ ] La navegación es intuitiva
- [ ] Funciona en todos los dispositivos
- [ ] El rendimiento no se ve afectado

---

## CHECKLIST DE COMPLETITUD

### Tarea 1: Ciclo de Vida
- [ ] Base de datos actualizada
- [ ] Funciones RPC creadas
- [ ] Componente de cambio de estado
- [ ] API route implementada
- [ ] Integración en gestor
- [ ] Tests pasando

### Tarea 2: Validación
- [ ] Componente validador
- [ ] Reglas de validación
- [ ] Integración en gestor
- [ ] Tests pasando

### Tarea 3: Exportación
- [ ] Exportador CSV
- [ ] Exportador Excel
- [ ] Exportador PDF
- [ ] API routes
- [ ] Tests pasando

### Tarea 4: Menús
- [ ] Auditoría completada
- [ ] Páginas CRUD creadas
- [ ] Menús conectados
- [ ] Estilos aplicados

### Tarea 5: Diseño
- [ ] Componentes mejorados
- [ ] Estilos globales
- [ ] Efectos visuales
- [ ] Responsividad verificada

---

## COMPILACIÓN Y TESTING

### Antes de Completar
```bash
npm run build
npm run lint
```

### Criterios de Éxito
- ✅ Compilación sin errores
- ✅ Linting sin warnings
- ✅ Todas las funcionalidades funcionan
- ✅ Diseño responsivo en todos los dispositivos

---

## PRÓXIMOS PASOS

1. **Ejecutar compilación** - `npm run build`
2. **Revisar 04_FASE_1_ACTIVIDADES_MONITOREO.md** - Siguiente fase
3. **Comenzar Fase 1** - Sistema de actividades

---

**Última actualización:** 2025-12-03
**Estado:** Documento de fase inmediata completo
