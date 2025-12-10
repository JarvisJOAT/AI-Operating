/**
 * Data Sync Service
 * 
 * Handles periodic synchronization of data between business apps
 * and the AI-Operating platform.
 * 
 * Features:
 * - Configurable sync intervals (5-15 minutes)
 * - Sync status tracking
 * - Error handling with retry logic
 * - Sync logs for audit trail
 */

import { supabase } from '../../lib/supabase';

export interface SyncConfig {
  appInstanceId: string;
  syncInterval: number; // in milliseconds
  maxRetries: number;
  retryDelay: number; // in milliseconds
}

export interface SyncResult {
  success: boolean;
  recordsSynced: number;
  recordsFailed: number;
  error?: string;
  duration: number;
}

export interface SyncJob {
  instanceId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  lastSync: Date | null;
  nextSync: Date;
  interval: number;
  retryCount: number;
}

// Default configuration
const DEFAULT_CONFIG: Partial<SyncConfig> = {
  syncInterval: 5 * 60 * 1000, // 5 minutes
  maxRetries: 3,
  retryDelay: 30 * 1000, // 30 seconds
};

class SyncService {
  private jobs: Map<string, SyncJob> = new Map();
  private timers: Map<string, NodeJS.Timer> = new Map();
  private isRunning: boolean = false;

  /**
   * Initialize the sync service
   */
  async initialize(): Promise<void> {
    console.log('🔄 Initializing Sync Service...');
    
    // Load active app instances that need syncing
    const { data: instances, error } = await supabase
      .from('app_instances')
      .select('id, organization_id, status, last_sync_at')
      .eq('status', 'active');

    if (error) {
      console.error('Failed to load app instances:', error);
      return;
    }

    // Set up sync jobs for each active instance
    for (const instance of instances || []) {
      this.registerSyncJob({
        appInstanceId: instance.id,
        syncInterval: DEFAULT_CONFIG.syncInterval!,
        maxRetries: DEFAULT_CONFIG.maxRetries!,
        retryDelay: DEFAULT_CONFIG.retryDelay!,
      });
    }

    this.isRunning = true;
    console.log(`✅ Sync Service initialized with ${this.jobs.size} jobs`);
  }

  /**
   * Register a new sync job for an app instance
   */
  registerSyncJob(config: SyncConfig): void {
    const job: SyncJob = {
      instanceId: config.appInstanceId,
      status: 'pending',
      lastSync: null,
      nextSync: new Date(Date.now() + config.syncInterval),
      interval: config.syncInterval,
      retryCount: 0,
    };

    this.jobs.set(config.appInstanceId, job);
    this.scheduleSyncJob(config);
  }

  /**
   * Schedule a sync job to run at intervals
   */
  private scheduleSyncJob(config: SyncConfig): void {
    // Clear existing timer if any
    const existingTimer = this.timers.get(config.appInstanceId);
    if (existingTimer) {
      clearInterval(existingTimer);
    }

    // Set up new interval
    const timer = setInterval(async () => {
      await this.executeSyncJob(config);
    }, config.syncInterval);

    this.timers.set(config.appInstanceId, timer);
  }

