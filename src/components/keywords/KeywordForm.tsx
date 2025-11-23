'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useKeywords } from '@/hooks/useKeywords';

// Esquema de validación con Zod
const keywordSchema = z.object({
  palabra: z.string().min(2, 'La palabra clave debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
});

type KeywordFormValues = z.infer<typeof keywordSchema>;

interface KeywordFormProps {
  id?: number | null;
  onSuccess?: () => void;
  defaultValues?: Partial<KeywordFormValues>;
}

export function KeywordForm({ id, onSuccess, defaultValues }: KeywordFormProps) {
  const { keywords, addKeyword, updateKeyword } = useKeywords();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configuración del formulario con react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<KeywordFormValues>({
    resolver: zodResolver(keywordSchema),
    defaultValues: {
      palabra: '',
      descripcion: '',
      ...defaultValues,
    },
  });

  // Cargar datos si es una edición
  useEffect(() => {
    if (id) {
      const keyword = keywords.find((k) => k.id_palabra === id);
      if (keyword) {
        setValue('palabra', keyword.palabra);
        setValue('descripcion', keyword.descripcion || '');
      }
    } else {
      reset({
        palabra: '',
        descripcion: '',
        ...defaultValues,
      });
    }
  }, [id, keywords, setValue, reset, defaultValues]);

  const onSubmit = async (data: KeywordFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (id) {
        // Actualizar palabra clave existente
        await updateKeyword(id, data);
        console.log('Palabra clave actualizada correctamente');
      } else {
        // Crear nueva palabra clave
        await addKeyword(data.palabra, data.descripcion);
        console.log('Palabra clave creada correctamente');
      }

      // Llamar a la función de éxito si existe
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error al guardar la palabra clave:', error);
      console.error('Ocurrió un error al guardar la palabra clave. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="palabra" className="block text-sm font-medium text-gray-700 mb-1">
            Palabra clave <span className="text-red-500">*</span>
          </label>
          <Input
            id="palabra"
            placeholder="Ej: cambio climático"
            {...register('palabra')}
            disabled={isSubmitting}
            className={errors.palabra ? 'border-red-500' : ''}
          />
          {errors.palabra && (
            <p className="mt-1 text-sm text-red-600">{errors.palabra.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción (opcional)
          </label>
          <Textarea
            id="descripcion"
            placeholder="Agrega una descripción para esta palabra clave"
            rows={3}
            {...register('descripcion')}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {id ? 'Actualizando...' : 'Creando...'}
            </>
          ) : id ? (
            'Actualizar palabra clave'
          ) : (
            'Agregar palabra clave'
          )}
        </Button>
      </div>
    </form>
  );
}
