import { Pavimento } from '@/types/mpaflow';
import { calculateMetrics } from '@/lib/mpaflow';
import { Button } from '@/components/ui/button';
import { Copy, FileText, Share2 } from 'lucide-react';
import { toast } from 'sonner';

function buildSummary(pavimento: Pavimento) {
  const metrics = calculateMetrics([pavimento]);
  return [
    'MPaFlow — Resumo da concretagem',
    pavimento.name + ' | ' + pavimento.date,
    'Responsável: ' + pavimento.responsible,
    'Peça estrutural: ' + (pavimento.structuralPiece || 'Não informada'),
    'Volume total: ' + metrics.totalVolume.toFixed(1) + ' m³',
    'Caminhões: ' + metrics.totalTrucks,
    'Aprovados: ' + metrics.approvedCount,
    'Reprovados: ' + metrics.rejectedCount,
    'Acima: ' + metrics.aboveCount,
    'Aguardando 28 dias: ' + metrics.pendingCount,
    'Conformidade final: ' + (metrics.evaluatedCount ? metrics.complianceRate.toFixed(1) + '%' : 'Sem resultados'),
  ].join('\n');
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
  })[character] || character);
}

export function ReportActions({ pavimento }: { pavimento: Pavimento }) {
  const summary = buildSummary(pavimento);

  const copySummary = async () => {
    await navigator.clipboard.writeText(summary);
    toast.success('Resumo copiado para compartilhar.');
  };

  const shareSummary = async () => {
    if (navigator.share) {
      await navigator.share({ title: 'MPaFlow — ' + pavimento.name, text: summary });
      return;
    }
    await copySummary();
  };

  const printReport = () => {
    const metrics = calculateMetrics([pavimento]);
    const rows = pavimento.trucks.map(truck => {
      const status = truck.mpa28d === undefined
        ? 'Aguardando'
        : truck.status === 'approved' ? 'Aprovado'
        : truck.status === 'rejected' ? 'Reprovado'
        : 'Acima';
      return '<tr><td>' + escapeHtml(truck.invoiceNumber) + '</td><td>' +
        escapeHtml(truck.supplier) + '</td><td>' + truck.volumeM3.toFixed(1) +
        ' m³</td><td>' + truck.expectedMPa.toFixed(1) + '</td><td>' +
        (truck.mpa28d?.toFixed(1) || '—') + '</td><td>' + status + '</td></tr>';
    }).join('');
    const reportWindow = window.open('', '_blank', 'width=1000,height=720');
    if (!reportWindow) {
      toast.error('Permita pop-ups para gerar o relatório.');
      return;
    }
    const html = [
      '<!doctype html><html><head><meta charset="utf-8"><title>Relatório MPaFlow</title>',
      '<style>body{font-family:Arial,sans-serif;color:#172033;padding:36px}h1{margin-bottom:4px}',
      '.muted{color:#667085}.grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;margin:24px 0}',
      '.card{border:1px solid #ddd;border-radius:8px;padding:12px}.card b{display:block;font-size:20px;margin-top:6px}',
      'table{width:100%;border-collapse:collapse;margin-top:22px}th,td{text-align:left;border-bottom:1px solid #ddd;padding:9px;font-size:12px}',
      '@media print{button{display:none}}@page{size:A4 landscape;margin:12mm}</style></head><body>',
      '<h1>Relatório de concretagem</h1><p class="muted">' + escapeHtml(pavimento.name) + ' · ' + pavimento.date + '</p>',
      '<p>Responsável: <b>' + escapeHtml(pavimento.responsible) + '</b> · Peça: <b>' + escapeHtml(pavimento.structuralPiece || 'Não informada') + '</b></p>',
      '<div class="grid"><div class="card">Volume<b>' + metrics.totalVolume.toFixed(1) + ' m³</b></div>',
      '<div class="card">Caminhões<b>' + metrics.totalTrucks + '</b></div><div class="card">Aprovados<b>' + metrics.approvedCount + '</b></div>',
      '<div class="card">Reprovados<b>' + metrics.rejectedCount + '</b></div><div class="card">Acima<b>' + metrics.aboveCount + '</b></div>',
      '<div class="card">Conformidade<b>' + (metrics.evaluatedCount ? metrics.complianceRate.toFixed(1) + '%' : '—') + '</b></div></div>',
      '<table><thead><tr><th>NF</th><th>Fornecedor</th><th>Volume</th><th>FCK</th><th>28 dias</th><th>Situação</th></tr></thead><tbody>',
      rows, '</tbody></table><script>window.onload=function(){window.print()}</script></body></html>',
    ].join('');
    reportWindow.document.write(html);
    reportWindow.document.close();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={printReport} className="gap-1.5">
        <FileText className="w-3.5 h-3.5" /> Imprimir / PDF
      </Button>
      <Button variant="outline" size="sm" onClick={copySummary} className="gap-1.5">
        <Copy className="w-3.5 h-3.5" /> Copiar resumo
      </Button>
      <Button variant="outline" size="sm" onClick={shareSummary} className="gap-1.5">
        <Share2 className="w-3.5 h-3.5" /> Compartilhar
      </Button>
    </div>
  );
}
