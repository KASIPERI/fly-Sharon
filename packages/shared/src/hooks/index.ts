/**
 * Shared React Custom Hooks
 * Reusable across Web (React DOM) and Mobile (React Native / Expo)
 */

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { telemetrySimulator } from '../api/client';
import { getSkyguardDb } from '../db';
import { formatBattery, formatSignalCsq, formatProximity } from '../utils/formatters';
import { Unit, SqliteQueryResult } from '../types';

export { useAppStore };

/**
 * Hook to stream real-time hardware telemetry and automatically update state & SQLite
 */
export function useTelemetry() {
  const { isSimulating, updateUnitTelemetry, refreshFromDb, connectionStatus } = useAppStore();

  useEffect(() => {
    // Initial load from SQLite database
    refreshFromDb();

    // Subscribe to simulated hardware telemetry feed
    const unsubscribe = telemetrySimulator.subscribe((packet) => {
      updateUnitTelemetry(packet);
    });

    return () => {
      unsubscribe();
    };
  }, [refreshFromDb, updateUnitTelemetry]);

  return {
    isSimulating,
    connectionStatus,
  };
}

/**
 * Hook for details and computed telemetry stats of the currently active drone unit
 */
export function useActiveUnit() {
  const { activeUnitId, units, hazardAlertActive } = useAppStore();

  const activeUnit: Unit | undefined = useMemo(() => {
    return units.find((u) => u.id === activeUnitId) || units[0];
  }, [units, activeUnitId]);

  const batteryInfo = useMemo(() => {
    return activeUnit ? formatBattery(activeUnit.batteryLevel) : { text: '--', color: '#9CA3AF', isLow: false };
  }, [activeUnit]);

  const signalInfo = useMemo(() => {
    return activeUnit ? formatSignalCsq(activeUnit.signalCsq) : { text: '--', bars: 0, label: 'Offline' };
  }, [activeUnit]);

  const proximityInfo = useMemo(() => {
    return activeUnit ? formatProximity(activeUnit.hazardProximityM) : { text: '--', isHazard: false };
  }, [activeUnit]);

  return {
    unit: activeUnit,
    batteryInfo,
    signalInfo,
    proximityInfo,
    isHazard: hazardAlertActive || (activeUnit ? activeUnit.hazardProximityM < 1.5 : false),
  };
}

/**
 * Hook to directly interact with the SQLite database, execute SQL queries, and inspect tables
 */
export function useDatabase() {
  const db = useMemo(() => getSkyguardDb(), []);
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<SqliteQueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeSql = useCallback(
    async (sql: string, params: unknown[] = []) => {
      setIsRunning(true);
      setError(null);
      try {
        const result = await db.executeRawQuery(sql, params);
        setLastResult(result);
        return result;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
        throw err;
      } finally {
        setIsRunning(false);
      }
    },
    [db]
  );

  const exportDatabase = useCallback(async () => {
    return await db.exportDatabase();
  }, [db]);

  return {
    db,
    executeSql,
    exportDatabase,
    isRunning,
    lastResult,
    error,
  };
}
