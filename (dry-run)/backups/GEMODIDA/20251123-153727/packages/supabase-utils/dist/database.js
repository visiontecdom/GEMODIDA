"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
exports.createService = createService;
const config_1 = require("./config");
const supabase = config_1.supabaseConfig.getSupabaseClient();
class DatabaseService {
    constructor(tableName, useServiceRole = false) {
        this.tableName = tableName;
        this.supabase = useServiceRole
            ? config_1.supabaseConfig.getServiceClient()
            : config_1.supabaseConfig.getSupabaseClient();
    }
    // Método para construir consultas con filtros
    buildQuery(query, // Usamos 'any' temporalmente para evitar errores de tipo
    options) {
        let q = query.select((options === null || options === void 0 ? void 0 : options.select) || '*');
        // Aplicar filtros
        if ((options === null || options === void 0 ? void 0 : options.filters) && options.filters.length > 0) {
            options.filters.forEach(filter => {
                const { column, operator, value } = filter;
                const columnName = column;
                switch (operator) {
                    case 'eq':
                        q = q.eq(columnName, value);
                        break;
                    case 'neq':
                        q = q.neq(columnName, value);
                        break;
                    case 'gt':
                        q = q.gt(columnName, value);
                        break;
                    case 'lt':
                        q = q.lt(columnName, value);
                        break;
                    case 'gte':
                        q = q.gte(columnName, value);
                        break;
                    case 'lte':
                        q = q.lte(columnName, value);
                        break;
                    case 'like':
                        q = q.like(columnName, `%${value}%`);
                        break;
                    case 'ilike':
                        q = q.ilike(columnName, `%${value}%`);
                        break;
                    case 'in':
                        q = q.in(columnName, value);
                        break;
                    case 'is':
                        q = q.is(columnName, value);
                        break;
                }
            });
        }
        // Aplicar ordenación
        if (options === null || options === void 0 ? void 0 : options.orderBy) {
            const { column, ascending } = options.orderBy;
            q = q.order(column, { ascending });
        }
        // Aplicar paginación
        if (options === null || options === void 0 ? void 0 : options.pagination) {
            const { page = 1, pageSize = 10 } = options.pagination;
            const from = (page - 1) * pageSize;
            const to = from + pageSize - 1;
            q = q.range(from, to);
        }
        return q;
    }
    // Obtener múltiples registros
    async find(options) {
        try {
            let query = this.supabase.from(this.tableName).select('*');
            if (options) {
                query = this.buildQuery(query, options);
            }
            const { data, error } = await query;
            return {
                data: data,
                error,
                status: error ? 500 : 200,
                statusText: error ? error.message : 'OK',
            };
        }
        catch (error) {
            return {
                data: null,
                error: error,
                status: 500,
                statusText: 'Error interno del servidor',
            };
        }
    }
    // Obtener un registro por ID
    async findById(id) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .select('*')
                .eq('id', id)
                .single();
            return {
                data: data,
                error,
                status: error ? 404 : 200,
                statusText: error ? error.message : 'OK',
            };
        }
        catch (error) {
            return {
                data: null,
                error: error,
                status: 500,
                statusText: 'Error interno del servidor',
            };
        }
    }
    // Crear un nuevo registro
    async create(item) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .insert([item])
                .select()
                .single();
            return {
                data: data,
                error,
                status: error ? 400 : 201,
                statusText: error ? error.message : 'Creado correctamente',
            };
        }
        catch (error) {
            return {
                data: null,
                error: error,
                status: 500,
                statusText: 'Error al crear el registro',
            };
        }
    }
    // Actualizar un registro existente
    async update(id, updates) {
        try {
            const { data, error } = await this.supabase
                .from(this.tableName)
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();
            return {
                data: data,
                error,
                status: error ? 400 : 200,
                statusText: error ? error.message : 'Actualizado correctamente',
            };
        }
        catch (error) {
            return {
                data: null,
                error: error,
                status: 500,
                statusText: 'Error al actualizar el registro',
            };
        }
    }
    // Eliminar un registro
    async delete(id) {
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
        }
        catch (error) {
            return {
                data: false,
                error: error,
                status: 500,
                statusText: 'Error al eliminar el registro',
            };
        }
    }
    // Contar registros con filtros opcionales
    async count(filters) {
        try {
            let query = this.supabase
                .from(this.tableName)
                .select('*', { count: 'exact', head: true });
            if (filters && filters.length > 0) {
                filters.forEach(filter => {
                    const { column, operator, value } = filter;
                    const columnName = column;
                    switch (operator) {
                        case 'eq':
                            query = query.eq(columnName, value);
                            break;
                        case 'neq':
                            query = query.neq(columnName, value);
                            break;
                        case 'gt':
                            query = query.gt(columnName, value);
                            break;
                        case 'lt':
                            query = query.lt(columnName, value);
                            break;
                        case 'gte':
                            query = query.gte(columnName, value);
                            break;
                        case 'lte':
                            query = query.lte(columnName, value);
                            break;
                        case 'like':
                            query = query.like(columnName, `%${value}%`);
                            break;
                        case 'ilike':
                            query = query.ilike(columnName, `%${value}%`);
                            break;
                        case 'in':
                            query = query.in(columnName, value);
                            break;
                        case 'is':
                            query = query.is(columnName, value);
                            break;
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
        }
        catch (error) {
            return {
                data: 0,
                error: error,
                status: 500,
                statusText: 'Error al contar los registros',
            };
        }
    }
}
exports.DatabaseService = DatabaseService;
// Función de ayuda para crear un servicio de base de datos
function createService(tableName) {
    return new DatabaseService(tableName);
}
