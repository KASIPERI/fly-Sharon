import React from 'react';
import { StyleSheet, View, Text, ViewStyle } from 'react-native';
import { palette } from '@app/ui-core';

interface MobileCardProps {
  label: string;
  value: string;
  subtext?: string;
  badgeText?: string;
  isAlert?: boolean;
  style?: ViewStyle;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  label,
  value,
  subtext,
  badgeText,
  isAlert = false,
  style,
}) => {
  return (
    <View style={[styles.card, isAlert && styles.alertCard, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label.toUpperCase()}</Text>
        {badgeText && (
          <View style={[styles.badge, isAlert ? styles.alertBadge : styles.nominalBadge]}>
            <Text style={[styles.badgeText, isAlert ? styles.alertBadgeText : styles.nominalBadgeText]}>
              {badgeText}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.value, isAlert ? styles.alertValue : styles.nominalValue]}>
        {value}
      </Text>

      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.dark.surface,
    borderColor: palette.dark.border,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  alertCard: {
    borderColor: 'rgba(244, 63, 94, 0.4)',
    backgroundColor: '#171219',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    color: palette.dark.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  nominalBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  nominalBadgeText: {
    color: palette.emerald[400],
    fontSize: 9,
    fontWeight: '700',
  },
  alertBadge: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  alertBadgeText: {
    color: '#FB7185',
    fontSize: 9,
    fontWeight: '700',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  nominalValue: {
    color: palette.dark.textPrimary,
  },
  alertValue: {
    color: '#FB7185',
  },
  subtext: {
    color: palette.dark.textMuted,
    fontSize: 11,
    marginTop: 4,
  },
});
