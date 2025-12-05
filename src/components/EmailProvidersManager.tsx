'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, Plus, Edit, Trash2, Star, StarOff, Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface EmailProvider {
  id: number;
  name: string;
  provider_type: string;
  display_name: string;
  description: string;
  is_active: boolean;
  is_default: boolean;
  config: any;
  created_at: string;
  updated_at: string;
}

const PROVIDER_TYPES = {
  smtp: {
    name: 'SMTP',
    description: 'Servidor SMTP genérico (Microsoft 365, Gmail, Zoho, etc.)',
    fields: ['host', 'port', 'secure', 'user', 'pass', 'from_email', 'from_name']
  },
  gmail_oauth2: {
    name: 'Gmail OAuth2',
    description: 'Gmail API con OAuth2 (completamente gratuito)',
    fields: ['client_id', 'client_secret', 'refresh_token', 'from_email', 'from_name']
  },
  sendgrid: {
    name: 'SendGrid',
    description: 'SendGrid API (gratuito hasta 100 emails/día)',
    fields: ['api_key', 'from_email', 'from_name']
  }
};

export default function EmailProvidersManager() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<EmailProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<EmailProvider | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    provider_type: '',
    display_name: '',
    description: '',
    is_active: false,
    config: {} as any
  });

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      const { data, error } = await (supabase() as any).rpc('manage_email_providers', { operation: 'LIST' });

      if (error) throw error;

      if (data?.providers) {
        setProviders(data.providers);
      }
    } catch (error) {
      console.error('Error loading providers:', error);
      toast.error('Error al cargar proveedores de email');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const operation = editingProvider ? 'UPDATE' : 'CREATE';
      const providerData = {
        ...formData,
        ...(editingProvider && { id: editingProvider.id })
      };

      const { data, error } = await (supabase() as any).rpc('manage_email_providers', {
        operation,
        provider_data: providerData,
        provider_id: editingProvider?.id
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message);
        setDialogOpen(false);
        resetForm();
        loadProviders();
      } else {
        toast.error(data?.message || 'Error en la operación');
      }
    } catch (error: any) {
      console.error('Error saving provider:', error);
      toast.error(error.message || 'Error al guardar proveedor');
    }
  };

  const handleDelete = async (providerId: number) => {
    try {
      const { data, error } = await (supabase() as any).rpc('manage_email_providers', {
        operation: 'DELETE',
        provider_id: providerId
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message);
        loadProviders();
      } else {
        toast.error(data?.message || 'Error al eliminar proveedor');
      }
    } catch (error: any) {
      console.error('Error deleting provider:', error);
      toast.error(error.message || 'Error al eliminar proveedor');
    }
  };

  const handleSetDefault = async (providerId: number) => {
    try {
      const { data, error } = await (supabase() as any).rpc('manage_email_providers', {
        operation: 'SET_DEFAULT',
        provider_id: providerId
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message);
        loadProviders();
      } else {
        toast.error(data?.message || 'Error al establecer proveedor predeterminado');
      }
    } catch (error: any) {
      console.error('Error setting default provider:', error);
      toast.error(error.message || 'Error al establecer proveedor predeterminado');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      provider_type: '',
      display_name: '',
      description: '',
      is_active: false,
      config: {}
    });
    setEditingProvider(null);
  };

  const openEditDialog = (provider: EmailProvider) => {
    setEditingProvider(provider);
    setFormData({
      name: provider.name,
      provider_type: provider.provider_type,
      display_name: provider.display_name,
      description: provider.description,
      is_active: provider.is_active,
      config: provider.config || {}
    });
    setDialogOpen(true);
  };

  const openCreateDialog = () => {
    resetForm();
    setDialogOpen(true);
  };

  const updateConfigField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      config: {
        ...prev.config,
        [field]: value
      }
    }));
  };

  const renderConfigFields = () => {
    const providerType = formData.provider_type;
    if (!providerType || !PROVIDER_TYPES[providerType as keyof typeof PROVIDER_TYPES]) {
      return null;
    }

    const fields = PROVIDER_TYPES[providerType as keyof typeof PROVIDER_TYPES].fields;

    return (
      <div className="space-y-4">
        <h4 className="font-medium">Configuración específica</h4>
        {fields.map(field => (
          <div key={field} className="space-y-2">
            <Label htmlFor={field}>
              {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              {field.includes('pass') || field.includes('secret') || field.includes('key') ? ' *' : ''}
            </Label>
            <Input
              id={field}
              type={field.includes('pass') || field.includes('secret') || field.includes('key') ? 'password' : 'text'}
              value={formData.config[field] || ''}
              onChange={(e) => updateConfigField(field, e.target.value)}
              placeholder={`Ingrese ${field.replace('_', ' ')}`}
            />
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Cargando proveedores de email...</div>;
  }

  const activeProviders = providers.filter(p => p.is_active);
  const hasActiveProvider = activeProviders.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Proveedores de Email
          </h2>
          <p className="text-muted-foreground">
            Gestiona los proveedores de email para envío de notificaciones
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proveedor
        </Button>
      </div>

      {!hasActiveProvider && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <div>
              <p className="font-medium text-orange-800">No hay proveedor activo</p>
              <p className="text-sm text-orange-700">
                Configura al menos un proveedor de email para poder enviar notificaciones
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {providers.map((provider) => (
          <Card key={provider.id} className={`hover:shadow-md transition-shadow ${provider.is_default ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {provider.display_name}
                  {provider.is_default && <Star className="h-4 w-4 text-primary fill-current" />}
                </CardTitle>
                <div className="flex items-center gap-1">
                  {provider.is_active ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary">{provider.provider_type}</Badge>
                {provider.is_default && <Badge variant="default">Predeterminado</Badge>}
                <Badge variant={provider.is_active ? "default" : "secondary"}>
                  {provider.is_active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{provider.description}</p>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditDialog(provider)}
                  className="flex-1"
                >
                  <Edit className="mr-1 h-3 w-3" />
                  Editar
                </Button>

                {!provider.is_default && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetDefault(provider.id)}
                    title="Establecer como predeterminado"
                  >
                    <Star className="h-3 w-3" />
                  </Button>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar proveedor?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta acción no se puede deshacer. Se eliminará permanentemente
                        el proveedor "{provider.display_name}".
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(provider.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Eliminar
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para crear/editar proveedor */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProvider ? 'Editar Proveedor' : 'Nuevo Proveedor de Email'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre interno *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="smtp_microsoft"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider_type">Tipo de proveedor *</Label>
                <Select
                  value={formData.provider_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, provider_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROVIDER_TYPES).map(([key, type]) => (
                      <SelectItem key={key} value={key}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Nombre para mostrar *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Microsoft 365 / Outlook"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripción del proveedor"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
              />
              <Label htmlFor="is_active">Proveedor activo</Label>
            </div>

            {formData.provider_type && (
              <div className="border-t pt-4">
                {renderConfigFields()}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingProvider ? 'Actualizar' : 'Crear'} Proveedor
              </Button>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}