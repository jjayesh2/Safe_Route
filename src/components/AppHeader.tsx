import { useStore } from '@/store/StoreContext';
import { ShieldCheck, Zap, Wifi, WifiOff } from 'lucide-react';
import { ContactAvatar, UserAvatar } from '@/components/TrustedContactCard';

export function AppHeader({ onDemo }: { onDemo: () => void }) {
  const { user, journey, risk, online, setOnline, contacts, selectedContactId, view, setView } = useStore();
  const contact = contacts.find((c) => c.id === selectedContactId);
  const onApp = view === 'app';

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <button
          onClick={() => onApp && setView('landing')}
          className="flex items-center gap-2"
        >
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold leading-tight text-ink-900">SafeRoute</div>
            <div className="text-[10px] leading-tight text-ink-400">Journey safety</div>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {/* network toggle */}
          <button
            onClick={() => setOnline(!online)}
            className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
              online ? 'bg-risk-greenSoft text-risk-green' : 'bg-risk-redSoft text-risk-red'
            }`}
            title={online ? 'Online — tap to simulate offline' : 'Offline — tap to restore'}
          >
            {online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          </button>

          <button
            onClick={onDemo}
            className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-brand-600"
            title="Demo mode"
          >
            <Zap className="h-4 w-4" />
          </button>

          {journey && contact ? (
            <ContactAvatar contact={contact} size={32} />
          ) : (
            <UserAvatar initials={user.avatarInitials} size={32} />
          )}
        </div>
      </div>
      {risk.level !== 'NORMAL' && journey && (
        <div className={`h-0.5 w-full ${risk.level === 'HIGH' ? 'bg-risk-red' : 'bg-risk-amber'}`} />
      )}
    </header>
  );
}
