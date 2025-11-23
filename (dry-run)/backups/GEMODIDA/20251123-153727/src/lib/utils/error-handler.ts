export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): { message: string; code: string } {
  if (error instanceof AppError) {
    return { message: error.message, code: error.code };
  }

  if (error instanceof Error) {
    return { message: error.message, code: 'UNKNOWN_ERROR' };
  }

  return { message: 'Error desconocido', code: 'UNKNOWN_ERROR' };
}

export const ErrorMessages = {
  UNAUTHORIZED: 'No autorizado',
  FORBIDDEN: 'Acceso denegado',
  NOT_FOUND: 'No encontrado',
  VALIDATION_ERROR: 'Error de validación',
  DATABASE_ERROR: 'Error en la base de datos',
  NETWORK_ERROR: 'Error de conexión',
  UNKNOWN_ERROR: 'Error desconocido',
};

export function getErrorMessage(code: string): string {
  return ErrorMessages[code as keyof typeof ErrorMessages] || ErrorMessages.UNKNOWN_ERROR;
}
