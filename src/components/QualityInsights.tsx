import { Truck } from '@/types/mpaflow';
import { Droplets, Route, SlidersHorizontal } from 'lucide-react';

function minutesBetween(start: string, end: string) {
  if (!start || !end) return null;
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  let minutes = endHour * 60 + endMinute - (startHour * 60 + startMinute);
  if (minutes < 0) minutes += 24 * 60;
  return minutes;
}

export function QualityInsights({ trucks }: { trucks: Truck[] }) {
  const evaluated = trucks.filter(truck => truck.mpa28d !== undefined);
  if (evaluated.length === 0) return null;

  const cards = [
    {
      label: 'Água adicionada',
      icon: Droplets,
      occurrences: evaluated.filter(truck => truck.waterAdded > 0),
    },
    {
      label: 'Slump fora da faixa',
      icon: SlidersHorizontal,
      occurrences: evaluated.filter(truck => !truck.slumpConformity),
    },
    {
      label: 'Trajeto acima de 90 min',
      icon: Route,
      occurrences: evaluated.filter(truck => {
        const duration = minutesBetween(truck.departureTimeFromPlant, truck.arrivalTime);
        return duration !== null && duration > 90;
      }),
    },
  ];

  return (
    <section className="bg-card rounded-xl border shadow-sm p-5 space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-card-foreground">Sinais associados à qualidade</h3>
        <p className="text-sm text-muted-foreground">
          Cruzamentos objetivos para orientar a investigação técnica, sem afirmar relação de causa.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {cards.map(card => {
          const rejected = card.occurrences.filter(truck => truck.status === 'rejected').length;
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-lg border p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Icon className="w-4 h-4" />
                <span className="text-xs font-medium">{card.label}</span>
              </div>
              <p className="text-2xl font-bold mt-2">{card.occurrences.length}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {rejected} reprovados entre essas ocorrências
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
