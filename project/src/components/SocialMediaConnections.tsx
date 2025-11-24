import { useState } from 'react';
import { useSocial } from '../hooks/useSocial';
import { supabase } from '../lib/supabase';
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  CheckCircle,
  Plus,
  Loader2,
  Trash2
} from 'lucide-react';

const platforms = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    description: 'Connect Page'
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    description: 'Business Account'
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: Twitter,
    color: 'text-black',
    bg: 'bg-gray-50',
    description: 'Connect Profile'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    description: 'Profile or Page'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-600',
    bg: 'bg-red-50',
    description: 'Connect Channel'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    icon: () => (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
        <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z" />
      </svg>
    ),
    color: 'text-black',
    bg: 'bg-gray-50',
    description: 'Business Account'
  },
  {
    id: 'threads',
    name: 'Threads',
    icon: MessageCircle,
    color: 'text-black',
    bg: 'bg-gray-50',
    description: 'Connect Profile'
  }
];

export default function SocialMediaConnections() {
  const { accounts, loading, disconnectAccount } = useSocial();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);



  const handleConnect = async (platformId: string) => {
    setConnecting(platformId);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: platformId === 'linkedin' ? 'linkedin_oidc' : (platformId as any),
        options: {
          redirectTo: `${window.location.origin}/auth/callback?social_provider=${platformId}`,
          scopes: platformId === 'facebook' ? 'pages_manage_posts,pages_read_engagement' : undefined,
          skipBrowserRedirect: false,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error(`Error connecting to ${platformId}:`, error);
      const errorMessage = error.message || JSON.stringify(error);

      if (errorMessage.includes('provider is not enabled') || errorMessage.includes('Unsupported provider')) {
        const platformName = platforms.find(p => p.id === platformId)?.name || platformId;
        alert(`Provider Not Enabled: Please go to your Supabase Dashboard -> Authentication -> Providers and enable ${platformName}. Don't forget to enter your Client ID and Secret!`);
      } else {
        alert(`Failed to initiate connection: ${errorMessage}`);
      }
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (accountId: string) => {
    setDisconnecting(accountId);
    try {
      await disconnectAccount(accountId);
    } catch (error) {
      console.error('Error disconnecting account:', error);
    } finally {
      setDisconnecting(null);
    }
  };

  const renderIcon = (icon: any, className: string) => {
    if (typeof icon === 'function' && !icon.prototype) {
      return icon();
    }
    const IconComponent = icon;
    return <IconComponent className={className} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <div className="p-1 bg-blue-100 rounded-full">
          <Loader2 className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-blue-900">Demo Mode Active</h3>
          <p className="text-sm text-blue-700 mt-1">
            Social media connections are currently running in demo mode.
            "Connecting" an account will simulate the OAuth flow and save a mock connection to your database.
            To enable real connections, you would need to configure API keys for each platform.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Connect Networks</h2>
          <p className="text-gray-600">Select a social network to connect your account.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {platforms.map((platform) => {
            const account = accounts.find(acc => acc.platform === platform.id);
            const isConnected = !!account;
            const isConnecting = connecting === platform.id;
            const isDisconnecting = account && disconnecting === account.id;

            return (
              <div
                key={platform.id}
                className={`relative group p-4 rounded-xl border transition-all duration-200 ${isConnected
                  ? 'border-green-200 bg-green-50/30'
                  : 'border-gray-200 hover:border-blue-300 hover:shadow-md bg-white'
                  }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-lg ${platform.bg} ${platform.color} flex items-center justify-center`}>
                    {renderIcon(platform.icon, "w-5 h-5")}
                  </div>
                  {isConnected && (
                    <div className="flex items-center gap-1 text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Connected
                    </div>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900">{platform.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{isConnected ? `@${account.account_name}` : platform.description}</p>

                {isConnected ? (
                  <button
                    onClick={() => handleDisconnect(account.id)}
                    disabled={!!isDisconnecting}
                    className="w-full py-2 px-3 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition flex items-center justify-center gap-2"
                  >
                    {isDisconnecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Disconnect
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(platform.id)}
                    disabled={!!connecting}
                    className="w-full py-2 px-3 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2"
                  >
                    {isConnecting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Connect
                      </>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Connections Summary */}
      {accounts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Active Connections</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {accounts.map((account) => {
              const platform = platforms.find(p => p.id === account.platform);
              if (!platform) return null;

              return (
                <div key={account.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg ${platform.bg} ${platform.color} flex items-center justify-center`}>
                      {renderIcon(platform.icon, "w-5 h-5")}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{platform.name}</p>
                      <p className="text-sm text-gray-500">Connected as @{account.account_name}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    Added {new Date(account.created_at!).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
