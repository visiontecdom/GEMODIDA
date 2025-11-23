'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { diagLog } from '@/lib/diagnostic';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Toast, ToastContainer } from '../ui/toast';

type ToastType = {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export function AuthForm({ type }: { type: 'signin' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const router = useRouter();
  const supabaseRef = useRef(createClient());
  const formId = React.useId();

  const showToast = (toast: Omit<ToastType, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (type === 'signin') {
        diagLog('info', 'Sign in attempt', 'AuthForm', { email });
        
        const { data, error } = await supabaseRef.current.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          throw new Error(error.message.includes('Invalid') ? 'Correo o contraseña incorrectos' : error.message);
        }

        diagLog('info', 'Sign in successful', 'AuthForm', { userId: data.user?.id });

        // Wait 2 seconds for session to propagate
        await new Promise(r => setTimeout(r, 2000));
        
        // Navigate to dashboard
        window.location.href = '/principal-dashboard';
      } else {
        const { data, error } = await supabaseRef.current.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName,
              phone,
            },
          },
        });

        if (error) throw error;

        if (data?.user) {
          await (supabaseRef.current as any).rpc('registrar_usuario_signup', {
            p_id_usuario: data.user.id,
            p_correo: email.trim().toLowerCase(),
            p_nombre_completo: fullName.trim(),
            p_telefono: phone.trim(),
          });
        }

        showToast({
          title: '¡Registro exitoso!',
          description: 'Te hemos enviado un correo de confirmación.',
          variant: 'default',
        });
        
        setEmail('');
        setPassword('');
        setFullName('');
        setPhone('');
      }
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

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          {type === 'signin' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {type === 'signin'
            ? 'Ingresa tus credenciales para acceder'
            : 'Crea una nueva cuenta'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'signup' && (
          <>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-fullName`}>Nombre Completo</Label>
              <Input
                id={`${formId}-fullName`}
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${formId}-phone`}>Teléfono</Label>
              <Input
                id={`${formId}-phone`}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </>
        )}
        <div className="space-y-2">
          <Label htmlFor={`${formId}-email`}>Correo Electrónico</Label>
          <Input
            id={`${formId}-email`}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${formId}-password`}>Contraseña</Label>
          <Input
            id={`${formId}-password`}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Cargando...' : type === 'signin' ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </Button>
      </form>

      <div className="text-center text-sm">
        {type === 'signin' ? (
          <p>
            ¿No tienes cuenta?{' '}
            <a href="/signup" className="text-primary hover:underline">
              Regístrate
            </a>
          </p>
        ) : (
          <p>
            ¿Ya tienes cuenta?{' '}
            <a href="/signin" className="text-primary hover:underline">
              Inicia Sesión
            </a>
          </p>
        )}
      </div>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
