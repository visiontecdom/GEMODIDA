'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail } from 'lucide-react';
import EmailProvidersManager from '@/components/EmailProvidersManager';

export default function EmailProvidersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { getPrimaryAssignment } = useRoleSystem();

  // Verificar que el usuario tenga acceso al panel de administración general
  const primaryAssignment = getPrimaryAssignment();
  const groupCode = primaryAssignment?.grupo?.codigo_grupo;

  if (!groupCode || !['seguridad', 'general'].includes(groupCode)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              No tienes permisos para acceder a esta página.
            </p>
            <Button
              className="w-full mt-4"
              onClick={() => router.push('/principal-dashboard')}
            >
              Volver al Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push('/principal-dashboard')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Configuración de Proveedores de Correo
          </h1>
          <p className="text-muted-foreground">
            Gestiona los proveedores de correo electrónico para notificaciones del sistema.
          </p>
        </div>
      </div>

      <EmailProvidersManager />
    </div>
  );
}