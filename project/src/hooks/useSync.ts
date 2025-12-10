/**
 * useSync Hook
 * 
 * React hook for managing data synchronization with business apps.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';

export interface SyncStatus {
  instanceId: string;
  instanceName: string;
  appName: string;
  status: 'synced' | 'syncing' | 'sync_failed' | 'never_synced';
  lastSyncAt: string | null;
  error: string | null;
}

export function useSync() {
  const { currentOrganization } = useOrganization();
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  // Fetch sync statuses for all app instances
  const fetchSyncStatuses = useCallback(async () => {
    if (!currentOrganization) return;

    try {
      const { data, error } = await supabase
        .from('app_instances')
        .select(`
          id,
          instance_name,
          sync_status,
          last_sync_at,
          sync_error,
          business_apps (display_name)
        `)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;

      const statuses: SyncStatus[] = (data || []).map((instance: any) => ({
        instanceId: instance.id,
        instanceName: instance.instance_name,
        appName: instance.business_apps?.display_name || 'Unknown App',
        status: instance.sync_status || 'never_synced',
        lastSyncAt: instance.last_sync_at,
        error: instance.sync_error,
      }));

      setSyncStatuses(statuses);
    } catch (error) {
      console.error('Failed to fetch sync statuses:', error);
    } finally {
      setLoading(false);
    }
  }, [currentOrganization]);

  // Subscribe to real-time sync status updates
  useEffect(() => {
    if (!currentOrganization) return;

    fetchSyncStatuses();

    // Set up real-time subscription
    const subscription = supabase
      .channel('sync_status_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'app_instances',
          filter: `organization_id=eq.${currentOrganization.id}`,
        },
        (payload) => {
          setSyncStatuses((prev) =>
            prev.map((status) =>
              status.instanceId === payload.new.id
                ? {
                    ...status,
                    status: payload.new.sync_status,
                    lastSyncAt: payload.new.last_sync_at,
                    error: payload.new.sync_error,
                  }
                : status
            )
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentOrganization, fetchSyncStatuses]);

  // Trigger sync for a specific instance
  const triggerSync = useCallback(async (instanceId: string) => {
    setSyncing(instanceId);

    try {
      // Update status to syncing
      await supabase
        .from('app_instances')
        .update({ sync_status: 'syncing' })
        .eq('id', instanceId);

      // Create sync log entry
      const { data: logEntry } = await supabase
        .from('app_sync_logs')
        .insert({
          app_instance_id: instanceId,
          sync_type: 'manual',
          status: 'started',
        })
        .select()
        .single();

      // Simulate sync process (in production, this would call the actual sync service)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update sync status
      await supabase
        .from('app_instances')
        .update({
          sync_status: 'synced',
          last_sync_at: new Date().toISOString(),
          sync_error: null,
        })
        .eq('id', instanceId);

      // Update sync log
      if (logEntry) {
        await supabase
          .from('app_sync_logs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            records_synced: 1,
          })
          .eq('id', logEntry.id);
      }

      // Refresh statuses
      await fetchSyncStatuses();

      return { success: true };
    } catch (error: any) {
      // Update failed status
      await supabase
        .from('app_instances')
        .update({
          sync_status: 'sync_failed',
          sync_error: error.message,
        })
        .eq('id', instanceId);

      return { success: false, error: error.message };
    } finally {
      setSyncing(null);
    }
  }, [fetchSyncStatuses]);

  // Sync all instances
  const syncAll = useCallback(async () => {
    for (const status of syncStatuses) {
      await triggerSync(status.instanceId);
    }
  }, [syncStatuses, triggerSync]);

  // Get sync logs for an instance
  const getSyncLogs = useCallback(async (instanceId: string, limit = 10) => {
    const { data, error } = await supabase
      .from('app_sync_logs')
      .select('*')
      .eq('app_instance_id', instanceId)
      .order('started_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch sync logs:', error);
      return [];
    }

    return data;
  }, []);

  return {
    syncStatuses,
    loading,
    syncing,
    triggerSync,
    syncAll,
    getSyncLogs,
    refresh: fetchSyncStatuses,
  };
}

export default useSync;

