import { Pavimento, Metrics, Alert, Truck, SupplierMetrics, RiskLevel } from '@/types/mpaflow';

export function computeTruckDerivedFields(truck: Truck): Truck {
  const specimens = truck.specimens || [];
  const mpa7d = specimens.find(s => s.age === '7d')?.mpaResult;
  const mpa28d = specimens.find(s => s.age === '28d')?.mpaResult;

  let predictedMpa28d: number | undefined;
  let predictionIndex: number | undefined;
  let riskLevel: RiskLevel | undefined;

  if (mpa28d === undefined && mpa7d) {
    predictedMpa28d = mpa7d / 0.7;
    predictionIndex = (predictedMpa28d / truck.expectedMPa) * 100;
    if (predictionIndex < 90) riskLevel = 'high';
    else if (predictionIndex < 100) riskLevel = 'medium';
    else riskLevel = 'low';
  }

  // Compute achievedMPa and status from specimens
  let achievedMPa = 0;
  let status: Truck['status'] = 'approved';
  let percentDiff = 0;

  if (mpa28d !== undefined) {
    achievedMPa = mpa28d;
    percentDiff = ((mpa28d - truck.expectedMPa) / truck.expectedMPa) * 100;
    if (percentDiff < -5) status = 'rejected';
    else if (percentDiff > 5) status = 'above';
    else status = 'approved';
  } else if (predictedMpa28d !== undefined) {
    achievedMPa = predictedMpa28d;
    percentDiff = ((predictedMpa28d - truck.expectedMPa) / truck.expectedMPa) * 100;
    if (percentDiff < -5) status = 'rejected';
    else if (percentDiff > 5) status = 'above';
    else status = 'approved';
  }

  return {
    ...truck, mpa7d, mpa28d, predictedMpa28d, predictionIndex, riskLevel,
    achievedMPa, status, percentDiff,
  };
}

export function calculateMetrics(pavimentos: Pavimento[]): Metrics {
  const allTrucks = pavimentos.flatMap(p => p.trucks);
  const totalVolume = allTrucks.reduce((s, t) => s + t.volumeM3, 0);
  const totalTrucks = allTrucks.length;
  const approvedCount = allTrucks.filter(t => t.status === 'approved').length;
  const rejectedCount = allTrucks.filter(t => t.status === 'rejected').length;
  const aboveCount = allTrucks.filter(t => t.status === 'above').length;
  const complianceRate = totalTrucks ? ((approvedCount + aboveCount) / totalTrucks) * 100 : 0;

  const trucksWithResults = allTrucks.filter(t => t.achievedMPa > 0);
  const avgExpectedMPa = trucksWithResults.length ? trucksWithResults.reduce((s, t) => s + t.expectedMPa, 0) / trucksWithResults.length : 0;
  const avgAchievedMPa = trucksWithResults.length ? trucksWithResults.reduce((s, t) => s + t.achievedMPa, 0) / trucksWithResults.length : 0;

  const rejectedTrucks = allTrucks.filter(t => t.status === 'rejected');
  const belowIdealVolume = rejectedTrucks.reduce((s, t) => s + t.volumeM3, 0);
  const lossIndex = totalVolume ? (belowIdealVolume / totalVolume) * 100 : 0;
  const estimatedLoss = rejectedTrucks.reduce((s, t) => s + t.volumeM3 * t.costPerM3, 0);

  const with7d = allTrucks.filter(t => t.mpa7d !== undefined);
  const compliant7d = with7d.filter(t => t.mpa7d! >= t.expectedMPa * 0.7).length;
  const compliance7d = with7d.length ? (compliant7d / with7d.length) * 100 : 0;

  const with28d = allTrucks.filter(t => t.mpa28d !== undefined);
  const compliant28d = with28d.filter(t => t.mpa28d! >= t.expectedMPa).length;
  const compliance28d = with28d.length ? (compliant28d / with28d.length) * 100 : 0;

  const highRiskTrucks = allTrucks.filter(t => t.riskLevel === 'high');
  const volumeAtRisk = highRiskTrucks.reduce((s, t) => s + t.volumeM3, 0);
  const highRiskCount = highRiskTrucks.length;
  const avgSlump = totalTrucks ? allTrucks.reduce((s, t) => s + t.slump, 0) / totalTrucks : 0;

  const calculistApprovedCount = allTrucks.filter(t => t.calculistApproval === 'approved').length;
  const calculistRejectedCount = allTrucks.filter(t => t.calculistApproval === 'rejected').length;
  const calculistAnalyzingCount = allTrucks.filter(t => t.calculistApproval === 'analyzing').length;

  return {
    totalVolume, totalTrucks, approvedCount, rejectedCount, aboveCount,
    complianceRate, avgExpectedMPa, avgAchievedMPa, belowIdealVolume, lossIndex, estimatedLoss,
    compliance7d, compliance28d, volumeAtRisk, highRiskCount, avgSlump,
    calculistApprovedCount, calculistRejectedCount, calculistAnalyzingCount,
  };
}

