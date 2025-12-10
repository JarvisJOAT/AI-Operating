/**
 * Keys Open Doors Dashboard
 * Dashboard for managing real estate deal scraping and Instagram posting
 */

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';
import { useToast } from '../contexts/ToastContext';
import {
  Home,
  Instagram,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Play,
  Image,
  MapPin,
  DollarSign,
  ExternalLink,
  Filter,
  Search,
  ChevronDown,
} from 'lucide-react';

interface ScrapedDeal {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  location: string | null;
  image_url: string | null;
  deal_url: string;
  scraped_at: string;
  status: 'new' | 'pending_review' | 'approved' | 'rejected' | 'posted' | 'post_failed';
}

interface InstagramPost {
  id: string;
  deal_id: string;
  caption: string;
  image_url: string;
  instagram_post_id: string | null;
  posted_at: string;
  status: 'pending' | 'posted' | 'failed';
}

interface ScrapingJob {
  id: string;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
}

interface DashboardStats {
  totalDeals: number;
  pendingReview: number;
  approved: number;
  posted: number;
  totalPosts: number;
  engagementRate: number;
}

const STATUS_BADGES: Record<string, { color: string; label: string }> = {
  new: { color: 'bg-blue-100 text-blue-800', label: 'New' },
  pending_review: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Review' },
  approved: { color: 'bg-green-100 text-green-800', label: 'Approved' },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
  posted: { color: 'bg-purple-100 text-purple-800', label: 'Posted' },
  post_failed: { color: 'bg-red-100 text-red-800', label: 'Post Failed' },
};

export default function KeysOpenDoorsDashboard() {
  const { currentOrganization } = useOrganization();
  const { showToast } = useToast();
  const [deals, setDeals] = useState<ScrapedDeal[]>([]);
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<ScrapedDeal | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    if (currentOrganization) {
      fetchData();
    }
  }, [currentOrganization]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch deals
      const { data: dealsData, error: dealsError } = await supabase
        .from('scraped_deals')
        .select('*')
        .eq('organization_id', currentOrganization?.id)
        .order('scraped_at', { ascending: false });

      if (dealsError) throw dealsError;

      // Fetch posts
      const { data: postsData, error: postsError } = await supabase
        .from('instagram_posts')
        .select('*')
        .eq('organization_id', currentOrganization?.id)
        .order('posted_at', { ascending: false });

      if (postsError) throw postsError;

      setDeals(dealsData || []);
      setPosts(postsData || []);

      // Calculate stats
      const allDeals = dealsData || [];
      setStats({
        totalDeals: allDeals.length,
        pendingReview: allDeals.filter(d => d.status === 'pending_review' || d.status === 'new').length,
        approved: allDeals.filter(d => d.status === 'approved').length,
        posted: allDeals.filter(d => d.status === 'posted').length,
        totalPosts: postsData?.length || 0,
        engagementRate: 4.2, // Placeholder
      });
    } catch (error) {
      showToast('Failed to load dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startScraping = async () => {
    setScraping(true);
    try {
      // Create a scraping job
      await supabase.from('scraping_jobs').insert({
        organization_id: currentOrganization?.id,
        status: 'in_progress',
        started_at: new Date().toISOString(),
      });

      showToast('Scraping job started', 'success');
      
      // Simulate scraping (in production, this would trigger the actual scraper)
      setTimeout(async () => {
        setScraping(false);
        await fetchData();
        showToast('Scraping completed', 'success');
      }, 3000);
    } catch (error) {
      setScraping(false);
      showToast('Failed to start scraping', 'error');
    }
  };

  const updateDealStatus = async (dealId: string, newStatus: string) => {
    try {
      await supabase
        .from('scraped_deals')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', dealId);

      setDeals(deals.map(d => d.id === dealId ? { ...d, status: newStatus as any } : d));
      showToast(`Deal ${newStatus}`, 'success');
    } catch (error) {
      showToast('Failed to update deal', 'error');
    }
  };

  const postToInstagram = async (deal: ScrapedDeal) => {
    try {
      // Create post record
      await supabase.from('instagram_posts').insert({
        organization_id: currentOrganization?.id,
        deal_id: deal.id,
        caption: `🏠 New Deal Alert!\n\n${deal.title}\n📍 ${deal.location}\n💰 ${deal.price}\n\nDM for details!`,
        image_url: deal.image_url || '',
        status: 'pending',
      });

      await updateDealStatus(deal.id, 'posted');
      showToast('Posted to Instagram', 'success');
      await fetchData();
    } catch (error) {
      showToast('Failed to post to Instagram', 'error');
    }
  };

  // Filter deals
  const filteredDeals = deals.filter(deal => {
    const matchesStatus = statusFilter === 'all' || deal.status === statusFilter;
    const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.location?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="w-7 h-7 text-blue-600" />
            Keys Open Doors
          </h1>
          <p className="text-gray-600 mt-1">
            Real estate deal scraping and Instagram marketing
          </p>
        </div>
        <button
          onClick={startScraping}
          disabled={scraping}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {scraping ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          {scraping ? 'Scraping...' : 'Start Scraping'}
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            icon={<Home className="w-5 h-5" />}
            label="Total Deals"
            value={stats.totalDeals}
            color="blue"
          />
          <StatCard
            icon={<Clock className="w-5 h-5" />}
            label="Pending Review"
            value={stats.pendingReview}
            color="yellow"
          />
          <StatCard
            icon={<CheckCircle className="w-5 h-5" />}
            label="Approved"
            value={stats.approved}
            color="green"
          />
          <StatCard
            icon={<Instagram className="w-5 h-5" />}
            label="Posted"
            value={stats.posted}
            color="purple"
          />
          <StatCard
            icon={<Image className="w-5 h-5" />}
            label="Total Posts"
            value={stats.totalPosts}
            color="pink"
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5" />}
            label="Engagement"
            value={`${stats.engagementRate}%`}
            color="cyan"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search deals..."
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
            <option value="new">New</option>
            <option value="pending_review">Pending Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="posted">Posted</option>
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDeals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            onApprove={() => updateDealStatus(deal.id, 'approved')}
            onReject={() => updateDealStatus(deal.id, 'rejected')}
            onPost={() => postToInstagram(deal)}
            onPreview={() => setSelectedDeal(deal)}
          />
        ))}
      </div>

      {filteredDeals.length === 0 && (
        <div className="text-center py-12">
          <Home className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No deals found</p>
          <p className="text-sm text-gray-400 mt-1">
            Start a scraping job to find new deals
          </p>
        </div>
      )}

      {/* Preview Modal */}
      {selectedDeal && (
        <PreviewModal
          deal={selectedDeal}
          onClose={() => setSelectedDeal(null)}
          onPost={() => {
            postToInstagram(selectedDeal);
            setSelectedDeal(null);
          }}
        />
      )}
    </div>
  );
}

