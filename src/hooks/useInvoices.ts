import { useState, useEffect } from 'react';
import { Invoice, InvoiceStatus } from '@/types';

// Mock data for development
const mockInvoices: Invoice[] = [
  {
    id: "1",
    projectId: "1",
    milestoneId: "m1",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    lineItems: [
      {
        id: "1",
        label: "Project Setup and Planning",
        amount: 2500,
        type: "deliverable",
        deliverableId: "d1",
        description: "Initial project setup, planning, and documentation",
        quantity: 1,
        unitPrice: 2500
      },
      {
        id: "2",
        label: "Design Phase",
        amount: 3500,
        type: "deliverable",
        deliverableId: "d2",
        description: "UI/UX design and mockups",
        quantity: 1,
        unitPrice: 3500
      }
    ],
    total: 6000,
    status: "Sent",
    notes: "Initial project phase invoice",
    sentAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "2",
    projectId: "1",
    milestoneId: "m2",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    lineItems: [
      {
        id: "3",
        label: "Core Features Development",
        amount: 5000,
        type: "deliverable",
        deliverableId: "d3",
        description: "Development of core application features",
        quantity: 1,
        unitPrice: 5000
      },
      {
        id: "4",
        label: "Additional Development Hours",
        amount: 1500,
        type: "hours",
        description: "Extra development hours for feature enhancements",
        quantity: 10,
        unitPrice: 150
      }
    ],
    total: 6500,
    status: "Draft",
    notes: "Development phase invoice"
  }
];

// This is a placeholder for the actual API/database implementation
const fetchInvoicesFromAPI = async (projectId: string): Promise<Invoice[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock data filtered by project ID
  return mockInvoices.filter(invoice => invoice.projectId === projectId);
};

export interface UseInvoicesResult {
  invoices: Invoice[];
  loading: boolean;
  error: Error | null;
  createInvoice: (invoice: Omit<Invoice, 'id' | 'createdAt'>) => Promise<void>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<void>;
  deleteInvoice: (id: string) => Promise<void>;
}

export function useInvoices(projectId: string): UseInvoicesResult {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setLoading(true);
        const data = await fetchInvoicesFromAPI(projectId);
        setInvoices(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching invoices:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch invoices'));
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [projectId]);

  const createInvoice = async (invoice: Omit<Invoice, 'id' | 'createdAt'>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newInvoice: Invoice = {
        ...invoice,
        id: `inv_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      
      setInvoices(prev => [...prev, newInvoice]);
    } catch (err) {
      throw new Error('Failed to create invoice');
    }
  };

  const updateInvoice = async (id: string, updates: Partial<Invoice>) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInvoices(prev => prev.map(inv => 
        inv.id === id ? { ...inv, ...updates } : inv
      ));
    } catch (err) {
      throw new Error('Failed to update invoice');
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setInvoices(prev => prev.filter(inv => inv.id !== id));
    } catch (err) {
      throw new Error('Failed to delete invoice');
    }
  };

  return { invoices, loading, error, createInvoice, updateInvoice, deleteInvoice };
} 