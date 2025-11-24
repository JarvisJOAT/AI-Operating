import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';
import { useSocial } from '../hooks/useSocial';
import { useOrganization } from '../contexts/OrganizationContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { connectAccount } = useSocial();
  const { currentOrganization, loading: orgLoading } = useOrganization();
  const searchParams = new URLSearchParams(window.location.search);
  const socialProvider = searchParams.get('social_provider');

  useEffect(() => {
    console.log('AuthCallback effect running', { orgLoading, socialProvider });
    const handleCallback = async () => {
      if (orgLoading) {
        console.log('Waiting for org to load...');
        return;
      }

      try {
        console.log('Getting session...');
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/login');
          return;
        }

        if (data.session) {
          console.log('Session found', { user: data.session.user.id });
          // If this was a social connection flow
          if (socialProvider) {
            console.log('Processing social connection for:', socialProvider);

            if (!currentOrganization) {
              console.error('No organization selected');
              alert('Failed to connect: No organization selected. Please select an organization first.');
              navigate('/dashboard');
              return;
            }

            try {
              await connectAccount({
                platform: socialProvider,
                account_name: data.session.user.user_metadata.full_name || data.session.user.email || 'Connected Account',
                account_id: data.session.user.id, // Note: This uses Supabase ID. Ideally should use provider ID from identities.
                access_token: data.session.provider_token || undefined,
                refresh_token: data.session.provider_refresh_token || undefined,
                token_expires_at: data.session.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : undefined,
                metadata: data.session.user.user_metadata
              });
              navigate('/marketing-social');
            } catch (connError: any) {
              console.error('Failed to save connection:', connError);
              alert(`Failed to save connection: ${connError.message}`);
              navigate('/marketing-social'); // Go back anyway
            }
          } else {
            // Normal login
            console.log('Normal login, redirecting to dashboard');
            navigate('/dashboard');
          }
        } else {
          console.log('No session found, redirecting to login');
          navigate('/login');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, socialProvider, connectAccount, currentOrganization, orgLoading]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
}
