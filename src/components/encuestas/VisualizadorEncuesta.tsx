'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Save,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Star
} from 'lucide-react';

interface PreguntaEncuesta {
  id: string;
  tipo: 'texto' | 'numero' | 'seleccion_unica' | 'seleccion_multiple' | 'escala' | 'fecha' | 'boolean' | 'archivo';
  titulo: string;
  descripcion?: string;
  requerida: boolean;
  opciones?: string[];
  min_valor?: number;
  max_valor?: number;
  validacion?: {
    patron?: string;
    mensaje_error?: string;
  };
}

interface SeccionEncuesta {
  id: string;
  titulo: string;
  descripcion?: string;
  preguntas: PreguntaEncuesta[];
}

interface EstructuraEncuesta {
  titulo: string;
  descripcion?: string;
  secciones: SeccionEncuesta[];
  configuracion: {
    permitir_guardado_parcial: boolean;
    mostrar_progreso: boolean;
    tiempo_limite_minutos?: number;
    requiere_ubicacion: boolean;
  };
}

interface VisualizadorEncuestaProps {
  encuesta: EstructuraEncuesta;
  onSubmit: (respuestas: Record<string, any>, metadatos: any) => void;
  onGuardarParcial?: (respuestas: Record<string, any>, metadatos: any) => void;
  onCancelar: () => void;
  loading?: boolean;
  modoPreview?: boolean;
}

