import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native';
import { useAppStore, useActiveUnit, useTelemetry } from '@app/shared';
import { palette } from '@app/ui-core';
import { MobileCard } from './src/components/MobileCard';
import { StatusBadge } from './src/components/StatusBadge';

export default function MobileApp() {
  const {
    units,
    activeUnitId,
    setActiveUnit,
    connectionStatus,
    dispatchFleetCommand,
    refreshFromDb,
  } = useAppStore();

  const { unit, batteryInfo, signalInfo, proximityInfo, isHazard } = useActiveUnit();
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Initialize shared telemetry stream and SQLite store
  useTelemetry();

  useEffect(() => {
    refreshFromDb();
  }, [refreshFromDb]);

  const handleCommand = async (command: 'RTL' | 'HOLD' | 'EMERGENCY_LAND') => {
    const res = await dispatchFleetCommand(command);
    setActionNotice(res.message);
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={palette.dark.canvas} />

      {/* Mobile Mission Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.brandRow}>
            <Text style={styles.headerTitle}>SkyGuard</Text>
            <View style={styles.versionPill}>
              <Text style={styles.versionText}>FIELD OPS</Text>
            </View>
          </View>
          <Text style={styles.headerSubtitle}>
            GSM Telemetry: {unit?.networkType || '4G-LTE'} · {signalInfo.text}
          </Text>
        </View>

        <StatusBadge
          status={connectionStatus === 'connected' ? 'active' : 'warning'}
          label={connectionStatus.toUpperCase()}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Unit Fleet Switcher Carousel */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FLEET UNITS</Text>
          <Text style={styles.sqliteTag}>SQLite Offline-First</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitPillsRow}>
          {units.map((u) => {
            const isSelected = u.id === activeUnitId;
            return (
              <Pressable
                key={u.id}
                onPress={() => setActiveUnit(u.id)}
                style={[styles.unitPill, isSelected && styles.unitPillSelected]}
              >
                <Text style={[styles.unitPillText, isSelected && styles.unitPillTextSelected]}>
                  {u.id}
                </Text>
                <Text style={styles.unitPillSubtext}>{Math.round(u.batteryLevel)}%</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Hazard Banner */}
        {isHazard && (
          <View style={styles.hazardBanner}>
            <Text style={styles.hazardTitle}>ULTRASONIC PROXIMITY ALERT</Text>
            <Text style={styles.hazardBody}>
              Obstacle detected at {proximityInfo.text}. Auto-altitude hold active.
            </Text>
          </View>
        )}

        {/* Action Notice */}
        {actionNotice && (
          <View style={styles.noticeBanner}>
            <Text style={styles.noticeText}>{actionNotice}</Text>
          </View>
        )}

        {/* Primary Flight Telemetry */}
        <View style={styles.metricsGrid}>
          <MobileCard
            label="Altitude AGL"
            value={unit ? `${unit.altitudeM.toFixed(1)} m` : '--'}
            subtext="Baro + Sonar Guided"
            badgeText="STABLE"
            style={styles.halfCard}
          />

          <MobileCard
            label="Flight Speed"
            value={unit ? `${(unit.speedMps * 3.6).toFixed(1)} km/h` : '--'}
            subtext={`${unit ? unit.speedMps.toFixed(1) : '--'} m/s`}
            badgeText="GPS 3D"
            style={styles.halfCard}
          />
        </View>

        <View style={styles.metricsGrid}>
          <MobileCard
            label="Battery Level"
            value={batteryInfo.text}
            subtext="3S LiPo 4200mAh"
            badgeText={batteryInfo.isLow ? 'LOW' : 'OK'}
            isAlert={batteryInfo.isLow}
            style={styles.halfCard}
          />

          <MobileCard
            label="Obstacle Sonar"
            value={proximityInfo.text}
            subtext="Ultrasonic Sensor"
            badgeText={isHazard ? 'HAZARD' : 'CLEAR'}
            isAlert={isHazard}
            style={styles.halfCard}
          />
        </View>

        <MobileCard
          label="Medical Cargo Bay"
          value={unit ? `${unit.payloadTempC.toFixed(1)} °C` : '--'}
          subtext={`Mass: ${unit?.payloadWeightKg.toFixed(2) ?? '0.00'} kg · Latch Secured`}
          badgeText="CHILLED"
        />

        {/* Rapid Mission Commands */}
        <View style={styles.commandSection}>
          <Text style={styles.commandTitle}>COMMAND DISPATCH</Text>

          <Pressable
            style={styles.buttonPrimary}
            onPress={() => handleCommand('RTL')}
          >
            <Text style={styles.buttonPrimaryText}>Return to Launch (RTL)</Text>
          </Pressable>

          <Pressable
            style={styles.buttonSecondary}
            onPress={() => handleCommand('HOLD')}
          >
            <Text style={styles.buttonSecondaryText}>Hover Station Hold</Text>
          </Pressable>

          <Pressable
            style={styles.buttonDanger}
            onPress={() => handleCommand('EMERGENCY_LAND')}
          >
            <Text style={styles.buttonDangerText}>Emergency Controlled Descent</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.dark.canvas,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: palette.dark.border,
    backgroundColor: palette.dark.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    color: palette.dark.textPrimary,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  versionPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  versionText: {
    color: palette.emerald[400],
    fontSize: 9,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: palette.dark.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: palette.dark.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sqliteTag: {
    color: palette.emerald[400],
    fontSize: 10,
    fontWeight: '600',
  },
  unitPillsRow: {
    marginBottom: 14,
  },
  unitPill: {
    backgroundColor: palette.dark.surface,
    borderColor: palette.dark.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  unitPillSelected: {
    backgroundColor: palette.dark.surfaceSubtle,
    borderColor: palette.emerald[500],
    borderWidth: 1.5,
  },
  unitPillText: {
    color: palette.dark.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  unitPillTextSelected: {
    color: palette.dark.textPrimary,
  },
  unitPillSubtext: {
    color: palette.emerald[400],
    fontSize: 10,
    marginTop: 2,
  },
  hazardBanner: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderColor: 'rgba(244, 63, 94, 0.4)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  hazardTitle: {
    color: '#FB7185',
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  hazardBody: {
    color: palette.dark.textPrimary,
    fontSize: 11,
    marginTop: 4,
  },
  noticeBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  noticeText: {
    color: palette.emerald[300],
    fontSize: 11,
    fontWeight: '600',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  halfCard: {
    flex: 1,
  },
  commandSection: {
    marginTop: 10,
    backgroundColor: palette.dark.surface,
    borderColor: palette.dark.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
  },
  commandTitle: {
    color: palette.dark.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  buttonPrimary: {
    backgroundColor: palette.emerald[500],
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  buttonSecondary: {
    backgroundColor: palette.dark.surfaceSubtle,
    borderColor: palette.dark.border,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonSecondaryText: {
    color: palette.dark.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  buttonDanger: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonDangerText: {
    color: '#FB7185',
    fontWeight: '700',
    fontSize: 13,
  },
});
