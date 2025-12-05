import { createClient } from '@supabase/supabase-js';

export interface Notificacion {
  id?: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'warning' | 'error' | 'success';
  canal: 'push' | 'email' | 'whatsapp';
  usuario_id?: string;
  leida?: boolean;
  created_at?: string;
}

export class NotificacionService {
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  async enviarNotificacion(notif: Notificacion): Promise<Notificacion> {
    const { data, error } = await this.supabase
      .from('notificaciones')
      .insert([{
        ...notif,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async obtenerNotificaciones(usuarioId: string): Promise<Notificacion[]> {
    const { data, error } = await this.supabase
      .from('notificaciones')
      .select('*')
      .eq('usuario_id', usuarioId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async marcarComoLeida(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('notificaciones')
      .update({ leida: true })
      .eq('id', id);
    
    if (error) throw error;
  }

  async enviarPorEmail(email: string, asunto: string, mensaje: string): Promise<void> {
    // Simulado - en producción usar SendGrid, AWS SES, etc.
    console.log(`Email enviado a ${email}: ${asunto}`);
  }

  async enviarPorWhatsApp(telefono: string, mensaje: string): Promise<void> {
    // Simulado - en producción usar Twilio, etc.
    console.log(`WhatsApp enviado a ${telefono}: ${mensaje}`);
  }
}
