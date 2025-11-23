import { describe, it, expect } from 'vitest';

// Simulación de una función RPC
const agregarUsuario = async (correo, nombreCompleto, rolId, sucursalId) => {
  if (!correo || !nombreCompleto || !rolId || !sucursalId) {
    throw new Error('Todos los campos son obligatorios');
  }
  return { success: true, correo, nombreCompleto, rolId, sucursalId };
};

describe('Funciones RPC', () => {
  it('Debe agregar un usuario correctamente', async () => {
    const result = await agregarUsuario(
      'test@example.com',
      'Test User',
      1,
      101
    );
    expect(result.success).toBe(true);
    expect(result.correo).toBe('test@example.com');
  });

  it('Debe lanzar un error si faltan campos', async () => {
    await expect(agregarUsuario(null, 'Test User', 1, 101)).rejects.toThrow(
      'Todos los campos son obligatorios'
    );
  });
});