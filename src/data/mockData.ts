import { Pavimento, Truck, TruckStatus, TestSpecimen } from '@/types/mpaflow';
import { computeTruckDerivedFields } from '@/lib/mpaflow';

function createTruck(
  id: string, invoice: string, date: string, time: string,
  volume: number, expected: number,
  supplier: string, slump: number, slumpMin: number, slumpMax: number,
  costPerM3: number, specimens: TestSpecimen[] = []
): Truck {
  const slumpConformity = slump >= slumpMin && slump <= slumpMax;
  const base: Truck = {
    id, invoiceNumber: invoice, arrivalDate: date, arrivalTime: time,
    departureTimeFromPlant: '', unloadStartTime: '', unloadEndTime: '', departureTimeFromSite: '',
    volumeM3: volume, expectedMPa: expected, achievedMPa: 0,
    status: 'approved', percentDiff: 0,
    supplier, slump, slumpMin, slumpMax, slumpConformity,
    waterAdded: 0, observation: '',
    costPerM3, specimenCount: specimens.length, specimens,
    calculistApproval: 'analyzing',
  };
  return computeTruckDerivedFields(base);
}

export const DEFAULT_COST_PER_M3 = 450;
export const COST_PER_M3 = DEFAULT_COST_PER_M3;

const suppliers = ['Concreteira Alpha', 'Concreteira Beta', 'Concreteira Gamma'];

