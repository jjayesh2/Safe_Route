import { useStore } from '@/store/StoreContext';
import { JourneyMap } from '@/components/JourneyMap';
import { RiskCard } from '@/components/RiskCard';
import { RiskTimeline, RiskTimelineIconLegend } from '@/components/RiskTimeline';
import { IncidentStatusCard } from '@/components/IncidentStatus';
import { SOSStatus } from '@/components/SOSStatus';
import { SafeLocationCard } from '@/components/SafeLocationCard';
import { ContactAvatar } from '@/components/TrustedContactCard';
import { RISK_META } from '@/engine/risk';
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Phone,
  MapPin,
  ArrowLeft,
  Activity,
  Navigation,
  CheckCircle2,
  Clock,
  Share2,
  Bell,
  Radio,
  Building2,
  X,
} from 'lucide-react';
import { formatCoords, formatDurationMin, formatTime, timeAgo } from '@/utils/format';

export function DashboardScreen() {
  const { snapshot, setView, acknowledgeByContact, resolveIncident, contacts } = useStore();
  const { user, journey, risk, incident, timeline, safeLocations, sos, online, updatedAt } = snapshot;
  const contact = contacts.find((c) => c.id === (incident?.contactId ?? ''));
  const meta = RISK_META[risk.level];
  const Icon = risk.level === 'NORMAL' ? ShieldCheck : risk.level === 'SUSPICIOUS' ? ShieldAlert : ShieldX;

  return (
    <div className="min-h-screen bg-slate-100">
      {/* top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('app')} className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-ink-900">SafeRoute Emergency Dashboard</div>
                <div className="text-[11px] text-ink-400">Trusted contact view · {contact?.name ?? '—'}</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`pill ${online ? 'bg-risk-greenSoft text-risk-green' : 'bg-risk-redSoft text-risk-red'}`}>
              <Radio className="h-3 w-3" />
              {online ? 'Live' : 'Offline'}
            </span>
            <span className="hidden text-xs text-ink-400 sm:inline">Updated {timeAgo(updatedAt)}</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-5">
        {!journey ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-ink-300">
              <Activity className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-ink-800">No active journey</h2>
            <p className="mt-1 max-w-sm text-sm text-ink-400">
              When {user.name.split(' ')[0]} starts a journey, you'll see live location, risk status, and incident alerts here in real time.
            </p>
            <button onClick={() => setView('app')} className="btn-primary mt-5">
              Open traveler app
            </button>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {/* left/main column */}
            <div className="space-y-4 lg:col-span-2">
              {/* user status banner */}
              <div
                className="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
                style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}dd)` }}
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/15">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wider text-white/80">{user.name}</div>
                      <div className="text-xl font-bold">{meta.label}</div>
                      <div className="text-sm text-white/80">Risk score {risk.score}/100</div>
                    </div>
                  </div>
                  {incident && (
                    <div className="rounded-xl bg-white/15 px-3 py-2 text-right">
                      <div className="text-[10px] uppercase text-white/70">Incident</div>
                      <div className="font-mono text-sm font-bold">#{incident.incidentId}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* live map */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-brand-600" />
                    <h3 className="text-sm font-semibold text-ink-800">Live location</h3>
                  </div>
                  <span className="font-mono text-xs text-ink-400">{formatCoords(journey.currentLocation)}</span>
                </div>
                <JourneyMap
                  expectedRoute={journey.expectedRoute}
                  actualRoute={journey.actualRoute}
                  current={journey.currentLocation}
                  destination={journey.destination}
                  anomalyPoints={journey.deviationKm > 0.5 ? [journey.currentLocation] : []}
                  safeLocations={safeLocations}
                  showSafeLocations={risk.level === 'HIGH'}
                  height={320}
                />
                <div className="grid grid-cols-3 gap-px bg-slate-100 text-center text-xs">
                  <div className="bg-white py-2.5">
                    <div className="text-ink-400">Last update</div>
                    <div className="font-semibold text-ink-700">{timeAgo(updatedAt)}</div>
                  </div>
                  <div className="bg-white py-2.5">
                    <div className="text-ink-400">Movement</div>
                    <div className="font-semibold text-ink-700">
                      {journey.stopDurationMin > 0 ? 'Stopped' : journey.status === 'COMPLETED' ? 'Arrived' : 'Moving'}
                    </div>
                  </div>
                  <div className="bg-white py-2.5">
                    <div className="text-ink-400">Progress</div>
                    <div className="font-semibold text-ink-700">{Math.round(journey.progress * 100)}%</div>
                  </div>
                </div>
              </div>

              {/* safe locations */}
              {risk.level === 'HIGH' && safeLocations.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-risk-green" />
                    <h3 className="text-sm font-semibold text-ink-800">Nearby safe locations for {user.name.split(' ')[0]}</h3>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {safeLocations.slice(0, 4).map((sl) => (
                      <SafeLocationCard key={sl.id} location={sl} />
                    ))}
                  </div>
                </div>
              )}

              {/* timeline */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-brand-600" />
                    <h3 className="text-sm font-semibold text-ink-800">Incident timeline</h3>
                  </div>
                  <RiskTimelineIconLegend />
                </div>
                <RiskTimeline events={timeline} />
              </div>
            </div>

            {/* right column */}
            <div className="space-y-4">
              <RiskCard risk={risk} />

              <IncidentStatusCard incident={incident} />

              {/* reason */}
              {risk.rationale.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-risk-amber" />
                    <h3 className="text-sm font-semibold text-ink-800">Reason for escalation</h3>
                  </div>
                  <ul className="space-y-2 text-sm">
                    {risk.rationale.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 text-ink-700">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: meta.color }} />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* journey snapshot */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-brand-600" />
                  <h3 className="text-sm font-semibold text-ink-800">Journey info</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <Row label="From" value={journey.from} />
                  <Row label="To" value={journey.to} />
                  <Row label="Mode" value={journey.mode} />
                  <Row label="Started" value={formatTime(journey.startedAt)} />
                  <Row label="ETA" value={formatTime(journey.expectedArrivalAt)} />
                  <Row label="Route deviation" value={journey.deviationKm > 0 ? `${journey.deviationKm.toFixed(1)} km` : 'On route'} accent={journey.deviationKm > 0.5 ? 'amber' : undefined} />
                  <Row label="Stop duration" value={journey.stopDurationMin > 0 ? formatDurationMin(journey.stopDurationMin) : '—'} accent={journey.stopDurationMin > 2 ? 'amber' : undefined} />
                  <Row label="Crowd context" value={journey.crowd} accent={journey.crowd === 'Low' ? 'amber' : undefined} />
                </div>
              </div>

              {/* SOS status */}
              <SOSStatus sos={sos} online={online} />

              {/* action buttons */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold text-ink-800">Actions</h3>
                <div className="space-y-2">
                  <button className="btn-primary w-full py-3 text-sm">
                    <Phone className="h-4 w-4" /> Call {user.name.split(' ')[0]}
                  </button>
                  <button className="btn-ghost w-full py-3 text-sm">
                    <Share2 className="h-4 w-4" /> View live location
                  </button>
                  {incident && incident.status !== 'CONTACT_ACKNOWLEDGED' && incident.status !== 'RESOLVED' && (
                    <button onClick={acknowledgeByContact} className="btn-ghost w-full py-3 text-sm">
                      <CheckCircle2 className="h-4 w-4" /> Mark assistance acknowledged
                    </button>
                  )}
                  {incident && incident.status === 'CONTACT_ACKNOWLEDGED' && (
                    <button onClick={resolveIncident} className="btn-ghost w-full py-3 text-sm">
                      <X className="h-4 w-4" /> Resolve incident
                    </button>
                  )}
                </div>
              </div>

              <p className="px-1 text-center text-[11px] text-ink-400">
                This dashboard mirrors the traveler's app in real time. Data is simulated for the hackathon prototype.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: 'amber' }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-ink-400">{label}</span>
      <span className={`font-semibold ${accent === 'amber' ? 'text-risk-amber' : 'text-ink-800'}`}>{value}</span>
    </div>
  );
}

export { Clock, Bell };
