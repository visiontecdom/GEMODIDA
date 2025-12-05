'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Toast, ToastContainer } from '../ui/toast';

type ToastType = {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

type SolicitarResetResponse = {
  success: boolean;
  message: string;
  token?: string;
  user_email?: string;
  user_name?: string;
};

type VerificarTokenResponse = {
  success: boolean;
  message: string;
  user_email?: string;
};

export function PasswordResetModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);

  useEffect(() => {
    const handleOpenModal = () => {
      setIsOpen(true);
      setStep('request');
      setEmail('');
      setToken('');
      setNewPassword('');
      setConfirmPassword('');
    };

    window.addEventListener('openPasswordResetModal', handleOpenModal);
    return () => window.removeEventListener('openPasswordResetModal', handleOpenModal);
  }, []);

  const showToast = (toast: Omit<ToastType, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const supabase = createClient();

      // Llamar a la función RPC para solicitar reset
      const { data, error } = await (supabase.rpc as any)('solicitar_reset_password', {
        p_correo: email.trim().toLowerCase()
      });

      if (error) {
        throw new Error('Error al solicitar reset: ' + error.message);
      }

      if (!data?.success) {
        throw new Error(data?.message || 'Error desconocido');
      }

      // Enviar email con el token
      await sendResetEmail(data.token!, data.user_email!, data.user_name!);

      showToast({
        title: 'Solicitud enviada',
        description: 'Se ha enviado un código de 6 dígitos a tu correo electrónico.',
        variant: 'default',
      });

      setStep('verify');

    } catch (error: any) {
      showToast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyToken = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast({
        title: 'Error',
        description: 'Las contraseñas no coinciden.',
        variant: 'destructive',
      });
      return;
    }

    if (newPassword.length < 6) {
      showToast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Llamar a la función RPC para verificar token y actualizar contraseña
      const { data, error } = await (supabase.rpc as any)('verificar_reset_token', {
        p_token: token.trim(),
        p_nueva_password: newPassword
      });

      if (error) {
        throw new Error('Error al verificar token: ' + error.message);
      }

      if (!data?.success) {
        throw new Error(data?.message || 'Token inválido');
      }

      showToast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña ha sido cambiada exitosamente.',
        variant: 'default',
      });

      setIsOpen(false);

    } catch (error: any) {
      showToast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendResetEmail = async (token: string, userEmail: string, userName: string) => {
    try {
      const response = await fetch('/api/send-reset-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          userEmail,
          userName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar el email');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error enviando email:', error);
      // En desarrollo, mostrar el token en consola
      if (process.env.NODE_ENV === 'development') {
        console.log('Token de reset (desarrollo):', token);
        console.log('Enviar a:', userEmail);
        console.log('Usuario:', userName);
      }
      throw error;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {step === 'request' ? 'Recuperar Contraseña' : 'Verificar Código'}
            </DialogTitle>
          </DialogHeader>

          {step === 'request' ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Correo electrónico</Label>
                <Input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ingresa tu correo electrónico"
                  required
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Ingresa tu correo electrónico y te enviaremos un código de 6 dígitos para recuperar tu contraseña.
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Enviando...' : 'Enviar Código'}
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyToken} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-token">Código de 6 dígitos</Label>
                <Input
                  id="reset-token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nueva Contraseña</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña"
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma la nueva contraseña"
                  minLength={6}
                  required
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Ingresa el código que recibiste por correo y establece tu nueva contraseña.
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setStep('request')} className="flex-1">
                  Atrás
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}