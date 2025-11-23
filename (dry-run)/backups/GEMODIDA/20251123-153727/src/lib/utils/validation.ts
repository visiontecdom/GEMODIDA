import { z } from 'zod';

export const emailSchema = z.string().email('Email inválido');

export const passwordSchema = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres');

export const keywordSchema = z.object({
  palabra: z.string().min(2, 'La palabra debe tener al menos 2 caracteres'),
  descripcion: z.string().optional(),
});

export const userSchema = z.object({
  email: emailSchema,
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  rol: z.enum(['admin', 'operator', 'analyst', 'viewer']),
});

export const surveySchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  descripcion: z.string().optional(),
  estado: z.enum(['activa', 'inactiva', 'cerrada']),
});

export const reportSchema = z.object({
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  tipo: z.enum(['general', 'detallado', 'resumen']),
  descripcion: z.string().optional(),
});

export function validateEmail(email: string): boolean {
  try {
    emailSchema.parse(email);
    return true;
  } catch {
    return false;
  }
}

export function validatePassword(password: string): boolean {
  try {
    passwordSchema.parse(password);
    return true;
  } catch {
    return false;
  }
}
