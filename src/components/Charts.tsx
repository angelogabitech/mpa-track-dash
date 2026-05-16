import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell } from 'recharts';
import { Truck } from '@/types/mpaflow';
import { getMPaEvolutionData, getStatusDistribution } from '@/lib/mpaflow';

interface ChartsProps {
  trucks: Truck[];
  rankingData: { name: string; complianceRate: number }[];
}

export function Charts({ trucks, rankingData }: ChartsProps) {
  const evolutionData = getMPaEvolutionData(trucks);
  const statusData = getStatusDistribution(trucks);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
      {/* MPa Evolution */}
      <div className="bg-card rounded-xl border shadow-sm p-5">
        <h3 className="text-lg font-semibold text-card-foreground mb-1">Evolução do MPa</h3>
        <p className="text-sm text-muted-foreground mb-4">Esperado vs Atingido por caminhão</p>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={evolutionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: 12,
              }}
            />
            <Line type="monotone" dataKey="expected" stroke="hsl(var(--chart-expected))" strokeWidth={2} name="Esperado" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="achieved" stroke="hsl(var(--chart-achieved))" strokeWidth={2} name="Atingido" dot={{ r: 3 }} />
            <Legend />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Status Distribution */}
      <div className="bg-card rounded-xl border shadow-sm p-5">
        <h3 className="text-lg font-semibold text-card-foreground mb-1">Distribuição por Status</h3>
        <p className="text-sm text-muted-foreground mb-4">Classificação dos caminhões</p>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
              {statusData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Ranking by compliance */}
      <div className="bg-card rounded-xl border shadow-sm p-5 lg:col-span-2">
        <h3 className="text-lg font-semibold text-card-foreground mb-1">Ranking de Pavimentos</h3>
        <p className="text-sm text-muted-foreground mb-4">Taxa de conformidade por pavimento</p>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={rankingData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
            <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: 12,
              }}
              formatter={(value: number) => [`${value.toFixed(1)}%`, 'Conformidade']}
            />
            <Bar dataKey="complianceRate" fill="hsl(var(--chart-expected))" radius={[6, 6, 0, 0]} name="Conformidade %" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
