'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useKeywords } from '@/hooks/useKeywords';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, RefreshCw, Search, FileText, AlertCircle, Users, Settings, Activity, Database, Plus, Eye, UserPlus } from 'lucide-react';
import { BarChartComponent } from '@/components/charts/BarChartComponent';
import { PieChartComponent } from '@/components/charts/PieChartComponent';

export default function DashboardPage() {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const { stats, loading } = useDashboardStats();
  const { keywords } = useKeywords();

  const chartData = useMemo(() => {
    if (!keywords || keywords.length === 0) return [];
    return keywords.slice(0, 5).map(k => ({
      name: k.palabra,
      resultados: k.total_resultados || 0,
    }));
  }, [keywords]);



  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: 'Usuarios Activos', value: stats.usuarios_activos },
      { name: 'Usuarios Inactivos', value: Math.max(0, stats.total_usuarios - stats.usuarios_activos) },
    ];
  }, [stats]);



  const statCards = stats ? [
    {
      title: 'Total Usuarios',
      value: stats.total_usuarios.toString(),
      icon: <Search className="h-6 w-6 text-primary" />,
      change: `${stats.usuarios_activos} activos hoy`,
    },
    {
      title: 'Palabras Clave',
      value: stats.total_palabras_clave.toString(),
      icon: <BarChart className="h-6 w-6 text-primary" />,
      change: `${stats.total_resultados} resultados`,
    },
    {
      title: 'Reportes Pendientes',
      value: stats.reportes_pendientes.toString(),
      icon: <FileText className="h-6 w-6 text-primary" />,
      change: 'En proceso',
    },
    {
      title: 'Alertas',
      value: stats.alertas_activas.toString(),
      icon: <AlertCircle className="h-6 w-6 text-red-500" />,
      change: 'Requiere atención',
    },
  ] : [];



  const recentActivities = [
    { id: 1, action: 'Nueva palabra clave agregada', time: 'Hace 2 minutos' },
    { id: 2, action: 'Scraping completado para 5 fuentes', time: 'Hace 1 hora' },
    { id: 3, action: 'Reporte semanal generado', time: 'Hace 5 horas' },
    { id: 4, action: `Usuario ${user?.email || 'usuario'} inició sesión`, time: 'Ahora mismo' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Panel Principal</h1>
          <p className="text-muted-foreground">
            ¡Bienvenido de vuelta! Esto es lo que está pasando con tu GEMODIDA.
          </p>
        </div>
        <Button>
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar Datos
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">Cargando datos...</div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-foreground">{stat.title}</CardTitle>
                  <div className="h-6 w-6">{stat.icon}</div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.change}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Resultados por Palabra Clave</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <BarChartComponent data={chartData} dataKey="resultados" xAxisKey="name" />
                ) : (
                  <p className="text-muted-foreground">Sin datos disponibles</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estado de Usuarios</CardTitle>
              </CardHeader>
              <CardContent>
                {pieData.length > 0 ? (
                  <PieChartComponent data={pieData} dataKey="value" nameKey="name" />
                ) : (
                  <p className="text-muted-foreground">Sin datos disponibles</p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="text-foreground">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Ver
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-dashed border-2 border-border hover:border-primary transition-colors hover:shadow-md">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-1 text-foreground">Agregar Palabra Clave</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Agrega una nueva palabra clave para monitorear
                </p>
                <Button onClick={() => router.push('/keywords')}>Agregar</Button>
              </CardContent>
            </Card>

            <Card className="border-dashed border-2 border-border hover:border-primary transition-colors hover:shadow-md">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <BarChart className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-1 text-foreground">Generar Reporte</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Crea un reporte personalizado con tus datos
                </p>
                <Button variant="outline" onClick={() => router.push('/reports')}>Crear Reporte</Button>
              </CardContent>
            </Card>

            <Card className="border-dashed border-2 border-border hover:border-primary transition-colors hover:shadow-md">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="rounded-full bg-primary/10 p-3 mb-4">
                  <AlertCircle className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-1 text-foreground">Ver Alertas</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Revisa notificaciones importantes del sistema
                </p>
                <Button variant="outline">Ver Alertas</Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Gestión de Datos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button className="w-full justify-start" onClick={() => router.push('/keywords')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Palabra Clave
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/results')}>
                    <Eye className="mr-2 h-4 w-4" />
                    Ver Resultados
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/surveys')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Gestionar Encuestas
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Reportes y Análisis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  <Button className="w-full justify-start" onClick={() => router.push('/reports')}>
                    <FileText className="mr-2 h-4 w-4" />
                    Crear Informe
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/activities')}>
                    <Activity className="mr-2 h-4 w-4" />
                    Ver Actividades
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Ver Alertas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {userRole === 'admin' && (
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Administración
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  <Button variant="secondary" className="w-full justify-start" onClick={() => router.push('/admin/users')}>
                    <Users className="mr-2 h-4 w-4" />
                    Gestionar Usuarios
                  </Button>
                  <Button variant="secondary" className="w-full justify-start" onClick={() => router.push('/admin/roles')}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Gestionar Roles
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/logs')}>
                    <Database className="mr-2 h-4 w-4" />
                    Logs del Sistema
                  </Button>
                  <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configuración
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
