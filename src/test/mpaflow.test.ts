import { describe, expect, it } from 'vitest';
import { calculateMetrics, computeTruckDerivedFields } from '@/lib/mpaflow';
import { Pavimento, TestSpecimen, Truck } from '@/types/mpaflow';

function makeTruck(specimens: TestSpecimen[], overrides: Partial<Truck> = {}) {
  return computeTruckDerivedFields({
    id: 'truck-1',
    invoiceNumber: 'NF-001',
    arrivalDate: '2026-08-01',
    arrivalTime: '09:00',
    departureTimeFromPlant: '08:00',
    unloadStartTime: '09:10',
    unloadEndTime: '09:30',
    departureTimeFromSite: '09:40',
    volumeM3: 8,
    expectedMPa: 30,
    achievedMPa: 0,
    status: 'approved',
    percentDiff: 0,
    supplier: 'Concreteira',
    slump: 12,
    slumpMin: 10,
    slumpMax: 16,
    slumpConformity: true,
    waterAdded: 0,
    observation: '',
    costPerM3: 450,
    specimenCount: specimens.length,
    specimens,
    calculistApproval: 'analyzing',
    ...overrides,
  });
}

function makePavimento(trucks: Truck[]): Pavimento {
  return {
    id: 'pav-1',
    name: 'Pavimento 1',
    date: '2026-08-01',
    responsible: 'Engenheiro',
    supplier: 'Concreteira',
    structuralPiece: 'Laje',
    trucks,
  };
}

describe('regras do dashboard enxuto', () => {
  it('mantém o ensaio de 7 dias apenas como projeção', () => {
    const truck = makeTruck([
      { id: 'cp-7d', age: '7d', mpaResult: 21, ruptureDate: '2026-08-08' },
    ]);
    const metrics = calculateMetrics([makePavimento([truck])]);

    expect(truck.predictedMpa28d).toBeCloseTo(30, 5);
    expect(truck.achievedMPa).toBe(0);
    expect(metrics.approvedCount).toBe(0);
    expect(metrics.evaluatedCount).toBe(0);
    expect(metrics.pendingCount).toBe(1);
  });

  it('classifica somente o resultado definitivo aos 28 dias', () => {
    const approved = makeTruck([
      { id: 'cp-a', age: '28d', mpaResult: 30, ruptureDate: '2026-08-29' },
    ], { id: 'approved' });
    const rejected = makeTruck([
      { id: 'cp-r', age: '28d', mpaResult: 27, ruptureDate: '2026-08-29' },
    ], { id: 'rejected' });
    const above = makeTruck([
      { id: 'cp-u', age: '28d', mpaResult: 33, ruptureDate: '2026-08-29' },
    ], { id: 'above' });
    const pending = makeTruck([], { id: 'pending' });
    const metrics = calculateMetrics([makePavimento([approved, rejected, above, pending])]);

    expect(metrics.totalTrucks).toBe(4);
    expect(metrics.evaluatedCount).toBe(3);
    expect(metrics.pendingCount).toBe(1);
    expect(metrics.approvedCount).toBe(1);
    expect(metrics.rejectedCount).toBe(1);
    expect(metrics.aboveCount).toBe(1);
    expect(metrics.complianceRate).toBeCloseTo(66.67, 1);
  });
});
