'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartComponentProps {
  data: any[];
  dataKey: string;
  xAxisKey: string;
}

export function LineChartComponent({ data, dataKey, xAxisKey }: LineChartComponentProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={dataKey} stroke="#3b82f6" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
