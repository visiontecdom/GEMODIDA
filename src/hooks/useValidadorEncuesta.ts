import { useState, useCallback } from 'react';

export interface ErrorValidacion {
  campo: string;
  mensaje: string;
  tipo: 'error' | 'warning';
}

export function useValidadorEncuesta() {
  const [errores, setErrores] = useState<ErrorValidacion[]>([]);
  const [valida, setValida] = useState(true);

  const validar = useCallback((estructura: any): boolean => {
    const nuevosErrores: ErrorValidacion[] = [];

    // Validar título
    if (!estructura.titulo?.trim()) {
      nuevosErrores.push({
        campo: 'titulo',
        mensaje: 'El título es requerido',
        tipo: 'error',
      });
    } else if (estructura.titulo.length < 5) {
      nuevosErrores.push({
        campo: 'titulo',
        mensaje: 'El título debe tener al menos 5 caracteres',
        tipo: 'warning',
      });
    }

    // Validar descripción
    if (!estructura.descripcion?.trim()) {
      nuevosErrores.push({
        campo: 'descripcion',
        mensaje: 'La descripción es requerida',
        tipo: 'error',
      });
    }

    // Validar preguntas
    if (!estructura.preguntas?.length) {
      nuevosErrores.push({
        campo: 'preguntas',
        mensaje: 'Debe haber al menos una pregunta',
        tipo: 'error',
      });
    } else {
      estructura.preguntas.forEach((pregunta: any, idx: number) => {
        if (!pregunta.texto?.trim()) {
          nuevosErrores.push({
            campo: `pregunta_${idx}_texto`,
            mensaje: `Pregunta ${idx + 1}: El texto es requerido`,
            tipo: 'error',
          });
        }

        if (pregunta.tipo === 'seleccion' || pregunta.tipo === 'multiple') {
          if (!pregunta.opciones?.length || pregunta.opciones.length < 2) {
            nuevosErrores.push({
              campo: `pregunta_${idx}_opciones`,
              mensaje: `Pregunta ${idx + 1}: Debe tener al menos 2 opciones`,
              tipo: 'error',
            });
          }
        }

        if (pregunta.tipo === 'escala') {
          if (!pregunta.minimo || !pregunta.maximo) {
            nuevosErrores.push({
              campo: `pregunta_${idx}_escala`,
              mensaje: `Pregunta ${idx + 1}: Debe definir mínimo y máximo`,
              tipo: 'error',
            });
          }
        }
      });
    }

    const esValida = !nuevosErrores.some((e) => e.tipo === 'error');
    setErrores(nuevosErrores);
    setValida(esValida);
    return esValida;
  }, []);

  const limpiar = useCallback(() => {
    setErrores([]);
    setValida(true);
  }, []);

  return {
    errores,
    valida,
    validar,
    limpiar,
  };
}
