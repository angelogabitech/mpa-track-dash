import { Truck } from '@/types/mpaflow';
import { cn } from '@/lib/utils';
import { Clock3 } from 'lucide-react';

interface Props {
  trucks: Truck[];
  totalCount: number;
}

function presentation(truck: Truck) {
  if (truck.mpa28d === undefined) {
    return truck.riskLevel === 'high'
      ? { label: 'Em risco', style: 'bg-status-warning-bg text-status-warning' }
      : { label: 'Aguardando', style: 'bg-muted text-muted-foreground' };
  }
  if (truck.status === 'rejected') {
    return { label: 'Reprovado', style: 'bg-status-rejected-bg text-status-rejected' };
  }
  if (truck.status === 'above') {
    return { label: 'Acima', style: 'bg-status-above-bg text-status-above' };
  }
  return { label: 'Aprovado', style: 'bg-status-approved-bg text-status-approved' };
}

export function RecentTrucksTable({ trucks, totalCount }: Props) {
  if (trucks.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden animate-fade-in">
      <div className="p-5 border-b">
        <h3 className="text-lg font-semibold text-card-foreground">Últimos caminhões</h3>
        <p className="text-sm text-muted-foreground">Exibindo {trucks.length} de {totalCount} registros</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">NF</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Fornecedor</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Volume</th>
              <th className="text-right p-3 font-medium text-muted-foreground">FCK</th>
              <th className="text-right p-3 font-medium text-muted-foreground">28 dias</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Situação</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map(truck => {
              const current = presentation(truck);
              return (
                <tr key={truck.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 font-medium">{truck.invoiceNumber}</td>
                  <td className="p-3 text-muted-foreground">{truck.supplier}</td>
                  <td className="p-3 text-muted-foreground">{truck.arrivalDate}</td>
                  <td className="p-3 text-right">{truck.volumeM3.toFixed(1)} m³</td>
                  <td className="p-3 text-right">{truck.expectedMPa.toFixed(1)}</td>
                  <td className="p-3 text-right font-medium">{truck.mpa28d?.toFixed(1) ?? '—'}</td>
                  <td className="p-3 text-center">
                    <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', current.style)}>
                      {truck.mpa28d === undefined && <Clock3 className="w-3 h-3" />}
                      {current.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
