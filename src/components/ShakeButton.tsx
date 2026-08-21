import { useStore } from '@/store/StoreContext';
import { Vibrate } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export function ShakeButton() {
  const { triggerShake, journey } = useStore();
  const [hint, setHint] = useState(false);
  const shakeCount = useRef(0);
  const lastShake = useRef(0);

  // real device motion (best-effort)
  useEffect(() => {
    if (!journey) return;
    let last = 0;
    let lastMag = 0;
    const handler = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity;
      if (!acc || acc.x == null || acc.y == null || acc.z == null) return;
      const mag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
      const delta = Math.abs(mag - lastMag);
      lastMag = mag;
      const now = Date.now();
      if (delta > 15 && now - last > 250) {
        last = now;
        shakeCount.current += 1;
        if (shakeCount.current >= 2) {
          shakeCount.current = 0;
          triggerShake();
        }
      }
    };
    window.addEventListener('devicemotion', handler);
    return () => window.removeEventListener('devicemotion', handler);
  }, [journey, triggerShake]);

  if (!journey) return null;

  const handleSimulate = () => {
    const now = Date.now();
    if (now - lastShake.current < 400) {
      triggerShake();
      lastShake.current = 0;
      setHint(false);
    } else {
      lastShake.current = now;
      setHint(true);
      setTimeout(() => setHint(false), 1500);
    }
  };

  return (
    <button
      onClick={handleSimulate}
      className="relative flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-ink-500 shadow-sm transition-colors hover:bg-slate-50"
      title="Double-tap to simulate silent shake trigger"
    >
      <Vibrate className={`h-4 w-4 ${hint ? 'animate-shake-x text-brand-600' : 'text-ink-400'}`} />
      {hint ? 'Tap again' : 'Shake'}
    </button>
  );
}
