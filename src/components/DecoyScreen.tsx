import { useStore } from '@/store/StoreContext';
import { Phone, PhoneOff, Mic, Volume2, Grid3x3, User2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type DecoyType = 'call' | 'calculator' | 'music';

export function DecoyScreen() {
  const { exitDecoy, triggerSOS, risk } = useStore();
  const [type] = useState<DecoyType>('call');
  const [callState, setCallState] = useState<'ringing' | 'connected'>('ringing');
  const [ringT, setRingT] = useState(0);
  const [connectedT, setConnectedT] = useState(0);

  // auto ring pulse
  useEffect(() => {
    if (callState !== 'ringing') return;
    const t = setInterval(() => setRingT((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [callState]);

  useEffect(() => {
    if (callState !== 'connected') return;
    const t = setInterval(() => setConnectedT((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, [callState]);

  if (type === 'calculator') return <CalculatorDecoy />;
  if (type === 'music') return <MusicDecoy />;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-gradient-to-b from-ink-800 to-ink-950 text-white animate-fade-in">
      {/* fake status bar */}
      <div className="flex items-center justify-between px-6 pt-6 text-xs text-white/70">
        <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
        <span>5G</span>
      </div>

      {callState === 'ringing' ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          <div className="mb-2 text-sm font-medium text-white/60">Incoming call</div>
          <div className="relative mb-6">
            <div className="grid h-32 w-32 place-items-center rounded-full bg-white/10">
              <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-3xl font-bold">
                MO
              </div>
            </div>
            <span className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse-ring" />
          </div>
          <h2 className="text-3xl font-bold">Mom</h2>
          <p className="mt-1 text-white/60">Mobile +91 90043 11257</p>
          <p className="mt-4 text-xs text-white/40">ringing… {ringT}s</p>

          <div className="mt-10 flex items-center justify-center gap-16">
            <button
              type="button"
              onClick={() => setCallState('connected')}
              className="grid h-16 w-16 place-items-center rounded-full bg-risk-green text-white shadow-lg active:scale-95"
            >
              <Phone className="h-7 w-7" />
            </button>
            <button
              type="button"
              onClick={exitDecoy}
              className="grid h-16 w-16 place-items-center rounded-full bg-risk-red text-white shadow-lg active:scale-95"
            >
              <PhoneOff className="h-7 w-7" />
            </button>
          </div>
          <p className="mt-4 text-[11px] text-white/40">Accept · Decline</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col px-6">
          <div className="mt-6 flex items-center gap-3">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-400 to-brand-700 text-lg font-bold">
              MO
            </div>
            <div>
              <h2 className="text-2xl font-bold">Mom</h2>
              <p className="text-sm text-white/60">{formatDur(connectedT)} · connected</p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            {[
              { icon: Mic, label: 'mute' },
              { icon: Grid3x3, label: 'keypad' },
              { icon: Volume2, label: 'speaker' },
            ].map((b) => (
              <button
                key={b.label}
                type="button"
                className="flex flex-col items-center gap-1.5 rounded-xl bg-white/5 py-3 text-white/70"
              >
                <b.icon className="h-5 w-5" />
                <span className="text-[10px] capitalize">{b.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1" />

          <div className="mb-10 flex flex-col items-center">
            <button
              type="button"
              onClick={exitDecoy}
              className="grid h-16 w-16 place-items-center rounded-full bg-risk-red text-white shadow-lg active:scale-95"
            >
              <PhoneOff className="h-7 w-7" />
            </button>
            <p className="mt-2 text-xs text-white/50">end call</p>
          </div>
        </div>
      )}

      {/* Hidden demo controls — tap contact name 3x or use corner */}
      <button
        type="button"
        onClick={exitDecoy}
        className="absolute right-3 top-3 z-10 h-6 w-6 rounded-full bg-white/5 text-[9px] text-white/20"
        aria-label="Exit decoy (demo)"
      >
        ×
      </button>
      {risk.level === 'HIGH' && (
        <button
          type="button"
          onClick={triggerSOS}
          className="absolute left-3 top-3 z-10 h-6 w-6 rounded-full bg-white/5 text-[9px] text-white/20"
          aria-label="Hidden SOS (demo)"
        >
          <User2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

function formatDur(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function CalculatorDecoy() {
  const { exitDecoy } = useStore();
  const [display, setDisplay] = useState('0');
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-ink-950 p-5 text-white">
      <div className="flex-1 flex items-end justify-end pb-4">
        <span className="font-mono text-5xl font-light">{display}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','=','exit'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => (k === 'exit' ? exitDecoy() : setDisplay(k === 'C' ? '0' : k))}
            className={`rounded-2xl py-4 text-lg font-medium ${
              k === 'exit' ? 'col-span-4 bg-white/5 text-white/30' : isNaN(Number(k)) && k !== '0' ? 'bg-brand-600' : 'bg-white/10'
            }`}
          >
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}

function MusicDecoy() {
  const { exitDecoy } = useStore();
  return (
    <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-ink-950 text-white p-6">
      <div className="mb-6 h-40 w-40 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600" />
      <h2 className="text-xl font-bold">Midnight City</h2>
      <p className="text-white/60">M83</p>
      <div className="mt-6 flex gap-6">
        <button className="text-white/70">⏮</button>
        <button className="text-2xl">⏸</button>
        <button className="text-white/70">⏭</button>
      </div>
      <button onClick={exitDecoy} className="mt-10 text-xs text-white/30">tap to exit</button>
    </div>
  );
}
