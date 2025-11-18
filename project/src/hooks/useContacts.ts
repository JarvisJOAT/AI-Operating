import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useOrganization } from '../contexts/OrganizationContext';
import { useAuth } from '../contexts/AuthContext';

interface Contact {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  title: string | null;
  company_id: string | null;
  company_name: string | null;
  date_of_birth: string | null;
  notes: string | null;
  lead_status: string;
  lead_score: number;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export function useContacts() {
  const { currentOrganization } = useOrganization();
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentOrganization) {
      setContacts([]);
      setLoading(false);
      return;
    }

    fetchContacts();
  }, [currentOrganization]);

  const fetchContacts = async () => {
    if (!currentOrganization) {
      setContacts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Mock data filtered by organization_id (consistent with useProjects approach)
      // Only contacts belonging to the current organization are returned
      const mockContacts: Contact[] = [
        {
          id: 'contact-demo-1',
          organization_id: currentOrganization.id,
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          title: 'CTO',
          company_id: null,
          company_name: 'Tech Startup Inc.',
          date_of_birth: '1985-06-15',
          notes: 'Good lead, interested in our AI solutions',
          lead_status: 'qualified',
          lead_score: 85,
          tags: ['high-value', 'tech-savvy'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'contact-demo-2',
          organization_id: currentOrganization.id,
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'jane.smith@marketing.com',
          phone: '+1 (555) 987-6543',
          title: 'Marketing Director',
          company_id: null,
          company_name: 'Brand Agency LLC',
          date_of_birth: '1990-03-22',
          notes: 'Needs our marketing automation tools',
          lead_status: 'contacted',
          lead_score: 65,
          tags: ['marketing', 'automation'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      ];
      setContacts(mockContacts);
      setLoading(false);
    }, 500);
  };

  const createContact = async (contactData: {
    first_name: string;
    last_name?: string;
    email?: string;
    phone?: string;
    title?: string;
    company_name?: string;
    date_of_birth?: string;
    notes?: string;
  }) => {
    if (!currentOrganization) {
      throw new Error('No organization selected');
    }

    // Mock successful creation (consistent with useProjects approach)
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      organization_id: currentOrganization.id,
      first_name: contactData.first_name,
      last_name: contactData.last_name || null,
      email: contactData.email || null,
      phone: contactData.phone || null,
      title: contactData.title || null,
      company_id: null,
      company_name: contactData.company_name || null,
      date_of_birth: contactData.date_of_birth || null,
      notes: contactData.notes || null,
      lead_status: 'new',
      lead_score: 0,
      tags: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to local state for immediate UI feedback
    setContacts(prev => [newContact, ...prev]);
    return newContact;
  };

  const updateContact = async (
    contactId: string,
    contactData: Partial<{
      first_name: string;
      last_name: string | null;
      email: string | null;
      phone: string | null;
      title: string | null;
      company_name: string | null;
      date_of_birth: string | null;
      notes: string | null;
      lead_status: string;
      tags: string[] | null;
    }>
  ) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .update(contactData)
        .eq('id', contactId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  };

  return { contacts, loading, createContact, updateContact, refetch: fetchContacts };
}
