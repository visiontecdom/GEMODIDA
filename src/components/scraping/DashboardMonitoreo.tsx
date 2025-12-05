'use client';

import { useScraping } from '@/hooks/useScraping';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

const COLORES = ['#10b981', '#ef4444', '#6b7280'];

export function DashboardMonitoreo() {
  const { resultados } = useScraping();
  const [busqueda, setBusqueda] = useState('');

  const resultadosFiltrados = resultados.filter((r) =>
    r.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const datosSentimiento = Object.entries(
    resultados.reduce((acc: any, r) => {
      acc[r.sentimiento] = (acc[r.sentimiento] || 0) + 1;
      return acc;
    }, {})
  ).map(([sentimiento, cantidad]) => ({ sentimiento, cantidad }));

  const datosFuente = Object.entries(
    resultados.reduce((acc: any, r) => {
      acc[r.fuente] = (acc[r.fuente] || 0) + 1;
      return acc;
    }, {})
  ).map(([fuente, cantidad]) => ({ fuente, cantidad }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold">{resultados.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Positivos</div>
          <div className="text-2xl font-bold">
            {resultados.filter((r) => r.sentimiento === 'positivo').length}
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Negativos</div>
          <div className="text-2xl font-bold">
            {resultados.filter((r) => r.sentimiento === 'negativo').length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-4">Sentimientos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={datosSentimiento}
                dataKey="cantidad"
                nameKey="sentimiento"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {datosSentimiento.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold mb-4">Por Fuente</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={datosFuente}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fuente" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border">
        <h3 className="font-semibold mb-4">Resultados</h3>
        <Input
          placeholder="Buscar..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-4"
        />
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {resultadosFiltrados.map((r, idx) => (
            <div key={idx} className="border p-3 rounded">
              <p className="font-medium">{r.titulo}</p>
              <p className="text-sm text-gray-600">{r.contenido}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{r.fuente}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  r.sentimiento === 'positivo' ? 'bg-green-100 text-green-800' :
                  r.sentimiento === 'negativo' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {r.sentimiento}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
