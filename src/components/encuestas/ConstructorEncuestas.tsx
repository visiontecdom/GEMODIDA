'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  Save,
  Settings,
  Type,
  Hash,
  Calendar,
  CheckSquare,
  Radio,
  Sliders,
  Upload,
  ToggleLeft
} from 'lucide-react';

// Tipos de preguntas disponibles
const TIPOS_PREGUNTA = [
  { value: 'texto', label: 'Texto', icon: Type, description: 'Respuesta de texto libre' },
  { value: 'numero', label: 'Número', icon: Hash, description: 'Valor numérico' },
  { value: 'fecha', label: 'Fecha', icon: Calendar, description: 'Selector de fecha' },
  { value: 'seleccion_unica', label: 'Selección Única', icon: Radio, description: 'Una opción de varias' },
  { value: 'seleccion_multiple', label: 'Selección Múltiple', icon: CheckSquare, description: 'Múltiples opciones' },
  { value: 'escala', label: 'Escala', icon: Sliders, description: 'Escala numérica (1-5, 1-10)' },
  { value: 'boolean', label: 'Sí/No', icon: ToggleLeft, description: 'Respuesta booleana' },
  { value: 'archivo', label: 'Archivo', icon: Upload, description: 'Subida de archivos' }
];

interface PreguntaEncuesta {
  id: string;
  tipo: string;
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

interface ConstructorEncuestasProps {
  encuestaInicial?: EstructuraEncuesta;
  onGuardar: (encuesta: EstructuraEncuesta) => void;
  onPreview: (encuesta: EstructuraEncuesta) => void;
  loading?: boolean;
}

export function ConstructorEncuestas({ 
  encuestaInicial, 
  onGuardar, 
  onPreview, 
  loading = false 
}: ConstructorEncuestasProps) {
  const [encuesta, setEncuesta] = useState<EstructuraEncuesta>(
    encuestaInicial || {
      titulo: '',
      descripcion: '',
      secciones: [{
        id: 'seccion-1',
        titulo: 'Sección Principal',
        descripcion: '',
        preguntas: []
      }],
      configuracion: {
        permitir_guardado_parcial: true,
        mostrar_progreso: true,
        requiere_ubicacion: false
      }
    }
  );

  const [seccionActiva, setSeccionActiva] = useState(0);
  const [preguntaEditando, setPreguntaEditando] = useState<string | null>(null);

  // Generar ID único
  const generarId = useCallback(() => {
    return Math.random().toString(36).substr(2, 9);
  }, []);

  // Actualizar información general de la encuesta
  const actualizarEncuesta = useCallback((campo: string, valor: any) => {
    setEncuesta(prev => ({
      ...prev,
      [campo]: valor
    }));
  }, []);

  // Actualizar configuración
  const actualizarConfiguracion = useCallback((campo: string, valor: any) => {
    setEncuesta(prev => ({
      ...prev,
      configuracion: {
        ...prev.configuracion,
        [campo]: valor
      }
    }));
  }, []);

  // Agregar nueva sección
  const agregarSeccion = useCallback(() => {
    const nuevaSeccion: SeccionEncuesta = {
      id: `seccion-${generarId()}`,
      titulo: `Sección ${encuesta.secciones.length + 1}`,
      descripcion: '',
      preguntas: []
    };

    setEncuesta(prev => ({
      ...prev,
      secciones: [...prev.secciones, nuevaSeccion]
    }));
  }, [encuesta.secciones.length, generarId]);

  // Eliminar sección
  const eliminarSeccion = useCallback((indiceSeccion: number) => {
    if (encuesta.secciones.length <= 1) return;

    setEncuesta(prev => ({
      ...prev,
      secciones: prev.secciones.filter((_, i) => i !== indiceSeccion)
    }));

    if (seccionActiva >= encuesta.secciones.length - 1) {
      setSeccionActiva(Math.max(0, encuesta.secciones.length - 2));
    }
  }, [encuesta.secciones.length, seccionActiva]);

  // Actualizar sección
  const actualizarSeccion = useCallback((indiceSeccion: number, campo: string, valor: any) => {
    setEncuesta(prev => ({
      ...prev,
      secciones: prev.secciones.map((seccion, i) => 
        i === indiceSeccion ? { ...seccion, [campo]: valor } : seccion
      )
    }));
  }, []);

  // Agregar nueva pregunta
  const agregarPregunta = useCallback((indiceSeccion: number, tipo: string) => {
    const nuevaPregunta: PreguntaEncuesta = {
      id: `pregunta-${generarId()}`,
      tipo,
      titulo: '',
      descripcion: '',
      requerida: false,
      ...(tipo === 'seleccion_unica' || tipo === 'seleccion_multiple' ? { opciones: ['Opción 1'] } : {}),
      ...(tipo === 'escala' ? { min_valor: 1, max_valor: 5 } : {}),
      ...(tipo === 'numero' ? { min_valor: undefined, max_valor: undefined } : {})
    };

    setEncuesta(prev => ({
      ...prev,
      secciones: prev.secciones.map((seccion, i) => 
        i === indiceSeccion 
          ? { ...seccion, preguntas: [...seccion.preguntas, nuevaPregunta] }
          : seccion
      )
    }));

    setPreguntaEditando(nuevaPregunta.id);
  }, [generarId]);

  // Eliminar pregunta
  const eliminarPregunta = useCallback((indiceSeccion: number, indicePregunta: number) => {
    setEncuesta(prev => ({
      ...prev,
      secciones: prev.secciones.map((seccion, i) => 
        i === indiceSeccion 
          ? { ...seccion, preguntas: seccion.preguntas.filter((_, j) => j !== indicePregunta) }
          : seccion
      )
    }));
  }, []);

  // Actualizar pregunta
  const actualizarPregunta = useCallback((indiceSeccion: number, indicePregunta: number, campo: string, valor: any) => {
    setEncuesta(prev => ({
      ...prev,
      secciones: prev.secciones.map((seccion, i) => 
        i === indiceSeccion 
          ? {
              ...seccion,
              preguntas: seccion.preguntas.map((pregunta, j) => 
                j === indicePregunta ? { ...pregunta, [campo]: valor } : pregunta
              )
            }
          : seccion
      )
    }));
  }, []);

  // Agregar opción a pregunta de selección
  const agregarOpcion = useCallback((indiceSeccion: number, indicePregunta: number) => {
    const seccion = encuesta.secciones[indiceSeccion];
    const pregunta = seccion.preguntas[indicePregunta];
    const nuevasOpciones = [...(pregunta.opciones || []), `Opción ${(pregunta.opciones?.length || 0) + 1}`];
    
    actualizarPregunta(indiceSeccion, indicePregunta, 'opciones', nuevasOpciones);
  }, [encuesta.secciones, actualizarPregunta]);

  // Eliminar opción
  const eliminarOpcion = useCallback((indiceSeccion: number, indicePregunta: number, indiceOpcion: number) => {
    const seccion = encuesta.secciones[indiceSeccion];
    const pregunta = seccion.preguntas[indicePregunta];
    const nuevasOpciones = pregunta.opciones?.filter((_, i) => i !== indiceOpcion) || [];
    
    actualizarPregunta(indiceSeccion, indicePregunta, 'opciones', nuevasOpciones);
  }, [encuesta.secciones, actualizarPregunta]);

  // Renderizar editor de pregunta
  const renderizarEditorPregunta = (pregunta: PreguntaEncuesta, indiceSeccion: number, indicePregunta: number) => {
    const tipoPregunta = TIPOS_PREGUNTA.find(t => t.value === pregunta.tipo);
    const IconoPregunta = tipoPregunta?.icon || Type;

    return (
      <Card key={pregunta.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
              <IconoPregunta className="h-4 w-4 text-blue-600" />
              <Badge variant="outline">{tipoPregunta?.label}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPreguntaEditando(preguntaEditando === pregunta.id ? null : pregunta.id)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => eliminarPregunta(indiceSeccion, indicePregunta)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            {/* Título de la pregunta */}
            <div>
              <Label htmlFor={`titulo-${pregunta.id}`}>Título de la pregunta *</Label>
              <Input
                id={`titulo-${pregunta.id}`}
                value={pregunta.titulo}
                onChange={(e) => actualizarPregunta(indiceSeccion, indicePregunta, 'titulo', e.target.value)}
                placeholder="Escribe la pregunta..."
                className="mt-1"
              />
            </div>

            {/* Descripción */}
            <div>
              <Label htmlFor={`desc-${pregunta.id}`}>Descripción (opcional)</Label>
              <Textarea
                id={`desc-${pregunta.id}`}
                value={pregunta.descripcion || ''}
                onChange={(e) => actualizarPregunta(indiceSeccion, indicePregunta, 'descripcion', e.target.value)}
                placeholder="Descripción adicional..."
                rows={2}
                className="mt-1"
              />
            </div>

            {/* Configuración específica por tipo */}
            {preguntaEditando === pregunta.id && (
              <div className="border-t pt-4 space-y-4">
                {/* Opciones para selección única/múltiple */}
                {(pregunta.tipo === 'seleccion_unica' || pregunta.tipo === 'seleccion_multiple') && (
                  <div>
                    <Label>Opciones</Label>
                    <div className="space-y-2 mt-2">
                      {pregunta.opciones?.map((opcion, indiceOpcion) => (
                        <div key={indiceOpcion} className="flex items-center space-x-2">
                          <Input
                            value={opcion}
                            onChange={(e) => {
                              const nuevasOpciones = [...(pregunta.opciones || [])];
                              nuevasOpciones[indiceOpcion] = e.target.value;
                              actualizarPregunta(indiceSeccion, indicePregunta, 'opciones', nuevasOpciones);
                            }}
                            placeholder={`Opción ${indiceOpcion + 1}`}
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => eliminarOpcion(indiceSeccion, indicePregunta, indiceOpcion)}
                            disabled={(pregunta.opciones?.length || 0) <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => agregarOpcion(indiceSeccion, indicePregunta)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Opción
                      </Button>
                    </div>
                  </div>
                )}

                {/* Configuración para escalas y números */}
                {(pregunta.tipo === 'escala' || pregunta.tipo === 'numero') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`min-${pregunta.id}`}>Valor Mínimo</Label>
                      <Input
                        id={`min-${pregunta.id}`}
                        type="number"
                        value={pregunta.min_valor || ''}
                        onChange={(e) => actualizarPregunta(indiceSeccion, indicePregunta, 'min_valor', parseInt(e.target.value) || undefined)}
                        placeholder={pregunta.tipo === 'escala' ? '1' : 'Min'}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`max-${pregunta.id}`}>Valor Máximo</Label>
                      <Input
                        id={`max-${pregunta.id}`}
                        type="number"
                        value={pregunta.max_valor || ''}
                        onChange={(e) => actualizarPregunta(indiceSeccion, indicePregunta, 'max_valor', parseInt(e.target.value) || undefined)}
                        placeholder={pregunta.tipo === 'escala' ? '5' : 'Max'}
                      />
                    </div>
                  </div>
                )}

                {/* Pregunta requerida */}
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`requerida-${pregunta.id}`}
                    checked={pregunta.requerida}
                    onCheckedChange={(checked) => actualizarPregunta(indiceSeccion, indicePregunta, 'requerida', checked)}
                  />
                  <Label htmlFor={`requerida-${pregunta.id}`}>Pregunta requerida</Label>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Constructor de Encuestas</h1>
          <p className="text-gray-600 mt-1">Diseña encuestas dinámicas y personalizadas</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => onPreview(encuesta)}>
            <Eye className="h-4 w-4 mr-2" />
            Vista Previa
          </Button>
          <Button onClick={() => onGuardar(encuesta)} disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panel de configuración */}
        <div className="lg:col-span-1 space-y-4">
          {/* Información general */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="titulo-encuesta">Título de la Encuesta *</Label>
                <Input
                  id="titulo-encuesta"
                  value={encuesta.titulo}
                  onChange={(e) => actualizarEncuesta('titulo', e.target.value)}
                  placeholder="Título de la encuesta"
                />
              </div>
              <div>
                <Label htmlFor="desc-encuesta">Descripción</Label>
                <Textarea
                  id="desc-encuesta"
                  value={encuesta.descripcion || ''}
                  onChange={(e) => actualizarEncuesta('descripcion', e.target.value)}
                  placeholder="Descripción de la encuesta"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuración */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configuración</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="guardado-parcial"
                  checked={encuesta.configuracion.permitir_guardado_parcial}
                  onCheckedChange={(checked) => actualizarConfiguracion('permitir_guardado_parcial', checked)}
                />
                <Label htmlFor="guardado-parcial">Permitir guardado parcial</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="mostrar-progreso"
                  checked={encuesta.configuracion.mostrar_progreso}
                  onCheckedChange={(checked) => actualizarConfiguracion('mostrar_progreso', checked)}
                />
                <Label htmlFor="mostrar-progreso">Mostrar progreso</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="requiere-ubicacion"
                  checked={encuesta.configuracion.requiere_ubicacion}
                  onCheckedChange={(checked) => actualizarConfiguracion('requiere_ubicacion', checked)}
                />
                <Label htmlFor="requiere-ubicacion">Requiere ubicación GPS</Label>
              </div>

              <div>
                <Label htmlFor="tiempo-limite">Tiempo límite (minutos)</Label>
                <Input
                  id="tiempo-limite"
                  type="number"
                  value={encuesta.configuracion.tiempo_limite_minutos || ''}
                  onChange={(e) => actualizarConfiguracion('tiempo_limite_minutos', parseInt(e.target.value) || undefined)}
                  placeholder="Sin límite"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tipos de preguntas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tipos de Preguntas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {TIPOS_PREGUNTA.map((tipo) => {
                  const IconoTipo = tipo.icon;
                  return (
                    <Button
                      key={tipo.value}
                      variant="outline"
                      size="sm"
                      className="justify-start h-auto p-3"
                      onClick={() => agregarPregunta(seccionActiva, tipo.value)}
                    >
                      <IconoTipo className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium">{tipo.label}</div>
                        <div className="text-xs text-gray-500">{tipo.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor principal */}
        <div className="lg:col-span-3">
          {/* Pestañas de secciones */}
          <div className="flex items-center space-x-2 mb-6">
            {encuesta.secciones.map((seccion, indice) => (
              <Button
                key={seccion.id}
                variant={seccionActiva === indice ? "default" : "outline"}
                size="sm"
                onClick={() => setSeccionActiva(indice)}
              >
                {seccion.titulo}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={agregarSeccion}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Editor de sección activa */}
          {encuesta.secciones[seccionActiva] && (
            <div className="space-y-6">
              {/* Configuración de sección */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Configuración de Sección</CardTitle>
                    {encuesta.secciones.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => eliminarSeccion(seccionActiva)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Título de la Sección</Label>
                    <Input
                      value={encuesta.secciones[seccionActiva].titulo}
                      onChange={(e) => actualizarSeccion(seccionActiva, 'titulo', e.target.value)}
                      placeholder="Título de la sección"
                    />
                  </div>
                  <div>
                    <Label>Descripción de la Sección</Label>
                    <Textarea
                      value={encuesta.secciones[seccionActiva].descripcion || ''}
                      onChange={(e) => actualizarSeccion(seccionActiva, 'descripcion', e.target.value)}
                      placeholder="Descripción de la sección"
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Preguntas */}
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Preguntas ({encuesta.secciones[seccionActiva].preguntas.length})
                </h3>
                
                {encuesta.secciones[seccionActiva].preguntas.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Type className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 text-center">
                        No hay preguntas en esta sección.<br />
                        Selecciona un tipo de pregunta del panel lateral para comenzar.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {encuesta.secciones[seccionActiva].preguntas.map((pregunta, indicePregunta) =>
                      renderizarEditorPregunta(pregunta, seccionActiva, indicePregunta)
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}