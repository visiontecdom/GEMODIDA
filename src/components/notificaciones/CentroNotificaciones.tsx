'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Notificacion, NotificacionService } from '@/services/NotificacionService';
import { X } from 'lucide-react';

export function CentroNotificaciones() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const service = new NotificacionService();

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      const notifs = await service.obtenerNotificaciones('user-1');
      setNotificaciones(notifs);
    } finally {
      setLoading(false);
    }
  };

  const marcarLeida = async (id: string) => {
    await service.marcarComoLeida(id);
    setNotificaciones(notificaciones.map(n => 
      n.id === id ? { ...n, leida: true } : n
    ));
  };

  if (loading) return <div>Cargando notificaciones...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Centro de Notificaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {notificaciones.length === 0 ? (
            <p className="text-gray-500">No hay notificaciones</p>
          ) : (
            notificaciones.map((notif) => (
              <div
                key={notif.id}
                className={`p-3 border rounded flex justify-between items-start ${
                  notif.leida ? 'bg-gray-50' : 'bg-blue-50'
                }`}
              >
                <div className="flex-1">
                  <div className="flex gap-2 items-center">
                    <Badge variant={notif.tipo === 'error' ? 'destructive' : 'default'}>
                      {notif.tipo}
                    </Badge>
                    <p className="font-medium">{notif.titulo}</p>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notif.mensaje}</p>
                </div>
                {!notif.leida && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => marcarLeida(notif.id!)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
