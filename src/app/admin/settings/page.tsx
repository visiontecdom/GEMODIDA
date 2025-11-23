'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';

export default function SettingsPage() {
  const { } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [settings, setSettings] = useState({
    app_name: 'GEMODIDA',
    app_version: '1.0.0',
    max_users: '100',
    max_keywords: '1000',
    scraping_interval: '60',
    notification_email: 'admin@GEMODIDA.com',
  });
  const [isSaving, setIsSaving] = useState(false);

  // auth validation is handled via ProtectedRoute

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Aquí iría la lógica para guardar en BD
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Configuración guardada exitosamente');
    } finally {
      setIsSaving(false);
    }
  };

  // content guarded by ProtectedRoute

  return (
    <ProtectedRoute requiredRole="admin">
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración del Sistema</h1>
        <p className="text-muted-foreground mt-2">Administra la configuración general de la plataforma</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nombre de la Aplicación</label>
              <Input
                value={settings.app_name}
                onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Versión</label>
              <Input
                value={settings.app_version}
                onChange={(e) => setSettings({ ...settings, app_version: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Límites del Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Máximo de Usuarios</label>
              <Input
                type="number"
                value={settings.max_users}
                onChange={(e) => setSettings({ ...settings, max_users: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Máximo de Palabras Clave</label>
              <Input
                type="number"
                value={settings.max_keywords}
                onChange={(e) => setSettings({ ...settings, max_keywords: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuración de Scraping</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Intervalo de Scraping (segundos)</label>
              <Input
                type="number"
                value={settings.scraping_interval}
                onChange={(e) => setSettings({ ...settings, scraping_interval: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email de Notificaciones</label>
              <Input
                type="email"
                value={settings.notification_email}
                onChange={(e) => setSettings({ ...settings, notification_email: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={isSaving} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </div>
    </ProtectedRoute>
  );
}
