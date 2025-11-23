export type SupabaseResponse<T> = {
    data: T | null;
    error: Error | null;
    status: number;
    statusText: string;
};
export type PaginationOptions = {
    page?: number;
    pageSize?: number;
    ascending?: boolean;
    sortBy?: string;
};
export type FilterCondition<T> = {
    column: keyof T;
    operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
    value: any;
};
export type QueryOptions<T> = {
    select?: string;
    filters?: FilterCondition<T>[];
    pagination?: PaginationOptions;
    orderBy?: {
        column: keyof T;
        ascending: boolean;
    };
};
export type AuthCredentials = {
    email: string;
    password: string;
    options?: {
        emailRedirectTo?: string;
        data?: Record<string, any>;
    };
};
export type FileUploadOptions = {
    bucket?: string;
    path: string;
    file: File | Blob | ArrayBuffer;
    fileOptions?: {
        cacheControl?: string;
        contentType?: string;
        upsert?: boolean;
    };
};
export type RealtimeSubscriptionOptions = {
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    table: string;
    schema?: string;
    filter?: string;
    callback: (payload: any) => void;
};
