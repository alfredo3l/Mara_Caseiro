'use client';

import { TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const chartData = [
  { name: 'Jan', vistorias: 65 },
  { name: 'Fev', vistorias: 59 },
  { name: 'Mar', vistorias: 80 },
  { name: 'Abr', vistorias: 81 },
  { name: 'Mai', vistorias: 56 },
  { name: 'Jun', vistorias: 55 },
  { name: 'Jul', vistorias: 40 },
];

const areaData = [
  { name: 'Seg', value: 31 },
  { name: 'Ter', value: 40 },
  { name: 'Qua', value: 28 },
  { name: 'Qui', value: 51 },
  { name: 'Sex', value: 42 },
  { name: 'Sab', value: 25 },
  { name: 'Dom', value: 20 },
];

export default function Charts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Vistorias por Mês</h2>
            <p className="text-sm text-gray-600">Comparativo mensal de vistorias realizadas</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm text-green-500 bg-green-50 px-2 py-1 rounded-lg">
              <TrendingUp className="w-4 h-4" />
              12.5%
            </span>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="vistorias" fill="#264450" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Area Chart */}
      <div className="bg-white p-6 rounded-xl border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Vistorias da Semana</h2>
            <p className="text-sm text-gray-600">Distribuição semanal de vistorias</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-sm text-primary bg-primary/5 px-2 py-1 rounded-lg">
              Média: 35
            </span>
          </div>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={areaData}>
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#264450"
                fill="url(#colorGradient)"
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#264450" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#264450" stopOpacity={0.01} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 