'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ValidadorEncuestaProps {
  estructura: any;
  onValidacionCompleta: (valida: boolean, errores: string[]) => void;
}

export function ValidadorEncuesta({
  estructura,
  onValidacionCompleta,
}: ValidadorEncuestaProps) {
  const [errores, setErrores] = useState<string[]>([]);
  const [valida, setValida] = useState(true);

  const validar = () => {
    const nuevosErrores: string[] = [];

    // Validar título
    if (!estructura.titulo || estructura.titulo.trim() === '') {
      nuevosErrores.push('El título de la encuesta es requerido');
    }

    // Validar descripción
    if (!estructura.descripcion || estructura.descripcion.trim() === '') {
      nuevosErrores.push('La descripción de la encuesta es requerida');
    }

    // Validar preguntas
    if (!estructura.preguntas || estructura.preguntas.length === 0) {
      nuevosErrores.push('La encuesta debe tener al menos una pregunta');
    }

    // Validar cada pregunta
    estructura.preguntas?.forEach((pregunta: any, index: number) => {
      if (!pregunta.texto || pregunta.texto.trim() === '') {
        nuevosErrores.push(`Pregunta ${index + 1}: El texto es requerido`);
      }

      if (pregunta.tipo === 'seleccion' || pregunta.tipo === 'multiple') {
        if (!pregunta.opciones || pregunta.opciones.length < 2) {
          nuevosErrores.push(
            `Pregunta ${index + 1}: Debe tener al menos 2 opciones`
          );
        }
      }

      if (pregunta.tipo === 'escala') {
        if (!pregunta.minimo || !pregunta.maximo) {
          nuevosErrores.push(
            `Pregunta ${index + 1}: Debe definir mínimo y máximo`
          );
        }
      }
    });

    const esValida = nuevosErrores.length === 0;
    setErrores(nuevosErrores);
    setValida(esValida);
    onValidacionCompleta(esValida, nuevosErrores);
  };

  return (
    <div className="space-y-4">
      <button
        onClick={validar}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Validar Encuesta
      </button>

      {errores.length === 0 && valida && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✓ La encuesta es válida y puede ser publicada
          </AlertDescription>
        </Alert>
      )}

      {errores.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="font-semibold mb-2">Errores encontrados:</div>
            <ul className="list-disc list-inside space-y-1">
              {errores.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
