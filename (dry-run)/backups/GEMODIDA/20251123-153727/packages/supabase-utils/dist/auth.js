"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const config_1 = require("./config");
const supabase = config_1.supabaseConfig.getSupabaseClient();
class AuthService {
    // Iniciar sesión con email y contraseña
    static async signInWithEmail(credentials) {
        const { email, password, options } = credentials;
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
            options: {
                // Solo incluir las opciones soportadas por signInWithPassword
                captchaToken: options === null || options === void 0 ? void 0 : options.captchaToken,
            },
        });
        if (error)
            throw error;
        return data;
    }
    // Registrar nuevo usuario
    static async signUp(credentials) {
        const { email, password, options } = credentials;
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: options === null || options === void 0 ? void 0 : options.emailRedirectTo,
                data: options === null || options === void 0 ? void 0 : options.data,
            },
        });
        if (error)
            throw error;
        return data;
    }
    // Cerrar sesión
    static async signOut() {
        const { error } = await supabase.auth.signOut();
        if (error)
            throw error;
    }
    // Obtener sesión actual
    static async getSession() {
        const { data, error } = await supabase.auth.getSession();
        if (error)
            throw error;
        return data.session;
    }
    // Obtener usuario actual
    static async getUser() {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error)
            throw error;
        return user;
    }
    // Escuchar cambios de autenticación
    static onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback);
    }
    // Enviar enlace mágico
    static async sendMagicLink(email, options) {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: options === null || options === void 0 ? void 0 : options.redirectTo,
            },
        });
        if (error)
            throw error;
    }
    // Restablecer contraseña
    static async resetPassword(email, options) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: options === null || options === void 0 ? void 0 : options.redirectTo,
        });
        if (error)
            throw error;
    }
    // Actualizar contraseña
    static async updatePassword(newPassword) {
        const { error } = await supabase.auth.updateUser({
            password: newPassword,
        });
        if (error)
            throw error;
    }
}
exports.AuthService = AuthService;