  /**
   * Execute a sync job for an app instance
   */
  async executeSyncJob(config: SyncConfig): Promise<SyncResult> {
    const job = this.jobs.get(config.appInstanceId);
    if (!job) {
      return { success: false, recordsSynced: 0, recordsFailed: 0, error: 'Job not found', duration: 0 };
    }

    const startTime = Date.now();
    job.status = 'running';

    try {
      // Update sync status in database
      await supabase
        .from('app_instances')
        .update({ sync_status: 'syncing' })
        .eq('id', config.appInstanceId);

      // Create sync log entry
      const { data: logEntry } = await supabase
        .from('app_sync_logs')
        .insert({
          app_instance_id: config.appInstanceId,
          sync_type: 'incremental',
          status: 'started',
        })
        .select()
        .single();

      // Execute the actual sync (this would vary by app type)
      const result = await this.performSync(config.appInstanceId);

      const duration = Date.now() - startTime;

      // Update sync log
      if (logEntry) {
        await supabase
          .from('app_sync_logs')
          .update({
            status: result.success ? 'completed' : 'failed',
            records_synced: result.recordsSynced,
            records_failed: result.recordsFailed,
            error_message: result.error,
            completed_at: new Date().toISOString(),
            duration_ms: duration,
          })
          .eq('id', logEntry.id);
      }

      // Update app instance
      await supabase
        .from('app_instances')
        .update({
          sync_status: result.success ? 'synced' : 'sync_failed',
          last_sync_at: new Date().toISOString(),
          sync_error: result.error || null,
        })
        .eq('id', config.appInstanceId);

      // Update job status
      job.status = result.success ? 'completed' : 'failed';
      job.lastSync = new Date();
      job.nextSync = new Date(Date.now() + config.syncInterval);
      job.retryCount = result.success ? 0 : job.retryCount + 1;

      // Handle retry logic
      if (!result.success && job.retryCount < config.maxRetries) {
        setTimeout(() => this.executeSyncJob(config), config.retryDelay);
      }

      return { ...result, duration };
    } catch (error: any) {
      const duration = Date.now() - startTime;
      
      await supabase
        .from('app_instances')
        .update({
          sync_status: 'sync_failed',
          sync_error: error.message,
        })
        .eq('id', config.appInstanceId);

      job.status = 'failed';
      job.retryCount += 1;

      return {
        success: false,
        recordsSynced: 0,
        recordsFailed: 0,
        error: error.message,
        duration,
      };
    }
  }

  /**
   * Perform the actual data synchronization
   * This would be customized based on the app type
   */
  private async performSync(instanceId: string): Promise<SyncResult> {
    // Get app instance details
    const { data: instance } = await supabase
      .from('app_instances')
      .select(`
        *,
        business_apps (slug, display_name)
      `)
      .eq('id', instanceId)
      .single();

    if (!instance) {
      return { success: false, recordsSynced: 0, recordsFailed: 0, error: 'Instance not found', duration: 0 };
    }

    const appSlug = instance.business_apps?.slug;
    let recordsSynced = 0;
    let recordsFailed = 0;

    // Execute app-specific sync logic
    switch (appSlug) {
      case 'keys-open-doors':
        ({ recordsSynced, recordsFailed } = await this.syncKeysOpenDoors(instance));
        break;
      case 'food-truck':
        ({ recordsSynced, recordsFailed } = await this.syncFoodTruck(instance));
        break;
      case 'construction-mgmt':
        ({ recordsSynced, recordsFailed } = await this.syncConstructionMgmt(instance));
        break;
      default:
        return { success: false, recordsSynced: 0, recordsFailed: 0, error: `Unknown app: ${appSlug}`, duration: 0 };
    }

    return {
      success: recordsFailed === 0,
      recordsSynced,
      recordsFailed,
      duration: 0,
    };
  }

  /**
   * Sync Keys Open Doors app data
   */
  private async syncKeysOpenDoors(instance: any): Promise<{ recordsSynced: number; recordsFailed: number }> {
    let recordsSynced = 0;
    let recordsFailed = 0;

    try {
      // Sync scraped deals count
      const { count: dealsCount } = await supabase
        .from('scraped_deals')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', instance.organization_id);

      // Sync Instagram posts count
      const { count: postsCount } = await supabase
        .from('instagram_posts')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', instance.organization_id);

      // Update usage stats
      await supabase
        .from('app_instances')
        .update({
          usage_stats: {
            total_deals: dealsCount || 0,
            total_posts: postsCount || 0,
            last_sync: new Date().toISOString(),
          },
        })
        .eq('id', instance.id);

      recordsSynced = (dealsCount || 0) + (postsCount || 0);
    } catch (error) {
      recordsFailed = 1;
    }

    return { recordsSynced, recordsFailed };
  }