// Helper Components
function StatCard({
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
    yellow: 'bg-yellow-100 text-yellow-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
    cyan: 'bg-cyan-100 text-cyan-600',
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

function DealCard({
  deal,
  onApprove,
  onReject,
  onPost,
  onPreview,
}: {
  deal: ScrapedDeal;
  onApprove: () => void;
  onReject: () => void;
  onPost: () => void;
  onPreview: () => void;
}) {
  const badge = STATUS_BADGES[deal.status] || STATUS_BADGES.new;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {deal.image_url ? (
          <img
            src={deal.image_url}
            alt={deal.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-12 h-12 text-gray-300" />
          </div>
        )}
        <span className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{deal.title}</h3>
        
        {deal.location && (
          <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
            <MapPin className="w-4 h-4" />
            <span className="line-clamp-1">{deal.location}</span>
          </div>
        )}
        
        {deal.price && (
          <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
            <DollarSign className="w-4 h-4" />
            <span>{deal.price}</span>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-2">
          Scraped {new Date(deal.scraped_at).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-2">
        {(deal.status === 'new' || deal.status === 'pending_review') && (
          <>
            <button
              onClick={onApprove}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={onReject}
              className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </>
        )}
        {deal.status === 'approved' && (
          <button
            onClick={onPost}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm"
          >
            <Instagram className="w-4 h-4" />
            Post to Instagram
          </button>
        )}
        <button
          onClick={onPreview}
          className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Eye className="w-4 h-4" />
        </button>
        <a
          href={deal.deal_url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

function PreviewModal({
  deal,
  onClose,
  onPost,
}: {
  deal: ScrapedDeal;
  onClose: () => void;
  onPost: () => void;
}) {
  const caption = `🏠 New Deal Alert!\n\n${deal.title}\n📍 ${deal.location || 'Location TBD'}\n💰 ${deal.price || 'Price TBD'}\n\n🔥 Great investment opportunity!\n📲 DM for details!\n\n#realestate #investment #wholesale #property`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Instagram Preview</h2>
          
          {/* Phone mockup */}
          <div className="bg-gray-900 rounded-3xl p-4 mx-auto max-w-xs">
            <div className="bg-white rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-2 p-3 border-b">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full" />
                <span className="font-semibold text-sm">keys_open_doors</span>
              </div>
              
              {/* Image */}
              <div className="aspect-square bg-gray-100">
                {deal.image_url ? (
                  <img src={deal.image_url} alt={deal.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>
              
              {/* Caption */}
              <div className="p-3">
                <p className="text-sm whitespace-pre-line">{caption}</p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onPost}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors"
            >
              <Instagram className="w-4 h-4" />
              Post Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

