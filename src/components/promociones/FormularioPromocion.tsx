'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Promocion } from '@/services/PromocioneService';

interface Props {
  onSubmit: (data: Promocion) => Promise<void>;
  loading?: boolean;
}

export function FormularioPromocion({ onSubmit, loading }: Props) {
  const [formData, setFormData] = useState<Partial<Promocion>>({
    nombre: '',
    descripcion: '',
    tipo: 'porcentaje',
    valor: 0,
    estado: 'borrador',
    fecha_inicio: '',
    fecha_fin: '',
    limite_uso: 100
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData as Promocion);
    setFormData({
      nombre: '',
      descripcion: '',
      tipo: 'porcentaje',
      valor: 0,
      estado: 'borrador',
      fecha_inicio: '',
      fecha_fin: '',
      limite_uso: 100
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nueva Promoción</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Nombre"
            value={formData.nombre || ''}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <Input
            placeholder="Descripción"
            value={formData.descripcion || ''}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          />
          <select
            value={formData.tipo || 'porcentaje'}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="porcentaje">Porcentaje</option>
            <option value="fijo">Fijo</option>
            <option value="bogo">BOGO</option>
          </select>
          <Input
            type="number"
            placeholder="Valor"
            value={formData.valor || 0}
            onChange={(e) => setFormData({ ...formData, valor: parseFloat(e.target.value) })}
            required
          />
          <Input
            type="date"
            value={formData.fecha_inicio || ''}
            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
            required
          />
          <Input
            type="date"
            value={formData.fecha_fin || ''}
            onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
            required
          />
          <Input
            type="number"
            placeholder="Límite de uso"
            value={formData.limite_uso || 100}
            onChange={(e) => setFormData({ ...formData, limite_uso: parseInt(e.target.value) })}
            required
          />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creando...' : 'Crear Promoción'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
