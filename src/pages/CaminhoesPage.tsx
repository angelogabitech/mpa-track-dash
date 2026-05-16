import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { TruckTable } from '@/components/TruckTable';
import { Truck as TruckIcon } from 'lucide-react';

export default function CaminhoesPage() {
  const { pavimentos } = useData();
  const allTrucks = useMemo(() => pavimentos.flatMap(p => p.trucks), [pavimentos]);

  if (allTrucks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <TruckIcon className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold">Nenhum caminhão registrado</h2>
        <p className="text-sm text-muted-foreground mt-1">Adicione caminhões nos pavimentos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Caminhões</h1>
        <p className="text-sm text-muted-foreground">{allTrucks.length} registros totais</p>
      </div>
      <TruckTable trucks={allTrucks} />
    </div>
  );
}
