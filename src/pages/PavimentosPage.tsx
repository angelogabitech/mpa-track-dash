import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Building2, Plus, Trash2, Truck, TrashIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { STRUCTURAL_PIECES } from '@/types/mpaflow';

const inputClass = "w-full mt-1 rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring";

export default function PavimentosPage() {
  const { pavimentos, addPavimento, removePavimento, clearAllData } = useData();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [responsible, setResponsible] = useState('');
  const [supplier, setSupplier] = useState('');
  const [structuralPiece, setStructuralPiece] = useState('');
  const [customPiece, setCustomPiece] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    if (!name || !date || !responsible || !supplier) return;
    const piece = structuralPiece === 'Outro' ? customPiece : structuralPiece;
    setSaving(true);
    const saved = await addPavimento({ name, date, responsible, supplier, structuralPiece: piece });
    setSaving(false);
    if (!saved) return;

    setName(''); setDate(''); setResponsible(''); setSupplier('');
    setStructuralPiece(''); setCustomPiece('');
    setDialogOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pavimentos</h1>
          <p className="text-sm text-muted-foreground">{pavimentos.length} cadastrados</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (window.confirm('Remover todos os pavimentos, caminhões e corpos de prova? Esta ação não pode ser desfeita.')) {
                void clearAllData();
              }
            }}
            className="gap-1.5 text-destructive hover:text-destructive"
          >
            <TrashIcon className="w-3.5 h-3.5" /> Limpar tudo
          </Button>
          <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Novo Pavimento
          </Button>
        </div>
      </div>

      {pavimentos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-card rounded-xl border">
          <Building2 className="w-12 h-12 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold">Nenhum pavimento</h2>
          <p className="text-sm text-muted-foreground mt-1">Adicione um novo pavimento para começar.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {pavimentos.map((pav) => {
            const approved = pav.trucks.filter(t => t.status !== 'rejected').length;
            const total = pav.trucks.length;
            const rate = total ? ((approved / total) * 100) : 0;
            return (
              <div
                key={pav.id}
                className="bg-card rounded-xl border shadow-sm p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer animate-slide-up"
                onClick={() => navigate(`/pavimentos/${pav.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">{pav.name}</h3>
                    <p className="text-sm text-muted-foreground">{pav.date} · {pav.responsible}</p>
                    <p className="text-xs text-muted-foreground">
                      {pav.supplier}
                      {pav.structuralPiece && ` · ${pav.structuralPiece}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Truck className="w-3.5 h-3.5" /> {total} caminhões
                    </div>
                    <span className={cn(
                      'text-xs font-medium',
                      rate >= 80 ? 'text-status-approved' : rate >= 50 ? 'text-status-warning' : 'text-status-rejected'
                    )}>
                      {rate.toFixed(0)}% conformidade
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Remover este pavimento e todos os dados vinculados?')) {
                        void removePavimento(pav.id);
                      }
                    }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-status-rejected hover:bg-status-rejected-bg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Pavimento</DialogTitle>
            <DialogDescription>Preencha os dados do pavimento.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Nome</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: 4º Pavimento" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Responsável</label>
              <input value={responsible} onChange={e => setResponsible(e.target.value)} placeholder="Ex: Eng. João" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Fornecedor (Concreteira)</label>
              <input value={supplier} onChange={e => setSupplier(e.target.value)} placeholder="Ex: Concreteira Alpha" className={inputClass} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Peça Estrutural</label>
              <select value={structuralPiece} onChange={e => setStructuralPiece(e.target.value)} className={inputClass}>
                <option value="">Selecione...</option>
                {STRUCTURAL_PIECES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                <option value="Outro">Outro</option>
              </select>
            </div>
            {structuralPiece === 'Outro' && (
              <div>
                <label className="text-sm font-medium text-foreground">Especifique a peça</label>
                <input value={customPiece} onChange={e => setCustomPiece(e.target.value)} placeholder="Ex: Cortina" className={inputClass} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={saving || !name || !date || !responsible || !supplier}>
              {saving ? 'Salvando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
