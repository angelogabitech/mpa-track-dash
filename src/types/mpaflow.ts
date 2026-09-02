export type TruckStatus = 'approved' | 'rejected' | 'above';
export type SpecimenAge = '12h' | '7d' | '28d';
export type RiskLevel = 'low' | 'medium' | 'high';
export type CalculistApproval = 'approved' | 'rejected' | 'analyzing';

export const STRUCTURAL_PIECES = [
  'Laje', 'Pilar', 'Viga', 'Fundação', 'Bloco', 'Sapata', 'Radier',
] as const;

export interface TestSpecimen {
  id: string;
  age: SpecimenAge;
  mpaResult: number;
  ruptureDate: string;
}

export interface Truck {
  id: string;
  invoiceNumber: string;
  arrivalDate: string;
  arrivalTime: string;
  departureTimeFromPlant: string;
  unloadStartTime: string;
  unloadEndTime: string;
  departureTimeFromSite: string;
  volumeM3: number;
  expectedMPa: number;
  achievedMPa: number;
  status: TruckStatus;
  percentDiff: number;
  supplier: string;
  slump: number;
  slumpMin: number;
  slumpMax: number;
  slumpConformity: boolean;
  waterAdded: number;
  observation: string;
  costPerM3: number;
  specimenCount: number;
  specimens: TestSpecimen[];
  mpa7d?: number;
  mpa28d?: number;
  predictedMpa28d?: number;
  predictionIndex?: number;
  riskLevel?: RiskLevel;
  calculistApproval: CalculistApproval;
}

export interface Pavimento {
  id: string;
  name: string;
  date: string;
  responsible: string;
  supplier: string;
  structuralPiece: string;
  trucks: Truck[];
}

export interface Metrics {
  totalVolume: number;
  totalTrucks: number;
  evaluatedCount: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  aboveCount: number;
  complianceRate: number;
  avgExpectedMPa: number;
  avgAchievedMPa: number;
  belowIdealVolume: number;
  lossIndex: number;
  estimatedLoss: number;
  compliance7d: number;
  compliance28d: number;
  volumeAtRisk: number;
  highRiskCount: number;
  avgSlump: number;
  calculistApprovedCount: number;
  calculistRejectedCount: number;
  calculistAnalyzingCount: number;
}

export interface SupplierMetrics {
  name: string;
  totalVolume: number;
  totalTrucks: number;
  complianceRate: number;
  compliance7d: number;
  compliance28d: number;
  avgMpa: number;
  avgSlump: number;
  rejectionRate: number;
  volumeAtRisk: number;
}

export interface Alert {
  id: string;
  type: 'consecutive' | 'daily_average' | 'specimen_missing' | 'specimen_7d_fail' | 'specimen_28d_fail' | 'slump_out' | 'high_risk';
  message: string;
  pavimentoName: string;
  date: string;
  severity: 'warning' | 'critical';
}