  /**
   * Sync Food Truck app data
   */
  private async syncFoodTruck(instance: any): Promise<{ recordsSynced: number; recordsFailed: number }> {
    let recordsSynced = 0;
    let recordsFailed = 0;

    try {
      // Sync orders count
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', instance.organization_id);

      // Sync today's revenue
      const today = new Date().toISOString().split('T')[0];
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total')
        .eq('organization_id', instance.organization_id)
        .gte('created_at', today)
        .eq('status', 'completed');

      const todayRevenue = todayOrders?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

      // Update usage stats
      await supabase
        .from('app_instances')
        .update({
          usage_stats: {
            total_orders: ordersCount || 0,
            today_revenue: todayRevenue,
            last_sync: new Date().toISOString(),
          },
        })
        .eq('id', instance.id);

      recordsSynced = ordersCount || 0;
    } catch (error) {
      recordsFailed = 1;
    }

    return { recordsSynced, recordsFailed };
  }

  /**
   * Sync Construction Management app data
   */
  private async syncConstructionMgmt(instance: any): Promise<{ recordsSynced: number; recordsFailed: number }> {
    let recordsSynced = 0;
    let recordsFailed = 0;

    try {
      // Sync projects count
      const { count: projectsCount } = await supabase
        .from('construction_projects')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', instance.organization_id);

      // Sync tasks count
      const { count: tasksCount } = await supabase
        .from('project_tasks')
        .select('*', { count: 'exact', head: true });

      // Sync expenses total
      const { data: expenses } = await supabase
        .from('expenses')
        .select('amount');

      const totalExpenses = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

      // Update usage stats
      await supabase
        .from('app_instances')
        .update({
          usage_stats: {
            total_projects: projectsCount || 0,
            total_tasks: tasksCount || 0,
            total_expenses: totalExpenses,
            last_sync: new Date().toISOString(),
          },
        })
        .eq('id', instance.id);

      recordsSynced = (projectsCount || 0) + (tasksCount || 0);
    } catch (error) {
      recordsFailed = 1;
    }

    return { recordsSynced, recordsFailed };
  }

  /**
   * Manually trigger a sync for an app instance
   */
  async triggerSync(instanceId: string): Promise<SyncResult> {
    const job = this.jobs.get(instanceId);
    const config: SyncConfig = {
      appInstanceId: instanceId,
      syncInterval: job?.interval || DEFAULT_CONFIG.syncInterval!,
      maxRetries: DEFAULT_CONFIG.maxRetries!,
      retryDelay: DEFAULT_CONFIG.retryDelay!,
    };

    return this.executeSyncJob(config);
  }

  /**
   * Update sync interval for an app instance
   */
  updateSyncInterval(instanceId: string, interval: number): void {
    const job = this.jobs.get(instanceId);
    if (job) {
      job.interval = interval;
      this.scheduleSyncJob({
        appInstanceId: instanceId,
        syncInterval: interval,
        maxRetries: DEFAULT_CONFIG.maxRetries!,
        retryDelay: DEFAULT_CONFIG.retryDelay!,
      });
    }
  }

  /**
   * Pause sync for an app instance
   */
  pauseSync(instanceId: string): void {
    const timer = this.timers.get(instanceId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(instanceId);
    }
    const job = this.jobs.get(instanceId);
    if (job) {
      job.status = 'pending';
    }
  }

  /**
   * Resume sync for an app instance
   */
  resumeSync(instanceId: string): void {
    const job = this.jobs.get(instanceId);
    if (job) {
      this.scheduleSyncJob({
        appInstanceId: instanceId,
        syncInterval: job.interval,
        maxRetries: DEFAULT_CONFIG.maxRetries!,
        retryDelay: DEFAULT_CONFIG.retryDelay!,
      });
    }
  }

  /**
   * Get sync status for all jobs
   */
  getSyncStatus(): SyncJob[] {
    return Array.from(this.jobs.values());
  }

  /**
   * Stop the sync service
   */
  stop(): void {
    this.isRunning = false;
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
    console.log('🛑 Sync Service stopped');
  }
}

// Export singleton instance
export const syncService = new SyncService();
export default syncService;

