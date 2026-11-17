import React, { useState, useEffect } from 'react';
import { getSyncStatus, subscribeSyncStatus } from '../db/rxdb';

export const SyncStatusBadge = ({ compact = false, isLight = false }) => {
  const [status, setStatus] = useState(() => getSyncStatus());

  useEffect(() => {
    return subscribeSyncStatus((next) => setStatus(next));
  }, []);

  const config =
    status === 'offline'
      ? {
          dot: '⚪',
          label: 'Offline Mode',
          cls: isLight
            ? 'bg-slate-200/80 text-slate-700 border-slate-300'
            : 'bg-slate-800/75 text-slate-300 border-white/15'
        }
      : status === 'syncing'
      ? {
          dot: '🟡',
          label: 'Syncing...',
          cls: isLight
            ? 'bg-amber-500/15 text-amber-700 border-amber-400/40'
            : 'bg-amber-500/15 text-amber-300 border-amber-400/35'
        }
      : {
          dot: '🟢',
          label: 'Synced',
          cls: isLight
            ? 'bg-emerald-500/15 text-emerald-700 border-emerald-400/40'
            : 'bg-emerald-500/15 text-emerald-300 border-emerald-400/35'
        };

  return (
    <span
      title={`Database Sync Status: ${config.label}`}
      className={`inline-flex items-center gap-1.5 rounded-full border font-bold tracking-wide backdrop-blur-md transition-all select-none ${
        compact ? 'px-2.5 py-1 text-[10px]' : 'px-3 py-1.5 text-[11px]'
      } ${config.cls}`}
    >
      <span className={status === 'syncing' ? 'animate-pulse' : ''}>{config.dot}</span>
      <span>{config.label}</span>
    </span>
  );
};
