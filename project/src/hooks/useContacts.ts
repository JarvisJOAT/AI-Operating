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
      // Organization-specific mock data - each organization sees only their own contacts
      // This ensures complete multi-tenant isolation
      const orgSpecificContacts: Contact[] = [];

      // Sample contacts specific to each organization
      if (currentOrganization.id === 'gas-company-id') { // GAS Company
        orgSpecificContacts.push(
          {
            id: `contact-gas-1-${currentOrganization.id}`,
            organization_id: currentOrganization.id,
            first_name: 'John',
            last_name: 'Doe',
            email: 'john.doe@gas-client.com',
            phone: '+1 (555) 123-4567',
            title: 'CTO',
            company_id: null,
            company_name: 'Tech Startup Inc.',
            date_of_birth: '1985-06-15',
            notes: 'GAS company lead - interested in our AI energy optimization solutions',
            lead_status: 'qualified',
            lead_score: 85,
            tags: ['gas-tech', 'energy-efficiency', 'high-value'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: `contact-gas-2-${currentOrganization.id}`,
            organization_id: currentOrganization.id,
            first_name: 'Sarah',
            last_name: 'Johnson',
            email: 'sarah.johnson@gas-energy.com',
            phone: '+1 (555) 234-5678',
            title: 'Energy Manager',
            company_id: null,
            company_name: 'Green Energy Corp',
            date_of_birth: '1988-09-12',
            notes: 'GAS client interested in natural gas monitoring systems',
            lead_status: 'contacted',
            lead_score: 72,
            tags: ['gas-monitoring', 'energy-management'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        );
      } else if (currentOrganization.id === 'test-company-id') { // Test Company
        orgSpecificContacts.push(
          {
            id: `contact-test-1-${currentOrganization.id}`,
            organization_id: currentOrganization.id,
            first_name: 'Mike',
            last_name: 'Wilson',
            email: 'mike.wilson@test-marketing.com',
            phone: '+1 (555) 345-6789',
            title: 'Marketing Director',
            company_id: null,
            company_name: 'Brand Agency LLC',
            date_of_birth: '1982-11-08',
            notes: 'Test company contact - evaluating marketing automation tools',
            lead_status: 'new',
            lead_score: 45,
            tags: ['marketing-automation', 'brand-management'],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        );
      } else {
        // Default organization-specific contacts based on org ID
        const hash = currentOrganization.id.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const contactVariety = hash % 3; // Different contact sets based on org ID

        if (contactVariety === 0) {
          // Tech-focused contacts
          orgSpecificContacts.push(
            {
              id: `contact-tech-1-${currentOrganization.id}`,
              organization_id: currentOrganization.id,
              first_name: 'Alex',
              last_name: 'Wright',
              email: 'alex.wright@techcorp.com',
              phone: `+1 (${555 + (hash % 10)} 123-4567`,
              title: 'VP Engineering',
              company_id: null,
              company_name: 'Tech Solutions Inc.',
              date_of_birth: '1987-03-20',
              notes: 'Interested in technical solutions and AI integration',
              lead_status: 'qualified',
              lead_score: 80 + (hash % 20),
              tags: ['technology', 'ai-integration'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          );
        } else if (contactVariety === 1) {
          // Sales-focused contacts
          orgSpecificContacts.push(
            {
              id: `contact-sales-1-${currentOrganization.id}`,
              organization_id: currentOrganization.id,
              first_name: 'Emma',
              last_name: 'Davis',
              email: 'emma.davis@salespro.com',
              phone: `+1 (${555 + (hash % 10)} 234-5678`,
              title: 'Sales Manager',
              company_id: null,
              company_name: 'Sales Professionals Ltd.',
              date_of_birth: '1991-07-14',
              notes: 'Looking for sales automation and CRM enhancements',
              lead_status: 'contacted',
              lead_score: 60 + (hash % 30),
              tags: ['sales-automation', 'crm-enhancement'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          );
        } else {
          // General business contacts
          orgSpecificContacts.push(
            {
              id: `contact-biz-1-${currentOrganization.id}`,
              organization_id: currentOrganization.id,
              first_name: 'Robert',
              last_name: 'Brown',
              email: 'robert.brown@business.com',
              phone: `+1 (${555 + (hash % 10)} 345-6789`,
              title: 'Operations Director',
              company_id: null,
              company_name: 'Business Solutions Group',
              date_of_birth: '1985-01-30',
              notes: 'General business consulting and operational improvements',
              lead_status: hash % 2 === 0 ? 'qualified' : 'new',
              lead_score: hash % 100,
              tags: ['business-consulting', 'operations'],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          );
        }
      }

      setContacts(orgSpecificContacts);
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
