'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { diagLog } from '@/lib/diagnostic';

// Componentes de gestión
const UserManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle>👥 Gestión de Usuarios</CardTitle>
      <CardDescription>
        Crear, editar y gestionar usuarios del sistema
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Button className="w-full">Crear Nuevo Usuario</Button>
        <Button variant="outline" className="w-full">Ver Lista de Usuarios</Button>
        <Button variant="outline" className="w-full">Gestionar Asignaciones</Button>
      </div>
    </CardContent>
  </Card>
);

const RoleManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle>🔐 Gestión de Roles</CardTitle>
      <CardDescription>
        Definir y configurar roles del sistema con sus permisos
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Button className="w-full">Crear Nuevo Rol</Button>
        <Button variant="outline" className="w-full">Configurar Permisos</Button>
        <Button variant="outline" className="w-full">Ver Jerarquía de Roles</Button>
      </div>
    </CardContent>
  </Card>
);

const GroupManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle>👥 Gestión de Grupos</CardTitle>
      <CardDescription>
        Administrar grupos de trabajo y sus asignaciones
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Button className="w-full">Crear Nuevo Grupo</Button>
        <Button variant="outline" className="w-full">Asignar Usuarios a Grupos</Button>
        <Button variant="outline" className="w-full">Ver Grupos Activos</Button>
      </div>
    </CardContent>
  </Card>
);

const PermissionManagement = () => (
  <Card>
    <CardHeader>
      <CardTitle>🛡️ Gestión de Permisos</CardTitle>
      <CardDescription>
        Configurar permisos detallados del sistema
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Button className="w-full">Configurar Permisos Globales</Button>
        <Button variant="outline" className="w-full">Auditoría de Accesos</Button>
        <Button variant="outline" className="w-full">Reportes de Seguridad</Button>
      </div>
    </CardContent>
  </Card>
);

const SystemAudit = () => (
  <Card>
    <CardHeader>
      <CardTitle>📊 Auditoría del Sistema</CardTitle>
      <CardDescription>
        Monitoreo y registros de actividades del sistema
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <Button className="w-full">Ver Logs de Acceso</Button>
        <Button variant="outline" className="w-full">Auditoría de Cambios</Button>
        <Button variant="outline" className="w-full">Reportes de Seguridad</Button>
      </div>
    </CardContent>
  </Card>
);

export default function SeguridadSistemaPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { hasGroup, hasRole, loading: roleLoading } = useRoleSystem();
  const [activeTab, setActiveTab] = useState('usuarios');

  // Verificar permisos de acceso
  useEffect(() => {
    diagLog('info', 'SeguridadSistemaPage render', 'SeguridadSistemaPage', {
      userId: user?.id,
      authLoading,
      roleLoading,
      hasUser: !!user
    });

    if (authLoading || roleLoading) return;

    if (!user) {
      diagLog('info', 'No authenticated user, redirecting to signin', 'SeguridadSistemaPage');
      router.push('/signin');
      return;
    }

    // ROLES CON ACCESO IRRESTRINTO tienen acceso automático
    const unrestrictedRoles = ['admin', 'super_user', 'desarrollo'];
    const hasUnrestrictedAccess = unrestrictedRoles.some(role => hasRole(role));

    // Solo usuarios de seguridad o administradores pueden acceder
    const hasAccess = hasUnrestrictedAccess || hasGroup('seguridad') || hasGroup('administracion') || hasGroup('general') || hasGroup('desarrollo');

    if (!hasAccess) {
      diagLog('warn', 'User does not have access to security panel', 'SeguridadSistemaPage', {
        userGroups: 'checked for: seguridad, administracion, general, desarrollo'
      });
      router.push('/elegir-panel');
      return;
    }

    diagLog('info', 'User has access to security panel', 'SeguridadSistemaPage');
  }, [user, authLoading, roleLoading, hasGroup, hasRole, router]);

  const loading = authLoading || roleLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos de acceso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <img src="/imgs/Emblema_DIDA.png" alt="Emblema GEMODIDA" className="mx-auto h-16 w-16 object-contain" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              🛡️ Panel de Seguridad del Sistema
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground px-4">
              Gestión integral de usuarios, roles, grupos y permisos
            </p>
          </div>

          {/* Navigation */}
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => router.push('/elegir-panel')}
              className="w-full sm:w-auto mb-4"
            >
              ← Volver a Elegir Panel
            </Button>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 h-auto">
              <TabsTrigger value="usuarios" className="text-xs sm:text-sm">👥 Usuarios</TabsTrigger>
              <TabsTrigger value="roles" className="text-xs sm:text-sm">🔐 Roles</TabsTrigger>
              <TabsTrigger value="grupos" className="text-xs sm:text-sm">👥 Grupos</TabsTrigger>
              <TabsTrigger value="permisos" className="text-xs sm:text-sm">🛡️ Permisos</TabsTrigger>
              <TabsTrigger value="auditoria" className="text-xs sm:text-sm">📊 Auditoría</TabsTrigger>
            </TabsList>

            <TabsContent value="usuarios" className="mt-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="roles" className="mt-6">
              <RoleManagement />
            </TabsContent>

            <TabsContent value="grupos" className="mt-6">
              <GroupManagement />
            </TabsContent>

            <TabsContent value="permisos" className="mt-6">
              <PermissionManagement />
            </TabsContent>

            <TabsContent value="auditoria" className="mt-6">
              <SystemAudit />
            </TabsContent>
          </Tabs>

          {/* User Info */}
          {user && (
            <div className="mt-12 text-center">
              <div className="bg-muted/50 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="font-semibold text-foreground mb-2">
                  Sesión Actual
                </h3>
                <p className="text-sm text-muted-foreground">
                  Usuario: {user.email}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Panel de Seguridad - Acceso Autorizado
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}