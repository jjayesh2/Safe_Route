import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  CrowdContext,
  DashboardSnapshot,
  GeoPoint,
  Incident,
  IncidentStatus,
  Journey,
  JourneyEvent,
  JourneyEventType,
  Notification,
  RiskLevel,
  RiskState,
  SafeLocation,
  SOSPayload,
  TravelMode,
  TrustedContact,
} from '@/types/domain';
import {
  APP_USER,
  PRESET_ROUTES,
  SAFE_LOCATIONS,
  TRUSTED_CONTACTS,
} from '@/data/seed';
import {
  buildFullScenarioPhases,
  buildScenarioPhases,
  computeRisk,
  currentRiskInput,
  deviatePoint,
  haversineKm,
  isLateNight,
  makeEvent,
  nextIncidentId,
  pointAtProgress,
  type SimulationPhase,
} from '@/engine/simulation';
import { RISK_META, levelFromScore } from '@/engine/risk';

export type View = 'landing' | 'app' | 'dashboard';
export type Tab = 'home' | 'journey' | 'safety' | 'contacts';
export type Overlay =
  | { kind: 'none' }
  | { kind: 'startJourney' }
  | { kind: 'verification'; countdown: number }
  | { kind: 'decoy' }
  | { kind: 'incident'; countdown: number }
  | { kind: 'safeLocations' }
  | { kind: 'demo' }
  | { kind: 'scenarioResult'; title: string; subtitle: string };

interface StoreValue {
  view: View;
  setView: (v: View) => void;
  tab: Tab;
  setTab: (t: Tab) => void;

  user: typeof APP_USER;
  contacts: TrustedContact[];
  selectedContactId: string;
  setSelectedContactId: (id: string) => void;

  journey: Journey | null;
  risk: RiskState;
  events: JourneyEvent[];
  incident: Incident | null;
  safeLocations: SafeLocation[];
  notifications: Notification[];

  overlay: Overlay;
  setOverlay: (o: Overlay) => void;
  showStartJourney: () => void;
  startJourney: (cfg: {
    routeId: string;
    mode: TravelMode;
    contactId: string;
    from: string;
    to: string;
  }) => void;
  cancelStartJourney: () => void;
  endJourney: () => void;
  resetAll: () => void;

  // verification
  respondVerification: (ok: boolean) => void;

  // shake / decoy
  triggerShake: () => void;
  exitDecoy: () => void;

  // manual sos
  triggerSOS: () => void;
  acknowledgeByContact: () => void;
  resolveIncident: () => void;

  // network
  online: boolean;
  setOnline: (v: boolean) => void;
  sos: SOSPayload | null;

  // demo
  runScenario: (scenarioId: string) => void;
  runFullScenario: () => void;
  isDemoRunning: boolean;
  currentScenarioId: string | null;
  pauseSimulation: () => void;
  resumeSimulation: () => void;
  paused: boolean;

  snapshot: DashboardSnapshot;
}

const Ctx = createContext<StoreValue | null>(null);

const INITIAL_RISK: RiskState = {
  level: 'NORMAL',
  score: 12,
  signals: [],
  rationale: [],
  updatedAt: Date.now(),
};

// 1 real second == 30 sim seconds → ~2 sim-minutes per real second
const SIM_SPEED = 30;

