import { useStore } from '@/store/StoreContext';
import { ShieldAlert, Bell, MapPin, Phone, Share2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { RISK_META } from '@/engine/risk';

export function IncidentOverlay({ countdown }: { countdown: number }) {
  const { incident, risk, contacts, acknowledgeByContact, resolveIncident, setOverlay } = useStore();
  const [phase, setPhase] = useState<'escalating' | 'sent'>('escalating');

  useEffect(() => {
    if (countdown <= 0) setPhase('sent');
  }, [countdown]);

  const contact = contacts.find((c) => c.id === (incident?.contactId ?? ''));
  const meta = RISK_META['HIGH'];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/60 backdrop-blur-sm sm:items-center animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl animate-slide-up">
        {/* header */}
        <div className="relative px-5 py-5 text-white" style={{ background: meta.color }}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-6 w-6" />
              <h2 className="text-lg font-bold">
                {phase === 'escalating' ? 'High-risk journey state' : 'Trusted contact notified'}
              </h2>
            </div>
            {phase === 'escalating' ? (
              <p className="mt-1 text-sm text-white/80">
                Escalating in {countdown}s — sharing live location & risk context.
              </p>
            ) : (
              <p className="mt-1 text-sm text-white/90">
                Incident {incident?.incidentId} · live location shared with {contact?.name}.
              </p>
            )}
          </div>
        </div>

        {/* body */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {phase === 'escalating' && (
            <div className="mb-4 flex items-center justify-center">
              <div className="relative h-14 w-14">
                <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                  <circle cx="28" cy="28" r="24" fill="none" stroke="#fee2e2" strokeWidth="4" />
                  <circle
                    cx="28"
                    cy="28"
                    r="24"
                    fill="none"
                    stroke={meta.color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 24}
                    strokeDashoffset={2 * Math.PI * 24 * (1 - countdown / 12)}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
                <span className="absolute inset-0 grid place-items-center font-mono text-lg font-bold text-risk-red">
                  {countdown}
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-ink-400">Risk score</div>
              <div className="font-mono text-lg font-bold text-risk-red">{risk.score}/100</div>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="text-xs text-ink-400">Contact</div>
              <div className="text-sm font-semibold text-ink-800">{contact?.name ?? '—'}</div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 p-3">
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-ink-400">Sharing</div>
            <ul className="space-y-1.5 text-sm">
              <li className="flex items-center gap-2 text-ink-700"><MapPin className="h-4 w-4 text-brand-600" /> Live location</li>
              <li className="flex items-center gap-2 text-ink-700"><ShieldAlert className="h-4 w-4 text-risk-red" /> Risk tier & rationale</li>
              <li className="flex items-center gap-2 text-ink-700"><Share2 className="h-4 w-4 text-brand-600" /> Journey & route context</li>
              <li className="flex items-center gap-2 text-ink-700"><Bell className="h-4 w-4 text-risk-amber" /> Incident timeline</li>
            </ul>
          </div>

          {risk.rationale.length > 0 && (
            <div className="mt-3 rounded-xl border border-risk-red/20 bg-risk-redSoft/40 p-3">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-risk-red">Reason</div>
              <ul className="space-y-1 text-sm text-ink-700">
                {risk.rationale.map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-risk-red" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={resolveIncident} className="btn-ghost py-3 text-sm">
              <X className="h-4 w-4" /> Cancel
            </button>
            <button onClick={() => { acknowledgeByContact(); setOverlay({ kind: 'none' }); }} className="btn-primary py-3 text-sm">
              <Phone className="h-4 w-4" /> Call contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
