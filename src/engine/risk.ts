import type { CrowdContext, RiskLevel, RiskSignal, RiskState } from '@/types/domain';

export const SIGNAL_WEIGHTS = {
  ROUTE_DEVIATION: 30,
  PROLONGED_STOP: 25,
  LOW_CROWD: 15,
  LATE_TRAVEL: 10,
  MULTIPLE_ANOMALIES: 20,
} as const;

export interface RiskInput {
  deviationKm: number;
  stopDurationMin: number;
  crowd: CrowdContext;
  isLateNight: boolean;
  activeSignalCount: number;
}

const BASELINE = 12;

export function computeRisk(input: RiskInput): RiskState {
  const signals: RiskSignal[] = [
    {
      id: 'sig_deviation',
      type: 'ROUTE_DEVIATION',
      label: 'Route deviation',
      weight: SIGNAL_WEIGHTS.ROUTE_DEVIATION,
      active: input.deviationKm >= 0.5,
      description:
        input.deviationKm >= 0.5
          ? `Vehicle deviated from expected route by ${input.deviationKm.toFixed(1)} km.`
          : 'On expected route.',
    },
    {
      id: 'sig_stop',
      type: 'PROLONGED_STOP',
      label: 'Prolonged stop',
      weight: SIGNAL_WEIGHTS.PROLONGED_STOP,
      active: input.stopDurationMin >= 2,
      description:
        input.stopDurationMin >= 2
          ? `Unexpected stationary for ${input.stopDurationMin.toFixed(0)} min.`
          : 'Moving normally.',
    },
    {
      id: 'sig_crowd',
      type: 'LOW_CROWD',
      label: 'Low crowd context',
      weight: SIGNAL_WEIGHTS.LOW_CROWD,
      active: input.crowd === 'Low',
      description:
        input.crowd === 'Low'
          ? 'Surroundings appear quiet / low-occupancy.'
          : input.crowd === 'Light'
          ? 'Moderate occupancy.'
          : 'Normal occupancy.',
    },
    {
      id: 'sig_late',
      type: 'LATE_TRAVEL',
      label: 'Late-night travel',
      weight: SIGNAL_WEIGHTS.LATE_TRAVEL,
      active: input.isLateNight,
      description: input.isLateNight
        ? 'Journey occurring late at night.'
        : 'Daytime travel.',
    },
  ];

  const active = signals.filter((s) => s.active);
  const multipleAnomalyBonus =
    active.length >= 2 ? SIGNAL_WEIGHTS.MULTIPLE_ANOMALIES : 0;

  // scale deviation contribution a bit so big deviations feel heavier
  const devScale =
    input.deviationKm >= 2 ? 1.15 : input.deviationKm >= 1 ? 1.05 : 1;
  const stopScale =
    input.stopDurationMin >= 8 ? 1.15 : input.stopDurationMin >= 5 ? 1.05 : 1;

  const raw =
    BASELINE +
    (signals[0].active ? signals[0].weight * devScale : 0) +
    (signals[1].active ? signals[1].weight * stopScale : 0) +
    (signals[2].active ? signals[2].weight : 0) +
    (signals[3].active ? signals[3].weight : 0) +
    multipleAnomalyBonus;

  const score = Math.min(100, Math.round(raw));

  let level: RiskLevel = 'NORMAL';
  if (score >= 70) level = 'HIGH';
  else if (score >= 40) level = 'SUSPICIOUS';

  const rationale = active.map((s) => s.description);

  return {
    level,
    score,
    signals,
    rationale,
    updatedAt: Date.now(),
  };
}

export function levelFromScore(score: number): RiskLevel {
  if (score >= 70) return 'HIGH';
  if (score >= 40) return 'SUSPICIOUS';
  return 'NORMAL';
}

export const RISK_META: Record<
  RiskLevel,
  { label: string; color: string; bg: string; ring: string; text: string }
> = {
  NORMAL: {
    label: 'Normal',
    color: '#16a34a',
    bg: 'bg-risk-green',
    ring: 'ring-risk-green/30',
    text: 'text-risk-green',
  },
  SUSPICIOUS: {
    label: 'Suspicious',
    color: '#d97706',
    bg: 'bg-risk-amber',
    ring: 'ring-risk-amber/30',
    text: 'text-risk-amber',
  },
  HIGH: {
    label: 'High Risk',
    color: '#dc2626',
    bg: 'bg-risk-red',
    ring: 'ring-risk-red/30',
    text: 'text-risk-red',
  },
};
