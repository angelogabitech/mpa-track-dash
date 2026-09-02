import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { Truck } from '@/types/mpaflow';
import { getMPaEvolutionData } from '@/lib/mpaflow';

export function Charts({ trucks }: { trucks: Truck[] }) {
  if (trucks.length === 0) return null;
  const data = getMPaEvolutionData(trucks);

  return (
    <div className="bg-card rounded-xl border shadow-sm p-5 animate-fade-in">
      <h3 className="text-lg font-semibold text-card-foreground mb-1">Esperado × resultado</h3>
      <p className="text-sm text-muted-foreground mb-4">
        A projeção de 7 dias aparece separada do resultado definitivo de 28 dias.
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
          <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit=" MPa" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => [value.toFixed(1) + ' MPa', name]}
          />
          <Line type="monotone" dataKey="expected" stroke="hsl(var(--chart-expected))" strokeWidth={2} name="FCK esperado" dot={{ r: 3 }} />
          <Line type="monotone" dataKey="predicted" stroke="hsl(var(--chart-warning))" strokeWidth={2} strokeDasharray="6 4" name="Projeção 28d" dot={{ r: 3 }} connectNulls={false} />
          <Line type="monotone" dataKey="achieved" stroke="hsl(var(--chart-achieved))" strokeWidth={2} name="Resultado 28d" dot={{ r: 4 }} connectNulls={false} />
          <Legend />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
