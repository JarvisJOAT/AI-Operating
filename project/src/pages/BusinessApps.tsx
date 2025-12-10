/**
 * BusinessApps Page
 * Overview dashboard for managing business application instances
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';
import { useToast } from '../contexts/ToastContext';
import {
  Building2,
  Utensils,
  HardHat,
  RefreshCw,
  Settings,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  Activity,
  Database,
} from 'lucide-react';

interface BusinessApp {
  id: string;
  name: string;
  slug: string;
  display_name: string;
  description: string;
  category: string;
  icon_url: string | null;
  features: string[];
  is_active: boolean;
}

interface AppInstance {
  id: string;
  organization_id: string;
  app_id: string;
  instance_name: string;
  status: string;
  deployment_url: string | null;
  last_sync_at: string | null;
  sync_status: string;
  usage_stats: {
    api_calls_today?: number;
    storage_used_mb?: number;
    active_users?: number;
  };
  activated_at: string | null;
  created_at: string;
  business_apps: BusinessApp;
}

const APP_ICONS: Record<string, React.ReactNode> = {
  'keys-open-doors': <Building2 className="w-8 h-8" />,
  'food-truck': <Utensils className="w-8 h-8" />,
  'construction-mgmt': <HardHat className="w-8 h-8" />,
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  pending_setup: 'bg-blue-100 text-blue-800',
  suspended: 'bg-red-100 text-red-800',
  archived: 'bg-gray-100 text-gray-800',
};

const SYNC_STATUS_ICONS: Record<string, React.ReactNode> = {
  synced: <CheckCircle className="w-4 h-4 text-green-500" />,
  syncing: <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />,
  sync_failed: <AlertCircle className="w-4 h-4 text-red-500" />,
  never_synced: <Clock className="w-4 h-4 text-gray-400" />,
};

export default function BusinessApps() {
  const { currentOrganization } = useOrganization();
  const { showToast } = useToast();
  const [instances, setInstances] = useState<AppInstance[]>([]);
  const [availableApps, setAvailableApps] = useState<BusinessApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);

  useEffect(() => {
    if (currentOrganization) {
      fetchData();
    }
  }, [currentOrganization]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch app instances for this organization
      const { data: instanceData, error: instanceError } = await supabase
        .from('app_instances')
        .select(`
          *,
          business_apps (*)
        `)
        .eq('organization_id', currentOrganization?.id);

      if (instanceError) throw instanceError;

      // Fetch all available apps
      const { data: appsData, error: appsError } = await supabase
        .from('business_apps')
        .select('*')
        .eq('is_active', true);

      if (appsError) throw appsError;

      setInstances(instanceData || []);
      setAvailableApps(appsData || []);
    } catch (error: any) {
      showToast('Failed to load business apps', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (instanceId: string) => {
    setSyncing(instanceId);
    try {
      // Update sync status
      await supabase
        .from('app_instances')
        .update({ sync_status: 'syncing' })
        .eq('id', instanceId);

      // Simulate sync (in production, this would call the actual sync service)
      await new Promise(resolve => setTimeout(resolve, 2000));

      await supabase
        .from('app_instances')
        .update({
          sync_status: 'synced',
          last_sync_at: new Date().toISOString(),
        })
        .eq('id', instanceId);

      showToast('Sync completed successfully', 'success');
      fetchData();
    } catch (error: any) {
      showToast('Sync failed', 'error');
    } finally {
      setSyncing(null);
    }
  };

  const handleStatusChange = async (instanceId: string, newStatus: string) => {
    try {
      await supabase
        .from('app_instances')
        .update({ status: newStatus })
        .eq('id', instanceId);

      showToast(`Status updated to ${newStatus}`, 'success');
      fetchData();
    } catch (error: any) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleAddApp = async (appId: string) => {
    try {
      const app = availableApps.find(a => a.id === appId);
      
      await supabase.from('app_instances').insert({
        organization_id: currentOrganization?.id,
        app_id: appId,
        instance_name: `${app?.display_name || 'New App'} Instance`,
        status: 'pending_setup',
      });

      showToast('App added successfully', 'success');
      fetchData();
    } catch (error: any) {
      showToast('Failed to add app', 'error');
    }
  };

  // Get apps that aren't already installed
  const installedAppIds = instances.map(i => i.app_id);
  const uninstalledApps = availableApps.filter(a => !installedAppIds.includes(a.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Business Apps</h1>
        <p className="text-gray-600 mt-1">
          Manage your business application instances and configurations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{instances.length}</p>
              <p className="text-sm text-gray-500">Total Apps</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {instances.filter(i => i.status === 'active').length}
              </p>
              <p className="text-sm text-gray-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {instances.reduce((sum, i) => sum + (i.usage_stats?.api_calls_today || 0), 0)}
              </p>
              <p className="text-sm text-gray-500">API Calls Today</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {instances.filter(i => i.sync_status === 'synced').length}
              </p>
              <p className="text-sm text-gray-500">Synced</p>
            </div>
          </div>
        </div>
      </div>

      {/* Installed Apps */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Apps</h2>
        
        {instances.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
            <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No apps installed yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Get started by adding an app from the available apps below
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {instances.map((instance) => (
              <div
                key={instance.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                        {APP_ICONS[instance.business_apps.slug] || <Database className="w-8 h-8" />}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {instance.instance_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {instance.business_apps.display_name}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        STATUS_COLORS[instance.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {instance.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-4">
                    {instance.business_apps.description}
                  </p>

                  {/* Features */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {instance.business_apps.features?.slice(0, 3).map((feature, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Sync Status */}
                  <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                    {SYNC_STATUS_ICONS[instance.sync_status]}
                    <span>
                      {instance.last_sync_at
                        ? `Last synced ${new Date(instance.last_sync_at).toLocaleString()}`
                        : 'Never synced'}
                    </span>
                  </div>

                  {/* Usage Stats */}
                  {instance.status === 'active' && (
                    <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">API Calls</p>
                        <p className="font-semibold text-gray-900">
                          {instance.usage_stats?.api_calls_today || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Storage</p>
                        <p className="font-semibold text-gray-900">
                          {instance.usage_stats?.storage_used_mb || 0} MB
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Active Users</p>
                        <p className="font-semibold text-gray-900">
                          {instance.usage_stats?.active_users || 0}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSync(instance.id)}
                      disabled={syncing === instance.id}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${syncing === instance.id ? 'animate-spin' : ''}`} />
                      Sync
                    </button>
                    {instance.status === 'active' ? (
                      <button
                        onClick={() => handleStatusChange(instance.id, 'paused')}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-lg transition-colors"
                      >
                        <Pause className="w-4 h-4" />
                        Pause
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange(instance.id, 'active')}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-green-600 hover:text-green-800 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <Play className="w-4 h-4" />
                        Activate
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors">
                      <Settings className="w-4 h-4" />
                      Configure
                    </button>
                    {instance.deployment_url && (
                      <a
                        href={instance.deployment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                        Open
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Apps */}
      {uninstalledApps.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Apps</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {uninstalledApps.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                    {APP_ICONS[app.slug] || <Database className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{app.display_name}</h3>
                    <p className="text-xs text-gray-500 capitalize">{app.category}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{app.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {app.features?.slice(0, 2).map((feature, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleAddApp(app.id)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Add to Organization
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

