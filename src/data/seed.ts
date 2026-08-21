import type {
  DemoScenario,
  GeoPoint,
  SafeLocation,
  TrustedContact,
  User,
} from '@/types/domain';

export const APP_USER: User = {
  id: 'u_001',
  name: 'Aisha Khan',
  phone: '+91 98765 43210',
  avatarInitials: 'AK',
};

export const TRUSTED_CONTACTS: TrustedContact[] = [
  {
    id: 'c_mom',
    name: 'Mom',
    phone: '+91 90043 11257',
    relationship: 'Mother',
    status: 'Available',
    initials: 'MO',
  },
  {
    id: 'c_rohan',
    name: 'Rohan',
    phone: '+91 98220 76511',
    relationship: 'Brother',
    status: 'Available',
    initials: 'RO',
  },
  {
    id: 'c_priya',
    name: 'Priya',
    phone: '+91 99300 88142',
    relationship: 'Friend',
    status: 'Offline',
    initials: 'PR',
  },
];

// Simulated geography — normalized 0..100 coordinates used by the canvas map.
// (lat/lng are faked to Nashik-ish values for display realism.)
export const NASHIK_CENTER: GeoPoint = { lat: 19.9975, lng: 73.7898, label: 'Nashik' };

export const PRESET_ROUTES: Array<{
  id: string;
  from: string;
  to: string;
  mode: 'Bus' | 'Metro' | 'Train' | 'Shared Vehicle' | 'Other';
  expectedRoute: GeoPoint[];
  durationMin: number;
}> = [
  {
    id: 'route_nashik_home',
    from: 'Nashik City Bus Stand',
    to: 'Home — Gangapur Road',
    mode: 'Bus',
    durationMin: 38,
    expectedRoute: [
      { lat: 19.9975, lng: 73.7898, label: 'Bus Stand' },
      { lat: 19.9961, lng: 73.7912, label: 'Main Road' },
      { lat: 19.9921, lng: 73.7938, label: 'College Road' },
      { lat: 19.9882, lng: 73.7955, label: 'Gangapur Chowk' },
      { lat: 19.9841, lng: 73.7971, label: 'Home' },
    ],
  },
  {
    id: 'route_metro',
    from: 'Metro Station — Central',
    to: 'Office — Tech Park',
    mode: 'Metro',
    durationMin: 22,
    expectedRoute: [
      { lat: 19.9975, lng: 73.7898, label: 'Central' },
      { lat: 19.9948, lng: 73.7921, label: 'M.G. Road' },
      { lat: 19.9915, lng: 73.7944, label: 'Indira Nagar' },
      { lat: 19.9886, lng: 73.7968, label: 'Tech Park' },
    ],
  },
  {
    id: 'route_train',
    from: 'Railway Station',
    to: 'Old Town',
    mode: 'Train',
    durationMin: 30,
    expectedRoute: [
      { lat: 19.9975, lng: 73.7898, label: 'Station' },
      { lat: 19.9952, lng: 73.7915, label: 'Platform 2' },
      { lat: 19.9928, lng: 73.7933, label: 'Crossing' },
      { lat: 19.9899, lng: 73.7951, label: 'Old Town' },
    ],
  },
  {
    id: 'route_shared',
    from: 'Market Square',
    to: 'Home — Gangapur Road',
    mode: 'Shared Vehicle',
    durationMin: 18,
    expectedRoute: [
      { lat: 19.9975, lng: 73.7898, label: 'Market' },
      { lat: 19.9938, lng: 73.7922, label: 'Bridge' },
      { lat: 19.9896, lng: 73.7948, label: 'Gangapur' },
      { lat: 19.9841, lng: 73.7971, label: 'Home' },
    ],
  },
];

export const SAFE_LOCATIONS: SafeLocation[] = [
  {
    id: 'sl_1',
    name: 'Gangapur Police Station',
    type: 'Police Station',
    distanceM: 420,
    open: true,
    bearing: 'NW',
  },
  {
    id: 'sl_2',
    name: 'College Road Metro',
    type: 'Metro Station',
    distanceM: 680,
    open: true,
    bearing: 'NE',
  },
  {
    id: 'sl_3',
    name: 'Ashoka Hospital',
    type: 'Hospital',
    distanceM: 1150,
    open: true,
    bearing: 'S',
  },
  {
    id: 'sl_4',
    name: '24/7 Fuel Station',
    type: 'Public Area',
    distanceM: 350,
    open: true,
    bearing: 'E',
  },
  {
    id: 'sl_5',
    name: 'Mall Security Desk',
    type: 'Security Desk',
    distanceM: 900,
    open: false,
    bearing: 'W',
  },
];

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 's1',
    name: 'Normal Journey',
    description: 'A smooth trip with no anomalies. Risk stays low.',
    icon: 'check-circle',
  },
  {
    id: 's2',
    name: 'Route Deviation',
    description: 'Vehicle drifts off the expected path. Risk climbs.',
    icon: 'route',
  },
  {
    id: 's3',
    name: 'Prolonged Stop',
    description: 'Unexpected stationary period in an isolated area.',
    icon: 'clock',
  },
  {
    id: 's4',
    name: 'Multiple Anomalies',
    description: 'Deviation + stop + low crowd. Suspicious state.',
    icon: 'alert-triangle',
  },
  {
    id: 's5',
    name: 'No Response → Escalation',
    description: 'Verification ignored. Automatic high-risk escalation.',
    icon: 'shield-alert',
  },
  {
    id: 's6',
    name: 'Silent Shake → Decoy',
    description: 'Trigger decoy call screen with a shake gesture.',
    icon: 'vibrate',
  },
  {
    id: 's7',
    name: 'Network Failure → SOS Queue',
    description: 'Offline SOS queued, then retried and delivered.',
    icon: 'wifi-off',
  },
];
