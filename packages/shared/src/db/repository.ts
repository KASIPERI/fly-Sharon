/**
 * SkyGuard Production SQLite Repository
 * High-performance, typed data access layer with transactions,
 * telemetry recording, geofence logging, and system audits.
 */

import {
  Unit,
  TelemetryLog,
  GeofenceZone,
  GeofenceEvent,
  SystemAuditLog,
  IDatabaseDriver,
  SqliteQueryResult,
} from '../types';
import { DDL_STATEMENTS, INITIAL_UNITS, INITIAL_GEOFENCES } from './schema';
import { BrowserSqliteDriver } from './sqlite-browser';

export class SkyguardRepository {
  private driver: IDatabaseDriver;
  private initialized = false;

  constructor(driver?: IDatabaseDriver) {
    this.driver = driver || new BrowserSqliteDriver();
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;

    // Run DDL Statements
    for (const ddl of DDL_STATEMENTS) {
      await this.driver.exec(ddl);
    }

    // Check if units already exist
    const existingUnits = await this.driver.query<Unit>('SELECT id FROM units');
    if (!existingUnits || existingUnits.length === 0) {
      await this.seedInitialData();
    }

    this.initialized = true;
  }

  private async seedInitialData(): Promise<void> {
    // 1. Seed Units
    for (const u of INITIAL_UNITS) {
      await this.driver.run(
        `INSERT INTO units (
          id, callsign, model, status, battery_level, signal_csq,
          network_type, latitude, longitude, altitude_m, speed_mps,
          heading_deg, payload_weight_kg, payload_temp_c, hazard_proximity_m, last_heartbeat
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          u.id,
          u.callsign,
          u.model,
          u.status,
          u.batteryLevel,
          u.signalCsq,
          u.networkType,
          u.latitude,
          u.longitude,
          u.altitudeM,
          u.speedMps,
          u.headingDeg,
          u.payloadWeightKg,
          u.payloadTempC,
          u.hazardProximityM,
          u.lastHeartbeat,
        ]
      );

      // Seed initial telemetry point
      await this.driver.run(
        `INSERT INTO telemetry_logs (
          unit_id, timestamp, battery_level, signal_csq, latitude,
          longitude, altitude_m, speed_mps, temp_c, vibration_g, hazard_alert
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          u.id,
          u.lastHeartbeat,
          u.batteryLevel,
          u.signalCsq,
          u.latitude,
          u.longitude,
          u.altitudeM,
          u.speedMps,
          u.payloadTempC,
          0.04,
          u.hazardProximityM < 1.5 ? 1 : 0,
        ]
      );
    }

    // 2. Seed Geofence Zones
    for (const g of INITIAL_GEOFENCES) {
      await this.driver.run(
        `INSERT INTO geofence_zones (id, name, type, max_altitude_m, coordinates_json, status)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [g.id, g.name, g.type, g.maxAltitudeM, JSON.stringify(g.coordinates), g.status]
      );
    }

    // 3. Seed Audit Log
    await this.logAudit('SYSTEM_BOOTSTRAP', 'SYSTEM_KERNEL', 'SQLite tables initialized & fleet seeded');
  }

  // --- Units Queries ---

  public async getUnits(): Promise<Unit[]> {
    await this.initialize();
    const rows = await this.driver.query<Record<string, unknown>>('SELECT * FROM units');
    return rows.map((r) => this.mapUnitRow(r));
  }

  public async getUnitById(id: string): Promise<Unit | null> {
    await this.initialize();
    const rows = await this.driver.query<Record<string, unknown>>('SELECT * FROM units WHERE id = ?', [id]);
    const first = rows[0];
    return first ? this.mapUnitRow(first) : null;
  }

  public async updateUnitTelemetry(
    unitId: string,
    updates: Partial<Unit>,
    telemetry?: Partial<TelemetryLog>
  ): Promise<void> {
    await this.initialize();

    const unit = await this.getUnitById(unitId);
    if (!unit) return;

    const merged: Unit = {
      ...unit,
      ...updates,
      lastHeartbeat: new Date().toISOString(),
    };

    await this.driver.run(
      `UPDATE units SET 
        status = ?, battery_level = ?, signal_csq = ?, latitude = ?,
        longitude = ?, altitude_m = ?, speed_mps = ?, heading_deg = ?,
        payload_temp_c = ?, hazard_proximity_m = ?, last_heartbeat = ?
       WHERE id = ?`,
      [
        merged.status,
        merged.batteryLevel,
        merged.signalCsq,
        merged.latitude,
        merged.longitude,
        merged.altitudeM,
        merged.speedMps,
        merged.headingDeg,
        merged.payloadTempC,
        merged.hazardProximityM,
        merged.lastHeartbeat,
        unitId,
      ]
    );

    // Record Telemetry Log
    await this.driver.run(
      `INSERT INTO telemetry_logs (
        unit_id, timestamp, battery_level, signal_csq, latitude,
        longitude, altitude_m, speed_mps, temp_c, vibration_g, hazard_alert
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        unitId,
        merged.lastHeartbeat,
        merged.batteryLevel,
        merged.signalCsq,
        merged.latitude,
        merged.longitude,
        merged.altitudeM,
        merged.speedMps,
        merged.payloadTempC,
        telemetry?.vibrationG ?? 0.05,
        merged.hazardProximityM < 1.5 ? 1 : 0,
      ]
    );
  }

  // --- Telemetry Queries ---

  public async getRecentTelemetry(unitId: string, limit = 20): Promise<TelemetryLog[]> {
    await this.initialize();
    const rows = await this.driver.query<Record<string, unknown>>(
      'SELECT * FROM telemetry_logs WHERE unit_id = ? ORDER BY timestamp DESC LIMIT ?',
      [unitId, limit]
    );

    return rows.map((r) => ({
      id: Number(r['id'] ?? 0),
      unitId: String(r['unit_id'] ?? unitId),
      timestamp: String(r['timestamp'] ?? ''),
      batteryLevel: Number(r['battery_level'] ?? 0),
      signalCsq: Number(r['signal_csq'] ?? 0),
      latitude: Number(r['latitude'] ?? 0),
      longitude: Number(r['longitude'] ?? 0),
      altitudeM: Number(r['altitude_m'] ?? 0),
      speedMps: Number(r['speed_mps'] ?? 0),
      tempC: Number(r['temp_c'] ?? 0),
      vibrationG: Number(r['vibration_g'] ?? 0),
      hazardAlert: Boolean(r['hazard_alert']),
    }));
  }

  // --- Geofence Queries ---

  public async getGeofenceZones(): Promise<GeofenceZone[]> {
    await this.initialize();
    const rows = await this.driver.query<Record<string, unknown>>('SELECT * FROM geofence_zones');
    return rows.map((r) => ({
      id: String(r['id']),
      name: String(r['name']),
      type: r['type'] as GeofenceZone['type'],
      maxAltitudeM: Number(r['max_altitude_m']),
      status: r['status'] as GeofenceZone['status'],
      coordinates: typeof r['coordinates_json'] === 'string' ? JSON.parse(r['coordinates_json']) : [],
    }));
  }

  public async recordGeofenceEvent(event: Omit<GeofenceEvent, 'id'>): Promise<void> {
    await this.initialize();
    const id = `EVT-${Date.now()}`;
    await this.driver.run(
      `INSERT INTO geofence_events (id, unit_id, zone_name, event_type, timestamp, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, event.unitId, event.zoneName, event.eventType, event.timestamp, event.lat, event.lng]
    );
  }

  // --- Audit Queries ---

  public async logAudit(action: string, operator: string, details: string): Promise<void> {
    await this.initialize();
    await this.driver.run(
      `INSERT INTO system_audit_logs (action, operator, details, timestamp)
       VALUES (?, ?, ?, ?)`,
      [action, operator, details, new Date().toISOString()]
    );
  }

  public async getRecentAudits(limit = 15): Promise<SystemAuditLog[]> {
    await this.initialize();
    const rows = await this.driver.query<Record<string, unknown>>(
      'SELECT * FROM system_audit_logs ORDER BY id DESC LIMIT ?',
      [limit]
    );
    return rows.map((r) => ({
      id: Number(r['id']),
      action: String(r['action']),
      operator: String(r['operator']),
      details: String(r['details']),
      timestamp: String(r['timestamp']),
    }));
  }

  // --- Raw SQL Query Runner (for SQLite Explorer in UI) ---

  public async executeRawQuery(sql: string, params: unknown[] = []): Promise<SqliteQueryResult> {
    await this.initialize();
    const startTime = performance.now();
    const trimmed = sql.trim().toUpperCase();

    if (trimmed.startsWith('SELECT') || trimmed.startsWith('PRAGMA') || trimmed.startsWith('EXPLAIN')) {
      const rows = await this.driver.query<Record<string, unknown>>(sql, params);
      const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));
      return {
        rows,
        rowCount: rows.length,
        executionTimeMs,
      };
    } else {
      const res = await this.driver.run(sql, params);
      const executionTimeMs = parseFloat((performance.now() - startTime).toFixed(2));
      return {
        rows: [{ affectedRows: res.changes, lastInsertRowid: res.lastInsertRowid }],
        rowCount: res.changes,
        executionTimeMs,
      };
    }
  }

  public async exportDatabase(): Promise<string | Uint8Array> {
    if (this.driver.exportDb) {
      return await this.driver.exportDb();
    }
    return JSON.stringify(await this.getUnits(), null, 2);
  }

  private mapUnitRow(r: Record<string, unknown>): Unit {
    return {
      id: String(r['id'] ?? ''),
      callsign: String(r['callsign'] ?? ''),
      model: String(r['model'] ?? ''),
      status: (r['status'] as Unit['status']) || 'standby',
      batteryLevel: Number(r['battery_level'] ?? 0),
      signalCsq: Number(r['signal_csq'] ?? 0),
      networkType: (r['network_type'] as Unit['networkType']) || '4G-LTE',
      latitude: Number(r['latitude'] ?? 0),
      longitude: Number(r['longitude'] ?? 0),
      altitudeM: Number(r['altitude_m'] ?? 0),
      speedMps: Number(r['speed_mps'] ?? 0),
      headingDeg: Number(r['heading_deg'] ?? 0),
      payloadWeightKg: Number(r['payload_weight_kg'] ?? 0),
      payloadTempC: Number(r['payload_temp_c'] ?? 0),
      hazardProximityM: Number(r['hazard_proximity_m'] ?? 0),
      lastHeartbeat: String(r['last_heartbeat'] ?? new Date().toISOString()),
    };
  }
}
