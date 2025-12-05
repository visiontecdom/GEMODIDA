import { createClient } from '@supabase/supabase-js';

export interface Promocion {
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
  created_at?: string;
  updated_at?: string;
}

export class PromocioneService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  async crearPromocion(data: Promocion): Promise<Promocion> {
    const { data: result, error } = await this.supabase
      .from('promociones')
      .insert([data])
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  async actualizarPromocion(id: number, data: Partial<Promocion>): Promise<Promocion> {
    const { data: result, error } = await this.supabase
      .from('promociones')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return result;
  }

  async eliminarPromocion(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('promociones')
      .delete()
      .eq('id', id);
    if (error) throw error;
  }

  async obtenerPromocion(id: number): Promise<Promocion> {
    const { data, error } = await this.supabase
      .from('promociones')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }

  async listarPromociones(filtros?: Record<string, any>): Promise<Promocion[]> {
    let query = this.supabase.from('promociones').select('*');
    
    if (filtros?.estado) query = query.eq('estado', filtros.estado);
    if (filtros?.tipo) query = query.eq('tipo', filtros.tipo);
    if (filtros?.fecha_inicio) query = query.gte('fecha_inicio', filtros.fecha_inicio);
    if (filtros?.fecha_fin) query = query.lte('fecha_fin', filtros.fecha_fin);

    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async validarReglas(promocion: Promocion): Promise<boolean> {
    if (promocion.valor <= 0) throw new Error('El valor debe ser mayor a 0');
    if (new Date(promocion.fecha_inicio) >= new Date(promocion.fecha_fin)) {
      throw new Error('La fecha de inicio debe ser anterior a la fecha de fin');
    }
    if (promocion.limite_uso < 0) throw new Error('El límite de uso no puede ser negativo');
    return true;
  }

  async ejecutarPromocion(id: number): Promise<{ success: boolean; aplicaciones: number }> {
    const promo = await this.obtenerPromocion(id);
    
    if (promo.estado !== 'activa') {
      throw new Error('La promoción no está activa');
    }
    
    if (promo.uso_actual! >= promo.limite_uso) {
      throw new Error('Se ha alcanzado el límite de uso');
    }

    await this.actualizarPromocion(id, {
      uso_actual: (promo.uso_actual || 0) + 1
    });

    return { success: true, aplicaciones: (promo.uso_actual || 0) + 1 };
  }

  async calcularROI(id: number): Promise<{ roi: number; inversion: number; retorno: number }> {
    const promo = await this.obtenerPromocion(id);
    const inversion = promo.valor * promo.uso_actual!;
    const retorno = inversion * 1.5; // Simulado
    const roi = ((retorno - inversion) / inversion) * 100;
    return { roi, inversion, retorno };
  }
}
