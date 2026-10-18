/**
 * Shared Zustand Global State Store
 * 80% code reuse across Web, Electron desktop, and React Native / Expo mobile
 * Features synchronous state dispatch, SQLite persistence synchronization,
 * and high-contrast theme toggling.
 */

import { create } from 'zustand';
import { Unit, TelemetryLog, GeofenceZone, ConnectionStatus, SystemInfo, SystemAuditLog } from '../types';
import { getSkyguardDb } from '../db';
import { telemetrySimulator } from '../api/client';

export interface AppState {
  // Navigation & UI state
  activeUnitId: string;
  activeTab: 'live' | 'health' | 'hardware' | 'sqlite';
  themeMode: 'dark' | 'light';
  connectionStatus: ConnectionStatus;
  isSimulating: boolean;
  hazardAlertActive: boolean;

  // Domain state
  units: Unit[];
  telemetryHistory: TelemetryLog[];
  geofences: GeofenceZone[];
  auditLogs: SystemAuditLog[];
  systemInfo: SystemInfo | null;
  lastSyncTimestamp: string;

  // Actions
  setActiveUnit: (id: string) => Promise<void>;
  setActiveTab: (tab: 'live' | 'health' | 'hardware' | 'sqlite') => void;
  setThemeMode: (mode: 'dark' | 'light') => void;
  toggleTheme: () => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  toggleSimulation: () => void;
  refreshFromDb: () => Promise<void>;
  updateUnitTelemetry: (packet: Partial<TelemetryLog> & { unitId: string; headingDeg?: number }) => Promise<void>;
  dispatchFleetCommand: (command: 'RTL' | 'HOLD' | 'EMERGENCY_LAND') => Promise<{ success: boolean; message: string }>;
  setSystemInfo: (info: SystemInfo) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeUnitId: 'DRONE-SKY-01',
  activeTab: 'live',
  themeMode: 'dark',
  connectionStatus: 'connected',
  isSimulating: true,
  hazardAlertActive: false,

  units: [],
  telemetryHistory: [],
  geofences: [],
  auditLogs: [],
  systemInfo: null,
  lastSyncTimestamp: new Date().toISOString(),

  setActiveUnit: async (id: string) => {
    set({ activeUnitId: id });
    const db = getSkyguardDb();
    const history = await db.getRecentTelemetry(id, 25);
    const unit = get().units.find((u) => u.id === id);
    set({
      telemetryHistory: history,
      hazardAlertActive: unit ? unit.hazardProximityM < 1.5 : false,
    });
    await db.logAudit('UNIT_FOCUS_CHANGED', 'OPERATOR', `View shifted to unit ${id}`);
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  setThemeMode: (mode) => set({ themeMode: mode }),

  toggleTheme: () => {
    const nextMode = get().themeMode === 'dark' ? 'light' : 'dark';
    set({ themeMode: nextMode });
  },

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  toggleSimulation: () => {
    const nextState = !get().isSimulating;
    set({ isSimulating: nextState });
    if (nextState) {
      telemetrySimulator.start();
    } else {
      telemetrySimulator.stop();
    }
  },

  refreshFromDb: async () => {
    const db = getSkyguardDb();
    await db.initialize();
    const units = await db.getUnits();
    const geofences = await db.getGeofenceZones();
    const activeId = get().activeUnitId;
    const history = await db.getRecentTelemetry(activeId, 25);
    const audits = await db.getRecentAudits(10);

    const activeUnit = units.find((u) => u.id === activeId) || units[0];

    set({
      units,
      geofences,
      telemetryHistory: history,
      auditLogs: audits,
      activeUnitId: activeUnit ? activeUnit.id : activeId,
      hazardAlertActive: activeUnit ? activeUnit.hazardProximityM < 1.5 : false,
      lastSyncTimestamp: new Date().toISOString(),
      connectionStatus: 'connected',
    });
  },

  updateUnitTelemetry: async (packet) => {
    const db = getSkyguardDb();
    const { unitId, id: _logId, ...data } = packet;

    // Update in-memory unit
    const units: Unit[] = get().units.map((u) => {
      if (u.id === unitId) {
        const hazardAlert = (data.altitudeM !== undefined && data.altitudeM < 1.5) || (data.hazardAlert ?? false);
        return {
          ...u,
          ...data,
          id: u.id,
          headingDeg: data.headingDeg ?? u.headingDeg,
          batteryLevel: data.batteryLevel ?? u.batteryLevel,
          signalCsq: data.signalCsq ?? u.signalCsq,
          latitude: data.latitude ?? u.latitude,
          longitude: data.longitude ?? u.longitude,
          altitudeM: data.altitudeM ?? u.altitudeM,
          speedMps: data.speedMps ?? u.speedMps,
          payloadTempC: data.tempC ?? u.payloadTempC,
          hazardProximityM: data.hazardAlert ? 1.1 : u.hazardProximityM,
          status: hazardAlert ? ('warning' as const) : u.status,
          lastHeartbeat: new Date().toISOString(),
        };
      }
      return u;
    });

    const isActive = get().activeUnitId === unitId;

    if (isActive) {
      const newPoint: TelemetryLog = {
        unitId,
        timestamp: data.timestamp || new Date().toISOString(),
        batteryLevel: data.batteryLevel ?? 90,
        signalCsq: data.signalCsq ?? 20,
        latitude: data.latitude ?? 37.7749,
        longitude: data.longitude ?? -122.4194,
        altitudeM: data.altitudeM ?? 45,
        speedMps: data.speedMps ?? 12,
        tempC: data.tempC ?? 18,
        vibrationG: data.vibrationG ?? 0.04,
        hazardAlert: Boolean(data.hazardAlert),
      };

      const updatedHistory = [newPoint, ...get().telemetryHistory.slice(0, 24)];
      set({
        units,
        telemetryHistory: updatedHistory,
        hazardAlertActive: Boolean(data.hazardAlert),
      });
    } else {
      set({ units });
    }

    // Persist to SQLite
    await db.updateUnitTelemetry(
      unitId,
      {
        latitude: data.latitude,
        longitude: data.longitude,
        altitudeM: data.altitudeM,
        speedMps: data.speedMps,
        headingDeg: data.headingDeg,
        batteryLevel: data.batteryLevel,
        signalCsq: data.signalCsq,
        payloadTempC: data.tempC,
      },
      data
    );
  },

  dispatchFleetCommand: async (command) => {
    const db = getSkyguardDb();
    const unitId = get().activeUnitId;
    let message = '';

    if (command === 'RTL') {
      message = `Return-To-Launch waypoint acknowledged by ${unitId}. Standard glide corridor assigned.`;
    } else if (command === 'HOLD') {
      message = `Station-Keep Hold engaged at current altitude for ${unitId}. Sonar ping active.`;
    } else if (command === 'EMERGENCY_LAND') {
      message = `EMERGENCY LANDING PROTOCOL EXECUTING for ${unitId}! Immediate controlled descent.`;
    }

    await db.logAudit(`COMMAND_${command}`, 'OPERATOR', `Command dispatched to ${unitId}: ${message}`);
    const audits = await db.getRecentAudits(10);
    set({ auditLogs: audits });

    return { success: true, message };
  },

  setSystemInfo: (info) => set({ systemInfo: info }),
}));
