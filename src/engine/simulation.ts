import type {
  GeoPoint,
  Journey,
  JourneyEvent,
  JourneyEventType,
  RiskState,
  Severity,
} from '@/types/domain';
import { computeRisk, type RiskInput } from '@/engine/risk';

let idCounter = 0;
export function uid(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`;
}

let incidentCounter = 1041;
export function nextIncidentId(): string {
  incidentCounter += 1;
  return `SR-${incidentCounter}`;
}

export function makeEvent(
  type: JourneyEventType,
  description: string,
  opts: { severity?: Severity; riskScore?: number; riskLevel?: RiskState['level']; timestamp?: number } = {}
): JourneyEvent {
  return {
    id: uid('evt'),
    type,
    timestamp: opts.timestamp ?? Date.now(),
    severity: opts.severity ?? 'LOW',
    description,
    riskScore: opts.riskScore,
    riskLevel: opts.riskLevel,
  };
}

// Interpolate along an array of waypoints by progress 0..1
export function pointAtProgress(route: GeoPoint[], progress: number): GeoPoint {
  if (route.length === 0) return { lat: 0, lng: 0 };
  if (route.length === 1) return route[0];
  const clamped = Math.max(0, Math.min(1, progress));
  const segCount = route.length - 1;
  const scaled = clamped * segCount;
  const idx = Math.min(segCount - 1, Math.floor(scaled));
  const t = scaled - idx;
  const a = route[idx];
  const b = route[idx + 1];
  return {
    lat: a.lat + (b.lat - a.lat) * t,
    lng: a.lng + (b.lng - a.lng) * t,
    label: t > 0.5 ? b.label : a.label,
  };
}

export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Produce a "deviated" waypoint offset perpendicular to the expected route
export function deviatePoint(p: GeoPoint, offsetKm: number, angleDeg = 35): GeoPoint {
  const angle = (angleDeg * Math.PI) / 180;
  const dLat = (offsetKm / 6371) * Math.cos(angle) * (180 / Math.PI);
  const dLng =
    ((offsetKm / 6371) * Math.sin(angle) * (180 / Math.PI)) /
    Math.cos((p.lat * Math.PI) / 180);
  return { lat: p.lat + dLat, lng: p.lng + dLng, label: p.label };
}

export interface SimulationState {
  journey: Journey | null;
  risk: RiskState;
  events: JourneyEvent[];
  /** ticks elapsed since journey start (sim minutes) */
  elapsedMin: number;
  /** index of the next scenario phase */
  phaseIndex: number;
  phases: SimulationPhase[];
  paused: boolean;
}

export interface SimulationPhase {
  /** sim minute at which this phase activates */
  atMin: number;
  action: PhaseAction;
  label: string;
}

export type PhaseAction =
  | { kind: 'normal' }
  | { kind: 'deviate'; offsetKm: number; angleDeg?: number }
  | { kind: 'stop'; durationMin: number }
  | { kind: 'crowd'; crowd: import('@/types/domain').CrowdContext }
  | { kind: 'late' }
  | { kind: 'resumeRoute' }
  | { kind: 'promptVerification' }
  | { kind: 'noResponse' }
  | { kind: 'escalate' }
  | { kind: 'resolve' }
  | { kind: 'complete' };

export function buildScenarioPhases(scenarioId: string): SimulationPhase[] {
  switch (scenarioId) {
    case 's1': // Normal
      return [
        { atMin: 0, action: { kind: 'normal' }, label: 'Journey started' },
        { atMin: 38, action: { kind: 'complete' }, label: 'Arrived at destination' },
      ];
    case 's2': // Route deviation
      return [
        { atMin: 0, action: { kind: 'normal' }, label: 'Journey started' },
        { atMin: 12, action: { kind: 'deviate', offsetKm: 1.2 }, label: 'Route deviation begins' },
        { atMin: 30, action: { kind: 'resumeRoute' }, label: 'Back on route' },
        { atMin: 38, action: { kind: 'complete' }, label: 'Arrived' },
      ];
    case 's3': // Prolonged stop
      return [
        { atMin: 0, action: { kind: 'normal' }, label: 'Journey started' },
        { atMin: 14, action: { kind: 'stop', durationMin: 9 }, label: 'Unexpected stop' },
        { atMin: 24, action: { kind: 'crowd', crowd: 'Low' }, label: 'Crowd thins' },
        { atMin: 30, action: { kind: 'resumeRoute' }, label: 'Moving again' },
        { atMin: 40, action: { kind: 'complete' }, label: 'Arrived' },
      ];
    case 's4': // Multiple anomalies
      return [
        { atMin: 0, action: { kind: 'normal' }, label: 'Journey started' },
        { atMin: 10, action: { kind: 'late' }, label: 'Late-night context' },
        { atMin: 14, action: { kind: 'deviate', offsetKm: 1.6 }, label: 'Route deviation' },
        { atMin: 18, action: { kind: 'stop', durationMin: 5 }, label: 'Prolonged stop' },
        { atMin: 20, action: { kind: 'crowd', crowd: 'Low' }, label: 'Low crowd' },
        { atMin: 32, action: { kind: 'resumeRoute' }, label: 'Back on route' },
        { atMin: 40, action: { kind: 'complete' }, label: 'Arrived' },
      ];
    case 's5': // No response → escalation
      return [
        { atMin: 0, action: { kind: 'normal' }, label: 'Journey started' },
        { atMin: 10, action: { kind: 'late' }, label: 'Late-night context' },
        { atMin: 13, action: { kind: 'deviate', offsetKm: 1.9 }, label: 'Route deviation' },
        { atMin: 15, action: { kind: 'stop', durationMin: 6 }, label: 'Prolonged stop' },
        { atMin: 17, action: { kind: 'crowd', crowd: 'Low' }, label: 'Low crowd' },
        { atMin: 18, action: { kind: 'promptVerification' }, label: 'Discreet verification sent' },
        { atMin: 19, action: { kind: 'noResponse' }, label: 'No response' },
        { atMin: 19.5, action: { kind: 'escalate' }, label: 'Automatic escalation' },
        { atMin: 34, action: { kind: 'resolve' }, label: 'Incident resolved' },
      ];
    case 's6': // shake handled separately
      return [
        { atMin: 0, action: { kind: 'normal' }, label: 'Journey started' },
        { atMin: 12, action: { kind: 'deviate', offsetKm: 1.2 }, label: 'Route deviation' },
        { atMin: 30, action: { kind: 'complete' }, label: 'Arrived' },
      ];
    case 's7': // network failure handled separately
      return [
        { atMin: 0, action: { kind: 'normal' }, label: 'Journey started' },
        { atMin: 12, action: { kind: 'deviate', offsetKm: 1.5 }, label: 'Route deviation' },
        { atMin: 16, action: { kind: 'stop', durationMin: 5 }, label: 'Prolonged stop' },
        { atMin: 18, action: { kind: 'promptVerification' }, label: 'Verification sent' },
        { atMin: 19, action: { kind: 'noResponse' }, label: 'No response' },
        { atMin: 19.5, action: { kind: 'escalate' }, label: 'Automatic escalation' },
        { atMin: 34, action: { kind: 'resolve' }, label: 'Resolved' },
      ];
    default:
      return [
        { atMin: 0, action: { kind: 'normal' }, label: 'Journey started' },
        { atMin: 38, action: { kind: 'complete' }, label: 'Arrived' },
      ];
  }
}

export function buildFullScenarioPhases(): SimulationPhase[] {
  return [
    { atMin: 0, action: { kind: 'normal' }, label: 'Journey started' },
    { atMin: 8, action: { kind: 'late' }, label: 'Late-night context' },
    { atMin: 11, action: { kind: 'deviate', offsetKm: 1.4 }, label: 'Route deviation detected' },
    { atMin: 14, action: { kind: 'stop', durationMin: 5 }, label: 'Prolonged stop detected' },
    { atMin: 16, action: { kind: 'crowd', crowd: 'Low' }, label: 'Low crowd context' },
    { atMin: 17, action: { kind: 'promptVerification' }, label: 'Discreet verification sent' },
    { atMin: 18, action: { kind: 'noResponse' }, label: 'No response within 10s' },
    { atMin: 18.5, action: { kind: 'escalate' }, label: 'Risk HIGH — automatic escalation' },
    { atMin: 33, action: { kind: 'resolve' }, label: 'Incident resolved' },
  ];
}

export function isLateNight(startedAt: number, elapsedMin: number): boolean {
  const d = new Date(startedAt + elapsedMin * 60_000);
  const h = d.getHours();
  return h >= 21 || h < 5;
}

export function currentRiskInput(
  journey: Journey,
  startedAt: number,
  elapsedMin: number
): RiskInput {
  return {
    deviationKm: journey.deviationKm,
    stopDurationMin: journey.stopDurationMin,
    crowd: journey.crowd,
    isLateNight: isLateNight(startedAt, elapsedMin),
    activeSignalCount: 0,
  };
}

export { computeRisk };
