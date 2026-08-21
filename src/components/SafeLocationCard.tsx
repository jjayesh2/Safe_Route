import type { SafeLocation } from '@/types/domain';
import { formatDistance } from '@/utils/format';
import { Shield, Navigation, Clock, Building2, Stethoscope, Landmark, Store } from 'lucide-react';

const TYPE_ICON: Record<SafeLocation['type'], typeof Shield> = {
  'Police Station': Shield,
  'Metro Station': Navigation,
  'Hospital': Stethoscope,
  'Public Area': Store,
  'Security Desk': Building2,
};

interface Props {
  location: SafeLocation;
  onNavigate?: () => void;
}

export function SafeLocationCard({ location, onNavigate }: Props) {
  const Icon = TYPE_ICON[location.type];
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-risk-green/10 text-risk-green">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-ink-800">{location.name}</p>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-400">
          <span className="font-medium text-ink-600">{location.type}</span>
          <span>·</span>
          <span>{formatDistance(location.distanceM)} {location.bearing}</span>
          <span>·</span>
          {location.open ? (
            <span className="flex items-center gap-0.5 text-risk-green"><Clock className="h-3 w-3" /> Open</span>
          ) : (
            <span className="flex items-center gap-0.5 text-ink-300"><Clock className="h-3 w-3" /> Closed</span>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onNavigate}
        className="btn-ghost shrink-0 px-3 py-2 text-xs"
      >
        <Navigation className="h-3.5 w-3.5" />
        Go
      </button>
    </div>
  );
}

export { Landmark };
