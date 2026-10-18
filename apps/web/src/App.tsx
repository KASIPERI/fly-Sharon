import { useState, useEffect } from 'react';
import { useAppStore, useTelemetry, useActiveUnit } from '@app/shared';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import { UnitSelector } from './components/UnitSelector';
import { LiveFlightRadar } from './components/LiveFlightRadar';
import { PayloadHealth } from './components/PayloadHealth';
import { CommandToolbar } from './components/CommandToolbar';
import { SqliteInspectorModal } from './components/SqliteInspectorModal';
import {
  Gauge,
  Compass,
  BatteryCharging,
  Radar,
  Thermometer,
  Wifi,
  Cpu,
  Radio,
  Activity,
  HardDrive,
} from 'lucide-react';

export function App() {
  const { themeMode, activeTab, telemetryHistory } = useAppStore();
  const { unit, batteryInfo, signalInfo, proximityInfo, isHazard } = useActiveUnit();
  const [sqliteModalOpen, setSqliteModalOpen] = useState(false);

  // Initialize live telemetry subscription and SQLite store
  useTelemetry();

  // Sync dark class on document element
  useEffect(() => {
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  return (
    <div className="min-h-screen bg-canvas-dark text-content-primaryDark flex flex-col font-sans transition-colors duration-200">
      {/* Top Mission Control Header */}
      <Header onOpenSqlite={() => setSqliteModalOpen(true)} />

      {/* Main Mission Workspace */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto p-4 lg:p-6 space-y-4">
        {/* Fleet Unit Switcher */}
        <UnitSelector />

        {/* Primary Flight Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricCard
            label="Altitude AGL"
            value={unit ? unit.altitudeM.toFixed(1) : '--'}
            unit="m"
            subtext="Baro + Ultrasonic"
            icon={Gauge}
            badge={{ text: 'Normal Corridor', variant: 'emerald' }}
          />

          <MetricCard
            label="Flight Speed"
            value={unit ? (unit.speedMps * 3.6).toFixed(1) : '--'}
            unit="km/h"
            subtext={`${unit ? unit.speedMps.toFixed(1) : '--'} m/s`}
            icon={Compass}
            badge={{ text: 'GPS 3D Lock', variant: 'emerald' }}
          />

          <MetricCard
            label="Battery Level"
            value={batteryInfo.text}
            unit=""
            subtext="3S LiPo 4200mAh"
            icon={BatteryCharging}
            badge={{
              text: batteryInfo.isLow ? 'Low Power' : 'Stable',
              variant: batteryInfo.isLow ? 'rose' : 'emerald',
            }}
            highlight={batteryInfo.isLow}
          />

          <MetricCard
            label="Sonar Proximity"
            value={proximityInfo.text}
            unit=""
            subtext="Ultrasonic Sensor"
            icon={Radar}
            badge={{
              text: isHazard ? 'OBSTACLE ALERT' : 'Clear',
              variant: isHazard ? 'rose' : 'emerald',
            }}
            highlight={isHazard}
          />

          <MetricCard
            label="Cargo Temp"
            value={unit ? `${unit.payloadTempC.toFixed(1)}°` : '--'}
            unit="C"
            subtext="Bay Thermistor"
            icon={Thermometer}
            badge={{ text: 'Chilled Safe', variant: 'emerald' }}
          />

          <MetricCard
            label="GSM Signal"
            value={signalInfo.text}
            unit=""
            subtext={signalInfo.label}
            icon={Wifi}
            badge={{ text: unit?.networkType || '4G-LTE', variant: 'emerald' }}
          />
        </div>

        {/* Tab 1: Live Airspace & Tactical Radar */}
        {activeTab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-4">
              <LiveFlightRadar />
              <CommandToolbar />
            </div>

            <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-4">
              <PayloadHealth />

              {/* Quick Telemetry Micro-stream Table */}
              <div className="bg-surface-dark border border-subdued-borderDark rounded-xl p-4 flex-1">
                <div className="flex items-center justify-between pb-2.5 border-b border-subdued-borderDark">
                  <span className="text-xs font-bold uppercase tracking-wider text-content-primaryDark flex items-center gap-1.5 font-mono">
                    <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    Telemetry Stream (SQLite Log)
                  </span>
                  <span className="text-[10px] font-mono text-content-secondaryDark">Live Stream</span>
                </div>
                <div className="mt-2.5 overflow-hidden rounded-lg border border-subdued-borderDark">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-canvas-dark text-content-secondaryDark">
                      <tr>
                        <th className="px-2.5 py-1.5">Time</th>
                        <th className="px-2.5 py-1.5">Alt</th>
                        <th className="px-2.5 py-1.5">Spd</th>
                        <th className="px-2.5 py-1.5">Batt</th>
                        <th className="px-2.5 py-1.5">CSQ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-subdued-borderDark/60 bg-surface-dark">
                      {telemetryHistory.slice(0, 6).map((log, idx) => (
                        <tr key={idx} className="hover:bg-surface-subtleDark/40">
                          <td className="px-2.5 py-1 text-content-secondaryDark">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </td>
                          <td className="px-2.5 py-1 text-emerald-400">{log.altitudeM.toFixed(1)}m</td>
                          <td className="px-2.5 py-1 text-content-primaryDark">
                            {(log.speedMps * 3.6).toFixed(0)}km/h
                          </td>
                          <td className="px-2.5 py-1 text-content-primaryDark">
                            {Math.round(log.batteryLevel)}%
                          </td>
                          <td className="px-2.5 py-1 text-content-secondaryDark">{log.signalCsq}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Detailed Payload Telemetry Table */}
        {activeTab === 'health' && (
          <div className="bg-surface-dark border border-subdued-borderDark rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-subdued-borderDark">
              <div>
                <h3 className="text-base font-bold text-content-primaryDark flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Historical Telemetry Logs ({unit?.id})
                </h3>
                <p className="text-xs text-content-secondaryDark font-mono">
                  Persisted SQLite records synchronized from hardware sensor bus
                </p>
              </div>
              <button
                onClick={() => setSqliteModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-semibold"
              >
                Inspect in SQLite
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-subdued-borderDark">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-canvas-dark text-content-secondaryDark border-b border-subdued-borderDark">
                  <tr>
                    <th className="px-4 py-2.5">Timestamp</th>
                    <th className="px-4 py-2.5">Latitude</th>
                    <th className="px-4 py-2.5">Longitude</th>
                    <th className="px-4 py-2.5">Altitude</th>
                    <th className="px-4 py-2.5">Speed</th>
                    <th className="px-4 py-2.5">Battery</th>
                    <th className="px-4 py-2.5">Temp</th>
                    <th className="px-4 py-2.5">CSQ</th>
                    <th className="px-4 py-2.5">Hazard</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subdued-borderDark bg-surface-dark">
                  {telemetryHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-surface-subtleDark/50 transition">
                      <td className="px-4 py-2 text-content-secondaryDark">
                        {new Date(item.timestamp).toISOString()}
                      </td>
                      <td className="px-4 py-2 text-content-primaryDark">{item.latitude.toFixed(5)}</td>
                      <td className="px-4 py-2 text-content-primaryDark">{item.longitude.toFixed(5)}</td>
                      <td className="px-4 py-2 text-emerald-400 font-bold">{item.altitudeM.toFixed(1)} m</td>
                      <td className="px-4 py-2 text-content-primaryDark">{(item.speedMps * 3.6).toFixed(1)} km/h</td>
                      <td className="px-4 py-2 text-content-primaryDark">{item.batteryLevel.toFixed(1)}%</td>
                      <td className="px-4 py-2 text-content-primaryDark">{item.tempC.toFixed(1)}°C</td>
                      <td className="px-4 py-2 text-content-secondaryDark">{item.signalCsq}</td>
                      <td className="px-4 py-2">
                        {item.hazardAlert ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-status-rose/20 text-status-rose font-bold">
                            HAZARD
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400">
                            NOMINAL
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Hardware Specifications */}
        {activeTab === 'hardware' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-surface-dark border border-subdued-borderDark rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2.5 pb-2.5 border-b border-subdued-borderDark">
                <Cpu className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-content-primaryDark">Flight Controller &amp; MCU</h4>
              </div>
              <ul className="text-xs font-mono space-y-2 text-content-secondaryDark">
                <li><strong className="text-content-primaryDark">Processor:</strong> STM32F745 Cortex-M7 @ 216MHz</li>
                <li><strong className="text-content-primaryDark">IMU:</strong> Dual InvenSense ICM-20602</li>
                <li><strong className="text-content-primaryDark">Barometer:</strong> MS5611 High-precision</li>
                <li><strong className="text-content-primaryDark">Bus Protocol:</strong> CAN Bus &amp; UART 115200</li>
              </ul>
            </div>

            <div className="bg-surface-dark border border-subdued-borderDark rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2.5 pb-2.5 border-b border-subdued-borderDark">
                <Radio className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-content-primaryDark">Telemetry &amp; Avionics</h4>
              </div>
              <ul className="text-xs font-mono space-y-2 text-content-secondaryDark">
                <li><strong className="text-content-primaryDark">Modem:</strong> SIM800L GPRS / SIM7600 4G LTE</li>
                <li><strong className="text-content-primaryDark">GPS:</strong> u-Blox NEO-M8N GNSS + Galileo</li>
                <li><strong className="text-content-primaryDark">Sonar:</strong> HC-SR04 / MaxBotix Ultrasonic</li>
                <li><strong className="text-content-primaryDark">Detection Range:</strong> 0.20m to 10.00m</li>
              </ul>
            </div>

            <div className="bg-surface-dark border border-subdued-borderDark rounded-xl p-5 space-y-3">
              <div className="flex items-center space-x-2.5 pb-2.5 border-b border-subdued-borderDark">
                <HardDrive className="w-5 h-5 text-emerald-400" />
                <h4 className="text-sm font-bold text-content-primaryDark">Database &amp; Data Pipeline</h4>
              </div>
              <ul className="text-xs font-mono space-y-2 text-content-secondaryDark">
                <li><strong className="text-content-primaryDark">Database Engine:</strong> SQLite 3.x Relational Store</li>
                <li><strong className="text-content-primaryDark">State Sync:</strong> Zustand Reactive Store</li>
                <li><strong className="text-content-primaryDark">Validation:</strong> Strict Zod Runtime Schemas</li>
                <li><strong className="text-content-primaryDark">Cross-Platform:</strong> Web, Electron, Expo Mobile</li>
              </ul>
            </div>
          </div>
        )}
      </main>

      {/* Interactive SQLite Live Inspector Modal */}
      <SqliteInspectorModal isOpen={sqliteModalOpen} onClose={() => setSqliteModalOpen(false)} />
    </div>
  );
}
