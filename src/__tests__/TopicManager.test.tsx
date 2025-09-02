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
  addDoc: (_collectionRef, data) => mockAddDoc(data),
  deleteDoc: (_docRef) => mockDeleteDoc(),
  doc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  onSnapshot: (query, callback) => {
    mockOnSnapshot(query, callback);
    // Return a mock unsubscribe function
    return () => {};
  },
}));

describe('TopicManager', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    // Setup a default authenticated user for all tests in this block
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'test-uid' } });
  });

  it('renders a list of topics from firestore', () => {
    // Arrange: Simulate onSnapshot returning two topics
    const mockTopics = [
      { id: '1', data: () => ({ title: 'React Hooks' }) },
      { id: '2', data: () => ({ title: 'Next.js Basics' }) },
    ];
    mockOnSnapshot.mockImplementation((query, callback) => {
      callback({ 
        docs: mockTopics, 
        forEach: (fn) => mockTopics.forEach(fn) 
      });
      return () => {};
    });

    // Act
    render(<TopicManager />);

    // Assert
    expect(screen.getByText('React Hooks')).toBeInTheDocument();
    expect(screen.getByText('Next.js Basics')).toBeInTheDocument();
  });

  it('allows a user to add a new topic', async () => {
    // Arrange
    render(<TopicManager />);
    const input = screen.getByPlaceholderText('Novo tópico de estudo');
    const addButton = screen.getByRole('button', { name: /adicionar/i });

    // Act
    fireEvent.change(input, { target: { value: 'New Topic' } });
    fireEvent.click(addButton);

    // Assert
    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalledWith({
        title: 'New Topic',
        timestamp: expect.any(Date),
      });
    });
  });

  it('allows a user to delete a topic', async () => {
    // Arrange: Simulate onSnapshot returning one topic
    const mockTopics = [
      { id: 'topic-to-delete', data: () => ({ title: 'Delete Me' }) },
    ];
    mockOnSnapshot.mockImplementation((query, callback) => {
      callback({ 
        docs: mockTopics, 
        forEach: (fn) => mockTopics.forEach(fn) 
      });
      return () => {};
    });

    render(<TopicManager />);
    const deleteButton = screen.getByRole('button', { name: /excluir/i });

    // Act
    fireEvent.click(deleteButton);

    // Assert
    await waitFor(() => {
      expect(mockDeleteDoc).toHaveBeenCalled();
    });
  });
});
