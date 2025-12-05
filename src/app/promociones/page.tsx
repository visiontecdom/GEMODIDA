'use client';

import { useEffect } from 'react';
import { usePromociones } from '@/hooks/usePromociones';
import { FormularioPromocion } from '@/components/promociones/FormularioPromocion';
import { ListaPromociones } from '@/components/promociones/ListaPromociones';
import { AnalisisROI } from '@/components/promociones/AnalisisROI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PromocionesPage() {
  const { promociones, loading, error, listar, crear, eliminar, ejecutar } = usePromociones();

  useEffect(() => {
    listar();
  }, []);

  const handleCrear = async (data: any) => {
    await crear(data);
    await listar();
  };

  const handleEliminar = async (id: number) => {
    await eliminar(id);
  };

  const handleEjecutar = async (id: number) => {
    await ejecutar(id);
  };

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Gestión de Promociones</h1>
      
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FormularioPromocion onSubmit={handleCrear} loading={loading} />
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>Total: {promociones.length}</p>
            <p>Activas: {promociones.filter(p => p.estado === 'activa').length}</p>
            <p>Pausadas: {promociones.filter(p => p.estado === 'pausada').length}</p>
          </CardContent>
        </Card>
      </div>

      <ListaPromociones
        promociones={promociones}
        onEliminar={handleEliminar}
        onEjecutar={handleEjecutar}
        loading={loading}
      />

      {promociones.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {promociones.slice(0, 2).map(promo => (
            <AnalisisROI key={promo.id} promocion={promo} />
          ))}
        </div>
      )}
    </div>
  );
}
