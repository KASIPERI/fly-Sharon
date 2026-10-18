import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { palette } from '@app/ui-core';

interface StatusBadgeProps {
  status: 'active' | 'warning' | 'critical' | 'standby';
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label }) => {
  const isWarning = status === 'warning' || status === 'critical';
  const isActive = status === 'active';

  const badgeStyle = isWarning
    ? styles.warningBadge
    : isActive
    ? styles.activeBadge
    : styles.standbyBadge;

  const textStyle = isWarning
    ? styles.warningText
    : isActive
    ? styles.activeText
    : styles.standbyText;

  const textLabel = label || (isWarning ? 'ALERT' : isActive ? 'IN FLIGHT' : 'STANDBY');

  return (
    <View style={[styles.base, badgeStyle]}>
      <Text style={[styles.text, textStyle]}>{textLabel}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  activeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  activeText: {
    color: palette.emerald[400],
  },
  warningBadge: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  warningText: {
    color: '#FBBF24',
  },
  standbyBadge: {
    backgroundColor: '#161F30',
    borderColor: '#1F2937',
  },
  standbyText: {
    color: '#9CA3AF',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
