import { RISK_META } from '@/engine/risk';
import type { RiskLevel, RiskState } from '@/types/domain';
import { ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Props {
  risk: RiskState;
  compact?: boolean;
}

const ICONS: Record<RiskLevel, typeof ShieldCheck> = {
  NORMAL: ShieldCheck,
  SUSPICIOUS: ShieldAlert,
  HIGH: ShieldX,
};

export function RiskCard({ risk, compact }: Props) {
  const meta = RISK_META[risk.level];
  const Icon = ICONS[risk.level];
  const [displayScore, setDisplayScore] = useState(risk.score);

  // smooth count animation
  useEffect(() => {
    const start = displayScore;
    const target = risk.score;
    if (start === target) return;
    const dur = 600;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplayScore(Math.round(start + (target - start) * eased));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [risk.score]);

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        <div
          className="grid h-9 w-9 place-items-center rounded-lg text-white"
          style={{ background: meta.color }}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold ${meta.text}`}>{meta.label}</span>
          </div>
          <div className="text-xs text-ink-400">
            Risk score <span className="font-mono font-semibold text-ink-700">{displayScore}</span>/100
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl border bg-white p-5 transition-colors"
      style={{ borderColor: `${meta.color}33` }}
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-10"
        style={{ background: meta.color }}
      />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-400">
            Risk score
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span
              className="font-mono text-4xl font-bold tabular-nums"
              style={{ color: meta.color }}
            >
              {displayScore}
            </span>
            <span className="text-sm font-medium text-ink-300">/100</span>
          </div>
        </div>
        <div
          className="grid h-12 w-12 place-items-center rounded-xl text-white shadow-sm"
          style={{ background: meta.color }}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span
          className="pill text-white"
          style={{ background: meta.color }}
        >
          <Icon className="h-3.5 w-3.5" />
          {meta.label}
        </span>
        <span className="text-xs text-ink-400">anomaly-detection engine</span>
      </div>

      {/* progress bar */}
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${displayScore}%`,
            background: `linear-gradient(90deg, #16a34a 0%, #d97706 50%, #dc2626 100%)`,
          }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[10px] font-medium text-ink-300">
        <span>Normal</span>
        <span>Suspicious</span>
        <span>High</span>
      </div>
    </div>
  );
}
