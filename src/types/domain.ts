// ============================================================================
// SafeRoute — Core domain types
// ============================================================================

export type RiskLevel = 'NORMAL' | 'SUSPICIOUS' | 'HIGH';

export type TravelMode = 'Bus' | 'Metro' | 'Train' | 'Shared Vehicle' | 'Other';

export type CrowdContext = 'Normal' | 'Light' | 'Low';

export type IncidentStatus =
  | 'MONITORING'
  | 'SUSPICIOUS'
  | 'VERIFICATION_SENT'
  | 'HIGH_RISK'
  | 'ALERT_SENT'
  | 'CONTACT_ACKNOWLEDGED'
  | 'RESOLVED';

export type JourneyStatus =
  | 'IDLE'
  | 'SCHEDULED'
  | 'ACTIVE'
  | 'DEVIATION'
  | 'PROLONGED_STOP'
  | 'HIGH_RISK'
  | 'COMPLETED'
  | 'CANCELLED';

export type JourneyEventType =
  | 'JOURNEY_STARTED'
  | 'ROUTE_DEVIATION'
  | 'PROLONGED_STOP'
  | 'CROWD_CHANGE'
  | 'RISK_CHANGE'
  | 'VERIFICATION_SENT'
  | 'USER_CONFIRMED_SAFE'
  | 'NO_RESPONSE'
  | 'HIGH_RISK'
  | 'ALERT_SENT'
  | 'CONTACT_ACKNOWLEDGED'
  | 'SHAKE_TRIGGERED'
  | 'DECOY_ACTIVATED'
  | 'SOS_QUEUED'
  | 'SOS_RETRYING'
  | 'SOS_DELIVERED'
  | 'NETWORK_OFFLINE'
  | 'NETWORK_RESTORED'
  | 'INCIDENT_RESOLVED'
  | 'SAFE_LOCATION_SHOWN'
  | 'JOURNEY_COMPLETED';

export type Severity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface GeoPoint {
  lat: number;
  lng: number;
  /** Label for display, e.g. street or area name */
  label?: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  avatarInitials: string;
}

export interface TrustedContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  status: 'Available' | 'Offline';
  initials: string;
}

export interface RiskSignal {
  id: string;
  type:
    | 'ROUTE_DEVIATION'
    | 'PROLONGED_STOP'
    | 'LOW_CROWD'
    | 'LATE_TRAVEL'
    | 'MULTIPLE_ANOMALIES';
  label: string;
  weight: number;
  active: boolean;
  description: string;
}

export interface RiskState {
  level: RiskLevel;
  score: number;
  signals: RiskSignal[];
  /** Human-readable explanation shown to user & contact */
  rationale: string[];
  updatedAt: number;
}

export interface JourneyEvent {
  id: string;
  type: JourneyEventType;
  timestamp: number;
  severity: Severity;
  description: string;
  riskScore?: number;
  riskLevel?: RiskLevel;
}

export interface LocationUpdate {
  id: string;
  point: GeoPoint;
  timestamp: number;
  /** 0..1 progress along expected route when on route */
  progress: number;
  speedKmh: number;
  heading: number;
  onRoute: boolean;
}

export interface SafeLocation {
  id: string;
  name: string;
  type: 'Police Station' | 'Metro Station' | 'Hospital' | 'Public Area' | 'Security Desk';
  distanceM: number;
  open: boolean;
  bearing: string;
}

export interface Incident {
  incidentId: string;
  riskScore: number;
  riskLevel: RiskLevel;
  status: IncidentStatus;
  startedAt: number;
  reasons: string[];
  journeySnapshot: {
    from: string;
    to: string;
    mode: TravelMode;
    currentLocation: GeoPoint;
    deviationKm: number;
    stopDurationMin: number;
  };
  contactId: string;
}

export interface SOSPayload {
  incidentId: string;
  userId: string;
  userName: string;
  lat: number;
  lng: number;
  timestamp: number;
  riskTier: RiskLevel;
  riskScore: number;
  status: 'QUEUED' | 'RETRYING' | 'DELIVERED';
  attempts: number;
}

export interface Journey {
  id: string;
  from: string;
  to: string;
  mode: TravelMode;
  contactId: string;
  startedAt: number;
  expectedDurationMin: number;
  expectedArrivalAt: number;
  expectedRoute: GeoPoint[];
  actualRoute: GeoPoint[];
  status: JourneyStatus;
  progress: number;
  currentLocation: GeoPoint;
  destination: GeoPoint;
  crowd: CrowdContext;
  deviationKm: number;
  stopStartedAt: number | null;
  stopDurationMin: number;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  level: RiskLevel | 'INFO';
  timestamp: number;
  read: boolean;
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  icon: string;
}

// Payload broadcast from the mobile app to the trusted-contact dashboard
export interface DashboardSnapshot {
  user: User;
  journey: Journey | null;
  risk: RiskState;
  incident: Incident | null;
  timeline: JourneyEvent[];
  safeLocations: SafeLocation[];
  sos: SOSPayload | null;
  online: boolean;
  updatedAt: number;
}
