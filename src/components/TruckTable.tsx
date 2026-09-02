import { useState } from 'react';
import { Truck, CalculistApproval } from '@/types/mpaflow';
import { cn } from '@/lib/utils';
import { CheckCircle2, XCircle, TrendingUp, Trash2, ShieldCheck, ShieldX, Search, Info } from 'lucide-react';
import { TruckDetailsDialog } from '@/components/TruckDetailsDialog';

const statusConfig = {
  approved: { label: 'Aprovado', icon: CheckCircle2, className: 'text-status-approved bg-status-approved-bg' },
  rejected: { label: 'Reprovado', icon: XCircle, className: 'text-status-rejected bg-status-rejected-bg' },
  above: { label: 'Acima', icon: TrendingUp, className: 'text-status-above bg-status-above-bg' },
};

const calculistConfig: Record<CalculistApproval, { label: string; className: string }> = {
  approved: { label: 'Aprovado', className: 'bg-status-approved-bg text-status-approved' },
  rejected: { label: 'Reprovado', className: 'bg-status-rejected-bg text-status-rejected' },
  analyzing: { label: 'Em análise', className: 'bg-muted text-muted-foreground' },
};

interface TruckTableProps {
  trucks: Truck[];
  onRemove?: (truckId: string) => void;
  onCalculistApproval?: (truckId: string, approval: CalculistApproval) => void;
}

