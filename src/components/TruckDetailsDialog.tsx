import { Truck } from '@/types/mpaflow';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Props {
  truck: Truck | null;
  onClose: () => void;
}

function finalReading(truck: Truck) {
  if (truck.mpa28d === undefined) {
    return {
      label: truck.riskLevel === 'high' ? 'Em risco' : 'Aguardando resultado',
      detail: truck.predictedMpa28d
        ? 'A projeção aos 28 dias é ' + truck.predictedMpa28d.toFixed(1) + ' MPa. Ela não é contabilizada como resultado definitivo.'
        : 'Ainda não existe resultado definitivo aos 28 dias.',
      style: truck.riskLevel === 'high' ? 'text-status-warning' : 'text-muted-foreground',
    };
  }
  const difference = ((truck.mpa28d - truck.expectedMPa) / truck.expectedMPa) * 100;
  const label = truck.status === 'rejected' ? 'Reprovado' : truck.status === 'above' ? 'Acima' : 'Aprovado';
  return {
    label,
    detail: 'FCK ' + truck.expectedMPa.toFixed(1) + ' MPa × resultado ' + truck.mpa28d.toFixed(1) + ' MPa (' + (difference > 0 ? '+' : '') + difference.toFixed(1) + '%).',
    style: truck.status === 'rejected' ? 'text-status-rejected' : truck.status === 'above' ? 'text-status-above' : 'text-status-approved',
  };
}

export function TruckDetailsDialog({ truck, onClose }: Props) {
  if (!truck) return null;
  const reading = finalReading(truck);
  const events = [
    ['Saída da central', truck.departureTimeFromPlant],
    ['Chegada à obra', truck.arrivalTime],
    ['Início da descarga', truck.unloadStartTime],
    ['Fim da descarga', truck.unloadEndTime],
    ['Saída da obra', truck.departureTimeFromSite],
  ];

  return (
    <Dialog open={!!truck} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Caminhão {truck.invoiceNumber}</DialogTitle>
          <DialogDescription>Leitura técnica transparente e linha do tempo da carga.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          <div className="rounded-xl border bg-muted/30 p-4">
            <p className={cn('text-lg font-semibold', reading.style)}>{reading.label}</p>
            <p className="text-sm text-card-foreground mt-1">{reading.detail}</p>
            <p className="text-xs text-muted-foreground mt-2">Faixa do sistema: reprovado abaixo de −5% e acima quando superior a +5%.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-3">Linha do tempo</h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {events.map(([label, time], index) => (
                <div key={label} className="relative rounded-lg border p-3">
                  <span className="text-[10px] font-semibold text-primary">{index + 1}</span>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                  <p className="text-sm font-semibold mt-1">{time || 'Não informado'}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">MPa 7 dias</p><p className="font-semibold">{truck.mpa7d?.toFixed(1) ?? '—'}</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">MPa 28 dias</p><p className="font-semibold">{truck.mpa28d?.toFixed(1) ?? '—'}</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Slump</p><p className={cn('font-semibold', !truck.slumpConformity && 'text-status-warning')}>{truck.slump.toFixed(1)} cm</p></div>
            <div className="rounded-lg border p-3"><p className="text-xs text-muted-foreground">Água adicionada</p><p className="font-semibold">{truck.waterAdded.toFixed(0)} L</p></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
