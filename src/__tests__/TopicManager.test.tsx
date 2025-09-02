// Mock do writeBatch precisa ser definido antes de qualquer import ou jest.mock
// ...existing code...
// ...existing code...
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TopicManager from '@/components/TopicManager';
import { useAuth } from '@/context/AuthContext';

// Mocking Firebase and Auth
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/firebase/config'); // Use the mock config

const mockAddDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockOnSnapshot = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: (_collectionRef: any, data: any) => mockAddDoc(data),
  deleteDoc: (_docRef: any) => mockDeleteDoc(),
  doc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  onSnapshot: (query: any, callback: any) => {
    mockOnSnapshot(query, callback);
    return () => { };
  },
  writeBatch: jest.fn(() => ({ update: jest.fn(), commit: jest.fn() })),
  getCountFromServer: jest.fn(() => Promise.resolve({ data: () => ({ count: 0 }) })),
}));

// Mocking dnd-kit
jest.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: any }) => <div>{children}</div>,
  closestCenter: jest.fn(),
  KeyboardSensor: jest.fn(),
  PointerSensor: jest.fn(),
  useSensor: jest.fn(),
  useSensors: jest.fn(),
}));

jest.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: any }) => <div>{children}</div>,
  sortableKeyboardCoordinates: jest.fn(),
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: jest.fn(), transform: null, transition: null }),
  arrayMove: (items: any, oldIndex: any, newIndex: any) => {
    const newItems = [...items];
    const [removed] = newItems.splice(oldIndex, 1);
    newItems.splice(newIndex, 0, removed);
    return newItems;
  },
  rectSortingStrategy: jest.fn(),
}));

describe('TopicManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'test-uid' } });
  });

  it('renders a list of topics from firestore', async () => {
    const mockTopics = [
      { id: '1', data: () => ({ title: 'React Hooks', order: 0 }) },
      { id: '2', data: () => ({ title: 'Next.js Basics', order: 1 }) },
    ];
    mockOnSnapshot.mockImplementation((query: any, callback: any) => {
      callback({
        docs: mockTopics,
        forEach: (fn: any) => mockTopics.forEach(fn)
      });
      return () => { };
    });

    render(<TopicManager searchQuery="" />);

    // wait for topics to be rendered
    const topic1 = await screen.findByText('React Hooks');
    const topic2 = await screen.findByText('Next.js Basics');
    expect(topic1).toBeInTheDocument();
    expect(topic2).toBeInTheDocument();
  });

  // Note: TopicManager currently doesn't expose an inline add form.
  // Tests for adding a topic are omitted until the UI exists.

  it('allows a user to delete a topic', async () => {
    const mockTopics = [
      { id: 'topic-to-delete', data: () => ({ title: 'Delete Me', order: 0 }) },
    ];
    mockOnSnapshot.mockImplementation((query: any, callback: any) => {
      callback({
        docs: mockTopics,
        forEach: (fn: any) => mockTopics.forEach(fn)
      });
      return () => { };
    });

    render(<TopicManager searchQuery="" />);
    const deleteButton = await screen.findByRole('button', { name: /x/i });

    window.confirm = jest.fn(() => true); // Mock window.confirm

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });
});