export function generateAlerts(pavimentos: Pavimento[]): Alert[] {
  const alerts: Alert[] = [];
  let alertId = 0;

  for (const pav of pavimentos) {
    for (let i = 0; i <= pav.trucks.length - 3; i++) {
      if (pav.trucks[i].status === 'rejected' && pav.trucks[i + 1].status === 'rejected' && pav.trucks[i + 2].status === 'rejected') {
        alerts.push({
          id: `alert-${alertId++}`, type: 'consecutive',
          message: `3 caminhões consecutivos abaixo do MPa esperado (${pav.trucks[i].invoiceNumber} a ${pav.trucks[i + 2].invoiceNumber})`,
          pavimentoName: pav.name, date: pav.date, severity: 'critical',
        });
        break;
      }
    }

    if (pav.trucks.length > 0) {
      const trucksWithResults = pav.trucks.filter(t => t.achievedMPa > 0);
      if (trucksWithResults.length > 0) {
        const avgExpected = trucksWithResults.reduce((s, t) => s + t.expectedMPa, 0) / trucksWithResults.length;
        const avgAchieved = trucksWithResults.reduce((s, t) => s + t.achievedMPa, 0) / trucksWithResults.length;
        if (avgAchieved < avgExpected * 0.95) {
          alerts.push({
            id: `alert-${alertId++}`, type: 'daily_average',
            message: `Média de MPa atingido (${avgAchieved.toFixed(1)}) está abaixo de 95% do esperado (${(avgExpected * 0.95).toFixed(1)})`,
            pavimentoName: pav.name, date: pav.date, severity: 'warning',
          });
        }
      }
    }

    for (const t of pav.trucks) {
      const arrDate = new Date(t.arrivalDate);
      const now = new Date();
      const daysSince = (now.getTime() - arrDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince >= 7 && !t.mpa7d) {
        alerts.push({
          id: `alert-${alertId++}`, type: 'specimen_missing',
          message: `Caminhão ${t.invoiceNumber}: sem resultado de corpo de prova aos 7 dias`,
          pavimentoName: pav.name, date: pav.date, severity: 'warning',
        });
      }
      if (t.mpa7d !== undefined && t.mpa7d < t.expectedMPa * 0.7) {
        alerts.push({
          id: `alert-${alertId++}`, type: 'specimen_7d_fail',
          message: `Caminhão ${t.invoiceNumber}: MPa aos 7d (${t.mpa7d.toFixed(1)}) abaixo de 70% do esperado (${(t.expectedMPa * 0.7).toFixed(1)})`,
          pavimentoName: pav.name, date: pav.date, severity: 'critical',
        });
      }
      if (t.mpa28d !== undefined && t.mpa28d < t.expectedMPa) {
        alerts.push({
          id: `alert-${alertId++}`, type: 'specimen_28d_fail',
          message: `Caminhão ${t.invoiceNumber}: MPa aos 28d (${t.mpa28d.toFixed(1)}) abaixo do esperado (${t.expectedMPa.toFixed(1)})`,
          pavimentoName: pav.name, date: pav.date, severity: 'critical',
        });
      }
      if (!t.slumpConformity) {
        alerts.push({
          id: `alert-${alertId++}`, type: 'slump_out',
          message: `Caminhão ${t.invoiceNumber}: Slump ${t.slump} cm fora da faixa (${t.slumpMin}-${t.slumpMax} cm)`,
          pavimentoName: pav.name, date: pav.date, severity: 'warning',
        });
      }
      if (t.riskLevel === 'high') {
        alerts.push({
          id: `alert-${alertId++}`, type: 'high_risk',
          message: `Caminhão ${t.invoiceNumber}: Alto risco de reprovação aos 28d (previsão: ${t.predictedMpa28d?.toFixed(1)} MPa)`,
          pavimentoName: pav.name, date: pav.date, severity: 'critical',
        });
      }
    }
  }

  return alerts;
}

