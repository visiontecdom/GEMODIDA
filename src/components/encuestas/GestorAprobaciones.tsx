'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useEncuestasPersonalizadas } from '@/hooks/useEncuestasPersonalizadas';
import { useRoleSystem } from '@/hooks/useRoleSystem';
import { useToast } from '@/components/ui/use-toast';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  MessageSquare,
  ArrowRight,
  Send
} from 'lucide-react';

// Estados del ciclo de vida
const ESTADOS_CICLO = [
  { value: 'borrador', label: 'Borrador', icon: Clock, color: 'bg-gray-100 text-gray-800' },
  { value: 'revision', label: 'En Revisión', icon: AlertTriangle, color: 'bg-yellow-100 text-yellow-800' },
  { value: 'aprobacion', label: 'Pendiente Aprobación', icon: User, color: 'bg-blue-100 text-blue-800' },
  { value: 'publicacion', label: 'Lista para Publicar', icon: Send, color: 'bg-indigo-100 text-indigo-800' },
  { value: 'recoleccion', label: 'Recolectando Datos', icon: MessageSquare, color: 'bg-green-100 text-green-800' },
  { value: 'cierre', label: 'Cerrada', icon: XCircle, color: 'bg-orange-100 text-orange-800' },
  { value: 'validacion', label: 'En Validación', icon: CheckCircle, color: 'bg-teal-100 text-teal-800' },
  { value: 'informe_preliminar', label: 'Informe Preliminar', icon: MessageSquare, color: 'bg-cyan-100 text-cyan-800' },
  { value: 'informe_final', label: 'Informe Final', icon: MessageSquare, color: 'bg-emerald-100 text-emerald-800' },
  { value: 'archivo', label: 'Archivada', icon: CheckCircle, color: 'bg-gray-100 text-gray-600' }
];

interface GestorAprobacionesProps {
  encuesta: any;
  onEstadoActualizado?: () => void;
}

