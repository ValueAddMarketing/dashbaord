import { useState, useEffect, useCallback } from 'react';
import {
  triggerFathomSync,
  getFathomSyncLog,
  getEmailDomainMappings,
  addEmailDomainMapping,
  deleteEmailDomainMapping,
} from '../services/supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Hook for managing Fathom sync status, domain mappings, and manual triggers
 */
export const useFathomSync = () => {
  const { user } = useAuth();
  const [syncLog, setSyncLog] = useState([]);
  const [domainMappings, setDomainMappings] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [loadingLog, setLoadingLog] = useState(false);
  const [loadingMappings, setLoadingMappings] = useState(false);
  const [error, setError] = useState(null);
  const [lastSyncResult, setLastSyncResult] = useState(null);

  const loadSyncLog = useCallback(async () => {
    setLoadingLog(true);
    try {
      const { data, error: err } = await getFathomSyncLog(30);
      if (err) throw err;
      setSyncLog(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingLog(false);
    }
  }, []);

  const loadDomainMappings = useCallback(async () => {
    setLoadingMappings(true);
    try {
      const { data, error: err } = await getEmailDomainMappings();
      if (err) throw err;
      setDomainMappings(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMappings(false);
    }
  }, []);

  useEffect(() => {
    loadSyncLog();
    loadDomainMappings();
  }, [loadSyncLog, loadDomainMappings]);

  const runSync = async (createdAfter) => {
    setSyncing(true);
    setError(null);
    setLastSyncResult(null);
    try {
      const { data, error: err } = await triggerFathomSync(createdAfter);
      if (err) throw new Error(err.message || 'Sync failed');
      setLastSyncResult(data);
      // Refresh sync log after sync completes
      await loadSyncLog();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setSyncing(false);
    }
  };

  const addMapping = async (domain, clientName) => {
    setError(null);
    try {
      const { data, error: err } = await addEmailDomainMapping(
        domain.trim().toLowerCase(),
        clientName.trim(),
        user?.email
      );
      if (err) throw err;
      setDomainMappings(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  const removeMapping = async (id) => {
    setError(null);
    try {
      const { error: err } = await deleteEmailDomainMapping(id);
      if (err) throw err;
      setDomainMappings(prev => prev.filter(m => m.id !== id));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const clearError = () => setError(null);

  // Computed stats
  const stats = {
    total: syncLog.length,
    processed: syncLog.filter(s => s.status === 'processed').length,
    unmatched: syncLog.filter(s => s.status === 'unmatched').length,
    failed: syncLog.filter(s => s.status === 'failed').length,
    lastSync: syncLog.length > 0 ? syncLog[0].synced_at : null,
  };

  return {
    syncLog,
    domainMappings,
    syncing,
    loadingLog,
    loadingMappings,
    error,
    lastSyncResult,
    stats,
    runSync,
    addMapping,
    removeMapping,
    refreshSyncLog: loadSyncLog,
    refreshMappings: loadDomainMappings,
    clearError,
  };
};

export default useFathomSync;
