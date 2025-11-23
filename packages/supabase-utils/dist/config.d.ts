type SupabaseConfig = {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
};
export declare class SupabaseConfigManager {
    private static instance;
    private config;
    private constructor();
    static getInstance(config?: Partial<SupabaseConfig>): SupabaseConfigManager;
    getConfig(): SupabaseConfig;
    updateConfig(newConfig: Partial<SupabaseConfig>): void;
    private validateConfig;
    getSupabaseClient(options?: {}): import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
    getServiceClient(): import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
}
export declare const supabaseConfig: SupabaseConfigManager;
export {};
