import type { RiskLevel } from '@/types/shared';

const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'Normal',
  medium: 'Atención',
  high: 'Crítico',
};

const RISK_DOT: Record<RiskLevel, string> = {
  low: 'bg-risk-low',
  medium: 'bg-risk-medium',
  high: 'bg-risk-high',
};

//Todo evento de auditoría, alerta o incumplimiento de SLA se comunica con este mismo componente

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wide text-text">
      <span className={`h-2 w-2 rounded-full ${RISK_DOT[level]}`} />
      {RISK_LABEL[level]}
    </span>
  );
}
