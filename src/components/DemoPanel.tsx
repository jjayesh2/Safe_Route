import { useStore } from '@/store/StoreContext';
import { DEMO_SCENARIOS } from '@/data/seed';
import {
  Play,
  RotateCcw,
  X,
  CheckCircle,
  Route,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Vibrate,
  WifiOff,
  Zap,
  Pause,
} from 'lucide-react';
import type { JSX } from 'react';

const ICONS: Record<string, typeof Play> = {
  'check-circle': CheckCircle,
  'route': Route,
  'clock': Clock,
  'alert-triangle': AlertTriangle,
  'shield-alert': ShieldAlert,
  'vibrate': Vibrate,
  'wifi-off': WifiOff,
};

export function DemoPanel({ onClose }: { onClose: () => void }) {
  const { runScenario, runFullScenario, resetAll, isDemoRunning, currentScenarioId, paused, pauseSimulation, resumeSimulation, journey } = useStore();

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/50 backdrop-blur-sm sm:items-center animate-fade-in">
      <div className="w-full max-w-lg overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl animate-slide-up">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-white">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-ink-900">Demo Mode</h2>
              <p className="text-xs text-ink-400">Run preset scenarios instantly</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-ink-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {/* Full scenario */}
          <button
            onClick={() => { runFullScenario(); onClose(); }}
            className="mb-4 flex w-full items-center gap-3 rounded-2xl border-2 border-brand-500 bg-brand-50 p-4 text-left transition-colors hover:bg-brand-100"
          >
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white">
              <Play className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-brand-800">Run Full Safety Scenario</p>
              <p className="text-xs text-brand-700/80">Normal → deviation → stop → verification → no response → high risk → escalation → dashboard alert</p>
            </div>
          </button>

          <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">Individual scenarios</div>
          <div className="grid gap-2">
            {DEMO_SCENARIOS.map((s) => {
              const Icon = ICONS[s.icon] ?? Play;
              const active = isDemoRunning && currentScenarioId === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => { runScenario(s.id); onClose(); }}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    active
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className={`grid h-9 w-9 place-items-center rounded-lg ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-500'}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-800">{s.name}</p>
                    <p className="text-xs text-ink-400">{s.description}</p>
                  </div>
                  {active && <span className="pill bg-brand-600 text-white">Running</span>}
                </button>
              );
            })}
          </div>

          {journey && (
            <div className="mt-4 flex items-center gap-2">
              {paused ? (
                <button onClick={resumeSimulation} className="btn-ghost flex-1 py-2.5 text-sm">
                  <Play className="h-4 w-4" /> Resume
                </button>
              ) : (
                <button onClick={pauseSimulation} className="btn-ghost flex-1 py-2.5 text-sm">
                  <Pause className="h-4 w-4" /> Pause
                </button>
              )}
              <button onClick={() => { resetAll(); onClose(); }} className="btn-danger flex-1 py-2.5 text-sm">
                <RotateCcw className="h-4 w-4" /> Reset all
              </button>
            </div>
          )}
          {!journey && (
            <button onClick={() => { resetAll(); onClose(); }} className="btn-ghost mt-4 w-full py-2.5 text-sm">
              <RotateCcw className="h-4 w-4" /> Reset everything
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
