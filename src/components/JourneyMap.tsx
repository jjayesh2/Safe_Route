import { useMemo } from 'react';
import type { GeoPoint, SafeLocation } from '@/types/domain';
import { MapPin, Navigation, AlertTriangle, Shield } from 'lucide-react';

interface Props {
  expectedRoute: GeoPoint[];
  actualRoute: GeoPoint[];
  current: GeoPoint;
  destination: GeoPoint;
  anomalyPoints?: GeoPoint[];
  safeLocations?: SafeLocation[];
  showSafeLocations?: boolean;
  className?: string;
  height?: number | string;
}

// Project lat/lng to a normalized 0..100 viewBox coordinate.
// We compute bounds from the expected route + actual route + current + dest.
export function JourneyMap({
  expectedRoute,
  actualRoute,
  current,
  destination,
  anomalyPoints = [],
  safeLocations = [],
  showSafeLocations = false,
  className = '',
  height = 240,
}: Props) {
  const all = useMemo(
    () => [...expectedRoute, ...actualRoute, current, destination, ...anomalyPoints],
    [expectedRoute, actualRoute, current, destination, anomalyPoints]
  );

  const bounds = useMemo(() => {
    if (all.length === 0) {
      return { minLat: 0, maxLat: 1, minLng: 0, maxLng: 1 };
    }
    const lats = all.map((p) => p.lat);
    const lngs = all.map((p) => p.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const padLat = Math.max(0.002, (maxLat - minLat) * 0.15);
    const padLng = Math.max(0.002, (maxLng - minLng) * 0.15);
    return {
      minLat: minLat - padLat,
      maxLat: maxLat + padLat,
      minLng: minLng - padLng,
      maxLng: maxLng + padLng,
    };
  }, [all]);

  const project = (p: GeoPoint) => {
    const x = ((p.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100;
    // y inverted because SVG y grows downward but lat grows upward
    const y = 100 - ((p.lat - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100;
    return { x, y };
  };

  const expectedPath = expectedRoute
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${project(p).x.toFixed(2)} ${project(p).y.toFixed(2)}`)
    .join(' ');
  const actualPath = actualRoute
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${project(p).x.toFixed(2)} ${project(p).y.toFixed(2)}`)
    .join(' ');

  const cur = project(current);
  const dest = project(destination);

  return (
    <div
      className={`map-grid relative overflow-hidden rounded-2xl border border-slate-200 ${className}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        {/* faux streets */}
        <g stroke="#c8d4e3" strokeWidth="0.4" opacity="0.6">
          <line x1="0" y1="25" x2="100" y2="30" />
          <line x1="0" y1="55" x2="100" y2="50" />
          <line x1="0" y1="78" x2="100" y2="75" />
          <line x1="22" y1="0" x2="28" y2="100" />
          <line x1="52" y1="0" x2="48" y2="100" />
          <line x1="78" y1="0" x2="82" y2="100" />
        </g>
        <g stroke="#dce6f2" strokeWidth="0.25" opacity="0.5">
          <line x1="0" y1="10" x2="100" y2="12" />
          <line x1="0" y1="40" x2="100" y2="42" />
          <line x1="0" y1="65" x2="100" y2="63" />
          <line x1="0" y1="90" x2="100" y2="92" />
          <line x1="10" y1="0" x2="12" y2="100" />
          <line x1="38" y1="0" x2="36" y2="100" />
          <line x1="65" y1="0" x2="67" y2="100" />
          <line x1="90" y1="0" x2="88" y2="100" />
        </g>

        {/* expected route */}
        <path
          d={expectedPath}
          fill="none"
          stroke="#94a3b8"
          strokeWidth="1.4"
          strokeDasharray="3 2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* actual route */}
        {actualRoute.length > 1 && (
          <path
            d={actualPath}
            fill="none"
            stroke="#1f66f0"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />
        )}

        {/* anomaly markers */}
        {anomalyPoints.map((p, i) => {
          const pr = project(p);
          return (
            <g key={`anom-${i}`}>
              <circle cx={pr.x} cy={pr.y} r="2.4" fill="#d97706" opacity="0.9" />
              <circle cx={pr.x} cy={pr.y} r="4" fill="none" stroke="#d97706" strokeWidth="0.5" opacity="0.5" />
            </g>
          );
        })}

        {/* safe locations */}
        {showSafeLocations &&
          safeLocations.map((sl) => {
            // place near current with slight offset
            const angle = (parseInt(sl.id.slice(-1), 10) || 1) * 60;
            const rad = (angle * Math.PI) / 180;
            const sx = cur.x + Math.cos(rad) * 10;
            const sy = cur.y + Math.sin(rad) * 10;
            return (
              <g key={sl.id}>
                <circle cx={sx} cy={sy} r="2" fill="#16a34a" />
                <circle cx={sx} cy={sy} r="3.5" fill="none" stroke="#16a34a" strokeWidth="0.4" opacity="0.6" />
              </g>
            );
          })}

        {/* destination */}
        <g>
          <circle cx={dest.x} cy={dest.y} r="3" fill="#0f1620" />
          <circle cx={dest.x} cy={dest.y} r="5" fill="none" stroke="#0f1620" strokeWidth="0.6" opacity="0.4" />
        </g>

        {/* current position pulse */}
        <g>
          <circle cx={cur.x} cy={cur.y} r="2.5" fill="#3385ff">
            <animate attributeName="r" values="2.5;5;2.5" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={cur.x} cy={cur.y} r="2" fill="#1f66f0" stroke="white" strokeWidth="0.6" />
        </g>
      </svg>

      {/* legend */}
      <div className="absolute left-2 top-2 flex flex-col gap-1 rounded-lg bg-white/90 px-2 py-1.5 text-[10px] font-medium shadow-sm backdrop-blur">
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-3 rounded-full" style={{ background: '#1f66f0' }} />
          Actual route
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-3 rounded-full border border-slate-400" style={{ background: 'transparent' }} />
          Expected
        </div>
        {anomalyPoints.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: '#d97706' }} />
            Anomaly
          </div>
        )}
        {showSafeLocations && (
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: '#16a34a' }} />
            Safe location
          </div>
        )}
      </div>

      {/* current position label */}
      <div className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-brand-700 shadow-sm backdrop-blur">
        <Navigation className="h-3 w-3" />
        {current.label ?? 'Current'}
      </div>

      {/* destination label */}
      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-semibold text-ink-700 shadow-sm backdrop-blur">
        <MapPin className="h-3 w-3" />
        {destination.label ?? 'Destination'}
      </div>
    </div>
  );
}

export function JourneyMapMini(props: Props) {
  return <JourneyMap {...props} height={160} />;
}
