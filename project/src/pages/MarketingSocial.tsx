import { useState } from 'react';
import { Mail, Share2, Plus, X, Send, Loader2 } from 'lucide-react';
import SocialMediaConnections from '../components/SocialMediaConnections';
import { useCampaigns } from '../hooks/useCampaigns';
import { useSocial } from '../hooks/useSocial';
import { useToast } from '../contexts/ToastContext';

type TabType = 'campaigns' | 'social';

export default function MarketingSocial() {
  const [activeTab, setActiveTab] = useState<TabType>('campaigns');
  const { campaigns, loading: campaignsLoading, createCampaign, sendCampaign } = useCampaigns();
  const { posts, loading: socialLoading, createPost } = useSocial();
  const { addToast } = useToast();
  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleSendCampaign = async (id: string) => {
    setSendingId(id);
    try {
      await sendCampaign(id);
      addToast('success', 'Campaign sent successfully!');
    } catch (error) {
      addToast('error', 'Failed to send campaign');
    } finally {
      setSendingId(null);
    }
  };

  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    description: '',
    audience: 'all',
    sendDate: '',
    campaign_type: 'email' as const
  });

  const [socialForm, setSocialForm] = useState({
    content: '',
    scheduledDate: ''
  });

  const handleCreateCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject) return;
    setCreating(true);
    try {
      await createCampaign({
        name: campaignForm.name,
        description: campaignForm.description,
        campaign_type: campaignForm.campaign_type,
        scheduled_at: campaignForm.sendDate ? new Date(campaignForm.sendDate).toISOString() : undefined,
        settings: { subject: campaignForm.subject, audience: campaignForm.audience }
      });
      setShowCampaignModal(false);
      setCampaignForm({ name: '', subject: '', description: '', audience: 'all', sendDate: '', campaign_type: 'email' });
      addToast('success', 'Campaign created successfully!');
    } catch (error) {
      console.error('Failed to create campaign:', error);
      addToast('error', 'Failed to create campaign');
    } finally {
      setCreating(false);
    }
  };

  const handleCreatePost = async () => {
    if (!socialForm.content) return;
    setCreating(true);
    try {
      await createPost({
        content: socialForm.content,
        scheduled_at: socialForm.scheduledDate ? new Date(socialForm.scheduledDate).toISOString() : undefined
      });
      setShowSocialModal(false);
      setSocialForm({ content: '', scheduledDate: '' });
      addToast('success', 'Social post created successfully!');
    } catch (error) {
      console.error('Failed to create post:', error);
      addToast('error', 'Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  const tabs = [
    { id: 'campaigns' as const, name: 'Campaigns & Marketing', icon: Mail },
    { id: 'social' as const, name: 'Social Media', icon: Share2 },
  ];

  if (campaignsLoading || socialLoading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Mail className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900">Marketing & Social Media</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <Icon
                  className={`-ml-0.5 mr-2 h-5 w-5 ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'campaigns' && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Marketing Campaigns</h2>
              <p className="text-sm text-gray-600">Create and manage email campaigns and marketing automation</p>
            </div>
            <button
              onClick={() => setShowCampaignModal(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              New Campaign
            </button>
          </div>

          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Total Campaigns</h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">{campaigns.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Active</h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {campaigns.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Scheduled</h3>
              <p className="text-3xl font-bold text-gray-900 mb-2">
                {campaigns.filter(c => c.status === 'scheduled').length}
              </p>
            </div>
          </div>

          {/* Campaigns List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {campaigns.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No campaigns found. Create one to get started.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">{campaign.campaign_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(campaign.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => handleSendCampaign(campaign.id)}
                            disabled={sendingId === campaign.id}
                            className="text-blue-600 hover:text-blue-900 disabled:opacity-50 flex items-center gap-1 ml-auto"
                          >
                            {sendingId === campaign.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                            Send
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {activeTab === 'social' && (
        <div className="space-y-8">
          <SocialMediaConnections />

          <div className="border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Social Media Management</h2>
                <p className="text-sm text-gray-600">Schedule posts and manage social media accounts</p>
              </div>
              <button
                onClick={() => setShowSocialModal(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                New Post
              </button>
            </div>

            {/* Social Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Total Posts</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">{posts.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Scheduled</h3>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {posts.filter(p => p.status === 'scheduled').length}
                </p>
              </div>
            </div>

            {/* Posts List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {posts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No social posts found.</div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {posts.map((post) => (
                    <div key={post.id} className="p-6 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-gray-900 mb-2">{post.content}</p>
                          <div className="flex gap-2 text-sm text-gray-500">
                            <span>{post.status}</span>
                            <span>•</span>
                            <span>{new Date(post.created_at || new Date()).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}



      {/* Campaign Creation Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Create Campaign</h2>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                <input
                  type="text"
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="e.g., Summer Sale"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                <input
                  type="text"
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  placeholder="Subject..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date (Optional)</label>
                <input
                  type="date"
                  value={campaignForm.sendDate}
                  onChange={(e) => setCampaignForm({ ...campaignForm, sendDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>

              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowCampaignModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCampaign}
                  disabled={creating || !campaignForm.name}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Campaign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Social Creation Modal */}
      {showSocialModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">New Social Post</h2>
              <button onClick={() => setShowSocialModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={socialForm.content}
                  onChange={(e) => setSocialForm({ ...socialForm, content: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                  rows={4}
                  placeholder="What's on your mind?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Schedule (Optional)</label>
                <input
                  type="datetime-local"
                  value={socialForm.scheduledDate}
                  onChange={(e) => setSocialForm({ ...socialForm, scheduledDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowSocialModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg">Cancel</button>
                <button onClick={handleCreatePost} disabled={creating || !socialForm.content} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg flex justify-center items-center">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
