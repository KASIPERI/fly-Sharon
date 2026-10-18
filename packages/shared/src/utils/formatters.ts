/**
 * Formatting and Helper Utilities
 */

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lng).toFixed(5)}° ${lngDir}`;
}

export function formatBattery(level: number): { text: string; color: string; isLow: boolean } {
  const clamped = Math.max(0, Math.min(100, Math.round(level)));
  let color = '#10B981'; // emerald
  let isLow = false;

  if (clamped < 20) {
    color = '#F43F5E'; // rose
    isLow = true;
  } else if (clamped < 40) {
    color = '#F59E0B'; // amber
  }

  return {
    text: `${clamped}%`,
    color,
    isLow,
  };
}

export function formatSignalCsq(csq: number): { text: string; bars: number; label: string } {
  // CSQ is 0-31
  const bars = Math.min(5, Math.max(0, Math.round((csq / 31) * 5)));
  let label = 'No Signal';
  if (csq >= 20) label = 'Excellent';
  else if (csq >= 14) label = 'Good';
  else if (csq >= 8) label = 'Fair';
  else if (csq > 0) label = 'Weak';

  return {
    text: `${csq} CSQ`,
    bars,
    label,
  };
}

export function formatSpeed(speedMps: number, unit: 'mps' | 'kmh' | 'mph' = 'kmh'): string {
  if (unit === 'kmh') {
    return `${(speedMps * 3.6).toFixed(1)} km/h`;
  }
  if (unit === 'mph') {
    return `${(speedMps * 2.23694).toFixed(1)} mph`;
  }
  return `${speedMps.toFixed(1)} m/s`;
}

export function formatAltitude(altitudeM: number): string {
  return `${altitudeM.toFixed(1)} m`;
}

export function formatProximity(meters: number): { text: string; isHazard: boolean } {
  const isHazard = meters > 0 && meters < 1.5;
  return {
    text: `${meters.toFixed(2)} m`,
    isHazard,
  };
}

export function relativeTime(isoString: string): string {
  try {
    const diffSeconds = Math.max(0, Math.floor((Date.now() - new Date(isoString).getTime()) / 1000));
    if (diffSeconds < 5) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    return `${diffHours}h ago`;
  } catch {
    return 'unknown';
  }
}