export const pavimentos: Pavimento[] = [
  {
    id: '1',
    name: 'Pavimento Térreo',
    date: '2026-04-01',
    responsible: 'Eng. Carlos Silva',
    supplier: suppliers[0],
    structuralPiece: 'Laje',
    trucks: [
      createTruck('t1', 'NF-001', '2026-04-01', '07:30', 8, 30, suppliers[0], 12, 10, 16, 450, [
        { id: 'sp1', age: '7d', mpaResult: 22.5, ruptureDate: '2026-04-08' },
        { id: 'sp2', age: '28d', mpaResult: 31.5, ruptureDate: '2026-04-29' },
      ]),
      createTruck('t2', 'NF-002', '2026-04-01', '08:15', 8, 30, suppliers[0], 14, 10, 16, 450, [
        { id: 'sp3', age: '7d', mpaResult: 21.0, ruptureDate: '2026-04-08' },
      ]),
      createTruck('t3', 'NF-003', '2026-04-01', '09:00', 7.5, 30, suppliers[1], 11, 10, 16, 460, [
        { id: 'sp4', age: '7d', mpaResult: 23.0, ruptureDate: '2026-04-08' },
        { id: 'sp5', age: '28d', mpaResult: 32.1, ruptureDate: '2026-04-29' },
      ]),
      createTruck('t4', 'NF-004', '2026-04-01', '09:45', 8, 30, suppliers[0], 9, 10, 16, 450, [
        { id: 'sp6', age: '7d', mpaResult: 18.5, ruptureDate: '2026-04-08' },
      ]),
      createTruck('t5', 'NF-005', '2026-04-01', '10:30', 8, 30, suppliers[1], 13, 10, 16, 460, []),
      createTruck('t6', 'NF-006', '2026-04-01', '11:15', 7, 30, suppliers[0], 17, 10, 16, 450, [
        { id: 'sp7', age: '7d', mpaResult: 17.0, ruptureDate: '2026-04-08' },
      ]),
      createTruck('t7', 'NF-007', '2026-04-01', '12:00', 8, 30, suppliers[0], 12, 10, 16, 450, []),
      createTruck('t8', 'NF-008', '2026-04-01', '13:30', 8, 30, suppliers[1], 15, 10, 16, 460, [
        { id: 'sp8', age: '7d', mpaResult: 19.0, ruptureDate: '2026-04-08' },
      ]),
    ],
  },
  {
    id: '2',
    name: '1º Pavimento',
    date: '2026-04-02',
    responsible: 'Eng. Ana Souza',
    supplier: suppliers[1],
    structuralPiece: 'Viga',
    trucks: [
      createTruck('t9', 'NF-009', '2026-04-02', '07:00', 8, 35, suppliers[1], 13, 10, 16, 470, [
        { id: 'sp9', age: '7d', mpaResult: 26.0, ruptureDate: '2026-04-09' },
        { id: 'sp10', age: '28d', mpaResult: 36.2, ruptureDate: '2026-04-30' },
      ]),
      createTruck('t10', 'NF-010', '2026-04-02', '07:45', 8, 35, suppliers[1], 14, 10, 16, 470, [
        { id: 'sp11', age: '7d', mpaResult: 25.5, ruptureDate: '2026-04-09' },
      ]),
      createTruck('t11', 'NF-011', '2026-04-02', '08:30', 7.5, 35, suppliers[2], 12, 10, 16, 480, [
        { id: 'sp12', age: '7d', mpaResult: 24.0, ruptureDate: '2026-04-09' },
      ]),
      createTruck('t12', 'NF-012', '2026-04-02', '09:15', 8, 35, suppliers[2], 11, 10, 16, 480, []),
      createTruck('t13', 'NF-013', '2026-04-02', '10:00', 8, 35, suppliers[1], 15, 10, 16, 470, [
        { id: 'sp13', age: '7d', mpaResult: 22.0, ruptureDate: '2026-04-09' },
      ]),
      createTruck('t14', 'NF-014', '2026-04-02', '10:45', 7.5, 35, suppliers[2], 10, 10, 16, 480, [
        { id: 'sp14', age: '7d', mpaResult: 21.5, ruptureDate: '2026-04-09' },
      ]),
    ],
  },
  {
    id: '3',
    name: '2º Pavimento',
    date: '2026-04-03',
    responsible: 'Eng. Roberto Lima',
    supplier: suppliers[2],
    structuralPiece: 'Pilar',
    trucks: [
      createTruck('t15', 'NF-015', '2026-04-03', '07:30', 8, 30, suppliers[2], 14, 10, 16, 450, [
        { id: 'sp15', age: '7d', mpaResult: 19.0, ruptureDate: '2026-04-10' },
      ]),
      createTruck('t16', 'NF-016', '2026-04-03', '08:15', 8, 30, suppliers[2], 13, 10, 16, 450, [
        { id: 'sp16', age: '7d', mpaResult: 18.0, ruptureDate: '2026-04-10' },
      ]),
      createTruck('t17', 'NF-017', '2026-04-03', '09:00', 7, 30, suppliers[0], 18, 10, 16, 440, [
        { id: 'sp17', age: '7d', mpaResult: 16.5, ruptureDate: '2026-04-10' },
      ]),
      createTruck('t18', 'NF-018', '2026-04-03', '09:45', 8, 30, suppliers[2], 12, 10, 16, 450, []),
      createTruck('t19', 'NF-019', '2026-04-03', '10:30', 8, 30, suppliers[0], 11, 10, 16, 440, []),
      createTruck('t20', 'NF-020', '2026-04-03', '11:15', 7.5, 30, suppliers[2], 15, 10, 16, 450, []),
      createTruck('t21', 'NF-021', '2026-04-03', '12:00', 8, 30, suppliers[0], 8, 10, 16, 440, [
        { id: 'sp18', age: '7d', mpaResult: 15.0, ruptureDate: '2026-04-10' },
      ]),
    ],
  },
  {
    id: '4',
    name: '3º Pavimento',
    date: '2026-04-05',
    responsible: 'Eng. Mariana Costa',
    supplier: suppliers[0],
    structuralPiece: 'Fundação',
    trucks: [
      createTruck('t22', 'NF-022', '2026-04-05', '07:00', 8, 40, suppliers[0], 13, 10, 16, 500, [
        { id: 'sp19', age: '7d', mpaResult: 30.0, ruptureDate: '2026-04-12' },
        { id: 'sp20', age: '28d', mpaResult: 41.2, ruptureDate: '2026-05-03' },
      ]),
      createTruck('t23', 'NF-023', '2026-04-05', '07:45', 8, 40, suppliers[0], 14, 10, 16, 500, [
        { id: 'sp21', age: '7d', mpaResult: 29.0, ruptureDate: '2026-04-12' },
      ]),
      createTruck('t24', 'NF-024', '2026-04-05', '08:30', 7.5, 40, suppliers[1], 12, 10, 16, 510, []),
      createTruck('t25', 'NF-025', '2026-04-05', '09:15', 8, 40, suppliers[0], 11, 10, 16, 500, [
        { id: 'sp22', age: '7d', mpaResult: 27.5, ruptureDate: '2026-04-12' },
      ]),
      createTruck('t26', 'NF-026', '2026-04-05', '10:00', 8, 40, suppliers[1], 15, 10, 16, 510, []),
    ],
  },
];
