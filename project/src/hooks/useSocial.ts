import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';

export interface SocialPost {
  id: string;
  organization_id: string;
  account_ids: string[] | null;
  content: string;
  media_urls: string[] | null;
  status: string | null;
  scheduled_at: string | null;
  published_at: string | null;
  metrics: any;
  created_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SocialMediaAccount {
  id: string;
  organization_id: string;
  platform: string | null;
  account_name: string;
  account_id: string | null;
  access_token: string | null;
  refresh_token: string | null;
  token_expires_at: string | null;
  is_active: boolean | null;
  metadata: any;
  connected_by: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useSocial() {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [accounts, setAccounts] = useState<SocialMediaAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    if (!currentOrganization) {
      setPosts([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('social_media_posts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching social posts:', error);
    }
  }, [currentOrganization]);

  const fetchAccounts = useCallback(async () => {
    if (!currentOrganization) {
      setAccounts([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('social_media_accounts')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error('Error fetching social accounts:', error);
    }
  }, [currentOrganization]);

  const refreshAccounts = useCallback(async () => {
    await fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    const loadData = async () => {
      if (!currentOrganization) {
        setPosts([]);
        setAccounts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      await Promise.all([fetchPosts(), fetchAccounts()]);
      setLoading(false);
    };

    loadData();
  }, [currentOrganization, fetchPosts, fetchAccounts]);

  const createPost = async (postData: {
    content: string;
    scheduled_at?: string;
    media_urls?: string[];
  }) => {
    if (!currentOrganization || !user) {
      throw new Error('No organization or user selected');
    }

    try {
      const { data, error } = await supabase
        .from('social_media_posts')
        .insert({
          organization_id: currentOrganization.id,
          content: postData.content,
          scheduled_at: postData.scheduled_at || null,
          media_urls: postData.media_urls || [],
          status: postData.scheduled_at ? 'scheduled' : 'draft',
          created_by: user.id,
          account_ids: [] // Placeholder for future account selection
        })
        .select()
        .single();

      if (error) throw error;
      await fetchPosts();
      return data;
    } catch (error) {
      console.error('Error creating social post:', error);
      throw error;
    }
  };

  const connectAccount = async (accountData: {
    platform: string;
    account_name: string;
    account_id: string;
    access_token?: string;
    refresh_token?: string;
    token_expires_at?: string;
    metadata?: any;
  }) => {
    if (!currentOrganization || !user) {
      throw new Error('No organization or user selected');
    }

    try {
      const { data, error } = await supabase
        .from('social_media_accounts')
        .upsert({
          organization_id: currentOrganization.id,
          platform: accountData.platform,
          account_name: accountData.account_name,
          account_id: accountData.account_id,
          access_token: accountData.access_token || null,
          refresh_token: accountData.refresh_token || null,
          token_expires_at: accountData.token_expires_at || null,
          metadata: accountData.metadata || {},
          connected_by: user.id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAccounts();
      return data;
    } catch (error) {
      console.error('Error connecting social account:', error);
      throw error;
    }
  };

  const disconnectAccount = async (accountId: string) => {
    if (!currentOrganization) {
      throw new Error('No organization selected');
    }

    try {
      const { error } = await supabase
        .from('social_media_accounts')
        .delete()
        .eq('id', accountId)
        .eq('organization_id', currentOrganization.id);

      if (error) throw error;
      await fetchAccounts();
    } catch (error) {
      console.error('Error disconnecting social account:', error);
      throw error;
    }
  };

  return {
    posts,
    accounts,
    loading,
    createPost,
    connectAccount,
    disconnectAccount,
    refetchPosts: fetchPosts,
    refetchAccounts: refreshAccounts
  };
}
