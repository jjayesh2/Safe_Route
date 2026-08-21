import { useStore } from '@/store/StoreContext';
import { RiskCard } from '@/components/RiskCard';
import { JourneyMap } from '@/components/JourneyMap';
import {
  Play,
  Users,
  History,
  Settings,
  Plus,
  MapPin,
  Clock,
  Navigation,
  ShieldCheck,
  ArrowRight,
  Phone,
  ChevronRight,
} from 'lucide-react';
import { formatDurationMin, formatTime, timeAgo } from '@/utils/format';
import { ShakeButton } from '@/components/ShakeButton';

export function HomeScreen({ onDemo }: { onDemo: () => void }) {
  const { user, journey, risk, showStartJourney, contacts, selectedContactId, setTab, events, notifications } = useStore();
  const contact = contacts.find((c) => c.id === selectedContactId);
  const recent = events.slice(-3).reverse();

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-4">
      {/* greeting */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-400">Welcome back</p>
          <h1 className="text-xl font-bold text-ink-900">{user.name.split(' ')[0]}</h1>
        </div>
        <ShakeButton />
      </div>

      {/* status hero */}
      {!journey ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-lg shadow-brand-600/20">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-semibold">No active journey</span>
            </div>
            <h2 className="mt-2 text-2xl font-bold leading-tight">Ready when you are</h2>
            <p className="mt-1 text-sm text-white/80">Start a journey to begin continuous safety monitoring.</p>
            <button onClick={showStartJourney} className="btn mt-4 bg-white text-brand-700 hover:bg-white/90 px-4 py-3 text-sm">
              <Plus className="h-4 w-4" />
              Start a journey
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* journey status banner */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${risk.level === 'NORMAL' ? 'bg-risk-greenSoft text-risk-green' : risk.level === 'SUSPICIOUS' ? 'bg-risk-amberSoft text-risk-amber' : 'bg-risk-redSoft text-risk-red'}`}>
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs text-ink-400">Journey status</div>
                <div className="text-sm font-bold text-ink-900">
                  {journey.status === 'COMPLETED' ? 'Arrived safely' : risk.level === 'NORMAL' ? 'Journey Safe' : risk.level === 'SUSPICIOUS' ? 'Monitoring closely' : 'High-risk state'}
                </div>
              </div>
            </div>
            <span className={`pill ${risk.level === 'NORMAL' ? 'bg-risk-greenSoft text-risk-green' : risk.level === 'SUSPICIOUS' ? 'bg-risk-amberSoft text-risk-amber' : 'bg-risk-redSoft text-risk-red'}`}>
              {risk.level === 'NORMAL' ? 'Live' : risk.level === 'SUSPICIOUS' ? 'Alert' : 'Critical'}
            </span>
          </div>

          <RiskCard risk={risk} />

          {/* journey summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-ink-400">Current journey</div>
                <div className="mt-0.5 text-sm font-bold text-ink-900">{journey.from} → {journey.to}</div>
              </div>
              <span className="pill bg-slate-100 text-ink-600">{journey.mode}</span>
            </div>

            <div className="mt-3">
              <JourneyMap
                expectedRoute={journey.expectedRoute}
                actualRoute={journey.actualRoute}
                current={journey.currentLocation}
                destination={journey.destination}
                height={180}
              />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-slate-50 py-2">
                <div className="text-[10px] text-ink-400">Progress</div>
                <div className="text-sm font-bold text-ink-800">{Math.round(journey.progress * 100)}%</div>
              </div>
              <div className="rounded-lg bg-slate-50 py-2">
                <div className="text-[10px] text-ink-400">ETA</div>
                <div className="text-sm font-bold text-ink-800">{formatTime(journey.expectedArrivalAt)}</div>
              </div>
              <div className="rounded-lg bg-slate-50 py-2">
                <div className="text-[10px] text-ink-400">Remaining</div>
                <div className="text-sm font-bold text-ink-800">{formatDurationMin(Math.max(0, journey.expectedDurationMin * (1 - journey.progress)))}</div>
              </div>
            </div>

            <button onClick={() => setTab('journey')} className="btn-ghost mt-3 w-full py-2.5 text-sm">
              View journey details
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <QuickAction icon={Play} label="Start Journey" desc="Set up & monitor" onClick={showStartJourney} accent />
        <QuickAction icon={Users} label="Trusted Contacts" desc={contact?.name ?? 'Set contact'} onClick={() => setTab('contacts')} />
        <QuickAction icon={History} label="Journey History" desc="Past trips" onClick={() => setTab('journey')} />
        <QuickAction icon={Settings} label="Safety Settings" desc="Demo controls" onClick={onDemo} />
      </div>

      {/* recent activity */}
      {recent.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink-800">Recent activity</h3>
            <button onClick={() => setTab('safety')} className="text-xs font-medium text-brand-600">View all</button>
          </div>
          <div className="space-y-2">
            {recent.map((evt) => (
              <div key={evt.id} className="flex items-center gap-2 text-xs">
                <span className={`h-1.5 w-1.5 rounded-full ${evt.severity === 'HIGH' ? 'bg-risk-red' : evt.severity === 'MEDIUM' ? 'bg-risk-amber' : 'bg-risk-green'}`} />
                <span className="flex-1 text-ink-600">{evt.description}</span>
                <span className="font-mono text-ink-300">{timeAgo(evt.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {notifications.length === 0 && !journey && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
          <MapPin className="mx-auto h-6 w-6 text-ink-300" />
          <p className="mt-2 text-sm font-medium text-ink-500">No journeys yet</p>
          <p className="text-xs text-ink-400">Start your first journey to see live monitoring.</p>
        </div>
      )}
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  desc,
  onClick,
  accent,
}: {
  icon: typeof Play;
  label: string;
  desc: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
        accent
          ? 'border-brand-500 bg-brand-50 hover:bg-brand-100'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${accent ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-500'}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className={`text-sm font-semibold ${accent ? 'text-brand-800' : 'text-ink-800'}`}>{label}</div>
        <div className="truncate text-[11px] text-ink-400">{desc}</div>
      </div>
    </button>
  );
}

export { ChevronRight, Phone, Clock, Navigation };
