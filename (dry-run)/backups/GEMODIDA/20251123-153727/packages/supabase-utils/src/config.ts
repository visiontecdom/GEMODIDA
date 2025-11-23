import { createClient } from '@supabase/supabase-js';
// Los tipos de la base de datos se generarán automáticamente por Supabase
// y se pueden importar desde @supabase/supabase-js
type Database = any; // Temporalmente usamos 'any' para evitar errores de compilación

// Tipos
type SupabaseConfig = {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
};

// Configuración por defecto
const defaultConfig: SupabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};

// Clase de configuración de Supabase
export class SupabaseConfigManager {
  private static instance: SupabaseConfigManager;
  private config: SupabaseConfig;

  private constructor(config: Partial<SupabaseConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
    this.validateConfig();
  }

  public static getInstance(config: Partial<SupabaseConfig> = {}): SupabaseConfigManager {
    if (!SupabaseConfigManager.instance) {
      SupabaseConfigManager.instance = new SupabaseConfigManager(config);
    }
    return SupabaseConfigManager.instance;
  }

  public getConfig(): SupabaseConfig {
    return { ...this.config };
  }

  public updateConfig(newConfig: Partial<SupabaseConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.validateConfig();
  }

  private validateConfig(): void {
    if (!this.config.url) {
      throw new Error('Supabase URL no está configurada');
    }
    if (!this.config.anonKey) {
      throw new Error('Supabase anon key no está configurada');
    }
  }

  public getSupabaseClient(options = {}) {
    return createClient<Database>(this.config.url, this.config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      ...options,
    });
  }

  public getServiceClient() {
    if (!this.config.serviceRoleKey) {
      throw new Error('Service role key no está configurada');
    }
    return createClient<Database>(this.config.url, this.config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
}

export const supabaseConfig = SupabaseConfigManager.getInstance();
