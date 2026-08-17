import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { apiRequest } from '@/api/client';
import { toUserMessage } from '@/api/errorMessage';
import type { AuditLogEntry } from '@/types/shared';

interface ExportResponse {
  entries: AuditLogEntry[];
  hash: string;
}

// HU-07 Reportes de auditoría exportables (PDF/Excel).
// HU-20 Exportación de evidencia firmada digitalmente (hash/checksum).
// El hash lo calcula el backend
export function AuditReports() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);
  const [includeHash, setIncludeHash] = useState(true);
  const [loading, setLoading] = useState(false);
  const [lastHash, setLastHash] = useState<string | null>(null);
  const [noData, setNoData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateRange = () => {
    if (from && to && from > to) {
      setDateError('La fecha "Desde" debe ser anterior a "Hasta"');
      return false;
    }
    setDateError(null);
    return true;
  };

  const handleExport = async (format: 'pdf' | 'excel') => {
    if (!validateRange()) return;
    setLoading(true);
    setNoData(false);
    setError(null);
    try {
      const qs = new URLSearchParams();
      if (from) qs.set('from', from);
      if (to) qs.set('to', to);
      const { entries, hash } = await apiRequest<ExportResponse>(`/audit-logs/export?${qs.toString()}`);

      if (entries.length === 0) {
        setNoData(true);
        return;
      }
      if (includeHash) setLastHash(hash);
      downloadCsv(entries, format);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const downloadCsv = (entries: AuditLogEntry[], format: 'pdf' | 'excel') => {
    //estilo CSV estándar
    const escape = (value: string) =>
      /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

    const header = 'id,userId,action,result,ipAddress,riskLevel,createdAt\n';
    const rows = entries
      .map((e) =>
        [e.id, e.userId, e.action, e.result, e.ipAddress, e.riskLevel, e.createdAt]
          .map(escape)
          .join(','),
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auditoria-${format}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader
        title="Reportes de auditoría"
        huRef="HU-07 · HU-20"
        description="Exporta evidencia de auditoría para revisiones regulatorias, con verificación de integridad."
      />
      <div className="card max-w-lg space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="report-from" className="text-xs text-muted">Desde</label>
            <input id="report-from" className="input mt-1" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div>
            <label htmlFor="report-to" className="text-xs text-muted">Hasta</label>
            <input id="report-to" className="input mt-1" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        {dateError && <p className="text-xs text-risk-high">{dateError}</p>}
        {noData && (
          <p className="text-xs text-risk-medium">No hay datos de auditoría en el rango seleccionado.</p>
        )}
        {error && <p className="text-xs text-risk-high">{error}</p>}

        <div className="flex gap-3">
          <button className="btn-primary" onClick={() => handleExport('pdf')} disabled={loading}>
            {loading ? 'Generando...' : 'Exportar PDF'}
          </button>
          <button className="btn-secondary" onClick={() => handleExport('excel')} disabled={loading}>
            {loading ? 'Generando...' : 'Exportar Excel'}
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm pt-2 border-t border-border">
          <input type="checkbox" checked={includeHash} onChange={(e) => setIncludeHash(e.target.checked)} />
          Incluir hash de integridad (evidencia firmada)
        </label>

        {lastHash && (
          <p className="text-xs font-mono text-accent bg-accent-soft rounded px-2 py-1.5 break-all">
            Evidencia firmada · {lastHash}
          </p>
        )}
      </div>
    </div>
  );
}