export function VisualizadorEncuesta({ 
  encuesta, 
  onSubmit, 
  onGuardarParcial,
  onCancelar, 
  loading = false,
  modoPreview = false
}: VisualizadorEncuestaProps) {
  const [seccionActual, setSeccionActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, any>>({});
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [tiempoInicio] = useState(new Date());
  const [ubicacion, setUbicacion] = useState<GeolocationPosition | null>(null);

  // Obtener ubicación GPS si es requerida
  const obtenerUbicacion = useCallback(() => {
    if (encuesta.configuracion.requiere_ubicacion && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUbicacion(position),
        (error) => console.error('Error obteniendo ubicación:', error)
      );
    }
  }, [encuesta.configuracion.requiere_ubicacion]);

  // Inicializar ubicación al montar
  useState(() => {
    obtenerUbicacion();
  });

  // Calcular progreso
  const calcularProgreso = useCallback(() => {
    const totalPreguntas = encuesta.secciones.reduce((total, seccion) => total + seccion.preguntas.length, 0);
    const preguntasRespondidas = Object.keys(respuestas).length;
    return totalPreguntas > 0 ? (preguntasRespondidas / totalPreguntas) * 100 : 0;
  }, [encuesta.secciones, respuestas]);

  // Validar pregunta individual
  const validarPregunta = useCallback((pregunta: PreguntaEncuesta, valor: any): string | null => {
    // Verificar si es requerida
    if (pregunta.requerida && (valor === undefined || valor === null || valor === '')) {
      return `${pregunta.titulo} es requerido`;
    }

    // Si no hay valor y no es requerida, es válida
    if (valor === undefined || valor === null || valor === '') {
      return null;
    }

    // Validaciones específicas por tipo
    switch (pregunta.tipo) {
      case 'numero':
        if (isNaN(Number(valor))) {
          return 'Debe ser un número válido';
        }
        const num = Number(valor);
        if (pregunta.min_valor !== undefined && num < pregunta.min_valor) {
          return `Debe ser mayor o igual a ${pregunta.min_valor}`;
        }
        if (pregunta.max_valor !== undefined && num > pregunta.max_valor) {
          return `Debe ser menor o igual a ${pregunta.max_valor}`;
        }
        break;

      case 'escala':
        const escala = Number(valor);
        if (isNaN(escala) || escala < (pregunta.min_valor || 1) || escala > (pregunta.max_valor || 5)) {
          return `Debe estar entre ${pregunta.min_valor || 1} y ${pregunta.max_valor || 5}`;
        }
        break;

      case 'seleccion_unica':
        if (pregunta.opciones && !pregunta.opciones.includes(valor)) {
          return 'Opción no válida';
        }
        break;

      case 'seleccion_multiple':
        if (Array.isArray(valor) && pregunta.opciones) {
          const opcionesInvalidas = valor.filter(v => !pregunta.opciones!.includes(v));
          if (opcionesInvalidas.length > 0) {
            return `Opciones no válidas: ${opcionesInvalidas.join(', ')}`;
          }
        }
        break;

      case 'fecha':
        if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
          return 'Formato de fecha inválido (YYYY-MM-DD)';
        }
        break;

      case 'texto':
        if (pregunta.validacion?.patron) {
          const regex = new RegExp(pregunta.validacion.patron);
          if (!regex.test(valor)) {
            return pregunta.validacion.mensaje_error || 'Formato no válido';
          }
        }
        break;
    }

    return null;
  }, []);

  // Actualizar respuesta
  const actualizarRespuesta = useCallback((preguntaId: string, valor: any) => {
    setRespuestas(prev => ({
      ...prev,
      [preguntaId]: valor
    }));

    // Limpiar error si existe
    if (errores[preguntaId]) {
      setErrores(prev => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[preguntaId];
        return nuevosErrores;
      });
    }
  }, [errores]);

  // Validar sección actual
  const validarSeccionActual = useCallback(() => {
    const seccion = encuesta.secciones[seccionActual];
    const nuevosErrores: Record<string, string> = {};

    seccion.preguntas.forEach(pregunta => {
      const error = validarPregunta(pregunta, respuestas[pregunta.id]);
      if (error) {
        nuevosErrores[pregunta.id] = error;
      }
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  }, [encuesta.secciones, seccionActual, respuestas, validarPregunta]);

  // Navegar a siguiente sección
  const siguienteSeccion = useCallback(() => {
    if (validarSeccionActual() && seccionActual < encuesta.secciones.length - 1) {
      setSeccionActual(prev => prev + 1);
    }
  }, [validarSeccionActual, seccionActual, encuesta.secciones.length]);

  // Navegar a sección anterior
  const seccionAnterior = useCallback(() => {
    if (seccionActual > 0) {
      setSeccionActual(prev => prev - 1);
    }
  }, [seccionActual]);

  // Enviar encuesta
  const enviarEncuesta = useCallback(() => {
    // Validar todas las secciones
    let todasValidas = true;
    const todosLosErrores: Record<string, string> = {};

    encuesta.secciones.forEach(seccion => {
      seccion.preguntas.forEach(pregunta => {
        const error = validarPregunta(pregunta, respuestas[pregunta.id]);
        if (error) {
          todosLosErrores[pregunta.id] = error;
          todasValidas = false;
        }
      });
    });

    if (!todasValidas) {
      setErrores(todosLosErrores);
      return;
    }

    // Calcular duración
    const duracionMinutos = Math.round((new Date().getTime() - tiempoInicio.getTime()) / (1000 * 60));

    // Preparar metadatos
    const metadatos = {
      duracion_minutos: duracionMinutos,
      ubicacion_gps: ubicacion ? `${ubicacion.coords.latitude},${ubicacion.coords.longitude}` : undefined,
      fecha_completado: new Date().toISOString(),
      progreso_final: 100
    };

    onSubmit(respuestas, metadatos);
  }, [encuesta.secciones, respuestas, validarPregunta, tiempoInicio, ubicacion, onSubmit]);

  // Guardar parcialmente
  const guardarParcial = useCallback(() => {
    if (!onGuardarParcial) return;

    const duracionMinutos = Math.round((new Date().getTime() - tiempoInicio.getTime()) / (1000 * 60));
    const progreso = calcularProgreso();

    const metadatos = {
      duracion_minutos: duracionMinutos,
      ubicacion_gps: ubicacion ? `${ubicacion.coords.latitude},${ubicacion.coords.longitude}` : undefined,
      fecha_guardado: new Date().toISOString(),
      progreso_actual: progreso,
      seccion_actual: seccionActual
    };

    onGuardarParcial(respuestas, metadatos);
  }, [onGuardarParcial, tiempoInicio, calcularProgreso, ubicacion, respuestas, seccionActual]);

  // Renderizar pregunta según tipo
  const renderizarPregunta = (pregunta: PreguntaEncuesta) => {
    const valor = respuestas[pregunta.id];
    const error = errores[pregunta.id];

    const baseProps = {
      id: pregunta.id,
      disabled: loading || modoPreview
    };

    return (
      <div key={pregunta.id} className="space-y-3">
        <div>
          <Label htmlFor={pregunta.id} className="text-base font-medium">
            {pregunta.titulo}
            {pregunta.requerida && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {pregunta.descripcion && (
            <p className="text-sm text-gray-600 mt-1">{pregunta.descripcion}</p>
          )}
        </div>

        <div>
          {pregunta.tipo === 'texto' && (
            <Textarea
              {...baseProps}
              value={valor || ''}
              onChange={(e) => actualizarRespuesta(pregunta.id, e.target.value)}
              placeholder="Escribe tu respuesta..."
              rows={3}
              className={error ? 'border-red-500' : ''}
            />
          )}

          {pregunta.tipo === 'numero' && (
            <Input
              {...baseProps}
              type="number"
              value={valor || ''}
              onChange={(e) => actualizarRespuesta(pregunta.id, e.target.value)}
              placeholder="Ingresa un número"
              min={pregunta.min_valor}
              max={pregunta.max_valor}
              className={error ? 'border-red-500' : ''}
            />
          )}

          {pregunta.tipo === 'fecha' && (
            <Input
              {...baseProps}
              type="date"
              value={valor || ''}
              onChange={(e) => actualizarRespuesta(pregunta.id, e.target.value)}
              className={error ? 'border-red-500' : ''}
            />
          )}

          {pregunta.tipo === 'seleccion_unica' && (
            <div className="space-y-2">
              {pregunta.opciones?.map((opcion, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={`${pregunta.id}-${index}`}
                    name={pregunta.id}
                    value={opcion}
                    checked={valor === opcion}
                    onChange={(e) => actualizarRespuesta(pregunta.id, e.target.value)}
                    disabled={loading || modoPreview}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Label htmlFor={`${pregunta.id}-${index}`} className="text-sm font-normal">
                    {opcion}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {pregunta.tipo === 'seleccion_multiple' && (
            <div className="space-y-2">
              {pregunta.opciones?.map((opcion, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`${pregunta.id}-${index}`}
                    value={opcion}
                    checked={Array.isArray(valor) && valor.includes(opcion)}
                    onChange={(e) => {
                      const valorActual = Array.isArray(valor) ? valor : [];
                      if (e.target.checked) {
                        actualizarRespuesta(pregunta.id, [...valorActual, opcion]);
                      } else {
                        actualizarRespuesta(pregunta.id, valorActual.filter(v => v !== opcion));
                      }
                    }}
                    disabled={loading || modoPreview}
                    className="h-4 w-4 text-blue-600"
                  />
                  <Label htmlFor={`${pregunta.id}-${index}`} className="text-sm font-normal">
                    {opcion}
                  </Label>
                </div>
              ))}
            </div>
          )}

          {pregunta.tipo === 'escala' && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{pregunta.min_valor || 1}</span>
                <span>{pregunta.max_valor || 5}</span>
              </div>
              <div className="flex space-x-2">
                {Array.from({ length: (pregunta.max_valor || 5) - (pregunta.min_valor || 1) + 1 }, (_, i) => {
                  const valorEscala = (pregunta.min_valor || 1) + i;
                  return (
                    <Button
                      key={valorEscala}
                      variant={valor === valorEscala ? "default" : "outline"}
                      size="sm"
                      onClick={() => actualizarRespuesta(pregunta.id, valorEscala)}
                      disabled={loading || modoPreview}
                      className="w-12 h-12"
                    >
                      {valorEscala}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {pregunta.tipo === 'boolean' && (
            <div className="flex space-x-4">
              <Button
                variant={valor === true ? "default" : "outline"}
                onClick={() => actualizarRespuesta(pregunta.id, true)}
                disabled={loading || modoPreview}
              >
                Sí
              </Button>
              <Button
                variant={valor === false ? "default" : "outline"}
                onClick={() => actualizarRespuesta(pregunta.id, false)}
                disabled={loading || modoPreview}
              >
                No
              </Button>
            </div>
          )}

          {pregunta.tipo === 'archivo' && (
            <Input
              {...baseProps}
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  actualizarRespuesta(pregunta.id, {
                    nombre: file.name,
                    tamaño: file.size,
                    tipo: file.type
                  });
                }
              }}
              className={error ? 'border-red-500' : ''}
            />
          )}
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  };

  const seccionActualData = encuesta.secciones[seccionActual];
  const progreso = calcularProgreso();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">{encuesta.titulo}</h1>
        {encuesta.descripcion && (
          <p className="text-gray-600">{encuesta.descripcion}</p>
        )}
        {modoPreview && (
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            Vista Previa
          </Badge>
        )}
      </div>

      {/* Barra de progreso */}
      {encuesta.configuracion.mostrar_progreso && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progreso</span>
            <span>{Math.round(progreso)}%</span>
          </div>
          <Progress value={progreso} className="h-2" />
        </div>
      )}

      {/* Información de tiempo y ubicación */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          {encuesta.configuracion.tiempo_limite_minutos && (
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>Límite: {encuesta.configuracion.tiempo_limite_minutos} min</span>
            </div>
          )}
          {encuesta.configuracion.requiere_ubicacion && (
            <div className="flex items-center space-x-1">
              <MapPin className="h-4 w-4" />
              <span>{ubicacion ? 'Ubicación obtenida' : 'Obteniendo ubicación...'}</span>
            </div>
          )}
        </div>
        <div>
          Sección {seccionActual + 1} de {encuesta.secciones.length}
        </div>
      </div>

      {/* Contenido de la sección */}
      <Card>
        <CardHeader>
          <CardTitle>{seccionActualData.titulo}</CardTitle>
          {seccionActualData.descripcion && (
            <CardDescription>{seccionActualData.descripcion}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {seccionActualData.preguntas.map(pregunta => renderizarPregunta(pregunta))}
        </CardContent>
      </Card>

      {/* Controles de navegación */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={seccionAnterior}
            disabled={seccionActual === 0 || loading}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Anterior
          </Button>
          
          {encuesta.configuracion.permitir_guardado_parcial && onGuardarParcial && !modoPreview && (
            <Button
              variant="outline"
              onClick={guardarParcial}
              disabled={loading}
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Parcial
            </Button>
          )}
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onCancelar}
            disabled={loading}
          >
            {modoPreview ? 'Cerrar' : 'Cancelar'}
          </Button>

          {seccionActual < encuesta.secciones.length - 1 ? (
            <Button
              onClick={siguienteSeccion}
              disabled={loading}
            >
              Siguiente
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={enviarEncuesta}
              disabled={loading || modoPreview}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {loading ? 'Enviando...' : 'Completar Encuesta'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}