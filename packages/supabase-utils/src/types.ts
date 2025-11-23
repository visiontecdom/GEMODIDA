// Tipos base para las respuestas de Supabase
export type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
  status: number;
  statusText: string;
};

// Tipos para paginación
export type PaginationOptions = {
  page?: number;
  pageSize?: number;
  ascending?: boolean;
  sortBy?: string;
};

// Filtros genéricos
export type FilterCondition<T> = {
  column: keyof T;
  operator: 'eq' | 'neq' | 'gt' | 'lt' | 'gte' | 'lte' | 'like' | 'ilike' | 'in' | 'is';
  value: any;
};

// Opciones de consulta
export type QueryOptions<T> = {
  select?: string;
  filters?: FilterCondition<T>[];
  pagination?: PaginationOptions;
  orderBy?: {
    column: keyof T;
    ascending: boolean;
  };
};

// Tipos para autenticación
export type AuthCredentials = {
  email: string;
  password: string;
  options?: {
    emailRedirectTo?: string;
    data?: Record<string, any>;
  };
};

// Tipos para manejo de archivos
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

// Tipos para suscripciones en tiempo real
export type RealtimeSubscriptionOptions = {
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  table: string;
  schema?: string;
  filter?: string;
  callback: (payload: any) => void;
};
