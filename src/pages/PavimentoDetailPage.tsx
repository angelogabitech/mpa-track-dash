import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { TruckTable } from '@/components/TruckTable';
import { ArrowLeft, Plus, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { SpecimenAge } from '@/types/mpaflow';
import { QualityInsights } from '@/components/QualityInsights';
import { ReportActions } from '@/components/ReportActions';
import { toast } from 'sonner';

const inputClass = "w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export default function PavimentoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { pavimentos, addTruck, removeTruck, addSpecimen, removeSpecimen, setCalculistApproval } = useData();
  const pavimento = pavimentos.find(p => p.id === id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [specimenDialog, setSpecimenDialog] = useState<{ truckId: string } | null>(null);
  const [savingTruck, setSavingTruck] = useState(false);
  const [savingSpecimen, setSavingSpecimen] = useState(false);

  // Truck form
  const [invoice, setInvoice] = useState('');
  const [arrDate, setArrDate] = useState('');
  const [arrTime, setArrTime] = useState('');
  const [departureFromPlant, setDepartureFromPlant] = useState('');
  const [unloadStart, setUnloadStart] = useState('');
  const [unloadEnd, setUnloadEnd] = useState('');
  const [departureFromSite, setDepartureFromSite] = useState('');
  const [volume, setVolume] = useState('');
  const [expectedMPa, setExpectedMPa] = useState('');
  const [supplier, setSupplier] = useState('');
  const [slump, setSlump] = useState('');
  const [slumpMin, setSlumpMin] = useState('10');
  const [slumpMax, setSlumpMax] = useState('16');
  const [costPerM3, setCostPerM3] = useState('450');
  const [waterAdded, setWaterAdded] = useState('0');
  const [observation, setObservation] = useState('');

  // Specimen form
  const [spAge, setSpAge] = useState<SpecimenAge>('7d');
  const [spMpa, setSpMpa] = useState('');
  const [spDate, setSpDate] = useState('');

  if (!pavimento) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Pavimento não encontrado.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/pavimentos')}>Voltar</Button>
      </div>
    );
  }

  const openTruckDialog = () => {
    if (!arrDate) setArrDate(new Date().toISOString().slice(0, 10));
    if (!supplier) setSupplier(pavimento.supplier);
    setDialogOpen(true);
  };

  const reuseLastTruck = () => {
    const lastTruck = pavimento.trucks[pavimento.trucks.length - 1];
    if (!lastTruck) return;
    setSupplier(lastTruck.supplier);
    setVolume(String(lastTruck.volumeM3));
    setExpectedMPa(String(lastTruck.expectedMPa));
    setSlumpMin(String(lastTruck.slumpMin));
    setSlumpMax(String(lastTruck.slumpMax));
    setCostPerM3(String(lastTruck.costPerM3));
  };

  const stampNextTime = () => {
    const currentTime = new Date().toTimeString().slice(0, 5);
    if (!departureFromPlant) setDepartureFromPlant(currentTime);
    else if (!arrTime) setArrTime(currentTime);
    else if (!unloadStart) setUnloadStart(currentTime);
    else if (!unloadEnd) setUnloadEnd(currentTime);
    else setDepartureFromSite(currentTime);
  };

  const handleAddTruck = async () => {
    const trimmedInvoice = invoice.trim();
    const trimmedSupplier = supplier.trim();
    const parsedVolume = Number(volume);
    const parsedExpectedMPa = Number(expectedMPa);
    const parsedSlump = Number(slump);
    const parsedSlumpMin = Number(slumpMin);
    const parsedSlumpMax = Number(slumpMax);
    const parsedCostPerM3 = Number(costPerM3);
    const parsedWaterAdded = Number(waterAdded);

    if (!trimmedInvoice || !arrDate || !trimmedSupplier || !volume || !expectedMPa || !slump) return;
    if (
      !Number.isFinite(parsedVolume) || parsedVolume < 0 || parsedVolume > 9999
      || !Number.isFinite(parsedExpectedMPa) || parsedExpectedMPa < 0 || parsedExpectedMPa > 1000
      || !Number.isFinite(parsedSlump) || parsedSlump < 0 || parsedSlump > 1000
      || !Number.isFinite(parsedSlumpMin) || parsedSlumpMin < 0 || parsedSlumpMin > 1000
      || !Number.isFinite(parsedSlumpMax) || parsedSlumpMax < parsedSlumpMin || parsedSlumpMax > 1000
      || !Number.isFinite(parsedCostPerM3) || parsedCostPerM3 < 0 || parsedCostPerM3 > 10000000
      || !Number.isFinite(parsedWaterAdded) || parsedWaterAdded < 0 || parsedWaterAdded > 100000
    ) {
      toast.error('Revise os valores numéricos informados.');
      return;
    }

    setSavingTruck(true);
    const saved = await addTruck(pavimento.id, {
      invoiceNumber: trimmedInvoice,
      arrivalDate: arrDate,
      arrivalTime: arrTime,
      departureTimeFromPlant: departureFromPlant,
      unloadStartTime: unloadStart,
      unloadEndTime: unloadEnd,
      departureTimeFromSite: departureFromSite,
      volumeM3: parsedVolume,
      expectedMPa: parsedExpectedMPa,
      supplier: trimmedSupplier,
      slump: parsedSlump,
      slumpMin: parsedSlumpMin,
      slumpMax: parsedSlumpMax,
      costPerM3: parsedCostPerM3,
      waterAdded: parsedWaterAdded,
      observation: observation.trim(),
    });
    setSavingTruck(false);
    if (!saved) return;

    setInvoice(''); setArrDate(''); setArrTime(''); setDepartureFromPlant('');
    setUnloadStart(''); setUnloadEnd(''); setDepartureFromSite('');
    setVolume(''); setExpectedMPa('');
    setSupplier(''); setSlump(''); setSlumpMin('10'); setSlumpMax('16'); setCostPerM3('450');
    setWaterAdded('0'); setObservation('');
    setDialogOpen(false);
  };

  const handleAddSpecimen = async () => {
    const parsedMpa = Number(spMpa);
    if (!specimenDialog || !spMpa || !spDate) return;
    if (!Number.isFinite(parsedMpa) || parsedMpa < 0 || parsedMpa > 1000) {
      toast.error('Informe um resultado de MPa entre 0 e 1000.');
      return;
    }

    setSavingSpecimen(true);
    const saved = await addSpecimen(pavimento.id, specimenDialog.truckId, {
      age: spAge,
      mpaResult: parsedMpa,
      ruptureDate: spDate,
    });
    setSavingSpecimen(false);
    if (!saved) return;

    setSpAge('7d'); setSpMpa(''); setSpDate('');
    setSpecimenDialog(null);
  };

  const truckFormValid = invoice && arrDate && volume && expectedMPa && supplier && slump;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/pavimentos')} className="p-2 rounded-lg hover:bg-accent transition-colors">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">{pavimento.name}</h1>
          <p className="text-sm text-muted-foreground">
            {pavimento.date} · {pavimento.responsible} · {pavimento.supplier}
            {pavimento.structuralPiece && ` · ${pavimento.structuralPiece}`}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <ReportActions pavimento={pavimento} />
          <Button size="sm" onClick={openTruckDialog} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Adicionar Caminhão
          </Button>
        </div>
      </div>

      {pavimento.trucks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border">
          <p className="text-muted-foreground">Nenhum caminhão registrado neste pavimento.</p>
        </div>
      ) : (
        <>
          <TruckTable
            trucks={pavimento.trucks}
            onRemove={(truckId) => {
              if (window.confirm('Remover este caminhão e seus corpos de prova?')) {
                void removeTruck(pavimento.id, truckId);
              }
            }}
            onCalculistApproval={(truckId, approval) => setCalculistApproval(pavimento.id, truckId, approval)}
          />

          <QualityInsights trucks={pavimento.trucks} />

          {/* Specimens section */}
          <div className="bg-card rounded-xl border shadow-sm p-5 space-y-4">
            <h3 className="text-lg font-semibold text-card-foreground flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary" /> Corpos de Prova
            </h3>
            <div className="space-y-3">
              {pavimento.trucks.map(truck => (
                <div key={truck.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-card-foreground">{truck.invoiceNumber}</span>
                      <span className="text-sm text-muted-foreground ml-2">({truck.supplier})</span>
                      {truck.riskLevel && (
                        <span className={cn(
                          'ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          truck.riskLevel === 'high' ? 'bg-status-rejected-bg text-status-rejected' :
                          truck.riskLevel === 'medium' ? 'bg-status-warning-bg text-status-warning' :
                          'bg-status-approved-bg text-status-approved'
                        )}>
                          {truck.riskLevel === 'high' ? 'Alto Risco' : truck.riskLevel === 'medium' ? 'Médio Risco' : 'Baixo Risco'}
                        </span>
                      )}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setSpecimenDialog({ truckId: truck.id })} className="gap-1">
                      <Plus className="w-3 h-3" /> CP
                    </Button>
                  </div>
                  {truck.predictedMpa28d && (
                    <p className="text-xs text-muted-foreground mb-2">
                      Previsão 28d: <span className="font-medium">{truck.predictedMpa28d.toFixed(1)} MPa</span>
                      {' '}(Índice: {truck.predictionIndex?.toFixed(1)}%)
                    </p>
                  )}
                  {(truck.specimens || []).length > 0 ? (
                    <div className="grid gap-2">
                      {(truck.specimens || []).map(sp => {
                        const isOk = sp.age === '7d'
                          ? sp.mpaResult >= truck.expectedMPa * 0.7
                          : sp.age === '28d'
                          ? sp.mpaResult >= truck.expectedMPa
                          : true;
                        return (
                          <div key={sp.id} className={cn(
                            'flex items-center justify-between rounded-lg px-3 py-2 text-sm',
                            isOk ? 'bg-status-approved-bg' : 'bg-status-rejected-bg'
                          )}>
                            <div>
                              <span className="font-medium">{sp.age}</span>
                              <span className="ml-2">{sp.mpaResult.toFixed(1)} MPa</span>
                              <span className="ml-2 text-muted-foreground">{sp.ruptureDate}</span>
                            </div>
                            <button onClick={() => {
                              if (window.confirm('Remover este resultado de corpo de prova?')) {
                                void removeSpecimen(pavimento.id, truck.id, sp.id);
                              }
                            }}
                              className="text-muted-foreground hover:text-status-rejected text-xs">✕</button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">Sem corpos de prova</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Add truck dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Caminhão</DialogTitle>
            <DialogDescription>Dados do caminhão de concreto.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/30 p-3">
            <span className="text-xs text-muted-foreground mr-auto">Atalhos para lançamento em campo</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={reuseLastTruck}
              disabled={pavimento.trucks.length === 0}
            >
              Reutilizar última carga
            </Button>
          </div>
          <div className="space-y-4">
            {/* Identification */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground">Nota Fiscal</label>
                <input value={invoice} onChange={e => setInvoice(e.target.value)} placeholder="NF-001" maxLength={60} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Fornecedor</label>
                <input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Concreteira Alpha" maxLength={120} className={inputClass} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Data</label>
                <input type="date" value={arrDate} onChange={e => setArrDate(e.target.value)} className={inputClass} />
              </div>
            </div>

            {/* Time control */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Controle de Tempo</p>
                <Button type="button" size="sm" variant="outline" onClick={stampNextTime}>
                  Registrar próxima etapa agora
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Saída Central</label>
                  <input type="time" value={departureFromPlant} onChange={e => setDepartureFromPlant(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Chegada Obra</label>
                  <input type="time" value={arrTime} onChange={e => setArrTime(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Início Descarga</label>
                  <input type="time" value={unloadStart} onChange={e => setUnloadStart(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Fim Descarga</label>
                  <input type="time" value={unloadEnd} onChange={e => setUnloadEnd(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Saída Obra</label>
                  <input type="time" value={departureFromSite} onChange={e => setDepartureFromSite(e.target.value)} className={inputClass} />
                </div>
              </div>
            </div>

            {/* Technical */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Controle Tecnológico</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Volume (m³)</label>
                  <input type="number" min="0" max="9999" step="0.1" value={volume} onChange={e => setVolume(e.target.value)} placeholder="8.0" className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">MPa Esperado</label>
                  <input type="number" min="0" max="1000" step="0.1" value={expectedMPa} onChange={e => setExpectedMPa(e.target.value)} placeholder="30" className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Slump (cm)</label>
                  <input type="number" min="0" max="1000" step="0.5" value={slump} onChange={e => setSlump(e.target.value)} placeholder="12" className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Slump Mín (cm)</label>
                  <input type="number" min="0" max="1000" step="0.5" value={slumpMin} onChange={e => setSlumpMin(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Slump Máx (cm)</label>
                  <input type="number" min="0" max="1000" step="0.5" value={slumpMax} onChange={e => setSlumpMax(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Água add. (L)</label>
                  <input type="number" min="0" max="100000" step="1" value={waterAdded} onChange={e => setWaterAdded(e.target.value)} placeholder="0" className={inputClass} />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Valor/m³ (R$)</label>
                  <input type="number" min="0" max="10000000" step="1" value={costPerM3} onChange={e => setCostPerM3(e.target.value)} placeholder="450" className={inputClass} />
                </div>
              </div>
            </div>

            {/* Observation */}
            <div>
              <label className="text-sm font-medium text-foreground">Observação</label>
              <textarea value={observation} onChange={e => setObservation(e.target.value)} placeholder="Observações sobre o caminhão..." rows={2} maxLength={1000}
                className={cn(inputClass, 'resize-none')} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddTruck} disabled={savingTruck || !truckFormValid}>
              {savingTruck ? 'Salvando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add specimen dialog */}
      <Dialog open={!!specimenDialog} onOpenChange={(open) => !open && setSpecimenDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Corpo de Prova</DialogTitle>
            <DialogDescription>Resultado da ruptura do corpo de prova.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Idade</label>
              <select value={spAge} onChange={e => setSpAge(e.target.value as SpecimenAge)}
                className={inputClass}>
                <option value="12h">12 horas</option>
                <option value="7d">7 dias</option>
                <option value="28d">28 dias</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">MPa Resultado</label>
              <input type="number" min="0" max="1000" step="0.1" value={spMpa} onChange={e => setSpMpa(e.target.value)} placeholder="21.0" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Data de Ruptura</label>
              <input type="date" value={spDate} onChange={e => setSpDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSpecimenDialog(null)}>Cancelar</Button>
            <Button onClick={handleAddSpecimen} disabled={savingSpecimen || !spMpa || !spDate}>
              {savingSpecimen ? 'Salvando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
