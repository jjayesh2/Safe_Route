import { useStore } from '@/store/StoreContext';
import {
  ShieldCheck,
  Route,
  AlertTriangle,
  EyeOff,
  Zap,
  ArrowRight,
  Phone,
  MapPin,
  Activity,
  Bell,
  CheckCircle2,
  Clock,
  Navigation,
  Smartphone,
  WifiOff,
  Check,
} from 'lucide-react';

export function LandingScreen() {
  const { setView, runFullScenario } = useStore();

  return (
    <div className="min-h-screen bg-white">
      {/* nav */}
      <nav className="sticky top-0 z-30 border-b border-slate-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-ink-900">SafeRoute</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView('dashboard')} className="btn-ghost hidden px-3 py-2 text-sm sm:inline-flex">
              Trusted contact view
            </button>
            <button onClick={() => setView('app')} className="btn-primary px-4 py-2.5 text-sm">
              Open app
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-brand-100/60 blur-3xl" />
          <div className="absolute right-0 top-40 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />
        </div>
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
          <div className="flex flex-col justify-center">
            <span className="pill w-fit bg-brand-50 text-brand-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Journey-aware safety
            </span>
            <h1 className="mt-4 text-balance text-4xl font-bold leading-tight text-ink-900 sm:text-5xl lg:text-6xl" style={{ fontFamily: 'Plus Jakarta Sans, Inter, sans-serif' }}>
              Safety that notices before you have to ask.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-ink-500">
              SafeRoute continuously monitors your journey for unusual travel behavior and discreetly escalates assistance when you may not be able to ask for help.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => setView('app')} className="btn-primary px-5 py-3.5">
                Try the demo
                <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => { runFullScenario(); setView('app'); }} className="btn-ghost px-5 py-3.5">
                <Zap className="h-4 w-4" />
                Run full safety scenario
              </button>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-400">
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-risk-green" /> Hackathon prototype</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-risk-green" /> Simulated journey data</span>
              <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-risk-green" /> No account required</span>
            </div>
          </div>

          {/* phone mockup */}
          <div className="relative flex items-center justify-center">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* innovation pillars */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">The innovation</h2>
            <p className="mt-2 text-ink-500">Four layers that work together — not just an SOS button.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Pillar
              icon={Route}
              title="Journey Intelligence"
              desc="Understands the journey, not just the location. Route, progress, stops, crowd, ETA."
            />
            <Pillar
              icon={AlertTriangle}
              title="Explainable Risk"
              desc="Shows why a journey is becoming abnormal. Every score is backed by a reason."
            />
            <Pillar
              icon={EyeOff}
              title="Discreet Response"
              desc="Lets the user respond without openly signaling danger. Decoy mode protects them."
            />
            <Pillar
              icon={Zap}
              title="Automatic Protection"
              desc="Escalates assistance when the user cannot safely respond. Someone trusted gets context."
            />
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">How a journey is protected</h2>
          <p className="mt-2 text-ink-500">The core flow, from start to resolution.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            { icon: Route, label: 'Journey start', desc: 'Route, mode & contact set' },
            { icon: Activity, label: 'Risk engine', desc: 'Continuous anomaly detection' },
            { icon: Bell, label: 'Discreet check', desc: 'Innocuous verification prompt' },
            { icon: Zap, label: 'Auto-escalation', desc: 'No response → high risk' },
            { icon: Phone, label: 'Contact alerted', desc: 'Live context shared' },
            { icon: CheckCircle2, label: 'Incident tracked', desc: 'Until resolved' },
          ].map((s, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-600">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="mt-3 text-xs font-semibold uppercase tracking-wider text-ink-300">Step {i + 1}</div>
              <div className="text-sm font-bold text-ink-800">{s.label}</div>
              <div className="mt-0.5 text-xs text-ink-400">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* feature grid */}
      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">Built for real moments</h2>
            <p className="mt-2 text-ink-500">Every feature strengthens the safety flow — nothing extra.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Feature icon={Navigation} title="Live location sharing" desc="Real-time position, route, destination & movement status — shared with your trusted contact." />
            <Feature icon={AlertTriangle} title="Explainable risk scoring" desc="A 0–100 anomaly score with reasons. Clearly an anomaly detector, not a crime predictor." />
            <Feature icon={EyeOff} title="Decoy mode" desc="A silent shake transforms the screen into an innocent incoming call. Safety hidden in plain sight." />
            <Feature icon={WifiOff} title="Offline SOS queue" desc="No signal? Emergency payload is queued and auto-retries the moment connectivity returns." />
            <Feature icon={MapPin} title="Safe location guidance" desc="When risk is high, see nearby police, metro, hospitals & public areas with directions." />
            <Feature icon={Clock} title="Incident tracking" desc="Every incident has a state — monitoring, alert sent, acknowledged, resolved — end to end." />
          </div>
        </div>
      </section>

      {/* dashboard preview */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">The trusted contact dashboard</h2>
            <p className="mt-3 text-ink-500">
              When escalation happens, the trusted contact receives a complete live picture — location, route deviation, risk score, rationale, timeline, and actionable buttons. No guesswork.
            </p>
            <ul className="mt-5 space-y-2.5 text-sm text-ink-700">
              {['Live map with expected vs. actual route', 'Risk card with score & reasons', 'Full incident timeline', 'Safe locations near the traveler', 'One-tap call, locate, and acknowledge'].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-risk-green" />
                  {t}
                </li>
              ))}
            </ul>
            <button onClick={() => setView('dashboard')} className="btn-ghost mt-6 px-5 py-3">
              Open dashboard view
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between rounded-xl bg-gradient-to-br from-risk-red to-red-700 p-4 text-white">
              <div>
                <div className="text-xs text-white/80">Aisha Khan</div>
                <div className="text-lg font-bold">High Risk</div>
              </div>
              <div className="font-mono text-sm">#SR-1042</div>
            </div>
            <div className="mt-3 h-32 rounded-xl map-grid" />
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-ink-400">Route deviation</span><span className="font-semibold text-risk-amber">1.8 km</span></div>
              <div className="flex justify-between"><span className="text-ink-400">Stop duration</span><span className="font-semibold text-risk-amber">6 min</span></div>
              <div className="flex justify-between"><span className="text-ink-400">Risk score</span><span className="font-semibold text-risk-red">87/100</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-gradient-to-br from-brand-700 to-brand-900 text-white">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <h2 className="text-3xl font-bold">Experience the full safety scenario</h2>
          <p className="mt-3 text-white/80">Watch a journey go from normal to high-risk to resolved — without leaving your seat.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => { runFullScenario(); setView('app'); }} className="btn bg-white px-5 py-3.5 text-brand-700 hover:bg-white/90">
              <Zap className="h-4 w-4" />
              Run full scenario
            </button>
            <button onClick={() => setView('app')} className="btn border border-white/30 px-5 py-3.5 text-white hover:bg-white/10">
              Explore the app
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-ink-400 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="font-semibold text-ink-700">SafeRoute</span>
          </div>
          <p className="text-xs">Hackathon prototype — simulated data, not a production safety system.</p>
        </div>
      </footer>
    </div>
  );
}

