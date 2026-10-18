/**
 * SQLite Database Schemas, DDL & Seed Data
 * Targeted for SQLite 3+ across Web (WASM/LocalStorage), Electron, and Expo SQLite
 */

import { Unit, GeofenceZone } from '../types';

export const SCHEMA_VERSION = 1;

export const DDL_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS units (
    id TEXT PRIMARY KEY,
    callsign TEXT NOT NULL,
    model TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('active', 'warning', 'critical', 'standby')),
    battery_level REAL NOT NULL,
    signal_csq INTEGER NOT NULL,
    network_type TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    altitude_m REAL NOT NULL,
    speed_mps REAL NOT NULL,
    heading_deg REAL NOT NULL DEFAULT 0,
    payload_weight_kg REAL NOT NULL,
    payload_temp_c REAL NOT NULL,
    hazard_proximity_m REAL NOT NULL,
    last_heartbeat TEXT NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS telemetry_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unit_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    battery_level REAL NOT NULL,
    signal_csq INTEGER NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    altitude_m REAL NOT NULL,
    speed_mps REAL NOT NULL,
    temp_c REAL NOT NULL,
    vibration_g REAL NOT NULL,
    hazard_alert INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(unit_id) REFERENCES units(id)
  );`,

  `CREATE TABLE IF NOT EXISTS geofence_zones (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('delivery_corridor', 'no_fly_zone', 'landing_hub')),
    max_altitude_m REAL NOT NULL,
    coordinates_json TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active'
  );`,

  `CREATE TABLE IF NOT EXISTS geofence_events (
    id TEXT PRIMARY KEY,
    unit_id TEXT NOT NULL,
    zone_name TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK(event_type IN ('entered', 'exited', 'boundary_warning')),
    timestamp TEXT NOT NULL,
    lat REAL NOT NULL,
    lng REAL NOT NULL
  );`,

  `CREATE TABLE IF NOT EXISTS system_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    operator TEXT NOT NULL,
    details TEXT NOT NULL,
    timestamp TEXT NOT NULL
  );`,

  `CREATE INDEX IF NOT EXISTS idx_telemetry_unit_time ON telemetry_logs (unit_id, timestamp DESC);`,
  `CREATE INDEX IF NOT EXISTS idx_units_status ON units (status);`
];

export const INITIAL_UNITS: Unit[] = [
  {
    id: 'DRONE-SKY-01',
    callsign: 'Falcon-Alpha',
    model: 'SkyGuard Urban Hexacopter v2.4',
    status: 'active',
    batteryLevel: 94.5,
    signalCsq: 24,
    networkType: '4G-LTE',
    latitude: 37.7749,
    longitude: -122.4194,
    altitudeM: 48.2,
    speedMps: 13.5,
    headingDeg: 42,
    payloadWeightKg: 2.15,
    payloadTempC: 18.4,
    hazardProximityM: 4.8,
    lastHeartbeat: new Date().toISOString(),
  },
  {
    id: 'DRONE-SKY-02',
    callsign: 'Kestrel-02',
    model: 'SkyGuard Urban Quad-Lifter v1.9',
    status: 'active',
    batteryLevel: 78.2,
    signalCsq: 18,
    networkType: 'GPRS-2G',
    latitude: 37.7833,
    longitude: -122.4167,
    altitudeM: 32.8,
    speedMps: 9.8,
    headingDeg: 125,
    payloadWeightKg: 1.40,
    payloadTempC: 19.1,
    hazardProximityM: 3.2,
    lastHeartbeat: new Date(Date.now() - 3000).toISOString(),
  },
  {
    id: 'PAYLOAD-ALPHA-4',
    callsign: 'Titan-Carrier',
    model: 'SkyGuard Heavy Payload Transport v3',
    status: 'warning',
    batteryLevel: 34.0,
    signalCsq: 13,
    networkType: '4G-LTE',
    latitude: 37.7690,
    longitude: -122.4467,
    altitudeM: 61.4,
    speedMps: 16.2,
    headingDeg: 280,
    payloadWeightKg: 4.85,
    payloadTempC: 22.8,
    hazardProximityM: 1.1, // Warning: < 1.5m obstacle proximity
    lastHeartbeat: new Date(Date.now() - 1000).toISOString(),
  },
  {
    id: 'DRONE-SKY-04',
    callsign: 'Harrier-04',
    model: 'SkyGuard Rapid Response Drone',
    status: 'standby',
    batteryLevel: 100.0,
    signalCsq: 29,
    networkType: 'SATELLITE',
    latitude: 37.7899,
    longitude: -122.4010,
    altitudeM: 0.0,
    speedMps: 0.0,
    headingDeg: 0,
    payloadWeightKg: 0.0,
    payloadTempC: 16.5,
    hazardProximityM: 12.0,
    lastHeartbeat: new Date().toISOString(),
  },
];

export const INITIAL_GEOFENCES: GeofenceZone[] = [
  {
    id: 'ZONE-CORRIDOR-A',
    name: 'Downtown Medical Corridor Alpha',
    type: 'delivery_corridor',
    maxAltitudeM: 120,
    status: 'active',
    coordinates: [
      { lat: 37.7710, lng: -122.4250 },
      { lat: 37.7790, lng: -122.4100 },
      { lat: 37.7850, lng: -122.4150 },
      { lat: 37.7770, lng: -122.4300 },
    ],
  },
  {
    id: 'ZONE-RESTRICTED-B',
    name: 'Harbor Heliport Exclusion Zone',
    type: 'no_fly_zone',
    maxAltitudeM: 300,
    status: 'active',
    coordinates: [
      { lat: 37.7950, lng: -122.3980 },
      { lat: 37.8020, lng: -122.4050 },
      { lat: 37.8050, lng: -122.3900 },
      { lat: 37.7980, lng: -122.3850 },
    ],
  },
];