export function getSupplierMetrics(pavimentos: Pavimento[]): SupplierMetrics[] {
  const allTrucks = pavimentos.flatMap(p => p.trucks);
  const supplierMap = new Map<string, Truck[]>();
  for (const t of allTrucks) {
    const arr = supplierMap.get(t.supplier) || [];
    arr.push(t);
    supplierMap.set(t.supplier, arr);
  }

  return Array.from(supplierMap.entries()).map(([name, trucks]) => {
    const totalVolume = trucks.reduce((s, t) => s + t.volumeM3, 0);
    const totalTrucks = trucks.length;
    const conforming = trucks.filter(t => t.status !== 'rejected').length;
    const complianceRate = totalTrucks ? (conforming / totalTrucks) * 100 : 0;
    const trucksWithResults = trucks.filter(t => t.achievedMPa > 0);
    const avgMpa = trucksWithResults.length ? trucksWithResults.reduce((s, t) => s + t.achievedMPa, 0) / trucksWithResults.length : 0;
    const avgSlump = totalTrucks ? trucks.reduce((s, t) => s + t.slump, 0) / totalTrucks : 0;
    const rejectionRate = totalTrucks ? ((totalTrucks - conforming) / totalTrucks) * 100 : 0;

    const with7d = trucks.filter(t => t.mpa7d !== undefined);
    const compliant7d = with7d.filter(t => t.mpa7d! >= t.expectedMPa * 0.7).length;
    const compliance7d = with7d.length ? (compliant7d / with7d.length) * 100 : 0;

    const with28d = trucks.filter(t => t.mpa28d !== undefined);
    const compliant28d = with28d.filter(t => t.mpa28d! >= t.expectedMPa).length;
    const compliance28d = with28d.length ? (compliant28d / with28d.length) * 100 : 0;

    const volumeAtRisk = trucks.filter(t => t.riskLevel === 'high').reduce((s, t) => s + t.volumeM3, 0);

    return { name, totalVolume, totalTrucks, complianceRate, compliance7d, compliance28d, avgMpa, avgSlump, rejectionRate, volumeAtRisk };
  }).sort((a, b) => b.complianceRate - a.complianceRate);
}

export function getPavimentoRanking(pavimentos: Pavimento[]) {
  return pavimentos.map(p => {
    const total = p.trucks.length;
    const conforming = p.trucks.filter(t => t.status !== 'rejected').length;
    const rate = total ? (conforming / total) * 100 : 0;
    return { name: p.name, complianceRate: rate, totalTrucks: total, rejectedCount: total - conforming };
  }).sort((a, b) => b.complianceRate - a.complianceRate);
}

export function getMPaEvolutionData(trucks: Truck[]) {
  return trucks.map((t, i) => ({
    index: i + 1,
    name: t.invoiceNumber,
    expected: t.expectedMPa,
    achieved: t.achievedMPa,
    mpa7d: t.mpa7d,
    mpa28d: t.mpa28d,
  }));
}

export function getStatusDistribution(trucks: Truck[]) {
  const approved = trucks.filter(t => t.status === 'approved').length;
  const rejected = trucks.filter(t => t.status === 'rejected').length;
  const above = trucks.filter(t => t.status === 'above').length;
  return [
    { name: 'Aprovados', value: approved, fill: 'hsl(var(--status-approved))' },
    { name: 'Reprovados', value: rejected, fill: 'hsl(var(--status-rejected))' },
    { name: 'Acima', value: above, fill: 'hsl(var(--status-above))' },
  ];
}

export function filterByPeriod(pavimentos: Pavimento[], period: string, customStart?: string, customEnd?: string): Pavimento[] {
  const now = new Date();
  let startDate: Date | null = null;

  if (period === '7d') {
    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else if (period === '28d') {
    startDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
  } else if (period === 'custom' && customStart) {
    startDate = new Date(customStart);
  }

  const endDate = period === 'custom' && customEnd ? new Date(customEnd) : now;

  if (!startDate) return pavimentos;

  return pavimentos.filter(p => {
    const d = new Date(p.date);
    return d >= startDate! && d <= endDate;
  });
}
