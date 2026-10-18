import React from 'react';
import { useAppStore } from '@app/shared';
import { Plane, AlertTriangle, Battery, Wifi, CheckCircle2 } from 'lucide-react';
import { formatBattery } from '@app/shared';

export const UnitSelector: React.FC = () => {
  const { units, activeUnitId, setActiveUnit } = useAppStore();

  const getStatusBadge = (status: string, hazardProximity: number) => {
    if (hazardProximity < 1.5 || status === 'warning') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-status-amber/15 text-status-amber border border-status-amber/30">
          <AlertTriangle className="w-3 h-3" />
          Proximity Alert
        </span>
      );
    }
    if (status === 'active') {
      return (
        <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3" />
          In Flight
        </span>
      );
    }
    return (
      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-subtleDark text-content-secondaryDark border border-subdued-borderDark">
        Standby
      </span>
    );
  };

  return (
    <div className="bg-surface-dark border border-subdued-borderDark rounded-xl p-4">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-content-secondaryDark flex items-center gap-2">
          <Plane className="w-4 h-4 text-emerald-400" />
          Fleet Units ({units.length})
        </h2>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          Sync: SQLite DB
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {units.map((u) => {
          const isActive = u.id === activeUnitId;
          const battery = formatBattery(u.batteryLevel);

          return (
            <button
              key={u.id}
              onClick={() => setActiveUnit(u.id)}
              className={`p-3.5 rounded-xl border text-left transition-all duration-200 relative overflow-hidden group ${
                isActive
                  ? 'bg-surface-subtleDark border-emerald-500 shadow-emerald-glow'
                  : 'bg-canvas-dark/60 border-subdued-borderDark hover:border-slate-700 hover:bg-surface-subtleDark/50'
              }`}
            >
              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-500" />
              )}

              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-content-primaryDark">
                      {u.id}
                    </span>
                  </div>
                  <p className="text-xs text-content-secondaryDark font-medium truncate max-w-[140px]">
                    {u.callsign}
                  </p>
                </div>
                {getStatusBadge(u.status, u.hazardProximityM)}
              </div>

              {/* Battery & Signal bars */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-content-secondaryDark">
                  <span className="flex items-center gap-1">
                    <Battery className="w-3.5 h-3.5" style={{ color: battery.color }} />
                    <span style={{ color: battery.color }} className="font-bold">
                      {battery.text}
                    </span>
                  </span>
                  <span className="flex items-center gap-1 text-content-secondaryDark">
                    <Wifi className="w-3 h-3 text-emerald-400" />
                    <span>{u.signalCsq} CSQ</span>
                  </span>
                </div>

                {/* Battery level progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(0, u.batteryLevel))}%`,
                      backgroundColor: battery.color,
                    }}
                  />
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-subdued-borderDark/60 flex items-center justify-between text-[10px] font-mono text-content-secondaryDark">
                <span>Alt: {u.altitudeM.toFixed(1)}m</span>
                <span>Speed: {(u.speedMps * 3.6).toFixed(1)} km/h</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
