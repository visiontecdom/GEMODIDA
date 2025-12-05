import { createClient } from '@supabase/supabase-js';

export interface KPI {
  id: string;
  nombre: string;
  valor: number;
  meta: number;
  porcentaje: number;
  tendencia: 'up' | 'down' | 'stable';
}

export class KPIService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  async calcularKPIs(): Promise<KPI[]> {
    const kpis: KPI[] = [];

    // KPI: Promociones Activas
    const { data: promos } = await this.supabase
      .from('promociones')
      .select('*')
      .eq('estado', 'activa');
    
    kpis.push({
      id: 'promos_activas',
      nombre: 'Promociones Activas',
      valor: promos?.length || 0,
      meta: 10,
      porcentaje: ((promos?.length || 0) / 10) * 100,
      tendencia: 'up'
    });

    // KPI: Encuestas Completadas
    const { data: encuestas } = await this.supabase
      .from('encuestas')
      .select('*')
      .eq('estado', 'completada');
    
    kpis.push({
      id: 'encuestas_completadas',
      nombre: 'Encuestas Completadas',
      valor: encuestas?.length || 0,
      meta: 50,
      porcentaje: ((encuestas?.length || 0) / 50) * 100,
      tendencia: 'up'
    });

    // KPI: Tareas Completadas
    const { data: tareas } = await this.supabase
      .from('tareas')
      .select('*')
      .eq('estado', 'completada');
    
    kpis.push({
      id: 'tareas_completadas',
      nombre: 'Tareas Completadas',
      valor: tareas?.length || 0,
      meta: 100,
      porcentaje: ((tareas?.length || 0) / 100) * 100,
      tendencia: 'stable'
    });

    return kpis;
  }

  async obtenerMetricas(periodo: 'dia' | 'semana' | 'mes'): Promise<Record<string, number>> {
    const ahora = new Date();
    let desde = new Date();

    if (periodo === 'dia') desde.setDate(ahora.getDate() - 1);
    else if (periodo === 'semana') desde.setDate(ahora.getDate() - 7);
    else desde.setMonth(ahora.getMonth() - 1);

    const { data: actividades } = await this.supabase
      .from('actividades')
      .select('*')
      .gte('created_at', desde.toISOString());

    return {
      total_actividades: actividades?.length || 0,
      usuarios_activos: new Set(actividades?.map(a => a.usuario_id)).size || 0,
      promedio_por_usuario: (actividades?.length || 0) / (new Set(actividades?.map(a => a.usuario_id)).size || 1)
    };
  }
}
