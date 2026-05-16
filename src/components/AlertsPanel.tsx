import { Alert } from '@/types/mpaflow';
import { AlertTriangle, XOctagon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3 animate-slide-up">
      {alerts.map((alert) => {
        const isCritical = alert.severity === 'critical';
        return (
          <div
            key={alert.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-4',
              isCritical ? 'bg-status-rejected-bg border-status-rejected/30' : 'bg-status-warning-bg border-status-warning/30'
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
  );
}
