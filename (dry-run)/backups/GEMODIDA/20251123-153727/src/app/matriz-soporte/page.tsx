'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, Settings, Target, BarChart3, Plus, Edit, Trash2, Eye } from 'lucide-react';
import { DataTable } from '@/components/shared/DataTable';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FormDialog } from '@/components/shared/FormDialog';
import { createClient } from '@/lib/supabase/client';

interface Usuario {
  id_usuario: string;
  correo: string;
  nombre_completo: string;
  telefono?: string;
  esta_activo: boolean;
  id_rol: number;
  nombre_rol?: string;
  id_suc?: number;
  nombre_sucursal?: string;
  creado_en: string;
  ultimo_acceso?: string;
}

interface Rol {
  id_rol: number;
  codigo_rol: string;
  nombre_rol: string;
  descripcion?: string;
  nivel_acceso: number;
  esta_activo: boolean;
  total_usuarios?: number;
}

interface Sucursal {
  id_suc: number;
  nombre_sucursal: string;
}

interface ConfiguracionSistema {
  clave: string;
  valor: string;
  tipo: string;
  descripcion?: string;
  es_sensible: boolean;
}

interface ConfiguracionScraping {
  id_config: number;
  nombre_configuracion: string;
  descripcion?: string;
  fuentes_activas: number[];
  palabras_clave_activas: number[];
  frecuencia_minutos: number;
  esta_activa: boolean;
}

interface DepartmentStats {
  departamento: string;
  total_trabajos: number;
  completados: number;
  en_progreso: number;
}

