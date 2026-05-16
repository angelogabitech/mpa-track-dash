import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import {
  Pavimento,
  Truck,
  TestSpecimen,
  CalculistApproval,
  SpecimenAge,
  TruckStatus,
  RiskLevel,
} from '@/types/mpaflow';
import { computeTruckDerivedFields } from '@/lib/mpaflow';
import type { Database } from '@/integrations/supabase/types';

type PavimentoRow = Database['public']['Tables']['pavimentos']['Row'];
type TruckRow = Database['public']['Tables']['trucks']['Row'];
type SpecimenRow = Database['public']['Tables']['test_specimens']['Row'];

interface DataContextType {
  pavimentos: Pavimento[];
  loading: boolean;
  addPavimento: (pav: Omit<Pavimento, 'id' | 'trucks'>) => Promise<boolean>;
  removePavimento: (id: string) => Promise<boolean>;
  addTruck: (pavimentoId: string, truck: Omit<Truck, 'id' | 'status' | 'percentDiff' | 'slumpConformity' | 'specimens' | 'specimenCount' | 'mpa7d' | 'mpa28d' | 'predictedMpa28d' | 'predictionIndex' | 'riskLevel' | 'calculistApproval' | 'achievedMPa'>) => Promise<boolean>;
  removeTruck: (pavimentoId: string, truckId: string) => Promise<boolean>;
  addSpecimen: (pavimentoId: string, truckId: string, specimen: Omit<TestSpecimen, 'id'>) => Promise<boolean>;
  removeSpecimen: (pavimentoId: string, truckId: string, specimenId: string) => Promise<boolean>;
  setCalculistApproval: (pavimentoId: string, truckId: string, approval: CalculistApproval) => Promise<boolean>;
  resetToMockData: () => Promise<boolean>;
  clearAllData: () => Promise<boolean>;
}

const DataContext = createContext<DataContextType | null>(null);

function toNumber(value: number | string | null | undefined): number {
  return Number(value ?? 0);
}

function mapSpecimen(row: SpecimenRow): TestSpecimen {
  return {
    id: row.id,
    age: row.age as SpecimenAge,
    mpaResult: toNumber(row.mpa_result),
    ruptureDate: row.rupture_date || '',
  };
}

function mapTruck(row: TruckRow, specimens: TestSpecimen[]): Truck {
  const truck: Truck = {
    id: row.id,
    invoiceNumber: row.invoice_number,
    arrivalDate: row.arrival_date || '',
    arrivalTime: row.arrival_time,
    departureTimeFromPlant: row.departure_time_from_plant,
    unloadStartTime: row.unload_start_time,
    unloadEndTime: row.unload_end_time,
    departureTimeFromSite: row.departure_time_from_site,
    volumeM3: toNumber(row.volume_m3),
    expectedMPa: toNumber(row.expected_mpa),
    achievedMPa: toNumber(row.achieved_mpa),
    status: row.status as TruckStatus,
    percentDiff: toNumber(row.percent_diff),
    supplier: row.supplier,
    slump: toNumber(row.slump),
    slumpMin: toNumber(row.slump_min),
    slumpMax: toNumber(row.slump_max),
    slumpConformity: row.slump_conformity,
    waterAdded: toNumber(row.water_added),
    observation: row.observation,
    costPerM3: toNumber(row.cost_per_m3),
    specimenCount: specimens.length,
    specimens,
    mpa7d: row.mpa_7d === null ? undefined : toNumber(row.mpa_7d),
    mpa28d: row.mpa_28d === null ? undefined : toNumber(row.mpa_28d),
    predictedMpa28d: row.predicted_mpa_28d === null ? undefined : toNumber(row.predicted_mpa_28d),
    predictionIndex: row.prediction_index === null ? undefined : toNumber(row.prediction_index),
    riskLevel: row.risk_level === null ? undefined : row.risk_level as RiskLevel,
    calculistApproval: row.calculist_approval as CalculistApproval,
  };

  return computeTruckDerivedFields(truck);
}

function mapPavimento(row: PavimentoRow, trucks: Truck[]): Pavimento {
  return {
    id: row.id,
    name: row.name,
    date: row.date,
    responsible: row.responsible,
    supplier: row.supplier,
    structuralPiece: row.structural_piece,
    trucks,
  };
}

function truckDerivedUpdate(truck: Truck) {
  return {
    achieved_mpa: truck.achievedMPa,
    status: truck.status,
    percent_diff: truck.percentDiff,
    mpa_7d: truck.mpa7d ?? null,
    mpa_28d: truck.mpa28d ?? null,
    predicted_mpa_28d: truck.predictedMpa28d ?? null,
    prediction_index: truck.predictionIndex ?? null,
    risk_level: truck.riskLevel ?? null,
  };
}

