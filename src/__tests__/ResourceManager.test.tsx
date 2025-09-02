import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ResourceManager from '@/components/ResourceManager';
import { useAuth } from '@/context/AuthContext';

// Mocking Firebase and Auth
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));
jest.mock('@/firebase/config'); // Use the mock config


const mockAddDoc = jest.fn();
const mockDeleteDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockOnSnapshot = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: (_ref, data) => mockAddDoc(data),
  deleteDoc: () => mockDeleteDoc(),
  updateDoc: (_ref, data) => mockUpdateDoc(data),
  doc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  onSnapshot: (query, callback) => {
    mockOnSnapshot(query, callback);
    return () => {}; // Return a mock unsubscribe function
  },
}));

describe('ResourceManager', () => {
  const topicId = 'test-topic-id';

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: { uid: 'test-uid' } });
  });

  it('renders a list of resources', () => {
    // Arrange
    const mockResources = [
      { id: '1', data: () => ({ content: 'https://react.dev', status: 'Pendente' }) },
      { id: '2', data: () => ({ content: 'My first note', status: 'Concluído' }) },
    ];
    mockOnSnapshot.mockImplementation((query, callback) => {
      callback({ 
        docs: mockResources, 
        forEach: (fn) => mockResources.forEach(fn) 
      });
      return () => {};
    });

    // Act
    render(<ResourceManager topicId={topicId} />);

    // Assert
    expect(screen.getByText('https://react.dev')).toBeInTheDocument();
    expect(screen.getByText('My first note')).toBeInTheDocument();
  });

  it('allows a user to add a new resource', async () => {
    // Arrange
    render(<ResourceManager topicId={topicId} />);
    const input = screen.getByPlaceholderText('https://...');
    const addButton = screen.getByRole('button', { name: /adicionar/i });

    // Act
    fireEvent.change(input, { target: { value: 'https://nextjs.org' } });
    fireEvent.click(addButton);

    // Assert
    await waitFor(() => {
      expect(mockAddDoc).toHaveBeenCalledWith({
        type: 'link',
        content: 'https://nextjs.org',
        status: 'Pendente',
        timestamp: expect.any(Date),
      });
    });
  });

  it('allows a user to toggle resource status', async () => {
    // Arrange
    const mockResources = [
      { id: '1', data: () => ({ content: 'Toggle me', status: 'Pendente' }) },
    ];
    mockOnSnapshot.mockImplementation((query, callback) => {
      callback({ 
        docs: mockResources, 
        forEach: (fn) => mockResources.forEach(fn) 
      });
      return () => {};
    });

    render(<ResourceManager topicId={topicId} />);
    const checkbox = screen.getByRole('checkbox');

    // Act
    fireEvent.click(checkbox);

    // Assert
    await waitFor(() => {
      expect(mockUpdateDoc).toHaveBeenCalledWith({ status: 'Concluído' });
    });
  });
});
