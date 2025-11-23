"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseConfig = exports.SupabaseConfigManager = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
// Configuración por defecto
const defaultConfig = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
};
// Clase de configuración de Supabase
class SupabaseConfigManager {
    constructor(config = {}) {
        this.config = { ...defaultConfig, ...config };
        this.validateConfig();
    }
    static getInstance(config = {}) {
        if (!SupabaseConfigManager.instance) {
            SupabaseConfigManager.instance = new SupabaseConfigManager(config);
        }
        return SupabaseConfigManager.instance;
    }
    getConfig() {
        return { ...this.config };
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.validateConfig();
    }
    validateConfig() {
        if (!this.config.url) {
            throw new Error('Supabase URL no está configurada');
        }
        if (!this.config.anonKey) {
            throw new Error('Supabase anon key no está configurada');
        }
    }
    getSupabaseClient(options = {}) {
        return (0, supabase_js_1.createClient)(this.config.url, this.config.anonKey, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
            },
            ...options,
        });
    }
    getServiceClient() {
        if (!this.config.serviceRoleKey) {
            throw new Error('Service role key no está configurada');
        }
        return (0, supabase_js_1.createClient)(this.config.url, this.config.serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
    }
}
exports.SupabaseConfigManager = SupabaseConfigManager;
exports.supabaseConfig = SupabaseConfigManager.getInstance();
