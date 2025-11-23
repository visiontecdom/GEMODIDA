'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Download, FileText, X, RefreshCw, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'user_action' | 'navigation' | 'api';
  message: string;
  source: string;
  details?: any;
  userAction?: boolean;
}

interface DiagnosticData {
  logs: LogEntry[];
  userAgent: string;
  url: string;
  timestamp: string;
  sessionDuration: number;
  errors: LogEntry[];
  userActions: number;
  performanceMetrics: {
    pageLoadTime: number;
    connectionStatus: string;
  };
  systemInfo: {
    screenResolution: string;
    timezone: string;
    language: string;
  };
}

export function DiagnosticLogger() {
  const [isVisible, setIsVisible] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    errors: 0,
    userActions: 0,
    apiCalls: 0
  });

  // Limited storage - only store essential logs
  const LOG_LIMIT = 50; // máximo de logs en memoria
  const LOG_DETAIL_LIMIT = 500; // máximo de caracteres en details
  const LOG_DOWNLOAD_LIMIT = 100; // máximo de logs en archivo descargado
  const logsRef = useRef<LogEntry[]>([]);
  const statsRef = useRef({
    totalEvents: 0,
    errors: 0,
    userActions: 0,
    apiCalls: 0
  });
  const startTime = useRef<number>(Date.now());
  const cleanupFunctions = useRef<(() => void)[]>([]);
  const fetchPatched = useRef<boolean>(false);

  useEffect(() => {
    // Initialize logging system
    initializeLogging();

    // Registrar navegación (popstate y pushState/replaceState)
    const navHandler = () => {
      addLog('navigation', `Navegación: ${window.location.pathname}`, 'Router', {
        pathname: window.location.pathname,
        href: window.location.href
      });
    };
    window.addEventListener('popstate', navHandler);
    // Parchear pushState y replaceState
    const origPushState = window.history.pushState;
    const origReplaceState = window.history.replaceState;
    window.history.pushState = function (...args) {
      origPushState.apply(this, args);
      navHandler();
    };
    window.history.replaceState = function (...args) {
      origReplaceState.apply(this, args);
      navHandler();
    };

    // Cleanup
    cleanupFunctions.current.push(() => {
      window.removeEventListener('popstate', navHandler);
      window.history.pushState = origPushState;
      window.history.replaceState = origReplaceState;
    });

    // Listen for custom diagnostic events from app
    const customHandler = (ev: Event) => {
      const e = ev as CustomEvent;
      const d = e.detail || {};
      if (d.level && d.message) {
        addLog(d.level, d.message, d.source || 'App', d.details);
      }
    };
    window.addEventListener('GEMODIDA:diag', customHandler as EventListener);
    cleanupFunctions.current.push(() => window.removeEventListener('GEMODIDA:diag', customHandler as EventListener));

    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeLogging = () => {
    console.log('🔧 Sistema de diagnóstico iniciado');
    
    // Setup lightweight error monitoring
    setupErrorMonitoring();
    
    // Setup user interaction monitoring
    setupUserMonitoring();
    
    // Setup basic API monitoring
    setupApiMonitoring();
    
    // Add initial log
    addLog('info', 'Sistema de diagnóstico iniciado', 'System', {
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
  };

  const setupErrorMonitoring = () => {
    // JavaScript errors - essential only
    const errorHandler = (event: ErrorEvent) => {
      addLog('error', `Error: ${event.message}`, 'Window', {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        pathname: window.location.pathname,
        href: window.location.href
      });
    };

    // Promise rejections - essential only
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      addLog('error', `Promise rejected`, 'Promise', {
        reason: String(event.reason).substring(0, 100),
        pathname: window.location.pathname,
        href: window.location.href
      });
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);
    
    // Store cleanup functions
    cleanupFunctions.current.push(() => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    });
  };

  const setupUserMonitoring = () => {
    // Monitor clicks on interactive elements only
    const clickHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const element = target.closest('button, a, [role="button"]') as HTMLElement;
      
      if (element) {
        addLog('user_action', `Click: ${getElementDescription(element)}`, 'User', {
          tagName: element.tagName,
          textContent: element.textContent?.substring(0, 50),
          pathname: window.location.pathname,
          href: window.location.href
        });
        updateStats({ userActions: 1 });
      }
    };

    // Only monitor clicks, not every interaction
    document.addEventListener('click', clickHandler, { passive: true });
    
    cleanupFunctions.current.push(() => {
      document.removeEventListener('click', clickHandler);
    });
  };

  const setupApiMonitoring = () => {
    // Proteger para no parchear fetch varias veces
    if (fetchPatched.current) return;
    fetchPatched.current = true;
    // Lightweight fetch monitoring
    const originalFetch = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method || 'GET';
      // Only log API calls to our domain or Supabase
      if (isRelevantApiCall(url)) {
        addLog('api', `${method} ${url}`, 'Fetch', { method });
        updateStats({ apiCalls: 1 });
      }
      try {
        const response = await originalFetch(input, init);
        // Log errors only
        if (!response.ok && isRelevantApiCall(url)) {
          addLog('error', `API Error: ${response.status}`, 'Fetch', {
            url,
            status: response.status
          });
        }
        return response;
      } catch (error) {
        if (isRelevantApiCall(url)) {
          addLog('error', `API Error: ${error}`, 'Fetch', { url });
        }
        throw error;
      }
    };
    cleanupFunctions.current.push(() => {
      window.fetch = originalFetch;
      fetchPatched.current = false;
    });
  };

  const isRelevantApiCall = (url: string): boolean => {
    // Only log relevant API calls
    return url.includes('supabase') || 
           url.includes(window.location.hostname) || 
           url.includes('/api/') ||
           url.includes('/auth/');
  };

  const getElementDescription = (element: HTMLElement): string => {
    if (element.tagName === 'BUTTON') {
      return element.textContent?.trim() || 'Button';
    }
    if (element.tagName === 'A') {
      return element.textContent?.trim() || 'Link';
    }
    if (element.getAttribute('role') === 'button') {
      return element.textContent?.trim() || 'Role button';
    }
    return element.tagName;
  };

  const sanitizeDetails = (details: any) => {
    if (!details) return undefined;
    try {
      if (typeof details === 'string') {
        return details.length > LOG_DETAIL_LIMIT ? details.substring(0, LOG_DETAIL_LIMIT) + '...' : details;
      }
      // Si es objeto, serializar y limitar
      const str = JSON.stringify(details);
      return str.length > LOG_DETAIL_LIMIT ? str.substring(0, LOG_DETAIL_LIMIT) + '...' : str;
    } catch {
      return '[Unserializable details]';
    }
  };

  const addLog = (level: LogEntry['level'], message: string, source: string, details?: any) => {
    const logEntry: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      level,
      message,
      source,
      details: sanitizeDetails(details),
      userAction: level === 'user_action'
    };
    // Store in ref with limit
    logsRef.current.push(logEntry);
    // Keep only last LOG_LIMIT logs to prevent memory issues
    if (logsRef.current.length > LOG_LIMIT) {
      logsRef.current = logsRef.current.slice(-LOG_LIMIT);
    }
    // Update stats in ref only
    updateStats({ 
      totalEvents: 1, 
      errors: level === 'error' ? 1 : 0,
      userActions: level === 'user_action' ? 1 : 0,
      apiCalls: level === 'api' ? 1 : 0
    });
  };

  // Efecto seguro: sincroniza logs y stats cada 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs((prev) => {
        // Solo actualizar si hay cambios
        const refLogs = logsRef.current;
        if (prev.length !== refLogs.length || prev[prev.length-1]?.id !== refLogs[refLogs.length-1]?.id) {
          return [...refLogs];
        }
        return prev;
      });
      setStats((prev) => {
        const refStats = statsRef.current;
        // Solo actualizar si hay cambios
        if (
          prev.totalEvents !== refStats.totalEvents ||
          prev.errors !== refStats.errors ||
          prev.userActions !== refStats.userActions ||
          prev.apiCalls !== refStats.apiCalls
        ) {
          return { ...refStats };
        }
        return prev;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const updateStats = (increments: Partial<typeof stats>) => {
    Object.keys(increments).forEach((key) => {
      const k = key as keyof typeof stats;
      statsRef.current[k] = (statsRef.current[k] || 0) + (increments[k] || 0);
    });
  };

  const cleanup = () => {
    // Execute all cleanup functions
    cleanupFunctions.current.forEach(cleanupFn => {
      try {
        cleanupFn();
      } catch (e) {
        // Silently ignore cleanup errors
      }
    });
    
    cleanupFunctions.current = [];
    
    console.log('🔧 Sistema de diagnóstico detenido');
  };

  const downloadLogs = () => {
    const sessionDuration = Date.now() - startTime.current;
    const errors = logsRef.current.filter(log => log.level === 'error');
    // Limitar la cantidad de logs exportados
    const logsToExport = logsRef.current.slice(-LOG_DOWNLOAD_LIMIT);
    const diagnosticData: DiagnosticData = {
      logs: logsToExport,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      sessionDuration,
      errors,
      userActions: stats.userActions,
      performanceMetrics: {
        pageLoadTime: performance.now(),
        connectionStatus: navigator.onLine ? 'online' : 'offline'
      },
      systemInfo: {
        screenResolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      }
    };
    const blob = new Blob([JSON.stringify(diagnosticData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/:/g, '-')
      .replace(/\..+/, '')
      .replace('T', '-');
    a.download = `GEMODIDA-diagnostic-${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('info', 'Logs descargados', 'System');
  };

  const clearLogs = () => {
    logsRef.current = [];
    setLogs([]);
    statsRef.current = {
      totalEvents: 0,
      errors: 0,
      userActions: 0,
      apiCalls: 0
    };
    setStats({
      totalEvents: 0,
      errors: 0,
      userActions: 0,
      apiCalls: 0
    });
    startTime.current = Date.now();
  };

  const refreshLogs = () => {
    setLogs([...logsRef.current]);
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-20 right-4 z-50 bg-orange-500 hover:bg-orange-600 text-white rounded-full w-12 h-12 p-0 shadow-lg"
        aria-label="Diagnóstico de aplicación"
      >
        <FileText className="h-5 w-5" />
      </Button>

      {/* Diagnostic Panel */}
      {isVisible && (
        <div className="fixed bottom-32 right-4 z-50 bg-white border rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Diagnóstico</h3>
            <Button
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
            <div className="flex items-center justify-between">
              <span>Total:</span>
              <span className="font-medium">{stats.totalEvents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Errores:</span>
              <span className="text-red-600 font-medium">{stats.errors}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Acciones:</span>
              <span className="text-blue-600 font-medium">{stats.userActions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>API:</span>
              <span className="text-purple-600 font-medium">{stats.apiCalls}</span>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <Button
              onClick={refreshLogs}
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Actualizar
            </Button>
            <Button
              onClick={clearLogs}
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
            >
              Limpiar
            </Button>
            <Button
              onClick={downloadLogs}
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              disabled={logs.length === 0}
            >
              <Download className="h-3 w-3 mr-1" />
              Descargar
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50 rounded p-2">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">
                Esperando eventos...
              </p>
            ) : (
              <div className="space-y-1">
                {logs.slice(-10).map((log) => (
                  <div key={log.id} className="text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-white text-[10px] ${
                        log.level === 'error' ? 'bg-red-500' :
                        log.level === 'warn' ? 'bg-yellow-500' :
                        log.level === 'user_action' ? 'bg-blue-500' :
                        log.level === 'navigation' ? 'bg-purple-500' :
                        log.level === 'api' ? 'bg-indigo-500' :
                        'bg-gray-500'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-[10px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700 mt-1 break-all">{log.message}</p>
                    {log.userAction && (
                      <p className="text-blue-600 text-[10px] mt-0.5">👆 Usuario</p>
                    )}
                  </div>
                ))}
                {logs.length > 10 && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    ... y {logs.length - 10} más
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}