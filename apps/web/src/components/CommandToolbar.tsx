import React, { useState } from 'react';
import { useAppStore, useActiveUnit } from '@app/shared';
import { Home, PauseOctagon, AlertOctagon, History, Shield, CheckCircle2 } from 'lucide-react';

export const CommandToolbar: React.FC = () => {
  const { dispatchFleetCommand, auditLogs } = useAppStore();
  const { unit } = useActiveUnit();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showAudits, setShowAudits] = useState(false);

  const handleCommand = async (cmd: 'RTL' | 'HOLD' | 'EMERGENCY_LAND') => {
    const res = await dispatchFleetCommand(cmd);
    setFeedback(res.message);
    setTimeout(() => setFeedback(null), 4000);
  };

  return (
    <div className="bg-surface-dark border border-subdued-borderDark rounded-xl p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-content-primaryDark">
            Mission Command Dispatch ({unit?.id})
          </h3>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* RTL Command */}
          <button
            onClick={() => handleCommand('RTL')}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition shadow-sm"
          >
            <Home className="w-3.5 h-3.5" />
            <span>RTL Corridor</span>
          </button>

          {/* Hold Command */}
          <button
            onClick={() => handleCommand('HOLD')}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-surface-subtleDark hover:bg-surface-hoverDark border border-subdued-borderDark text-content-primaryDark text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition"
          >
            <PauseOctagon className="w-3.5 h-3.5 text-status-amber" />
            <span>Hover Hold</span>
          </button>

          {/* Emergency Descent */}
          <button
            onClick={() => handleCommand('EMERGENCY_LAND')}
            className="flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-status-rose/15 hover:bg-status-rose/25 text-status-rose border border-status-rose/30 text-xs font-semibold font-mono flex items-center justify-center gap-1.5 transition"
          >
            <AlertOctagon className="w-3.5 h-3.5" />
            <span>E-Land</span>
          </button>

          {/* Audit Trail Drawer Toggle */}
          <button
            onClick={() => setShowAudits(!showAudits)}
            className="p-2 rounded-lg bg-canvas-dark border border-subdued-borderDark text-content-secondaryDark hover:text-white transition"
            title="Toggle Audit Log"
          >
            <History className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Feedback */}
      {feedback && (
        <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Embedded SQLite Audit Logs */}
      {showAudits && (
        <div className="mt-3 pt-3 border-t border-subdued-borderDark space-y-1.5 max-h-36 overflow-y-auto">
          <div className="text-[11px] font-mono text-content-secondaryDark font-semibold uppercase tracking-wider">
            SQLite Audit Trail (Recent Transactions)
          </div>
          {auditLogs.slice(0, 5).map((log, i) => (
            <div
              key={i}
              className="text-[11px] font-mono bg-canvas-dark/60 p-1.5 rounded border border-subdued-borderDark/40 flex items-center justify-between text-content-secondaryDark"
            >
              <span className="text-emerald-400 font-bold">{log.action}</span>
              <span className="truncate max-w-[240px]">{log.details}</span>
              <span className="text-[10px] text-content-muted">{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
