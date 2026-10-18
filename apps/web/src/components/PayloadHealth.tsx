import React from 'react';
import { useActiveUnit } from '@app/shared';
import {
  ShieldAlert,
  Thermometer,
  Activity,
  Weight,
  Lock,
  Radio,
} from 'lucide-react';

export const PayloadHealth: React.FC = () => {
  const { unit, proximityInfo, isHazard } = useActiveUnit();

  if (!unit) return null;

  // Calculate ultrasonic proximity percentage (0m - 10m scale)
  const proximityPercent = Math.min(100, Math.max(0, (unit.hazardProximityM / 10) * 100));

  // Medical cargo temperature status
  const tempStatus =
    unit.payloadTempC < 15
      ? { label: 'COLD WARNING', color: 'text-status-amber' }
      : unit.payloadTempC > 25
      ? { label: 'HEAT CRITICAL', color: 'text-status-rose' }
      : { label: 'OPTIMAL CARGO RANGE', color: 'text-emerald-400' };

  return (
    <div className="bg-surface-dark border border-subdued-borderDark rounded-xl p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-subdued-borderDark">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-content-primaryDark">
              Payload Telemetry &amp; Ultrasonic Sonar
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            LATCH: SECURED
          </span>
        </div>

        {/* Hazard Banner if Obstacle < 1.5m */}
        {isHazard && (
          <div className="mt-3 p-3 rounded-lg bg-status-rose/15 border border-status-rose/40 text-status-rose flex items-center space-x-3 animate-pulse">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <div className="text-xs font-mono">
              <strong className="block font-bold">ULTRASONIC HAZARD PROXIMITY ALERT!</strong>
              Obstacle detected at <span className="underline font-bold">{proximityInfo.text}</span>. Automatic altitude hold engaged.
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3.5">
          {/* Ultrasonic Distance Gauge */}
          <div className="p-3 bg-canvas-dark rounded-xl border border-subdued-borderDark">
            <div className="flex items-center justify-between text-xs text-content-secondaryDark">
              <span className="flex items-center gap-1.5 font-medium">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Sonar Proximity
              </span>
              <span className="font-mono font-bold text-content-primaryDark">
                {unit.hazardProximityM.toFixed(2)} m
              </span>
            </div>
            <div className="mt-2 w-full bg-surface-subtleDark h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isHazard ? 'bg-status-rose' : 'bg-emerald-500'
                }`}
                style={{ width: `${proximityPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-content-secondaryDark mt-1">
              <span>0m (Impact)</span>
              <span>10m+ (Clear)</span>
            </div>
          </div>

          {/* Cargo Temperature */}
          <div className="p-3 bg-canvas-dark rounded-xl border border-subdued-borderDark">
            <div className="flex items-center justify-between text-xs text-content-secondaryDark">
              <span className="flex items-center gap-1.5 font-medium">
                <Thermometer className="w-3.5 h-3.5 text-emerald-400" />
                Cargo Bay Temp
              </span>
              <span className="font-mono font-bold text-content-primaryDark">
                {unit.payloadTempC.toFixed(1)}°C
              </span>
            </div>
            <div className="mt-2 text-[11px] font-mono font-semibold flex items-center justify-between">
              <span className={tempStatus.color}>{tempStatus.label}</span>
              <span className="text-content-secondaryDark">Target: 18.0°C</span>
            </div>
          </div>

          {/* Cargo Weight & Latch State */}
          <div className="p-3 bg-canvas-dark rounded-xl border border-subdued-borderDark">
            <div className="flex items-center justify-between text-xs text-content-secondaryDark">
              <span className="flex items-center gap-1.5 font-medium">
                <Weight className="w-3.5 h-3.5 text-emerald-400" />
                Payload Mass
              </span>
              <span className="font-mono font-bold text-content-primaryDark">
                {unit.payloadWeightKg.toFixed(2)} kg
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
              <span className="text-content-secondaryDark">Max Rating: 5.00 kg</span>
              <span className="text-emerald-400 font-semibold">LOAD VERIFIED</span>
            </div>
          </div>

          {/* GSM GPRS / CSQ RSSI Telemetry */}
          <div className="p-3 bg-canvas-dark rounded-xl border border-subdued-borderDark">
            <div className="flex items-center justify-between text-xs text-content-secondaryDark">
              <span className="flex items-center gap-1.5 font-medium">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                Telemetry Gateway
              </span>
              <span className="font-mono font-bold text-emerald-400">{unit.networkType}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-mono">
              <span className="text-content-secondaryDark">Signal CSQ:</span>
              <span className="text-content-primaryDark font-bold">{unit.signalCsq} / 31 (RSSI -75 dBm)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3.5 pt-3 border-t border-subdued-borderDark flex items-center justify-between text-xs text-content-secondaryDark">
        <span className="flex items-center gap-1.5 font-mono">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          Hardware Safety Latch Interlock: ENGAGED
        </span>
        <span className="font-mono text-[11px]">Heartbeat: 2s ago</span>
      </div>
    </div>
  );
};
