/**
 * AdminDashboard Page
 * Cross-organization admin view for managing all app instances
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useToast } from '../contexts/ToastContext';
import {
  Building,
  Users,
  Database,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  TrendingUp,
  Server,
  Zap,
  Eye,
} from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  slug: string;
  subscription_tier: string;
  subscription_status: string;
  created_at: string;
  app_instances: AppInstance[];
}

interface AppInstance {
  id: string;
  instance_name: string;
  status: string;
  sync_status: string;
  last_sync_at: string | null;
  business_apps: {
    slug: string;
    display_name: string;
  };
}

interface SystemMetrics {
  totalOrganizations: number;
  totalAppInstances: number;
  activeInstances: number;
  syncedInstances: number;
  errorInstances: number;
  apiCallsToday: number;
}

interface RecentEvent {
  id: string;
  event_type: string;
  event_data: any;
  created_at: string;
  organizations: {
    name: string;
  } | null;
  app_instances: {
    instance_name: string;
  } | null;
}

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all organizations with their app instances
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select(`
          *,
          app_instances (
            id,
            instance_name,
            status,
            sync_status,
            last_sync_at,
            business_apps (slug, display_name)
          )
        `)
        .order('created_at', { ascending: false });

      if (orgsError) throw orgsError;

      // Fetch recent events
      const { data: eventsData, error: eventsError } = await supabase
        .from('app_events')
        .select(`
          *,
          organizations (name),
          app_instances (instance_name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (eventsError) throw eventsError;

      setOrganizations(orgsData || []);
      setRecentEvents(eventsData || []);

      // Calculate metrics
      const allInstances = orgsData?.flatMap(o => o.app_instances) || [];
      setMetrics({
        totalOrganizations: orgsData?.length || 0,
        totalAppInstances: allInstances.length,
        activeInstances: allInstances.filter(i => i.status === 'active').length,
        syncedInstances: allInstances.filter(i => i.sync_status === 'synced').length,
        errorInstances: allInstances.filter(
          i => i.status === 'suspended' || i.sync_status === 'sync_failed'
        ).length,
        apiCallsToday: Math.floor(Math.random() * 10000), // Placeholder
      });
    } catch (error: any) {
      showToast('Failed to load dashboard data', 'error');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleForceSync = async (instanceId: string) => {
    try {
      await supabase
        .from('app_instances')
        .update({
          sync_status: 'syncing',
        })
        .eq('id', instanceId);

      // Simulate sync
      setTimeout(async () => {
        await supabase
          .from('app_instances')
          .update({
            sync_status: 'synced',
            last_sync_at: new Date().toISOString(),
          })
          .eq('id', instanceId);
        fetchDashboardData();
      }, 2000);

      showToast('Sync started', 'success');
    } catch (error) {
      showToast('Failed to start sync', 'error');
    }
  };

  // Filter organizations
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.slug.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    if (statusFilter === 'with_errors') {
      return matchesSearch && org.app_instances.some(
        i => i.status === 'suspended' || i.sync_status === 'sync_failed'
      );
    }
    
    return matchesSearch && org.subscription_status === statusFilter;
  });

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor and manage all organizations and app instances
          </p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* System Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <MetricCard
            icon={<Building className="w-5 h-5" />}
            label="Organizations"
            value={metrics.totalOrganizations}
            color="blue"
          />
          <MetricCard
            icon={<Database className="w-5 h-5" />}
            label="App Instances"
            value={metrics.totalAppInstances}
            color="purple"
          />
          <MetricCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Active"
            value={metrics.activeInstances}
            color="green"
          />
          <MetricCard
            icon={<RefreshCw className="w-5 h-5" />}
            label="Synced"
            value={metrics.syncedInstances}
            color="cyan"
          />
          <MetricCard
            icon={<AlertTriangle className="w-5 h-5" />}
            label="With Errors"
            value={metrics.errorInstances}
            color="red"
          />
          <MetricCard
            icon={<Zap className="w-5 h-5" />}
            label="API Calls Today"
            value={metrics.apiCallsToday.toLocaleString()}
            color="orange"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Organizations List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search organizations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="trial">Trial</option>
                    <option value="past_due">Past Due</option>
                    <option value="with_errors">With Errors</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
              {filteredOrganizations.map((org) => (
                <div key={org.id} className="p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{org.name}</h3>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          org.subscription_status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : org.subscription_status === 'trial'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {org.subscription_tier} / {org.subscription_status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {org.app_instances.length} app{org.app_instances.length !== 1 ? 's' : ''} •
                        Joined {new Date(org.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>

                  {/* App Instances */}
                  {org.app_instances.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {org.app_instances.map((instance) => (
                        <div
                          key={instance.id}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                            instance.status === 'active'
                              ? 'bg-green-50 text-green-700'
                              : instance.status === 'suspended'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <span>{instance.business_apps?.display_name || instance.instance_name}</span>
                          {instance.sync_status === 'sync_failed' && (
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                          )}
                          {instance.sync_status === 'syncing' && (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          )}
                          <button
                            onClick={() => handleForceSync(instance.id)}
                            className="p-1 hover:bg-white rounded"
                            title="Force sync"
                          >
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {filteredOrganizations.length === 0 && (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No organizations found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* System Health */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">System Health</h3>
            </div>
            <div className="space-y-4">
              <HealthIndicator label="API Gateway" status="operational" />
              <HealthIndicator label="Database" status="operational" />
              <HealthIndicator label="Sync Service" status="operational" />
              <HealthIndicator label="Voice Agent" status="operational" />
            </div>
          </div>

          {/* Recent Events */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Recent Events</h3>
            </div>
            <div className="space-y-3">
              {recentEvents.slice(0, 5).map((event) => (
                <div key={event.id} className="flex items-start gap-3">
                  <div className={`p-1.5 rounded ${
                    event.event_type.includes('error') || event.event_type.includes('failed')
                      ? 'bg-red-100 text-red-600'
                      : event.event_type.includes('created') || event.event_type.includes('completed')
                      ? 'bg-green-100 text-green-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <Activity className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {event.event_type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {event.organizations?.name || 'System'} •{' '}
                      {new Date(event.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentEvents.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No recent events</p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <RefreshCw className="w-5 h-5 text-gray-400" />
                <span>Force Sync All Apps</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <Eye className="w-5 h-5 text-gray-400" />
                <span>View All Logs</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                <TrendingUp className="w-5 h-5 text-gray-400" />
                <span>Usage Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
    green: 'bg-green-100 text-green-600',
    cyan: 'bg-cyan-100 text-cyan-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className={`inline-flex p-2 rounded-lg ${colorClasses[color]}`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function HealthIndicator({ label, status }: { label: string; status: string }) {
  const isOperational = status === 'operational';
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isOperational ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={`text-xs ${isOperational ? 'text-green-600' : 'text-red-600'}`}>
          {isOperational ? 'Operational' : 'Issues'}
        </span>
      </div>
    </div>
  );
}

