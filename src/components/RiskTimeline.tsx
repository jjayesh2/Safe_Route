import type { JourneyEvent } from '@/types/domain';
import { RISK_META } from '@/engine/risk';
import { formatTime } from '@/utils/format';
import {
  Flag,
  Route,
  Clock,
  Users,
  ShieldAlert,
  ShieldCheck,
  Send,
  CheckCircle2,
  XCircle,
  Bell,
  Vibrate,
  Smartphone,
  WifiOff,
  RefreshCw,
  CheckCircle,
  MapPin,
  AlertTriangle,
  Circle,
} from 'lucide-react';
import type { JSX } from 'react';

const ICONS: Partial<Record<JourneyEvent['type'], typeof Flag>> = {
  JOURNEY_STARTED: Flag,
  ROUTE_DEVIATION: Route,
  PROLONGED_STOP: Clock,
  CROWD_CHANGE: Users,
  RISK_CHANGE: AlertTriangle,
  VERIFICATION_SENT: Send,
  USER_CONFIRMED_SAFE: CheckCircle2,
  NO_RESPONSE: XCircle,
  HIGH_RISK: ShieldAlert,
  ALERT_SENT: Bell,
  CONTACT_ACKNOWLEDGED: CheckCircle,
  SHAKE_TRIGGERED: Vibrate,
  DECOY_ACTIVATED: Smartphone,
  SOS_QUEUED: WifiOff,
  SOS_RETRYING: RefreshCw,
  SOS_DELIVERED: CheckCircle,
  NETWORK_OFFLINE: WifiOff,
  NETWORK_RESTORED: RefreshCw,
  INCIDENT_RESOLVED: ShieldCheck,
  SAFE_LOCATION_SHOWN: MapPin,
  JOURNEY_COMPLETED: Flag,
};

function severityColor(sev: JourneyEvent['severity']): string {
  if (sev === 'HIGH') return '#dc2626';
  if (sev === 'MEDIUM') return '#d97706';
  return '#16a34a';
}

interface Props {
  events: JourneyEvent[];
  dense?: boolean;
}

export function RiskTimeline({ events, dense }: Props) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
        <Circle className="h-5 w-5 text-ink-300" />
        <p className="text-sm text-ink-400">No journey events yet.</p>
        <p className="text-xs text-ink-300">Events will appear here as the journey progresses.</p>
      </div>
    );
  }

  return (
    <ol className={`relative ${dense ? 'space-y-2' : 'space-y-3'}`}>
      {events.map((evt, i) => {
        const Icon = ICONS[evt.type] ?? Circle;
        const color = severityColor(evt.severity);
        const isLast = i === events.length - 1;
        return (
          <li key={evt.id} className="relative flex gap-3 animate-fade-up">
            {/* timeline rail */}
            <div className="flex flex-col items-center">
              <div
                className="grid place-items-center rounded-full border-2 bg-white"
                style={{ borderColor: color, color }}
              >
                <Icon className={dense ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
              </div>
              {!isLast && <div className="my-0.5 w-px flex-1 bg-slate-200" />}
            </div>
            <div className={`flex-1 ${isLast ? '' : 'pb-1'}`}>
              <div className="flex items-baseline justify-between gap-2">
                <p className={`font-medium ${dense ? 'text-xs' : 'text-sm'} text-ink-800`}>
                  {evt.description}
                </p>
                <span className={`shrink-0 font-mono ${dense ? 'text-[10px]' : 'text-xs'} text-ink-300`}>
                  {formatTime(evt.timestamp)}
                </span>
              </div>
              {(evt.riskLevel || evt.riskScore !== undefined) && (
                <div className="mt-0.5 flex items-center gap-1.5">
                  {evt.riskLevel && (
                    <span
                      className="pill text-white"
                      style={{ background: RISK_META[evt.riskLevel].color, fontSize: dense ? 9 : 10 }}
                    >
                      {RISK_META[evt.riskLevel].label}
                    </span>
                  )}
                  {evt.riskScore !== undefined && (
                    <span className={`font-mono ${dense ? 'text-[10px]' : 'text-xs'} text-ink-400`}>
                      score {evt.riskScore}
                    </span>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function RiskTimelineIconLegend() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-ink-400">
      <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-risk-green" /> Low</span>
      <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-risk-amber" /> Medium</span>
      <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-risk-red" /> High</span>
    </div>
  );
}

type _Icon = typeof Flag;
export type { _Icon as TimelineIcon };
