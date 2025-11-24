import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  subscription_tier: string;
  subscription_status: string;
}

interface OrganizationMember {
  id: string;
  organization_id: string;
  user_id: string;
  role: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  memberRole: string | null;
  loading: boolean;
  switchOrganization: (orgId: string) => void;
  refetchOrganizations: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [memberRole, setMemberRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ... (createDefaultOrganization remains same)

  const fetchOrganizations = async () => {
    if (authLoading) return; // Wait for auth to load

    if (!user) {
      console.log('Organization: No user, resetting state');
      setOrganizations([]);
      setCurrentOrganization(null);
      setLoading(false);
      return;
    }

    console.log('Organization: Fetching organizations for user:', user.id);

    try {
      let { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id, role')
        .eq('user_id', user.id);

      console.log('Organization: Member query result:', { memberData, memberError });

      if (memberError) throw memberError;

      // If user has no organization membership, create a default one
      if (!memberData || memberData.length === 0) {
        try {
          await createDefaultOrganization();
          // Refetch after creating the organization
          const { data: newMemberData, error: newMemberError } = await supabase
            .from('organization_members')
            .select('organization_id, role')
            .eq('user_id', user.id);

          if (newMemberError) throw newMemberError;
          memberData = newMemberData;
        } catch (createError) {
          console.error('Error creating default organization:', createError);
          setOrganizations([]);
          setCurrentOrganization(null);
          setLoading(false);
          return;
        }
      }

      if (!memberData || memberData.length === 0) {
        setOrganizations([]);
        setCurrentOrganization(null);
        setLoading(false);
        return;
      }

      const orgIds = memberData.map(m => m.organization_id);
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds);

      if (orgsError) throw orgsError;

      setOrganizations(orgsData || []);

      const savedOrgId = localStorage.getItem('currentOrganizationId');
      let currentOrg = savedOrgId
        ? orgsData?.find(o => o.id === savedOrgId)
        : null;

      // If saved org not found (or not saved), default to the first one
      if (!currentOrg && orgsData && orgsData.length > 0) {
        currentOrg = orgsData[0];
      }

      if (currentOrg) {
        setCurrentOrganization(currentOrg);
        const member = memberData.find(m => m.organization_id === currentOrg.id);
        setMemberRole(member?.role || null);
        localStorage.setItem('currentOrganizationId', currentOrg.id);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [user, authLoading]);

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
      localStorage.setItem('currentOrganizationId', orgId);

      supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user!.id)
        .maybeSingle()
        .then(({ data }) => {
          setMemberRole(data?.role || null);
        });
    }
  };

  const refetchOrganizations = async () => {
    setLoading(true);
    await fetchOrganizations();
  };

  return (
    <OrganizationContext.Provider
      value={{
        organizations,
        currentOrganization,
        memberRole,
        loading,
        switchOrganization,
        refetchOrganizations
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
