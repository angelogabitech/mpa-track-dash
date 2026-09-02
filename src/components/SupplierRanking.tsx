import { SupplierMetrics } from '@/types/mpaflow';
import { cn } from '@/lib/utils';
import { Factory, TrendingUp, TrendingDown } from 'lucide-react';

interface SupplierRankingProps {
  suppliers: SupplierMetrics[];
}

export function SupplierRanking({ suppliers }: SupplierRankingProps) {
  if (suppliers.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden animate-fade-in">
      <div className="p-5 border-b">
        <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
          <Factory className="w-5 h-5 text-primary" /> Ranking de Fornecedores
        </h3>
        <p className="text-sm text-muted-foreground">Desempenho comparativo das concreteiras</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">#</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Fornecedor</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Volume</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Caminhões</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Conformidade</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Conf. 7d</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Conf. 28d</th>
              <th className="text-right p-3 font-medium text-muted-foreground">MPa Médio</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Slump Médio</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Reprovação</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Vol. Risco</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s, i) => (
              <tr key={s.name} className="border-b transition-colors hover:bg-muted/30">
                <td className="p-3 font-medium text-card-foreground">{i + 1}</td>
                <td className="p-3 font-medium text-card-foreground flex items-center gap-2">
                  {i === 0 ? <TrendingUp className="w-3.5 h-3.5 text-status-approved" /> :
                   i === suppliers.length - 1 ? <TrendingDown className="w-3.5 h-3.5 text-status-rejected" /> : null}
                  {s.name}
                </td>
                <td className="p-3 text-right text-card-foreground">{s.totalVolume.toFixed(1)} m³</td>
                <td className="p-3 text-right text-card-foreground">{s.totalTrucks}</td>
                <td className={cn('p-3 text-right font-medium',
                  s.complianceRate >= 80 ? 'text-status-approved' : s.complianceRate >= 50 ? 'text-status-warning' : 'text-status-rejected'
                )}>
                  {s.complianceRate.toFixed(1)}%
                </td>
                <td className="p-3 text-right text-card-foreground">{s.compliance7d.toFixed(1)}%</td>
                <td className="p-3 text-right text-card-foreground">{s.compliance28d.toFixed(1)}%</td>
                <td className="p-3 text-right text-card-foreground">{s.avgMpa.toFixed(1)}</td>
                <td className="p-3 text-right text-card-foreground">{s.avgSlump.toFixed(1)}</td>
                <td className={cn('p-3 text-right font-medium',
                  s.rejectionRate > 20 ? 'text-status-rejected' : s.rejectionRate > 10 ? 'text-status-warning' : 'text-status-approved'
                )}>
                  {s.rejectionRate.toFixed(1)}%
                </td>
                <td className={cn('p-3 text-right', s.volumeAtRisk > 0 ? 'text-status-rejected font-medium' : 'text-card-foreground')}>
                  {s.volumeAtRisk.toFixed(1)} m³
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
