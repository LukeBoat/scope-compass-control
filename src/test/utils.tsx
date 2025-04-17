import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Custom render function that includes providers
export function renderWithProviders(ui: React.ReactElement, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => (
      <BrowserRouter>
        {children}
      </BrowserRouter>
    ),
    ...options,
  });
}

// Mock project data
export const mockProject = {
  id: 'test-project-1',
  name: 'Test Project',
  description: 'A test project for unit testing',
  status: 'active',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  clientId: 'test-client-1',
  teamMembers: [
    {
      id: 'test-member-1',
      name: 'Test Member',
      role: 'developer',
      email: 'test@example.com',
    },
  ],
  deliverables: [
    {
      id: 'test-deliverable-1',
      name: 'Test Deliverable',
      description: 'A test deliverable',
      status: 'in-progress',
      dueDate: '2024-06-30',
      feedback: [],
    },
  ],
};

// Mock client data
export const mockClient = {
  id: 'test-client-1',
  name: 'Test Client',
  email: 'client@example.com',
  company: 'Test Company',
  projects: ['test-project-1'],
};

// Mock feedback data
export const mockFeedback = {
  id: 'test-feedback-1',
  content: 'Test feedback content',
  author: {
    id: 'test-author-1',
    name: 'Test Author',
    role: 'client',
  },
  createdAt: new Date().toISOString(),
  status: 'info',
  tags: ['bug', 'ui'],
  resolved: false,
}; 