export default function MatrizSoportePage() {
  const {} = useAuth();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [loading, setLoading] = useState(false);
  
  // Estados para usuarios
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [showUsuarioDialog, setShowUsuarioDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Estados para roles
  const [roles, setRoles] = useState<Rol[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null);
  const [showRolDialog, setShowRolDialog] = useState(false);
  
  // Estados para configuración del sistema
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionSistema[]>([]);
  const [selectedConfig, setSelectedConfig] = useState<ConfiguracionSistema | null>(null);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  
  // Estados para configuración de scraping
  const [scrapingConfigs, setScrapingConfigs] = useState<ConfiguracionScraping[]>([]);
  const [selectedScraping, setSelectedScraping] = useState<ConfiguracionScraping | null>(null);
  const [showScrapingDialog, setShowScrapingDialog] = useState(false);
  
  // Estados para estadísticas
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);

  // Cargar datos iniciales
  useEffect(() => {
    loadRolesAndSucursales();
  }, []);

  // Cargar datos según la pestaña activa
  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadRolesAndSucursales = async () => {
    // Cargar roles
    const { data: rolesData } = await supabase
      .from('usuarios_roles')
      .select('id_rol, codigo_rol, nombre_rol')
      .eq('esta_activo', true)
      .order('nombre_rol');
    
    if (rolesData) {
      setRoles(rolesData);
    }

    // Cargar sucursales
    const { data: sucursalesData } = await supabase
      .from('sucursales')
      .select('id_suc, nombre_sucursal')
      .eq('estado', 'Activo')
      .order('nombre_sucursal');
    
    if (sucursalesData) {
      setSucursales(sucursalesData);
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'usuarios':
          await loadUsuarios();
          break;
        case 'roles':
          await loadRoles();
          break;
        case 'configuracion':
          await loadConfiguraciones();
          break;
        case 'scraping':
          await loadScrapingConfigs();
          break;
        case 'estadisticas':
          await loadDepartmentStats();
          break;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsuarios = async () => {
    try {
      // Intentar usar la función RPC para obtener usuarios completos
      const { data, error } = await (supabase as any)
        .rpc('obtener_usuarios_completos', {
          p_limite: 100,
          p_desplazamiento: 0
        });
      
      if (error) {
        console.error('Error loading usuarios with RPC:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.log('Falling back to direct query...');
        
        // Fallback: usar consulta directa si la función RPC no existe
        const { data: usuariosData, error: queryError } = await supabase
          .from('usuarios')
          .select(`
            id_usuario,
            correo,
            nombre_completo,
            telefono,
            esta_activo,
            id_rol,
            id_suc,
            creado_en,
            ultimo_acceso,
            usuarios_roles(nombre_rol),
            sucursales(nombre_sucursal)
          `)
          .order('creado_en', { ascending: false })
          .limit(100);
        
        if (queryError) {
          console.error('Error loading usuarios with direct query:', queryError);
          console.error('Query error details:', JSON.stringify(queryError, null, 2));
          return;
        }
        
        if (usuariosData) {
          // Transformar los datos al formato esperado
          const transformedData = usuariosData.map((u: any) => ({
            id_usuario: u.id_usuario,
            correo: u.correo,
            nombre_completo: u.nombre_completo,
            telefono: u.telefono,
            esta_activo: u.esta_activo,
            id_rol: u.id_rol,
            nombre_rol: u.usuarios_roles?.nombre_rol || 'Sin rol',
            id_suc: u.id_suc,
            nombre_sucursal: u.sucursales?.nombre_sucursal || null,
            creado_en: u.creado_en,
            ultimo_acceso: u.ultimo_acceso
          }));
          console.log('Usuarios loaded successfully via direct query:', transformedData.length);
          setUsuarios(transformedData);
        }
        return;
      }
      
      if (data) {
        console.log('Usuarios loaded successfully via RPC:', data.length);
        setUsuarios(data);
      }
    } catch (error) {
      console.error('Error in loadUsuarios:', error);
      console.error('Catch error details:', JSON.stringify(error, null, 2));
      
        // Último intento: consulta básica sin joins y mapear nombres de rol/sucursal localmente
      try {
        console.log('Attempting basic query without joins...');
        const [{ data: basicData, error: basicError }, { data: rolesList }, { data: sucList }] = await Promise.all([
          supabase
            .from('usuarios')
            .select('id_usuario, correo, nombre_completo, telefono, esta_activo, id_rol, id_suc, creado_en, ultimo_acceso')
            .order('creado_en', { ascending: false })
            .limit(100),
          supabase.from('usuarios_roles').select('id_rol, nombre_rol'),
          supabase.from('sucursales').select('id_suc, nombre_sucursal')
        ]);

        if (basicError) {
          console.error('Error loading basic usuarios:', basicError);
          console.error('Basic error details:', JSON.stringify(basicError, null, 2));
          return;
        }

        const rolesById: Record<number, string> = (rolesList || []).reduce((acc: any, r: any) => {
          acc[r.id_rol] = r.nombre_rol;
          return acc;
        }, {});

        const sucById: Record<number, string> = (sucList || []).reduce((acc: any, s: any) => {
          acc[s.id_suc] = s.nombre_sucursal;
          return acc;
        }, {});

        if (basicData) {
          const transformed = (basicData as any[]).map((u: any) => ({
            id_usuario: u.id_usuario,
            correo: u.correo,
            nombre_completo: u.nombre_completo,
            telefono: u.telefono,
            esta_activo: u.esta_activo,
            id_rol: u.id_rol,
            nombre_rol: rolesById[u.id_rol] || 'Sin rol',
            id_suc: u.id_suc,
            nombre_sucursal: sucById[u.id_suc] || null,
            creado_en: u.creado_en,
            ultimo_acceso: u.ultimo_acceso
          }));
          console.log('Usuarios loaded successfully via basic query:', transformed.length);
          setUsuarios(transformed as Usuario[]);
        }
      } catch (finalError) {
        console.error('Final error loading usuarios:', finalError);
        console.error('Final error details:', JSON.stringify(finalError, null, 2));
      }
    }
  };

  const loadRoles = async () => {
    try {
      // Usar la función RPC para obtener roles con conteo de usuarios
      const { data, error } = await (supabase as any).rpc('obtener_roles_todos');
      
      if (error) {
        console.error('Error loading roles with RPC:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.log('Falling back to direct query...');
        
        // Fallback: consulta directa
        const { data: rolesData, error: queryError } = await supabase
          .from('usuarios_roles')
          .select('*')
          .order('nivel_acceso', { ascending: true });
        
        if (queryError) {
          console.error('Error loading roles with direct query:', queryError);
          return;
        }
        
        if (rolesData) {
          console.log('Roles loaded successfully via direct query:', rolesData.length);
          setRoles(rolesData as Rol[]);
        }
        return;
      }
      
      if (data) {
        console.log('Roles loaded successfully via RPC:', data.length);
        setRoles(data);
      }
    } catch (error) {
      console.error('Error in loadRoles:', error);
      console.error('Catch error details:', JSON.stringify(error, null, 2));
    }
  };

  const loadConfiguraciones = async () => {
    try {
      const { data, error } = await (supabase as any).rpc('obtener_configuraciones_sistema');
      
      if (error) {
        console.error('Error loading configuraciones with RPC:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.log('Falling back to direct query...');
        
        // Fallback: consulta directa
        const { data: configData, error: queryError } = await supabase
          .from('configuraciones_sistema')
          .select('*')
          .order('clave', { ascending: true });
        
        if (queryError) {
          console.error('Error loading configuraciones with direct query:', queryError);
          return;
        }
        
        if (configData) {
          console.log('Configuraciones loaded successfully via direct query:', configData.length);
          setConfiguraciones(configData as ConfiguracionSistema[]);
        }
        return;
      }
      
      if (data) {
        console.log('Configuraciones loaded successfully via RPC:', data.length);
        setConfiguraciones(data);
      }
    } catch (error) {
      console.error('Error in loadConfiguraciones:', error);
      console.error('Catch error details:', JSON.stringify(error, null, 2));
    }
  };

  const loadScrapingConfigs = async () => {
    try {
      const { data, error } = await supabase.rpc('obtener_configuraciones_scraping');
      
      if (error) {
        console.error('Error loading scraping configs:', error);
        return;
      }
      
      if (data) {
        setScrapingConfigs(data);
      }
    } catch (error) {
      console.error('Error in loadScrapingConfigs:', error);
    }
  };

  const loadDepartmentStats = async () => {
    try {
      const { data, error } = await supabase.rpc('obtener_estadisticas_departamentos');
      
      if (error) {
        console.error('Error loading department stats:', error);
        // Usar datos de ejemplo si hay error
        setDepartmentStats([
          { departamento: 'Monitoreo', total_trabajos: 45, completados: 32, en_progreso: 13 },
          { departamento: 'Promociones', total_trabajos: 38, completados: 25, en_progreso: 13 },
          { departamento: 'Encuestas', total_trabajos: 52, completados: 48, en_progreso: 4 },
        ]);
        return;
      }
      
      if (data && (data as any).length > 0) {
        setDepartmentStats(data);
      } else {
        // Datos de ejemplo si no hay datos
        setDepartmentStats([
          { departamento: 'Monitoreo', total_trabajos: 0, completados: 0, en_progreso: 0 },
          { departamento: 'Promociones', total_trabajos: 0, completados: 0, en_progreso: 0 },
          { departamento: 'Encuestas', total_trabajos: 0, completados: 0, en_progreso: 0 },
        ]);
      }
    } catch (error) {
      console.error('Error in loadDepartmentStats:', error);
    }
  };

  const handleCreateUsuario = () => {
    setSelectedUsuario(null);
    setShowUsuarioDialog(true);
  };

  const handleEditUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowUsuarioDialog(true);
  };

  const handleDeleteUsuario = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setShowDeleteDialog(true);
  };

  const handleSaveUsuario = async (formData: any) => {
    try {
      if (selectedUsuario) {
        // Actualizar usuario existente usando RPC
        const { data, error } = await (supabase as any).rpc('actualizar_usuario', {
          p_id_usuario: selectedUsuario.id_usuario,
          p_correo: formData.correo,
          p_nombre_completo: formData.nombre_completo,
          p_telefono: formData.telefono || null,
          p_id_rol: parseInt(formData.id_rol),
          p_id_suc: formData.id_suc ? parseInt(formData.id_suc) : null,
          p_esta_activo: formData.esta_activo === 'true' || formData.esta_activo === true
        });

        if (error) {
          console.error('Error updating usuario:', error);
          alert('Error al actualizar usuario');
          return;
        }

        if (data && !data.success) {
          alert(data.message || 'Error al actualizar usuario');
          return;
        }
      } else {
        // Crear nuevo usuario - insertar directamente en la tabla
        const { error } = await (supabase as any)
          .from('usuarios')
          .insert({
            correo: formData.correo,
            nombre_completo: formData.nombre_completo,
            telefono: formData.telefono || null,
            id_rol: parseInt(formData.id_rol),
            id_suc: formData.id_suc ? parseInt(formData.id_suc) : null,
            esta_activo: formData.esta_activo === 'true' || formData.esta_activo === true || true,
            creado_en: new Date().toISOString()
          });

        if (error) {
          console.error('Error creating usuario:', error);
          alert('Error al crear usuario');
          return;
        }
      }

      await loadUsuarios();
      setShowUsuarioDialog(false);
      setSelectedUsuario(null);
    } catch (error) {
      console.error('Error saving usuario:', error);
      alert('Error al guardar usuario');
    }
  };

  const confirmDeleteUsuario = async () => {
    if (!selectedUsuario) return;
    
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id_usuario', selectedUsuario.id_usuario);
      
      if (error) {
        console.error('Error deleting usuario:', error);
        alert('Error al eliminar usuario');
        return;
      }

      await loadUsuarios();
      setShowDeleteDialog(false);
      setSelectedUsuario(null);
    } catch (error) {
      console.error('Error in confirmDeleteUsuario:', error);
      alert('Error al eliminar usuario');
    }
  };

  const usuarioFields = [
    {
      name: 'correo',
      label: 'Correo Electrónico',
      type: 'email' as const,
      required: true,
      placeholder: 'usuario@ejemplo.com'
    },
    {
      name: 'nombre_completo',
      label: 'Nombre Completo',
      type: 'text' as const,
      required: true,
      placeholder: 'Nombre completo del usuario'
    },
    {
      name: 'telefono',
      label: 'Teléfono',
      type: 'tel' as const,
      required: false,
      placeholder: '8091234567'
    },
    {
      name: 'id_rol',
      label: 'Rol',
      type: 'select' as const,
      required: true,
      options: roles.map(rol => ({
        value: rol.id_rol.toString(),
        label: rol.nombre_rol
      }))
    },
    {
      name: 'id_suc',
      label: 'Sucursal',
      type: 'select' as const,
      required: false,
      options: sucursales.map(suc => ({
        value: suc.id_suc.toString(),
        label: suc.nombre_sucursal
      }))
    },
    {
      name: 'esta_activo',
      label: 'Estado',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'true', label: 'Activo' },
        { value: 'false', label: 'Inactivo' }
      ]
    }
  ];

  const usuariosColumns = [
    { key: 'nombre_completo', label: 'Nombre Completo' },
    { key: 'correo', label: 'Correo' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'nombre_rol', label: 'Rol' },
    { key: 'nombre_sucursal', label: 'Sucursal' },
    { key: 'esta_activo', label: 'Estado', render: (value: boolean) => value ? 'Activo' : 'Inactivo' },
  ];

  const rolesColumns = [
    { key: 'codigo_rol', label: 'Código' },
    { key: 'nombre_rol', label: 'Nombre' },
    { key: 'nivel_acceso', label: 'Nivel de Acceso' },
    { key: 'total_usuarios', label: 'Total Usuarios' },
    { key: 'esta_activo', label: 'Estado', render: (value: boolean) => value ? 'Activo' : 'Inactivo' },
  ];

  const configuracionesColumns = [
    { key: 'clave', label: 'Clave' },
    { key: 'valor', label: 'Valor' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'descripcion', label: 'Descripción' },
  ];

  const scrapingColumns = [
    { key: 'nombre_configuracion', label: 'Nombre' },
    { key: 'frecuencia_minutos', label: 'Frecuencia (min)' },
    { key: 'esta_activa', label: 'Estado', render: (value: boolean) => value ? 'Activa' : 'Inactiva' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Matriz de Soporte</h1>
          <p className="text-muted-foreground">
            Gestión de usuarios, roles, configuraciones y estadísticas del sistema
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="configuracion" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="scraping" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Scraping
          </TabsTrigger>
          <TabsTrigger value="estadisticas" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestión de Usuarios</CardTitle>
              <Button onClick={handleCreateUsuario}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Usuario
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando usuarios...</div>
              ) : usuarios.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay usuarios registrados. Haga clic en "Nuevo Usuario" para crear uno.
                </div>
              ) : (
                <DataTable
                  data={usuarios}
                  columns={usuariosColumns}
                  actions={[
                    {
                      label: 'Editar',
                      icon: <Edit className="h-4 w-4" />,
                      onClick: handleEditUsuario,
                    },
                    {
                      label: 'Eliminar',
                      icon: <Trash2 className="h-4 w-4" />,
                      onClick: handleDeleteUsuario,
                      variant: 'destructive',
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestión de Roles</CardTitle>
              <Button onClick={() => setShowRolDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Rol
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando roles...</div>
              ) : (
                <DataTable
                  data={roles}
                  columns={rolesColumns}
                  actions={[
                    {
                      label: 'Ver',
                      icon: <Eye className="h-4 w-4" />,
                      onClick: (rol) => {
                        setSelectedRol(rol);
                        setShowRolDialog(true);
                      },
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracion" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Configuración del Sistema</CardTitle>
              <Button onClick={() => setShowConfigDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Configuración
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando configuraciones...</div>
              ) : (
                <DataTable
                  data={configuraciones}
                  columns={configuracionesColumns}
                  actions={[
                    {
                      label: 'Editar',
                      icon: <Edit className="h-4 w-4" />,
                      onClick: (config) => {
                        setSelectedConfig(config);
                        setShowConfigDialog(true);
                      },
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scraping" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Configuración de Scraping</CardTitle>
              <Button onClick={() => setShowScrapingDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Configuración
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Cargando configuraciones...</div>
              ) : (
                <DataTable
                  data={scrapingConfigs}
                  columns={scrapingColumns}
                  actions={[
                    {
                      label: 'Editar',
                      icon: <Edit className="h-4 w-4" />,
                      onClick: (config) => {
                        setSelectedScraping(config);
                        setShowScrapingDialog(true);
                      },
                    },
                  ]}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {departmentStats.map((stat) => (
              <Card key={stat.departamento}>
                <CardHeader>
                  <CardTitle className="text-lg">{stat.departamento}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Trabajos:</span>
                      <span className="font-semibold">{stat.total_trabajos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Completados:</span>
                      <span className="font-semibold text-green-600">{stat.completados}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">En Progreso:</span>
                      <span className="font-semibold text-blue-600">{stat.en_progreso}</span>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Progreso:</span>
                        <span className="font-semibold">
                          {stat.total_trabajos > 0 
                            ? Math.round((stat.completados / stat.total_trabajos) * 100)
                            : 0}%
                        </span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ 
                            width: `${stat.total_trabajos > 0 
                              ? (stat.completados / stat.total_trabajos) * 100 
                              : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para crear/editar usuario */}
      <FormDialog
        open={showUsuarioDialog}
        onOpenChange={setShowUsuarioDialog}
        title={selectedUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
        description={selectedUsuario ? 'Modifique los datos del usuario' : 'Complete los datos del nuevo usuario'}
        fields={usuarioFields}
        initialData={selectedUsuario || {
          correo: '',
          nombre_completo: '',
          telefono: '',
          id_rol: '',
          id_suc: '',
          esta_activo: 'true'
        }}
        onSubmit={handleSaveUsuario}
        submitLabel={selectedUsuario ? 'Actualizar' : 'Crear'}
      />

      {/* Dialog de confirmación para eliminar */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteUsuario}
        title="Eliminar Usuario"
        description={`¿Está seguro de que desea eliminar al usuario ${selectedUsuario?.nombre_completo}?`}
      />
    </div>
  );
}
