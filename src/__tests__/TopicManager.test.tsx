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

jest.mock('firebase/firestore');

const firestore = require('firebase/firestore');
const mockOnSnapshot = firestore.onSnapshot;
const mockGetCountFromServer = firestore.getCountFromServer;
const mockDeleteDoc = firestore.deleteDoc;

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

  it('shows pluralization correctly for 1 and multiple items', async () => {
    const mockTopics = [
      { id: 't1', data: () => ({ title: 'One' }) },
      { id: 't2', data: () => ({ title: 'Two' }) },
    ];
    mockOnSnapshot.mockImplementation((query: any, callback: any) => {
      const snapshot = { docs: mockTopics };
      // set different counts for each topic
      const firestore = require('firebase/firestore');
      firestore.getCountFromServer.mockResolvedValueOnce({ data: () => ({ count: 1 }) });
      firestore.getCountFromServer.mockResolvedValueOnce({ data: () => ({ count: 3 }) });
      setTimeout(() => callback(snapshot), 0);
      return () => { };
    });

    render(<TopicManager searchQuery="" />);

    await waitFor(() => expect(screen.getByText('One')).toBeInTheDocument());
    expect(screen.getByText('1 item cadastrado')).toBeInTheDocument();
    expect(screen.getByText('3 itens cadastrados')).toBeInTheDocument();
  });

  it('shows fallback message when no topics match searchQuery', async () => {
    const mockTopics = [
      { id: 't1', data: () => ({ title: 'Apple' }) },
    ];
    mockOnSnapshot.mockImplementation((query: any, callback: any) => {
      const snapshot = { docs: mockTopics };
      const firestore = require('firebase/firestore');
      firestore.getCountFromServer.mockResolvedValue({ data: () => ({ count: 1 }) });
      setTimeout(() => callback(snapshot), 0);
      return () => { };
    });

    render(<TopicManager searchQuery="zzz" />);

    await waitFor(() => expect(screen.getByText(/Nenhum tópico encontrado. Comece criando um!/i)).toBeInTheDocument());
  });

  it('does not call deleteDoc when confirm is false', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'u1' } });
    mockOnSnapshot.mockImplementation((q, cb) => {
      const snapshot = { docs: [{ id: 't1', data: () => ({ title: 'Keep' }) }] };
      const firestore = require('firebase/firestore');
      firestore.getCountFromServer.mockResolvedValue({ data: () => ({ count: 1 }) });
      setTimeout(() => cb(snapshot), 0);
      return () => { };
    });

    const origConfirm = window.confirm;
    window.confirm = jest.fn(() => false) as any;

    render(<TopicManager searchQuery="" />);
    await waitFor(() => expect(screen.getByText('Keep')).toBeInTheDocument());
    fireEvent.click(screen.getByText('X'));
    expect(mockDeleteDoc).not.toHaveBeenCalled();

    window.confirm = origConfirm;
  });
});
