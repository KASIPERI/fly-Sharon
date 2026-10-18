/**
 * Core Domain Models & Interfaces
 * Cross-platform type safety across Web, Electron, and Expo React Native
 */

export type UnitStatus = 'active' | 'warning' | 'critical' | 'standby';

export type NetworkType = '4G-LTE' | 'GPRS-2G' | 'SATELLITE';

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'reconnecting';

export interface Unit {
  id: string;
  callsign: string;
  model: string;
  status: UnitStatus;
  batteryLevel: number; // 0 - 100%
  signalCsq: number; // 0 - 31 GSM CSQ
  networkType: NetworkType;
  latitude: number;
  longitude: number;
  altitudeM: number;
  speedMps: number;
  headingDeg: number;
  payloadWeightKg: number;
  payloadTempC: number;
  hazardProximityM: number; // Ultrasonic sensor reading in meters
  lastHeartbeat: string; // ISO 8601
}

export interface TelemetryLog {
  id?: number;
  unitId: string;
  timestamp: string;
  batteryLevel: number;
  signalCsq: number;
  latitude: number;
  longitude: number;
  altitudeM: number;
  speedMps: number;
  tempC: number;
  vibrationG: number;
  hazardAlert: boolean;
}

export interface GeofenceZone {
  id: string;
  name: string;
  type: 'delivery_corridor' | 'no_fly_zone' | 'landing_hub';
  maxAltitudeM: number;
  coordinates: Array<{ lat: number; lng: number }>;
  status: 'active' | 'inactive';
}

export interface GeofenceEvent {
  id: string;
  unitId: string;
  zoneName: string;
  eventType: 'entered' | 'exited' | 'boundary_warning';
  timestamp: string;
  lat: number;
  lng: number;
}

export interface SystemAuditLog {
  id?: number;
  action: string;
  operator: string;
  details: string;
  timestamp: string;
}

export interface SystemInfo {
  platform: string;
  arch: string;
  nodeVersion?: string;
  appVersion?: string;
  memoryUsageMb?: number;
}

/**
 * Platform-agnostic SQLite Driver Interface
 * Implemented natively by Web (WASM/LocalStorage/IDB), Electron (Node/Native), and Expo (expo-sqlite)
 */
export interface IDatabaseDriver {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  run(sql: string, params?: unknown[]): Promise<{ changes: number; lastInsertRowid: number }>;
  exec(sql: string): Promise<void>;
  exportDb?(): Promise<Uint8Array | string>;
}

export interface SqliteQueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowCount: number;
  executionTimeMs: number;
}
