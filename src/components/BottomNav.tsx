import { useStore } from '@/store/StoreContext';
import type { Tab } from '@/store/StoreContext';
import { Home, Route, Shield, Users } from 'lucide-react';

const TABS: { id: Tab; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'journey', label: 'Journey', icon: Route },
  { id: 'safety', label: 'Safety', icon: Shield },
  { id: 'contacts', label: 'Contacts', icon: Users },
];

export function BottomNav() {
  const { tab, setTab, journey, risk } = useStore();
  return (
    <nav className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md safe-bottom">
      <div className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map((t) => {
          const active = tab === t.id;
          const showDot = t.id === 'safety' && risk.level !== 'NORMAL';
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="relative flex flex-col items-center gap-0.5 py-2.5 transition-colors"
            >
              <div className={`relative grid h-7 w-12 place-items-center rounded-full transition-all ${active ? 'bg-brand-50' : ''}`}>
                <t.icon
                  className={`h-5 w-5 transition-colors ${active ? 'text-brand-600' : 'text-ink-400'}`}
                />
                {showDot && (
                  <span className={`absolute right-2 top-0.5 h-2 w-2 rounded-full ${risk.level === 'HIGH' ? 'bg-risk-red' : 'bg-risk-amber'}`} />
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'text-brand-600' : 'text-ink-400'}`}>
                {t.label}
              </span>
              {t.id === 'journey' && journey && journey.status !== 'COMPLETED' && (
                <span className="absolute top-1.5 right-3 h-1.5 w-1.5 rounded-full bg-risk-green" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
