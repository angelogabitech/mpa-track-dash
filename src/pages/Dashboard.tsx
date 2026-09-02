import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { calculateMetrics, filterByPeriod, generateAlerts } from '@/lib/mpaflow';
import { MetricCard } from '@/components/MetricCard';
import { RecentTrucksTable } from '@/components/RecentTrucksTable';
import { Charts } from '@/components/Charts';
import { AlertsPanel } from '@/components/AlertsPanel';
import { Box, Truck, CheckCircle2, XCircle, TrendingUp, Percent, Filter, Calendar } from 'lucide-react';

export default function Dashboard() {
  const { pavimentos } = useData();
  const [selectedPavimento, setSelectedPavimento] = useState('all');
  const [period, setPeriod] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filteredPavimentos = useMemo(() => {
    const selected = selectedPavimento === 'all'
      ? pavimentos
      : pavimentos.filter(p => p.id === selectedPavimento);
    return filterByPeriod(selected, period, customStart, customEnd);
  }, [pavimentos, selectedPavimento, period, customStart, customEnd]);

  const allTrucks = useMemo(() => filteredPavimentos.flatMap(p => p.trucks), [filteredPavimentos]);
  const recentTrucks = useMemo(() => [...allTrucks]
    .sort((a, b) => (b.arrivalDate + b.arrivalTime).localeCompare(a.arrivalDate + a.arrivalTime))
    .slice(0, 8), [allTrucks]);
  const metrics = useMemo(() => calculateMetrics(filteredPavimentos), [filteredPavimentos]);
  const alerts = useMemo(() => generateAlerts(filteredPavimentos), [filteredPavimentos]);

  const selectClass = "rounded-lg border bg-card px-3 py-2 text-sm";
  if (pavimentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Box className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-card-foreground">Nenhum dado disponível</h2>
        <p className="text-sm text-muted-foreground mt-1">Adicione pavimentos e caminhões para ver o dashboard.</p>
      </div>
    );
  }

  const evaluatedLabel = metrics.evaluatedCount
    ? metrics.evaluatedCount + ' caminhões avaliados'
    : 'Sem resultados aos 28 dias';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center gap-3 animate-fade-in">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select value={selectedPavimento} onChange={e => setSelectedPavimento(e.target.value)} className={selectClass}>
          <option value="all">Todos os pavimentos</option>
          {pavimentos.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <select value={period} onChange={e => setPeriod(e.target.value)} className={selectClass}>
          <option value="all">Todo período</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="28d">Últimos 28 dias</option>
          <option value="custom">Personalizado</option>
        </select>
        {period === 'custom' && (
          <>
            <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className={selectClass} />
            <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className={selectClass} />
          </>
        )}
        {(selectedPavimento !== 'all' || period !== 'all') && (
          <button
            onClick={() => {
              setSelectedPavimento('all');
              setPeriod('all');
              setCustomStart('');
              setCustomEnd('');
            }}
            className="text-sm text-primary hover:underline"
          >
            Limpar filtros
          </button>
        )}
      </div>

      <section aria-labelledby="dashboard-summary">
        <div className="mb-3">
          <h1 id="dashboard-summary" className="text-2xl font-bold text-foreground">Visão da concretagem</h1>
          <p className="text-sm text-muted-foreground">Somente os indicadores essenciais para acompanhamento da obra.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Volume Total"
            value={metrics.totalVolume.toFixed(1) + ' m³'}
            subtitle="No período selecionado"
            icon={<Box className="w-5 h-5" />}
          />
          <MetricCard
            title="Caminhões"
            value={metrics.totalTrucks}
            subtitle={metrics.pendingCount + ' aguardando 28 dias'}
            icon={<Truck className="w-5 h-5" />}
            delay={50}
          />
          <MetricCard
            title="Aprovados"
            value={metrics.approvedCount}
            subtitle="Resultado definitivo"
            icon={<CheckCircle2 className="w-5 h-5" />}
            variant="approved"
            delay={100}
          />
          <MetricCard
            title="Reprovados"
            value={metrics.rejectedCount}
            subtitle="Resultado definitivo"
            icon={<XCircle className="w-5 h-5" />}
            variant="rejected"
            delay={150}
          />
          <MetricCard
            title="Acima"
            value={metrics.aboveCount}
            subtitle="Mais de 5% acima"
            icon={<TrendingUp className="w-5 h-5" />}
            variant="above"
            delay={200}
          />
          <MetricCard
            title="Conformidade"
            value={metrics.evaluatedCount ? metrics.complianceRate.toFixed(1) + '%' : '—'}
            subtitle={evaluatedLabel}
            icon={<Percent className="w-5 h-5" />}
            delay={250}
          />
        </div>
      </section>

      <AlertsPanel alerts={alerts} />
      <Charts trucks={allTrucks} />
      <RecentTrucksTable trucks={recentTrucks} totalCount={allTrucks.length} />
    </div>
  );
}
