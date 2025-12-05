'use client';

import React from 'react';
import { useProcessMonitor } from '@/hooks/useProcessMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';

interface ProcessMonitorProps {
  title?: string;
  showDetails?: boolean;
  className?: string;
}

/**
 * Componente para monitorear procesos en tiempo real
 * Muestra progreso, tiempo transcurrido y errores
 */
export function ProcessMonitor({
  title = "Estado del Proceso",
  showDetails = true,
  className = ""
}: ProcessMonitorProps) {
  const {
    isProcessing,
    progress,
    timeElapsed,
    errors,
    hasErrors
  } = useProcessMonitor();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusIcon = () => {
    if (hasErrors) return <XCircle className="h-4 w-4 text-red-500" />;
    if (isProcessing) return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
    if (progress === 100) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (hasErrors) return "Error";
    if (isProcessing) return "Procesando";
    if (progress === 100) return "Completado";
    return "Inactivo";
  };

  const getStatusColor = () => {
    if (hasErrors) return "destructive";
    if (isProcessing) return "default";
    if (progress === 100) return "secondary";
    return "outline";
  };

  if (!isProcessing && !hasErrors && progress === 0) {
    return null; // No mostrar si no hay actividad
  }

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          {getStatusIcon()}
          {title}
          <Badge variant={getStatusColor() as any} className="ml-auto">
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Barra de progreso */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progreso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Tiempo transcurrido */}
        {showDetails && (
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Tiempo:</span>
            <span>{formatTime(timeElapsed)}</span>
          </div>
        )}

        {/* Errores */}
        {hasErrors && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-red-600">Errores detectados:</div>
            <div className="space-y-1">
              {errors.map((error, index) => (
                <div key={index} className="text-xs text-red-500 bg-red-50 p-2 rounded">
                  {error}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Información adicional */}
        {showDetails && isProcessing && (
          <div className="text-xs text-muted-foreground">
            Monitoreando proceso para evitar desbordamientos...
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Componente simplificado para mostrar solo el estado
 */
export function ProcessStatus({ className = "" }: { className?: string }) {
  const { isProcessing, hasErrors, progress } = useProcessMonitor();

  if (!isProcessing && !hasErrors) return null;

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      {isProcessing && <Clock className="h-4 w-4 text-blue-500 animate-pulse" />}
      {hasErrors && <XCircle className="h-4 w-4 text-red-500" />}
      {!isProcessing && !hasErrors && progress === 100 && <CheckCircle className="h-4 w-4 text-green-500" />}

      <span>
        {hasErrors ? "Error detectado" :
         isProcessing ? "Procesando..." :
         "Completado"}
      </span>
    </div>
  );
}