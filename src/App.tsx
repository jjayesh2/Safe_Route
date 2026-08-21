import { useState } from 'react';
import { StoreProvider, useStore } from '@/store/StoreContext';
import { LandingScreen } from '@/screens/LandingScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { JourneyScreen } from '@/screens/JourneyScreen';
import { SafetyScreen } from '@/screens/SafetyScreen';
import { ContactsScreen } from '@/screens/ContactsScreen';
import { DashboardScreen } from '@/screens/DashboardScreen';
import { StartJourneyFlow } from '@/screens/StartJourneyFlow';
import { VerificationPrompt } from '@/components/VerificationPrompt';
import { DecoyScreen } from '@/components/DecoyScreen';
import { IncidentOverlay } from '@/components/IncidentOverlay';
import { DemoPanel } from '@/components/DemoPanel';
import { AppHeader } from '@/components/AppHeader';
import { BottomNav } from '@/components/BottomNav';

function Shell() {
  const { view, tab, overlay, setView } = useStore();
  const [demoOpen, setDemoOpen] = useState(false);

  if (view === 'landing') return <LandingScreen />;
  if (view === 'dashboard') return <DashboardScreen />;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <AppHeader onDemo={() => setDemoOpen(true)} />
      <main className="flex-1">
        {tab === 'home' && <HomeScreen onDemo={() => setDemoOpen(true)} />}
        {tab === 'journey' && <JourneyScreen />}
        {tab === 'safety' && <SafetyScreen />}
        {tab === 'contacts' && <ContactsScreen />}
      </main>
      <BottomNav />

      {/* overlays */}
      {overlay.kind === 'startJourney' && <StartJourneyFlow />}
      {overlay.kind === 'verification' && <VerificationPrompt countdown={overlay.countdown} />}
      {overlay.kind === 'decoy' && <DecoyScreen />}
      {overlay.kind === 'incident' && <IncidentOverlay countdown={overlay.countdown} />}
      {demoOpen && <DemoPanel onClose={() => setDemoOpen(false)} />}

      {/* hidden back-to-landing affordance */}
      <button
        onClick={() => setView('landing')}
        className="fixed bottom-20 right-3 z-10 h-2 w-2 rounded-full bg-slate-300/40 sm:bottom-3"
        aria-label="Back to landing"
        title="Back to landing (demo)"
      />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
