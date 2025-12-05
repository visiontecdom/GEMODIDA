# FASE 1: SISTEMA DE ACTIVIDADES Y MONITOREO - INICIO RÁPIDO

**Duración:** 2 semanas (Semanas 3-4)  
**Prioridad:** ALTA  
**Estado:** Listo para iniciar  
**Versión:** 1.0

---

## OBJETIVO GENERAL

Implementar el sistema completo de registro, seguimiento y análisis de actividades con integración a planificación y monitoreo en tiempo real.

---

## TAREA 1: UI PARA REGISTRO DE ACTIVIDADES

### Duración: 3 días

### Descripción
Crear formulario completo para registrar actividades con captura de evidencias, geolocalización y validaciones.

### Entregables

#### 1.1 Componente FormularioRegistroActividad.tsx
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

interface RegistroActividadProps {
  planificacionId?: number;
  onActividadRegistrada?: (actividad: any) => void;
}

export function FormularioRegistroActividad({
  planificacionId,
  onActividadRegistrada,
}: RegistroActividadProps) {
  const [cargando, setCargando] = useState(false);
  const [ubicacion, setUbicacion] = useState<{ lat: number; lng: number } | null>(null);
  const { toast } = useToast();

  const tiposActividad = [
    'Visita',
    'Llamada',
    'Reunión',
    'Entrega',
    'Seguimiento',
    'Capacitación',
    'Otro',
  ];

  const obtenerUbicacion = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        setUbicacion({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        toast({
          title: 'Ubicación',
          description: 'Ubicación capturada correctamente',
        });
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);

    try {
      const formData = new FormData(e.currentTarget);
      const actividad = {
        tipo: formData.get('tipo'),
        descripcion: formData.get('descripcion'),
        resultado: formData.get('resultado'),
        planificacionId,
        ubicacion,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('/api/actividades/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actividad),
      });

      if (!response.ok) throw new Error('Error al registrar');

      toast({
        title: 'Éxito',
        description: 'Actividad registrada correctamente',
      });

      onActividadRegistrada?.(actividad);
      e.currentTarget.reset();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Tipo de Actividad</label>
        <select
          name="tipo"
          required
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="">Selecciona un tipo</option>
          {tiposActividad.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Descripción</label>
        <Textarea
          name="descripcion"
          placeholder="Describe la actividad..."
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Resultado</label>
        <Textarea
          name="resultado"
          placeholder="¿Cuál fue el resultado?"
          required
        />
      </div>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={obtenerUbicacion}
          variant="outline"
        >
          📍 Capturar Ubicación
        </Button>
        {ubicacion && (
          <span className="text-sm text-green-600">
            ✓ Ubicación: {ubicacion.lat.toFixed(4)}, {ubicacion.lng.toFixed(4)}
          </span>
        )}
      </div>

      <Button type="submit" disabled={cargando}>
        {cargando ? 'Registrando...' : 'Registrar Actividad'}
      </Button>
    </form>
  );
}
```

#### 1.2 API Route /api/actividades/registrar
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const actividad = await request.json();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const { data, error } = await supabase
      .from('actividades')
      .insert([actividad])
      .select();

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

### Criterios de Aceptación
- [ ] Formulario completo y funcional
- [ ] Captura de geolocalización
- [ ] Validaciones en cliente y servidor
- [ ] Evidencias se guardan correctamente
- [ ] Mensajes de error claros

---

## TAREA 2: SEGUIMIENTO DE ACTIVIDADES

### Duración: 3 días

### Descripción
Crear dashboard de actividades con filtros, estadísticas y búsqueda avanzada.

### Entregables

#### 2.1 Hook useActividades
```typescript
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

export function useActividades() {
  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtros, setFiltros] = useState({
    tipo: '',
    fechaInicio: '',
    fechaFin: '',
    estado: '',
  });

  useEffect(() => {
    cargarActividades();
  }, [filtros]);

  const cargarActividades = async () => {
    setCargando(true);
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );

      let query = supabase.from('actividades').select('*');

      if (filtros.tipo) query = query.eq('tipo', filtros.tipo);
      if (filtros.estado) query = query.eq('estado', filtros.estado);
      if (filtros.fechaInicio) {
        query = query.gte('fecha', filtros.fechaInicio);
      }
      if (filtros.fechaFin) {
        query = query.lte('fecha', filtros.fechaFin);
      }

      const { data, error } = await query.order('fecha', { ascending: false });

      if (error) throw error;
      setActividades(data || []);
    } finally {
      setCargando(false);
    }
  };

  return {
    actividades,
    cargando,
    filtros,
    setFiltros,
    cargarActividades,
  };
}
```

#### 2.2 Componente DashboardActividades.tsx
```typescript
'use client';

