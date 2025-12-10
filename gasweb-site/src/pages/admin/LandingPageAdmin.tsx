/**
 * Landing Page Admin Component
 * 
 * Admin interface for managing landing page links, videos,
 * theme customization, and viewing analytics.
 * 
 * @module pages/admin/LandingPageAdmin
 */

import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  GripVertical,
  Save,
  Eye,
  BarChart3,
  Link as LinkIcon,
  Video,
  Palette,
  Settings,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Check,
} from 'lucide-react';

/**
 * Link item type for admin management
 */
interface LinkItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  icon: string;
  iconType: 'lucide' | 'url' | 'emoji';
  linkType: 'website' | 'social' | 'custom' | 'email' | 'phone';
  isFeatured: boolean;
  isActive: boolean;
  orderIndex: number;
  clickCount: number;
}

/**
 * Video item type
 */
interface VideoItem {
  id: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  videoType: 'youtube' | 'vimeo' | 'hosted';
  isActive: boolean;
  orderIndex: number;
  playCount: number;
}

/**
 * Theme settings type
 */
interface ThemeSettings {
  backgroundColor: string;
  accentColor: string;
  fontFamily: string;
  layout: 'standard' | 'compact' | 'expanded';
  showSocialIcons: boolean;
  showVideos: boolean;
  darkMode: boolean;
}

/**
 * Sample data for demonstration
 */
const sampleLinks: LinkItem[] = [
  {
    id: '1',
    title: 'GasWeb Website',
    url: 'https://gasweb.info',
    description: 'Our main website',
    icon: 'Globe',
    iconType: 'lucide',
    linkType: 'website',
    isFeatured: true,
    isActive: true,
    orderIndex: 0,
    clickCount: 245,
  },
  {
    id: '2',
    title: 'Free Courses',
    url: '/education',
    description: 'Learn AI automation',
    icon: 'Play',
    iconType: 'lucide',
    linkType: 'website',
    isFeatured: false,
    isActive: true,
    orderIndex: 1,
    clickCount: 189,
  },
];

const sampleVideos: VideoItem[] = [
  {
    id: '1',
    title: 'Introduction to GasWeb',
    videoUrl: 'https://youtube.com/watch?v=example',
    videoType: 'youtube',
    isActive: true,
    orderIndex: 0,
    playCount: 156,
  },
];

const defaultTheme: ThemeSettings = {
  backgroundColor: '#0f172a',
  accentColor: '#3b82f6',
  fontFamily: 'Inter',
  layout: 'standard',
  showSocialIcons: true,
  showVideos: true,
  darkMode: true,
};

/**
 * Landing Page Admin Component
 * 
 * @returns {JSX.Element} The admin panel
 */
