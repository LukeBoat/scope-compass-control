import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FeedbackThread } from '../FeedbackThread';
import { useToast } from '@/hooks/use-toast';
import userEvent from '@testing-library/user-event';

// Mock the useToast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

// Mock the useClientMode hook
vi.mock('@/hooks/useClientMode', () => ({
  useClientMode: vi.fn(() => false),
}));

describe('FeedbackThread', () => {
  const mockFeedback = [
    {
      id: '1',
      content: 'Test feedback',
      author: {
        id: 'user1',
        name: 'Test User',
        role: 'client',
      },
      createdAt: new Date().toISOString(),
      status: 'info',
      resolved: false,
      tags: ['design'],
      role: 'client',
    },
  ];

  const mockOnAddFeedback = vi.fn();

  it('renders feedback items correctly', () => {
    render(
      <FeedbackThread
        feedback={mockFeedback}
        onAddFeedback={mockOnAddFeedback}
        title="Test Feedback"
        showReplyButton={true}
      />
    );

    expect(screen.getByText('Test feedback')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('client')).toBeInTheDocument();
  });

  it('shows reply form when reply button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <FeedbackThread
        feedback={mockFeedback}
        onAddFeedback={mockOnAddFeedback}
        title="Test Feedback"
        showReplyButton={true}
      />
    );

    const replyButton = screen.getByText('Reply');
    await user.click(replyButton);

    expect(screen.getByPlaceholderText('Type your reply...')).toBeInTheDocument();
  });

  it('calls onAddFeedback when reply is submitted', async () => {
    const user = userEvent.setup();
    render(
      <FeedbackThread
        feedback={mockFeedback}
        onAddFeedback={mockOnAddFeedback}
        title="Test Feedback"
        showReplyButton={true}
      />
    );

    const replyButton = screen.getByText('Reply');
    await user.click(replyButton);

    const replyInput = screen.getByPlaceholderText('Type your reply...');
    await user.type(replyInput, 'Test reply');

    const submitButton = screen.getByText('Submit Reply');
    await user.click(submitButton);

    expect(mockOnAddFeedback).toHaveBeenCalledWith('Test reply');
  });

  it('displays status badges correctly', () => {
    const feedbackWithStatus = [
      {
        ...mockFeedback[0],
        status: 'approved',
      },
    ];

    render(
      <FeedbackThread
        feedback={feedbackWithStatus}
        onAddFeedback={mockOnAddFeedback}
        title="Test Feedback"
        showReplyButton={true}
      />
    );

    expect(screen.getByText('Approved')).toBeInTheDocument();
  });
}); 