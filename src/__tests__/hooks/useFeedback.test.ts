import { renderHook, act } from '@testing-library/react-hooks';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useFeedback } from '@/hooks/useFeedback';
import { useAuth } from '@/hooks/useAuth';
import { useClientMode } from '@/hooks/useClientMode';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';

// Mock Firebase
vi.mock('@/lib/firebase', () => ({
  db: {
    collection: vi.fn(),
    doc: vi.fn(),
  }
}));

// Mock hooks
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/hooks/useClientMode', () => ({
  useClientMode: vi.fn()
}));

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  doc: vi.fn(),
  serverTimestamp: vi.fn(() => new Date().toISOString())
}));

describe('useFeedback', () => {
  const mockUser = {
    uid: 'test-user-id',
    displayName: 'Test User',
    email: 'test@example.com'
  };

  const mockDeliverableId = 'test-deliverable-id';
  const mockFeedbackContent = 'Test feedback content';

  beforeEach(() => {
    // Setup default mocks
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useClientMode as jest.Mock).mockReturnValue({ isClientMode: false });
    (collection as jest.Mock).mockReturnValue('mock-collection');
    (doc as jest.Mock).mockReturnValue('mock-doc');
    (addDoc as jest.Mock).mockResolvedValue({ id: 'test-feedback-id' });
    (updateDoc as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('addFeedback', () => {
    it('should add feedback successfully', async () => {
      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        await result.current.addFeedback(mockDeliverableId, mockFeedbackContent);
      });

      expect(addDoc).toHaveBeenCalledWith(
        'mock-collection',
        expect.objectContaining({
          content: mockFeedbackContent,
          author: mockUser.displayName,
          authorId: mockUser.uid,
          status: 'info',
          tags: [],
          resolved: false,
          role: 'admin'
        })
      );
    });

    it('should prevent non-clients from approving/requesting changes', async () => {
      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        try {
          await result.current.addFeedback(mockDeliverableId, mockFeedbackContent, 'approved');
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(addDoc).not.toHaveBeenCalled();
    });

    it('should allow clients to approve deliverables', async () => {
      (useClientMode as jest.Mock).mockReturnValue({ isClientMode: true });
      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        await result.current.addFeedback(mockDeliverableId, mockFeedbackContent, 'approved');
      });

      expect(addDoc).toHaveBeenCalled();
      expect(updateDoc).toHaveBeenCalledWith(
        'mock-doc',
        expect.objectContaining({
          status: 'Approved'
        })
      );
    });

    it('should handle errors when user is not authenticated', async () => {
      (useAuth as jest.Mock).mockReturnValue({ user: null });
      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        try {
          await result.current.addFeedback(mockDeliverableId, mockFeedbackContent);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(addDoc).not.toHaveBeenCalled();
    });
  });

  describe('updateFeedbackStatus', () => {
    const mockFeedbackId = 'test-feedback-id';

    it('should update feedback status successfully', async () => {
      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        await result.current.updateFeedbackStatus(mockDeliverableId, mockFeedbackId, 'approved');
      });

      expect(updateDoc).toHaveBeenCalledWith(
        'mock-doc',
        expect.objectContaining({
          status: 'approved',
          updatedBy: mockUser.displayName,
          updatedById: mockUser.uid
        })
      );
    });

    it('should prevent non-clients from updating status without override', async () => {
      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        try {
          await result.current.updateFeedbackStatus(mockDeliverableId, mockFeedbackId, 'approved');
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(updateDoc).not.toHaveBeenCalled();
    });

    it('should allow status updates with override flag', async () => {
      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        await result.current.updateFeedbackStatus(mockDeliverableId, mockFeedbackId, 'approved', true);
      });

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('resolveFeedback', () => {
    const mockFeedbackId = 'test-feedback-id';

    it('should resolve feedback successfully as admin', async () => {
      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        await result.current.resolveFeedback(mockDeliverableId, mockFeedbackId);
      });

      expect(updateDoc).toHaveBeenCalledWith(
        'mock-doc',
        expect.objectContaining({
          resolved: true,
          resolvedBy: mockUser.displayName,
          resolvedById: mockUser.uid
        })
      );
    });

    it('should prevent clients from resolving feedback', async () => {
      (useClientMode as jest.Mock).mockReturnValue({ isClientMode: true });
      const { result } = renderHook(() => useFeedback());

      await act(async () => {
        try {
          await result.current.resolveFeedback(mockDeliverableId, mockFeedbackId);
        } catch (error) {
          expect(error).toBeDefined();
        }
      });

      expect(updateDoc).not.toHaveBeenCalled();
    });
  });
}); 