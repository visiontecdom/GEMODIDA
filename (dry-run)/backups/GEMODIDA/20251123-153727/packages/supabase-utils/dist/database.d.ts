import type { FilterCondition, QueryOptions, SupabaseResponse } from './types';
export declare class DatabaseService<T extends Record<string, any>> {
    private tableName;
    private supabase;
    constructor(tableName: string, useServiceRole?: boolean);
    private buildQuery;
    find(options?: QueryOptions<T>): Promise<SupabaseResponse<T[]>>;
    findById(id: string | number): Promise<SupabaseResponse<T>>;
    create(item: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<SupabaseResponse<T>>;
    update(id: string | number, updates: Partial<Omit<T, 'id' | 'created_at'>>): Promise<SupabaseResponse<T>>;
    delete(id: string | number): Promise<SupabaseResponse<boolean>>;
    count(filters?: FilterCondition<T>[]): Promise<SupabaseResponse<number>>;
}
export declare function createService<T extends Record<string, any>>(tableName: string): DatabaseService<T>;
