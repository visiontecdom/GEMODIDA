// Usando los tipos de Supabase directamente
import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';
import type { FilterCondition, QueryOptions, SupabaseResponse } from './types';

const supabase = supabaseConfig.getSupabaseClient();

export class DatabaseService<T extends Record<string, any>> {
  private tableName: string;
  private supabase: ReturnType<typeof supabaseConfig.getSupabaseClient>;

  constructor(tableName: string, useServiceRole = false) {
    this.tableName = tableName;
    this.supabase = useServiceRole 
      ? supabaseConfig.getServiceClient() 
      : supabaseConfig.getSupabaseClient();
  }

  // Método para construir consultas con filtros
  private buildQuery(
    query: any, // Usamos 'any' temporalmente para evitar errores de tipo
    options?: QueryOptions<T>
  ): any {
    let q = query.select(options?.select || '*');

    // Aplicar filtros
    if (options?.filters && options.filters.length > 0) {
      options.filters.forEach(filter => {
        const { column, operator, value } = filter;
        const columnName = column as string;
        
        switch (operator) {
          case 'eq': q = q.eq(columnName, value); break;
          case 'neq': q = q.neq(columnName, value); break;
          case 'gt': q = q.gt(columnName, value); break;
          case 'lt': q = q.lt(columnName, value); break;
          case 'gte': q = q.gte(columnName, value); break;
          case 'lte': q = q.lte(columnName, value); break;
          case 'like': q = q.like(columnName, `%${value}%`); break;
          case 'ilike': q = q.ilike(columnName, `%${value}%`); break;
          case 'in': q = q.in(columnName, value); break;
          case 'is': q = q.is(columnName, value); break;
        }
      });
    }

    // Aplicar ordenación
    if (options?.orderBy) {
      const { column, ascending } = options.orderBy;
      q = q.order(column as string, { ascending });
    }

    // Aplicar paginación
    if (options?.pagination) {
      const { page = 1, pageSize = 10 } = options.pagination;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      q = q.range(from, to);
    }

    return q;
  }

  // Obtener múltiples registros
  async find(options?: QueryOptions<T>): Promise<SupabaseResponse<T[]>> {
    try {
      let query = this.supabase.from(this.tableName).select('*');
      
      if (options) {
        query = this.buildQuery(query, options);
      }
      
      const { data, error } = await query;
      
      return {
        data: data as T[],
        error,
        status: error ? 500 : 200,
        statusText: error ? error.message : 'OK',
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        status: 500,
        statusText: 'Error interno del servidor',
      };
    }
  }

  // Obtener un registro por ID
  async findById(id: string | number): Promise<SupabaseResponse<T>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      return {
        data: data as T,
        error,
        status: error ? 404 : 200,
        statusText: error ? error.message : 'OK',
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        status: 500,
        statusText: 'Error interno del servidor',
      };
    }
  }

  // Crear un nuevo registro
  async create(item: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseResponse<T>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert([item])
        .select()
        .single();

      return {
        data: data as T,
        error,
        status: error ? 400 : 201,
        statusText: error ? error.message : 'Creado correctamente',
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        status: 500,
        statusText: 'Error al crear el registro',
      };
    }
  }

  // Actualizar un registro existente
  async update(
    id: string | number, 
    updates: Partial<Omit<T, 'id' | 'created_at'>>
  ): Promise<SupabaseResponse<T>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      return {
        data: data as T,
        error,
        status: error ? 400 : 200,
        statusText: error ? error.message : 'Actualizado correctamente',
      };
    } catch (error) {
      return {
        data: null,
        error: error as Error,
        status: 500,
        statusText: 'Error al actualizar el registro',
      };
    }
  }

  // Eliminar un registro
  async delete(id: string | number): Promise<SupabaseResponse<boolean>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      return {
        data: !error,
        error,
        status: error ? 400 : 200,
        statusText: error ? error.message : 'Eliminado correctamente',
      };
    } catch (error) {
      return {
        data: false,
        error: error as Error,
        status: 500,
        statusText: 'Error al eliminar el registro',
      };
    }
  }

  // Contar registros con filtros opcionales
  async count(filters?: FilterCondition<T>[]): Promise<SupabaseResponse<number>> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (filters && filters.length > 0) {
        filters.forEach(filter => {
          const { column, operator, value } = filter;
          const columnName = column as string;
          
          switch (operator) {
            case 'eq': query = query.eq(columnName, value); break;
            case 'neq': query = query.neq(columnName, value); break;
            case 'gt': query = query.gt(columnName, value); break;
            case 'lt': query = query.lt(columnName, value); break;
            case 'gte': query = query.gte(columnName, value); break;
            case 'lte': query = query.lte(columnName, value); break;
            case 'like': query = query.like(columnName, `%${value}%`); break;
            case 'ilike': query = query.ilike(columnName, `%${value}%`); break;
            case 'in': query = query.in(columnName, value); break;
            case 'is': query = query.is(columnName, value); break;
          }
        });
      }

      const { count, error } = await query;

      return {
        data: count || 0,
        error,
        status: error ? 400 : 200,
        statusText: error ? error.message : 'OK',
      };
    } catch (error) {
      return {
        data: 0,
        error: error as Error,
        status: 500,
        statusText: 'Error al contar los registros',
      };
    }
  }
}

// Función de ayuda para crear un servicio de base de datos
export function createService<T extends Record<string, any>>(tableName: string) {
  return new DatabaseService<T>(tableName);
}
