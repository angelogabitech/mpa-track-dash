import { Alert } from '@/types/mpaflow';
import { AlertTriangle, CheckCircle2, XOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5 shadow-sm animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-status-approved-bg p-2">
            <CheckCircle2 className="w-5 h-5 text-status-approved" />
          </div>
          <div>
            <h3 className="font-semibold text-card-foreground">Nenhuma atenção necessária</h3>
            <p className="text-sm text-muted-foreground">Não há alertas técnicos no período selecionado.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-card rounded-xl border shadow-sm overflow-hidden animate-slide-up">
      <div className="p-5 border-b">
        <h3 className="text-lg font-semibold text-card-foreground">Atenção necessária</h3>
        <p className="text-sm text-muted-foreground">{alerts.length} ocorrências que precisam de acompanhamento</p>
      </div>
      <div className="divide-y">
      {alerts.slice(0, 8).map((alert) => {
        const isCritical = alert.severity === 'critical';
        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-start gap-3 p-4',
              isCritical ? 'bg-status-rejected-bg/50' : 'bg-status-warning-bg/50'
            )}
          >
            {isCritical ? (
              <XOctagon className="w-5 h-5 text-status-rejected shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-status-warning shrink-0 mt-0.5" />
            )}
            <div>
              <p className={cn('text-sm font-medium', isCritical ? 'text-status-rejected' : 'text-status-warning')}>
                {alert.pavimentoName}
              </p>
              <p className="text-sm text-card-foreground mt-0.5">{alert.message}</p>
            </div>
          </div>
        );
      })}
      </div>
      {alerts.length > 8 && (
        <p className="px-5 py-3 text-xs text-muted-foreground border-t">
          Mais {alerts.length - 8} ocorrências estão disponíveis na central de notificações.
        </p>
      )}
    </section>
  );
}
