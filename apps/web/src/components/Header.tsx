import React from 'react';
import { useAppStore, useActiveUnit } from '@app/shared';
import {
  Radio,
  Database,
  Moon,
  Sun,
  Play,
  Pause,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

interface HeaderProps {
  onOpenSqlite: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSqlite }) => {
  const {
    themeMode,
    toggleTheme,
    isSimulating,
    toggleSimulation,
    activeTab,
    setActiveTab,
    refreshFromDb,
  } = useAppStore();

  const { unit, signalInfo, isHazard } = useActiveUnit();

  return (
    <header className="sticky top-0 z-40 w-full px-4 lg:px-8 py-3.5 border-b border-subdued-borderDark dark:border-subdued-borderDark bg-surface-dark/90 dark:bg-surface-dark/95 backdrop-blur-md transition-colors duration-200 shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & System Identifier */}
        <div className="flex items-center space-x-3.5 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-emerald-glow">
              <Radio className="w-5 h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-beacon" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold tracking-tight text-content-primaryDark">
                  SkyGuard
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold uppercase tracking-wider">
                  Enterprise v2.4
                </span>
                {isHazard && (
                  <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-status-rose/15 text-status-rose border border-status-rose/30 font-bold animate-pulse">
                    <AlertTriangle className="w-3 h-3" />
                    HAZARD ALERT
                  </span>
                )}
              </div>
              <p className="text-xs text-content-secondaryDark flex items-center gap-1.5">
                <span>Autonomous Fleet &amp; Payload Sonar</span>
                <span className="text-content-muted">·</span>
                <span className="font-mono text-emerald-400">{unit?.id ?? 'SCANNING'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* View Navigation Tabs */}
        <nav className="flex items-center bg-canvas-dark/80 p-1 rounded-xl border border-subdued-borderDark text-xs font-medium">
          <button
            onClick={() => setActiveTab('live')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'live'
                ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                : 'text-content-secondaryDark hover:text-content-primaryDark hover:bg-surface-hoverDark/50'
            }`}
          >
            Live Tracking
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'health'
                ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                : 'text-content-secondaryDark hover:text-content-primaryDark hover:bg-surface-hoverDark/50'
            }`}
          >
            Payload Telemetry
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'hardware'
                ? 'bg-emerald-500 text-white font-semibold shadow-sm'
                : 'text-content-secondaryDark hover:text-content-primaryDark hover:bg-surface-hoverDark/50'
            }`}
          >
            Hardware Specs
          </button>
        </nav>

        {/* System Status Indicators & Controls */}
        <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end">
          {/* GSM CSQ Badge */}
          <div className="hidden sm:flex items-center space-x-2 bg-canvas-dark/90 px-3 py-1.5 rounded-lg border border-subdued-borderDark text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-content-secondaryDark font-mono">
              GSM: <strong className="text-emerald-400">{unit?.networkType ?? '4G-LTE'}</strong>
            </span>
            <span className="text-content-muted">|</span>
            <span className="text-emerald-300 font-mono font-medium">{signalInfo.text}</span>
          </div>

          {/* SQLite Database Explorer Button */}
          <button
            onClick={onOpenSqlite}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-surface-subtleDark hover:bg-surface-hoverDark border border-emerald-500/30 hover:border-emerald-500/60 text-xs font-semibold text-emerald-300 transition-all shadow-sm group"
            title="Open SQLite Database Inspector"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>SQLite Engine</span>
          </button>

          {/* Stream Sim Toggle */}
          <button
            onClick={toggleSimulation}
            className={`p-2 rounded-lg border text-xs transition-all ${
              isSimulating
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-surface-subtleDark text-content-secondaryDark border-subdued-borderDark hover:text-white'
            }`}
            title={isSimulating ? 'Pause Live Telemetry Simulation' : 'Resume Telemetry Simulation'}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>

          {/* Sync DB */}
          <button
            onClick={() => refreshFromDb()}
            className="p-2 rounded-lg bg-surface-subtleDark hover:bg-surface-hoverDark border border-subdued-borderDark text-content-secondaryDark hover:text-white transition-all"
            title="Refresh from SQLite Store"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Theme Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-surface-subtleDark hover:bg-surface-hoverDark border border-subdued-borderDark text-content-secondaryDark hover:text-white transition-all"
            title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {themeMode === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Operator Status */}
          <div className="flex items-center space-x-2 pl-1 border-l border-subdued-borderDark">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">
              OP
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