function reportError(message: string, error: unknown) {
  console.error(message, error);
  toast.error(message);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [pavimentos, setPavimentos] = useState<Pavimento[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRemoteData = useCallback(async () => {
    if (!user) {
      setPavimentos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [
        { data: pavRows, error: pavError },
        { data: truckRows, error: truckError },
        { data: specimenRows, error: specimenError },
      ] = await Promise.all([
        supabase.from('pavimentos').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('trucks').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
        supabase.from('test_specimens').select('*').eq('user_id', user.id).order('created_at', { ascending: true }),
      ]);

      if (pavError) throw pavError;
      if (truckError) throw truckError;
      if (specimenError) throw specimenError;

      const specimensByTruck = new Map<string, TestSpecimen[]>();
      (specimenRows || []).forEach((row) => {
        const list = specimensByTruck.get(row.truck_id) || [];
        list.push(mapSpecimen(row));
        specimensByTruck.set(row.truck_id, list);
      });

      const trucksByPavimento = new Map<string, Truck[]>();
      (truckRows || []).forEach((row) => {
        const specimens = specimensByTruck.get(row.id) || [];
        const list = trucksByPavimento.get(row.pavimento_id) || [];
        list.push(mapTruck(row, specimens));
        trucksByPavimento.set(row.pavimento_id, list);
      });

      setPavimentos((pavRows || []).map((row) => mapPavimento(row, trucksByPavimento.get(row.id) || [])));
    } catch (error) {
      reportError('Nao foi possivel carregar os dados do Supabase.', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadRemoteData();
  }, [loadRemoteData]);

  const addPavimento = useCallback(async (pav: Omit<Pavimento, 'id' | 'trucks'>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('pavimentos')
        .insert({
          user_id: user.id,
          name: pav.name,
          date: pav.date,
          responsible: pav.responsible,
          supplier: pav.supplier,
          structural_piece: pav.structuralPiece || '',
        })
        .select()
        .single();

      if (error) throw error;

      setPavimentos((prev) => [mapPavimento(data, []), ...prev]);
      return true;
    } catch (error) {
      reportError('Nao foi possivel salvar o pavimento.', error);
      return false;
    }
  }, [user]);

  const removePavimento = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase.from('pavimentos').delete().eq('id', id).eq('user_id', user.id);
      if (error) throw error;

      setPavimentos((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (error) {
      reportError('Nao foi possivel remover o pavimento.', error);
      return false;
    }
  }, [user]);

  const addTruck = useCallback(async (
    pavimentoId: string,
    truck: Omit<Truck, 'id' | 'status' | 'percentDiff' | 'slumpConformity' | 'specimens' | 'specimenCount' | 'mpa7d' | 'mpa28d' | 'predictedMpa28d' | 'predictionIndex' | 'riskLevel' | 'calculistApproval' | 'achievedMPa'>,
  ) => {
    if (!user) return false;

    const slumpConformity = truck.slump >= truck.slumpMin && truck.slump <= truck.slumpMax;
    const newTruck: Omit<Truck, 'id'> = {
      ...truck,
      achievedMPa: 0,
      status: 'approved',
      percentDiff: 0,
      slumpConformity,
      specimens: [],
      specimenCount: 0,
      calculistApproval: 'analyzing',
    };

    try {
      const { data, error } = await supabase
        .from('trucks')
        .insert({
          pavimento_id: pavimentoId,
          user_id: user.id,
          invoice_number: newTruck.invoiceNumber,
          arrival_date: newTruck.arrivalDate || null,
          arrival_time: newTruck.arrivalTime,
          departure_time_from_plant: newTruck.departureTimeFromPlant,
          unload_start_time: newTruck.unloadStartTime,
          unload_end_time: newTruck.unloadEndTime,
          departure_time_from_site: newTruck.departureTimeFromSite,
          volume_m3: newTruck.volumeM3,
          expected_mpa: newTruck.expectedMPa,
          achieved_mpa: newTruck.achievedMPa,
          status: newTruck.status,
          percent_diff: newTruck.percentDiff,
          supplier: newTruck.supplier,
          slump: newTruck.slump,
          slump_min: newTruck.slumpMin,
          slump_max: newTruck.slumpMax,
          slump_conformity: newTruck.slumpConformity,
          water_added: newTruck.waterAdded,
          observation: newTruck.observation,
          cost_per_m3: newTruck.costPerM3,
          calculist_approval: newTruck.calculistApproval,
        })
        .select()
        .single();

      if (error) throw error;

      const savedTruck = mapTruck(data, []);
      setPavimentos((prev) => prev.map((p) =>
        p.id === pavimentoId ? { ...p, trucks: [...p.trucks, savedTruck] } : p
      ));
      return true;
    } catch (error) {
      reportError('Nao foi possivel salvar o caminhao.', error);
      return false;
    }
  }, [user]);

  const removeTruck = useCallback(async (pavimentoId: string, truckId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase.from('trucks').delete().eq('id', truckId).eq('user_id', user.id);
      if (error) throw error;

      setPavimentos((prev) => prev.map((p) =>
        p.id === pavimentoId ? { ...p, trucks: p.trucks.filter((t) => t.id !== truckId) } : p
      ));
      return true;
    } catch (error) {
      reportError('Nao foi possivel remover o caminhao.', error);
      return false;
    }
  }, [user]);

  const addSpecimen = useCallback(async (pavimentoId: string, truckId: string, specimen: Omit<TestSpecimen, 'id'>) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('test_specimens')
        .insert({
          truck_id: truckId,
          user_id: user.id,
          age: specimen.age,
          mpa_result: specimen.mpaResult,
          rupture_date: specimen.ruptureDate || null,
        })
        .select()
        .single();

      if (error) throw error;

      const savedSpecimen = mapSpecimen(data);
      let updatedTruck: Truck | null = null;

      setPavimentos((prev) => prev.map((p) => {
        if (p.id !== pavimentoId) return p;

        return {
          ...p,
          trucks: p.trucks.map((t) => {
            if (t.id !== truckId) return t;
            const newSpecimens = [...(t.specimens || []), savedSpecimen];
            updatedTruck = computeTruckDerivedFields({ ...t, specimens: newSpecimens, specimenCount: newSpecimens.length });
            return updatedTruck;
          }),
        };
      }));

      if (updatedTruck) {
        const { error: updateError } = await supabase
          .from('trucks')
          .update(truckDerivedUpdate(updatedTruck))
          .eq('id', truckId)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      return true;
    } catch (error) {
      reportError('Nao foi possivel salvar o corpo de prova.', error);
      await loadRemoteData();
      return false;
    }
  }, [loadRemoteData, user]);

  const removeSpecimen = useCallback(async (pavimentoId: string, truckId: string, specimenId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase.from('test_specimens').delete().eq('id', specimenId).eq('user_id', user.id);
      if (error) throw error;

      let updatedTruck: Truck | null = null;

      setPavimentos((prev) => prev.map((p) => {
        if (p.id !== pavimentoId) return p;

        return {
          ...p,
          trucks: p.trucks.map((t) => {
            if (t.id !== truckId) return t;
            const newSpecimens = (t.specimens || []).filter((s) => s.id !== specimenId);
            updatedTruck = computeTruckDerivedFields({ ...t, specimens: newSpecimens, specimenCount: newSpecimens.length });
            return updatedTruck;
          }),
        };
      }));

      if (updatedTruck) {
        const { error: updateError } = await supabase
          .from('trucks')
          .update(truckDerivedUpdate(updatedTruck))
          .eq('id', truckId)
          .eq('user_id', user.id);

        if (updateError) throw updateError;
      }

      return true;
    } catch (error) {
      reportError('Nao foi possivel remover o corpo de prova.', error);
      await loadRemoteData();
      return false;
    }
  }, [loadRemoteData, user]);

  const setCalculistApproval = useCallback(async (pavimentoId: string, truckId: string, approval: CalculistApproval) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('trucks')
        .update({ calculist_approval: approval })
        .eq('id', truckId)
        .eq('user_id', user.id);

      if (error) throw error;

      setPavimentos((prev) => prev.map((p) => {
        if (p.id !== pavimentoId) return p;
        return {
          ...p,
          trucks: p.trucks.map((t) => t.id === truckId ? { ...t, calculistApproval: approval } : t),
        };
      }));
      return true;
    } catch (error) {
      reportError('Nao foi possivel atualizar a aprovacao do calculista.', error);
      return false;
    }
  }, [user]);

  const resetToMockData = useCallback(async () => {
    toast.info('Os dados de exemplo foram removidos. Agora o sistema usa somente o Supabase.');
    return false;
  }, []);

  const clearAllData = useCallback(async () => {
    if (!user) return false;

    try {
      const { error } = await supabase.from('pavimentos').delete().eq('user_id', user.id);
      if (error) throw error;

      setPavimentos([]);
      return true;
    } catch (error) {
      reportError('Nao foi possivel limpar os dados.', error);
      return false;
    }
  }, [user]);

  return (
    <DataContext.Provider value={{
      pavimentos,
      loading,
      addPavimento,
      removePavimento,
      addTruck,
      removeTruck,
      addSpecimen,
      removeSpecimen,
      setCalculistApproval,
      resetToMockData,
      clearAllData,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