function buildExpectedRoute(
  from: string,
  to: string,
  mode: TravelMode
): { expectedRoute: GeoPoint[]; durationMin: number } {
  const preset = PRESET_ROUTES.find(
    (r) => r.from === from && r.to === to && r.mode === mode
  );
  if (preset) return { expectedRoute: preset.expectedRoute, durationMin: preset.durationMin };
  const fallback = PRESET_ROUTES[0];
  return { expectedRoute: fallback.expectedRoute, durationMin: fallback.durationMin };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<View>('landing');
  const [tab, setTab] = useState<Tab>('home');

  const [selectedContactId, setSelectedContactId] = useState(TRUSTED_CONTACTS[0].id);

  const [journey, setJourney] = useState<Journey | null>(null);
  const [risk, setRisk] = useState<RiskState>(INITIAL_RISK);
  const [events, setEvents] = useState<JourneyEvent[]>([]);
  const [incident, setIncident] = useState<Incident | null>(null);
  const [safeLocations, setSafeLocations] = useState<SafeLocation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [overlay, setOverlay] = useState<Overlay>({ kind: 'none' });

  const [online, setOnline] = useState(true);
  const [sos, setSos] = useState<SOSPayload | null>(null);

  const [paused, setPaused] = useState(false);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [currentScenarioId, setCurrentScenarioId] = useState<string | null>(null);

  const phasesRef = useRef<SimulationPhase[]>([]);
  const phaseIndexRef = useRef(0);
  const elapsedRef = useRef(0); // sim minutes
  const startedAtRef = useRef(0);
  const crowdRef = useRef<CrowdContext>('Normal');
  const deviatedRef = useRef(false);
  const deviationOffsetRef = useRef(0);
  const stopUntilRef = useRef<number | null>(null); // sim-min at which stop ends
  const verificationShownRef = useRef(false);
  const escalatedRef = useRef(false);
  const lastTickRef = useRef(0);

  const addEvent = useCallback((evt: JourneyEvent) => {
    setEvents((prev) => [...prev, evt]);
  }, []);

  const notify = useCallback(
    (n: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
      const note: Notification = {
        ...n,
        id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        timestamp: Date.now(),
        read: false,
      };
      setNotifications((prev) => [note, ...prev].slice(0, 30));
    },
    []
  );

  const resetAll = useCallback(() => {
    setJourney(null);
    setRisk(INITIAL_RISK);
    setEvents([]);
    setIncident(null);
    setSafeLocations([]);
    setNotifications([]);
    setOverlay({ kind: 'none' });
    setSos(null);
    setOnline(true);
    setPaused(false);
    setIsDemoRunning(false);
    setCurrentScenarioId(null);
    phasesRef.current = [];
    phaseIndexRef.current = 0;
    elapsedRef.current = 0;
    startedAtRef.current = 0;
    crowdRef.current = 'Normal';
    deviatedRef.current = false;
    deviationOffsetRef.current = 0;
    stopUntilRef.current = null;
    verificationShownRef.current = false;
    escalatedRef.current = false;
    setTab('home');
  }, []);

  const showStartJourney = useCallback(() => {
    if (journey) return;
    setOverlay({ kind: 'startJourney' });
  }, [journey]);

  const cancelStartJourney = useCallback(() => {
    setOverlay({ kind: 'none' });
  }, []);

  const startJourney = useCallback(
    (cfg: { routeId: string; mode: TravelMode; contactId: string; from: string; to: string }) => {
      const { expectedRoute, durationMin } = buildExpectedRoute(cfg.from, cfg.to, cfg.mode);
      const now = Date.now();
      const start = expectedRoute[0];
      const dest = expectedRoute[expectedRoute.length - 1];
      const j: Journey = {
        id: `j_${Date.now().toString(36)}`,
        from: cfg.from,
        to: cfg.to,
        mode: cfg.mode,
        contactId: cfg.contactId,
        startedAt: now,
        expectedDurationMin: durationMin,
        expectedArrivalAt: now + durationMin * 60_000,
        expectedRoute,
        actualRoute: [start],
        status: 'ACTIVE',
        progress: 0,
        currentLocation: start,
        destination: dest,
        crowd: 'Normal',
        deviationKm: 0,
        stopStartedAt: null,
        stopDurationMin: 0,
      };
      setJourney(j);
      setRisk(INITIAL_RISK);
      setEvents([]);
      setIncident(null);
      setSafeLocations([]);
      setNotifications([]);
      setOverlay({ kind: 'none' });
      setTab('journey');
      phasesRef.current = [{ atMin: 0, action: { kind: 'normal' }, label: 'Journey started' }];
      phaseIndexRef.current = 0;
      elapsedRef.current = 0;
      startedAtRef.current = now;
      crowdRef.current = 'Normal';
      deviatedRef.current = false;
      deviationOffsetRef.current = 0;
      stopUntilRef.current = null;
      verificationShownRef.current = false;
      escalatedRef.current = false;
      addEvent(makeEvent('JOURNEY_STARTED', `Journey started: ${cfg.from} → ${cfg.to}`, { severity: 'LOW', riskLevel: 'NORMAL', riskScore: INITIAL_RISK.score }));
      notify({ title: 'Journey monitoring active', body: `${cfg.from} → ${cfg.to} · ${cfg.mode}`, level: 'INFO' });
    },
    [addEvent, notify]
  );

  const endJourney = useCallback(() => {
    setJourney((j) =>
      j ? { ...j, status: 'COMPLETED', progress: 1 } : null
    );
    addEvent(makeEvent('JOURNEY_COMPLETED', 'Arrived at destination. Journey completed.', { severity: 'LOW' }));
    notify({ title: 'Journey completed', body: 'You arrived safely at your destination.', level: 'INFO' });
    setIsDemoRunning(false);
    setCurrentScenarioId(null);
  }, [addEvent, notify]);

  // ---- Verification flow ----
  const respondVerification = useCallback(
    (ok: boolean) => {
      setOverlay({ kind: 'none' });
      verificationShownRef.current = false;
      if (ok) {
        // reduce risk: clear deviation/stop crowd a bit
        deviatedRef.current = false;
        deviationOffsetRef.current = 0;
        stopUntilRef.current = null;
        crowdRef.current = 'Normal';
        addEvent(makeEvent('USER_CONFIRMED_SAFE', 'User confirmed they are safe.', { severity: 'LOW', riskLevel: 'NORMAL' }));
        notify({ title: 'Safety confirmed', body: 'Thanks — journey monitoring continues.', level: 'INFO' });
      } else {
        addEvent(makeEvent('NO_RESPONSE', 'User declined verification.', { severity: 'MEDIUM' }));
      }
    },
    [addEvent, notify]
  );

  // ---- Shake / decoy ----
  const triggerShake = useCallback(() => {
    addEvent(makeEvent('SHAKE_TRIGGERED', 'Silent shake trigger activated.', { severity: 'HIGH' }));
    addEvent(makeEvent('DECOY_ACTIVATED', 'Decoy screen activated.', { severity: 'MEDIUM' }));
    setOverlay({ kind: 'decoy' });
    notify({ title: 'Decoy mode active', body: 'Safety app hidden. Shake again or use hidden reset to exit.', level: 'INFO' });
  }, [addEvent, notify]);

  const exitDecoy = useCallback(() => {
    setOverlay({ kind: 'none' });
  }, []);

  // ---- Manual SOS ----
  const triggerSOS = useCallback(() => {
    if (!journey) return;
    const id = nextIncidentId();
    const r = risk;
    const inc: Incident = {
      incidentId: id,
      riskScore: r.score,
      riskLevel: 'HIGH',
      status: 'ALERT_SENT',
      startedAt: Date.now(),
      reasons: r.rationale.length ? r.rationale : ['Manual SOS triggered by user'],
      journeySnapshot: {
        from: journey.from,
        to: journey.to,
        mode: journey.mode,
        currentLocation: journey.currentLocation,
        deviationKm: journey.deviationKm,
        stopDurationMin: journey.stopDurationMin,
      },
      contactId: selectedContactId,
    };
    setIncident(inc);
    setRisk((prev) => ({ ...prev, level: 'HIGH', score: Math.max(prev.score, 92), updatedAt: Date.now() }));
    addEvent(makeEvent('ALERT_SENT', `Incident ${id} created. Trusted contact alerted.`, { severity: 'HIGH', riskLevel: 'HIGH', riskScore: 92 }));
    notify({ title: 'Trusted contact alerted', body: `Incident ${id} — live location & risk shared.`, level: 'HIGH' });
    setSafeLocations(SAFE_LOCATIONS);
    // queue SOS
    const payload: SOSPayload = {
      incidentId: id,
      userId: APP_USER.id,
      userName: APP_USER.name,
      lat: journey.currentLocation.lat,
      lng: journey.currentLocation.lng,
      timestamp: Date.now(),
      riskTier: 'HIGH',
      riskScore: 92,
      status: online ? 'DELIVERED' : 'QUEUED',
      attempts: 1,
    };
    setSos(payload);
    if (!online) {
      addEvent(makeEvent('SOS_QUEUED', 'Connection unavailable — emergency payload queued.', { severity: 'HIGH' }));
    } else {
      addEvent(makeEvent('SOS_DELIVERED', 'SOS payload delivered to trusted contact.', { severity: 'HIGH' }));
    }
    setOverlay({ kind: 'none' });
  }, [journey, risk, selectedContactId, online, addEvent, notify]);

  const acknowledgeByContact = useCallback(() => {
    setIncident((inc) =>
      inc ? { ...inc, status: 'CONTACT_ACKNOWLEDGED' as IncidentStatus } : null
    );
    addEvent(makeEvent('CONTACT_ACKNOWLEDGED', 'Trusted contact acknowledged the alert.', { severity: 'MEDIUM' }));
    notify({ title: 'Contact acknowledged', body: 'Your trusted contact has seen the alert and is responding.', level: 'INFO' });
  }, [addEvent, notify]);

  const resolveIncident = useCallback(() => {
    setIncident((inc) =>
      inc ? { ...inc, status: 'RESOLVED' as IncidentStatus } : null
    );
    setRisk((prev) => ({ ...prev, level: 'NORMAL', score: 15, rationale: [], signals: prev.signals.map((s) => ({ ...s, active: false, description: s.description })), updatedAt: Date.now() }));
    addEvent(makeEvent('INCIDENT_RESOLVED', 'Incident resolved. Journey monitoring continues.', { severity: 'LOW', riskLevel: 'NORMAL' }));
    notify({ title: 'Incident resolved', body: 'Safety restored. Returning to normal monitoring.', level: 'INFO' });
    setIsDemoRunning(false);
    setCurrentScenarioId(null);
  }, [addEvent, notify]);

  // ---- Demo scenarios ----
  const runScenario = useCallback(
    (scenarioId: string) => {
      const preset = PRESET_ROUTES[0];
      const now = Date.now();
      const start = preset.expectedRoute[0];
      const dest = preset.expectedRoute[preset.expectedRoute.length - 1];
      const j: Journey = {
        id: `j_${now.toString(36)}`,
        from: preset.from,
        to: preset.to,
        mode: preset.mode,
        contactId: selectedContactId,
        startedAt: now,
        expectedDurationMin: preset.durationMin,
        expectedArrivalAt: now + preset.durationMin * 60_000,
        expectedRoute: preset.expectedRoute,
        actualRoute: [start],
        status: 'ACTIVE',
        progress: 0,
        currentLocation: start,
        destination: dest,
        crowd: 'Normal',
        deviationKm: 0,
        stopStartedAt: null,
        stopDurationMin: 0,
      };
      setJourney(j);
      setRisk(INITIAL_RISK);
      setEvents([]);
      setIncident(null);
      setSafeLocations([]);
      setNotifications([]);
      setOverlay({ kind: 'none' });
      setTab('journey');
      setIsDemoRunning(true);
      setCurrentScenarioId(scenarioId);
      phasesRef.current =
        scenarioId === 'full'
          ? buildFullScenarioPhases()
          : buildScenarioPhases(scenarioId);
      phaseIndexRef.current = 0;
      elapsedRef.current = 0;
      startedAtRef.current = now;
      crowdRef.current = 'Normal';
      deviatedRef.current = false;
      deviationOffsetRef.current = 0;
      stopUntilRef.current = null;
      verificationShownRef.current = false;
      escalatedRef.current = false;
      // For full scenario, set late night start
      if (scenarioId === 'full' || scenarioId === 's4' || scenarioId === 's5' || scenarioId === 's7') {
        startedAtRef.current = now - (21 * 60 - 0) * 60_000; // start at 9pm for late-night
      }
      addEvent(makeEvent('JOURNEY_STARTED', `Journey started: ${preset.from} → ${preset.to}`, { severity: 'LOW', riskLevel: 'NORMAL', riskScore: INITIAL_RISK.score }));
      notify({ title: 'Demo scenario started', body: `Simulating: ${scenarioId === 'full' ? 'Full safety scenario' : scenarioId}`, level: 'INFO' });
    },
    [selectedContactId, addEvent, notify]
  );

  const runFullScenario = useCallback(() => runScenario('full'), [runScenario]);

  const pauseSimulation = useCallback(() => setPaused(true), []);
  const resumeSimulation = useCallback(() => setPaused(false), []);

  // ---- Main simulation tick ----
  useEffect(() => {
    if (!journey || journey.status === 'COMPLETED' || paused) return;
    let raf = 0;
    let timer = 0;
    const tick = () => {
      const nowReal = Date.now();
      const dtSec = lastTickRef.current ? (nowReal - lastTickRef.current) / 1000 : 0;
      lastTickRef.current = nowReal;
      const dSimMin = (dtSec * SIM_SPEED) / 60;
      elapsedRef.current += dSimMin;

      const elapsed = elapsedRef.current;
      const startedAt = startedAtRef.current;

      // process phases whose atMin <= elapsed
      const phases = phasesRef.current;
      while (
        phaseIndexRef.current < phases.length &&
        phases[phaseIndexRef.current].atMin <= elapsed
      ) {
        const phase = phases[phaseIndexRef.current];
        applyPhaseAction(phase);
        phaseIndexRef.current += 1;
      }

      // compute movement
      const baseProgress = Math.min(1, elapsed / journey.expectedDurationMin);
      let progress = baseProgress;
      let currentLocation: GeoPoint;
      let deviationKm = 0;

      const isStopped = stopUntilRef.current !== null && elapsed < stopUntilRef.current;

      if (deviatedRef.current) {
        // off-route: progress along expected route slows; position offset
        const onRoutePt = pointAtProgress(journey.expectedRoute, baseProgress);
        const devPt = deviatePoint(onRoutePt, deviationOffsetRef.current, 35);
        currentLocation = devPt;
        deviationKm = haversineKm(onRoutePt, devPt);
        progress = baseProgress * 0.7;
      } else {
        currentLocation = pointAtProgress(journey.expectedRoute, baseProgress);
      }

      if (isStopped) {
        // hold position
        currentLocation = journey.currentLocation;
        progress = journey.progress;
      }

      const stopDurationMin =
        stopUntilRef.current !== null
          ? Math.max(0, Math.min(elapsed, stopUntilRef.current) - (stopUntilRef.current - (stopUntilRef.current ? 0 : 0)))
          : 0;

      // stopDuration since stop began
      let stopDur = 0;
      if (stopUntilRef.current !== null) {
        const stopStart = phases.find((p) => p.action.kind === 'stop')?.atMin ?? elapsed;
        stopDur = Math.max(0, elapsed - stopStart);
      }

      // risk
      const rInput = {
        deviationKm,
        stopDurationMin: stopDur,
        crowd: crowdRef.current,
        isLateNight: isLateNight(startedAt, elapsed),
        activeSignalCount: 0,
      };
      const newRisk = computeRisk(rInput);

      // detect risk level transitions
      setRisk((prev) => {
        if (prev.level === newRisk.level && Math.abs(prev.score - newRisk.score) < 2) {
          return { ...newRisk, updatedAt: prev.updatedAt };
        }
        if (prev.level !== newRisk.level) {
          addEvent(
            makeEvent(
              'RISK_CHANGE',
              `Risk changed to ${newRisk.level}.`,
              { severity: newRisk.level === 'HIGH' ? 'HIGH' : newRisk.level === 'SUSPICIOUS' ? 'MEDIUM' : 'LOW', riskLevel: newRisk.level, riskScore: newRisk.score }
            )
          );
          if (newRisk.level === 'SUSPICIOUS' && !verificationShownRef.current && !escalatedRef.current) {
            verificationShownRef.current = true;
            setOverlay({ kind: 'verification', countdown: 10 });
            addEvent(makeEvent('VERIFICATION_SENT', 'Discreet verification sent to user.', { severity: 'MEDIUM' }));
            notify({ title: 'Journey check-in', body: 'Your journey seems delayed. Confirm to continue.', level: 'SUSPICIOUS' });
          }
          if (newRisk.level === 'HIGH' && !escalatedRef.current) {
            escalatedRef.current = true;
            const id = nextIncidentId();
            const inc: Incident = {
              incidentId: id,
              riskScore: newRisk.score,
              riskLevel: 'HIGH',
              status: 'ALERT_SENT',
              startedAt: Date.now(),
              reasons: newRisk.rationale,
              journeySnapshot: {
                from: journey.from,
                to: journey.to,
                mode: journey.mode,
                currentLocation,
                deviationKm,
                stopDurationMin: stopDur,
              },
              contactId: journey.contactId,
            };
            setIncident(inc);
            addEvent(makeEvent('HIGH_RISK', 'High-risk journey state confirmed.', { severity: 'HIGH', riskLevel: 'HIGH', riskScore: newRisk.score }));
            addEvent(makeEvent('ALERT_SENT', `Incident ${id} created. Trusted contact alerted.`, { severity: 'HIGH', riskLevel: 'HIGH', riskScore: newRisk.score }));
            notify({ title: 'Trusted contact alerted', body: `Incident ${id} — live location & risk context shared.`, level: 'HIGH' });
            setSafeLocations(SAFE_LOCATIONS);
            setOverlay({ kind: 'incident', countdown: 12 });
            const payload: SOSPayload = {
              incidentId: id,
              userId: APP_USER.id,
              userName: APP_USER.name,
              lat: currentLocation.lat,
              lng: currentLocation.lng,
              timestamp: Date.now(),
              riskTier: 'HIGH',
              riskScore: newRisk.score,
              status: online ? 'DELIVERED' : 'QUEUED',
              attempts: 1,
            };
            setSos(payload);
            if (!online) {
              addEvent(makeEvent('SOS_QUEUED', 'Connection unavailable — emergency payload queued.', { severity: 'HIGH' }));
            } else {
              addEvent(makeEvent('SOS_DELIVERED', 'SOS payload delivered to trusted contact.', { severity: 'HIGH' }));
            }
          }
        }
        return newRisk;
      });

      // update journey
      setJourney((prev) => {
        if (!prev) return prev;
        const status =
          newRisk.level === 'HIGH'
            ? 'HIGH_RISK'
            : newRisk.level === 'SUSPICIOUS'
            ? 'DEVIATION'
            : isStopped
            ? 'PROLONGED_STOP'
            : 'ACTIVE';
        const newActual = [...prev.actualRoute];
        // append point if moved enough
        const last = newActual[newActual.length - 1];
        if (!last || haversineKm(last, currentLocation) > 0.05) {
          newActual.push(currentLocation);
        }
        return {
          ...prev,
          progress,
          currentLocation,
          deviationKm,
          crowd: crowdRef.current,
          stopStartedAt: stopUntilRef.current !== null ? prev.startedAt + (phases.find((p) => p.action.kind === 'stop')?.atMin ?? 0) * 60_000 : null,
          stopDurationMin: stopDur,
          status,
          actualRoute: newActual.slice(-60),
        };
      });

      timer = window.setTimeout(tick, 500);
    };

    lastTickRef.current = Date.now();
    timer = window.setTimeout(tick, 300);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journey?.id, journey?.status === 'COMPLETED', paused]);

  function applyPhaseAction(phase: SimulationPhase) {
    const action = phase.action;
    switch (action.kind) {
      case 'normal':
        break;
      case 'deviate':
        deviatedRef.current = true;
        deviationOffsetRef.current = action.offsetKm;
        addEvent(
          makeEvent('ROUTE_DEVIATION', `Route deviation detected — off by ~${action.offsetKm} km.`, { severity: 'MEDIUM' })
        );
        notify({ title: 'Route deviation detected', body: `Vehicle is ~${action.offsetKm} km off the expected route.`, level: 'SUSPICIOUS' });
        break;
      case 'stop':
        stopUntilRef.current = elapsedRef.current + action.durationMin;
        addEvent(makeEvent('PROLONGED_STOP', `Unexpected prolonged stop detected (${action.durationMin} min).`, { severity: 'MEDIUM' }));
        notify({ title: 'Prolonged stop', body: `Vehicle stationary for ${action.durationMin} min.`, level: 'SUSPICIOUS' });
        break;
      case 'crowd':
        crowdRef.current = action.crowd;
        addEvent(makeEvent('CROWD_CHANGE', `Crowd context changed to ${action.crowd}.`, { severity: 'LOW' }));
        break;
      case 'late':
        startedAtRef.current = Date.now() - (21 * 60 + 58) * 60_000; // 9:58 PM
        addEvent(makeEvent('RISK_CHANGE', 'Late-night journey context noted.', { severity: 'LOW', riskLevel: 'NORMAL' }));
        break;
      case 'resumeRoute':
        deviatedRef.current = false;
        deviationOffsetRef.current = 0;
        stopUntilRef.current = null;
        crowdRef.current = 'Normal';
        addEvent(makeEvent('ROUTE_DEVIATION', 'Vehicle back on expected route.', { severity: 'LOW' }));
        break;
      case 'promptVerification':
        if (!verificationShownRef.current) {
          verificationShownRef.current = true;
          setOverlay({ kind: 'verification', countdown: 10 });
          addEvent(makeEvent('VERIFICATION_SENT', 'Discreet verification sent to user.', { severity: 'MEDIUM' }));
          notify({ title: 'Journey check-in', body: 'Your journey seems delayed. Confirm to continue.', level: 'SUSPICIOUS' });
        }
        break;
      case 'noResponse':
        addEvent(makeEvent('NO_RESPONSE', 'No response within 10 seconds.', { severity: 'HIGH' }));
        break;
      case 'escalate':
        // risk transition will handle via tick; force overlay
        escalatedRef.current = true;
        break;
      case 'resolve':
        resolveIncident();
        break;
      case 'complete':
        endJourney();
        break;
    }
  }

  // ---- Verification countdown ----
  useEffect(() => {
    if (overlay.kind !== 'verification') return;
    const t = window.setInterval(() => {
      setOverlay((o) => {
        if (o.kind !== 'verification') return o;
        if (o.countdown <= 1) {
          // no response → escalate
          addEvent(makeEvent('NO_RESPONSE', 'No response within 10 seconds — escalating.', { severity: 'HIGH' }));
          return { kind: 'none' };
        }
        return { kind: 'verification', countdown: o.countdown - 1 };
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [overlay.kind, addEvent]);

  // ---- Incident escalation countdown ----
  useEffect(() => {
    if (overlay.kind !== 'incident') return;
    const t = window.setInterval(() => {
      setOverlay((o) => {
        if (o.kind !== 'incident') return o;
        if (o.countdown <= 1) return { kind: 'none' };
        return { kind: 'incident', countdown: o.countdown - 1 };
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [overlay.kind]);

  // ---- SOS queue retry simulation ----
  useEffect(() => {
    if (!sos) return;
    if (sos.status === 'DELIVERED') return;
    if (online) {
      // retry
      if (sos.status === 'QUEUED') {
        setSos((s) => (s ? { ...s, status: 'RETRYING', attempts: s.attempts + 1 } : null));
        addEvent(makeEvent('SOS_RETRYING', 'Network restored — retrying SOS delivery.', { severity: 'HIGH' }));
      } else if (sos.status === 'RETRYING') {
        const t = window.setTimeout(() => {
          setSos((s) => (s ? { ...s, status: 'DELIVERED' } : null));
          addEvent(makeEvent('SOS_DELIVERED', 'SOS payload delivered to trusted contact.', { severity: 'HIGH' }));
          notify({ title: 'SOS delivered', body: 'Emergency payload successfully delivered.', level: 'HIGH' });
        }, 2500);
        return () => window.clearTimeout(t);
      }
    }
  }, [sos, online, addEvent, notify]);

  // ---- Dashboard snapshot ----
  const snapshot: DashboardSnapshot = useMemo(
    () => ({
      user: APP_USER,
      journey,
      risk,
      incident,
      timeline: events,
      safeLocations,
      sos,
      online,
      updatedAt: Date.now(),
    }),
    [journey, risk, incident, events, safeLocations, sos, online]
  );

  const value: StoreValue = {
    view,
    setView,
    tab,
    setTab,
    user: APP_USER,
    contacts: TRUSTED_CONTACTS,
    selectedContactId,
    setSelectedContactId,
    journey,
    risk,
    events,
    incident,
    safeLocations,
    notifications,
    overlay,
    setOverlay,
    showStartJourney,
    startJourney,
    cancelStartJourney,
    endJourney,
    resetAll,
    respondVerification,
    triggerShake,
    exitDecoy,
    triggerSOS,
    acknowledgeByContact,
    resolveIncident,
    online,
    setOnline,
    sos,
    runScenario,
    runFullScenario,
    isDemoRunning,
    currentScenarioId,
    pauseSimulation,
    resumeSimulation,
    paused,
    snapshot,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used within StoreProvider');
  return v;
}
