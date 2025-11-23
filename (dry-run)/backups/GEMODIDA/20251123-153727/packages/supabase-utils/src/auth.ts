import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabaseConfig } from './config';
import type { AuthCredentials } from './types';

const supabase = supabaseConfig.getSupabaseClient();

export class AuthService {
  // Iniciar sesión con email y contraseña
  static async signInWithEmail(credentials: AuthCredentials) {
    const { email, password, options } = credentials;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        // Solo incluir las opciones soportadas por signInWithPassword
        captchaToken: (options as any)?.captchaToken,
      },
    });

    if (error) throw error;
    return data;
  }

  // Registrar nuevo usuario
  static async signUp(credentials: AuthCredentials) {
    const { email, password, options } = credentials;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: options?.emailRedirectTo,
        data: options?.data,
      },
    });

    if (error) throw error;
    return data;
  }

  // Cerrar sesión
  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  // Obtener sesión actual
  static async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  }

  // Obtener usuario actual
  static async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // Escuchar cambios de autenticación
  static onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }

  // Enviar enlace mágico
  static async sendMagicLink(email: string, options?: { redirectTo?: string }) {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: options?.redirectTo,
      },
    });
    if (error) throw error;
  }

  // Restablecer contraseña
  static async resetPassword(email: string, options?: { redirectTo?: string }) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: options?.redirectTo,
    });
    if (error) throw error;
  }

  // Actualizar contraseña
  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  }
}
