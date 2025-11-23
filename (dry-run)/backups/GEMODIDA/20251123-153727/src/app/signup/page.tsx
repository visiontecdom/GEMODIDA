'use client';

import React from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">GEMODIDA</h1>
          <p className="text-muted-foreground mt-2">Crea tu nueva cuenta</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Crear Cuenta</CardTitle>
            <CardDescription>
              Regístrate para comenzar a usar GEMODIDA
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthForm type="signup" />
          </CardContent>
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{' '}
            <a href="/signin" className="text-primary hover:underline">
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
