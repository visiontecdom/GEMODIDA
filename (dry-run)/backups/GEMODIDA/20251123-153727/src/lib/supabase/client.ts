import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { supabaseConfig } from './config';

// Client instance cache to prevent multiple GoTrueClient instances
let cachedClient: ReturnType<typeof createSupabaseClient<Database>> | null = null;

// Cliente para componentes de React (lado del cliente)
export const createClient = (): import('@supabase/supabase-js').SupabaseClient<Database> => {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    throw new Error('Missing Supabase URL or Anon Key');
  }

  // Return cached instance if available
  if (cachedClient) {
    return cachedClient;
  }

  const authOptions: any = {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'GEMODIDA-auth-token',
  };
  if (typeof window !== 'undefined') {
    authOptions.storage = window.localStorage;
  }
  cachedClient = createSupabaseClient<Database>(
    supabaseConfig.url,
    supabaseConfig.anonKey,
    {
      auth: authOptions,
    }
  );

  return cachedClient;
};

// Cliente para Server Components
export const createServerComponentClient = () => {
  // Esta función solo debe usarse en el servidor
  if (typeof window !== 'undefined') {
    throw new Error('createServerComponentClient should only be used on the server');
  }
  
  // Importación dinámica para evitar problemas de SSR
  const { cookies } = require('next/headers');
  const { createServerComponentClient: createServerSupabaseClient } = require('@supabase/auth-helpers-nextjs') as typeof import('@supabase/auth-helpers-nextjs');
  
  const cookieStore = cookies();
  
  return (createServerSupabaseClient as any)({
    cookies: () => cookieStore,
  }, {
    supabaseUrl: supabaseConfig.url,
    supabaseKey: supabaseConfig.anonKey,
  });
};

// Tipos
export type Tables = Database['public']['Tables'];
export type TableName = keyof Tables;
export type TableRow<T extends TableName> = Tables[T]['Row'];

export type { Database };
