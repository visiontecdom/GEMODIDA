'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook personalizado para monitorear procesos con temporizadores
 * Evita desbordamientos y proporciona control sobre operaciones asíncronas
 */
export function useProcessMonitor() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Función para iniciar un proceso monitoreado
  const startProcess = useCallback((timeoutMs: number = 30000) => {
    setIsProcessing(true);
    setProgress(0);
    setTimeElapsed(0);
    setErrors([]);
    startTimeRef.current = Date.now();

    // Temporizador de progreso
    intervalRef.current = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        // Actualizar progreso basado en tiempo transcurrido
        const progressPercent = Math.min((newTime / (timeoutMs / 1000)) * 100, 95);
        setProgress(progressPercent);
        return newTime;
      });
    }, 1000);

    // Temporizador de timeout para evitar desbordamientos
    timeoutRef.current = setTimeout(() => {
      stopProcess();
      setErrors(prev => [...prev, `Proceso excedió el tiempo límite de ${timeoutMs}ms`]);
    }, timeoutMs);
  }, []);

  // Función para detener el proceso
  const stopProcess = useCallback(() => {
    setIsProcessing(false);
    setProgress(100);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Función para reportar errores
  const reportError = useCallback((error: string) => {
    setErrors(prev => [...prev, error]);
  }, []);

  // Función para actualizar progreso manualmente
  const updateProgress = useCallback((newProgress: number) => {
    setProgress(Math.min(Math.max(newProgress, 0), 100));
  }, []);

  // Cleanup automático
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    isProcessing,
    progress,
    timeElapsed,
    errors,
    startProcess,
    stopProcess,
    reportError,
    updateProgress,
    hasErrors: errors.length > 0
  };
}

/**
 * Hook para monitorear operaciones de red con timeout
 */
export function useNetworkMonitor() {
  const monitor = useProcessMonitor();

  const executeWithTimeout = useCallback(async <T>(
    operation: () => Promise<T>,
    timeoutMs: number = 10000,
    operationName: string = 'Operación'
  ): Promise<T> => {
    monitor.startProcess(timeoutMs);

    try {
      const result = await operation();
      monitor.updateProgress(100);
      monitor.stopProcess();
      return result;
    } catch (error) {
      monitor.reportError(`${operationName} falló: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      monitor.stopProcess();
      throw error;
    }
  }, [monitor]);

  return {
    ...monitor,
    executeWithTimeout
  };
}

/**
 * Hook para monitorear compilaciones y builds
 */
export function useBuildMonitor() {
  const monitor = useProcessMonitor();

  const monitorBuild = useCallback(async (
    buildCommand: () => Promise<void>,
    buildName: string = 'Build'
  ) => {
    monitor.startProcess(120000); // 2 minutos timeout para builds

    try {
      await buildCommand();
      monitor.updateProgress(100);
      monitor.stopProcess();
      return true;
    } catch (error) {
      monitor.reportError(`${buildName} falló: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      monitor.stopProcess();
      return false;
    }
  }, [monitor]);

  return {
    ...monitor,
    monitorBuild
  };
}