import type { Incident, IncidentStatus } from '@/types/domain';
import { formatTime } from '@/utils/format';
import {
  Eye,
  AlertTriangle,
  Send,
  ShieldAlert,
  Bell,
  CheckCircle2,
  CheckCircle,
  Activity,
} from 'lucide-react';

const STATUS_META: Record<
  IncidentStatus,
  { label: string; color: string; bg: string; icon: typeof Eye }
> = {
  MONITORING: { label: 'Monitoring', color: '#16a34a', bg: 'bg-risk-green/10', icon: Eye },
  SUSPICIOUS: { label: 'Suspicious', color: '#d97706', bg: 'bg-risk-amber/10', icon: AlertTriangle },
  VERIFICATION_SENT: { label: 'Verification sent', color: '#d97706', bg: 'bg-risk-amber/10', icon: Send },
  HIGH_RISK: { label: 'High risk', color: '#dc2626', bg: 'bg-risk-red/10', icon: ShieldAlert },
  ALERT_SENT: { label: 'Alert sent', color: '#dc2626', bg: 'bg-risk-red/10', icon: Bell },
  CONTACT_ACKNOWLEDGED: { label: 'Contact acknowledged', color: '#1f66f0', bg: 'bg-brand-50', icon: CheckCircle2 },
  RESOLVED: { label: 'Resolved', color: '#16a34a', bg: 'bg-risk-green/10', icon: CheckCircle },
};

interface Props {
  incident: Incident | null;
  compact?: boolean;
}

export function IncidentStatusCard({ incident, compact }: Props) {
  if (!incident) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-ink-400">
          <Activity className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-700">No active incident</p>
          <p className="text-xs text-ink-400">Journey monitoring is running normally.</p>
        </div>
      </div>
    );
  }

  const meta = STATUS_META[incident.status];

  if (compact) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <span className="font-mono text-xs font-semibold text-ink-500">{incident.incidentId}</span>
        <span className="h-3 w-px bg-slate-200" />
        <span className="pill" style={{ background: meta.bg, color: meta.color }}>
          {meta.label}
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">Incident</div>
          <div className="mt-0.5 font-mono text-lg font-bold text-ink-900">#{incident.incidentId}</div>
        </div>
        <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${meta.bg}`} style={{ color: meta.color }}>
          <meta.icon className="h-3.5 w-3.5" />
          {meta.label}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-ink-400">Started</div>
          <div className="font-medium text-ink-700">{formatTime(incident.startedAt)}</div>
        </div>
        <div>
          <div className="text-ink-400">Risk level</div>
          <div className="font-medium" style={{ color: meta.color }}>{incident.riskLevel}</div>
        </div>
      </div>
    </div>
  );
}
