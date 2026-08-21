import type { SOSPayload } from '@/types/domain';
import { formatTime } from '@/utils/format';
import { WifiOff, RefreshCw, CheckCircle2, CloudUpload, ArrowRight } from 'lucide-react';

interface Props {
  sos: SOSPayload | null;
  online: boolean;
}

export function SOSStatus({ sos, online }: Props) {
  if (!sos) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-ink-400">
          <CloudUpload className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink-700">No SOS queued</p>
          <p className="text-xs text-ink-400">Emergency payloads will appear here.</p>
        </div>
      </div>
    );
  }

  const steps: Array<{ key: SOSPayload['status']; label: string; icon: typeof WifiOff }> = [
    { key: 'QUEUED', label: 'Queued', icon: WifiOff },
    { key: 'RETRYING', label: 'Retrying', icon: RefreshCw },
    { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle2 },
  ];
  const currentIdx = steps.findIndex((s) => s.key === sos.status);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CloudUpload className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-semibold text-ink-800">SOS delivery</h3>
        </div>
        <span className="font-mono text-xs text-ink-400">{sos.incidentId}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        {steps.map((step, i) => {
          const done = i < currentIdx || sos.status === 'DELIVERED';
          const active = i === currentIdx && sos.status !== 'DELIVERED';
          return (
            <div key={step.key} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`grid h-8 w-8 place-items-center rounded-full border-2 transition-all ${
                    done
                      ? 'border-risk-green bg-risk-green text-white'
                      : active
                      ? 'border-brand-500 bg-brand-50 text-brand-600'
                      : 'border-slate-200 bg-white text-ink-300'
                  }`}
                >
                  <step.icon className={`h-4 w-4 ${active && sos.status === 'RETRYING' ? 'animate-spin' : ''}`} />
                </div>
                <span
                  className={`text-[10px] font-medium ${
                    done ? 'text-risk-green' : active ? 'text-brand-600' : 'text-ink-300'
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-1 h-0.5 flex-1 rounded-full ${i < currentIdx ? 'bg-risk-green' : 'bg-slate-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 text-xs">
        <div>
          <div className="text-ink-400">Timestamp</div>
          <div className="font-mono font-medium text-ink-700">{formatTime(sos.timestamp)}</div>
        </div>
        <div>
          <div className="text-ink-400">Risk tier</div>
          <div className="font-medium text-risk-red">{sos.riskTier}</div>
        </div>
        <div>
          <div className="text-ink-400">Latitude</div>
          <div className="font-mono font-medium text-ink-700">{sos.lat.toFixed(4)}</div>
        </div>
        <div>
          <div className="text-ink-400">Longitude</div>
          <div className="font-mono font-medium text-ink-700">{sos.lng.toFixed(4)}</div>
        </div>
      </div>

      {!online && sos.status !== 'DELIVERED' && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-risk-amberSoft px-3 py-2 text-xs text-risk-amber">
          <WifiOff className="h-3.5 w-3.5" />
          Connection unavailable — emergency payload queued.
        </div>
      )}
      {sos.status === 'DELIVERED' && (
        <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-risk-greenSoft px-3 py-2 text-xs text-risk-green">
          <CheckCircle2 className="h-3.5 w-3.5" />
          SOS payload delivered to trusted contact.
        </div>
      )}
    </div>
  );
}

export { ArrowRight };