import { useActividades } from '@/hooks/useActividades';
import { DataTable } from '@/components/shared/DataTable';
import { FilterBar } from '@/components/shared/FilterBar';

export function DashboardActividades() {
  const { actividades, cargando, filtros, setFiltros } = useActividades();

  const columnas = [
    { key: 'tipo', label: 'Tipo' },
    { key: 'descripcion', label: 'Descripción' },
    { key: 'resultado', label: 'Resultado' },
    { key: 'fecha', label: 'Fecha' },
    { key: 'estado', label: 'Estado' },
  ];

  return (
    <div className="space-y-4">
      <FilterBar
        filtros={filtros}
        onFiltrosChange={setFiltros}
        opciones={{
          tipo: ['Visita', 'Llamada', 'Reunión', 'Entrega', 'Seguimiento'],
          estado: ['Pendiente', 'En Progreso', 'Completada', 'Cancelada'],
        }}
      />

      <DataTable
        columnas={columnas}
        datos={actividades}
        cargando={cargando}
      />
    </div>
  );
}
```

### Criterios de Aceptación
- [ ] Dashboard muestra todas las actividades
- [ ] Filtros funcionan correctamente
- [ ] Búsqueda es rápida
- [ ] Estadísticas se calculan correctamente
- [ ] Gráficos se renderizan bien

---

## TAREA 3: INTEGRACIÓN CON PLANIFICACIÓN

### Duración: 2 días

### Descripción
Vincular actividades con planificaciones y actualizar progreso automáticamente.

### Entregables

#### 3.1 Función RPC vincular_actividad_planificacion
```sql
CREATE OR REPLACE FUNCTION vincular_actividad_planificacion(
  p_actividad_id BIGINT,
  p_planificacion_id BIGINT
) RETURNS JSON AS $$
BEGIN
  UPDATE actividades 
  SET planificacion_id = p_planificacion_id 
  WHERE id = p_actividad_id;

  -- Actualizar progreso de planificación
  UPDATE planificaciones 
  SET progreso = (
    SELECT COUNT(*) * 100 / NULLIF(total_actividades, 0)
    FROM actividades 
    WHERE planificacion_id = p_planificacion_id 
    AND estado = 'completada'
  )
  WHERE id = p_planificacion_id;

  RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;
```

#### 3.2 Sistema de Notificaciones
- Alertas cuando actividades vencen
- Notificaciones de progreso
- Recordatorios automáticos

### Criterios de Aceptación
- [ ] Actividades se vinculan correctamente
- [ ] Progreso se actualiza automáticamente
- [ ] Alertas se envían a tiempo
- [ ] Notificaciones son claras

---

## CHECKLIST DE COMPLETITUD

### Tarea 1: Registro de Actividades
- [ ] Formulario completo
- [ ] Captura de geolocalización
- [ ] Validaciones
- [ ] API route funcional
- [ ] Tests pasando

### Tarea 2: Seguimiento
- [ ] Dashboard funcional
- [ ] Filtros operativos
- [ ] Búsqueda rápida
- [ ] Estadísticas correctas
- [ ] Gráficos renderizados

### Tarea 3: Integración
- [ ] Vinculación funcional
- [ ] Progreso actualizado
- [ ] Alertas enviadas
- [ ] Notificaciones claras
- [ ] Tests pasando

---

## COMPILACIÓN Y TESTING

```bash
npm run build
npm run lint
```

---

## PRÓXIMOS PASOS

1. Crear estructura de base de datos para actividades
2. Implementar Tarea 1 (Registro)
3. Implementar Tarea 2 (Seguimiento)
4. Implementar Tarea 3 (Integración)
5. Compilar y validar
6. Pasar a Fase 2

---

**Última actualización:** 2025-12-03  
**Estado:** Listo para iniciar  
**Responsable:** Amazon Q
