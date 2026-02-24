import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ChartProps {
  type: 'line' | 'bar';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[];
  dataKeys: { key: string; color: string; name?: string }[];
  xAxisKey: string;
  height?: number;
  title?: string;
}

export default function Chart({
  type,
  data,
  dataKeys,
  xAxisKey,
  height = 300,
  title,
}: ChartProps) {
  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {type === 'line' ? (
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 12, fill: '#666' }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12, fill: '#666' }} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            {dataKeys.map(({ key, color, name }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                name={name || key}
                strokeWidth={2}
                dot={{ r: 3, fill: color }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        ) : (
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fontSize: 12, fill: '#666' }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 12, fill: '#666' }} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e0e0e0',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            {dataKeys.map(({ key, color, name }) => (
              <Bar
                key={key}
                dataKey={key}
                fill={color}
                name={name || key}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
