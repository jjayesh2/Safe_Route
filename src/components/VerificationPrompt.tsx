import { useStore } from '@/store/StoreContext';
import { Clock, Check } from 'lucide-react';
import { useEffect, useState } from 'react';

export function VerificationPrompt({ countdown }: { countdown: number }) {
  const { respondVerification } = useStore();
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
  }, [countdown]);

  const handle = (ok: boolean) => {
    setClosing(true);
    setTimeout(() => respondVerification(ok), 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-950/40 backdrop-blur-sm sm:items-center animate-fade-in">
      <div
        className={`w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl ${
          closing ? 'scale-95 opacity-0' : 'animate-slide-up'
        } transition-all`}
      >
        {/* discreet prompt — innocuous wording */}
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-ink-500">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-ink-900">Your journey seems delayed</h3>
            <p className="mt-1 text-sm text-ink-400">
              Continue journey?
            </p>
          </div>
        </div>

        {/* countdown ring */}
        <div className="my-5 flex items-center justify-center">
          <div className="relative h-16 w-16">
            <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
              <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke={countdown <= 3 ? '#dc2626' : '#d97706'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - countdown / 10)}
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <span className="absolute inset-0 grid place-items-center font-mono text-xl font-bold text-ink-800">
              {countdown}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handle(true)}
            className="btn bg-risk-green text-white hover:bg-green-700 py-3.5"
          >
            <Check className="h-5 w-5" />
            I'm OK
          </button>
          <button
            type="button"
            onClick={() => handle(false)}
            className="btn bg-brand-600 text-white hover:bg-brand-700 py-3.5"
          >
            Continue
          </button>
        </div>
        <p className="mt-3 text-center text-[11px] text-ink-300">
          No response within 10s will continue monitoring automatically.
        </p>
      </div>
    </div>
  );
}
