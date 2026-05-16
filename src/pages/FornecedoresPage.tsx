import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { getSupplierMetrics } from '@/lib/mpaflow';
import { SupplierRanking } from '@/components/SupplierRanking';
import { Factory } from 'lucide-react';

export default function FornecedoresPage() {
  const { pavimentos } = useData();
  const suppliers = useMemo(() => getSupplierMetrics(pavimentos), [pavimentos]);

  if (suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Factory className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold">Nenhum fornecedor registrado</h2>
        <p className="text-sm text-muted-foreground mt-1">Adicione caminhões com fornecedor nos pavimentos.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Fornecedores</h1>
        <p className="text-sm text-muted-foreground">{suppliers.length} concreteiras cadastradas</p>
      </div>
      <SupplierRanking suppliers={suppliers} />
    </div>
  );
}