function Pillar({ icon: Icon, title, desc }: { icon: typeof Route; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:shadow-md">
      <div className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-3 text-base font-bold text-ink-900">{title}</h3>
      <p className="mt-1 text-sm text-ink-500">{desc}</p>
    </div>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: typeof Route; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-ink-600">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="text-base font-bold text-ink-900">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-ink-500">{desc}</p>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative h-[520px] w-[260px] rounded-[2.5rem] border-8 border-ink-900 bg-white shadow-2xl">
      <div className="absolute left-1/2 top-0 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-ink-900" />
      <div className="flex h-full flex-col overflow-hidden rounded-[2rem] p-3">
        <div className="flex items-center justify-between text-[10px] text-ink-400">
          <span>9:58 PM</span>
          <span>SafeRoute</span>
        </div>
        <div className="mt-3 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-3 text-white">
          <div className="text-[10px] text-white/80">Journey status</div>
          <div className="text-base font-bold">Journey Safe</div>
        </div>
        <div className="mt-2 h-28 rounded-xl map-grid" />
        <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 p-2.5">
          <div>
            <div className="text-[9px] text-ink-400">Risk score</div>
            <div className="font-mono text-lg font-bold text-risk-green">15</div>
          </div>
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-risk-greenSoft text-risk-green">
            <ShieldCheck className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[9px]">
          <div className="rounded-lg bg-slate-50 py-1.5"><Clock className="mx-auto h-3 w-3 text-ink-400" /><div className="mt-0.5 font-semibold text-ink-700">ETA 10:36</div></div>
          <div className="rounded-lg bg-slate-50 py-1.5"><Navigation className="mx-auto h-3 w-3 text-ink-400" /><div className="mt-0.5 font-semibold text-ink-700">42% done</div></div>
          <div className="rounded-lg bg-slate-50 py-1.5"><MapPin className="mx-auto h-3 w-3 text-ink-400" /><div className="mt-0.5 font-semibold text-ink-700">On route</div></div>
        </div>
        <div className="mt-auto flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2 text-[10px] text-brand-700">
          <Smartphone className="h-3.5 w-3.5" />
          Shake to activate decoy
        </div>
      </div>
    </div>
  );
}

export { Check };
