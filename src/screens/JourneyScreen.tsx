import { useStore } from '@/store/StoreContext';
import { RiskCard } from '@/components/RiskCard';
import { JourneyMap } from '@/components/JourneyMap';
import { RiskTimeline, RiskTimelineIconLegend } from '@/components/RiskTimeline';
import { ShakeButton } from '@/components/ShakeButton';
import { IncidentStatusCard } from '@/components/IncidentStatus';
import { SOSStatus } from '@/components/SOSStatus';
import { SafeLocationCard } from '@/components/SafeLocationCard';
import {
  MapPin,
  Navigation,
  Clock,
  TrendingUp,
  AlertTriangle,
  X,
  Flag,
  Route as RouteIcon,
  Users,
  Vibrate,
} from 'lucide-react';
import { formatDurationMin, formatTime, formatCoords, timeAgo } from '@/utils/format';
import type { JSX } from 'react';

export function JourneyScreen() {
  const { journey, risk, events, incident, safeLocations, online, sos, endJourney, setTab } = useStore();

  if (!journey) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-20 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-ink-300">
          <RouteIcon className="h-8 w-8" />
        </div>
        <h2 className="mt-4 text-lg font-bold text-ink-800">No active journey</h2>
        <p className="mt-1 text-sm text-ink-400">Start a journey from the Home tab to see live monitoring here.</p>
        <button onClick={() => setTab('home')} className="btn-primary mt-5">
          Go to Home
        </button>
      </div>
    );
  }

  const deviationPct = Math.min(100, (journey.deviationKm / 3) * 100);

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-4">
      {/* journey header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-ink-400">Current journey</div>
          <h1 className="text-lg font-bold text-ink-900">{journey.from} → {journey.to}</h1>
        </div>
        <ShakeButton />
      </div>

      {/* live map */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <JourneyMap
          expectedRoute={journey.expectedRoute}
          actualRoute={journey.actualRoute}
          current={journey.currentLocation}
          destination={journey.destination}
          anomalyPoints={journey.deviationKm > 0.5 ? [journey.currentLocation] : []}
          safeLocations={safeLocations}
          showSafeLocations={risk.level === 'HIGH'}
          height={260}
        />
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-xs">
          <div className="flex items-center gap-1.5 text-ink-500">
            <Navigation className="h-3.5 w-3.5 text-brand-600" />
            <span className="font-medium">Location sharing active</span>
          </div>
          <span className="font-mono text-ink-300">updated {timeAgo(risk.updatedAt)}</span>
        </div>
      </div>

      <RiskCard risk={risk} />

      {/* journey metrics grid */}
      <div className="grid grid-cols-2 gap-3">
        <Metric icon={Clock} label="Journey time" value={formatDurationMin((Date.now() - journey.startedAt) / 60000)} />
        <Metric icon={MapPin} label="ETA" value={formatTime(journey.expectedArrivalAt)} />
        <Metric
          icon={TrendingUp}
          label="Progress"
          value={`${Math.round(journey.progress * 100)}%`}
          bar={journey.progress}
        />
        <Metric
          icon={RouteIcon}
          label="Route deviation"
          value={journey.deviationKm > 0 ? `${journey.deviationKm.toFixed(1)} km` : 'On route'}
          bar={deviationPct / 100}
          accent={journey.deviationKm > 0.5 ? 'amber' : 'green'}
        />
        <Metric icon={Users} label="Crowd context" value={journey.crowd} accent={journey.crowd === 'Low' ? 'amber' : 'green'} />
        <Metric
          icon={AlertTriangle}
          label="Stop duration"
          value={journey.stopDurationMin > 0 ? `${formatDurationMin(journey.stopDurationMin)}` : '—'}
          accent={journey.stopDurationMin > 2 ? 'amber' : 'green'}
        />
      </div>

      {/* live coordinates */}
      <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-ink-400">Current coordinates</span>
          <span className="text-ink-400">Heading {Math.round((journey.progress * 360) % 360)}°</span>
        </div>
        <div className="mt-1 font-mono font-medium text-ink-700">{formatCoords(journey.currentLocation)}</div>
      </div>

      {/* incident + sos */}
      {(incident || sos) && (
        <div className="space-y-3">
          <IncidentStatusCard incident={incident} />
          <SOSStatus sos={sos} online={online} />
        </div>
      )}

      {/* safe locations when high risk */}
      {risk.level === 'HIGH' && safeLocations.length > 0 && (
        <div className="rounded-2xl border border-risk-red/20 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-risk-green/10 text-risk-green">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-ink-900">Move toward a safer nearby location</h3>
              <p className="text-xs text-ink-400">Verified options near your current position</p>
            </div>
          </div>
          <div className="space-y-2">
            {safeLocations.slice(0, 4).map((sl) => (
              <SafeLocationCard key={sl.id} location={sl} />
            ))}
          </div>
        </div>
      )}

      {/* timeline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-ink-800">Journey timeline</h3>
            <p className="text-xs text-ink-400">Every event, explained in real time</p>
          </div>
          <RiskTimelineIconLegend />
        </div>
        <RiskTimeline events={events} />
      </div>

      {/* end journey */}
      {journey.status !== 'COMPLETED' && (
        <button onClick={endJourney} className="btn-ghost w-full py-3 text-sm text-ink-600">
          <Flag className="h-4 w-4" />
          End journey
        </button>
      )}
      {journey.status === 'COMPLETED' && (
        <div className="rounded-xl bg-risk-greenSoft p-4 text-center text-sm font-medium text-risk-green">
          Journey completed — you arrived safely.
        </div>
      )}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  bar,
  accent = 'default',
}: {
  icon: typeof Clock;
  label: string;
  value: string;
  bar?: number;
  accent?: 'default' | 'green' | 'amber' | 'red';
}) {
  const accentClass =
    accent === 'green' ? 'text-risk-green'
    : accent === 'amber' ? 'text-risk-amber'
    : accent === 'red' ? 'text-risk-red'
    : 'text-ink-800';
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-1.5 text-[11px] text-ink-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className={`mt-1 text-sm font-bold ${accentClass}`}>{value}</div>
      {bar !== undefined && (
        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full ${accent === 'amber' ? 'bg-risk-amber' : accent === 'red' ? 'bg-risk-red' : 'bg-brand-500'}`}
            style={{ width: `${Math.min(100, bar * 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}

export type { JSX };
export { Vibrate, X };