export default function LandingPageAdmin(): JSX.Element {
  const [activeTab, setActiveTab] = useState<'links' | 'videos' | 'theme' | 'analytics'>('links');
  const [links, setLinks] = useState<LinkItem[]>(sampleLinks);
  const [videos, setVideos] = useState<VideoItem[]>(sampleVideos);
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Tab configuration
  const tabs = [
    { id: 'links', label: 'Links', icon: LinkIcon },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'theme', label: 'Theme', icon: Palette },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ] as const;

  /**
   * Handle link deletion
   */
  const handleDeleteLink = (id: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
      setLinks(links.filter(l => l.id !== id));
    }
  };

  /**
   * Handle link toggle active
   */
  const handleToggleLinkActive = (id: string) => {
    setLinks(links.map(l => 
      l.id === id ? { ...l, isActive: !l.isActive } : l
    ));
  };

  /**
   * Handle video deletion
   */
  const handleDeleteVideo = (id: string) => {
    if (confirm('Are you sure you want to delete this video?')) {
      setVideos(videos.filter(v => v.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Landing Page Admin</h1>
              <p className="text-slate-500 text-sm">Manage your link hub</p>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="/links" 
                target="_blank"
                className="btn-secondary flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Preview
              </a>
              <button className="btn-primary flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Links Tab */}
        {activeTab === 'links' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">Manage Links</h2>
              <button 
                onClick={() => setIsAddingNew(true)}
                className="btn-primary"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Link
              </button>
            </div>

            {/* Links List */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {links.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No links added yet. Click "Add Link" to get started.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {links.map((link) => (
                    <li 
                      key={link.id}
                      className="p-4 flex items-center gap-4 hover:bg-slate-50"
                    >
                      <button className="text-slate-400 hover:text-slate-600 cursor-grab">
                        <GripVertical className="w-5 h-5" />
                      </button>
                      
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-medium ${link.isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                            {link.title}
                          </h3>
                          {link.isFeatured && (
                            <span className="px-2 py-0.5 bg-accent-100 text-accent-700 text-xs rounded-full">
                              Featured
                            </span>
                          )}
                          {!link.isActive && (
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-full">
                              Hidden
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <span>{link.url}</span>
                          <span>•</span>
                          <span>{link.clickCount} clicks</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleToggleLinkActive(link.id)}
                          className={`p-2 rounded-lg ${
                            link.isActive 
                              ? 'bg-green-100 text-green-600' 
                              : 'bg-slate-100 text-slate-400'
                          }`}
                          title={link.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {link.isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                        <button 
                          onClick={() => setEditingLink(link)}
                          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-primary-100 hover:text-primary-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-slate-900">Manage Videos</h2>
              <button className="btn-primary">
                <Plus className="w-4 h-4 mr-2" />
                Add Video
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {videos.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  No videos added yet. Click "Add Video" to get started.
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {videos.map((video) => (
                    <li key={video.id} className="p-4 flex items-center gap-4">
                      <div className="w-32 h-20 bg-slate-200 rounded-lg flex items-center justify-center">
                        <Video className="w-8 h-8 text-slate-400" />
                      </div>
                      <div className="flex-grow">
                        <h3 className="font-medium text-slate-900">{video.title}</h3>
                        <p className="text-sm text-slate-500">{video.playCount} plays</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-primary-100">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteVideo(video.id)}
                          className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-red-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* Theme Tab */}
        {activeTab === 'theme' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Appearance</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Background Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={theme.backgroundColor}
                        onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.backgroundColor}
                        onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
                        className="input-field flex-grow"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Accent Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={theme.accentColor}
                        onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={theme.accentColor}
                        onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                        className="input-field flex-grow"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Layout
                    </label>
                    <select
                      value={theme.layout}
                      onChange={(e) => setTheme({ ...theme, layout: e.target.value as ThemeSettings['layout'] })}
                      className="input-field"
                    >
                      <option value="standard">Standard</option>
                      <option value="compact">Compact</option>
                      <option value="expanded">Expanded</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Display Options</h2>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={theme.showSocialIcons}
                      onChange={(e) => setTheme({ ...theme, showSocialIcons: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-slate-700">Show social media icons</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={theme.showVideos}
                      onChange={(e) => setTheme({ ...theme, showVideos: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-slate-700">Show video section</span>
                  </label>
                  
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={theme.darkMode}
                      onChange={(e) => setTheme({ ...theme, darkMode: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-300"
                    />
                    <span className="text-slate-700">Dark mode</span>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Preview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Preview</h2>
              <div 
                className="rounded-lg overflow-hidden aspect-[9/16] max-h-[500px]"
                style={{ backgroundColor: theme.backgroundColor }}
              >
                <div className="p-6 text-center">
                  <div 
                    className="w-16 h-16 rounded-full mx-auto mb-3"
                    style={{ backgroundColor: theme.accentColor }}
                  />
                  <div className="text-white font-bold mb-4">GasWeb</div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div 
                        key={i}
                        className="p-3 rounded-lg bg-white/10 text-white text-sm"
                      >
                        Link {i}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: 'Total Views', value: '1,234', change: '+12%' },
                { label: 'Link Clicks', value: '456', change: '+8%' },
                { label: 'Video Plays', value: '89', change: '+15%' },
                { label: 'Conversion Rate', value: '3.7%', change: '+2%' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-slate-500 text-sm">{stat.label}</p>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-bold text-slate-900">{stat.value}</span>
                    <span className="text-green-600 text-sm">{stat.change}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Top Performing Links</h2>
              <div className="space-y-3">
                {links
                  .sort((a, b) => b.clickCount - a.clickCount)
                  .map((link, index) => (
                    <div key={link.id} className="flex items-center gap-4">
                      <span className="text-lg font-bold text-slate-300 w-6">{index + 1}</span>
                      <div className="flex-grow">
                        <p className="font-medium text-slate-900">{link.title}</p>
                        <p className="text-sm text-slate-500">{link.url}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900">{link.clickCount}</p>
                        <p className="text-xs text-slate-500">clicks</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

