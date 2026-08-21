import { useStore } from '@/store/StoreContext';
import { PRESET_ROUTES } from '@/data/seed';
import type { TravelMode } from '@/types/domain';
import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Flag,
  Bus,
  Train,
  Car,
  Zap,
  Check,
  Navigation,
  X,
} from 'lucide-react';
import { TrustedContactCard } from '@/components/TrustedContactCard';

const MODES: { id: TravelMode; icon: typeof Bus }[] = [
  { id: 'Bus', icon: Bus },
  { id: 'Metro', icon: Navigation },
  { id: 'Train', icon: Train },
  { id: 'Shared Vehicle', icon: Car },
  { id: 'Other', icon: Zap },
];

export function StartJourneyFlow() {
  const { startJourney, cancelStartJourney, contacts, selectedContactId, setSelectedContactId } = useStore();
  const [step, setStep] = useState(0);
  const [routeId, setRouteId] = useState(PRESET_ROUTES[0].id);
  const [mode, setMode] = useState<TravelMode>(PRESET_ROUTES[0].mode);
  const [contactId, setContactId] = useState(selectedContactId);

  const route = PRESET_ROUTES.find((r) => r.id === routeId) ?? PRESET_ROUTES[0];

  const steps = ['Route', 'Mode', 'Contact', 'Confirm'];
  const canNext = step < 3;

  const next = () => {
    if (step < 3) setStep(step + 1);
    else {
      startJourney({ routeId, mode, contactId, from: route.from, to: route.to });
      setSelectedContactId(contactId);
    }
  };
  const back = () => (step === 0 ? cancelStartJourney() : setStep(step - 1));

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-in">
      {/* header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <button onClick={back} className="grid h-9 w-9 place-items-center rounded-lg text-ink-500 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <div className="text-sm font-bold text-ink-900">Start Journey</div>
          <div className="text-[11px] text-ink-400">Step {step + 1} of 4 · {steps[step]}</div>
        </div>
        <button onClick={cancelStartJourney} className="grid h-9 w-9 place-items-center rounded-lg text-ink-400 hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* progress dots */}
      <div className="flex items-center justify-center gap-1.5 py-3">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-brand-600' : i < step ? 'w-4 bg-brand-400' : 'w-4 bg-slate-200'}`}
          />
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {step === 0 && (
          <div className="space-y-3 animate-fade-up">
            <h2 className="text-lg font-bold text-ink-900">Where are you going?</h2>
            <p className="text-sm text-ink-400">Choose your starting point and destination.</p>
            <div className="space-y-2">
              {PRESET_ROUTES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setRouteId(r.id); setMode(r.mode); }}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                    routeId === r.id ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1 text-ink-400">
                    <MapPin className="h-4 w-4 text-brand-600" />
                    <div className="h-6 w-px bg-slate-300" />
                    <Flag className="h-4 w-4 text-risk-red" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink-800">{r.from}</p>
                    <p className="my-0.5 text-[10px] text-ink-300">↓ {r.durationMin} min</p>
                    <p className="text-sm font-semibold text-ink-800">{r.to}</p>
                  </div>
                  {routeId === r.id && <Check className="h-5 w-5 text-brand-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3 animate-fade-up">
            <h2 className="text-lg font-bold text-ink-900">Travel mode</h2>
            <p className="text-sm text-ink-400">How are you traveling?</p>
            <div className="grid grid-cols-2 gap-3">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                    mode === m.id ? 'border-brand-500 bg-brand-50 text-brand-700 ring-2 ring-brand-500/20' : 'border-slate-200 text-ink-600 hover:border-slate-300'
                  }`}
                >
                  <m.icon className="h-6 w-6" />
                  <span className="text-sm font-semibold">{m.id}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 animate-fade-up">
            <h2 className="text-lg font-bold text-ink-900">Trusted contact</h2>
            <p className="text-sm text-ink-400">Who should be notified if something goes wrong?</p>
            <div className="space-y-2">
              {contacts.map((c) => (
                <TrustedContactCard
                  key={c.id}
                  contact={c}
                  selected={contactId === c.id}
                  onSelect={() => setContactId(c.id)}
                />
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-fade-up">
            <h2 className="text-lg font-bold text-ink-900">Confirm & start</h2>
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center text-ink-400">
                  <MapPin className="h-4 w-4 text-brand-600" />
                  <div className="h-8 w-px bg-slate-300" />
                  <Flag className="h-4 w-4 text-risk-red" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-ink-800">{route.from}</p>
                  <p className="my-1 text-[10px] text-ink-300">↓ ~{route.durationMin} min</p>
                  <p className="text-sm font-semibold text-ink-800">{route.to}</p>
                </div>
              </div>
              <div className="my-3 h-px bg-slate-100" />
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-xs text-ink-400">Mode</div>
                  <div className="font-semibold text-ink-800">{mode}</div>
                </div>
                <div>
                  <div className="text-xs text-ink-400">Contact</div>
                  <div className="font-semibold text-ink-800">{contacts.find((c) => c.id === contactId)?.name}</div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2 rounded-xl bg-brand-50 p-3 text-xs text-brand-700">
              <Zap className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Continuous journey monitoring will begin. The system will discreetly verify your safety if unusual travel behavior is detected.</p>
            </div>
          </div>
        )}
      </div>

      {/* footer */}
      <div className="border-t border-slate-100 px-4 py-3 safe-bottom">
        <button onClick={next} className="btn-primary w-full py-3.5">
          {canNext ? <>Continue <ArrowRight className="h-4 w-4" /></> : <>Start Journey <Check className="h-4 w-4" /></>}
        </button>
      </div>
    </div>
  );
}
