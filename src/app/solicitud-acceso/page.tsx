"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function SolicitudAcceso() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nombre: '',
    sucursal: '',
    correo: '',
    telefono: '',
    departamento: '',
    puesto: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // Simulación de envío de correo
      await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      alert('Solicitud enviada correctamente');
      router.push('/');
    } catch (error) {
      console.error('Error al enviar la solicitud:', error);
      alert('Hubo un error al enviar la solicitud. Por favor, inténtelo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold text-center text-foreground mb-8">
            Solicitud de Acceso
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-foreground">
                Nombre Completo
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-border bg-card p-2.5 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="sucursal" className="block text-sm font-medium text-foreground">
                Sucursal de Origen
              </label>
              <input
                type="text"
                id="sucursal"
                name="sucursal"
                value={formData.sucursal}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-border bg-card p-2.5 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-foreground">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="correo"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-border bg-card p-2.5 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="telefono" className="block text-sm font-medium text-foreground">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-border bg-card p-2.5 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="departamento" className="block text-sm font-medium text-foreground">
                Departamento
              </label>
              <input
                type="text"
                id="departamento"
                name="departamento"
                value={formData.departamento}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-border bg-card p-2.5 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </div>
            <div>
              <label htmlFor="puesto" className="block text-sm font-medium text-foreground">
                Puesto o Cargo
              </label>
              <input
                type="text"
                id="puesto"
                name="puesto"
                value={formData.puesto}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-border bg-card p-2.5 text-foreground shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              />
            </div>
            <div className="text-center space-x-4">
              <Button type="submit" size="lg" className="px-8 py-3 bg-card text-foreground border border-border">
                Enviar Solicitud
              </Button>
              <Button
                type="button"
                size="lg"
                className="px-8 py-3 bg-card text-foreground border border-border"
                onClick={() => router.back()}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}