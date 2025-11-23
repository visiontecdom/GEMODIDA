'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from './useAuth';

interface Notificacion {
  id_notificacion: number;
  titulo: string;
  mensaje: string;
  tipo: 'alerta' | 'info' | 'warning' | 'success';
  id_usuario_destinatario?: string;
  id_grupo_destinatario?: number;
  es_leida: boolean;
  es_global: boolean;
  metadatos?: Record<string, any>;
  fecha_expiracion?: string;
  creado_en: string;
  leida_en?: string;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const supabaseRef = useRef(createClient());

  const loadNotifications = useCallback(async (soloNoLeidas: boolean = false) => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await (supabaseRef.current as any).rpc('obtener_notificaciones_usuario', {
        p_id_usuario: user.id,
        p_solo_no_leidas: soloNoLeidas,
        p_limite: 50
      });

      if (error) throw error;
      
      setNotificaciones(data || []);
      setUnreadCount((data || []).filter((n: Notificacion) => !n.es_leida).length);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const markAsRead = useCallback(async (notificationId: number) => {
    if (!user?.id) return;

    try {
      const success = await (supabaseRef.current as any).rpc('marcar_notificacion_leida', {
        p_id_notificacion: notificationId,
        p_id_usuario: user.id
      });

      if (success) {
        setNotificaciones(prev => 
          prev.map(n => 
            n.id_notificacion === notificationId 
              ? { ...n, es_leida: true, leida_en: new Date().toISOString() }
              : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [user?.id]);

  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;

    try {
      const unreadNotifications = notificaciones.filter(n => !n.es_leida);
      
      for (const notification of unreadNotifications) {
        await (supabaseRef.current as any).rpc('marcar_notificacion_leida', {
          p_id_notificacion: notification.id_notificacion,
          p_id_usuario: user.id
        });
      }

      setNotificaciones(prev => 
        prev.map(n => ({ ...n, es_leida: true, leida_en: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err: any) {
      setError(err.message);
    }
  }, [user?.id, notificaciones]);

  const createNotification = useCallback(async (
    titulo: string,
    mensaje: string,
    tipo: Notificacion['tipo'] = 'info',
    destinatarioId?: string,
    grupoId?: number,
    esGlobal: boolean = false
  ) => {
    try {
      const { data, error } = await (supabaseRef.current as any)
        .from('notificaciones_sistema')
        .insert({
          titulo,
          mensaje,
          tipo,
          id_usuario_destinatario: destinatarioId,
          id_grupo_destinatario: grupoId,
          es_global: esGlobal,
          metadatos: {}
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      
      // Configurar polling para nuevas notificaciones
      const interval = setInterval(() => {
        loadNotifications();
      }, 30000); // Cada 30 segundos

      return () => clearInterval(interval);
    }
  }, [user?.id, loadNotifications]);

  return {
    notificaciones,
    loading,
    error,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    clearError: () => setError(null)
  };
}