export function GestorAprobaciones({ encuesta, onEstadoActualizado }: GestorAprobacionesProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comentario, setComentario] = useState('');
  const [estadoSeleccionado, setEstadoSeleccionado] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const { actualizarEstadoEncuesta } = useEncuestasPersonalizadas();
  const { hasRole } = useRoleSystem();
  const { toast } = useToast();

  // Obtener estado actual
  const estadoActual = encuesta.estado || 'borrador';
  const estadoActualInfo = ESTADOS_CICLO.find(e => e.value === estadoActual);

  // Transiciones permitidas según el estado actual
  const getTransicionesPermitidas = useCallback((estado: string) => {
    const transiciones: Record<string, string[]> = {
      'borrador': ['revision'],
      'revision': ['aprobacion', 'borrador'],
      'aprobacion': ['publicacion', 'revision'],
      'publicacion': ['recoleccion'],
      'recoleccion': ['cierre'],
      'cierre': ['validacion'],
      'validacion': ['informe_preliminar'],
      'informe_preliminar': ['informe_final'],
      'informe_final': ['archivo'],
      'archivo': []
    };
    return transiciones[estado] || [];
  }, []);

  const transicionesPermitidas = getTransicionesPermitidas(estadoActual);

  // Verificar si el usuario puede cambiar el estado
  const puedeCambiarEstado = useCallback((nuevoEstado: string) => {
    if (!hasRole('gerente') && !hasRole('admin')) return false;

    // Lógica adicional según permisos por estado
    switch (nuevoEstado) {
      case 'aprobacion':
        return hasRole('gerente'); // Solo gerentes pueden aprobar
      case 'publicacion':
        return hasRole('gerente'); // Solo gerentes pueden publicar
      case 'cierre':
        return hasRole('gerente') || hasRole('encuestador'); // Gerentes o encuestadores pueden cerrar
      case 'validacion':
        return hasRole('gerente'); // Solo gerentes pueden validar
      case 'archivo':
        return hasRole('gerente'); // Solo gerentes pueden archivar
      default:
        return true;
    }
  }, [hasRole]);

  // Cambiar estado de la encuesta
  const cambiarEstado = useCallback(async () => {
    if (!estadoSeleccionado || !comentario.trim()) {
      toast({
        title: 'Error',
        description: 'Debe seleccionar un estado y agregar un comentario',
        variant: 'destructive'
      });
      return;
    }

    if (!puedeCambiarEstado(estadoSeleccionado)) {
      toast({
        title: 'Error',
        description: 'No tiene permisos para realizar esta acción',
        variant: 'destructive'
      });
      return;
    }

    try {
      setLoading(true);

      await actualizarEstadoEncuesta(encuesta.id_diseno, estadoSeleccionado as any);

      toast({
        title: 'Éxito',
        description: `Estado cambiado a ${ESTADOS_CICLO.find(e => e.value === estadoSeleccionado)?.label}`
      });

      setDialogOpen(false);
      setComentario('');
      setEstadoSeleccionado('');

      if (onEstadoActualizado) {
        onEstadoActualizado();
      }

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Error al cambiar el estado',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [estadoSeleccionado, comentario, puedeCambiarEstado, actualizarEstadoEncuesta, encuesta.id_diseno, toast, onEstadoActualizado]);

  return (
    <div className="space-y-6">
      {/* Estado Actual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {estadoActualInfo && <estadoActualInfo.icon className="h-5 w-5" />}
            <span>Estado Actual</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            <Badge className={estadoActualInfo?.color}>
              {estadoActualInfo?.label}
            </Badge>
            <span className="text-sm text-gray-600">
              Última actualización: {new Date(encuesta.actualizado_en || encuesta.creado_en).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Flujo del Ciclo de Vida */}
      <Card>
        <CardHeader>
          <CardTitle>Ciclo de Vida de la Encuesta</CardTitle>
          <CardDescription>
            Flujo completo desde la creación hasta el archivo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {ESTADOS_CICLO.map((estado, index) => {
              const isCompleted = ESTADOS_CICLO.findIndex(e => e.value === estadoActual) >= index;
              const isCurrent = estado.value === estadoActual;

              return (
                <div key={estado.value} className="flex items-center space-x-2">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    isCompleted ? 'bg-green-100 text-green-600' :
                    isCurrent ? 'bg-blue-100 text-blue-600' :
                    'bg-gray-100 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <estado.icon className="h-4 w-4" />
                    )}
                  </div>
                  <span className={`text-sm ${isCurrent ? 'font-semibold' : ''}`}>
                    {estado.label}
                  </span>
                  {index < ESTADOS_CICLO.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Acciones Disponibles */}
      {transicionesPermitidas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Acciones Disponibles</CardTitle>
            <CardDescription>
              Transiciones permitidas desde el estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {transicionesPermitidas.map(estadoValue => {
                const estado = ESTADOS_CICLO.find(e => e.value === estadoValue);
                if (!estado) return null;

                const puedeAccionar = puedeCambiarEstado(estadoValue);

                return (
                  <Dialog key={estadoValue} open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start h-auto p-4"
                        disabled={!puedeAccionar}
                        onClick={() => setEstadoSeleccionado(estadoValue)}
                      >
                        <div className="flex items-center space-x-3">
                          <estado.icon className="h-5 w-5" />
                          <div className="text-left">
                            <div className="font-medium">{estado.label}</div>
                            <div className="text-sm text-gray-500">
                              {puedeAccionar ? 'Click para cambiar' : 'Sin permisos'}
                            </div>
                          </div>
                        </div>
                      </Button>
                    </DialogTrigger>

                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Cambiar Estado de Encuesta</DialogTitle>
                        <DialogDescription>
                          Cambiar "{encuesta.titulo}" de {estadoActualInfo?.label} a {estado.label}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Comentario (requerido)</label>
                          <Textarea
                            placeholder="Explique el motivo del cambio de estado..."
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            className="mt-1"
                          />
                        </div>

                        <div className="flex justify-end space-x-3">
                          <Button
                            variant="outline"
                            onClick={() => setDialogOpen(false)}
                          >
                            Cancelar
                          </Button>
                          <Button
                            onClick={cambiarEstado}
                            disabled={loading || !comentario.trim()}
                          >
                            {loading ? 'Cambiando...' : 'Confirmar Cambio'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información de Permisos */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            <p><strong>Estado actual:</strong> {estadoActualInfo?.label}</p>
            <p><strong>Sus permisos:</strong> {hasRole('gerente') ? 'Gerente' : hasRole('admin') ? 'Administrador' : 'Usuario limitado'}</p>
            <p><strong>Transiciones disponibles:</strong> {transicionesPermitidas.length}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}