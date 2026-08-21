import type { TrustedContact } from '@/types/domain';
import { Phone, UserCircle2, Check } from 'lucide-react';

interface Props {
  contact: TrustedContact;
  selected?: boolean;
  onSelect?: () => void;
  compact?: boolean;
}

export function TrustedContactCard({ contact, selected, onSelect, compact }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all ${
        selected
          ? 'border-brand-500 bg-brand-50 ring-2 ring-brand-500/20'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="relative">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">
          {contact.initials}
        </div>
        {contact.status === 'Available' && (
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-risk-green" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-ink-800">{contact.name}</p>
          {selected && <Check className="h-4 w-4 text-brand-600" />}
        </div>
        <p className="truncate text-xs text-ink-400">{contact.relationship} · {contact.phone}</p>
        {!compact && (
          <p className={`mt-0.5 text-[11px] font-medium ${contact.status === 'Available' ? 'text-risk-green' : 'text-ink-300'}`}>
            {contact.status}
          </p>
        )}
      </div>
      <div className={`grid h-9 w-9 place-items-center rounded-lg ${selected ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-ink-400'}`}>
        <Phone className="h-4 w-4" />
      </div>
    </button>
  );
}

export function ContactAvatar({ contact, size = 40 }: { contact: TrustedContact; size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <div
        className="grid place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-bold text-white"
        style={{ width: size, height: size, fontSize: size * 0.32 }}
      >
        {contact.initials}
      </div>
      {contact.status === 'Available' && (
        <span
          className="absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white bg-risk-green"
          style={{ width: size * 0.32, height: size * 0.32 }}
        />
      )}
    </div>
  );
}

export function UserAvatar({ initials, size = 40 }: { initials: string; size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.32 }}
    >
      {initials}
    </div>
  );
}

export { UserCircle2 };
