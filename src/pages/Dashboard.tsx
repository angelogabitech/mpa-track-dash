import { useMemo, useState } from 'react';
import { useData } from '@/context/DataContext';
import { calculateMetrics, getPavimentoRanking, getSupplierMetrics, filterByPeriod } from '@/lib/mpaflow';
import { MetricCard } from '@/components/MetricCard';
import { TruckTable } from '@/components/TruckTable';
import { Charts } from '@/components/Charts';
import { SupplierRanking } from '@/components/SupplierRanking';
import {
  Box, Truck, BarChart3, CheckCircle2, XCircle, TrendingUp,
  Percent, Target, AlertTriangle, DollarSign, Filter, ShieldAlert,
  FlaskConical, Droplets, Calendar, ShieldCheck, ShieldX, Search,
} from 'lucide-react';

export default function Dashboard() {
  const { pavimentos } = useData();
  const [selectedPavimento, setSelectedPavimento] = useState<string>('all');
  const [period, setPeriod] = useState<string>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filteredPavimentos = useMemo(() => {
    let result = pavimentos;
    if (selectedPavimento !== 'all') {
      result = result.filter(p => p.id === selectedPavimento);
    }
    result = filterByPeriod(result, period, customStart, customEnd);
    return result;
  }, [pavimentos, selectedPavimento, period, customStart, customEnd]);

  const allTrucks = useMemo(() => filteredPavimentos.flatMap((p) => p.trucks), [filteredPavimentos]);
  const metrics = useMemo(() => calculateMetrics(filteredPavimentos), [filteredPavimentos]);
  const ranking = useMemo(() => getPavimentoRanking(filteredPavimentos), [filteredPavimentos]);
  const supplierMetrics = useMemo(() => getSupplierMetrics(filteredPavimentos), [filteredPavimentos]);
  const worstPavimento = ranking.length > 0 ? ranking[ranking.length - 1] : null;

  if (pavimentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Box className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-lg font-semibold text-card-foreground">Nenhum dado disponível</h2>
        <p className="text-sm text-muted-foreground mt-1">Adicione pavimentos e caminhões para ver o dashboard.</p>
      </div>
    );
  }

  const selectClass = "rounded-lg border bg-card px-3 py-2 text-sm text-card-foreground focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 animate-fade-in">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <select value={selectedPavimento} onChange={(e) => setSelectedPavimento(e.target.value)} className={selectClass}>
          <option value="all">Todos os pavimentos</option>
          {pavimentos.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className={selectClass}>
          <option value="all">Todo período</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="28d">Últimos 28 dias</option>
          <option value="custom">Personalizado</option>
        </select>
        {period === 'custom' && (
          <>
            <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className={selectClass} />
            <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className={selectClass} />
          </>
        )}
        {(selectedPavimento !== 'all' || period !== 'all') && (
          <button onClick={() => { setSelectedPavimento('all'); setPeriod('all'); setCustomStart(''); setCustomEnd(''); }} className="text-sm text-primary hover:underline">
            Limpar filtros
          </button>
        )}
      </div>

      {/* Row 1 - Core metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="Volume Total" value={`${metrics.totalVolume.toFixed(1)} m³`} icon={<Box className="w-5 h-5" />} delay={0} />
        <MetricCard title="Caminhões" value={metrics.totalTrucks} icon={<Truck className="w-5 h-5" />} delay={50} />
        <MetricCard title="Aprovados" value={metrics.approvedCount} icon={<CheckCircle2 className="w-5 h-5" />} variant="approved" delay={100} />
        <MetricCard title="Reprovados" value={metrics.rejectedCount} icon={<XCircle className="w-5 h-5" />} variant="rejected" delay={150} />
        <MetricCard title="Acima" value={metrics.aboveCount} icon={<TrendingUp className="w-5 h-5" />} variant="above" delay={200} />
      </div>

      {/* Row 2 - Compliance & quality */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="Conformidade" value={`${metrics.complianceRate.toFixed(1)}%`} icon={<Percent className="w-5 h-5" />} delay={250} />
        <MetricCard title="Conf. 7 dias" value={`${metrics.compliance7d.toFixed(1)}%`} icon={<FlaskConical className="w-5 h-5" />} delay={300} />
        <MetricCard title="Conf. 28 dias" value={`${metrics.compliance28d.toFixed(1)}%`} icon={<FlaskConical className="w-5 h-5" />} delay={350} />
        <MetricCard title="MPa Esperado" value={metrics.avgExpectedMPa.toFixed(1)} icon={<Target className="w-5 h-5" />} delay={400} />
        <MetricCard title="MPa Atingido" value={metrics.avgAchievedMPa.toFixed(1)} icon={<Target className="w-5 h-5" />} delay={450} />
      </div>

      {/* Row 3 - Risk & financial */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <MetricCard title="Slump Médio" value={`${metrics.avgSlump.toFixed(1)} cm`} icon={<Droplets className="w-5 h-5" />} delay={500} />
        <MetricCard title="Vol. em Risco" value={`${metrics.volumeAtRisk.toFixed(1)} m³`} icon={<ShieldAlert className="w-5 h-5" />} variant={metrics.volumeAtRisk > 0 ? 'warning' : 'default'} delay={550} />
        <MetricCard title="Alto Risco" value={metrics.highRiskCount} icon={<AlertTriangle className="w-5 h-5" />} variant={metrics.highRiskCount > 0 ? 'rejected' : 'default'} delay={600} />
        <MetricCard title="Índice Perda" value={`${metrics.lossIndex.toFixed(1)}%`} icon={<AlertTriangle className="w-5 h-5" />} variant={metrics.lossIndex > 10 ? 'warning' : 'default'} delay={650} />
        <MetricCard title="Prejuízo Est." value={`R$ ${metrics.estimatedLoss.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<DollarSign className="w-5 h-5" />} variant="rejected" delay={700} />
      </div>

      {/* Row 4 - Calculist approval */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <MetricCard title="Calc. Aprovados" value={metrics.calculistApprovedCount} icon={<ShieldCheck className="w-5 h-5" />} variant="approved" delay={750} />
        <MetricCard title="Calc. Reprovados" value={metrics.calculistRejectedCount} icon={<ShieldX className="w-5 h-5" />} variant="rejected" delay={800} />
        <MetricCard title="Calc. Em Análise" value={metrics.calculistAnalyzingCount} icon={<Search className="w-5 h-5" />} variant={metrics.calculistAnalyzingCount > 0 ? 'warning' : 'default'} delay={850} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MetricCard title="Vol. Abaixo do Ideal" value={`${metrics.belowIdealVolume.toFixed(1)} m³`} subtitle="Caminhões reprovados" icon={<AlertTriangle className="w-5 h-5" />} variant="warning" delay={900} />
        <MetricCard title="Pior Pavimento" value={worstPavimento?.name ?? '-'} subtitle={worstPavimento ? `${worstPavimento.rejectedCount} reprv. - ${worstPavimento.complianceRate.toFixed(1)}%` : ''} icon={<XCircle className="w-5 h-5" />} variant="rejected" delay={950} />
      </div>

      <SupplierRanking suppliers={supplierMetrics} />
      <Charts trucks={allTrucks} rankingData={ranking} />
      <TruckTable trucks={allTrucks} />
    </div>
  );
}
