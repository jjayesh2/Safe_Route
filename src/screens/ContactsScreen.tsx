import { useStore } from '@/store/StoreContext';
import { TrustedContactCard } from '@/components/TrustedContactCard';
import { Phone, MessageSquare, MapPin, UserPlus, Star } from 'lucide-react';

export function ContactsScreen() {
  const { contacts, selectedContactId, setSelectedContactId } = useStore();

  return (
    <div className="mx-auto max-w-md space-y-4 px-4 py-4">
      <div>
        <h1 className="text-lg font-bold text-ink-900">Trusted Contacts</h1>
        <p className="text-xs text-ink-400">People notified automatically during an incident</p>
      </div>

      {/* selected contact highlight */}
      {contacts.filter((c) => c.id === selectedContactId).map((c) => (
        <div key={c.id} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-5 text-white shadow-lg shadow-brand-600/20">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="relative flex items-center gap-4">
            <div className="relative">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-white/15 text-xl font-bold">
                {c.initials}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-brand-700 bg-risk-green" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold">{c.name}</span>
                <Star className="h-4 w-4 fill-yellow-300 text-yellow-300" />
              </div>
              <p className="text-sm text-white/80">{c.relationship} · {c.phone}</p>
              <p className="mt-1 text-xs text-white/70">{c.status} · primary contact</p>
            </div>
          </div>
          <div className="relative mt-4 grid grid-cols-3 gap-2">
            <button className="flex flex-col items-center gap-1 rounded-xl bg-white/10 py-2.5 text-xs font-medium">
              <Phone className="h-4 w-4" /> Call
            </button>
            <button className="flex flex-col items-center gap-1 rounded-xl bg-white/10 py-2.5 text-xs font-medium">
              <MessageSquare className="h-4 w-4" /> Message
            </button>
            <button className="flex flex-col items-center gap-1 rounded-xl bg-white/10 py-2.5 text-xs font-medium">
              <MapPin className="h-4 w-4" /> Share live
            </button>
          </div>
        </div>
      ))}

      {/* contact list */}
      <div>
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-400">All contacts</div>
        <div className="space-y-2">
          {contacts.map((c) => (
            <TrustedContactCard
              key={c.id}
              contact={c}
              selected={c.id === selectedContactId}
              onSelect={() => setSelectedContactId(c.id)}
            />
          ))}
        </div>
      </div>

      {/* add (demo disabled) */}
      <button
        disabled
        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-slate-300 p-3 text-left text-ink-400"
      >
        <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-100">
          <UserPlus className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Add new contact</p>
          <p className="text-xs">Prototype — 3 demo contacts available</p>
        </div>
      </button>

      <div className="rounded-xl bg-slate-50 p-4 text-xs text-ink-500">
        <p className="font-semibold text-ink-700">How trusted contacts work</p>
        <p className="mt-1">When risk becomes high, your primary contact automatically receives your live location, risk score, route deviation, and a full incident timeline — no action needed from you.</p>
      </div>
    </div>
  );
}
