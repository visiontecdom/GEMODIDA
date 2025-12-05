import { useState } from 'react';
import { PromocioneService, Promocion } from '@/services/PromocioneService';

export function usePromociones() {
  const [promociones, setPromociones] = useState<Promocion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const service = new PromocioneService();

  const listar = async (filtros?: Record<string, any>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await service.listarPromociones(filtros);
      setPromociones(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const crear = async (data: Promocion) => {
    setLoading(true);
    setError(null);
    try {
      await service.validarReglas(data);
      const result = await service.crearPromocion(data);
      setPromociones([result, ...promociones]);
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const actualizar = async (id: number, data: Partial<Promocion>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.actualizarPromocion(id, data);
      setPromociones(promociones.map(p => p.id === id ? result : p));
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const eliminar = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await service.eliminarPromocion(id);
      setPromociones(promociones.filter(p => p.id !== id));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const ejecutar = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const result = await service.ejecutarPromocion(id);
      await listar();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const calcularROI = async (id: number) => {
    try {
      return await service.calcularROI(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    promociones,
    loading,
    error,
    listar,
    crear,
    actualizar,
    eliminar,
    ejecutar,
    calcularROI
  };
}
