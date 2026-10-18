import React, { useState, useEffect } from 'react';
import { useDatabase } from '@app/shared';
import {
  Database,
  Play,
  Download,
  X,
  Clock,
  Table,
  CheckCircle2,
  AlertCircle,
  Terminal,
} from 'lucide-react';

interface SqliteInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SqliteInspectorModal: React.FC<SqliteInspectorModalProps> = ({ isOpen, onClose }) => {
  const { executeSql, exportDatabase, isRunning, lastResult, error } = useDatabase();
  const [query, setQuery] = useState('SELECT * FROM units;');

  useEffect(() => {
    if (isOpen) {
      executeSql(query).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRun = async (sqlToRun?: string) => {
    const q = sqlToRun || query;
    try {
      await executeSql(q);
    } catch {
      // handled in hook
    }
  };

  const handleExport = async () => {
    const data = await exportDatabase();
    const blob = new Blob([typeof data === 'string' ? data : JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skyguard_sqlite_dump_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const quickQueries = [
    { label: 'Units Fleet', sql: 'SELECT * FROM units;' },
    { label: 'Recent Telemetry', sql: 'SELECT * FROM telemetry_logs ORDER BY timestamp DESC LIMIT 10;' },
    { label: 'Geofences', sql: 'SELECT * FROM geofence_zones;' },
    { label: 'Audit Logs', sql: 'SELECT * FROM system_audit_logs ORDER BY id DESC LIMIT 10;' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-dark border border-subdued-borderDark rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-subdued-borderDark flex items-center justify-between bg-surface-subtleDark/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-content-primaryDark flex items-center gap-2">
                SkyGuard SQLite Live Database Inspector
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SQLite 3.x Engine
                </span>
              </h2>
              <p className="text-xs text-content-secondaryDark font-mono">
                Direct query access, local persistence &amp; transactional logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-content-secondaryDark hover:text-white hover:bg-surface-hoverDark transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Query Editor & Controls */}
        <div className="p-6 border-b border-subdued-borderDark bg-canvas-dark/50 space-y-3">
          {/* Quick Query Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-content-secondaryDark font-mono flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Templates:
            </span>
            {quickQueries.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  setQuery(item.sql);
                  handleRun(item.sql);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-surface-subtleDark hover:bg-surface-hoverDark border border-subdued-borderDark text-content-secondaryDark hover:text-emerald-300 transition"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* SQL Input Area */}
          <div className="relative">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter SQLite query (e.g., SELECT * FROM units;)"
              rows={3}
              className="w-full p-3 font-mono text-xs bg-canvas-dark border border-subdued-borderDark rounded-xl text-emerald-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 selection:bg-emerald-500/30 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-mono text-content-secondaryDark">
              {lastResult && (
                <>
                  <span className="flex items-center gap-1 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {lastResult.rowCount} rows returned
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {lastResult.executionTimeMs} ms
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleExport}
                className="px-3 py-1.5 rounded-lg border border-subdued-borderDark hover:bg-surface-hoverDark text-xs font-mono text-content-secondaryDark hover:text-white flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Export DB Dump
              </button>
              <button
                onClick={() => handleRun()}
                disabled={isRunning}
                className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold font-mono flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isRunning ? 'Running...' : 'Execute Query'}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-status-rose/10 border border-status-rose/30 text-status-rose text-xs font-mono flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>SQLite Error: {error}</span>
            </div>
          )}
        </div>

        {/* Results Table */}
        <div className="flex-1 overflow-auto p-6 bg-surface-dark">
          {lastResult && lastResult.rows.length > 0 ? (
            <div className="rounded-xl border border-subdued-borderDark overflow-hidden">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-canvas-dark text-content-secondaryDark border-b border-subdued-borderDark">
                  <tr>
                    {Object.keys(lastResult.rows[0] || {}).map((col) => (
                      <th key={col} className="px-4 py-2.5 font-bold uppercase tracking-wider text-[10px]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-subdued-borderDark bg-surface-dark">
                  {lastResult.rows.map((row: Record<string, unknown>, rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-surface-subtleDark/50 transition">
                      {Object.values(row).map((val, cIdx) => (
                        <td key={cIdx} className="px-4 py-2.5 text-content-primaryDark whitespace-nowrap">
                          {typeof val === 'object' && val !== null
                            ? JSON.stringify(val)
                            : String(val ?? 'NULL')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-content-secondaryDark space-y-2">
              <Table className="w-8 h-8 text-slate-600" />
              <p className="text-xs font-mono">No query results or empty table.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
