import { useState } from 'react';
import { Card, Badge, Button } from '../../components';

/**
 * Shows Fathom sync status, recent sync log, and a manual sync trigger button.
 */
export const FathomSyncStatus = ({
  syncLog,
  stats,
  syncing,
  lastSyncResult,
  error,
  onSync,
  onClearError,
}) => {
  const [showLog, setShowLog] = useState(false);
  const [lookbackHours, setLookbackHours] = useState(24);

  const handleSync = () => {
    const createdAfter = new Date(Date.now() - lookbackHours * 60 * 60 * 1000).toISOString();
    onSync(createdAfter);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'processed': return <Badge variant="success">Synced</Badge>;
      case 'unmatched': return <Badge variant="warning">Unmatched</Badge>;
      case 'failed': return <Badge variant="danger">Failed</Badge>;
      case 'pending': return <Badge variant="default">Pending</Badge>;
      default: return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-white">Fathom Auto-Sync</h3>
          {stats.lastSync && (
            <span className="text-xs text-slate-500">
              Last sync: {new Date(stats.lastSync).toLocaleString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={lookbackHours}
            onChange={e => setLookbackHours(Number(e.target.value))}
            className="bg-dark-800 border border-dark-700 rounded-lg px-2 py-1 text-sm text-slate-300"
          >
            <option value={1}>Last 1 hour</option>
            <option value={6}>Last 6 hours</option>
            <option value={24}>Last 24 hours</option>
            <option value={72}>Last 3 days</option>
            <option value={168}>Last 7 days</option>
          </select>
          <Button
            onClick={handleSync}
            disabled={syncing}
            loading={syncing}
            size="sm"
          >
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-slate-500">Total</div>
        </div>
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-emerald-400">{stats.processed}</div>
          <div className="text-xs text-slate-500">Synced</div>
        </div>
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-400">{stats.unmatched}</div>
          <div className="text-xs text-slate-500">Unmatched</div>
        </div>
        <div className="bg-dark-800 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
          <div className="text-xs text-slate-500">Failed</div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          {onClearError && (
            <button onClick={onClearError} className="text-red-400 hover:text-red-300 ml-3 text-xs">
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Last Sync Result */}
      {lastSyncResult && (
        <div className="mb-3 p-3 bg-brand-cyan/10 border border-brand-cyan/30 rounded-xl text-brand-cyan text-sm">
          {lastSyncResult.message || 'Sync completed'}
          {lastSyncResult.results && (
            <span className="text-slate-400 ml-2">
              ({lastSyncResult.results.filter(r => r.status === 'processed').length} imported,{' '}
              {lastSyncResult.results.filter(r => r.status === 'unmatched').length} unmatched)
            </span>
          )}
        </div>
      )}

      {/* Sync Log Toggle */}
      <button
        onClick={() => setShowLog(!showLog)}
        className="text-sm text-slate-400 hover:text-brand-cyan transition-colors"
      >
        {showLog ? 'Hide' : 'Show'} sync log ({syncLog.length} entries)
      </button>

      {/* Sync Log */}
      {showLog && syncLog.length > 0 && (
        <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto scrollbar">
          {syncLog.map(entry => (
            <div key={entry.id} className="p-3 bg-dark-800 rounded-lg flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm truncate">{entry.fathom_title || 'Untitled'}</span>
                  {getStatusBadge(entry.status)}
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  {entry.client_name && (
                    <span className="text-brand-purple">{entry.client_name}</span>
                  )}
                  <span>{new Date(entry.synced_at).toLocaleString()}</span>
                  {entry.error_message && (
                    <span className="text-red-400 truncate">{entry.error_message}</span>
                  )}
                </div>
              </div>
              {entry.fathom_url && (
                <a
                  href={entry.fathom_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-brand-cyan hover:text-brand-purple shrink-0"
                >
                  View in Fathom
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {showLog && syncLog.length === 0 && (
        <div className="mt-3 text-sm text-slate-500 text-center py-3">
          No sync history yet. Click "Sync Now" to import meetings from Fathom.
        </div>
      )}
    </Card>
  );
};

export default FathomSyncStatus;
