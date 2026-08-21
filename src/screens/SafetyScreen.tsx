import { useStore } from '@/store/StoreContext';
import { RiskCard } from '@/components/RiskCard';
import { RiskTimeline, RiskTimelineIconLegend } from '@/components/RiskTimeline';
import { IncidentStatusCard } from '@/components/IncidentStatus';
import { SOSStatus } from '@/components/SOSStatus';
import { RISK_META } from '@/engine/risk';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Siren,
  Vibrate,
  Phone,
  CheckCircle2,
  Activity,
  Bell,
  Wifi,
  WifiOff,
  Info,
} from 'lucide-react';
import { formatTime, timeAgo } from '@/utils/format';

export function SafetyScreen() {
  const { risk, events, incident, sos, online, setOnline, triggerSOS, acknowledgeByContact, resolveIncident, triggerShake, journey, notifications } = useStore();
  const meta = RISK_META[risk.level];
  const Icon = risk.level === 'NORMAL' ? ShieldCheck : risk.level === 'SUSPICIOUS' ? ShieldAlert : ShieldX;

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-4">
      <h1 className="text-lg font-bold text-ink-900">Safety</h1>

      {/* risk state hero */}
      <div
        className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)` }}
      >
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-white/80">Current state</div>
            <div className="mt-1 flex items-center gap-2">
              <Icon className="h-6 w-6" />
              <span className="text-2xl font-bold">{meta.label}</span>
            </div>
            <div className="mt-1 text-sm text-white/80">Risk score {risk.score}/100</div>
          </div>
          <div className="relative">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15">
              <Icon className="h-8 w-8" />
            </div>
            {risk.level !== 'NORMAL' && (
              <span className="absolute inset-0 rounded-2xl border-2 border-white/30 animate-pulse-ring" />
            )}
          </div>
        </div>
      </div>

      <RiskCard risk={risk} />

      {/* risk explanation */}
      {risk.rationale.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-brand-600" />
            <h3 className="text-sm font-semibold text-ink-800">Why the risk changed</h3>
          </div>
          <ul className="space-y-2">
            {risk.rationale.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-ink-700">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: meta.color }} />
                {r}
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-ink-400">
            Prototype anomaly-detection engine — not a crime-prediction model. Scores reflect unusual travel behavior.
          </p>
        </div>
      )}

      {/* active signals */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink-800">Active risk signals</h3>
        <div className="space-y-2">
          {risk.signals.length === 0 && (
            <p className="text-xs text-ink-400">No signals — journey is normal.</p>
          )}
          {risk.signals.map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${s.active ? 'bg-risk-amber' : 'bg-risk-green'}`} />
                <span className="text-sm font-medium text-ink-700">{s.label}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-ink-400">weight {s.weight}</span>
                <span className={`pill ${s.active ? 'bg-risk-amberSoft text-risk-amber' : 'bg-risk-greenSoft text-risk-green'}`}>
                  {s.active ? 'Active' : 'Clear'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* manual actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-ink-800">Discreet controls</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={triggerShake}
            disabled={!journey}
            className="btn-ghost py-3 text-sm disabled:opacity-40"
          >
            <Vibrate className="h-4 w-4" />
            Silent shake
          </button>
          <button
            onClick={triggerSOS}
            disabled={!journey}
            className="btn-danger py-3 text-sm disabled:opacity-40"
          >
            <Siren className="h-4 w-4" />
            Trigger SOS
          </button>
        </div>
        <p className="mt-2 text-[11px] text-ink-400">
          Silent shake activates decoy mode. SOS shares your live location with your trusted contact.
        </p>
      </div>

      {/* incident + sos status */}
      <div className="space-y-3">
        <IncidentStatusCard incident={incident} />
        <SOSStatus sos={sos} online={online} />
      </div>

      {/* network simulation */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {online ? <Wifi className="h-4 w-4 text-risk-green" /> : <WifiOff className="h-4 w-4 text-risk-red" />}
            <h3 className="text-sm font-semibold text-ink-800">Network status</h3>
          </div>
          <button
            onClick={() => setOnline(!online)}
            className={`pill ${online ? 'bg-risk-greenSoft text-risk-green' : 'bg-risk-redSoft text-risk-red'}`}
          >
            {online ? 'Online' : 'Offline'}
          </button>
        </div>
        <p className="mt-2 text-xs text-ink-400">
          {online
            ? 'SOS payloads deliver instantly. Toggle to simulate connection loss and test the offline queue.'
            : 'Connection unavailable — emergency payloads will be queued and retried automatically.'}
        </p>
      </div>

      {/* incident actions */}
      {incident && incident.status !== 'RESOLVED' && (
        <div className="grid grid-cols-2 gap-3">
          {incident.status === 'ALERT_SENT' && (
            <button onClick={acknowledgeByContact} className="btn-ghost py-3 text-sm">
              <CheckCircle2 className="h-4 w-4" />
              Simulate contact ack
            </button>
          )}
          <button onClick={resolveIncident} className="btn-primary py-3 text-sm">
            <Phone className="h-4 w-4" />
            Resolve incident
          </button>
        </div>
      )}

      {/* notifications */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-2 flex items-center gap-2">
          <Bell className="h-4 w-4 text-ink-500" />
          <h3 className="text-sm font-semibold text-ink-800">Notifications</h3>
        </div>
        {notifications.length === 0 ? (
          <p className="py-4 text-center text-xs text-ink-400">No notifications yet.</p>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 8).map((n) => (
              <div key={n.id} className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2">
                <span className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${n.level === 'HIGH' ? 'bg-risk-red' : n.level === 'SUSPICIOUS' ? 'bg-risk-amber' : 'bg-brand-500'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-ink-800">{n.title}</p>
                  <p className="text-[11px] text-ink-500">{n.body}</p>
                </div>
                <span className="shrink-0 font-mono text-[10px] text-ink-300">{timeAgo(n.timestamp)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-ink-800">Risk timeline</h3>
          <RiskTimelineIconLegend />
        </div>
        <RiskTimeline events={events} />
      </div>
    </div>
  );
}

export { Info };