export function TruckTable({ trucks, onRemove, onCalculistApproval }: TruckTableProps) {
  const [animatingId, setAnimatingId] = useState<string | null>(null);
  const [detailsTruck, setDetailsTruck] = useState<Truck | null>(null);

  return (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden animate-fade-in">
      <div className="p-5 border-b">
        <h3 className="text-lg font-semibold text-card-foreground">Caminhões</h3>
        <p className="text-sm text-muted-foreground">{trucks.length} registros</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">NF</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Fornecedor</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Data</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Vol (m³)</th>
              <th className="text-right p-3 font-medium text-muted-foreground">MPa Esp.</th>
              <th className="text-right p-3 font-medium text-muted-foreground">MPa Ating.</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Slump</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Dif.</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Risco</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Calculista</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Leitura</th>
              {onRemove && <th className="p-3"></th>}
            </tr>
          </thead>

          <tbody>
            {trucks.map((truck, i) => {
              const cfg = statusConfig[truck.status];
              const Icon = cfg.icon;
              const hasResults = truck.mpa28d !== undefined;
              const isRejected = hasResults && truck.status === 'rejected';
              const calcCfg = calculistConfig[truck.calculistApproval];
              const systemVsCalcDivergence = (truck.status === 'rejected' && truck.calculistApproval === 'approved') ||
                (truck.status !== 'rejected' && truck.calculistApproval === 'rejected');

              return (
                <tr
                  key={truck.id}
                  className={cn(
                    'border-b transition-colors hover:bg-muted/30',
                    isRejected && 'bg-status-rejected-bg/50',
                    systemVsCalcDivergence && 'ring-1 ring-inset ring-status-warning/50'
                  )}
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <td className="p-3 font-medium text-card-foreground">{truck.invoiceNumber}</td>
                  <td className="p-3 text-muted-foreground text-xs">{truck.supplier}</td>
                  <td className="p-3 text-muted-foreground">{truck.arrivalDate}</td>
                  <td className="p-3 text-right text-card-foreground">{(truck.volumeM3 ?? 0).toFixed(1)}</td>
                  <td className="p-3 text-right text-card-foreground">{(truck.expectedMPa ?? 0).toFixed(1)}</td>
                  <td className={cn('p-3 text-right font-medium', isRejected ? 'text-status-rejected' : 'text-card-foreground')}>
                    {hasResults ? truck.mpa28d?.toFixed(1) : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className={cn('p-3 text-right', truck.slumpConformity ? 'text-card-foreground' : 'text-status-warning font-medium')}>
                    {(truck.slump ?? 0).toFixed(0)}{!truck.slumpConformity && ' ⚠'}
                  </td>
                  <td className={cn('p-3 text-right font-medium', !hasResults ? 'text-muted-foreground' : (truck.percentDiff ?? 0) < 0 ? 'text-status-rejected' : 'text-status-approved')}>
                    {hasResults ? `${(truck.percentDiff ?? 0) > 0 ? '+' : ''}${(truck.percentDiff ?? 0).toFixed(1)}%` : '—'}
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center">
                      {hasResults ? (
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium', cfg.className)}>
                          <Icon className="w-3 h-3" />{cfg.label}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Aguardando</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center">
                      {truck.mpa28d !== undefined ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : truck.riskLevel ? (
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          truck.riskLevel === 'high' ? 'bg-status-rejected-bg text-status-rejected' :
                          truck.riskLevel === 'medium' ? 'bg-status-warning-bg text-status-warning' :
                          'bg-status-approved-bg text-status-approved'
                        )}>
                          {truck.riskLevel === 'high' ? 'Alto' : truck.riskLevel === 'medium' ? 'Médio' : 'Baixo'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center gap-1">
                      {truck.calculistApproval !== 'analyzing' && onCalculistApproval ? (
                        <div className="flex items-center gap-1">
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                            calcCfg.className,
                            animatingId === truck.id && 'animate-scale-in',
                            systemVsCalcDivergence && 'ring-1 ring-status-warning'
                          )}>
                            {truck.calculistApproval === 'approved' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldX className="w-3.5 h-3.5" />}
                            {calcCfg.label}
                            {systemVsCalcDivergence && <span className="ml-0.5" title="Divergência entre sistema e calculista">⚠</span>}
                          </span>
                          {truck.calculistApproval === 'rejected' ? (
                            <button
                              onClick={() => {
                                setAnimatingId(truck.id);
                                onCalculistApproval(truck.id, 'approved');
                                setTimeout(() => setAnimatingId(null), 500);
                              }}
                              className="p-1 rounded-md border border-status-approved/30 text-muted-foreground hover:text-status-approved hover:bg-status-approved-bg hover:border-status-approved transition-all duration-200 hover:scale-110"
                              title="Mudar para Aprovado"
                            >
                              <ShieldCheck className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setAnimatingId(truck.id);
                                onCalculistApproval(truck.id, 'rejected');
                                setTimeout(() => setAnimatingId(null), 500);
                              }}
                              className="p-1 rounded-md border border-status-rejected/30 text-muted-foreground hover:text-status-rejected hover:bg-status-rejected-bg hover:border-status-rejected transition-all duration-200 hover:scale-110"
                              title="Mudar para Reprovado"
                            >
                              <ShieldX className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => onCalculistApproval(truck.id, 'analyzing')}
                            className="p-1 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200"
                            title="Voltar para Em análise"
                          >
                            <Search className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : truck.calculistApproval !== 'analyzing' ? (
                        <span className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
                          calcCfg.className,
                          systemVsCalcDivergence && 'ring-1 ring-status-warning'
                        )}>
                          {truck.calculistApproval === 'approved' ? <ShieldCheck className="w-3.5 h-3.5" /> : <ShieldX className="w-3.5 h-3.5" />}
                          {calcCfg.label}
                        </span>
                      ) : onCalculistApproval ? (
                        <>
                          <button
                            onClick={() => {
                              setAnimatingId(truck.id);
                              onCalculistApproval(truck.id, 'approved');
                              setTimeout(() => setAnimatingId(null), 500);
                            }}
                            className="group relative p-1.5 rounded-lg border border-status-approved/30 text-muted-foreground hover:text-status-approved hover:bg-status-approved-bg hover:border-status-approved transition-all duration-200 hover:scale-110 hover:shadow-md"
                            title="Aprovar"
                          >
                            <ShieldCheck className="w-4 h-4 transition-transform group-hover:scale-110" />
                          </button>
                          <button
                            onClick={() => {
                              setAnimatingId(truck.id);
                              onCalculistApproval(truck.id, 'rejected');
                              setTimeout(() => setAnimatingId(null), 500);
                            }}
                            className="p-1.5 rounded-lg border border-status-rejected/30 text-muted-foreground hover:text-status-rejected hover:bg-status-rejected-bg hover:border-status-rejected transition-all duration-200 hover:scale-110 hover:shadow-md"
                            title="Reprovar"
                          >
                            <ShieldX className="w-4 h-4" />
                          </button>
                          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', calcCfg.className)}>
                            <Search className="w-3 h-3" />{calcCfg.label}
                          </span>
                        </>
                      ) : (
                        <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', calcCfg.className)}>
                          <Search className="w-3 h-3" />{calcCfg.label}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="p-3 text-center">
                    <button
                      onClick={() => setDetailsTruck(truck)}
                      className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                      title="Entender resultado e ver linha do tempo"
                    >
                      <Info className="w-3.5 h-3.5" />
                      Entender
                    </button>
                  </td>

                  {onRemove && (
                    <td className="p-3">
                      <button
                        onClick={() => onRemove(truck.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-status-rejected hover:bg-status-rejected-bg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TruckDetailsDialog truck={detailsTruck} onClose={() => setDetailsTruck(null)} />
    </div>
  );
}
